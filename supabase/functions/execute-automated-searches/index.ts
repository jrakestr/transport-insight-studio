import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const exaApiKey = Deno.env.get('EXA_API_KEY')!;

// Date configuration
const DATE_CONFIG = {
  mode: 'rolling', // 'rolling' or 'fixed'
  fixedMonth: '2025-11', // Only used if mode is 'fixed'
  defaultRange: 'past_month' // Default rolling range
};

interface SearchResult {
  id: string;
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  score: number;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
}

interface ExaSearchResponse {
  results: SearchResult[];
  autopromptString?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get optional parameters from request
    const { searchId, limit = 10 } = await req.json().catch(() => ({}));

    console.log('Starting automated search execution...', { searchId, limit });

    // Fetch searches that need to run
    let query = supabase
      .from('automated_searches')
      .select('*')
      .eq('is_active', true);

    if (searchId) {
      query = query.eq('id', searchId);
    } else {
      query = query.lte('next_run_at', new Date().toISOString());
    }

    const { data: searches, error: searchError } = await query.limit(limit);

    if (searchError) {
      throw new Error(`Failed to fetch searches: ${searchError.message}`);
    }

    if (!searches || searches.length === 0) {
      console.log('No searches to execute');
      return new Response(
        JSON.stringify({ message: 'No searches to execute', executed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${searches.length} searches to execute`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const search of searches) {
      try {
        console.log(`Executing search: ${search.id} - "${search.search_query}"`);

        // Prepare Exa API request
        const exaParams = {
          query: search.search_query,
          numResults: 10,
          type: 'auto', // or 'neural' or 'keyword' based on search_type
          useAutoprompt: true,
          contents: {
            text: { maxCharacters: 1000 },
            highlights: { numSentences: 3 }
          },
          ...search.search_parameters
        };

        // Add date filter based on configuration
        if (DATE_CONFIG.mode === 'fixed' && DATE_CONFIG.fixedMonth) {
          // Fixed month mode (e.g., November 2025)
          const [year, month] = DATE_CONFIG.fixedMonth.split('-');
          const startDate = new Date(`${year}-${month}-01`);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);
          exaParams.startPublishedDate = startDate.toISOString();
          exaParams.endPublishedDate = endDate.toISOString();
          console.log(`Using fixed date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        } else if (search.search_parameters?.date_range) {
          // Rolling date mode
          const dateRange = search.search_parameters.date_range;
          if (dateRange === 'past_week') {
            exaParams.startPublishedDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          } else if (dateRange === 'past_month') {
            exaParams.startPublishedDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          } else if (dateRange === 'past_year') {
            exaParams.startPublishedDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
          }
          console.log(`Using rolling date range: ${dateRange} from ${exaParams.startPublishedDate}`);
        }

        console.log('Calling Exa API with params:', JSON.stringify(exaParams, null, 2));

        // Call Exa API
        const exaResponse = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey,
          },
          body: JSON.stringify(exaParams),
        });

        if (!exaResponse.ok) {
          const errorText = await exaResponse.text();
          throw new Error(`Exa API error: ${exaResponse.status} - ${errorText}`);
        }

        const exaData: ExaSearchResponse = await exaResponse.json();
        console.log(`Exa returned ${exaData.results.length} results`);
        
        // Log full result structure for debugging
        if (exaData.results.length > 0) {
          console.log('Sample Exa result structure:', JSON.stringify(exaData.results[0], null, 2));
        }

        let newResults = 0;
        let duplicates = 0;
        let skipped = 0;

