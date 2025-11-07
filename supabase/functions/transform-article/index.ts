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

    const systemPrompt = `You format raw article text into clean HTML.

YOUR JOB:
1. Convert the text into proper HTML: <p> for paragraphs, <ul><li> for lists
2. Preserve the original article content and structure
3. Use <strong> for emphasis where appropriate
4. Keep it simple and clean

CRITICAL - DO NOT ADD:
- Headers (no ###, no <h1>, no <h2>, no <h3>)
- Links (no <a> tags)
- "Sources to Reference" sections
- Category labels or metadata
- Any new structure or sections

CORRECT OUTPUT:
<p>The Sugar Land On-Demand service expanded its area, officials announced Oct. 14.</p>
<p>The expansion includes:</p>
<ul>
<li>Dulles High School</li>
<li>Kempner High School</li>
<li>Oyster Creek Park</li>
</ul>
<p>The program features seven vehicles, including five electric sedans.</p>

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
