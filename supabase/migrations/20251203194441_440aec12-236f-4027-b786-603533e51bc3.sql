-- Create agency_contacts table for CRM functionality
CREATE TABLE public.agency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  is_primary BOOLEAN DEFAULT false,
  linkedin_url TEXT,
  notes TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  salesforce_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agency_contacts ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_agency_contacts_agency_id ON public.agency_contacts(agency_id);
CREATE INDEX idx_agency_contacts_email ON public.agency_contacts(email);

-- RLS Policies
CREATE POLICY "Authenticated users can read agency contacts"
ON public.agency_contacts
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert agency contacts"
ON public.agency_contacts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update agency contacts"
ON public.agency_contacts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete agency contacts"
ON public.agency_contacts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_agency_contacts_updated_at
BEFORE UPDATE ON public.agency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();