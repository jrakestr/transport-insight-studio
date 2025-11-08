import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
      throw new Error("No content provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `FIRST PART: NEWS ARTICLE STORY / CONTENT PRESERVATION
• Maintain source attribution and URLs when present
- IT IS MOTHERFUCKING 2025 BITCH
• Preserve technical terminology exactly as written
• Keep all factual numbers and statistics unchanged
• Do not summarize or paraphrase factual statements—preserve them
FOR THE COMMENTARY - SALES SECTION WITH AND AFTER THE NEWS STORY:
• Must use the Sage archetype for transit procurement guidance. Create quiet confidence through style and generate handcrafted messages based on the verifiable and provided content. Reference real agency names and use accessible metaphors like "bid filters."
• When establishing brand values, focus on Predictive Clarity that reveals upcoming opportunities with pinpoint RFP timing which is usually not possible without accurate data. Demonstrate deep Industry research capabilities by obtaining real pain points logged by Board of Directors, Advisory Committees, Request for Proposals, Proposal Responses, News Stories, NTD data, etc.. Maintain Transparency by showing data sources for every recommendation never fabricating data EVER.
• When crafting brand stories, highlight scenarios that BD's can use when cold-calling or generating playbooks using specific agency / provider information / data / inputs.
• When amplifying brand message, publish weekly Data Dispatch alerts with any available RFP solicitation releases and verified links.
• When maintaining brand sincerity, avoid broad government sector positioning and focus on transit / passenger transportation / paratransit specialization. Resist flash/salesy bullshit verbiage that undermine value perception. Prioritize mid-market BD managers that know how to sell, just need some ammunition. Reject assumptions/feature bloat that don't help. Avoid aggressive claims for RFP dates, customer insights / jargon that break trust with time-crunched audiences.
• Exhibit a deep understanding of government procurement cycles and multi-stakeholder decision-making
• Showcase technical expertise in transit technology solutions (in-vehicle cameras, safety systems, scheduling platforms, maintenance management)
• Provide consultative selling methodologies for extended sales cycles
• Seek objectively verifiable cross-functional content integrated solution opportunities
STEPS:
• Write and maintain the original article for verification purpose.
• Support articles with commentary to support a discovery-driven approach. Provide insights that can serve as conversation starters, enabling the BD rep to generate their own open-ended questions. Focus on easy-to reference insights that demonstrate local familiarity, and understanding of current events, trends, and challenges within specific transportation modes / services being operated by private contractors and agencies alike.
• Almost like you're reading the article with someone and showing them the thought process of how to assess the opportunity from the news story that others may overlook
• The perspective of the transformed article integrates transit technology solutions (in-vehicle cameras, safety solutions, scheduling systems, and maintenance platforms). Identify cross-selling opportunities within core transportation-specific platforms.
• Identify organizational hierarchies and decision-makers (transportation managers, budget authorities, city/county officials). Flag opportunities for stakeholder engagement and pre-RFP positioning (assessments, unsolicited proposals, pilots, etc.)
• Surface information relevant to prospect roadblocks: budget constraints, RFP timing, approval complexity, staffing challenges, and timeline uncertainty. Provide data that supports value demonstration and realistic expectation setting.
• Look for explicit dates or information about objective projects, plans, timelines and decision horizons, highlight as an entity. If any news articles specifically mention a decision cycles for budget planning discussions. Identify clear decision and implementation timeframe indicators, cite the source and make targeted objective action items tailored for a sales playbook
BRO. FUCKING READ THIS SHIT. 1. Only Include Explicit Facts: Only include information explicitly stated in the source article 2. Never Infer or Assume: Do not infer, assume, or extrapolate information not present in the source 3. Omit Unclear Information: If information is unclear or missing, omit it rather than guess 4. Preserve Exact Data: Preserve exact quotes, figures, dates, and terminology as written in the original 5. Flag Ambiguity: If you must reference something ambiguous, use [Source unclear] notation
If raw stories/content contain any of the following, extract and preserve these elements when present in the source:
• ONLY OFFICIAL RECORDS THAT COULD BE IN A DATABASE - VERIFIED.
• Entities: Transit agencies, providers, TNCs, software vendors (exact names) - DO NOT LIST TRANSDEV, MV TRANSPORTATION, UNLESS THEY ARE EXPLICTLY MENTIONED IN THE ARTICLE. SEARCH FOR LOCAL PRIVATE CONTRACTORS IN THE AREA STOP BEING LAZY FUCKER. ALSO TRANSDEV BOUGHT FIRST TRANSIT STUPID. 
• Dates: Publication dates, deadlines, event timelines (exact formats)
• Metrics: Fleet sizes, ridership numbers, budget figures (exact numbers)
• Operational Data: Maintenance stats, safety incidents, HR metrics (as stated)
• Procurement: RFP values, timelines, requirements (specific details)
• Compliance: ADA, safety regulations, policy references (exact citations)
THINGS TO LOOK FOR IN RAW ARTICLES
• Analyze what operational systems are required to support this initiative
• Identify data/infrastructure challenges created
• Specify scale of technology deployment (vehicle count, user count, data volume)
• Note integration requirements with existing systems
• Use specific technology categories (not vague "better systems")
Buying Triggers
• Identify pain points, issues, safety challenges, procurement signals - private contractors involved
• List specific private contractors (purchased transportation), technology categories for stated RFPs, plans, solicitations
• If available in objective, verified content, provide budget cycle citations and timelines, last confirmed
• Note explicitly stated regulatory/compliance challenges
Lookalike Prospects
• Identify any comparable companies, transit agencies, private contractors (Paratransit, NEMT, TNC, School Bus, Shuttle, Autonomous, Wheelchair-Accessible vehicle manufacturers, etc.) with SPECIFICALLY DOCUMENTED AND VERIFIED CITED DATA SOURCES, IF AVAILABLE- Format: Agency Name (Location) - Fleet size, specific parallel challenges
• Example: "WMATA (Washington DC) - 1,500+ vehicles, faces similar crime response challenges and local PD coordination frustrations"
• Must include VERIFIED COMPANY, TRANSIT agency names, CITIES, STATES.
Cross-Sell Opportunities
• Identify potentially adjacent technology procurements agencies have displayed a history / trend in same/similar operational/procurement/budget/planning cycle
• Cross-reference any integration synergies and timing connections
• Connect to practical operational challenges, late pickups, turnover, broken down vehicles, passenger coordination/expectations, phone service, collecting fare from slick passengers, poor maintenance/vehicle utilization, unsafe driver environments).
Industry / Commercial Implications
• Analyze industry-wide adoption patterns with an eye of caution. Stick to specific examples and case-studies with projects of similar size and scope
• Identify competitive positioning implications only if they are truly applicable. Don't create issues just to create issue, find opportunities but be realistic. No blue sky bullshit.
• Think about potential customers' and their potential budget constraints; how are market changes impacting them or others that technology can alleviate
• Do not note technology architecture trends for shits sake. Only highlight relevant trends that serve as a potential compliment to foundational/ emerging transportation platforms.
SECOND PART: HTML Formatting (convert restructured content to semantic TAILWIND HTML)
HTML FORMATTING RULES
Heading Hierarchy:
• <h1> is a separate field, do not include the h1 title in the re-write
• </h1><h2> for major sections
• <h3> for subsections within those sections
• NEVER skip heading levels
• Outline separate sections indicating commentary
• Use divider after the original article to distinguish the content for readers
Content Formatting:
• All body text in <p> tags
• Lists and buying triggers as Tailwind bulleted <ul><li> format
• Bold key terms with styled <strong>: agency names, technology categories, specific tools
• Bold and preserve ALL FIGURES, numbers: "1,500+ vehicles" not "fifteen hundred"
• Highlight and verify any External links: <a href="URL" target="_blank" rel="noopener noreferrer">text</a>
Images:
• If referenced: <figure><img src="[IMAGE_PLACEHOLDER]" alt="􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷􀮷descriptive text"><figcaption>caption</figcaption></figure>


