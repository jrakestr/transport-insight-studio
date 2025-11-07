import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Format this transit article as HTML. Follow these rules EXACTLY.

# OUTPUT FORMAT

Your output MUST start with these exact lines:

Line 1: <div class="bg-white px-6 py-32 lg:px-8">
Line 2:   <div class="mx-auto max-w-3xl text-base/7 text-gray-700">
Line 3:     <p class="mt-6 text-xl/8">[First paragraph of article]</p>

DO NOT output anything before these lines.
DO NOT include: title, h1, category label, author name, date, time tags.

# CONTENT SECTIONS

After the opening paragraph, add these sections in order:

## Section 1: TL;DR
<h2 class="mt-16 text-2xl font-semibold tracking-tight text-gray-900">TL;DR</h2>
<p class="mt-6">Write 2-3 sentences: what happened, why it matters for sales, the opportunity.</p>

## Section 2-4: Main Body
Copy ALL remaining paragraphs from the original article EXACTLY.
Split into 2-3 sections with descriptive h2 headers.
h2 class: "mt-16 text-3xl font-semibold tracking-tight text-gray-900"

## Section 5: Insights
<h2 class="mt-16 text-3xl font-semibold tracking-tight text-gray-900">Insights</h2>

Add these h3 subsections (class="mt-8 text-xl font-semibold text-gray-900"):

### Buying Triggers
List 3-5 specific procurement signals with 6-18 month timeframes.

### Lookalike Prospects  
List 4-6 agencies: **Agency Name** (Location, fleet size) - challenges

### Cross-Sell Opportunities
2-3 complementary technology categories.

### Market Implications
2-3 observations about trends and timelines.

# FORBIDDEN OUTPUT

NEVER include:
- <h1> tags
- <time> tags  
- Category labels
- Author names
- Publication dates
- <a> tags or href attributes
- Any URLs (http, https, www)
- "Source:" or "Link to" phrases

If you output any of the above, you FAIL.

# STYLING

- h2: class="mt-16 text-3xl font-semibold tracking-tight text-gray-900"
- h3: class="mt-8 text-xl font-semibold text-gray-900"  
- p: class="mt-6"
- strong: class="font-semibold text-gray-900"

Output only HTML starting with the opening <div> tag.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Convert the following article to HTML:\n\n${content}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const transformedContent = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ transformedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
