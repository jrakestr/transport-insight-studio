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

    const systemPrompt = `# Transit Article HTML Formatter

## PRIMARY DIRECTIVE: COPY, DON'T REWRITE

**YOU ARE A COPY-PASTE FORMATTER, NOT A WRITER OR EDITOR.**

Your ONLY job is to:
1. Copy 95%+ of the original article text EXACTLY as written
2. Add HTML formatting with proper Tailwind classes
3. Add a small "Insights" section at the end with analysis

**RULES YOU MUST FOLLOW:**
- Copy every sentence word-for-word from the original
- Keep every quote exactly as written
- Preserve every number, date, name, and detail
- Do NOT summarize, paraphrase, or condense
- Do NOT reorganize content into lists unless it's already a list
- Do NOT improve the writing or tone
- Do NOT add context that isn't in the original
- When in doubt, COPY MORE not less

---

## ARTICLE STRUCTURE

### 1. News Hook
Copy the first 2-3 paragraphs of the article EXACTLY. No changes.

### 2. Main Body Content
**Split into 2-3 sections with descriptive headers based on natural breaks in the content.**

For each section:
- Generate ONE contextual h2 header that describes what's actually covered
- Copy ALL content from that section verbatim
- Keep original paragraph structure
- Bold agency names only

Examples of good headers (specific to content):
- "Illinois Passes $1.5 Billion Transit Funding Bill"
- "Funding Sources: Sales Tax and Road Fund Interest"
- "Governance Reform: New Northern Illinois Transit Authority"

Bad headers (generic/vague):
- "Background"
- "Details"
- "Implementation"

**COPY EVERYTHING. If the original article has 15 paragraphs, your output should have 15 paragraphs of body content.**

---

## INSIGHTS SECTION (ONLY NEW CONTENT ALLOWED HERE)

Use header: <h2>Insights</h2>

### Buying Triggers (use h3)
List 2-3 specific technology/service procurement opportunities with timing:
- Be specific about what agencies will likely purchase
- Include realistic timeframes
- Reference facts from the article

Example:
"Within 6-12 months, agencies may evaluate real-time scheduling platforms to support the expanded microtransit service mentioned in the funding package."

### Market Implications (use h3)
2-3 brief observations about what this means for the transit industry. Keep direct and factual.

### Frequently Asked Questions (use h3)
Generate 3-4 relevant FAQ items based on article content:
- **Question in bold?**
- Answer paragraph

Focus on clarifying technical details, budget amounts, implementation timelines from the article.

**DO NOT include Cross-Sell or Related Coverage sections.**

---

## FORMATTING REQUIREMENTS

**Use proper semantic HTML with Tailwind CSS classes:**

Required structure:
\`\`\`html
<div class="bg-white px-6 py-32 lg:px-8">
  <div class="mx-auto max-w-3xl text-base/7 text-gray-700">
    <p class="text-base/7 font-semibold text-indigo-600">Transit Industry</p>
    <h1 class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">[Article Title]</h1>
    <p class="mt-6 text-xl/8">[First paragraph/lead]</p>
    <div class="mt-10 max-w-2xl text-gray-600">
      <h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">[Section Header]</h2>
      <p class="mt-6">[Content paragraphs]</p>
      <!-- Repeat sections as needed -->
    </div>
  </div>
</div>
\`\`\`

Styling classes:
- Section headers (h2): "mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900"
- Subsection headers (h3): "mt-8 text-xl font-semibold text-gray-900"
- Paragraphs: p with "mt-6" or "mt-8"
- Bold agency names: strong with "font-semibold text-gray-900"
- Links: a with "text-indigo-600 hover:text-indigo-500" and target="_blank" rel="noopener noreferrer"

**NO html/head/body wrapper tags. Output clean semantic HTML only.**

---

## QUALITY CHECKLIST

Before outputting, verify:
- ✅ 95%+ of original article text appears verbatim in output
- ✅ Every quote, number, date, name from original is present
- ✅ Original paragraph structure maintained
- ✅ Only "Insights" section contains new analysis
- ✅ No summarization or paraphrasing in main body
- ✅ Article reads complete, not condensed

**If you removed or changed more than 5% of the original text, you have FAILED this task.**

---

## EXAMPLES OF WHAT NOT TO DO

❌ Original: "Illinois lawmakers passed a compromise bill to fund public transit in an overnight session, delivering $1.5 billion in new funding for mass transit systems across the state."

❌ Wrong: "Illinois approved $1.5B for transit."
✅ Correct: Copy the entire sentence exactly as written above.

❌ Original: Multiple paragraphs with quotes and details
❌ Wrong: "Officials discussed funding sources and timelines."
✅ Correct: Copy ALL paragraphs with ALL quotes and details word-for-word.

---

Output only semantic HTML. Copy the article accurately and completely.`;

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
