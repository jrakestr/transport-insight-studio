-- Drop and recreate software_providers table with expanded schema
DROP TABLE IF EXISTS public.software_providers;

-- Create expanded software_providers table
CREATE TABLE public.software_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  product_name TEXT,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  headquarters TEXT,
  year_founded INTEGER,
  deployment_type TEXT, -- cloud, on-premise, hybrid
  pricing_model TEXT, -- subscription, perpetual, usage-based, contact
  integrations JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agency_software junction table for many-to-many relationship
CREATE TABLE public.agency_software (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  software_id UUID NOT NULL REFERENCES public.software_providers(id) ON DELETE CASCADE,
  implementation_status TEXT DEFAULT 'active', -- active, planned, evaluating, retired
  contract_start_date DATE,
  contract_end_date DATE,
  annual_cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agency_id, software_id)
);

-- Enable RLS
ALTER TABLE public.software_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_software ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_software_providers_category ON public.software_providers(category);
CREATE INDEX idx_software_providers_name ON public.software_providers(name);
CREATE INDEX idx_agency_software_agency_id ON public.agency_software(agency_id);
CREATE INDEX idx_agency_software_software_id ON public.agency_software(software_id);

-- RLS Policies for software_providers
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

-- RLS Policies for agency_software
CREATE POLICY "Authenticated users can read agency software"
ON public.agency_software
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert agency software"
ON public.agency_software
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update agency software"
ON public.agency_software
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete agency software"
ON public.agency_software
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers
CREATE TRIGGER update_software_providers_updated_at
BEFORE UPDATE ON public.software_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agency_software_updated_at
BEFORE UPDATE ON public.agency_software
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();