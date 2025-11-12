/**
 * Custom React Query hooks for agency contractor data
 * 
 * These hooks manage the fetching of contract records that link:
 * - Transit agencies (via agency_id foreign key)
 * - Transportation providers (via provider_id foreign key)
 * - Performance metrics (68 columns in agency_contractors table)
 * 
 * Usage:
 * - useAgencyContractors: Fetch all contracts for a specific agency
 * - useProviderContracts: Fetch all contracts for a specific provider
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Contract record structure
 * 
 * Note: Using 'any' type here as the agency_contractors table has 68 columns
 * and we want to allow flexible access to all metrics without strict typing.
 * 
 * Common fields include:
 * - agency_id, provider_id, provider_name (relationships)
 * - mode, type_of_service, type_of_contract (service info)
 * - voms_under_contract, unlinked_passenger_trips (fleet/service metrics)
 * - fare_revenues_earned, total_operating_expenses (financial metrics)
 * - cost_per_passenger, passengers_per_hour (efficiency metrics)
 */
export type AgencyContractorRecord = any;

/**
 * Contract record with joined agency data
 * Used by useProviderContracts for reverse relationship
 */
export type ProviderContractRecord = any;

/**
 * Fetch all contracts for a specific transit agency
 * 
 * Returns contracts ordered by provider name (alphabetically)
 * Useful for agency detail pages to show all their contractors
 * 
 * @param agencyId - UUID of the transit agency
 * @returns Query result with array of contract records
 */
export function useAgencyContractors(agencyId: string | undefined) {
  return useQuery<AgencyContractorRecord[] | null>({
    queryKey: ["agency-contractors", agencyId],
    queryFn: async () => {
      if (!agencyId) return null;
      
      const { data, error } = await supabase
        .from("agency_contractors")
        .select("*")
        .eq("agency_id", agencyId)
        .order("provider_name", { ascending: true });

      if (error) {
        console.error('Error fetching agency contractors:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!agencyId,
  });
}

/**
 * Fetch all contracts for a specific transportation provider
 * 
 * Returns contracts with joined agency data, ordered by agency name
 * Useful for provider detail pages to show all their agency contracts
 * 
 * Note: Uses provider_name as the lookup key since providers may not 
 * have provider_id set on older records
 * 
 * @param providerName - Name of the transportation provider
 * @returns Query result with array of contract records including agency details
 */
export function useProviderContracts(providerName: string | undefined) {
  return useQuery<ProviderContractRecord[] | null>({
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

      if (error) {
        console.error('Error fetching provider contracts:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!providerName,
  });
}
