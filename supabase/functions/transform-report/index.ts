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

    const systemPrompt = `Convert this Data Dispatch Report into semantic HTML with Tailwind CSS styling.

HTML FORMATTING RULES:

Heading Hierarchy:
• <h1> is a separate field, do not include the h1 title in the output
• <h2> for major sections (e.g., "EXECUTIVE SUMMARY", "1. MICROTRANSIT & ON-DEMAND SERVICES", "RECOMMENDATIONS")
• <h3> for subsections within those sections (e.g., "Major Launches & Expansions", "Challenges")
• NEVER skip heading levels

Content Formatting:
• All body text in <p> tags with class="mt-6 text-gray-600"
• Lists as Tailwind bulleted <ul><li> format with SVG icons
• Bold key terms with <strong class="font-semibold text-gray-900">: agency names, company names, locations, event names, people names, dollar amounts, numbers, dates
• Bold and preserve ALL FIGURES, numbers: "$1,500" not "fifteen hundred", "1,500+ vehicles"
• Preserve exact formatting of dashes/separators (e.g., "----------")
• External links: <a href="URL" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">text</a>

Headings:
• <h2 class="mt-16 text-3xl font-semibold tracking-tight text-pretty text-gray-900"> for major sections
• <h3 class="mt-12 text-2xl font-semibold tracking-tight text-gray-900"> for subsections

Paragraphs:
• <p class="mt-6 text-gray-600"> for all body text

Bulleted Lists:
<ul role="list" class="mt-8 max-w-xl space-y-8 text-gray-600">
<li class="flex gap-x-3">
  <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="mt-1 size-5 flex-none text-indigo-600">
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" fill-rule="evenodd" />
  </svg>
  <span>Bullet point text with <strong class="font-semibold text-gray-900">bolded key terms</strong></span>
</li>
</ul>

Horizontal Separators:
• Convert "----------" or similar to <hr class="my-12 border-t border-gray-300">

OUTPUT REQUIREMENTS:
- Output ONLY semantic HTML content (NO <html>, <head>, <body> tags)
- Start directly with content: <p> or <h2>
- Use proper heading hierarchy (h2 for main sections, h3 for subsections)
- Bold all agency names, company names, locations, event names, people names, dollar amounts, numbers, dates
- Format lists with SVG icons as shown above
- Clean indentation (2 spaces per level)
- Preserve all factual content from original exactly as written
- Maintain report structure and organization`;

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
            content: `Format this Data Dispatch Report into semantic HTML following the instructions:

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

    console.log("Report transform successful");

    return new Response(
      JSON.stringify({
        transformedContent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in transform-report:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
