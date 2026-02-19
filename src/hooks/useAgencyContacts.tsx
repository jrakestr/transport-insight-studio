import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgencyContact {
  id: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  department?: string | null;
  is_primary?: boolean | null;
  linkedin_url?: string | null;
  notes?: string | null;
  last_contacted_at?: string | null;
  salesforce_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type AgencyContactInsert = Omit<AgencyContact, 'id' | 'created_at' | 'updated_at'>;
export type AgencyContactUpdate = Partial<AgencyContactInsert> & { id: string };

export const useAgencyContacts = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ["agency-contacts", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      
      const { data, error } = await supabase
        .from("agency_contacts")
        .select("*")
        .eq("agency_id", agencyId)
        .order("is_primary", { ascending: false })
        .order("last_name", { ascending: true });
      
      if (error) throw error;
      return data as AgencyContact[];
    },
    enabled: !!agencyId,
  });
};

export const useAgencyContactMutation = () => {
  const queryClient = useQueryClient();

  const createContact = useMutation({
    mutationFn: async (contact: AgencyContactInsert) => {
      const { data, error } = await supabase
        .from("agency_contacts")
        .insert(contact)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agency-contacts", data.agency_id] });
      toast.success("Contact added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add contact: ${error.message}`);
    },
  });

  const updateContact = useMutation({
    mutationFn: async ({ id, ...updates }: AgencyContactUpdate) => {
      const { data, error } = await supabase
        .from("agency_contacts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agency-contacts", data.agency_id] });
      toast.success("Contact updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update contact: ${error.message}`);
    },
  });

  const deleteContact = useMutation({
    mutationFn: async ({ id, agencyId }: { id: string; agencyId: string }) => {
      const { error } = await supabase
        .from("agency_contacts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { id, agencyId };
    },
    onSuccess: ({ agencyId }) => {
      queryClient.invalidateQueries({ queryKey: ["agency-contacts", agencyId] });
      toast.success("Contact deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete contact: ${error.message}`);
    },
  });

  return { createContact, updateContact, deleteContact };
};
