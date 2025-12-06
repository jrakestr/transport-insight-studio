import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProcurementResult {
  title: string;
  url: string;
  sourceType: string;
  hasPathIndicator: boolean;
  score: number;
  adjustedScore: number;
  snippet?: string;
  highlights?: string[];
}

export interface ProcurementSearchResponse {
  agency: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  queriesUsed: string[];
  resultsFound: number;
  results: ProcurementResult[];
}

export const useProcurementFinder = () => {
  return useMutation({
    mutationFn: async (agencyId: string): Promise<ProcurementSearchResponse> => {
      const { data, error } = await supabase.functions.invoke('find-agency-procurement', {
        body: { agencyId }
      });
      
      if (error) throw error;
      return data as ProcurementSearchResponse;
    },
    onError: (error: any) => {
      toast.error(`Failed to search: ${error.message}`);
    },
  });
};
