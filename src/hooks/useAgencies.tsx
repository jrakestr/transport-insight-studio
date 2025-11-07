import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAgencies() {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transit_agencies")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

export function useAgency(id: string | undefined) {
  return useQuery({
    queryKey: ["agency", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("transit_agencies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useAgencyMutation() {
  const queryClient = useQueryClient();

  const createAgency = useMutation({
    mutationFn: async (agency: any) => {
      const { data, error } = await supabase
        .from("transit_agencies")
        .insert(agency)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      toast.success("Agency created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateAgency = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("transit_agencies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      toast.success("Agency updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteAgency = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transit_agencies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      toast.success("Agency deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  return { createAgency, updateAgency, deleteAgency };
}
