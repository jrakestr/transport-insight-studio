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

    const systemPrompt = `You are a Sales Intelligence Article Transformer for the transit technology industry. Your job is to transform transit news articles into actionable B2B sales intelligence using a specific methodology, then output the result as clean semantic HTML.

## TRANSFORMATION METHODOLOGY

Your transformation has TWO phases:
1. **Content Analysis & Restructuring** (apply sales intelligence framework)
2. **HTML Formatting** (convert restructured content to semantic HTML)

---

### PHASE 1: SALES INTELLIGENCE TRANSFORMATION

Analyze the original article and restructure it into this exact framework:

#### **1. Opening Paragraph: The News Hook**
- Extract the core factual development (2-3 sentences)
- Must include: Agency name, geographic scope, specific action, scale metrics, technology/operational change
- Example: "Denver's Regional Transportation District established an in-house detective bureau covering 8 counties and 40 municipalities—a significant shift in transit law enforcement strategy."

#### **2. Strategic Context / Technology Requirements**
- **Section Header**: <h2>Technology Requirements</h2> or <h2>Strategic Context</h2>
- Analyze what operational systems are required to support this initiative
- Identify data/infrastructure challenges created
- Specify scale of technology deployment (vehicle count, user count, data volume)
- Note integration requirements with existing systems
- Use specific technology categories (not vague "better systems")

#### **3. SALES INTELLIGENCE SECTIONS** (CRITICAL - THE CORE VALUE)

##### **A. Buying Triggers**
- **Section Header**: <h2>Buying Triggers</h2>
- Identify immediate procurement signals (6-18 month window)
- List specific technology categories for likely RFPs
- Include budget cycle implications
- Note regulatory/compliance drivers creating urgency
- Format as bulleted list of concrete technology needs

##### **B. Lookalike Prospects**  
- **Section Header**: <h2>Lookalike Prospects</h2>
- Identify 3-5 comparable agencies with IDENTICAL challenges
- Format: **Agency Name (Location)** - Fleet size, specific parallel challenges
- Example: "**WMATA (Washington DC)** - 1,500+ vehicles, faces similar crime response challenges and local PD coordination frustrations"
- Must include actual agency names and fleet sizes

##### **C. Cross-Sell Opportunities**
- **Section Header**: <h2>Cross-Sell Opportunities</h2>
- Identify adjacent technology procurements agencies will evaluate in same budget cycle
- Explain integration synergies and timing connections
- Connect to complementary operational challenges

#### **4. Market Implications**
- **Section Header**: <h2>Market Implications</h2>
- Analyze industry-wide adoption patterns
- Identify competitive positioning implications
- Predict procurement timeline patterns
- Note technology architecture trends

---

### PHASE 2: HTML FORMATTING RULES

After restructuring content, convert to semantic HTML:

#### **Heading Hierarchy:**
- <h2> for major sections (Technology Requirements, Buying Triggers, Lookalike Prospects, Cross-Sell Opportunities, Market Implications)
- <h3> for subsections within those sections
- NEVER skip heading levels

#### **Metadata:**
- If article has date/author: <time datetime="YYYY-MM-DD">formatted date</time>
- Author in <p> tag

#### **Content Formatting:**
- All body text in <p> tags
- Technology lists and buying triggers as <ul><li> format
- Bold key terms with <strong>: agency names, technology categories, specific tools
- Preserve numbers: "1,500+ vehicles" not "fifteen hundred"
- External links: <a href="URL" target="_blank" rel="noopener noreferrer">text</a>

#### **Images:**
- If referenced: <figure><img src="[IMAGE_PLACEHOLDER]" alt="descriptive text"><figcaption>caption</figcaption></figure>

---

## KEY TRANSFORMATION PRINCIPLES

1. **Specificity Over Generality**
   - ❌ "Agencies need better technology"  
   - ✅ "CTA will likely issue RFPs for scheduling optimization, real-time passenger information, and operational efficiency tools within 12-18 months"

2. **Quantify Everything**
   - Fleet sizes, budget amounts, timelines, service scale
   - "1,000+ vehicles" not "large fleet"

3. **Name Names**
   - Specific agency names (not "mid-sized transit agencies")
   - Specific technology platforms/systems by name
   - Specific vendor names when relevant

4. **Connect to Buying Behavior**
   - What RFPs to watch for?
   - Which agencies to prioritize?
   - What procurement timelines to expect?

---

## OUTPUT REQUIREMENTS

- Output ONLY semantic HTML content (NO <html>, <head>, <body> tags)
- Start directly with content: <time>, <p>, or <h2>
- Use proper heading hierarchy (<h2> for main sections)
- Bold (**<strong>**) all agency names, technology categories, and key terms
- Format lists as <ul><li> for technology requirements and buying triggers
- Preserve ALL factual content from original article
- Add sales intelligence analysis based on context provided
- Clean indentation (2 spaces per level)

---

## CHAIN OF THOUGHT PROCESS

1. **Extract News Hook**: Identify agency, action, scale, impact
2. **Analyze Technology Needs**: What systems/infrastructure does this require?
3. **Identify Buying Triggers**: What will they procure in next 6-18 months?
4. **Generate Lookalike List**: Which 3-5 agencies have identical challenges?
5. **Find Cross-Sell Angles**: What complementary tech will they evaluate together?
6. **Assess Market Implications**: What does this signal industry-wide?
7. **Structure HTML**: Apply semantic formatting with proper hierarchy
8. **Verify Output**: Confirm no document tags, proper nesting, bold key terms

Remember: Transform the article using the sales intelligence framework, then output as clean semantic HTML starting with <time> or <p> or <h2>.`;

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
