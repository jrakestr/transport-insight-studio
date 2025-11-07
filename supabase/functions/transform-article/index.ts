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

    const systemPrompt = `Transform this article into formatted HTML. Preserve EVERY WORD - do not summarize.

EXACT FORMAT RULES:

1. PARAGRAPHS - Wrap every paragraph in:
<p class="mt-6 text-gray-600">paragraph text here</p>

2. SECTION HEADERS - Convert section titles to H2:
<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Section Title</h2>

3. ENTITY BOLDING - Wrap these in <strong class="font-semibold text-gray-900">:
   - Agency names (Kansas City Area Transportation Authority, KCATA, MARTA, etc.)
   - Location names (Kansas City, Texas, Atlanta, etc.)
   - Event names (2026 FIFA World Cup, Olympics, etc.)
   - People names (Denise Adams, etc.)
   - Product/system names

4. BULLETED LISTS - Convert to this EXACT structure:
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span>Bullet point text</span>
</li>
</ul>

Return ONLY formatted HTML. No explanations. No code blocks.`;



    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
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
