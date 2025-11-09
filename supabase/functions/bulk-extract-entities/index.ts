import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function processArticle(articleId: string, supabaseClient: any, LOVABLE_API_KEY: string) {
  try {
    // Mark as processing
    await supabaseClient
      .from('article_processing_status')
      .upsert({
        article_id: articleId,
        status: 'processing',
        last_processed_at: new Date().toISOString()
      });

    // Get article data
    const { data: article, error: articleError } = await supabaseClient
      .from('articles')
      .select('id, title, content')
      .eq('id', articleId)
      .single();

    if (articleError || !article?.content) {
      throw new Error('Article not found or has no content');
    }

    console.log(`Processing article: ${article.title}`);

    // Extract entities using AI with tool calling for website fetching
    const extractionPrompt = `Extract transit agencies, transportation providers, industry verticals, and article categories from this content.

Industry verticals (transit sectors): paratransit, corporate-shuttles, school, healthcare, government, fixed-route
Article categories (topics): Funding, RFPs & Procurement, Technology Partnerships, Safety & Security, Technology, Market Trends, Microtransit, Government

CRITICAL INSTRUCTIONS FOR PROVIDERS:
- Extract the provider's official company name
- If a provider website is mentioned in the article, use the fetch_provider_website tool to get their official business description
- In "notes", describe what the provider's core business actually is based on their official identity
- Focus on their primary product or service offering (e.g., "paratransit contract operator", "transit scheduling software provider", "electric bus manufacturer", "fare payment technology vendor")
- DO NOT describe why they were mentioned in this article
- DO NOT describe projects they're working on
- Describe what the company fundamentally does as their business

Article content:
${article.content}

Return format (categories should be an array of ALL relevant categories):
{
  "agencies": [{"name": "Agency Name", "location": "City, State", "notes": "relevant details"}],
  "providers": [{"name": "Official Provider Name", "location": "City, State", "provider_type": "technology/service", "notes": "Core business: what this company actually does as their primary offering"}],
  "verticals": ["paratransit", "fixed-route"],
  "categories": ["Technology", "RFPs & Procurement"]
}`;

    // Initial AI call with tools enabled
    let messages = [
      { role: "system", content: "You are a data extraction assistant. Use the fetch_provider_website tool when provider websites are mentioned to get accurate business descriptions. After gathering all information, return only valid JSON." },
      { role: "user", content: extractionPrompt }
    ];

    const tools = [{
      type: "function",
      function: {
        name: "fetch_provider_website",
        description: "Fetch a transportation provider's official website to determine their actual core business and service offerings. Use this when you find a provider mentioned with a website URL.",
        parameters: {
          type: "object",
          properties: {
            provider_name: {
              type: "string",
              description: "The name of the provider"
            },
            website_url: {
              type: "string",
              description: "The provider's website URL"
            }
          },
          required: ["provider_name", "website_url"]
        }
      }
    }];

    let maxIterations = 5;
    let iteration = 0;
    let extracted = null;

    while (iteration < maxIterations) {
      iteration++;
      
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          tools,
          tool_choice: iteration === 1 ? "auto" : "auto"
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const message = aiData.choices[0].message;
      
      // Add assistant's response to conversation
      messages.push(message);

      // Check if AI wants to use tools
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(`AI requesting ${message.tool_calls.length} website fetches`);
        
        // Execute all tool calls
        for (const toolCall of message.tool_calls) {
          if (toolCall.function.name === "fetch_provider_website") {
            const args = JSON.parse(toolCall.function.arguments);
            console.log(`Fetching website for ${args.provider_name}: ${args.website_url}`);
            
            try {
              // Fetch the website
              const websiteResponse = await fetch(args.website_url, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; TransitBot/1.0)'
                }
              });
              
              let websiteContent = "Website could not be fetched";
              if (websiteResponse.ok) {
                const html = await websiteResponse.text();
                // Extract text content from HTML (basic extraction)
                const textContent = html
                  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim()
                  .substring(0, 2000); // Limit to first 2000 chars
                
                websiteContent = `Website content for ${args.provider_name}: ${textContent}`;
              }
              
              // Add tool result to conversation
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: websiteContent
              } as any);
              
            } catch (error) {
              console.error(`Error fetching ${args.website_url}:`, error);
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: `Could not fetch website for ${args.provider_name}`
              } as any);
            }
          }
        }
        
        // Continue conversation loop to let AI process tool results
        continue;
      }

      // No more tool calls - extract final JSON response
      const content = message.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extracted = JSON.parse(jsonMatch[0]);
          break;
        }
      }
      
      // If we get here without extracted data, something went wrong
      if (iteration === maxIterations) {
        throw new Error('Max iterations reached without valid JSON response');
      }
    }

    if (!extracted) {
      throw new Error('No valid extraction data produced');
    }
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

    // Process agencies - match against imported database
    if (extracted.agencies?.length > 0) {
      for (const agency of extracted.agencies) {
        // Try multi-field matching with confidence scoring
        let matchedAgency = null;
        let matchType = 'no_match';
        
        // 1. Try exact NTD ID match (highest confidence)
        if (agency.ntd_id) {
          const { data: ntdMatch } = await supabaseClient
            .from('transit_agencies')
            .select('id')
            .eq('ntd_id', agency.ntd_id)
            .maybeSingle();
          
          if (ntdMatch) {
            matchedAgency = ntdMatch;
            matchType = 'exact_ntd_id';
          }
        }
        
        // 2. Try exact agency_name match
        if (!matchedAgency) {
          const { data: nameMatch } = await supabaseClient
            .from('transit_agencies')
            .select('id')
            .ilike('agency_name', agency.name)
            .maybeSingle();
          
          if (nameMatch) {
            matchedAgency = nameMatch;
            matchType = 'exact_name';
          }
        }
        
        // 3. Try doing_business_as match
        if (!matchedAgency) {
          const { data: dbaMatch } = await supabaseClient
            .from('transit_agencies')
            .select('id')
            .ilike('doing_business_as', agency.name)
            .maybeSingle();
          
          if (dbaMatch) {
            matchedAgency = dbaMatch;
            matchType = 'dba_match';
          }
        }
        
        // 4. Try fuzzy match with location
        if (!matchedAgency && agency.location) {
          const locationParts = agency.location.split(',').map((p: string) => p.trim());
          if (locationParts.length >= 2) {
            const city = locationParts[0];
            const state = locationParts[1];
            
            const { data: locationMatches } = await supabaseClient
              .from('transit_agencies')
              .select('id, agency_name')
              .ilike('city', city)
              .ilike('state', state)
              .limit(10);
            
            // Fuzzy match agency names in same location
            if (locationMatches && locationMatches.length > 0) {
              for (const candidate of locationMatches) {
                const similarity = calculateSimilarity(
                  agency.name.toLowerCase(),
                  candidate.agency_name.toLowerCase()
                );
                
                if (similarity > 0.8) {
                  matchedAgency = candidate;
                  matchType = 'fuzzy_location';
                  break;
                }
              }
            }
          }
        }

        if (matchedAgency) {
          agencyIds.push(matchedAgency.id);
          console.log(`✓ Matched "${agency.name}" via ${matchType}`);
        } else {
          console.log(`✗ No match for "${agency.name}" ${agency.location || ''}`);
          // Store as unmatched for manual review
          matchType = 'unmatched';
        }
      }
    }

    // Helper function for fuzzy string matching
    function calculateSimilarity(str1: string, str2: string): number {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;
      
      if (longer.length === 0) return 1.0;
      
      const editDistance = levenshteinDistance(longer, shorter);
      return (longer.length - editDistance) / longer.length;
    }

    function levenshteinDistance(str1: string, str2: string): number {
      const matrix: number[][] = [];
      
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      
      return matrix[str2.length][str1.length];
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
          }
        }
      }
    }

    // Link agencies to article
    if (agencyIds.length > 0) {
      await supabaseClient
        .from('article_agencies')
        .delete()
        .eq('article_id', article.id);

      await supabaseClient
        .from('article_agencies')
        .insert(agencyIds.map(id => ({ article_id: article.id, agency_id: id })));
    }

    // Link providers to article
    if (providerIds.length > 0) {
      await supabaseClient
        .from('article_providers')
        .delete()
        .eq('article_id', article.id);

      await supabaseClient
        .from('article_providers')
        .insert(providerIds.map(id => ({ article_id: article.id, provider_id: id })));
    }

    // Link verticals to article
    if (verticals.length > 0) {
      await supabaseClient
        .from('article_verticals')
        .delete()
        .eq('article_id', article.id);

      await supabaseClient
        .from('article_verticals')
        .insert(verticals.map(v => ({ article_id: article.id, vertical: v })));
    }

    // Mark as completed
    await supabaseClient
      .from('article_processing_status')
      .upsert({
        article_id: articleId,
        status: 'completed',
        last_processed_at: new Date().toISOString(),
        error_message: null
      });

    console.log(`✓ Completed ${article.title}: ${agencyIds.length} agencies, ${providerIds.length} providers, ${verticals.length} verticals, ${categories.length} categories`);
    
    return {
      success: true,
      agenciesCreated: agencyIds.length,
      providersCreated: providerIds.length
    };

  } catch (error: any) {
    console.error(`Error processing article ${articleId}:`, error.message);
    
    // Mark as failed
    await supabaseClient
      .from('article_processing_status')
      .upsert({
        article_id: articleId,
        status: 'failed',
        last_processed_at: new Date().toISOString(),
        error_message: error.message
      });

    return { success: false, error: error.message };
  }
}

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

    // Get all articles that need processing
    const { data: articles, error: articlesError } = await supabaseClient
      .from('articles')
      .select('id, title')
      .not('content', 'is', null);

    if (articlesError) throw articlesError;

    console.log(`Found ${articles?.length || 0} articles to process`);

    // Initialize status for all articles
    for (const article of articles || []) {
      await supabaseClient
        .from('article_processing_status')
        .upsert({
          article_id: article.id,
          status: 'pending'
        }, {
          onConflict: 'article_id',
          ignoreDuplicates: false
        });
    }

    // Process articles in background
    const processingPromises = (articles || []).map(article => 
      processArticle(article.id, supabaseClient, LOVABLE_API_KEY)
    );

    // Use background task to not block response
    const EdgeRuntime = (globalThis as any).EdgeRuntime;
    EdgeRuntime?.waitUntil(
      Promise.all(processingPromises).then(results => {
        const summary = results.reduce((acc, r) => ({
          processed: acc.processed + (r.success ? 1 : 0),
          failed: acc.failed + (r.success ? 0 : 1),
          agenciesCreated: acc.agenciesCreated + (r.agenciesCreated || 0),
          providersCreated: acc.providersCreated + (r.providersCreated || 0)
        }), { processed: 0, failed: 0, agenciesCreated: 0, providersCreated: 0 });
        
        console.log('Processing complete:', summary);
      })
    );

    // Return immediately
    return new Response(JSON.stringify({
      message: 'Processing started in background',
      totalArticles: articles?.length || 0
    }), {
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
