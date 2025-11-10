import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          article_verticals(vertical),
          article_categories(category),
          article_agencies(agency_id, mention_type, transit_agencies(id, agency_name))
        `)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          article_agencies(agency_id, mention_type),
          article_providers(provider_id, mention_type),
          article_verticals(vertical),
          article_categories(category)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useArticleMutation() {
  const queryClient = useQueryClient();

  const createArticle = useMutation({
    mutationFn: async ({ 
      article, 
      verticals, 
      categories,
      agencies, 
      providers 
    }: { 
      article: any;
      verticals?: string[];
      categories?: string[];
      agencies?: string[];
      providers?: string[];
    }) => {
      const { data, error } = await supabase
        .from("articles")
        .insert(article)
        .select()
        .single();

      if (error) throw error;

      const articleId = data.id;

      // Insert verticals if provided
      if (verticals && verticals.length > 0) {
        await supabase.from("article_verticals").insert(
          verticals.map(vertical => ({ article_id: articleId, vertical }))
        );
      }

      // Insert categories if provided
      if (categories && categories.length > 0) {
        await supabase.from("article_categories").insert(
          categories.map(category => ({ article_id: articleId, category }))
        );
      }

      // Insert agencies if provided
      if (agencies && agencies.length > 0) {
        await supabase.from("article_agencies").insert(
          agencies.map(agency_id => ({ article_id: articleId, agency_id }))
        );
      }

      // Insert providers if provided
      if (providers && providers.length > 0) {
        await supabase.from("article_providers").insert(
          providers.map(provider_id => ({ article_id: articleId, provider_id }))
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateArticle = useMutation({
    mutationFn: async ({ 
      id, 
      updates, 
      verticals, 
      categories,
      agencies, 
      providers 
    }: { 
      id: string; 
      updates: any;
      verticals?: string[];
      categories?: string[];
      agencies?: string[];
      providers?: string[];
    }) => {
      const { data, error } = await supabase
        .from("articles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update verticals if provided
      if (verticals !== undefined) {
        await supabase.from("article_verticals").delete().eq("article_id", id);
        if (verticals.length > 0) {
          await supabase.from("article_verticals").insert(
            verticals.map(vertical => ({ article_id: id, vertical }))
          );
        }
      }

      // Update categories if provided
      if (categories !== undefined) {
        await supabase.from("article_categories").delete().eq("article_id", id);
        if (categories.length > 0) {
          await supabase.from("article_categories").insert(
            categories.map(category => ({ article_id: id, category }))
          );
        }
      }

      // Update agencies if provided
      if (agencies !== undefined) {
        await supabase.from("article_agencies").delete().eq("article_id", id);
        if (agencies.length > 0) {
          await supabase.from("article_agencies").insert(
            agencies.map(agency_id => ({ article_id: id, agency_id }))
          );
        }
      }

      // Update providers if provided
      if (providers !== undefined) {
        await supabase.from("article_providers").delete().eq("article_id", id);
        if (providers.length > 0) {
          await supabase.from("article_providers").insert(
            providers.map(provider_id => ({ article_id: id, provider_id }))
          );
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", data.id] });
      toast.success("Article updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  return { createArticle, updateArticle, deleteArticle };
}
