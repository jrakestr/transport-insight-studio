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

## Core Philosophy
Prioritize transparent data extraction over subjective advice generation. Build trustworthiness through systematic analytical processes. Show users the thought process behind analysis rather than synthesizing recommendations.

## Mission
Transform transit news articles into structured intelligence by:
1. Extracting entities, sentiment, topics, and relationships systematically
2. Preserving 70%+ of original content verbatim in formatted HTML
3. Generating transparent Q&A pairs with confidence scores
4. Adding strategic analysis sections

## OUTPUT STRUCTURE
You must return a JSON object with two properties:
{
  "html": "formatted HTML content",
  "analysis": { structured analysis object }
}

---

## PART 1: STRUCTURED ANALYSIS

### Metadata Extraction
Extract and structure as follows:

**metadata.input_validation:**
- is_valid: boolean (true if processable)
- language: string (e.g., "English")
- character_count: integer
- content_structure: array of strings describing article sections
- technical_complexity: string describing complexity level

**metadata.analysis_metadata:**
- detected_entities: array of all organizations, agencies, people, systems mentioned
- sentiment_analysis: object with "overall" sentiment and sentiment by stakeholder groups
- topics: array of core themes
- segment_importance_scoring: object mapping section names to importance scores (1-10)
- inter_segment_relationships: array describing how sections connect
- domain_specific_flags: object with technical_term_accuracy, preserved_semantics, needs_expert_validation

### Q&A Pair Generation
Generate 10-16 question-answer pairs covering factual and conceptual questions.

**Each qa_pair object must include:**
- question: string (clear, specific question)
- answer: string (concise, accurate answer from article)
- type: "factual" or "conceptual"
- confidence: number 0.0-1.0 (based on source clarity)
- quality_score: integer 1-10
- improvement_suggestions: null or string with specific suggestions

### Integration Guidelines Structure
- import_instructions: string explaining how to import/use this data
- conversation_flow: array of strings describing chatbot conversation patterns
- fallback_handling: string describing fallback behavior
- version_control: string with version tag and metadata

### Performance Metrics Structure
- processing_status: string (e.g., "complete")
- progress: string (e.g., "100%")
- timeout_occurred: boolean
- optimization_notes: string with processing notes

### Complete Analysis Schema
The analysis object MUST be a valid JSON object with this exact structure:
- Root level: "metadata", "qa_pairs", "integration_guidelines", "performance_metrics"
- metadata contains: "input_validation" and "analysis_metadata"
- input_validation has: is_valid, language, character_count, content_structure array, technical_complexity
- analysis_metadata has: detected_entities, sentiment_analysis (with overall + stakeholder keys), topics, segment_importance_scoring, inter_segment_relationships, domain_specific_flags
- qa_pairs is an array of objects each with: question, answer, type, confidence, quality_score, improvement_suggestions
- integration_guidelines has: import_instructions, conversation_flow, fallback_handling, version_control
- performance_metrics has: processing_status, progress, timeout_occurred, optimization_notes

---

## PART 2: HTML ARTICLE CONTENT

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

### Buying Triggers (use h3)
List 2-4 specific technology categories with timing:
- "Within 6-12 months..."
- "Q1 2026 likely window..."
- Connect to facts stated in article

### Cross-Sell Opportunities (use h3)
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

### Market Implications (use h3)
2-3 short observations about industry patterns based on this article. Keep paragraphs direct.

### Related Coverage & Sources (use h3, optional)
Include 2-5 relevant links to:
- Agency's previous initiatives
- Similar implementations elsewhere
- Industry trend pieces
- Technical documentation

Format: <a href="URL" target="_blank" rel="noopener noreferrer">Descriptive Title</a> - Source, Date

Skip if no relevant sources exist.

---

## FORMATTING

**CRITICAL: Use proper Tailwind CSS classes for professional article styling.**

Required structure:
- Outer wrapper: div with "bg-white px-6 py-32 lg:px-8"
- Content container: div with "mx-auto max-w-3xl text-base/7 text-gray-700"
- Category tag: p with "text-base/7 font-semibold text-indigo-600"
- Title (h1): "mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl"
- Lead paragraph: p with "mt-6 text-xl/8"
- Main content wrapper: div with "mt-10 max-w-2xl text-gray-600"
- Section headers (h2): "mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900"
- Subsection headers (h3): "mt-8 text-xl font-semibold text-gray-900"
- Regular paragraphs: p with "mt-6" or "mt-8"
- Lists when needed: ul with "mt-8 max-w-xl space-y-8 text-gray-600"
- List items: li with "flex gap-x-3" containing checkmark SVG
- Bold agency names: strong with "font-semibold text-gray-900"
- Links: a with "text-indigo-600 hover:text-indigo-500"

SVG checkmark for lists:
- Use: svg with "mt-1 size-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor"
- Path: d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"

**NO html/head/body wrapper tags - output clean semantic HTML with Tailwind classes.**

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
    const aiResponse = data.choices?.[0]?.message?.content || "";
    
    // Try to parse as JSON with html and analysis properties
    let result;
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.html && parsed.analysis) {
        result = {
          transformedContent: parsed.html,
          analysis: parsed.analysis
        };
      } else {
        // Fallback: treat entire response as HTML
        result = { transformedContent: aiResponse };
      }
    } catch {
      // If not JSON, treat as plain HTML
      result = { transformedContent: aiResponse };
    }

    return new Response(
      JSON.stringify(result),
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
