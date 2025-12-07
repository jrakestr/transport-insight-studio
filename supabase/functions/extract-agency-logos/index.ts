import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Agency {
  id: string;
  agency_name: string;
  url: string | null;
  total_voms: number | null;
}

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

async function extractLogoFromWebsite(url: string, firecrawlKey: string): Promise<string | null> {
  try {
    const domain = extractDomain(url);
    if (!domain) return null;

    console.log(`Extracting branding from: ${url}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['branding'],
        onlyMainContent: false,
        waitFor: 2000,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl error for ${url}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Extract logo from branding data
    const branding = data?.data?.branding;
    if (branding?.logo) {
      console.log(`Found logo for ${url}: ${branding.logo}`);
      return branding.logo;
    }
    
    // Try images.logo as fallback
    if (branding?.images?.logo) {
      console.log(`Found logo in images for ${url}: ${branding.images.logo}`);
      return branding.images.logo;
    }

    console.log(`No logo found for ${url}`);
    return null;
  } catch (error) {
    console.error(`Error extracting logo from ${url}:`, error);
    return null;
  }
}

async function processAgencyBatch(
  agencies: Agency[],
  supabase: any,
  firecrawlKey: string
): Promise<{ processed: number; updated: number; errors: number }> {
  let processed = 0;
  let updated = 0;
  let errors = 0;

  for (const agency of agencies) {
    processed++;
    
    if (!agency.url) {
      console.log(`Skipping ${agency.agency_name}: no URL`);
      continue;
    }

    try {
      const logoUrl = await extractLogoFromWebsite(agency.url, firecrawlKey);
      
      if (logoUrl) {
        const { error } = await supabase
          .from('transit_agencies')
          .update({ logo_url: logoUrl })
          .eq('id', agency.id);

        if (error) {
          console.error(`Failed to update ${agency.agency_name}:`, error);
          errors++;
        } else {
          console.log(`Updated logo for ${agency.agency_name}`);
          updated++;
        }
      }
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${agency.agency_name}:`, error);
      errors++;
    }
  }

  return { processed, updated, errors };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { offset = 0, limit = 100 } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch agencies ordered by size (total_voms), excluding those with logos
    const { data: agencies, error: fetchError } = await supabase
      .from('transit_agencies')
      .select('id, agency_name, url, total_voms')
      .is('logo_url', null)
      .not('url', 'is', null)
      .order('total_voms', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching agencies:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch agencies', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!agencies || agencies.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No more agencies to process',
          offset,
          processed: 0,
          updated: 0,
          errors: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${agencies.length} agencies starting at offset ${offset}`);
    console.log(`First agency: ${agencies[0].agency_name} (VOMS: ${agencies[0].total_voms})`);

    // Process the batch
    const results = await processAgencyBatch(agencies, supabase, firecrawlKey);

    return new Response(
      JSON.stringify({
        message: `Processed batch starting at offset ${offset}`,
        offset,
        limit,
        nextOffset: offset + limit,
        agenciesInBatch: agencies.length,
        ...results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
