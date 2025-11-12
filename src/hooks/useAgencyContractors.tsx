import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAgencyContractors(agencyId: string | undefined) {
  return useQuery({
    queryKey: ["agency-contractors", agencyId],
    queryFn: async () => {
      if (!agencyId) return null;
      
      const { data, error } = await supabase
        .from("agency_contractors")
        .select("*")
        .eq("agency_id", agencyId)
        .order("provider_name", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!agencyId,
  });
}

export function useProviderContracts(providerName: string | undefined) {
  return useQuery({
    queryKey: ["provider-contracts", providerName],
    queryFn: async () => {
      if (!providerName) return null;
      
      const { data, error } = await supabase
        .from("agency_contractors")
        .select(`
          *,
          transit_agencies (
            id,
            agency_name,
            city,
            state,
            ntd_id
          )
        `)
        .eq("provider_name", providerName)
        .order("agency_name", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!providerName,
  });
}
