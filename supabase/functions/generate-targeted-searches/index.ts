import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Content filters - exclude rail/train, focus on bus and paratransit
const EXCLUDE_TERMS = 'NOT (rail OR train OR subway OR metro OR "light rail" OR streetcar OR tram OR locomotive OR railcar OR "commuter rail")';
const FOCUS_TERMS = '(bus OR paratransit OR NEMT OR "fixed-route" OR "demand response" OR "dial-a-ride" OR microtransit)';

interface GeneratedSearch {
  search_type: 'agency' | 'provider' | 'keyword' | 'rfp' | 'vertical' | 'relationship';
  search_query: string;
  search_parameters: Record<string, any>;
  agency_id?: string;
  provider_id?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'hourly' | 'daily' | 'weekly';
  tags: string[];
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const generatedSearches: GeneratedSearch[] = [];

    console.log('Starting to generate targeted searches...');

    // 1. AGENCY-BASED SEARCHES
    const { data: agencies, error: agenciesError } = await supabase
      .from('transit_agencies')
      .select('id, agency_name, city, state, ntd_id, doing_business_as')
      .order('total_voms', { ascending: false, nullsFirst: false })
      .limit(100);

    if (agenciesError) {
      console.error('Error fetching agencies:', agenciesError);
    } else if (agencies) {
      console.log(`Generating searches for ${agencies.length} agencies`);
      
      for (const agency of agencies) {
        const displayName = agency.doing_business_as || agency.agency_name;
        
        // General news search
        generatedSearches.push({
          search_type: 'agency',
          search_query: `"${displayName}" ${FOCUS_TERMS} (news OR announcement OR contract) ${EXCLUDE_TERMS}`,
          search_parameters: {
            location: agency.city && agency.state ? `${agency.city}, ${agency.state}` : null,
            date_range: 'past_month',
          },
          agency_id: agency.id,
          priority: 'medium',
          frequency: 'daily',
          tags: ['agency-news', 'general'],
          notes: `General news for ${displayName}`,
        });

        // RFP/Contract awards search
        generatedSearches.push({
          search_type: 'agency',
          search_query: `"${displayName}" ${FOCUS_TERMS} (RFP OR "request for proposals" OR "contract award" OR procurement) ${EXCLUDE_TERMS}`,
          search_parameters: {
            location: agency.city && agency.state ? `${agency.city}, ${agency.state}` : null,
            date_range: 'past_week',
          },
          agency_id: agency.id,
          priority: 'high',
          frequency: 'daily',
          tags: ['rfp', 'procurement', 'contract'],
          notes: `RFP and contract tracking for ${displayName}`,
        });
      }
    }

    // 2. PROVIDER-BASED SEARCHES
    const { data: providers, error: providersError } = await supabase
      .from('service_providers')
      .select('id, name, provider_type, city, state')
      .not('provider_type', 'is', null)
      .limit(50);

    if (providersError) {
      console.error('Error fetching providers:', providersError);
    } else if (providers) {
      console.log(`Generating searches for ${providers.length} providers`);
      
      for (const provider of providers) {
        // Provider contract news
        generatedSearches.push({
          search_type: 'provider',
          search_query: `"${provider.name}" ${FOCUS_TERMS} (contract OR partnership OR agreement OR service) ${EXCLUDE_TERMS}`,
          search_parameters: {
            provider_type: provider.provider_type,
            date_range: 'past_month',
          },
          provider_id: provider.id,
          priority: 'medium',
          frequency: 'weekly',
          tags: ['provider-news', 'contracts'],
          notes: `Contract tracking for ${provider.name}`,
        });
      }
    }

    // 3. VERTICAL-SPECIFIC SEARCHES
    const verticals = [
      { name: 'Electric Buses', query: `("electric bus" OR "zero emission" OR "battery electric") (procurement OR deployment OR contract) ${EXCLUDE_TERMS}`, priority: 'high' },
      { name: 'Microtransit', query: `microtransit (launch OR expand OR contract OR RFP) ${EXCLUDE_TERMS}`, priority: 'high' },
      { name: 'Paratransit', query: `paratransit (service OR contract OR RFP OR accessibility) ${EXCLUDE_TERMS}`, priority: 'high' },
      { name: 'NEMT', query: `(NEMT OR "non-emergency medical transportation") (contract OR RFP OR service) ${EXCLUDE_TERMS}`, priority: 'high' },
      { name: 'Fixed-Route Bus', query: `"fixed-route" bus (service OR contract OR RFP OR expansion) ${EXCLUDE_TERMS}`, priority: 'high' },
      { name: 'Autonomous Buses', query: `(autonomous OR "self-driving") (bus OR shuttle) (pilot OR deployment OR contract) ${EXCLUDE_TERMS}`, priority: 'medium' },
      { name: 'Fare Collection', query: `("fare collection" OR "contactless payment" OR "mobile ticketing") bus (deployment OR upgrade OR RFP) ${EXCLUDE_TERMS}`, priority: 'medium' },
      { name: 'Real-Time Information', query: `("real-time" OR "passenger information") bus (system OR deployment OR contract) ${EXCLUDE_TERMS}`, priority: 'low' },
    ];

