import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Playbook {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  icon: string | null;
  category: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const usePlaybooks = () => {
  return useQuery({
    queryKey: ["playbooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playbooks")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as Playbook[];
    },
  });
};

export const usePlaybook = (id: string) => {
  return useQuery({
    queryKey: ["playbook", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playbooks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Playbook;
    },
    enabled: !!id,
  });
};

export const useCreatePlaybook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playbook: Omit<Playbook, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("playbooks")
        .insert(playbook)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast.success("Playbook created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create playbook: ${error.message}`);
    },
  });
};

export const useUpdatePlaybook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...playbook }: Partial<Playbook> & { id: string }) => {
      const { data, error } = await supabase
        .from("playbooks")
        .update(playbook)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast.success("Playbook updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update playbook: ${error.message}`);
    },
  });
};

export const useDeletePlaybook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("playbooks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast.success("Playbook deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete playbook: ${error.message}`);
    },
  });
};
