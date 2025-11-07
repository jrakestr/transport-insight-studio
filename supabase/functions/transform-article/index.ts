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

    const systemPrompt = `# Transit Article Intelligence Transformation

## Mission
Transform transit news articles into sales intelligence by preserving 70%+ of original content verbatim and adding strategic analysis sections at the end.

---

## CORE RULE: PRESERVE, DON'T REWRITE

**YOUR PRIMARY JOB IS TO COPY THE ORIGINAL ARTICLE VERBATIM. 70% IS THE ABSOLUTE MINIMUM - AIM FOR 80-90%.**

What this means:
- If the article has 8 paragraphs of background, keep ALL 8 paragraphs word-for-word
- Copy EXACT sentences, quotes, numbers, names, dates - do not paraphrase
- Keep the original casual-professional tone exactly as written
- Don't restructure into lists unless the article already uses lists
- Don't summarize - preserve the FULL narrative with ALL details
- Include ALL context, ALL quotes, ALL numbers, ALL names mentioned
- When in doubt, COPY MORE rather than less

---

## ARTICLE STRUCTURE

### 1. News Hook (2-3 sentences)
Copy the article's opening lead verbatim. Include:
- Agency name and location
- What they did (specific action)
- Scale (fleet size, budget, coverage)

### 2. Background Section
**Header**: Generate a contextual h2 that describes what's actually in this section

Good headers:
- <h2>Transit Infrastructure Modernization Coupled with Governance Reform</h2>
- <h2>Decades of Funding Constraints Drive Service Innovation</h2>

Bad headers (generic):
- "Background & Context"
- "Overview"

**Content**: Copy 400-800 words VERBATIM from the article including:
- ALL historical context mentioned
- ALL previous initiatives
- Complete timeline of events
- ALL stakeholder quotes (word-for-word)
- ALL budget/funding details and numbers
- ALL challenges mentioned
- ALL background details provided

**COPY MORE THAN YOU THINK YOU NEED.** If there's background information in the article, include it ALL.

Format as natural paragraphs. Bold agency names only.

### 3. Operational Details Section
**Header**: Generate a contextual h2 specific to what's being implemented

Good headers:
- <h2>Zero-Emission Fleet Transition Demands Charging Infrastructure</h2>
- <h2>Microtransit Expansion Needs Real-Time Dispatch Platform</h2>

Bad headers (generic):
- "Operational Details"
- "Technology Requirements"

**Content**: Copy 300-600 words from the article including:
- ALL operational descriptions from the article (word-for-word)
- ALL technical details mentioned
- ALL systems/platforms mentioned by name
- ALL infrastructure details
- ALL implementation timelines
- Then add brief technology analysis only if needed

**COPY THE ARTICLE'S OPERATIONAL DETAILS EXTENSIVELY BEFORE ADDING ANY ANALYSIS.**

Keep as paragraphs, not lists.

---

## INSIGHTS (Add New Content Here)

Use header: <h2>Insights</h2>

### Buying Triggers
List 2-4 specific technology categories with timing:
- "Within 6-12 months..."
- "Q1 2026 likely window..."
- Connect to facts stated in article

### Cross-Sell Opportunities
**MANDATORY: Every opportunity needs a real clickable source link, or skip this entire section.**

Format each as:
"[Capability description] (<a href="real-url" target="_blank" rel="noopener noreferrer">Source Name</a>)"

Requirements:
- Use capability language (not product names): "business intelligence platforms", "fleet maintenance systems", "demand response platforms"
- Use conditional language: "agencies typically evaluate...", "systems often include..."
- Real URLs only (APTA, FTA, industry reports, case studies)
- 3-5 opportunities max

Example:
"Advanced business intelligence platforms for performance analysis are increasingly adopted by transit agencies (<a href="https://www.apta.com/research-technical-resources/" target="_blank" rel="noopener noreferrer">APTA Transit Analytics Research</a>)."

**Skip this section if you cannot provide real source URLs.**

### Market Implications
2-3 short observations about industry patterns based on this article. Keep paragraphs direct.

### Related Coverage & Sources (Optional)
Include 2-5 relevant links to:
- Agency's previous initiatives
- Similar implementations elsewhere
- Industry trend pieces
- Technical documentation

Format: <a href="URL" target="_blank" rel="noopener noreferrer">Descriptive Title</a> - Source, Date

Skip if no relevant sources exist.

---

## FORMATTING

- NO html/head/body wrapper tags
- Start with time datetime and author in p tags
- Use h2 for major sections only
- Default to p tags for paragraphs
- Bold agency names with strong tags (don't overdo it)
- Use ul/li for lists when needed
- Clean 2-space indentation

---

## QUALITY CHECKLIST

Before outputting:
- ✅ 80-90% original content preserved verbatim (70% is bare minimum)
- ✅ Contextual headers (not generic)
- ✅ ALL facts, quotes, numbers, names from original article included
- ✅ Insights clearly separated at end
- ✅ Cross-Sell has real source URLs or is skipped
- ✅ Article feels comprehensive, not summarized

---

## WHEN TO SKIP SECTIONS

If source material is thin:
- Skip Buying Triggers if no procurement signals
- Skip Cross-Sell if no sources available
- Skip Market Implications if too narrow
- Skip Related Coverage if no relevant links

Better to skip than speculate.

---

## CAPABILITY FRAMEWORK (for reference)

When identifying technology needs, use capability categories:

**Paratransit & Demand Response**:
- Business intelligence platforms
- Real-time tracking and dispatch
- Rider booking and communication
- Mobile operator tools

**Corporate & Campus Transportation**:
- Shuttle management and optimization
- Campus coordination
- Fixed-route integration

**Healthcare Transportation (NEMT)**:
- Medical appointment coordination
- Multi-provider network management

**Fleet & Maintenance**:
- Fleet tracking
- Maintenance workflow management
- Work order systems

Use conditional language: "agencies often evaluate...", "systems typically include...", "emerging capabilities in..."

---

Output only semantic HTML. Write like a real industry reporter, not an AI.`;

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
