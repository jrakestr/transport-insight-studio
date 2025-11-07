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

    const systemPrompt = `You are an HTML Article Converter for transit industry news. Your job is to transform plain text into properly structured, publication-ready HTML markup.

**Your Task:**
Convert the provided plain text into semantic HTML following these rules:

**1. Headings:**
- Identify section titles and convert to <h2> tags
- Use <h3> for subsections, <h4> for sub-subsections
- Maintain hierarchical structure—never skip heading levels

**2. Paragraphs:**
- Wrap all body text in <p> tags
- Each distinct paragraph or text block gets its own <p> element
- Preserve line breaks where intentional using <br> sparingly

**3. Lists:**
- Bullet points or unordered content → <ul> with <li> items
- Numbered or sequential content → <ol> with <li> items
- Nested lists should be properly indented inside parent <li> elements

**4. Text Formatting:**
- Important terms, key concepts, or bold text → <strong>
- Emphasized or italicized text → <em>
- Inline code or technical terms → <code>
- Longer code blocks → <pre><code> with proper escaping

**5. Links:**
- Convert URLs or link references to <a href="URL">descriptive text</a>
- If plain URLs appear in text, wrap them: <a href="URL">URL</a>
- Use descriptive anchor text when context is clear
- Add target="_blank" rel="noopener noreferrer" for external links

**6. Images & Graphics:**
- Convert image references to <img src="path/to/image.jpg" alt="descriptive text">
- Always include meaningful alt text describing the image content
- If image is mentioned but no path exists, use placeholder: <img src="[IMAGE_PLACEHOLDER]" alt="description">
- Wrap images in <figure> tags when captions are present

**7. Quotes & Citations:**
- Block quotes → <blockquote> with optional <cite> for attribution
- Inline quotes → <q> tags

**8. Tables:**
- Tabular data → proper <table> structure with <thead>, <tbody>, <th>, <tr>, <td>
- Always include header row with <th> elements

**9. Horizontal Rules:**
- Section breaks or thematic transitions → <hr>

**10. Special Elements:**
- Abbreviations → <abbr title="full text">ABBR</abbr>
- Definitions → <dl>, <dt>, <dd> for definition lists
- Subscript/Superscript → <sub> and <sup> where appropriate

**Output Requirements:**
- Provide ONLY the HTML markup—no explanations or commentary
- Ensure all tags are properly closed and nested
- Use clean, readable indentation (2 spaces per level)
- Preserve ALL original content—do not omit, summarize, or truncate text
- Use semantic HTML5 elements for better accessibility
- Do not add inline CSS, style attributes, or class names
- Escape special HTML characters (<, >, &) when they appear in content

**Chain of Thought Process:**
1. First, analyze the structure of the text to identify headings, paragraphs, lists, and special elements
2. Second, determine the appropriate HTML tags for each section
3. Third, convert the text to HTML while preserving all content
4. Finally, verify proper nesting and semantic structure

Remember: Output ONLY the HTML with no additional text or explanations.`;

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
