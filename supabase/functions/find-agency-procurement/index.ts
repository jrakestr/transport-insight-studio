import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchPhaseResult {
  phase: number;
  phaseName: string;
  completed: boolean;
  opportunitiesFound: number;
  confidence: number;
  sources: string[];
  error?: string;
}

interface ProcurementOpportunity {
  title: string;
  description?: string;
  opportunity_type: string;
  source_url: string;
  source_type: string;
  deadline?: string;
  estimated_value?: number;
  contact_info?: any;
  extracted_data?: any;
  confidence_score: number;
}

const CONFIDENCE_THRESHOLD = 0.75;

const KNOWN_PROCUREMENT_PORTALS = [
  'bidnetdirect.com',
  'publicpurchase.com',
  'bonfire.com',
  'ionwave.net',
  'procurenow.com',
  'negometrix.com',
  'periscope',
  'bidexpress.com',
  'govwin.com',
  'jaggaer.com',
  'planetbids.com',
];

// ===== ADA PARATRANSIT ECOSYSTEM KEYWORDS =====
const ADA_PARATRANSIT_KEYWORDS = {
  // Service Delivery
  service_delivery: [
    'paratransit', 'ada paratransit', 'demand response', 'dial-a-ride',
    'turnkey operations', 'dedicated fleet', 'contracted operations',
    'taxi supplemental', 'tnc', 'transportation network company',
    'volunteer driver', 'microtransit', 'door-to-door',
    'curb-to-curb', 'non-emergency medical transportation', 'nemt',
  ],
  
  // Technology
  technology: [
    'scheduling software', 'dispatch software', 'cad/avl', 'cad avl',
    'computer aided dispatch', 'automatic vehicle location',
    'ivr', 'interactive voice response', 'call center platform',
    'mobile app', 'rider app', 'driver app', 'mdt', 'mobile data terminal',
    'trip scheduling', 'routing software', 'demand response software',
    'paratransit software', 'trapeze', 'ecolane', 'routematch', 'tripmaster',
    'stratagen', 'reserve-a-ride', 'where\'s my ride', 'real-time tracking',
  ],
  
  // Customer Service
  customer_service: [
    'call center', 'reservations', 'customer service', 'complaints',
    'where\'s my ride', 'trip status', 'reservation system',
    'customer complaints', 'on-time performance',
  ],
  
  // Eligibility
  eligibility: [
    'eligibility determination', 'ada eligibility', 'eligibility assessment',
    'in-person assessment', 'functional assessment', 'conditional eligibility',
    'eligibility appeals', 'recertification', 'eligibility application',
    'eligibility contractor', 'eligibility processing',
  ],
  
  // Travel Training
  travel_training: [
    'travel training', 'mobility training', 'travel instruction',
    'fixed route training', 'bus training', 'transit training',
    'travel trainer', 'mobility management',
  ],
  
  // Brokerage/Coordination
  brokerage: [
    'brokerage', 'trip brokerage', 'nemt brokerage', 'broker',
    'multi-provider coordination', 'mobility management',
    'coordinated transportation', 'trip coordination',
    'medicaid transportation', 'medical transportation',
  ],
};

// Plan document types to search for
const PLAN_DOCUMENT_TYPES = [
  'transit development plan', 'tdp',
  'ada paratransit plan', 'ada plan',
  'coordinated public transit human services transportation plan',
  'coordinated plan', 'coordinated transportation plan',
  'short range transit plan', 'srtp',
  'long range transportation plan', 'lrtp',
  'comprehensive operational analysis', 'coa',
  'fare study', 'paratransit study',
];

