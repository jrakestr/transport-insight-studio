import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProviders(params?: { search?: string; limit?: number }) {
  const { search, limit = 100 } = params || {};
  
  return useQuery({
    queryKey: ["providers", search, limit],
    queryFn: async () => {
      let query = supabase
        .from("agency_vendors")
        .select("*")
        .order("name", { ascending: true });

      if (search) {
        query = query.or(`name.ilike.%${search}%,provider_type.ilike.%${search}%,location.ilike.%${search}%`);
      }

      if (limit <= 1000) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
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
        .from("agency_vendors")
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
        .from("agency_vendors")
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
        .from("agency_vendors")
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
      const { error } = await supabase.from("agency_vendors").delete().eq("id", id);
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
