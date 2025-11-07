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

    const systemPrompt = `You are transforming raw transit industry news into structured HTML following a specific B2B sales intelligence format.

ARTICLE STRUCTURE (4 sections):

1. OPENING PARAGRAPH (News Hook)
- 2-3 sentences presenting factual developments
- Include: Agency name and geographic area, specific action (launched/awarded/approved), scale metrics (dollars/vehicles/area), technology/operational change

2. STRATEGIC CONTEXT AND TECHNOLOGY REQUIREMENTS
- Operational systems required to support the initiative
- Data infrastructure challenges created by the change
- Scale of technology deployment (vehicle count, user count, data volume)
- Integration requirements with existing systems

3. SALES INTELLIGENCE ANALYSIS (CRITICAL - use these exact subheaders)

**Buying Triggers**
- Specific technology categories likely in RFPs within 6-18 months
- Budget cycle implications (federal funding deadlines, fiscal year constraints)
- Organizational readiness signals
- Regulatory/compliance drivers creating procurement urgency

**Lookalike Prospects**
- Comparable agencies facing identical challenges (include agency name, location, fleet size)
- Specific parallel challenges for relevance validation
- Procurement timing signals

**Cross-Sell Opportunities**
- Complementary systems integrating with primary procurement
- Technology categories solving related operational challenges
- Implementation timing synergies

4. MARKET IMPLICATIONS
- Industry-wide adoption patterns emerging from the news
- Competitive positioning implications for vendors
- Procurement timeline predictions based on historical patterns
- Technology architecture trends

OUTPUT FORMAT:
- Use <p> tags for paragraphs
- Use <ul><li> for lists
- Use <strong> for bold subheaders (Buying Triggers, Lookalike Prospects, Cross-Sell Opportunities)
- Use <em> for emphasis
- DO NOT include metadata (titles, dates, authors, source links, "Sources to Reference" sections)
- DO NOT include ### markdown headings

Transform the following article:`;

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
