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
      // Get agencies ordered by priority (total_voms as proxy for importance)
      // Limit to 3 for faster response, avoid timeout
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

        // ===== PHASE 2: Procurement Portal Search (if needed) =====
        if (overallConfidence < CONFIDENCE_THRESHOLD && EXA_API_KEY) {
          const phase2Result = await executePhase2(agency, EXA_API_KEY, FIRECRAWL_API_KEY, LOVABLE_API_KEY);
          phaseResults.push(phase2Result);
          opportunities.push(...(phase2Result as any).opportunities || []);
          overallConfidence = Math.max(overallConfidence, phase2Result.confidence);
          console.log(`Phase 2 complete: ${phase2Result.opportunitiesFound} opportunities, confidence: ${phase2Result.confidence}`);
        }

        // ===== PHASE 3: Open Web Discovery (if still need more) =====
        if (overallConfidence < CONFIDENCE_THRESHOLD && EXA_API_KEY) {
          const phase3Result = await executePhase3(agency, EXA_API_KEY, LOVABLE_API_KEY);
          phaseResults.push(phase3Result);
          opportunities.push(...(phase3Result as any).opportunities || []);
          overallConfidence = Math.max(overallConfidence, phase3Result.confidence);
          console.log(`Phase 3 complete: ${phase3Result.opportunitiesFound} opportunities, confidence: ${phase3Result.confidence}`);
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
            next_search_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'agency_id' });

        results.push({
          agencyId: agency.id,
          agencyName: agency.agency_name,
          searchRunId: searchRun.id,
          opportunitiesFound: opportunities.length,
          confidence: overallConfidence,
          phasesCompleted: phaseResults.length,
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
    
    // Map the agency website
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: agency.url,
        search: 'procurement rfp bid contract solicitation',
        limit: 100,
        includeSubdomains: false,
      }),
    });

    const mapData = await mapResponse.json();
    
    if (!mapResponse.ok) {
      console.error('Firecrawl map error:', mapData);
    }
    
    const allUrls: string[] = mapData.links || mapData.data?.links || [agency.url];
    
    // Filter for procurement-related pages
    const procurementKeywords = [
      'procurement', 'rfp', 'rfq', 'bid', 'solicitation', 
      'contract', 'vendor', 'purchasing', 'opportunity', 'doing-business'
    ];
    
    const procurementUrls = allUrls.filter((url: string) => 
      procurementKeywords.some(kw => url.toLowerCase().includes(kw))
    ).slice(0, 5);

    // Also check common procurement paths
    const commonPaths = ['/procurement', '/rfp', '/bids', '/solicitations', '/doing-business', '/vendors'];
    for (const path of commonPaths) {
      try {
        const testUrl = new URL(path, agency.url).href;
        if (!procurementUrls.includes(testUrl) && !allUrls.includes(testUrl)) {
          procurementUrls.push(testUrl);
        }
      } catch (e) {}
    }

    console.log(`Found ${procurementUrls.length} procurement-related pages`);

    // Scrape procurement pages
    for (const url of procurementUrls.slice(0, 5)) {
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

        // Use AI to extract procurement opportunities
        const extracted = await extractProcurementWithAI(content, url, lovableKey);
        if (extracted && extracted.length > 0) {
          for (const opp of extracted) {
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
              });
            }
          }
        }

        // Also check for procurement portal links and documents
        const links = scrapeData.data?.links || [];
        const documentLinks: string[] = [];
        
        for (const link of links) {
          // Check for document links (PDFs, DOCs)
          if (link.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
            documentLinks.push(link);
          }
          
          // Check for procurement portals
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

// ===== PHASE 2: Procurement Portal Search =====
async function executePhase2(
  agency: any,
  exaKey: string,
  firecrawlKey: string,
  lovableKey: string
): Promise<SearchPhaseResult & { opportunities: ProcurementOpportunity[] }> {
  const opportunities: ProcurementOpportunity[] = [];
  const sources: string[] = [];

  try {
    console.log(`Phase 2: Searching procurement portals for ${agency.agency_name}`);

    const searchTerms = [
      agency.agency_name,
      agency.doing_business_as,
      `${agency.city} ${agency.state} transit`,
    ].filter(Boolean).slice(0, 2);

    for (const term of searchTerms) {
      // Search on known procurement portals
      const portalQuery = `site:bidnetdirect.com OR site:publicpurchase.com OR site:bonfire.com "${term}" procurement`;
      
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
        
        // Determine portal type
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
      phase: 2,
      phaseName: 'Procurement Portal Search',
      completed: true,
      opportunitiesFound: opportunities.length,
      confidence,
      sources,
      opportunities,
    };

  } catch (error) {
    console.error('Phase 2 error:', error);
    return {
      phase: 2,
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

// ===== PHASE 3: Open Web Discovery =====
async function executePhase3(
  agency: any,
  exaKey: string,
  lovableKey: string
): Promise<SearchPhaseResult & { opportunities: ProcurementOpportunity[] }> {
  const opportunities: ProcurementOpportunity[] = [];
  const sources: string[] = [];

  try {
    console.log(`Phase 3: Open web search for ${agency.agency_name}`);

    const queries = [
      `"${agency.agency_name}" RFP OR "request for proposal" transit`,
      `"${agency.doing_business_as || agency.agency_name}" contract award bus OR transit`,
      `${agency.city} ${agency.state} transit authority procurement news`,
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
          startPublishedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (!exaResponse.ok) continue;

      const exaData = await exaResponse.json();

      for (const result of exaData.results || []) {
        sources.push(result.url);

        // Use AI to determine if this is actually a procurement opportunity
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
      phase: 3,
      phaseName: 'Open Web Discovery',
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

// Helper: Extract procurement with AI
async function extractProcurementWithAI(
  content: string,
  sourceUrl: string,
  apiKey: string
): Promise<Partial<ProcurementOpportunity>[]> {
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
            content: `Extract procurement opportunities from this webpage content. Return JSON array:
[{
  "title": "RFP/Contract title",
  "description": "Brief description",
  "opportunity_type": "rfp|rfq|bid|contract_award|solicitation",
  "deadline": "ISO date or null",
  "estimated_value": number or null,
  "contact_info": { "name": "", "email": "", "phone": "" } or null
}]
Only include actual procurement opportunities. Return [] if none found.`
          },
          {
            role: 'user',
            content: `Source: ${sourceUrl}\n\nContent:\n${content.substring(0, 12000)}`
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
    console.error('AI extraction error:', error);
    return [];
  }
}

// Helper: Verify relevance with AI
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
            content: `Determine if this content is about a procurement opportunity (RFP, contract, bid) for the transit agency "${agencyName}". Reply only "true" or "false".`
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
