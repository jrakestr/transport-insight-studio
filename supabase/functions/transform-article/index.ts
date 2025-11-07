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

    const systemPrompt = `You are an HTML formatter for transit industry articles. Transform the article text into structured HTML while preserving 100% of the original content.

CRITICAL: Preserve every word, number, statistic, and detail exactly as written. Do not summarize or shorten.

HTML STRUCTURE:
- Main paragraphs: <p class="mt-6 text-gray-600">content</p>
- H2 headers: <h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Header Text</h2>
- Bold entities (agencies, companies, products, locations): <strong class="font-semibold text-gray-900">Entity Name</strong>
- Bulleted lists with icons:
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span>List item text</span>
</li>
</ul>

FORMATTING RULES:
1. Bold ALL agency names, company names, product names, locations, and events
2. Use H2 tags for major section headers
3. Convert bullet lists to styled lists with SVG icons
4. Preserve all statistics, quotes, and technical details exactly
5. Do not add H1 tags - only H2 and H3

Return ONLY the formatted HTML with no markdown code blocks or explanations.`;

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
          { role: 'user', content: `Format this article with structured HTML. Preserve ALL content exactly - no summarizing.\n\n${content}` }
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