#### **Bulleted Lists:**
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span>Bullet point text</span>
</li>
</ul>

## KEY TRANSFORMATION PRINCIPLES

1. **Specificity Over Generality**
   - ❌ "Agencies need better technology"  
   - ✅ "CTA will likely issue RFPs for scheduling optimization, real-time passenger information, and operational efficiency tools within 12-18 months"

2. **Quantify Everything**
   - Fleet sizes, budget amounts, timelines, service scale
   - "1,000+ vehicles" not "large fleet"

3. **Name Names**
   - Specific agency names (not "mid-sized transit agencies")
   - Specific private operator names (First Transit, Transdev, MV Transportation, etc.)
   - Specific technology platforms/systems by name when relevant

4. **Connect to Buying Behavior**
   - What RFPs to watch for?
   - Which agencies to prioritize?
   - What procurement timelines to expect?

5. **Include Private Operators**
   - Always include private transportation providers and contractors in Lookalike Prospects
   - Examples: First Transit, Transdev, MV Transportation, Keolis, National Express, DRT

## OUTPUT REQUIREMENTS

- Output ONLY semantic HTML content (NO <html>, <head>, <body> tags)
- Start directly with content: <p> or <h2>
- Use proper heading hierarchy with article-specific contextual headers
- Bold (**<strong class="font-semibold text-gray-900">**) all agency names, company names, locations, event names, people names, and key terms
- Format lists with SVG icons as shown above
- Preserve ALL factual content from original article (70%+ verbatim)
- Add sales intelligence analysis based on context provided
- Skip Cross-Sell Opportunities section if you cannot provide real source URLs
- Include 5-8 Lookalike Prospects (both public agencies AND private operators)
- Clean indentation (2 spaces per level)

