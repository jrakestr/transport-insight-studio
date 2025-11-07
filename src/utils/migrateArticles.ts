import { supabase } from "@/integrations/supabase/client";
import { articles } from "@/data/articles";
import { marked } from "marked";

// Configure marked for better HTML output
marked.setOptions({
  gfm: true,
  breaks: true,
});

export async function migrateArticlesToDatabase() {
  const results = {
    success: [] as string[],
    errors: [] as { title: string; error: string }[],
  };

  for (const article of articles) {
    try {
      // Convert markdown content to HTML
      const htmlContent = await marked(article.content);

      // Prepare article data for database
      const articleData = {
        title: article.title,
        slug: article.slug,
        description: article.description,
        content: htmlContent,
        published_at: article.datetime,
        category: article.category.title,
        source_url: article.sourceUrl,
        source_name: article.sourceName,
        image_url: article.imageUrl,
        author_name: article.author.name,
        author_role: article.author.role,
      };

      // Insert or update article
      const { error } = await supabase
        .from("articles")
        .upsert(articleData, { onConflict: "slug" });

      if (error) {
        results.errors.push({
          title: article.title,
          error: error.message,
        });
      } else {
        results.success.push(article.title);
      }
    } catch (error) {
      results.errors.push({
        title: article.title,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}