// Board meeting keywords
const BOARD_MEETING_KEYWORDS = [
  'board meeting', 'board minutes', 'board agenda',
  'contract approval', 'contract award', 'contract extension',
  'rfp authorization', 'vendor selection', 'procurement',
  'board action', 'resolution', 'motion to approve',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agencyId, mode = 'single' } = await req.json();
    
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY_1') || Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FIRECRAWL_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('Missing required API keys');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get agencies to process
    let agencies: any[] = [];
    
    if (mode === 'single' && agencyId) {
      const { data, error } = await supabase
        .from('transit_agencies')
        .select('id, agency_name, url, city, state, doing_business_as, uza_name, total_voms')
        .eq('id', agencyId)
        .single();
      
      if (error || !data) {
        throw new Error('Agency not found');
      }
      agencies = [data];
    } else if (mode === 'batch') {
      const { data, error } = await supabase
        .from('transit_agencies')
        .select('id, agency_name, url, city, state, doing_business_as, uza_name, total_voms')
        .not('url', 'is', null)
        .order('total_voms', { ascending: false, nullsFirst: false })
        .limit(3);
      
      if (error) throw error;
      agencies = data || [];
    }

    const results: any[] = [];

    for (const agency of agencies) {
      console.log(`\n========== Processing: ${agency.agency_name} ==========`);
      
      // Create search run record
      const { data: searchRun, error: runError } = await supabase
        .from('procurement_search_runs')
        .insert({
          agency_id: agency.id,
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (runError) {
        console.error('Failed to create search run:', runError);
        continue;
      }

      const phaseResults: SearchPhaseResult[] = [];
      const opportunities: ProcurementOpportunity[] = [];
      let overallConfidence = 0;

      try {
        // ===== PHASE 1: Direct Agency Website Scrape =====
        const phase1Result = await executePhase1(agency, FIRECRAWL_API_KEY, LOVABLE_API_KEY, supabase);
        phaseResults.push(phase1Result);
        opportunities.push(...(phase1Result as any).opportunities || []);
        overallConfidence = Math.max(overallConfidence, phase1Result.confidence);
        console.log(`Phase 1 complete: ${phase1Result.opportunitiesFound} opportunities, confidence: ${phase1Result.confidence}`);

        // ===== PHASE 2: Board Minutes & Plan Documents =====
        const phase2Result = await executePhase2BoardAndPlans(agency, FIRECRAWL_API_KEY, LOVABLE_API_KEY, supabase);
        phaseResults.push(phase2Result);
        console.log(`Phase 2 (Board/Plans): ${(phase2Result as any).boardActionsFound || 0} board actions, ${(phase2Result as any).plansFound || 0} plans`);

        // ===== PHASE 3: Procurement Portal Search (if needed) =====
        if (overallConfidence < CONFIDENCE_THRESHOLD && EXA_API_KEY) {
          const phase3Result = await executePhase3Portals(agency, EXA_API_KEY, FIRECRAWL_API_KEY, LOVABLE_API_KEY);
          phaseResults.push(phase3Result);
          opportunities.push(...(phase3Result as any).opportunities || []);
          overallConfidence = Math.max(overallConfidence, phase3Result.confidence);
          console.log(`Phase 3 complete: ${phase3Result.opportunitiesFound} opportunities, confidence: ${phase3Result.confidence}`);
        }

        // ===== PHASE 4: Open Web Discovery (if still need more) =====
        if (overallConfidence < CONFIDENCE_THRESHOLD && EXA_API_KEY) {
          const phase4Result = await executePhase4OpenWeb(agency, EXA_API_KEY, LOVABLE_API_KEY, supabase);
          phaseResults.push(phase4Result);
          opportunities.push(...(phase4Result as any).opportunities || []);
          overallConfidence = Math.max(overallConfidence, phase4Result.confidence);
          console.log(`Phase 4 complete: ${phase4Result.opportunitiesFound} opportunities, confidence: ${phase4Result.confidence}`);
        }

        // Store verified opportunities
        if (opportunities.length > 0) {
          const opportunitiesToInsert = opportunities.map(opp => ({
            ...opp,
            agency_id: agency.id,
            search_run_id: searchRun.id,
          }));

          const { error: insertError } = await supabase
            .from('procurement_opportunities')
            .insert(opportunitiesToInsert);

          if (insertError) {
            console.error('Error inserting opportunities:', insertError);
          }
        }

        // Update search run as completed
        await supabase
          .from('procurement_search_runs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            phases_completed: phaseResults,
            confidence_score: overallConfidence,
            opportunities_found: opportunities.length,
          })
          .eq('id', searchRun.id);

        // Check for planning mode indicators
        const planningModeCheck = await checkPlanningMode(agency.id, supabase);

        // Update or create agency procurement status
        await supabase
          .from('agency_procurement_status')
          .upsert({
            agency_id: agency.id,
            last_search_at: new Date().toISOString(),
            last_search_run_id: searchRun.id,
            overall_confidence: overallConfidence,
            total_opportunities_found: opportunities.length,
            has_active_rfps: opportunities.some(o => 
              o.opportunity_type === 'rfp' && 
              (!o.deadline || new Date(o.deadline) > new Date())
            ),
            is_planning_mode: planningModeCheck.isPlanningMode,
            planning_mode_reason: planningModeCheck.reason,
            technology_upgrade_planned: planningModeCheck.techUpgrade,
            service_model_change_planned: planningModeCheck.serviceChange,
            next_search_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'agency_id' });

        results.push({
          agencyId: agency.id,
          agencyName: agency.agency_name,
          searchRunId: searchRun.id,
          opportunitiesFound: opportunities.length,
          confidence: overallConfidence,
          phasesCompleted: phaseResults.length,
          planningMode: planningModeCheck.isPlanningMode,
        });

      } catch (agencyError) {
        console.error(`Error processing ${agency.agency_name}:`, agencyError);
        
        await supabase
          .from('procurement_search_runs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: agencyError instanceof Error ? agencyError.message : 'Unknown error',
            phases_completed: phaseResults,
          })
          .eq('id', searchRun.id);

        results.push({
          agencyId: agency.id,
          agencyName: agency.agency_name,
          error: agencyError instanceof Error ? agencyError.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Procurement agent error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Build search terms from ADA paratransit keywords
function buildAdaParatransitSearchTerms(): string {
  const allKeywords = Object.values(ADA_PARATRANSIT_KEYWORDS).flat();
  // Get the most important keywords for URL filtering
  return 'paratransit ada eligibility scheduling dispatch cad avl software rfp bid contract procurement';
}

// ===== PHASE 1: Direct Agency Website Scrape =====
async function executePhase1(
  agency: any, 
  firecrawlKey: string, 
  lovableKey: string,
  supabaseClient: any
): Promise<SearchPhaseResult & { opportunities: ProcurementOpportunity[] }> {
  const opportunities: ProcurementOpportunity[] = [];
  const sources: string[] = [];
  
  if (!agency.url) {
    return {
      phase: 1,
      phaseName: 'Direct Agency Scrape',
      completed: true,
      opportunitiesFound: 0,
      confidence: 0,
      sources: [],
      opportunities: [],
    };
  }

  try {
    console.log(`Phase 1: Mapping ${agency.url}`);
    
    // Map the agency website with ADA paratransit focused search
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: agency.url,
        search: buildAdaParatransitSearchTerms(),
        limit: 150,
        includeSubdomains: false,
      }),
    });

    const mapData = await mapResponse.json();
    
    if (!mapResponse.ok) {
      console.error('Firecrawl map error:', mapData);
    }
    
    const allUrls: string[] = mapData.links || mapData.data?.links || [agency.url];
    
    // ADA Paratransit focused URL filters
    const procurementKeywords = [
      // Procurement
      'procurement', 'rfp', 'rfq', 'bid', 'solicitation', 
      'contract', 'vendor', 'purchasing', 'opportunity', 'doing-business',
      // ADA/Paratransit specific
      'paratransit', 'ada', 'demand-response', 'dial-a-ride', 'accessible',
      'eligibility', 'mobility', 'special-transportation',
      // Board/Governance
      'board', 'meeting', 'minutes', 'agenda',
    ];
    
    const procurementUrls = allUrls.filter((url: string) => 
      procurementKeywords.some(kw => url.toLowerCase().includes(kw))
    ).slice(0, 8);

    // Also check common procurement and paratransit paths
    const commonPaths = [
      '/procurement', '/rfp', '/bids', '/solicitations', '/doing-business', '/vendors',
      '/paratransit', '/ada', '/accessibility', '/demand-response',
      '/board', '/meetings', '/agendas', '/minutes',
    ];
    
    for (const path of commonPaths) {
      try {
        const testUrl = new URL(path, agency.url).href;
        if (!procurementUrls.includes(testUrl) && !allUrls.includes(testUrl)) {
          procurementUrls.push(testUrl);
        }
      } catch (e) {}
    }

    console.log(`Found ${procurementUrls.length} relevant pages`);

    // Scrape procurement pages
    for (const url of procurementUrls.slice(0, 6)) {
      try {
        console.log(`Scraping: ${url}`);
        
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown', 'links'],
            onlyMainContent: true,
          }),
        });

        const scrapeData = await scrapeResponse.json();
        if (!scrapeResponse.ok) {
          console.error(`Scrape failed for ${url}:`, scrapeData);
          continue;
        }
        if (!scrapeData.success) continue;

        const content = scrapeData.data?.markdown;
        if (!content || content.length < 100) continue;

        sources.push(url);

        // Use AI to extract ADA paratransit procurement opportunities
        const extracted = await extractAdaParatransitProcurement(content, url, lovableKey);
        if (extracted && extracted.opportunities?.length > 0) {
          for (const opp of extracted.opportunities) {
            if (opp.title) {
              opportunities.push({
                title: opp.title,
                description: opp.description,
                opportunity_type: opp.opportunity_type || 'unknown',
                deadline: opp.deadline,
                estimated_value: opp.estimated_value,
                contact_info: opp.contact_info,
                source_url: url,
                source_type: 'agency_website',
                confidence_score: 0.9,
                extracted_data: {
                  service_category: opp.service_category,
                  service_component: opp.service_component,
                },
              });
            }
          }
          
          // Extract and store vendor information
          if (extracted.vendors?.length > 0) {
            await storeVendorInfo(agency.id, extracted.vendors, url, supabaseClient);
          }
        }

        // Check for document links and procurement portals
        const links = scrapeData.data?.links || [];
        const documentLinks: string[] = [];
        
        for (const link of links) {
          if (link.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
            documentLinks.push(link);
          }
          
          if (KNOWN_PROCUREMENT_PORTALS.some(portal => link.includes(portal))) {
            opportunities.push({
              title: `External Procurement Portal`,
              description: `Agency uses external procurement portal`,
              opportunity_type: 'portal',
              source_url: link,
              source_type: 'procurement_portal',
              confidence_score: 0.95,
              extracted_data: { discovered_from: url },
            });
          }
        }
        
        // Store discovered documents for later RAG processing
        if (documentLinks.length > 0 && supabaseClient) {
          console.log(`Found ${documentLinks.length} documents on ${url}`);
          const docsToInsert = documentLinks.slice(0, 10).map(docUrl => ({
            agency_id: agency.id,
            url: docUrl,
            title: docUrl.split('/').pop() || 'Unknown Document',
            content_type: docUrl.match(/\.pdf$/i) ? 'application/pdf' : 'application/octet-stream',
            parse_status: 'pending',
          }));
          
          await supabaseClient
            .from('procurement_documents')
            .upsert(docsToInsert, { onConflict: 'url', ignoreDuplicates: true });
        }
      } catch (scrapeError) {
        console.error(`Error scraping ${url}:`, scrapeError);
      }
    }

    const confidence = opportunities.length > 0 ? 
      Math.min(0.9, 0.5 + (opportunities.length * 0.1)) : 0.2;

    return {
      phase: 1,
      phaseName: 'Direct Agency Scrape',
      completed: true,
      opportunitiesFound: opportunities.length,
      confidence,
      sources,
      opportunities,
    };

  } catch (error) {
    console.error('Phase 1 error:', error);
    return {
      phase: 1,
      phaseName: 'Direct Agency Scrape',
      completed: false,
      opportunitiesFound: 0,
      confidence: 0,
      sources: [],
      opportunities: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ===== PHASE 2: Board Minutes & Plan Documents =====
async function executePhase2BoardAndPlans(
  agency: any,
  firecrawlKey: string,
  lovableKey: string,
  supabaseClient: any
): Promise<SearchPhaseResult & { boardActionsFound: number; plansFound: number }> {
  const sources: string[] = [];
  let boardActionsFound = 0;
  let plansFound = 0;

  if (!agency.url) {
    return {
      phase: 2,
      phaseName: 'Board Minutes & Plans',
      completed: true,
      opportunitiesFound: 0,
      confidence: 0,
      sources: [],
      boardActionsFound: 0,
      plansFound: 0,
    };
  }

  try {
    console.log(`Phase 2: Searching for board minutes and plans for ${agency.agency_name}`);
    
    // Map for board/meeting pages
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: agency.url,
        search: 'board meeting minutes agenda contract approval transit development plan ada',
        limit: 50,
        includeSubdomains: false,
      }),
    });

    const mapData = await mapResponse.json();
    const allUrls: string[] = mapData.links || mapData.data?.links || [];
    
    // Filter for board/meeting pages
    const boardUrls = allUrls.filter((url: string) => {
      const lower = url.toLowerCase();
      return lower.includes('board') || lower.includes('meeting') || 
             lower.includes('minute') || lower.includes('agenda');
    }).slice(0, 4);
    
    // Filter for plan documents
    const planUrls = allUrls.filter((url: string) => {
      const lower = url.toLowerCase();
      return lower.includes('plan') || lower.includes('tdp') || 
             lower.includes('study') || lower.includes('report');
    }).slice(0, 4);

    // Process board meeting pages
    for (const url of boardUrls) {
      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown', 'links'],
            onlyMainContent: true,
          }),
        });

        const scrapeData = await scrapeResponse.json();
        if (!scrapeResponse.ok || !scrapeData.success) continue;

        const content = scrapeData.data?.markdown;
        if (!content || content.length < 100) continue;

        sources.push(url);

        // Extract board actions
        const boardActions = await extractBoardActions(content, url, agency.agency_name, lovableKey);
        if (boardActions && boardActions.length > 0) {
          for (const action of boardActions) {
            await supabaseClient
              .from('agency_board_actions')
              .insert({
                agency_id: agency.id,
                action_type: action.action_type,
                action_date: action.action_date,
                title: action.title,
                description: action.description,
                vendor_name: action.vendor_name,
                contract_value: action.contract_value,
                source_url: url,
                meeting_date: action.meeting_date,
                confidence_score: 0.75,
                extracted_data: action,
              });
            boardActionsFound++;
            
            // If we found a vendor from board action, store it
            if (action.vendor_name) {
              await storeVendorInfo(agency.id, [{
                vendor_name: action.vendor_name,
                service_category: action.service_category || 'service_delivery',
                service_component: action.service_component || 'unknown',
                contract_value: action.contract_value,
              }], url, supabaseClient);
            }
          }
        }

        // Check for PDF links to board packets/minutes
        const pdfLinks = (scrapeData.data?.links || []).filter((l: string) => 
          l.match(/\.(pdf)$/i) && (l.toLowerCase().includes('minute') || l.toLowerCase().includes('agenda'))
        );
        
        if (pdfLinks.length > 0) {
          const docsToInsert = pdfLinks.slice(0, 5).map((docUrl: string) => ({
            agency_id: agency.id,
            url: docUrl,
            title: 'Board Minutes/Agenda',
            content_type: 'application/pdf',
            parse_status: 'pending',
          }));
          
          await supabaseClient
            .from('procurement_documents')
            .upsert(docsToInsert, { onConflict: 'url', ignoreDuplicates: true });
        }
      } catch (e) {
        console.error(`Error processing board URL ${url}:`, e);
      }
    }

    // Process plan document pages
    for (const url of planUrls) {
      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown', 'links'],
            onlyMainContent: true,
          }),
        });

        const scrapeData = await scrapeResponse.json();
        if (!scrapeResponse.ok || !scrapeData.success) continue;

        const content = scrapeData.data?.markdown;
        if (!content || content.length < 100) continue;

        sources.push(url);

        // Check if this is a plan document listing page
        const planDocs = await identifyPlanDocuments(content, url, agency.agency_name, lovableKey);
        if (planDocs && planDocs.length > 0) {
          for (const plan of planDocs) {
            await supabaseClient
              .from('agency_plan_documents')
              .upsert({
                agency_id: agency.id,
                document_type: plan.document_type,
                title: plan.title,
                document_url: plan.url || url,
                published_date: plan.published_date,
                parse_status: 'pending',
                has_technology_upgrade_plans: plan.has_technology_upgrade,
                has_service_model_changes: plan.has_service_changes,
                planning_mode_flags: plan.planning_indicators,
              }, { onConflict: 'document_url', ignoreDuplicates: true });
            plansFound++;
          }
        }

        // Check for PDF links to plans
        const pdfLinks = (scrapeData.data?.links || []).filter((l: string) => {
          const lower = l.toLowerCase();
          return l.match(/\.(pdf)$/i) && 
            (lower.includes('plan') || lower.includes('tdp') || lower.includes('ada') || lower.includes('study'));
        });
        
        if (pdfLinks.length > 0) {
          for (const pdfUrl of pdfLinks.slice(0, 3)) {
            // Determine document type from URL
            const lower = pdfUrl.toLowerCase();
            let docType = 'other';
            if (lower.includes('tdp') || lower.includes('transit-development')) docType = 'tdp';
            else if (lower.includes('ada')) docType = 'ada_plan';
            else if (lower.includes('coordinated')) docType = 'coordinated_plan';
            else if (lower.includes('short-range') || lower.includes('srtp')) docType = 'short_range_plan';
            else if (lower.includes('long-range') || lower.includes('lrtp')) docType = 'long_range_plan';
            
            await supabaseClient
              .from('agency_plan_documents')
              .upsert({
                agency_id: agency.id,
                document_type: docType,
                title: pdfUrl.split('/').pop()?.replace('.pdf', '') || 'Plan Document',
                document_url: pdfUrl,
                parse_status: 'pending',
              }, { onConflict: 'document_url', ignoreDuplicates: true });
            plansFound++;
          }
        }
      } catch (e) {
        console.error(`Error processing plan URL ${url}:`, e);
      }
    }

    return {
      phase: 2,
      phaseName: 'Board Minutes & Plans',
      completed: true,
      opportunitiesFound: 0,
      confidence: boardActionsFound > 0 || plansFound > 0 ? 0.6 : 0.2,
      sources,
      boardActionsFound,
      plansFound,
    };

  } catch (error) {
    console.error('Phase 2 error:', error);
    return {
      phase: 2,
      phaseName: 'Board Minutes & Plans',
      completed: false,
      opportunitiesFound: 0,
      confidence: 0,
      sources: [],
      boardActionsFound: 0,
      plansFound: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ===== PHASE 3: Procurement Portal Search =====
async function executePhase3Portals(
  agency: any,
  exaKey: string,
  firecrawlKey: string,
  lovableKey: string
): Promise<SearchPhaseResult & { opportunities: ProcurementOpportunity[] }> {
  const opportunities: ProcurementOpportunity[] = [];
  const sources: string[] = [];

  try {
    console.log(`Phase 3: Searching procurement portals for ${agency.agency_name}`);

    const searchTerms = [
      agency.agency_name,
      agency.doing_business_as,
      `${agency.city} ${agency.state} transit`,
    ].filter(Boolean).slice(0, 2);

    // ADA paratransit specific search terms
    const adaSearchTerms = [
      'paratransit', 'ADA', 'demand response', 'eligibility', 'scheduling software',
    ];

    for (const term of searchTerms) {
      // Search on known procurement portals with ADA focus
      const portalQuery = `site:bidnetdirect.com OR site:publicpurchase.com OR site:bonfire.com OR site:planetbids.com "${term}" (paratransit OR "demand response" OR ADA OR eligibility OR scheduling)`;
      
      const exaResponse = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': exaKey,
        },
        body: JSON.stringify({
          query: portalQuery,
          numResults: 10,
          type: 'keyword',
          contents: {
            text: { maxCharacters: 3000 },
          },
        }),
      });

      if (!exaResponse.ok) continue;

      const exaData = await exaResponse.json();
      
      for (const result of exaData.results || []) {
        sources.push(result.url);
        
        let portalType = 'other_portal';
        for (const portal of KNOWN_PROCUREMENT_PORTALS) {
          if (result.url.includes(portal)) {
            portalType = portal.split('.')[0];
            break;
          }
        }

        opportunities.push({
          title: result.title || 'Procurement Listing',
          description: result.text?.substring(0, 500),
          opportunity_type: 'portal_listing',
          source_url: result.url,
          source_type: portalType,
          confidence_score: 0.75,
          extracted_data: {
            exa_score: result.score,
            portal_type: portalType,
          },
        });
      }
    }

    const confidence = opportunities.length > 0 ? 
      Math.min(0.85, 0.4 + (opportunities.length * 0.08)) : 0.15;

    return {
      phase: 3,
      phaseName: 'Procurement Portal Search',
      completed: true,
      opportunitiesFound: opportunities.length,
      confidence,
      sources,
      opportunities,
    };

  } catch (error) {
    console.error('Phase 3 error:', error);
    return {
      phase: 3,
      phaseName: 'Procurement Portal Search',
      completed: false,
      opportunitiesFound: 0,
      confidence: 0,
      sources: [],
      opportunities: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ===== PHASE 4: Open Web Discovery =====
async function executePhase4OpenWeb(
  agency: any,
  exaKey: string,
  lovableKey: string,
  supabaseClient: any
): Promise<SearchPhaseResult & { opportunities: ProcurementOpportunity[] }> {
  const opportunities: ProcurementOpportunity[] = [];
  const sources: string[] = [];

  try {
    console.log(`Phase 4: Open web search for ${agency.agency_name}`);

    // ADA Paratransit focused queries
    const queries = [
      `"${agency.agency_name}" RFP paratransit OR "demand response" OR eligibility`,
      `"${agency.doing_business_as || agency.agency_name}" contract award paratransit OR ADA`,
      `${agency.city} ${agency.state} transit paratransit scheduling software contract`,
      `"${agency.agency_name}" complaints paratransit service issues`, // Pain points search
    ];

    for (const query of queries) {
      const exaResponse = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': exaKey,
        },
        body: JSON.stringify({
          query,
          numResults: 5,
          type: 'neural',
          useAutoprompt: true,
          contents: {
            text: { maxCharacters: 2000 },
            highlights: { numSentences: 3 },
          },
          startPublishedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (!exaResponse.ok) continue;

      const exaData = await exaResponse.json();

      for (const result of exaData.results || []) {
        sources.push(result.url);

        // Check if this is about complaints/pain points
        const isComplaint = query.includes('complaints') || query.includes('issues');
        
        if (isComplaint) {
          // Extract and store pain points
          const painPoints = await extractPainPoints(result.title, result.text || '', agency.agency_name, lovableKey);
          if (painPoints && painPoints.length > 0) {
            for (const pain of painPoints) {
              await supabaseClient
                .from('agency_pain_points')
                .insert({
                  agency_id: agency.id,
                  category: pain.category,
                  description: pain.description,
                  severity: pain.severity,
                  source_type: 'news',
                  source_url: result.url,
                  source_date: result.publishedDate ? new Date(result.publishedDate).toISOString().split('T')[0] : null,
                  is_sales_opportunity: pain.is_sales_opportunity,
                  opportunity_notes: pain.opportunity_notes,
                });
            }
          }
          continue;
        }

        // Verify relevance for procurement opportunities
        const isRelevant = await verifyRelevanceWithAI(
          result.title,
          result.text || '',
          agency.agency_name,
          lovableKey
        );

        if (isRelevant) {
          opportunities.push({
            title: result.title,
            description: result.text?.substring(0, 500),
            opportunity_type: 'news_mention',
            source_url: result.url,
            source_type: 'news',
            confidence_score: 0.6,
            extracted_data: {
              highlights: result.highlights,
              published_date: result.publishedDate,
            },
          });
        }
      }
    }

    const confidence = opportunities.length > 0 ? 
      Math.min(0.7, 0.3 + (opportunities.length * 0.1)) : 0.1;

    return {
      phase: 4,
      phaseName: 'Open Web Discovery',
      completed: true,
      opportunitiesFound: opportunities.length,
      confidence,
      sources,
      opportunities,
    };

  } catch (error) {
    console.error('Phase 4 error:', error);
    return {
      phase: 4,
      phaseName: 'Open Web Discovery',
      completed: false,
      opportunitiesFound: 0,
      confidence: 0,
      sources: [],
      opportunities: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ===== Helper Functions =====

// Store vendor information
async function storeVendorInfo(
  agencyId: string,
  vendors: any[],
  sourceUrl: string,
  supabaseClient: any
) {
  for (const vendor of vendors) {
    if (!vendor.vendor_name) continue;
    
    await supabaseClient
      .from('agency_vendors')
      .upsert({
        agency_id: agencyId,
        vendor_name: vendor.vendor_name,
        service_category: vendor.service_category || 'service_delivery',
        service_component: vendor.service_component || 'unknown',
        contract_start_date: vendor.contract_start_date,
        contract_end_date: vendor.contract_end_date,
        contract_value: vendor.contract_value,
        is_current: true,
        source_type: 'website',
        source_url: sourceUrl,
        confidence_score: vendor.confidence || 0.7,
      }, { 
        onConflict: 'agency_id,vendor_name,service_component',
        ignoreDuplicates: false 
      });
  }
}

// Check if agency is in planning mode
async function checkPlanningMode(agencyId: string, supabaseClient: any): Promise<{
  isPlanningMode: boolean;
  reason: string | null;
  techUpgrade: boolean;
  serviceChange: boolean;
}> {
  // Check for recent plan documents with planning indicators
  const { data: plans } = await supabaseClient
    .from('agency_plan_documents')
    .select('*')
    .eq('agency_id', agencyId)
    .or('has_technology_upgrade_plans.eq.true,has_service_model_changes.eq.true')
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Check for contracts expiring in next 12 months
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data: expiringContracts } = await supabaseClient
    .from('agency_vendors')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('is_current', true)
    .lte('contract_end_date', oneYearFromNow)
    .gte('contract_end_date', new Date().toISOString().split('T')[0]);

  const techUpgrade = plans?.some((p: any) => p.has_technology_upgrade_plans) || false;
  const serviceChange = plans?.some((p: any) => p.has_service_model_changes) || false;
  const hasExpiringContracts = (expiringContracts?.length || 0) > 0;
  
  const isPlanningMode = techUpgrade || serviceChange || hasExpiringContracts;
  
  let reason = null;
  if (isPlanningMode) {
    const reasons = [];
    if (techUpgrade) reasons.push('Technology upgrade planned');
    if (serviceChange) reasons.push('Service model changes planned');
    if (hasExpiringContracts) reasons.push(`${expiringContracts.length} contract(s) expiring within 12 months`);
    reason = reasons.join('; ');
  }

  return { isPlanningMode, reason, techUpgrade, serviceChange };
}

// Extract ADA Paratransit procurement with AI
async function extractAdaParatransitProcurement(
  content: string,
  sourceUrl: string,
  apiKey: string
): Promise<{ opportunities: any[]; vendors: any[] } | null> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Extract ADA paratransit procurement opportunities AND current vendor information from this webpage.

Return JSON with two arrays:
{
  "opportunities": [{
    "title": "RFP/Contract title",
    "description": "Brief description",
    "opportunity_type": "rfp|rfq|bid|contract_award|solicitation",
    "deadline": "ISO date or null",
    "estimated_value": number or null,
    "contact_info": { "name": "", "email": "", "phone": "" } or null,
    "service_category": "service_delivery|technology|customer_service|eligibility|travel_training|brokerage",
    "service_component": "specific component like turnkey, cad_avl, call_center, etc"
  }],
  "vendors": [{
    "vendor_name": "Company name",
    "service_category": "service_delivery|technology|customer_service|eligibility|travel_training|brokerage",
    "service_component": "specific component",
    "contract_value": number or null,
    "contract_end_date": "ISO date or null"
  }]
}

Service categories:
- service_delivery: turnkey, dedicated_fleet, taxi_supplemental, tnc, volunteer_driver
- technology: cad_avl, scheduling, dispatch, ivr, rider_app, driver_app, mdt, routing
- customer_service: call_center, reservations, complaints
- eligibility: eligibility_determination, assessment, appeals
- travel_training: travel_training, mobility_training
- brokerage: nemt_brokerage, multi_provider_coordination, mobility_management

Only include actual procurement opportunities and current vendors. Return empty arrays if none found.`
          },
          {
            role: 'user',
            content: `Source: ${sourceUrl}\n\nContent:\n${content.substring(0, 12000)}`
          }
        ],
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;
    
    if (!aiContent) return null;

    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI extraction error:', error);
    return null;
  }
}

// Extract board actions with AI
async function extractBoardActions(
  content: string,
  sourceUrl: string,
  agencyName: string,
  apiKey: string
): Promise<any[]> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Extract board actions related to contracts, procurement, or vendor selection for the transit agency "${agencyName}".

Focus on:
- Contract approvals, extensions, amendments
- RFP authorizations
- Vendor selections
- Budget approvals for paratransit/demand response services

Return JSON array:
[{
  "action_type": "contract_approval|contract_extension|contract_amendment|rfp_authorization|vendor_selection|budget_approval|plan_adoption|policy_change|other",
  "action_date": "ISO date or null",
  "meeting_date": "ISO date or null",
  "title": "Brief title of the action",
  "description": "What was approved/decided",
  "vendor_name": "Vendor name if applicable",
  "contract_value": number or null,
  "service_category": "service_delivery|technology|customer_service|eligibility|travel_training|brokerage or null",
  "service_component": "specific component or null"
}]

Return [] if no relevant board actions found.`
          },
          {
            role: 'user',
            content: `Source: ${sourceUrl}\n\nContent:\n${content.substring(0, 10000)}`
          }
        ],
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;
    
    if (!aiContent) return [];

    const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Board action extraction error:', error);
    return [];
  }
}

// Identify plan documents with AI
async function identifyPlanDocuments(
  content: string,
  sourceUrl: string,
  agencyName: string,
  apiKey: string
): Promise<any[]> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Identify transit planning documents for "${agencyName}" from this content.

Look for:
- Transit Development Plans (TDP)
- ADA Paratransit Plans
- Coordinated Public Transit Human Services Transportation Plans
- Short/Long Range Transit Plans
- Fare studies, COA studies

Return JSON array:
[{
  "document_type": "tdp|ada_plan|coordinated_plan|short_range_plan|long_range_plan|fare_study|cod_study|other",
  "title": "Document title",
  "url": "Direct link to PDF if found, or null",
  "published_date": "ISO date or null",
  "has_technology_upgrade": boolean - true if mentions technology changes/upgrades,
  "has_service_changes": boolean - true if mentions service model changes,
  "planning_indicators": ["list of planning mode indicators found"]
}]

Return [] if no planning documents found.`
          },
          {
            role: 'user',
            content: `Source: ${sourceUrl}\n\nContent:\n${content.substring(0, 10000)}`
          }
        ],
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;
    
    if (!aiContent) return [];

    const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Plan document identification error:', error);
    return [];
  }
}

// Extract pain points from news/complaints
async function extractPainPoints(
  title: string,
  content: string,
  agencyName: string,
  apiKey: string
): Promise<any[]> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Extract paratransit service pain points or complaints for "${agencyName}".

Return JSON array:
[{
  "category": "service_quality|technology|customer_service|eligibility|scheduling|on_time_performance|driver_issues|vehicle_issues|cost|accessibility|other",
  "description": "Brief description of the issue",
  "severity": "low|medium|high|critical",
  "is_sales_opportunity": boolean - true if this represents a sales opportunity,
  "opportunity_notes": "How this could be addressed by a vendor, or null"
}]

Return [] if no relevant pain points found.`
          },
          {
            role: 'user',
            content: `Title: ${title}\n\nContent: ${content.substring(0, 4000)}`
          }
        ],
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;
    
    if (!aiContent) return [];

    const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Pain point extraction error:', error);
    return [];
  }
}

// Verify relevance with AI
async function verifyRelevanceWithAI(
  title: string,
  content: string,
  agencyName: string,
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Determine if this content is about a procurement opportunity (RFP, contract, bid) for paratransit/ADA services at "${agencyName}". Reply only "true" or "false".`
          },
          {
            role: 'user',
            content: `Title: ${title}\n\nContent: ${content.substring(0, 2000)}`
          }
        ],
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content?.toLowerCase().trim();
    
    return aiContent === 'true';
  } catch (error) {
    return false;
  }
}
