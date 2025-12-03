import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgencyIntelligence {
  id: string;
  agency_id: string;
  source_url: string;
  scraped_at: string;
  intelligence_type: string;
  title: string | null;
  content: string | null;
  extracted_data: any;
  confidence_score: number | null;
  is_verified: boolean | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAgencyIntelligence = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ["agency-intelligence", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      
      const { data, error } = await supabase
        .from("agency_intelligence")
        .select("*")
        .eq("agency_id", agencyId)
        .order("scraped_at", { ascending: false });
      
      if (error) throw error;
      return data as AgencyIntelligence[];
    },
    enabled: !!agencyId,
  });
};

export const useScrapeAgencyWebsite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agencyId, agencyUrl, agencyName }: { 
      agencyId: string; 
      agencyUrl: string;
      agencyName: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('scrape-agency-website', {
        body: { agencyId, agencyUrl, agencyName }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency-intelligence", variables.agencyId] });
      toast.success(`Extracted ${data.intelligenceExtracted} intelligence items from ${data.urlsScraped} pages`);
    },
    onError: (error: any) => {
      toast.error(`Failed to scrape website: ${error.message}`);
    },
  });
};

export const useDeleteAgencyIntelligence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, agencyId }: { id: string; agencyId: string }) => {
      const { error } = await supabase
        .from("agency_intelligence")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { id, agencyId };
    },
    onSuccess: ({ agencyId }) => {
      queryClient.invalidateQueries({ queryKey: ["agency-intelligence", agencyId] });
      toast.success("Intelligence deleted");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
};
