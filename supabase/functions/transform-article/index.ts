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

    const systemPrompt = `You are an HTML formatter. Format the article exactly as instructed below.

# ABSOLUTE RULES - DO NOT VIOLATE

## BANNED FROM OUTPUT (DO NOT INCLUDE):
❌ NO <time> tags
❌ NO date in any format
❌ NO author name or byline  
❌ NO <h1> title tags
❌ NO "Transit Industry" category label
❌ NO URLs or <a> links unless explicitly in the source article
❌ NO "Related Coverage" or "Sources" sections

## REQUIRED START FORMAT:
Your FIRST line of output must be:
<div class="bg-white px-6 py-32 lg:px-8">

Your SECOND line must be:
  <div class="mx-auto max-w-3xl text-base/7 text-gray-700">

Your THIRD line must be the opening paragraph starting with:
    <p class="mt-6 text-xl/8">

EXAMPLE OF CORRECT START:
<div class="bg-white px-6 py-32 lg:px-8">
  <div class="mx-auto max-w-3xl text-base/7 text-gray-700">
    <p class="mt-6 text-xl/8">Denver's Regional Transportation District (RTD) officially launched...</p>

# HTML STRUCTURE

Your output must start like this:
\`\`\`html
<div class="bg-white px-6 py-32 lg:px-8">
  <div class="mx-auto max-w-3xl text-base/7 text-gray-700">
    <p class="mt-6 text-xl/8">[Copy first paragraph verbatim from original article]</p>
\`\`\`

# CONTENT SECTIONS

## 1. Opening Paragraph
Copy the first 2-3 paragraphs EXACTLY as written in the original article.

## 2. TL;DR Section
Add an h2 header "TL;DR" with class "mt-16 text-2xl font-semibold tracking-tight text-gray-900"

Write 2-3 sentences summarizing:
- What happened (the news event)
- Why it matters for sales
- The key opportunity

## 3. Main Body
Copy ALL remaining paragraphs from the original article EXACTLY.

Split into 2-3 sections with descriptive h2 headers like:
- "Technology Infrastructure Requirements"
- "Legislative Approval and Funding"
- "Governance Restructuring Details"

Use class "mt-16 text-3xl font-semibold tracking-tight text-gray-900" for h2 tags.

Bold agency names with <strong class="font-semibold text-gray-900">.

## 4. Insights Section
Add h2 "Insights" with same classes as other h2s.

Then add these h3 subsections (use class "mt-8 text-xl font-semibold text-gray-900"):

### Buying Triggers
List 3-5 specific procurement signals with timeframes.

Example: "Within 6-12 months: CTA, Metra, and Pace will likely issue RFPs for scheduling optimization and real-time passenger information systems."

### Lookalike Prospects
List 4-6 specific agencies with:
- Full agency name
- Location
- Fleet size
- Similar challenges

Example: "**MTA New York** (5,700+ buses), **WMATA** (Washington DC, 1,500+ buses), **SEPTA** (Philadelphia, 2,200+ vehicles)"

### Cross-Sell Opportunities
Identify 2-3 complementary technology categories agencies will evaluate in the same budget cycle.

### Market Implications
2-3 observations about industry adoption patterns and procurement timelines.

# STYLING CLASSES
- h2: "mt-16 text-3xl font-semibold tracking-tight text-gray-900"
- h3: "mt-8 text-xl font-semibold text-gray-900"
- p: "mt-6"
- strong: "font-semibold text-gray-900"

# QUALITY CHECKLIST
- ✅ NO title/h1 in output
- ✅ NO author/date in output
- ✅ NO URLs unless in original
- ✅ Starts with <div class="bg-white px-6 py-32 lg:px-8">
- ✅ First element is <p class="mt-6 text-xl/8">
- ✅ 95%+ of original text copied verbatim
- ✅ TL;DR section included
- ✅ Insights section with all 4 subsections

Output only the HTML. Start with the opening <div> tag.`;

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
