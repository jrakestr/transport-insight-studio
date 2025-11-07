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
    const { content, includeVendorSearch } = await req.json();
    
    if (!content) {
      throw new Error('No content provided');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Optional: Add vendor context from web search if requested
    let vendorContext = "";
    if (includeVendorSearch) {
      // This would require additional implementation for web search
      // For now, we'll rely on the AI to extract vendor info from the article content
      vendorContext = "\n\nIMPORTANT: Search the article content carefully for any vendor, provider, or company names involved in this project and include them prominently in your output.";
    }

    const systemPrompt = `You transform raw transit industry news into structured HTML with B2B sales intelligence analysis.

STRUCTURE (5 sections):

1. OPENING PARAGRAPH
- 2-3 sentences presenting factual developments
- Include: Agency name, location, specific action, scale metrics, technology change
- **CRITICAL**: If vendor/provider information is available, include it prominently in this section

2. VENDOR IDENTIFICATION (if available)
<p class="mt-6 text-gray-600"><strong class="font-semibold text-gray-900">Primary Vendor:</strong> [Company name and brief description of their role]</p>

3. STRATEGIC CONTEXT
- Operational systems required for the initiative
- Data infrastructure challenges
- Scale of deployment (vehicles, users, data volume)
- Integration requirements

4. SALES INTELLIGENCE (use these exact subheaders with Tailwind styling)
<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Buying Triggers</h2>
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span><strong class="font-semibold text-gray-900">Technology categories.</strong> List categories without fabricated timeframes</span>
</li>
</ul>

<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Lookalike Prospects</h2>
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span><strong class="font-semibold text-gray-900">Agency name.</strong> Details about comparable agency</span>
</li>
</ul>

<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Cross-Sell Opportunities</h2>
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span><strong class="font-semibold text-gray-900">System type.</strong> Description of complementary system</span>
</li>
</ul>

5. MARKET IMPLICATIONS
<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Market Implications</h2>
<p class="mt-6 text-gray-600">Final paragraph covering industry patterns, vendor positioning, and technology trends</p>

STYLING RULES:
- Body paragraphs: <p class="mt-6 text-gray-600">
- Section headers: <h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">
- Lists: <ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
- List items: <li class="flex gap-x-3"> with SVG icon
- Strong text: <strong class="font-semibold text-gray-900">
- Include the checkmark SVG for each list item

CRITICAL RULES:
- **ALWAYS** use <strong class="font-semibold text-gray-900"> for bolding category names in lists
- **ENSURE** every list item has the bold formatting applied correctly
- DO NOT fabricate specific timeframes
- Base ALL analysis on factual content from the article
- If vendor/provider company names are mentioned, include them prominently
- DO NOT include article title, date, author, source links
- DO NOT use ### markdown
- Keep it professional and grounded in facts
- Output ONLY valid HTML with proper Tailwind classes

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
          { role: 'system', content: systemPrompt + vendorContext },
          { role: 'user', content: content }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted - please add funds');
      }
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    let transformedContent = data.choices[0].message.content;

    // Post-processing: Strip out any metadata tags the AI might have added
    transformedContent = transformedContent
      .replace(/<p[^>]*class="[^"]*text-indigo-600[^"]*"[^>]*>.*?<\/p>/gi, '') // Remove category labels
      .replace(/<h1[^>]*>.*?<\/h1>/gi, '') // Remove any h1 titles
      .replace(/<time[^>]*>.*?<\/time>/gi, '') // Remove time tags
      .replace(/<a[^>]*href[^>]*>.*?<\/a>/gi, '') // Remove all links
      .replace(/###\s*Sources to Reference:?[\s\S]*?(?=<p>|$)/gi, '') // Remove Sources to Reference sections
      .replace(/###\s+[^\n]+/g, '') // Remove any ### headings
      .replace(/^\s*<div[^>]*>\s*/i, '') // Remove opening wrapper divs
      .replace(/\s*<\/div>\s*$/i, '') // Remove closing wrapper divs
      .replace(/^\s*-\s+.*$/gm, '') // Remove bullet list items (markdown format)
      .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
      .trim();

    console.log('Transform successful, content length:', transformedContent.length);

    return new Response(
      JSON.stringify({ transformedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Transform error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
