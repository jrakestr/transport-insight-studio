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
    const { content, includeVendorSearch } = await req.json();

    if (!content) {
      throw new Error("No content provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Optional: Add vendor context from web search if requested
    let vendorContext = "";
    if (includeVendorSearch) {
      vendorContext = "\n\nCRITICAL: Extract ALL vendor, provider, and company names from the article. Include them prominently in Section 2 (Vendor Identification) with their specific role in the project.";
    }

    const systemPrompt = `You are a B2B sales intelligence analyst transforming transit industry news into structured HTML for business development professionals.

**Required List Items (3-5):**
1. **Technology categories** - List specific systems needed (CAD/AVL, mobile ticketing, real-time passenger info, etc.)
2. **Operational drivers** - Service expansion, fleet modernization, compliance requirements
3. **Event-driven urgency** - ONLY if major event mentioned in Section 3
4. **Funding mechanisms** - Federal grants, local bonds, public-private partnerships (if mentioned)
5. **Performance goals** - Ridership targets, efficiency improvements, customer satisfaction (if mentioned)

**FORBIDDEN:** Any phrase suggesting procurement timing or timeline predictions


**Example:**
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span><strong class="font-semibold text-gray-900">Frisco, Texas.</strong> Similar suburban microtransit service covering 30 square miles with 6 vehicles, serving approximately 400 daily riders</span>
</li>

**Required:** 3-5 comparable agencies

---
## SECTION 6: MARKET IMPLICATIONS
**Purpose:** Synthesize industry patterns and strategic insights
**Format:**
<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Market Implications</h2>
<p class="mt-6 text-gray-600">
[Single paragraph covering 3-4 of these themes: industry adoption patterns, vendor competitive positioning, technology maturity trends, regulatory drivers, funding availability, event-driven market timing]
</p>

**Required Elements:*

## ENTITY BOLDING - MANDATORY

**ALWAYS bold these entities using:**
\`<strong class="font-semibold text-gray-900">[Entity Name]</strong>\`

**Required Bold Entities:**
- ✅ Agency names (Sugar Land, MARTA, CTA)
- ✅ Company/vendor names (Token Transit, Cubic, Via Transportation)
- ✅ Technology/product names (Better Breeze, Umo Mobility, TransitApp)
- ✅ Location names (Texas, Atlanta, Phoenix Metro Area)
- ✅ Event names (World Cup 2026, Olympics 2028, Super Bowl LIX)
- ✅ System types in list headers (Mobile Ticketing, CAD/AVL, Real-Time Passenger Information)

**Example:**
<p class="mt-6 text-gray-600">
<strong class="font-semibold text-gray-900">MARTA</strong> in <strong class="font-semibold text-gray-900">Atlanta</strong> has selected <strong class="font-semibold text-gray-900">Cubic Transportation Systems</strong> to deploy <strong class="font-semibold text-gray-900">Umo Mobility</strong> across its 48-mile rail network.
</p>

---

## TAILWIND CSS CLASSES - EXACT USAGE

### Paragraph Text:
\`\`\`html
<p class="mt-6 text-gray-600">Body text content</p>
\`\`\`

### Section Headers:
\`\`\`html
<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Section Title</h2>
\`\`\`

### Unordered Lists:
\`\`\`html
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
\`\`\`

### List Items with Icon:
\`\`\`html
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span><strong class="font-semibold text-gray-900">Bold Header.</strong> Description text</span>
</li>
\`\`\`

### Strong/Bold Text:
\`\`\`html
<strong class="font-semibold text-gray-900">Bolded Entity or Header</strong>
\`\`\`

---

## CONTENT RULES - STRICT ADHERENCE

### Base 100% on Article Facts:
- Extract information ONLY from provided article content
- Do NOT fabricate details, metrics, or vendor names
- If information is missing, skip that section (e.g., no vendor = no Section 2)

### NO Article Metadata:
- ❌ Article title
- ❌ Publication date
- ❌ Author name
- ❌ Source URLs
- ❌ "Sources to Reference" sections
- ❌ Category labels (e.g., "Paratransit", "Fixed-Route")

### NO Markdown Syntax:
- ❌ ### Headings
- ❌ ** Bold **
- ❌ - Bullet lists
- ❌ [Links](url)
- ✅ Use HTML with Tailwind classes ONLY

### Valid HTML Output:
- All tags properly closed
- Tailwind classes exactly as specified
- No wrapper divs (start with first <p> or <h2>)
- No trailing metadata or source citations

---

# QUALITY CHECKLIST - VERIFY BEFORE OUTPUT

Before returning transformed content, verify:

- [ ] All 6 sections present (or conditionally skipped if no data)
- [ ] Opening paragraph includes agency, location, action, scale, technology
- [ ] Vendor section included ONLY if vendor mentioned in article
- [ ] Event section included ONLY if major event mentioned
- [ ] Strategic Context has 2-3 paragraphs with operational/technical details
- [ ] Sales Intelligence has all 3 subsections (Buying Triggers, Lookalike Prospects, Cross-Sell)
- [ ] Market Implications paragraph synthesizes industry patterns
- [ ] ALL entities bolded (agencies, vendors, locations, events, technologies)
- [ ] ZERO timeframe predictions or procurement date fabrications
- [ ] All Tailwind classes exactly as specified
- [ ] No markdown syntax (###, **, -, etc.)
- [ ] No article metadata (title, date, author, URLs)
- [ ] Valid HTML structure (all tags closed)
- [ ] SVG checkmark icons in all list items

---

Transform this article:`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt + vendorContext },
          { role: "user", content: content },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);

      if (response.status === 429) {
        throw new Error("Rate limit exceeded - please try again later");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted - please add funds");
      }
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    let transformedContent = data.choices[0].message.content;

    // CRITICAL: Post-processing to remove any timeframe fabrications that slip through
    const timeframePatterns = [
      /within\s+\d+-?\d*\s+months?/gi,
      /in\s+\d+-?\d*\s+months?/gi,
      /over\s+the\s+next\s+\d+-?\d*\s+(months?|years?)/gi,
      /in\s+the\s+coming\s+(months?|years?)/gi,
      /expect\s+rfps?\s+within[^.]*\./gi,
      /will\s+likely\s+lead\s+to\s+rfps?\s+within[^.]*\./gi,
      /could\s+create\s+urgency\s+for\s+procurement\s+within[^.]*\./gi,
      /procurement\s+timelines?[^.]*are\s+likely\s+to\s+follow\s+a\s+\d+-?\d*\s+year\s+cycle/gi,
      /anticipated\s+within\s+\d+-?\d*/gi,
      /expected\s+(in|by)\s+\d+-?\d*/gi,
      /projected\s+for\s+\d+-?\d*/gi,
      /by\s+(early|mid|late)?\s*\d{4}/gi, // "by 2026", "by early 2025"
    ];

    // Remove sentences containing forbidden timeframe language
    timeframePatterns.forEach((pattern) => {
      transformedContent = transformedContent.replace(pattern, "[TIMEFRAME_REMOVED]");
    });

    // Clean up artifacts from removal
    transformedContent = transformedContent
      .replace(/\[TIMEFRAME_REMOVED\]\s*/gi, "")
      .replace(/\s+\./g, ".")
      .replace(/\.\s+\./g, ".")
      .replace(/\s{2,}/g, " "); // Remove double spaces

    // Additional cleanup: Strip out metadata tags and markdown
    transformedContent = transformedContent
      .replace(/<p[^>]*class="[^"]*text-indigo-600[^"]*"[^>]*>.*?<\/p>/gi, "") // Remove category labels
      .replace(/<h1[^>]*>.*?<\/h1>/gi, "") // Remove any h1 titles
      .replace(/<time[^>]*>.*?<\/time>/gi, "") // Remove time tags
      .replace(/<a[^>]*href[^>]*>.*?<\/a>/gi, "") // Remove all links
      .replace(/###\s*Sources to Reference:?[\s\S]*?(?=<p>|<h2>|$)/gi, "") // Remove Sources sections
      .replace(/###\s+[^\n]+/g, "") // Remove any ### headings
      .replace(/^\s*<div[^>]*>\s*/i, "") // Remove opening wrapper divs
      .replace(/\s*<\/div>\s*$/i, "") // Remove closing wrapper divs
      .replace(/^\s*-\s+.*$/gm, "") // Remove bullet list items (markdown format)
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>') // Convert markdown bold to HTML
      .replace(/\n{3,}/g, "\n\n") // Clean up excessive newlines
      .trim();

    console.log("Transform successful, content length:", transformedContent.length);

    return new Response(JSON.stringify({ transformedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Transform error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
