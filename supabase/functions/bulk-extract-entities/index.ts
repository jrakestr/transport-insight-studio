import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Get all articles that have content
    const { data: articles, error: articlesError } = await supabaseClient
      .from('articles')
      .select('id, title, content')
      .not('content', 'is', null);

    if (articlesError) throw articlesError;

    console.log(`Processing ${articles?.length || 0} articles`);

    const results = {
      processed: 0,
      agenciesCreated: 0,
      providersCreated: 0,
      errors: [] as string[]
    };

    for (const article of articles || []) {
      try {
        console.log(`Processing article: ${article.title}`);

        // Extract entities using AI
        const extractionPrompt = `Extract transit agencies, transportation providers, industry verticals, and article categories from this content. Return ONLY valid JSON.

Industry verticals (transit sectors): paratransit, corporate-shuttles, school, healthcare, government, fixed-route
Article categories (topics): Funding, RFPs & Procurement, Technology Partnerships, Safety & Security, Technology, Market Trends, Microtransit, Government

Article content:
${article.content}

Return format (categories should be an array of ALL relevant categories):
{
  "agencies": [{"name": "Agency Name", "location": "City, State", "notes": "relevant details"}],
  "providers": [{"name": "Provider Name", "location": "City, State", "provider_type": "technology/service", "notes": "relevant details"}],
  "verticals": ["paratransit", "fixed-route"],
  "categories": ["Technology", "RFPs & Procurement"]
}`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a data extraction assistant. Return only valid JSON." },
              { role: "user", content: extractionPrompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          console.error(`No JSON found for article ${article.id}`);
          continue;
        }

        const extracted = JSON.parse(jsonMatch[0]);
        const agencyIds: string[] = [];
        const providerIds: string[] = [];
        const verticals: string[] = extracted.verticals || [];
        const categories: string[] = extracted.categories || [];

        // Delete existing article categories
        await supabaseClient
          .from('article_categories')
          .delete()
          .eq('article_id', article.id);

        // Insert new categories
        if (categories.length > 0) {
          const categoryInserts = categories.map(cat => ({
            article_id: article.id,
            category: cat
          }));
          
          await supabaseClient
            .from('article_categories')
            .insert(categoryInserts);
        }

        // Process agencies
        if (extracted.agencies?.length > 0) {
          for (const agency of extracted.agencies) {
            const { data: existing } = await supabaseClient
              .from('transit_agencies')
              .select('id')
              .ilike('name', agency.name)
              .single();

            if (existing) {
              agencyIds.push(existing.id);
            } else {
              const { data: newAgency, error } = await supabaseClient
                .from('transit_agencies')
                .insert({
                  name: agency.name,
                  location: agency.location || null,
                  notes: agency.notes || null
                })
                .select('id')
                .single();

              if (!error && newAgency) {
                agencyIds.push(newAgency.id);
                results.agenciesCreated++;
              }
            }
          }
        }

        // Process providers
        if (extracted.providers?.length > 0) {
          for (const provider of extracted.providers) {
            const { data: existing } = await supabaseClient
              .from('transportation_providers')
              .select('id')
              .ilike('name', provider.name)
              .single();

            if (existing) {
              providerIds.push(existing.id);
            } else {
              const { data: newProvider, error } = await supabaseClient
                .from('transportation_providers')
                .insert({
                  name: provider.name,
                  location: provider.location || null,
                  provider_type: provider.provider_type || null,
                  notes: provider.notes || null
                })
                .select('id')
                .single();

              if (!error && newProvider) {
                providerIds.push(newProvider.id);
                results.providersCreated++;
              }
            }
          }
        }

        // Link agencies to article
        if (agencyIds.length > 0) {
          // Delete existing links
          await supabaseClient
            .from('article_agencies')
            .delete()
            .eq('article_id', article.id);

          // Create new links
          await supabaseClient
            .from('article_agencies')
            .insert(agencyIds.map(id => ({ article_id: article.id, agency_id: id })));
        }

        // Link providers to article
        if (providerIds.length > 0) {
          // Delete existing links
          await supabaseClient
            .from('article_providers')
            .delete()
            .eq('article_id', article.id);

          // Create new links
          await supabaseClient
            .from('article_providers')
            .insert(providerIds.map(id => ({ article_id: article.id, provider_id: id })));
        }

        // Link verticals to article
        if (verticals.length > 0) {
          // Delete existing links
          await supabaseClient
            .from('article_verticals')
            .delete()
            .eq('article_id', article.id);

          // Create new links
          await supabaseClient
            .from('article_verticals')
            .insert(verticals.map(v => ({ article_id: article.id, vertical: v })));
        }

        results.processed++;
        console.log(`✓ Processed ${article.title}: ${agencyIds.length} agencies, ${providerIds.length} providers, ${verticals.length} verticals`);

      } catch (error: any) {
        console.error(`Error processing article ${article.id}:`, error.message);
        results.errors.push(`${article.title}: ${error.message}`);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Bulk extraction error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
