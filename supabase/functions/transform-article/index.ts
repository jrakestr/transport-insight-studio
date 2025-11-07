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
      return new Response(
        JSON.stringify({ error: 'Content is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Transform article text into clean HTML paragraphs and lists. 

ABSOLUTELY FORBIDDEN - DO NOT OUTPUT:
- NO dates, timestamps, or <time> tags
- NO author names or bylines
- NO publication metadata
- NO source links or URLs of any kind
- NO <a> tags or href attributes
- NO wrapper divs or container elements

START IMMEDIATELY WITH CONTENT:
Your first line of output must be a <p class="mt-6"> paragraph tag.

ALLOWED ELEMENTS ONLY:
- Paragraphs: <p class="mt-6">[text with <strong class="font-semibold text-gray-900"> for names/companies]</p>
- H2 headings: <h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">[Section Title]</h2>
- H3 subheadings: <h3 class="mt-8 text-xl font-semibold text-gray-900">[Subsection]</h3>
- Lists: <ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
    <li class="flex gap-x-3">
      <svg class="mt-1 size-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" />
      </svg>
      <span>[text]</span>
    </li>
  </ul>

CRITICAL RULES:
- Start with <p class="mt-6"> immediately
- Bold transit agencies, companies, people with <strong class="font-semibold text-gray-900">
- NO links, NO URLs anywhere
- Output HTML only, no explanations

Transform this article:`;

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
          { role: 'user', content: content }
        ],
        temperature: 0.3,
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: 'AI credits exhausted. Please add funds to your workspace.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const transformedContent = data.choices?.[0]?.message?.content;

    if (!transformedContent) {
      throw new Error('No content returned from AI');
    }

    return new Response(
      JSON.stringify({ transformedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transform-article function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to transform article';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
