import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { content } = await req.json();

    if (!content) {
      throw new Error('No content provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a Sales Intelligence Article Transformer for the transit technology industry.

## CORE PRINCIPLE: PRESERVE ORIGINAL CONTENT (70%+)

**CRITICAL**: You must preserve at least 70% of the original article content VERBATIM. Do not rewrite, summarize, or paraphrase the original facts, quotes, dates, names, or context. Your job is to FORMAT the original content and ADD strategic intelligence sections.

## TRANSFORMATION FRAMEWORK

### 1. PRESERVE ORIGINAL ARTICLE CONTENT
- Keep all original paragraphs, facts, quotes, dates, names, and context exactly as written
- Format the preserved content with proper HTML tags
- Add contextual headers that reflect the ACTUAL article content (not generic templates)

### 2. ADD STRATEGIC INTELLIGENCE SECTIONS

After preserving the original article, add these analysis sections:

#### **Buying Triggers** (if applicable)
- Identify immediate procurement signals (6-18 month window)
- List specific technology categories for likely RFPs
- Include budget cycle implications
- Format as bulleted list

#### **Lookalike Prospects** (REQUIRED: 5-8 specific prospects)
- Must include BOTH public transit agencies AND private operators/contractors
- For each prospect, include: Agency/Company Name (Location), Fleet size, Specific parallel challenges
- Example: **First Transit (Cincinnati Operations)** - 150+ vehicles, contracted service provider facing similar fare modernization requirements
- Example: **Transdev (Denver RTD Contract)** - 200+ vehicles, contract operator requiring integrated technology solutions
- Research actual agencies and private operators with similar challenges

#### **Cross-Sell Opportunities** (with REAL source links)
- Each opportunity MUST include a clickable source link with actual URL
- Format: <a href="actual-url" target="_blank" rel="noopener noreferrer">Source description</a>
- Use capability-based language (scheduling optimization, real-time AVL, mobile data terminals) NOT specific product names
- If you cannot find real sources, SKIP this section entirely

#### **Market Implications**
- Analyze industry-wide adoption patterns
- Identify competitive positioning implications
- Predict procurement timeline patterns

## HTML FORMATTING RULES

### Paragraphs:
<p class="mt-6 text-gray-600">paragraph text here</p>

### Section Headers (article-specific, not generic):
<h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900">Actual Article Context Title</h2>

### Entity Bolding:
<strong class="font-semibold text-gray-900">Agency names, locations, events, people names, companies</strong>

### Bulleted Lists:
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span>Bullet point text</span>
</li>
</ul>

### Links:
<a href="actual-url" target="_blank" rel="noopener noreferrer">Link text</a>

## KEY PRINCIPLES

1. **Preserve, Don't Rewrite**: Keep original article content verbatim
2. **Contextual Headers**: Generate headers from actual article content, not generic templates
3. **Specific Names**: Use actual agency names, company names, locations, and fleet sizes
4. **Real Sources**: Include actual URLs for cross-sell opportunities or skip the section
5. **Both Public & Private**: Include private operators (First Transit, Transdev, MV Transportation, etc.) in lookalike prospects

Return ONLY formatted HTML. No explanations. No code blocks.`;



    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Format this article with structured HTML. Preserve ALL content exactly - no summarizing.\n\n${content}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limits exceeded');
      }
      if (response.status === 402) {
        throw new Error('Payment required');
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    let transformedContent = data.choices[0].message.content;

    // Remove markdown code blocks if present
    transformedContent = transformedContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Transform successful, content length:', transformedContent.length);

    return new Response(
      JSON.stringify({ transformedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in transform-article:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