        // Process each result
        for (const result of exaData.results) {
          try {
            // Check for duplicates using the database function
            const { data: duplicateCheck } = await supabase
              .rpc('check_duplicate_url', { url_to_check: result.url });

            if (duplicateCheck && duplicateCheck.length > 0) {
              const existing = duplicateCheck[0];
              
              // If already exists for this search, skip
              if (existing.search_id === search.id) {
                console.log(`Duplicate for same search: ${result.url}`);
                duplicates++;
                continue;
              }

              // If exists for different search, create duplicate reference
              console.log(`Duplicate from different search: ${result.url}`);
              const { error: insertError } = await supabase
                .from('search_results')
                .insert({
                  automated_search_id: search.id,
                  source_url: result.url,
                  title: result.title,
                  duplicate_of: existing.result_id,
                  exa_id: result.id,
                  exa_score: result.score,
                  exa_metadata: {
                    highlights: result.highlights,
                    highlightScores: result.highlightScores,
                    text: result.text,
                  },
                  discovered_at: new Date().toISOString(),
                });

              if (insertError) {
                console.error('Error inserting duplicate reference:', insertError);
              }
              duplicates++;
              continue;
            }

            // Calculate relevance score with fallback logic
            let relevanceScore: number | null = null;
            let scoreSource = 'default';

            // Log the full result for debugging score issues
            console.log(`Processing result score - ID: ${result.id}, Score: ${result.score}, Type: ${typeof result.score}`);

            if (result.score !== null && result.score !== undefined && !isNaN(result.score)) {
              // Exa score available - normalize to 0-100
              if (result.score >= 0 && result.score <= 1) {
                relevanceScore = Math.min(100, Math.round(result.score * 100));
              } else if (result.score >= 0 && result.score <= 100) {
                relevanceScore = Math.round(result.score);
              } else {
                console.warn(`Unexpected score range: ${result.score}`);
                relevanceScore = 50; // Fallback default
              }
              scoreSource = 'exa_api';
            } else {
              // Fallback: Calculate based on keyword presence in title/text
              console.log('Exa score not available, using keyword-based scoring');
              const searchTerms = search.search_query.toLowerCase().split(' ').filter((t: string) => t.length > 3);
              const titleText = (result.title || '').toLowerCase();
              const contentText = (result.text || '').toLowerCase();
              
              let keywordCount = 0;
              for (const term of searchTerms) {
                if (titleText.includes(term)) keywordCount += 2; // Title matches worth more
                if (contentText.includes(term)) keywordCount += 1;
              }
              
              // Normalize to 0-100 scale
              relevanceScore = Math.min(100, Math.max(30, keywordCount * 10));
              scoreSource = 'calculated';
            }

            console.log(`Final relevance score: ${relevanceScore} (source: ${scoreSource})`);

            // Insert new result
            const { error: insertError } = await supabase
              .from('search_results')
              .insert({
                automated_search_id: search.id,
                source_url: result.url,
                title: result.title,
                description: result.text?.substring(0, 500),
                excerpt: result.highlights?.join(' '),
                author: result.author,
                published_date: result.publishedDate,
                exa_id: result.id,
                exa_score: result.score,
                relevance_score: relevanceScore,
                score_source: scoreSource,
                exa_metadata: {
                  highlights: result.highlights,
                  highlightScores: result.highlightScores,
                  autopromptString: exaData.autopromptString,
                },
                discovered_at: new Date().toISOString(),
              });

            if (insertError) {
              console.error('Error inserting search result:', insertError);
              skipped++;
            } else {
              newResults++;
            }
          } catch (resultError) {
            console.error('Error processing result:', resultError);
            skipped++;
          }
        }

        console.log(`Search ${search.id} results: ${newResults} new, ${duplicates} duplicates, ${skipped} skipped`);

        // Update search statistics using the database function
        await supabase.rpc('update_search_after_run', {
          search_id: search.id,
          success: true,
          result_count: newResults,
        });

        successCount++;
        results.push({
          searchId: search.id,
          query: search.search_query,
          newResults,
          duplicates,
          skipped,
          totalFound: exaData.results.length,
        });

      } catch (searchError) {
        console.error(`Error executing search ${search.id}:`, searchError);
        errorCount++;

        // Update search with error
        const errorMessage = searchError instanceof Error ? searchError.message : 'Unknown error';
        await supabase.rpc('update_search_after_run', {
          search_id: search.id,
          success: false,
          error_message: errorMessage,
        });

        results.push({
          searchId: search.id,
          query: search.search_query,
          error: errorMessage,
        });
      }
    }

    console.log(`Execution complete: ${successCount} successful, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        executed: searches.length,
        successful: successCount,
        errors: errorCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in execute-automated-searches:', error);
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
