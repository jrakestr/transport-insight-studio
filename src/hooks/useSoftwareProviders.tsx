import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  contact_email: string | null;
  contact_phone: string | null;
  integrations: string[] | null;
  certifications: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const SOFTWARE_CATEGORIES = [
  { value: 'cad_avl', label: 'CAD/AVL', description: 'Computer-Aided Dispatch / Automatic Vehicle Location' },
  { value: 'fare_collection', label: 'Fare Collection', description: 'Fare payment and collection systems' },
  { value: 'scheduling', label: 'Scheduling & Planning', description: 'Route and schedule planning software' },
  { value: 'passenger_info', label: 'Passenger Information', description: 'Real-time passenger information systems' },
  { value: 'maintenance', label: 'Maintenance/EAM', description: 'Enterprise Asset Management' },
  { value: 'paratransit', label: 'Paratransit', description: 'Demand-response transit software' },
  { value: 'analytics', label: 'Analytics & BI', description: 'Business intelligence and reporting' },
  { value: 'gtfs', label: 'GTFS/Data', description: 'GTFS management and data tools' },
  { value: 'erp', label: 'ERP/Finance', description: 'Enterprise resource planning' },
  { value: 'safety', label: 'Safety & Security', description: 'Safety management systems' },
  { value: 'microtransit', label: 'Microtransit', description: 'On-demand transit platforms' },
  { value: 'other', label: 'Other', description: 'Other software categories' },
];

export const useSoftwareProvidersList = (params?: { search?: string; category?: string }) => {
  return useQuery({
    queryKey: ['software-providers-list', params?.search, params?.category],
    queryFn: async () => {
      let query = supabase
        .from('software_providers')
        .select('*')
        .order('name');
      
      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,product_name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }
      
      if (params?.category && params.category !== 'all') {
        query = query.eq('category', params.category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SoftwareProvider[];
    },
  });
};

export const useSoftwareProvider = (id: string | undefined) => {
  return useQuery({
    queryKey: ['software-provider', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('software_providers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as SoftwareProvider;
    },
    enabled: !!id,
  });
};
