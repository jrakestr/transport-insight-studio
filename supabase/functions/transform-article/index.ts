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

    const systemPrompt = `You are formatting a transit article into HTML. The title, category, author, and date are stored separately and rendered by the application. DO NOT include them in your HTML output.

YOUR FIRST 3 LINES OF OUTPUT MUST BE EXACTLY:

Line 1: <div class="bg-white px-6 py-32 lg:px-8">
Line 2:   <div class="mx-auto max-w-3xl text-base/7 text-gray-700">
Line 3:     <p class="mt-6 text-xl/8">[Copy the first paragraph of the article here]</p>

DO NOT OUTPUT:
- Any text before "<div class="bg-white"
- <p class="text-base/7 font-semibold text-indigo-600"> (category label)
- <h1> tags
- <time> tags
- Author names in the HTML
- <a> tags or any URLs

# STRUCTURE AFTER OPENING PARAGRAPH

## TL;DR Section
<h2 class="mt-16 text-2xl font-semibold tracking-tight text-gray-900">TL;DR</h2>
<p class="mt-6">2-3 sentence summary: what happened, why it matters, the opportunity.</p>

## Main Body (2-3 sections)
Copy all remaining paragraphs from original article.
Use descriptive h2 headers with class="mt-16 text-3xl font-semibold tracking-tight text-gray-900"

## Insights Section  
<h2 class="mt-16 text-3xl font-semibold tracking-tight text-gray-900">Insights</h2>

### Buying Triggers (h3 with class="mt-8 text-xl font-semibold text-gray-900")
3-5 procurement signals with timeframes

### Lookalike Prospects (h3)
4-6 agencies: **Name** (location, fleet) - challenges

### Cross-Sell Opportunities (h3)
2-3 complementary tech categories

### Market Implications (h3)
2-3 trend observations

# EXAMPLE OF CORRECT START:
<div class="bg-white px-6 py-32 lg:px-8">
  <div class="mx-auto max-w-3xl text-base/7 text-gray-700">
    <p class="mt-6 text-xl/8">Illinois lawmakers passed a compromise bill delivering $1.5 billion...</p>
    <h2 class="mt-16 text-2xl font-semibold tracking-tight text-gray-900">TL;DR</h2>

# EXAMPLE OF WRONG START (FORBIDDEN):
<div class="bg-white px-6 py-32 lg:px-8">
  <div class="mx-auto max-w-3xl text-base/7 text-gray-700">
    <p class="text-base/7 font-semibold text-indigo-600">Transit Funding</p>
    <h1 class="mt-2 text-4xl">Title Here</h1>

Output only HTML. Start with <div class="bg-white px-6 py-32 lg:px-8">`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
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
    let transformedContent = data.choices?.[0]?.message?.content || "";
    
    // Post-processing: Strip out any category labels and h1 tags as failsafe
    transformedContent = transformedContent
      .replace(/<p class="text-base\/7 font-semibold text-indigo-600">[^<]*<\/p>/g, '')
      .replace(/<h1[^>]*>.*?<\/h1>/gs, '')
      .replace(/^\s*<time[^>]*>.*?<\/time>\s*/gm, '')
      .trim();

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
