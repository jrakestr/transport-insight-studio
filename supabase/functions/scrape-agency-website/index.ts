import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agencyId, agencyUrl, agencyName } = await req.json();
    
    if (!agencyId || !agencyUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing agencyId or agencyUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting scrape for agency: ${agencyName} (${agencyUrl})`);

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Step 1: Map the website using Firecrawl API directly
    console.log('Mapping website URLs...');
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
    if (!mapResponse.ok || !mapData.success) {
      console.log('Map failed, falling back to single URL scrape');
    }

    const urls: string[] = mapData.links || [agencyUrl];
    console.log(`Found ${urls.length} URLs`);

    // Filter for relevant pages
    const relevantKeywords = ['contact', 'about', 'staff', 'directory', 'leadership', 'board', 'procurement', 'rfp', 'bid', 'contract', 'news', 'press', 'announcement'];
    const relevantUrls = urls.filter((url: string) => 
      relevantKeywords.some(keyword => url.toLowerCase().includes(keyword))
    ).slice(0, 10);

    // Always include the main URL
    const urlsToScrape = [agencyUrl, ...relevantUrls.filter((u: string) => u !== agencyUrl)].slice(0, 8);
    
    console.log(`Scraping ${urlsToScrape.length} relevant pages`);

    const intelligenceResults: any[] = [];

    // Step 2: Scrape each relevant page using Firecrawl API directly
    for (const url of urlsToScrape) {
      try {
        console.log(`Scraping: ${url}`);
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
          console.log(`Failed to scrape: ${url}`);
          continue;
        }

        const pageContent = scrapeData.data.markdown;
        const pageTitle = scrapeData.data.metadata?.title || url;

        // Step 3: Use Lovable AI to extract intelligence
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
                  content: `You are an intelligence analyst extracting valuable business intelligence from transit agency websites. 
                  
Extract and categorize the following types of information:
1. CONTACTS: Names, titles, emails, phone numbers of staff/leadership
2. PROCUREMENT: RFPs, bids, contracts, procurement opportunities
3. NEWS: Recent announcements, press releases, updates
4. LEADERSHIP: Board members, executives, department heads

Return a JSON object with this structure:
{
  "contacts": [{ "name": "", "title": "", "email": "", "phone": "", "department": "" }],
  "procurement": [{ "title": "", "type": "", "deadline": "", "description": "" }],
  "news": [{ "title": "", "date": "", "summary": "" }],
  "leadership": [{ "name": "", "title": "", "department": "" }]
}

Only include items you actually find. Return empty arrays if nothing found.`
                },
                {
                  role: 'user',
                  content: `Extract intelligence from this page (${url}):\n\n${pageContent.substring(0, 15000)}`
                }
              ],
              temperature: 0.1,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const aiContent = aiData.choices?.[0]?.message?.content;
            
            if (aiContent) {
              // Parse JSON from AI response
              const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  const extracted = JSON.parse(jsonMatch[0]);
                  
                  // Store contacts
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

                  // Store procurement
                  if (extracted.procurement?.length > 0) {
                    intelligenceResults.push({
                      agency_id: agencyId,
                      source_url: url,
                      intelligence_type: 'procurement',
                      title: `Procurement from ${pageTitle}`,
                      extracted_data: { items: extracted.procurement },
                      confidence_score: 0.85,
                    });
                  }

                  // Store news
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

                  // Store leadership
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

    // Step 4: Store results in database
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
        urlsScraped: urlsToScrape.length,
        intelligenceExtracted: intelligenceResults.length,
        types: [...new Set(intelligenceResults.map(r => r.intelligence_type))]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
