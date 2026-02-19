-- Create agency_intelligence table to store scraped data
CREATE TABLE public.agency_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  intelligence_type TEXT NOT NULL, -- 'contacts', 'procurement', 'news', 'leadership', 'general'
  title TEXT,
  content TEXT,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  confidence_score NUMERIC,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agency_intelligence ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_agency_intelligence_agency_id ON public.agency_intelligence(agency_id);
CREATE INDEX idx_agency_intelligence_type ON public.agency_intelligence(intelligence_type);

-- RLS Policies
CREATE POLICY "Authenticated users can read agency intelligence"
ON public.agency_intelligence
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert agency intelligence"
ON public.agency_intelligence
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update agency intelligence"
ON public.agency_intelligence
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete agency intelligence"
ON public.agency_intelligence
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_agency_intelligence_updated_at
BEFORE UPDATE ON public.agency_intelligence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();