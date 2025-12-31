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
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content } = await req.json();

    // Input validation
    if (!content) {
      return new Response(JSON.stringify({ error: "No content provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (typeof content !== 'string') {
      return new Response(JSON.stringify({ error: "Content must be a string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (content.length > 500000) {
      return new Response(JSON.stringify({ error: "Content too long: limit is 500000 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `Convert the provided content into semantic HTML with Tailwind CSS styling.

HTML FORMATTING RULES:

Heading Hierarchy:
• <h1> is a separate field, do not include the h1 title in the output
• <h2> for major sections
• <h3> for subsections within those sections
• NEVER skip heading levels

Content Formatting:
• All body text in <p> tags
• Lists as Tailwind bulleted <ul><li> format
• Bold key terms with styled <strong class="font-semibold text-gray-900">: agency names, company names, locations, event names, people names, and key terms
• Bold and preserve ALL FIGURES, numbers: "1,500+ vehicles" not "fifteen hundred"
• External links: <a href="URL" target="_blank" rel="noopener noreferrer">text</a>

Images:
• If referenced: <figure><img src="[IMAGE_PLACEHOLDER]" alt="descriptive text"><figcaption>caption</figcaption></figure>

Bulleted Lists:
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span>Bullet point text</span>
</li>
</ul>

OUTPUT REQUIREMENTS:
- Output ONLY semantic HTML content (NO <html>, <head>, <body> tags)
- Start directly with content: <p> or <h2>
- Use proper heading hierarchy
- Bold all agency names, company names, locations, event names, people names, and key terms
- Format lists with SVG icons as shown above
- Clean indentation (2 spaces per level)
- Preserve all factual content from original exactly as written`;

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
            content: `Format this content into semantic HTML following the instructions:

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
