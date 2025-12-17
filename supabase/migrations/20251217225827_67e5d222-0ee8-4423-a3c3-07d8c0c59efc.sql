-- Create table for tracking procurement search runs
CREATE TABLE public.procurement_search_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  current_phase INTEGER NOT NULL DEFAULT 1,
  phases_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_score NUMERIC DEFAULT 0,
  opportunities_found INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing verified procurement opportunities
CREATE TABLE public.procurement_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  search_run_id UUID REFERENCES public.procurement_search_runs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  opportunity_type TEXT, -- rfp, rfq, bid, contract_award, etc.
  source_url TEXT NOT NULL,
  source_type TEXT, -- agency_website, procurement_portal, news, etc.
  deadline TIMESTAMP WITH TIME ZONE,
  estimated_value NUMERIC,
  contact_info JSONB,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  confidence_score NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  status TEXT DEFAULT 'active', -- active, closed, awarded, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking agency procurement search status
CREATE TABLE public.agency_procurement_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL UNIQUE REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  last_search_at TIMESTAMP WITH TIME ZONE,
  last_search_run_id UUID REFERENCES public.procurement_search_runs(id) ON DELETE SET NULL,
  overall_confidence NUMERIC DEFAULT 0,
  total_opportunities_found INTEGER DEFAULT 0,
  procurement_portal_url TEXT,
  has_active_rfps BOOLEAN DEFAULT false,
  next_search_due TIMESTAMP WITH TIME ZONE,
  search_priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.procurement_search_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_procurement_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for procurement_search_runs
CREATE POLICY "Admins can manage procurement search runs"
ON public.procurement_search_runs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view procurement search runs"
ON public.procurement_search_runs FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for procurement_opportunities
CREATE POLICY "Admins can manage procurement opportunities"
ON public.procurement_opportunities FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view procurement opportunities"
ON public.procurement_opportunities FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for agency_procurement_status
CREATE POLICY "Admins can manage agency procurement status"
ON public.agency_procurement_status FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view agency procurement status"
ON public.agency_procurement_status FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_procurement_search_runs_agency ON public.procurement_search_runs(agency_id);
CREATE INDEX idx_procurement_search_runs_status ON public.procurement_search_runs(status);
CREATE INDEX idx_procurement_opportunities_agency ON public.procurement_opportunities(agency_id);
CREATE INDEX idx_procurement_opportunities_status ON public.procurement_opportunities(status);
CREATE INDEX idx_procurement_opportunities_deadline ON public.procurement_opportunities(deadline);
CREATE INDEX idx_agency_procurement_status_priority ON public.agency_procurement_status(search_priority);

-- Add updated_at triggers
CREATE TRIGGER update_procurement_search_runs_updated_at
BEFORE UPDATE ON public.procurement_search_runs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_procurement_opportunities_updated_at
BEFORE UPDATE ON public.procurement_opportunities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agency_procurement_status_updated_at
BEFORE UPDATE ON public.agency_procurement_status
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();