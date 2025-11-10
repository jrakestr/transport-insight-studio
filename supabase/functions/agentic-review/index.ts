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
    const { messages } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    // Verify admin role
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: roleCheck } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');

    // Define tools for the AI agent
    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_pending_articles',
          description: 'Get list of pending articles awaiting review. Returns articles with AI-extracted entities.',
          parameters: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of articles to return (default 10)'
              },
              status: {
                type: 'string',
                enum: ['pending', 'needs_edit', 'approved', 'rejected'],
                description: 'Filter by review status'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'approve_article',
          description: 'Approve a pending article and publish it to the main articles table',
          parameters: {
            type: 'object',
            properties: {
              article_id: {
                type: 'string',
                description: 'UUID of the pending article'
              },
              notes: {
                type: 'string',
                description: 'Optional reviewer notes'
              }
            },
            required: ['article_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'reject_article',
          description: 'Reject a pending article',
          parameters: {
            type: 'object',
            properties: {
              article_id: {
                type: 'string',
                description: 'UUID of the pending article'
              },
              reason: {
                type: 'string',
                description: 'Reason for rejection'
              }
            },
            required: ['article_id', 'reason']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'search_web',
          description: 'Search the web using Exa neural search for additional context about agencies, providers, or RFPs',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query'
              },
              num_results: {
                type: 'number',
                description: 'Number of results (default 5)'
              }
            },
            required: ['query']
          }
        }
      }
    ];

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
            content: `You are an AI assistant helping review transit news articles for publication. You can:
- Show pending articles with AI-extracted entities
- Approve or reject articles
- Search the web for additional context using Exa
- Explain AI decisions and help editors verify information

Be concise and helpful. When showing articles, present them clearly with their extracted entities.`
          },
          ...messages
        ],
        tools: tools,
        tool_choice: 'auto'
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI request failed: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const message = aiData.choices[0].message;

    // Handle tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolResults = [];

      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        let result;

        switch (functionName) {
          case 'get_pending_articles': {
            const { data, error } = await supabaseClient
              .from('pending_articles')
              .select('*')
              .eq('review_status', args.status || 'pending')
              .order('discovered_at', { ascending: false })
              .limit(args.limit || 10);

            result = error ? { error: error.message } : { articles: data };
            break;
          }

          case 'approve_article': {
            // Get pending article
            const { data: pending, error: fetchError } = await supabaseClient
              .from('pending_articles')
              .select('*')
              .eq('id', args.article_id)
              .single();

            if (fetchError || !pending) {
              result = { error: 'Article not found' };
              break;
            }

            // Create published article
            const { data: article, error: insertError } = await supabaseClient
              .from('articles')
              .insert({
                title: pending.title,
                slug: pending.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: pending.description,
                content: pending.content,
                published_at: pending.published_at,
                source_url: pending.source_url,
                source_name: pending.source_name,
                image_url: pending.image_url,
                author_name: pending.author_name,
                author_role: pending.author_role,
                category: pending.extracted_category
              })
              .select()
              .single();

            if (insertError) {
              result = { error: insertError.message };
              break;
            }

            // Update pending article
            await supabaseClient
              .from('pending_articles')
              .update({
                review_status: 'approved',
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                reviewer_notes: args.notes,
                published_article_id: article.id
              })
              .eq('id', args.article_id);

            result = { success: true, article_id: article.id };
            break;
          }

          case 'reject_article': {
            const { error } = await supabaseClient
              .from('pending_articles')
              .update({
                review_status: 'rejected',
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                reviewer_notes: args.reason
              })
              .eq('id', args.article_id);

            result = error ? { error: error.message } : { success: true };
            break;
          }

          case 'search_web': {
            if (!EXA_API_KEY) {
              result = { error: 'Exa API key not configured' };
              break;
            }
            const exaResponse = await fetch('https://api.exa.ai/search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': EXA_API_KEY,
              },
              body: JSON.stringify({
                query: args.query,
                numResults: args.num_results || 5,
                useAutoprompt: true,
                contents: { text: true }
              }),
            });

            if (exaResponse.ok) {
              const exaData = await exaResponse.json();
              result = { results: exaData.results };
            } else {
              result = { error: 'Search failed' };
            }
            break;
          }

          default:
            result = { error: 'Unknown function' };
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(result)
        });
      }

      return new Response(
        JSON.stringify({
          message: message,
          tool_results: toolResults
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Agentic review error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
