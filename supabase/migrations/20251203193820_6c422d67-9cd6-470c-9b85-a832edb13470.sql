-- Create software_providers table
CREATE TABLE public.software_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  agency_id UUID REFERENCES public.transit_agencies(id) ON DELETE SET NULL,
  website TEXT,
  description TEXT,
  provider_type TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.software_providers ENABLE ROW LEVEL SECURITY;

-- Create index on agency_id for faster lookups
CREATE INDEX idx_software_providers_agency_id ON public.software_providers(agency_id);

-- RLS Policies
CREATE POLICY "Anyone can read software providers"
ON public.software_providers
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert software providers"
ON public.software_providers
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update software providers"
ON public.software_providers
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete software providers"
ON public.software_providers
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_software_providers_updated_at
BEFORE UPDATE ON public.software_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();