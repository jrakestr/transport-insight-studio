import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePendingArticles = (status = 'pending') => {
  return useQuery({
    queryKey: ["pending-articles", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pending_articles")
        .select("*")
        .eq("review_status", status)
        .order("discovered_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const usePendingArticleMutations = () => {
  const queryClient = useQueryClient();

  const approveArticle = useMutation({
    mutationFn: async ({ articleId, notes }: { articleId: string; notes?: string }) => {
      // Get pending article
      const { data: pending, error: fetchError } = await supabase
        .from("pending_articles")
        .select("*")
        .eq("id", articleId)
        .single();

      if (fetchError) throw fetchError;

      // Create slug
      const slug = pending.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Create published article
      const { data: article, error: insertError } = await supabase
        .from("articles")
        .insert({
          title: pending.title,
          slug: slug,
          description: pending.description,
          content: pending.content,
          published_at: pending.published_at,
          source_url: pending.source_url,
          source_name: pending.source_name,
          image_url: pending.image_url,
          author_name: pending.author_name,
          author_role: pending.author_role,
          category: pending.extracted_category,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update pending article status
      const { error: updateError } = await supabase
        .from("pending_articles")
        .update({
          review_status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewer_notes: notes,
          published_article_id: article.id,
        })
        .eq("id", articleId);

      if (updateError) throw updateError;

      return article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article published successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectArticle = useMutation({
    mutationFn: async ({ articleId, reason }: { articleId: string; reason: string }) => {
      const { error } = await supabase
        .from("pending_articles")
        .update({
          review_status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewer_notes: reason,
        })
        .eq("id", articleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-articles"] });
      toast.success("Article rejected");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const triggerDiscovery = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("discover-articles");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pending-articles"] });
      toast.success(`Found ${data.articles_added} new articles to review`);
    },
    onError: (error) => {
      toast.error(`Discovery failed: ${error.message}`);
    },
  });

  return {
    approveArticle,
    rejectArticle,
    triggerDiscovery,
  };
};
