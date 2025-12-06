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
    console.log('🔍 Starting article discovery process...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create discovery run record
    const { data: run, error: runError } = await supabaseClient
      .from('discovery_runs')
      .insert({
        status: 'running',
        run_metadata: {
          search_queries: ['transit technology', 'transit RFP', 'public transportation news']
        }
      })
      .select()
      .single();

    if (runError) throw runError;
    console.log('📝 Created discovery run:', run.id);

    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!EXA_API_KEY || !FIRECRAWL_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('Missing required API keys');
    }

    // Define search queries for transit news
    const searchQueries = [
      'transit technology RFP',
      'public transportation contract award',
      'transit agency electric bus',
      'microtransit launch announcement'
    ];

    let totalDiscovered = 0;
    let totalProcessed = 0;
    let totalAdded = 0;

    for (const query of searchQueries) {
      console.log(`🔎 Searching Exa for: "${query}"`);
      
      // Use Exa Search API
      const exaResponse = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': EXA_API_KEY,
        },
        body: JSON.stringify({
          query: query,
          type: 'neural',
          useAutoprompt: true,
          numResults: 10,
          startPublishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
          category: 'news',
          contents: {
            text: true,
          }
        }),
      });

      if (!exaResponse.ok) {
        console.error(`Exa search failed for "${query}":`, await exaResponse.text());
        continue;
      }

      const exaData = await exaResponse.json();
      console.log(`✅ Found ${exaData.results?.length || 0} results for "${query}"`);
      
      totalDiscovered += exaData.results?.length || 0;

      // Process each result
      for (const result of exaData.results || []) {
        try {
          // Check if URL already exists in pending or published
          const { data: existing } = await supabaseClient
            .from('pending_articles')
            .select('id')
            .eq('source_url', result.url)
            .maybeSingle();

          if (existing) {
            console.log(`⏭️  Skipping duplicate: ${result.url}`);
            continue;
          }

          const { data: published } = await supabaseClient
            .from('articles')
            .select('id')
            .eq('source_url', result.url)
            .maybeSingle();

          if (published) {
            console.log(`⏭️  Skipping already published: ${result.url}`);
            continue;
          }

          console.log(`📄 Processing: ${result.title}`);
          
          // Extract clean content with Firecrawl
          let cleanContent = result.text || '';
          let imageUrl = null;
          
          try {
            console.log(`🔥 Extracting content with Firecrawl...`);
            const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              },
              body: JSON.stringify({
                url: result.url,
                formats: ['markdown', 'screenshot'],
                onlyMainContent: true,
              }),
            });

            if (firecrawlResponse.ok) {
              const firecrawlData = await firecrawlResponse.json();
              cleanContent = firecrawlData.data?.markdown || cleanContent;
              imageUrl = firecrawlData.data?.screenshot || null;
              console.log(`✅ Firecrawl extraction successful`);
            } else {
              console.warn(`⚠️ Firecrawl failed, using Exa content`);
            }
          } catch (fcError) {
            console.error('Firecrawl error:', fcError);
          }

          // Analyze with Lovable AI
          console.log(`🤖 Analyzing with AI...`);
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
                  content: `You are an expert at analyzing transit industry news. Extract key information and entities from articles.

Return ONLY a raw JSON object (no markdown code blocks, no explanation) with:
- relevance_score (0-1): How relevant is this to transit technology/RFPs?
- category: One of [Technology, Policy, RFP, Contract Award, Partnership, Infrastructure]
- verticals: Array of relevant verticals [Electric Buses, Autonomous Vehicles, Fare Payment, etc.]
- agencies: Array of {name: string, confidence: number} for transit agencies mentioned
- providers: Array of {name: string, provider_type: string, confidence: number, transit_modes?: string[]} for providers

PROVIDER TYPES:
- "operator": Transit service operators (First Transit, MV Transportation, Transdev)
- "technology": Software/platform providers (Trapeze, Via, Swiftly, Clever Devices)
- "tnc": Ride-hailing companies (Uber, Lyft)
- "oem": Vehicle manufacturers (New Flyer, Gillig, BYD, Proterra)
- "consultant": Planning/advisory firms (WSP, AECOM)
- "service": Other service providers

- opportunities: Array of {type: string, description: string, confidence: number} for RFPs or contracts
- summary: Brief 2-sentence summary
- key_insights: Array of 3-5 bullet points`
                },
                {
                  role: 'user',
                  content: `Analyze this transit news article:\n\nTitle: ${result.title}\n\nContent:\n${cleanContent.slice(0, 4000)}`
                }
              ],
              response_format: { type: 'json_object' }
            }),
          });

          if (!aiResponse.ok) {
            console.error('AI analysis failed:', await aiResponse.text());
            continue;
          }

          const aiData = await aiResponse.json();
          // Strip markdown code blocks if present
          let content = aiData.choices[0].message.content.trim();
          if (content.startsWith('```json')) {
            content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (content.startsWith('```')) {
            content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          const analysis = JSON.parse(content);
          
          console.log(`✅ AI Analysis complete - Relevance: ${analysis.relevance_score}`);

          // Only add if relevance score is high enough
          if (analysis.relevance_score < 0.6) {
            console.log(`⏭️  Skipping low relevance article (${analysis.relevance_score})`);
            continue;
          }

          // Store in pending_articles
          const { error: insertError } = await supabaseClient
            .from('pending_articles')
            .insert({
              source_url: result.url,
              source_name: new URL(result.url).hostname,
              discovery_method: 'exa_search',
              title: result.title,
              description: analysis.summary,
              content: cleanContent,
              published_at: result.publishedDate || new Date().toISOString(),
              image_url: imageUrl,
              ai_analysis: analysis,
              ai_confidence_score: analysis.relevance_score,
              extracted_category: analysis.category,
              extracted_verticals: analysis.verticals || [],
              extracted_agencies: analysis.agencies || [],
              extracted_providers: analysis.providers || [],
              extracted_opportunities: analysis.opportunities || [],
              review_status: 'pending'
            });

          if (insertError) {
            console.error('Failed to insert pending article:', insertError);
          } else {
            console.log(`✅ Added to pending queue: ${result.title}`);
            totalAdded++;
          }

          totalProcessed++;

        } catch (articleError) {
          console.error(`Error processing article:`, articleError);
        }
      }
    }

    // Update discovery run
    await supabaseClient
      .from('discovery_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        articles_discovered: totalDiscovered,
        articles_processed: totalProcessed,
        articles_added: totalAdded
      })
      .eq('id', run.id);

    console.log(`🎉 Discovery complete! Added ${totalAdded} articles to review queue.`);

    return new Response(
      JSON.stringify({
        success: true,
        run_id: run.id,
        articles_discovered: totalDiscovered,
        articles_processed: totalProcessed,
        articles_added: totalAdded
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Discovery error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
