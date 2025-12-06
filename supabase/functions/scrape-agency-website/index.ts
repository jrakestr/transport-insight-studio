import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExaResult {
  id: string;
  title: string;
  url: string;
  score: number;
  text?: string;
  highlights?: string[];
}

interface ExaSearchResponse {
  results: ExaResult[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agencyId, agencyUrl, agencyName } = await req.json();
    
    if (!agencyId) {
      return new Response(
        JSON.stringify({ error: 'Missing agencyId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting intelligence gathering for agency: ${agencyName}`);

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get agency details for open web search
    const { data: agency, error: agencyError } = await supabase
      .from('transit_agencies')
      .select('id, agency_name, city, state, doing_business_as, uza_name')
      .eq('id', agencyId)
      .single();

    if (agencyError || !agency) {
      console.error('Agency fetch error:', agencyError);
      return new Response(
        JSON.stringify({ error: 'Agency not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const intelligenceResults: any[] = [];
    let urlsScraped = 0;

    // ========================================
    // PART 1: Scrape agency's own website (if URL provided)
    // ========================================
    if (agencyUrl && FIRECRAWL_API_KEY) {
      console.log(`Scraping agency website: ${agencyUrl}`);
      
      // Map the website using Firecrawl API
      const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: agencyUrl,
          limit: 100,
          includeSubdomains: false,
        }),
      });

      const mapData = await mapResponse.json();
      const urls: string[] = mapData.links || [agencyUrl];
      console.log(`Found ${urls.length} URLs on agency website`);

      // Filter for relevant pages
      const relevantKeywords = ['contact', 'about', 'staff', 'directory', 'leadership', 'board', 'procurement', 'rfp', 'bid', 'contract', 'news', 'press', 'announcement'];
      const relevantUrls = urls.filter((url: string) => 
        relevantKeywords.some(keyword => url.toLowerCase().includes(keyword))
      ).slice(0, 10);

      const urlsToScrape = [agencyUrl, ...relevantUrls.filter((u: string) => u !== agencyUrl)].slice(0, 8);
      console.log(`Scraping ${urlsToScrape.length} relevant pages from agency website`);

      // Scrape each relevant page
      for (const url of urlsToScrape) {
        try {
          const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url,
              formats: ['markdown'],
              onlyMainContent: true,
            }),
          });

          const scrapeData = await scrapeResponse.json();
          if (!scrapeResponse.ok || !scrapeData.success || !scrapeData.data?.markdown) {
            continue;
          }

          urlsScraped++;
          const pageContent = scrapeData.data.markdown;
          const pageTitle = scrapeData.data.metadata?.title || url;

          // Use AI to extract intelligence
          if (LOVABLE_API_KEY) {
            const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  {
                    role: 'system',
                    content: `You are an intelligence analyst extracting business intelligence from transit agency websites. 
                    
Extract and categorize:
1. CONTACTS: Names, titles, emails, phone numbers
2. PROCUREMENT: RFPs, bids, contracts, opportunities
3. NEWS: Announcements, press releases
4. LEADERSHIP: Board members, executives

Return JSON:
{
  "contacts": [{ "name": "", "title": "", "email": "", "phone": "", "department": "" }],
  "procurement": [{ "title": "", "type": "", "deadline": "", "description": "" }],
  "news": [{ "title": "", "date": "", "summary": "" }],
  "leadership": [{ "name": "", "title": "", "department": "" }]
}

Only include items actually found. Return empty arrays if nothing found.`
                  },
                  {
                    role: 'user',
                    content: `Extract intelligence from this page (${url}):\n\n${pageContent.substring(0, 15000)}`
                  }
                ],
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              const aiContent = aiData.choices?.[0]?.message?.content;
              
              if (aiContent) {
                const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    const extracted = JSON.parse(jsonMatch[0]);
                    
                    if (extracted.contacts?.length > 0) {
                      intelligenceResults.push({
                        agency_id: agencyId,
                        source_url: url,
                        intelligence_type: 'contacts',
                        title: `Contacts from ${pageTitle}`,
                        extracted_data: { contacts: extracted.contacts },
                        confidence_score: 0.8,
                      });
                    }

                    if (extracted.procurement?.length > 0) {
                      intelligenceResults.push({
                        agency_id: agencyId,
                        source_url: url,
                        intelligence_type: 'procurement',
                        title: `Procurement from ${pageTitle}`,
                        extracted_data: { items: extracted.procurement, source: 'agency_website' },
                        confidence_score: 0.85,
                      });
                    }

                    if (extracted.news?.length > 0) {
                      intelligenceResults.push({
                        agency_id: agencyId,
                        source_url: url,
                        intelligence_type: 'news',
                        title: `News from ${pageTitle}`,
                        extracted_data: { items: extracted.news },
                        confidence_score: 0.9,
                      });
                    }

                    if (extracted.leadership?.length > 0) {
                      intelligenceResults.push({
                        agency_id: agencyId,
                        source_url: url,
                        intelligence_type: 'leadership',
                        title: `Leadership from ${pageTitle}`,
                        extracted_data: { leaders: extracted.leadership },
                        confidence_score: 0.85,
                      });
                    }
                  } catch (parseError) {
                    console.log(`Failed to parse AI response for ${url}`);
                  }
                }
              }
            }
          }
        } catch (scrapeError) {
          console.error(`Error scraping ${url}:`, scrapeError);
        }
      }
    }

    // ========================================
    // PART 2: Search open web for procurement portals using Exa
    // ========================================
    if (EXA_API_KEY) {
      console.log('Searching open web for procurement portals...');
      
      const cityName = agency.city || agency.uza_name?.split(',')[0] || '';
      const stateName = agency.state || '';
      const agencyShortName = agency.doing_business_as || agency.agency_name;

      // Queries to find procurement portals
      const queries = [
        `${cityName} ${stateName} transit rfp solicitations bids procurement`,
        `"${agencyShortName}" rfp bid solicitation procurement`
      ];

      const allExaResults: ExaResult[] = [];

      for (const query of queries) {
        try {
          console.log(`Exa query: ${query.substring(0, 50)}...`);
          
          const exaResponse = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': EXA_API_KEY,
            },
            body: JSON.stringify({
              query,
              numResults: 10,
              type: 'auto',
              useAutoprompt: true,
              contents: {
                text: { maxCharacters: 2000 },
                highlights: { numSentences: 5 }
              },
              startPublishedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            }),
          });

          if (exaResponse.ok) {
            const exaData: ExaSearchResponse = await exaResponse.json();
            console.log(`Query returned ${exaData.results.length} results`);
            allExaResults.push(...exaData.results);
          }
        } catch (queryError) {
          console.error(`Exa query error:`, queryError);
        }
      }

      // Deduplicate by URL
      const seenUrls = new Set<string>();
      const uniqueResults = allExaResults.filter(r => {
        if (seenUrls.has(r.url)) return false;
        seenUrls.add(r.url);
        return true;
      });

      console.log(`Found ${uniqueResults.length} unique procurement portal candidates`);

      // Categorize and score results
      const portalResults = uniqueResults.map(result => {
        const url = result.url.toLowerCase();
        let sourceType = 'other';
        
        if (url.includes('bidnetdirect.com')) sourceType = 'bidnet';
        else if (url.includes('publicpurchase.com')) sourceType = 'public_purchase';
        else if (url.includes('govwin.com')) sourceType = 'govwin';
        else if (url.includes('bidexpress.com')) sourceType = 'bid_express';
        else if (url.includes('bonfire.com')) sourceType = 'bonfire';
        else if (url.includes('ionwave.net')) sourceType = 'ionwave';
        else if (url.includes('procurenow.com')) sourceType = 'procurenow';
        else if (url.includes('negometrix.com')) sourceType = 'negometrix';
        else if (url.includes('periscope')) sourceType = 'periscope';
        else if (url.includes('.gov') || url.includes('.us')) sourceType = 'government';

        const pathIndicators = ['procurement', 'rfp', 'bid', 'solicitation', 'vendor', 'contract', 'purchasing'];
        const hasPathIndicator = pathIndicators.some(ind => url.includes(ind));

        const adjustedScore = (result.score || 0.5) * 
          (sourceType !== 'other' ? 1.2 : 1.0) *
          (hasPathIndicator ? 1.1 : 1.0);

        return {
          ...result,
          sourceType,
          hasPathIndicator,
          adjustedScore,
        };
      });

      // Sort by score and take top results
      portalResults.sort((a, b) => b.adjustedScore - a.adjustedScore);
      const topPortals = portalResults.slice(0, 10);

      if (topPortals.length > 0) {
        intelligenceResults.push({
          agency_id: agencyId,
          source_url: 'open_web_search',
          intelligence_type: 'procurement',
          title: `Procurement Portals (Open Web Search)`,
          extracted_data: {
            source: 'open_web_search',
            portals: topPortals.map(p => ({
              title: p.title,
              url: p.url,
              sourceType: p.sourceType,
              score: p.adjustedScore,
              snippet: p.text?.substring(0, 500),
              highlights: p.highlights,
            })),
            queriesUsed: queries,
          },
          confidence_score: 0.7,
        });
      }
    }

    // ========================================
    // Store results in database
    // ========================================
    if (intelligenceResults.length > 0) {
      const { error: insertError } = await supabase
        .from('agency_intelligence')
        .insert(intelligenceResults);

      if (insertError) {
        console.error('Error inserting intelligence:', insertError);
        throw insertError;
      }
    }

    console.log(`Extracted ${intelligenceResults.length} intelligence items`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        urlsScraped,
        intelligenceExtracted: intelligenceResults.length,
        types: [...new Set(intelligenceResults.map(r => r.intelligence_type))]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Intelligence gathering error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});