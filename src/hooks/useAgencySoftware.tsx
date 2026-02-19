import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SoftwareProvider {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  product_name: string | null;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  headquarters: string | null;
  year_founded: number | null;
  deployment_type: string | null;
  pricing_model: string | null;
  integrations: string[];
  certifications: string[];
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencySoftware {
  id: string;
  agency_id: string;
  software_id: string;
  implementation_status: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  annual_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  software_providers?: SoftwareProvider;
}

export const SOFTWARE_CATEGORIES = [
  { value: 'cad-avl', label: 'CAD/AVL', description: 'Vehicle tracking, dispatch systems' },
  { value: 'fare-collection', label: 'Fare Collection', description: 'Payment processing, mobile ticketing' },
  { value: 'scheduling', label: 'Scheduling & Planning', description: 'Route optimization, GTFS tools' },
  { value: 'passenger-info', label: 'Passenger Information', description: 'Real-time arrival, digital signage' },
  { value: 'fleet-management', label: 'Fleet Management', description: 'Vehicle lifecycle, fuel management' },
  { value: 'paratransit', label: 'Paratransit', description: 'Demand response, eligibility' },
  { value: 'analytics', label: 'Analytics & BI', description: 'Ridership analysis, reporting' },
  { value: 'maintenance', label: 'Maintenance (EAM)', description: 'Work orders, predictive maintenance' },
  { value: 'erp-finance', label: 'ERP/Finance', description: 'Accounting, procurement' },
  { value: 'workforce', label: 'Workforce', description: 'Scheduling, time & attendance' },
  { value: 'cybersecurity', label: 'Cybersecurity', description: 'Network security, compliance' },
  { value: 'other', label: 'Other', description: 'Other software solutions' },
];

export const useAgencySoftware = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ["agency-software", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      
      const { data, error } = await supabase
        .from("agency_software")
        .select(`
          *,
          software_providers (*)
        `)
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as AgencySoftware[];
    },
    enabled: !!agencyId,
  });
};

export const useSoftwareProviders = (search?: string) => {
  return useQuery({
    queryKey: ["software-providers", search],
    queryFn: async () => {
      let query = supabase
        .from("software_providers")
        .select("*")
        .order("name", { ascending: true });
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,product_name.ilike.%${search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SoftwareProvider[];
    },
  });
};

export const useAgencySoftwareMutation = () => {
  const queryClient = useQueryClient();

  const addSoftwareToAgency = useMutation({
    mutationFn: async (data: {
      agency_id: string;
      software_id: string;
      implementation_status?: string;
      contract_start_date?: string;
      contract_end_date?: string;
      annual_cost?: number;
      notes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("agency_software")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agency-software", data.agency_id] });
      toast.success("Software added to agency");
    },
    onError: (error: any) => {
      toast.error(`Failed to add software: ${error.message}`);
    },
  });

  const updateAgencySoftware = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgencySoftware> & { id: string }) => {
      const { data, error } = await supabase
        .from("agency_software")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agency-software", data.agency_id] });
      toast.success("Software updated");
    },
    onError: (error: any) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const removeAgencySoftware = useMutation({
    mutationFn: async ({ id, agencyId }: { id: string; agencyId: string }) => {
      const { error } = await supabase
        .from("agency_software")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { id, agencyId };
    },
    onSuccess: ({ agencyId }) => {
      queryClient.invalidateQueries({ queryKey: ["agency-software", agencyId] });
      toast.success("Software removed from agency");
    },
    onError: (error: any) => {
      toast.error(`Failed to remove: ${error.message}`);
    },
  });

  return { addSoftwareToAgency, updateAgencySoftware, removeAgencySoftware };
};

export const useSoftwareProviderMutation = () => {
  const queryClient = useQueryClient();

  const createSoftwareProvider = useMutation({
    mutationFn: async (data: Omit<SoftwareProvider, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from("software_providers")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["software-providers"] });
      toast.success("Software provider created");
    },
    onError: (error: any) => {
      toast.error(`Failed to create provider: ${error.message}`);
    },
  });

  return { createSoftwareProvider };
};