    console.log(`Generating ${verticals.length} vertical-specific searches`);
    
    for (const vertical of verticals) {
      generatedSearches.push({
        search_type: 'vertical',
        search_query: vertical.query,
        search_parameters: {
          vertical: vertical.name,
          date_range: 'past_week',
        },
        priority: vertical.priority as 'low' | 'medium' | 'high',
        frequency: 'daily',
        tags: ['vertical', vertical.name.toLowerCase().replace(/\s+/g, '-')],
        notes: `${vertical.name} industry tracking`,
      });
    }

    // 4. RFP-FOCUSED SEARCHES
    const rfpSearches = [
      { query: `(RFP OR "request for proposals") ${FOCUS_TERMS} ${EXCLUDE_TERMS}`, tags: ['rfp', 'bus-service'] },
      { query: `(RFP OR "request for proposals") ${FOCUS_TERMS} ("maintenance services" OR "vehicle maintenance") ${EXCLUDE_TERMS}`, tags: ['rfp', 'maintenance'] },
      { query: `(RFP OR "request for proposals") paratransit ${EXCLUDE_TERMS}`, tags: ['rfp', 'paratransit'] },
      { query: `(RFP OR "request for proposals") NEMT ${EXCLUDE_TERMS}`, tags: ['rfp', 'nemt'] },
    ];

    console.log(`Generating ${rfpSearches.length} RFP-focused searches`);
    
    for (const rfp of rfpSearches) {
      generatedSearches.push({
        search_type: 'rfp',
        search_query: rfp.query,
        search_parameters: {
          document_types: ['rfp', 'rfq', 'bid'],
          date_range: 'past_week',
        },
        priority: 'critical',
        frequency: 'daily',
        tags: rfp.tags,
        notes: 'High-priority RFP tracking',
      });
    }

    // 5. RELATIONSHIP/PARTNERSHIP SEARCHES
    generatedSearches.push({
      search_type: 'relationship',
      search_query: `${FOCUS_TERMS} (partnership OR collaboration OR joint venture OR MOU) announcement ${EXCLUDE_TERMS}`,
      search_parameters: {
        date_range: 'past_week',
      },
      priority: 'medium',
      frequency: 'weekly',
      tags: ['partnerships', 'relationships'],
      notes: 'Track new partnerships and collaborations',
    });

    console.log(`Generated ${generatedSearches.length} total searches`);

    // Insert searches into database (upsert to avoid duplicates)
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const search of generatedSearches) {
      // Check if similar search already exists
      let existingSearch = null;
      
      if (search.agency_id) {
        const { data } = await supabase
          .from('automated_searches')
          .select('id')
          .eq('agency_id', search.agency_id)
          .eq('search_type', search.search_type)
          .ilike('search_query', `%${search.search_query.substring(0, 50)}%`)
          .maybeSingle();
        existingSearch = data;
      } else if (search.provider_id) {
        const { data } = await supabase
          .from('automated_searches')
          .select('id')
          .eq('provider_id', search.provider_id)
          .eq('search_type', search.search_type)
          .ilike('search_query', `%${search.search_query.substring(0, 50)}%`)
          .maybeSingle();
        existingSearch = data;
      } else {
        const { data } = await supabase
          .from('automated_searches')
          .select('id')
          .eq('search_type', search.search_type)
          .eq('search_query', search.search_query)
          .maybeSingle();
        existingSearch = data;
      }

      if (existingSearch) {
        // Update existing search
        const { error: updateError } = await supabase
          .from('automated_searches')
          .update({
            search_parameters: search.search_parameters,
            priority: search.priority,
            frequency: search.frequency,
            tags: search.tags,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSearch.id);

        if (updateError) {
          console.error('Error updating search:', updateError);
          errors++;
        } else {
          updated++;
        }
      } else {
        // Insert new search
        const { error: insertError } = await supabase
          .from('automated_searches')
          .insert({
            ...search,
            created_by: user.id,
          });

        if (insertError) {
          console.error('Error inserting search:', insertError);
          errors++;
        } else {
          inserted++;
        }
      }
    }

    console.log(`Completed: ${inserted} inserted, ${updated} updated, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        generated: generatedSearches.length,
        inserted,
        updated,
        errors,
        breakdown: {
          agencies: agencies?.length || 0,
          providers: providers?.length || 0,
          verticals: verticals.length,
          rfp: rfpSearches.length,
          relationships: 1,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-targeted-searches:', error);
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
