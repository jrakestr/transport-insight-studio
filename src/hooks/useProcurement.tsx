import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProcurementSearchRun {
  id: string;
  agency_id: string;
  status: string;
  current_phase: number;
  phases_completed: any[];
  confidence_score: number | null;
  opportunities_found: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProcurementOpportunity {
  id: string;
  agency_id: string;
  search_run_id: string | null;
  title: string;
  description: string | null;
  opportunity_type: string | null;
  source_url: string;
  source_type: string | null;
  deadline: string | null;
  estimated_value: number | null;
  contact_info: any;
  extracted_data: any;
  confidence_score: number | null;
  is_verified: boolean | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyProcurementStatus {
  id: string;
  agency_id: string;
  last_search_at: string | null;
  last_search_run_id: string | null;
  overall_confidence: number | null;
  total_opportunities_found: number | null;
  procurement_portal_url: string | null;
  has_active_rfps: boolean | null;
  next_search_due: string | null;
  search_priority: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Hook to get procurement opportunities for an agency
export const useAgencyProcurementOpportunities = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ["procurement-opportunities", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      
      const { data, error } = await supabase
        .from("procurement_opportunities")
        .select("*")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ProcurementOpportunity[];
    },
    enabled: !!agencyId,
  });
};

// Hook to get all procurement opportunities
export const useProcurementOpportunities = () => {
  return useQuery({
    queryKey: ["procurement-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procurement_opportunities")
        .select(`
          *,
          transit_agencies (
            id,
            agency_name,
            city,
            state
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook to get agency procurement status
export const useAgencyProcurementStatus = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ["agency-procurement-status", agencyId],
    queryFn: async () => {
      if (!agencyId) return null;
      
      const { data, error } = await supabase
        .from("agency_procurement_status")
        .select("*")
        .eq("agency_id", agencyId)
        .maybeSingle();
      
      if (error) throw error;
      return data as AgencyProcurementStatus | null;
    },
    enabled: !!agencyId,
  });
};

// Hook to get all agencies with procurement status
export const useAgenciesProcurementStatus = () => {
  return useQuery({
    queryKey: ["agencies-procurement-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agency_procurement_status")
        .select(`
          *,
          transit_agencies (
            id,
            agency_name,
            city,
            state,
            url
          )
        `)
        .order("last_search_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook to get search runs for an agency
export const useAgencySearchRuns = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ["procurement-search-runs", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      
      const { data, error } = await supabase
        .from("procurement_search_runs")
        .select("*")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ProcurementSearchRun[];
    },
    enabled: !!agencyId,
  });
};

// Hook to get recent search runs
export const useRecentSearchRuns = () => {
  return useQuery({
    queryKey: ["recent-procurement-search-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procurement_search_runs")
        .select(`
          *,
          transit_agencies (
            id,
            agency_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });
};

// Mutation to trigger procurement search
export const useTriggerProcurementSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agencyId, mode = 'single' }: { agencyId?: string; mode?: 'single' | 'batch' }) => {
      const { data, error } = await supabase.functions.invoke('find-agency-procurement', {
        body: { agencyId, mode }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["procurement-opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["agency-procurement-status"] });
      queryClient.invalidateQueries({ queryKey: ["procurement-search-runs"] });
      queryClient.invalidateQueries({ queryKey: ["recent-procurement-search-runs"] });
      
      if (variables.agencyId) {
        queryClient.invalidateQueries({ queryKey: ["procurement-opportunities", variables.agencyId] });
        queryClient.invalidateQueries({ queryKey: ["agency-procurement-status", variables.agencyId] });
        queryClient.invalidateQueries({ queryKey: ["procurement-search-runs", variables.agencyId] });
      }
      
      toast.success(`Found ${data.results?.[0]?.opportunitiesFound || 0} procurement opportunities`);
    },
    onError: (error: any) => {
      toast.error(`Search failed: ${error.message}`);
    },
  });
};

// Mutation to verify an opportunity
export const useVerifyOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { error } = await supabase
        .from("procurement_opportunities")
        .update({ 
          is_verified: verified,
          verified_at: verified ? new Date().toISOString() : null,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procurement-opportunities"] });
      toast.success("Opportunity updated");
    },
    onError: (error: any) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
};

// Mutation to delete an opportunity
export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("procurement_opportunities")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procurement-opportunities"] });
      toast.success("Opportunity deleted");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
};
