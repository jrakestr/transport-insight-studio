import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgenciesQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  state?: string;
}

export function useAgencies(params: AgenciesQueryParams = {}) {
  const { page = 1, limit = 20, sortBy = 'agency_name', sortOrder = 'asc', search, state } = params;
  
  return useQuery({
    queryKey: ["agencies", page, limit, sortBy, sortOrder, search, state],
    queryFn: async () => {
      let query = supabase
        .from("transit_agencies")
        .select("*", { count: 'exact' });

      // Apply search filter
      if (search) {
        query = query.or(`agency_name.ilike.%${search}%,doing_business_as.ilike.%${search}%,ntd_id.ilike.%${search}%,city.ilike.%${search}%`);
      }

      // Apply state filter
      if (state) {
        query = query.eq('state', state);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc', nullsFirst: false });

      // Apply pagination only if limit is not very large (used for selection lists)
      if (limit < 1000) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      return {
        agencies: data,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
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
