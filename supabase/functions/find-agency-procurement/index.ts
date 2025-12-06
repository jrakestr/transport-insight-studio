import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const exaApiKey = Deno.env.get('EXA_API_KEY')!;

interface ExaResult {
  id: string;
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  score: number;
  text?: string;
  highlights?: string[];
}

interface ExaSearchResponse {
  results: ExaResult[];
  autopromptString?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { agencyId } = await req.json();

    if (!agencyId) {
      return new Response(
        JSON.stringify({ error: 'agencyId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch agency details
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

    console.log(`Finding procurement for: ${agency.agency_name} (${agency.city}, ${agency.state})`);

    // Build search query using city/state, NOT domain-constrained
    // The insight: search the open web for "{city} {state} transit rfp solicitations"
    const cityName = agency.city || agency.uza_name?.split(',')[0] || '';
    const stateName = agency.state || '';
    const agencyShortName = agency.doing_business_as || agency.agency_name;

    // Primary query: location + transit + procurement terms
    const primaryQuery = `${cityName} ${stateName} transit rfp solicitations bids procurement`;
    
    // Secondary query: agency name + procurement terms (catches BidNet listings)
    const secondaryQuery = `"${agencyShortName}" rfp bid solicitation procurement`;

    console.log('Primary query:', primaryQuery);
    console.log('Secondary query:', secondaryQuery);

    const allResults: ExaResult[] = [];

    // Execute both queries
    for (const query of [primaryQuery, secondaryQuery]) {
      try {
        const exaResponse = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey,
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
            // Look for recent and historical - procurement pages can be evergreen
            startPublishedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        });

        if (!exaResponse.ok) {
          const errorText = await exaResponse.text();
          console.error(`Exa API error for query "${query}":`, errorText);
          continue;
        }

        const exaData: ExaSearchResponse = await exaResponse.json();
        console.log(`Query "${query.substring(0, 50)}..." returned ${exaData.results.length} results`);
        
        allResults.push(...exaData.results);
      } catch (queryError) {
        console.error(`Error executing query "${query}":`, queryError);
      }
    }

    // Deduplicate by URL
    const seenUrls = new Set<string>();
    const uniqueResults = allResults.filter(r => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    });

    console.log(`Total unique results: ${uniqueResults.length}`);

    // Categorize results by source type
    const categorized = uniqueResults.map(result => {
      const url = result.url.toLowerCase();
      let sourceType = 'unknown';
      
      // Known procurement portals
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
      else if (url.includes(agency.city?.toLowerCase() || 'NOMATCH')) sourceType = 'city_website';
      else sourceType = 'other';

      // Check if URL path contains procurement indicators
      const pathIndicators = ['procurement', 'rfp', 'bid', 'solicitation', 'vendor', 'contract', 'purchasing'];
      const hasPathIndicator = pathIndicators.some(ind => url.includes(ind));

      return {
        ...result,
        sourceType,
        hasPathIndicator,
        // Boost score for portal sites and path indicators
        adjustedScore: result.score * 
          (sourceType !== 'unknown' && sourceType !== 'other' ? 1.2 : 1.0) *
          (hasPathIndicator ? 1.1 : 1.0)
      };
    });

    // Sort by adjusted score
    categorized.sort((a, b) => b.adjustedScore - a.adjustedScore);

    // Return top results for human review
    const response = {
      agency: {
        id: agency.id,
        name: agency.agency_name,
        city: agency.city,
        state: agency.state,
      },
      queriesUsed: [primaryQuery, secondaryQuery],
      resultsFound: categorized.length,
      results: categorized.slice(0, 15).map(r => ({
        title: r.title,
        url: r.url,
        sourceType: r.sourceType,
        hasPathIndicator: r.hasPathIndicator,
        score: r.score,
        adjustedScore: r.adjustedScore,
        snippet: r.text?.substring(0, 500),
        highlights: r.highlights,
      })),
    };

    console.log('Returning results:', JSON.stringify(response, null, 2));

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in find-agency-procurement:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
