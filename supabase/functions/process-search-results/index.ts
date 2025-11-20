import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

interface ProcessingResult {
  resultId: string;
  url: string;
  processed: boolean;
  added: boolean;
  skipped?: boolean;
  skipReason?: string;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get optional parameters from request
    const { searchId, limit = 10, minRelevanceScore = 60 } = await req.json().catch(() => ({}));

    console.log('Starting search results processing...', { searchId, limit, minRelevanceScore });

    // Fetch unprocessed results
    let query = supabase
      .from('search_results')
      .select('*')
      .eq('processed', false)
      .is('duplicate_of', null)
      .order('relevance_score', { ascending: false });

    if (searchId) {
      query = query.eq('automated_search_id', searchId);
    }

    const { data: results, error: fetchError } = await query.limit(limit);

    if (fetchError) {
      throw new Error(`Failed to fetch unprocessed results: ${fetchError.message}`);
    }

    if (!results || results.length === 0) {
      console.log('No unprocessed results found');
      return new Response(
        JSON.stringify({ message: 'No unprocessed results to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${results.length} unprocessed results`);

    const processingResults: ProcessingResult[] = [];
    let processedCount = 0;
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const result of results) {
      try {
        console.log(`Processing result: ${result.id} - ${result.source_url}`);

        // Skip if relevance score is too low
        if (result.relevance_score && result.relevance_score < minRelevanceScore) {
          console.log(`Skipping due to low relevance score: ${result.relevance_score}`);
          await supabase.rpc('mark_result_processed', {
            result_id: result.id,
            skip_reason_text: `Low relevance score: ${result.relevance_score}`,
          });
          skippedCount++;
          processingResults.push({
            resultId: result.id,
            url: result.source_url,
            processed: true,
            added: false,
            skipped: true,
            skipReason: 'Low relevance score',
          });
          continue;
        }

        // Check if URL already exists in pending_articles or articles
        const { data: existingPending } = await supabase
          .from('pending_articles')
          .select('id')
          .eq('source_url', result.source_url)
          .maybeSingle();

        const { data: existingArticle } = await supabase
          .from('articles')
          .select('id')
          .eq('source_url', result.source_url)
          .maybeSingle();

        if (existingPending || existingArticle) {
          console.log(`Article already exists: ${result.source_url}`);
          await supabase.rpc('mark_result_processed', {
            result_id: result.id,
            skip_reason_text: 'Article already exists in database',
          });
          skippedCount++;
          processingResults.push({
            resultId: result.id,
            url: result.source_url,
            processed: true,
            added: false,
            skipped: true,
            skipReason: 'Already exists',
          });
          continue;
        }

        // Extract content using Firecrawl
        console.log(`Extracting content from: ${result.source_url}`);
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firecrawlApiKey}`,
          },
          body: JSON.stringify({
            url: result.source_url,
            formats: ['markdown', 'screenshot'],
          }),
        });

        if (!firecrawlResponse.ok) {
          throw new Error(`Firecrawl error: ${firecrawlResponse.status}`);
        }

        const firecrawlData = await firecrawlResponse.json();
        const content = firecrawlData.data?.markdown || '';
        const screenshot = firecrawlData.data?.screenshot;

        if (!content || content.length < 200) {
          console.log('Content too short or empty');
          await supabase.rpc('mark_result_processed', {
            result_id: result.id,
            skip_reason_text: 'Insufficient content extracted',
          });
          skippedCount++;
          processingResults.push({
            resultId: result.id,
            url: result.source_url,
            processed: true,
            added: false,
            skipped: true,
            skipReason: 'Insufficient content',
          });
          continue;
        }

        // Analyze with AI
        console.log('Analyzing content with AI...');
        const analysisPrompt = `Analyze this transit industry article and provide structured JSON output.

Article Title: ${result.title || 'Unknown'}
Content: ${content.substring(0, 4000)}

Provide your response as valid JSON with this exact structure:
{
  "relevance": 0.0-1.0,
  "category": "one of: infrastructure, technology, policy, operations, innovation",
  "verticals": ["array of relevant verticals: fixed-route, paratransit, microtransit, etc."],
  "agencies": [{"name": "agency name", "mention_type": "featured/mentioned/context"}],
  "providers": [{"name": "provider name", "mention_type": "featured/mentioned/context"}],
  "opportunities": [{"title": "opportunity title", "description": "brief description"}],
  "summary": "2-3 sentence summary"
}`;

        const aiResponse = await fetch('https://api.lovable.app/v1/ai/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are an expert at analyzing transit industry news. Always respond with valid JSON only.',
              },
              {
                role: 'user',
                content: analysisPrompt,
              },
            ],
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI analysis error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices[0].message.content;

        // Parse AI response
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in AI response');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        // Check if article is relevant enough
        if (analysis.relevance < 0.6) {
          console.log(`Skipping due to low AI relevance: ${analysis.relevance}`);
          await supabase.rpc('mark_result_processed', {
            result_id: result.id,
            skip_reason_text: `Low AI relevance score: ${analysis.relevance}`,
          });
          skippedCount++;
          processingResults.push({
            resultId: result.id,
            url: result.source_url,
            processed: true,
            added: false,
            skipped: true,
            skipReason: 'Low AI relevance',
          });
          continue;
        }

        // Add to pending_articles
        console.log('Adding to pending_articles...');
        const { data: pendingArticle, error: insertError } = await supabase
          .from('pending_articles')
          .insert({
            title: result.title || 'Untitled',
            source_url: result.source_url,
            source_name: new URL(result.source_url).hostname,
            description: result.description || analysis.summary,
            content: content,
            author_name: result.author,
            published_at: result.published_date,
            image_url: screenshot || result.image_url,
            discovery_method: 'automated_search',
            extracted_category: analysis.category,
            extracted_verticals: analysis.verticals,
            extracted_agencies: analysis.agencies,
            extracted_providers: analysis.providers,
            extracted_opportunities: analysis.opportunities,
            ai_analysis: analysis,
            ai_confidence_score: analysis.relevance,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Failed to insert pending article: ${insertError.message}`);
        }

        // Mark result as processed
        await supabase.rpc('mark_result_processed', {
          result_id: result.id,
          pending_id: pendingArticle.id,
        });

        processedCount++;
        addedCount++;
        processingResults.push({
          resultId: result.id,
          url: result.source_url,
          processed: true,
          added: true,
        });

        console.log(`Successfully processed and added: ${result.source_url}`);

      } catch (resultError) {
        console.error(`Error processing result ${result.id}:`, resultError);
        errorCount++;

        // Mark as processed with error
        const errorMessage = resultError instanceof Error ? resultError.message : 'Unknown error';
        await supabase.rpc('mark_result_processed', {
          result_id: result.id,
          skip_reason_text: `Processing error: ${errorMessage}`,
        });

        processingResults.push({
          resultId: result.id,
          url: result.source_url,
          processed: true,
          added: false,
          error: errorMessage,
        });
      }
    }

    console.log(`Processing complete: ${processedCount} processed, ${addedCount} added, ${skippedCount} skipped, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        added: addedCount,
        skipped: skippedCount,
        errors: errorCount,
        results: processingResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-search-results:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
