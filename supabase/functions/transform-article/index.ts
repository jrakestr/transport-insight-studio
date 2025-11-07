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

**CRITICAL OUTPUT RULE:**
Output ONLY the article content HTML - NO <html>, <head>, <body>, or other document structure tags. Start directly with content tags like <p>, <h2>, etc.

**Your Task:**
Convert the provided plain text into semantic HTML following these rules:

**1. Headings:**
- Main section titles → <h2> tags (this is your PRIMARY heading level)
- Subsections within those sections → <h3> tags
- Sub-subsections → <h4> tags
- NEVER skip heading levels (don't use <h3> without <h2> first)
- If the article has multiple major sections, each gets an <h2>

**2. Article Metadata:**
- If content starts with date/author info, structure it semantically:
  - Use <time datetime="YYYY-MM-DD">formatted date</time> for dates
  - Wrap author in appropriate tag (can use <p> or <div> with semantic meaning)
  - Consider wrapping metadata in a container element

**3. Paragraphs:**
- Wrap all body text in <p> tags
- Each distinct paragraph or text block gets its own <p> element
- Avoid using <br> tags - create separate <p> elements instead

**4. Lists:**
- Bullet points or unordered content → <ul> with <li> items
- Numbered or sequential content → <ol> with <li> items
- Nested lists should be properly indented inside parent <li> elements

**5. Text Formatting:**
- Important terms, key concepts, or bold text → <strong>
- Emphasized or italicized text → <em>
- Inline code or technical terms → <code>
- Longer code blocks → <pre><code> with proper escaping

**6. Links:**
- Convert URLs or link references to <a href="URL">descriptive text</a>
- If plain URLs appear in text, wrap them: <a href="URL">URL</a>
- Use descriptive anchor text when context is clear
- Add target="_blank" rel="noopener noreferrer" for external links

**7. Images & Graphics:**
- Convert image references to <img src="path/to/image.jpg" alt="descriptive text">
- Always include meaningful alt text describing the image content
- If image is mentioned but no path exists, use placeholder: <img src="[IMAGE_PLACEHOLDER]" alt="description">
- Wrap images in <figure> tags when captions are present

**8. Quotes & Citations:**
- Block quotes → <blockquote> with optional <cite> for attribution
- Inline quotes → <q> tags

**9. Tables:**
- Tabular data → proper <table> structure with <thead>, <tbody>, <th>, <tr>, <td>
- Always include header row with <th> elements

**10. Horizontal Rules:**
- Section breaks or thematic transitions → <hr>

**11. Special Elements:**
- Abbreviations → <abbr title="full text">ABBR</abbr>
- Definitions → <dl>, <dt>, <dd> for definition lists
- Subscript/Superscript → <sub> and <sup> where appropriate

**Output Requirements:**
- Provide ONLY the content HTML—NO <html>, <head>, <body>, or document structure tags
- Start directly with content elements (<time>, <p>, <h2>, <figure>, etc.)
- Ensure all tags are properly closed and nested
- Use clean, readable indentation (2 spaces per level)
- Preserve ALL original content—do not omit, summarize, or truncate text
- Use semantic HTML5 elements for better accessibility
- Do not add inline CSS, style attributes, or class names
- Escape special HTML characters (<, >, &) when they appear in content
- Never skip heading levels in hierarchy

**Chain of Thought Process:**
1. First, identify any metadata (date, author) at the beginning and structure it semantically
2. Second, analyze the structure to identify major sections (should become <h2>) and subsections (<h3>)
3. Third, determine appropriate HTML tags for each content type (paragraphs, lists, quotes, etc.)
4. Fourth, convert text to HTML while preserving all content and proper heading hierarchy
5. Finally, verify proper nesting, semantic structure, and that you have NOT included any document structure tags

Remember: Output ONLY the content HTML starting with elements like <time>, <p>, or <h2>. NO <html>, <head>, or <body> tags.`;

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