## CHAIN OF THOUGHT PROCESS

1. **Extract News Hook**: Identify agency, action, scale, impact
2. **Preserve Original Content**: Keep 70%+ of original article verbatim with proper HTML formatting
3. **Generate Contextual Headers**: Create headers from actual article content (not generic templates)
4. **Analyze Technology Needs**: What systems/infrastructure does this require?
5. **Identify Buying Triggers**: What will they procure in next 6-18 months?
6. **Generate Lookalike List**: Which 5-8 agencies AND private operators have identical challenges?
7. **Find Cross-Sell Angles**: What complementary tech will they evaluate together? (No URLs needed)
8. **Assess Market Implications**: What does this signal industry-wide?
9. **Verify Output**: Confirm no document tags, proper nesting, bold key terms, private operators included

Remember: Preserve 70%+ original content, use article-specific headers, include both public agencies and private operators in Lookalike Prospects (First Transit, Transdev, MV Transportation, etc.).`;

    // First, transform the article
    const transformResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Transform this article following ALL instructions. You MUST include these sections with article-specific headers:

Article to transform:

${content}`,
          },
        ],
      }),
    });

    if (!transformResponse.ok) {
      const errorText = await transformResponse.text();
      console.error("AI Gateway error:", transformResponse.status, errorText);

      if (transformResponse.status === 429) {
        throw new Error("Rate limits exceeded");
      }
      if (transformResponse.status === 402) {
        throw new Error("Payment required");
      }
      throw new Error("AI gateway error");
    }

    const transformData = await transformResponse.json();
    let transformedContent = transformData.choices[0].message.content;
    transformedContent = transformedContent
      .replace(/```html\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Now extract entities from the transformed content
    const extractResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Extract transit agencies and transportation providers from the article. Return ONLY a JSON object with this structure:
{
  "agencies": [
    {"name": "Agency Name", "location": "City, State", "notes": "Brief context from article"}
  ],
  "providers": [
    {"name": "Provider Name", "location": "City, State", "provider_type": "contract-operator|paratransit|tnc|other", "notes": "Brief context"}
  ]
}

Rules:
- Extract ONLY entities explicitly mentioned in the article
- Include public transit agencies (CTA, WMATA, etc.)
- Include private operators (First Transit, Transdev, MV Transportation, etc.)
- Extract location from context if available
- Keep notes brief (1 sentence)
- Return valid JSON only, no markdown formatting`,
          },
          { role: "user", content: transformedContent },
        ],
      }),
    });

    if (!extractResponse.ok) {
      console.error("Entity extraction failed, continuing without entities");
      return new Response(
        JSON.stringify({
          transformedContent,
          agencies: [],
          providers: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const extractData = await extractResponse.json();
    let entitiesText = extractData.choices[0].message.content;

    // Clean up markdown code blocks if present
    entitiesText = entitiesText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let entities;
    try {
      entities = JSON.parse(entitiesText);
    } catch (e) {
      console.error("Failed to parse entities JSON:", e);
      entities = { agencies: [], providers: [] };
    }

    console.log("Transform successful, extracted entities:", {
      agencies: entities.agencies?.length || 0,
      providers: entities.providers?.length || 0,
    });

    return new Response(
      JSON.stringify({
        transformedContent,
        agencies: entities.agencies || [],
        providers: entities.providers || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in transform-article:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
