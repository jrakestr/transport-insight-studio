import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    if (!content) {
      throw new Error('No content provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an HTML formatter for transit industry articles. Your ONLY job is to add HTML formatting tags to the provided article text.

CRITICAL RULES:
1. YOU MUST preserve 100% of the original article text - do not summarize, shorten, paraphrase, or rewrite ANY content
2. Only add HTML tags around the existing text - never change the text itself
3. Keep ALL numbers, statistics, quotes, names, and details exactly as written
4. Maintain ALL paragraphs, sections, and content structure from the original
5. If the article is long, output the ENTIRE article - never truncate or summarize

HTML FORMATTING GUIDELINES:
- Wrap the entire output in a <div class="bg-white rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
- Use <h2> tags with class="text-2xl font-bold text-gray-900 mb-4" for main section headers
- Use <h3> tags with class="text-xl font-semibold text-gray-800 mb-3 mt-6" for subsection headers
- Wrap paragraphs in <p> tags with class="text-gray-700 leading-relaxed mb-4"
- Bold important entities (agencies, companies, products, locations, events) using <strong class="font-semibold text-gray-900">
- Format bulleted lists as <ul class="list-disc pl-6 space-y-2 mb-4"> with <li class="text-gray-700">
- Format numbered lists as <ol class="list-decimal pl-6 space-y-2 mb-4"> with <li class="text-gray-700">
- Wrap statistics or key data in <span class="font-medium text-indigo-600">

Return ONLY the formatted HTML with no additional text, explanations, or markdown code blocks.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Format this article with HTML tags. Remember: preserve ALL original content exactly as written. Do not summarize or shorten anything.\n\n${content}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limits exceeded');
      }
      if (response.status === 402) {
        throw new Error('Payment required');
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    let transformedContent = data.choices[0].message.content;

    // Remove markdown code blocks if present
    transformedContent = transformedContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Transform successful, content length:', transformedContent.length);

    return new Response(
      JSON.stringify({ transformedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in transform-article:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
