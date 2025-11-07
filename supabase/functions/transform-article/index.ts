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
    const { content, includeVendorSearch } = await req.json();
    
    if (!content) {
      throw new Error('No content provided');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Optional: Add vendor context from web search if requested
    let vendorContext = "";
    if (includeVendorSearch) {
      // This would require additional implementation for web search
      // For now, we'll rely on the AI to extract vendor info from the article content
      vendorContext = "\n\nIMPORTANT: Search the article content carefully for any vendor, provider, or company names involved in this project and include them prominently in your output.";
    }

    const systemPrompt = `You are a B2B sales intelligence analyst converting transit industry news into actionable intelligence for technology vendors marketing scheduling software, dispatch systems, fleet management platforms, and operational tools to transit agencies.

**PRIORITY #1 - IDENTIFY STATED FUTURE PLANS (PRIMARY BUYING SIGNALS):**

Search the article for phrases indicating agency intentions:
- "Looking ahead" / "will continue to" / "plans to" / "ultimate goal" / "future phases"
- "as funding becomes available" / "eventual goal" / "phased expansion" / "next phase"
- Any statement about what the agency intends to do next

**THESE ARE FACTS, NOT FABRICATIONS** - The agency is telling you what they need.

Treatment of future plans:
✅ Feature prominently in opening paragraph
✅ Make them the centerpiece of Buying Triggers section  
✅ Build entire analysis around stated agency intentions
✅ Example: "will expand citywide" = ongoing demand for scalable platforms
✅ Example: "as funding becomes available" = budget-dependent procurement signal

DO NOT confuse with fabricating timelines:
✅ "Agency plans citywide expansion" (stated in article)
❌ "Expansion will happen in 12 months" (fabricated timeline)

---

**OUTPUT STRUCTURE (4 SECTIONS):**

**SECTION 1: Opening Paragraph (The News Hook)**
Format: 2-3 sentences presenting factual developments
<p class="mt-6 text-gray-600">[Content here]</p>

Required elements:
- Agency name and geographic coverage area (bold with <strong class="font-semibold text-gray-900">)
- Specific action with precise verb (launched, awarded, approved, implemented)
- Scale metrics (dollar amounts, vehicle counts, service area dimensions)
- Technology/operational change description
- **IF ARTICLE MENTIONS FUTURE PLANS, FEATURE THEM HERE**

If vendor/provider mentioned:
<p class="mt-6 text-gray-600"><strong class="font-semibold text-gray-900">Primary Vendor:</strong> [Company name] and brief role description</p>

If major event/deadline mentioned:
<p class="mt-6 text-gray-600"><strong class="font-semibold text-gray-900">Event Driver:</strong> [Event name, date] and how it creates urgency</p>

---

**SECTION 2: Strategic Context and Technology Requirements**
<p class="mt-6 text-gray-600">[Content here]</p>

Include:
- Operational systems required to support the initiative
- Data infrastructure challenges created by the change
- Scale of technology deployment (vehicle count, user count, data volume)
- Integration requirements with existing systems

---

**SECTION 3: Sales Intelligence Analysis (CRITICAL SECTION)**

Use this EXACT HTML structure for each subsection:

<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Buying Triggers</h2>
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span><strong class="font-semibold text-gray-900">[Category Name].</strong> [Description]</span>
</li>
</ul>

**Buying Triggers Content Requirements:**
Immediate procurement signals indicating purchase readiness

**STATED FUTURE PLANS GO HERE FIRST** - If the article says "will expand", "plans to", "ultimate goal", this is your PRIMARY buying trigger

Each bullet must identify:
- Specific technology categories (CAD/AVL systems, mobile apps, fare collection platforms)
- Budget cycle implications (federal deadlines, fiscal year constraints)
- Organizational readiness signals (technology maturity, change management capability)  
- Regulatory/compliance drivers creating urgency
- Major events creating timeline pressure (World Cup 2026, Olympics, conferences)

**DO NOT fabricate procurement timelines. State WHAT is needed, NOT WHEN it will be procured.**

---

<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Lookalike Prospects</h2>
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span><strong class="font-semibold text-gray-900">[Agency Name].</strong> [Details]</span>
</li>
</ul>

**Lookalike Prospects Content Requirements:**
Comparable agencies facing identical challenges (target account list)

Each prospect bullet must include:
- Agency name and geographic location (bold agency name)
- Fleet size (vehicles/ridership for scale comparison)
- Specific parallel challenges matching the article's focus
- Procurement timing signals if known (recent RFPs, budget cycles)

**Minimum 3-5 named agencies with specific details.**

---

<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Cross-Sell Opportunities</h2>
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span><strong class="font-semibold text-gray-900">[Technology Category].</strong> [Description]</span>
</li>
</ul>

**Cross-Sell Opportunities Content Requirements:**
Adjacent technology procurements evaluated within the same budget cycle

Identify:
- Complementary systems integrating with primary procurement
- Technology categories solving related operational challenges  
- Implementation timing synergies (unified go-live dates)

---

**SECTION 4: Market Implications**
<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Market Implications</h2>
<p class="mt-6 text-gray-600">[Content here]</p>

Include:
- Industry-wide adoption patterns emerging from the news
- Competitive positioning implications for vendors
- Technology architecture trends (cloud vs. on-premises, integration requirements)
- Event-driven market dynamics if applicable
- **NO fabricated procurement timeline predictions**

---

**CORE WRITING PRINCIPLES:**

1. **Specificity Over Generality** - Name specific agencies, vendors, technologies, dollar amounts
2. **Quantify Everything** - Fleet sizes, ridership numbers, budget amounts, service areas
3. **Name Names** - Bold all agency names, vendor names, technology names, locations, events
4. **Connect to Buying Behavior** - Explain WHY this creates procurement need
5. **Pattern Recognition** - Identify which agencies face similar challenges

---

**CRITICAL FORMATTING RULES:**

**FORBIDDEN LANGUAGE - NEVER INCLUDE:**
❌ "within 6-12 months" / "within 12-18 months" / "within X-Y months"
❌ "Expect RFPs within..."
❌ "will likely lead to RFPs within..."
❌ "anticipated within", "expected in", "projected for" + timeframes
❌ ANY specific procurement timing predictions

**CORRECT ALTERNATIVES:**
✅ "The expansion creates demand for advanced microtransit platforms"
✅ "Federal grant cycles may drive procurement decisions"
✅ "The agency has demonstrated readiness to invest in technology"
✅ State WHAT is needed, NOT WHEN procurement will happen

**REQUIRED BOLDING:**
Use <strong class="font-semibold text-gray-900"> for:
- Agency names (Sugar Land, MARTA, Capital Metro)
- Vendor/company names (Token Transit, Via, Cubic)
- Technology/product names (Better Breeze, Uber Health)
- Location names (Texas, Atlanta, Austin)
- Event names (World Cup 2026, Olympics 2028)

**HTML OUTPUT REQUIREMENTS:**
- Output ONLY valid HTML with Tailwind CSS classes
- NO markdown (no ###, no **, no --)
- NO article metadata (title, date, author, source URLs)
- Use semantic HTML: <div>, <p>, <ul>, <li>, <h2>, <strong>
- Body text: text-gray-600
- Headers: text-gray-900  
- Use mt-6, mt-8, mt-16 for spacing as shown

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
          { role: 'system', content: systemPrompt + vendorContext },
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

    // CRITICAL: Post-processing to remove any timeframe fabrications that slip through
    const timeframePatterns = [
      /within\s+\d+-?\d*\s+months?/gi,
      /in\s+\d+-?\d*\s+months?/gi,
      /over\s+the\s+next\s+\d+-?\d*\s+months?/gi,
      /expect\s+rfps?\s+within[^.]*\./gi,
      /will\s+likely\s+lead\s+to\s+rfps?\s+within[^.]*\./gi,
      /could\s+create\s+urgency\s+for\s+procurement\s+within[^.]*\./gi,
      /procurement\s+timelines?[^.]*are\s+likely\s+to\s+follow\s+a\s+\d+-?\d*\s+year\s+cycle/gi,
      /anticipated\s+within\s+\d+-?\d*/gi,
      /expected\s+in\s+\d+-?\d*/gi,
      /projected\s+for\s+\d+-?\d*/gi
    ];
    
    // Remove sentences containing forbidden timeframe language
    timeframePatterns.forEach(pattern => {
      transformedContent = transformedContent.replace(pattern, '[timeframe removed]');
    });
    
    // Clean up artifacts from removal
    transformedContent = transformedContent
      .replace(/\[timeframe removed\]\s*/gi, '')
      .replace(/\s+\./g, '.')
      .replace(/\.\s+\./g, '.');

    // Additional cleanup: Strip out metadata tags
    transformedContent = transformedContent
      .replace(/<p[^>]*class="[^"]*text-indigo-600[^"]*"[^>]*>.*?<\/p>/gi, '') // Remove category labels
      .replace(/<h1[^>]*>.*?<\/h1>/gi, '') // Remove any h1 titles
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
