import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProviders() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transportation_providers")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

export function useProvider(id: string | undefined) {
  return useQuery({
    queryKey: ["provider", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("transportation_providers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useProviderMutation() {
  const queryClient = useQueryClient();

  const createProvider = useMutation({
    mutationFn: async (provider: any) => {
      const { data, error } = await supabase
        .from("transportation_providers")
        .insert(provider)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateProvider = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("transportation_providers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteProvider = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transportation_providers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  return { createProvider, updateProvider, deleteProvider };
}
