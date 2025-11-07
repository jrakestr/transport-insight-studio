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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You transform raw transit industry news into structured HTML with B2B sales intelligence analysis.

STRUCTURE (4 sections):

1. OPENING PARAGRAPH
- 2-3 sentences presenting factual developments
- Include: Agency name, location, specific action, scale metrics, technology change

2. STRATEGIC CONTEXT
- Operational systems required for the initiative
- Data infrastructure challenges
- Scale of deployment (vehicles, users, data volume)
- Integration requirements

3. SALES INTELLIGENCE (use these exact subheaders with Tailwind styling)
<h3 class="text-lg font-semibold mt-6 mb-3">Buying Triggers</h3>
<ul class="list-disc pl-6 space-y-2">
<li>Technology categories for RFPs within 6-18 months with specific timing</li>
<li>Budget cycle implications (federal deadlines, fiscal constraints)</li>
<li>Organizational readiness signals</li>
</ul>

<h3 class="text-lg font-semibold mt-6 mb-3">Lookalike Prospects</h3>
<ul class="list-disc pl-6 space-y-2">
<li>Comparable agencies with location, fleet size, parallel challenges</li>
<li>Procurement timing signals</li>
</ul>

<h3 class="text-lg font-semibold mt-6 mb-3">Cross-Sell Opportunities</h3>
<ul class="list-disc pl-6 space-y-2">
<li>Complementary systems integrating with primary procurement</li>
<li>Related operational solutions</li>
</ul>

4. MARKET IMPLICATIONS (final paragraph)
- Industry adoption patterns
- Vendor competitive positioning
- Procurement timeline predictions
- Technology architecture trends

OUTPUT RULES:
- Use <p class="mb-4"> for paragraphs
- Use <ul class="list-disc pl-6 space-y-2"><li> for lists
- Use <strong> for emphasis within text
- Use <h3 class="text-lg font-semibold mt-6 mb-3"> for section headers
- DO NOT include article title, date, author, source links
- DO NOT use ### markdown
- Keep it professional and actionable

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
      .replace(/<h2[^>]*>.*?<\/h2>/gi, '') // Remove h2 titles
      .replace(/<h3[^>]*>.*?<\/h3>/gi, '') // Remove h3 titles
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
