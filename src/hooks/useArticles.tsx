import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

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
          article_verticals(vertical)
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
    mutationFn: async (article: any) => {
      const { data, error } = await supabase
        .from("articles")
        .insert(article)
        .select()
        .single();

      if (error) throw error;
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
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("articles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
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
