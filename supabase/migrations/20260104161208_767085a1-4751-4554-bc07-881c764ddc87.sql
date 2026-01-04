-- Agency vendor tracking for ADA Paratransit ecosystem
-- Tracks current vendors by component, contracts, and intelligence

-- Table for tracking agency vendors by service component
CREATE TABLE IF NOT EXISTS public.agency_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  
  -- Service component categorization
  service_category TEXT NOT NULL CHECK (service_category IN (
    'service_delivery', 'technology', 'customer_service', 
    'eligibility', 'travel_training', 'brokerage'
  )),
  service_component TEXT NOT NULL, -- e.g., 'turnkey', 'cad_avl', 'call_center', etc.
  
  -- Contract info
  contract_start_date DATE,
  contract_end_date DATE,
  contract_value NUMERIC,
  contract_number TEXT,
  
  -- Status tracking
  is_current BOOLEAN DEFAULT true,
  source_type TEXT, -- 'board_minutes', 'rfp', 'website', 'news', 'plan_document'
  source_url TEXT,
  confidence_score NUMERIC DEFAULT 0.5,
  
  -- Metadata
  notes TEXT,
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for board actions/minutes
CREATE TABLE IF NOT EXISTS public.agency_board_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL CHECK (action_type IN (
    'contract_approval', 'contract_extension', 'contract_amendment',
    'rfp_authorization', 'vendor_selection', 'budget_approval',
    'plan_adoption', 'policy_change', 'other'
  )),
  
  action_date DATE,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Related entities
  vendor_name TEXT,
  vendor_id UUID REFERENCES public.agency_vendors(id),
  contract_value NUMERIC,
  
  -- Source info
  source_url TEXT,
  source_document TEXT,
  meeting_date DATE,
  
  -- AI extraction metadata
  confidence_score NUMERIC DEFAULT 0.5,
  extracted_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for agency planning documents (TDPs, ADA Plans, Coordinated Plans)
CREATE TABLE IF NOT EXISTS public.agency_plan_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL CHECK (document_type IN (
    'tdp', 'ada_plan', 'coordinated_plan', 'short_range_plan',
    'long_range_plan', 'fare_study', 'cod_study', 'other'
  )),
  
  title TEXT NOT NULL,
  document_url TEXT,
  published_date DATE,
  effective_date DATE,
  expiration_date DATE,
  
  -- Parsed content
  parse_status TEXT DEFAULT 'pending',
  parsed_at TIMESTAMP WITH TIME ZONE,
  summary TEXT,
  key_findings JSONB,
  
  -- Operational structure extracted
  current_service_model TEXT, -- 'in_house', 'contracted', 'hybrid'
  paratransit_provider TEXT,
  technology_stack JSONB,
  planned_changes JSONB,
  
  -- Flags
  has_technology_upgrade_plans BOOLEAN DEFAULT false,
  has_service_model_changes BOOLEAN DEFAULT false,
  planning_mode_flags JSONB, -- Array of planning indicators
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking agency pain points from public comments/news
CREATE TABLE IF NOT EXISTS public.agency_pain_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  
  category TEXT NOT NULL CHECK (category IN (
    'service_quality', 'technology', 'customer_service', 
    'eligibility', 'scheduling', 'on_time_performance',
    'driver_issues', 'vehicle_issues', 'cost', 'accessibility', 'other'
  )),
  
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  source_type TEXT, -- 'public_comment', 'news', 'board_meeting', 'social_media'
  source_url TEXT,
  source_date DATE,
  
  -- Sales opportunity indicator
  is_sales_opportunity BOOLEAN DEFAULT false,
  opportunity_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add planning mode flag to agency procurement status
ALTER TABLE public.agency_procurement_status
ADD COLUMN IF NOT EXISTS is_planning_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS planning_mode_reason TEXT,
ADD COLUMN IF NOT EXISTS technology_upgrade_planned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS service_model_change_planned BOOLEAN DEFAULT false;

-- Enable RLS on all new tables
ALTER TABLE public.agency_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_board_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_plan_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_pain_points ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated read access
CREATE POLICY "Authenticated users can view agency vendors"
  ON public.agency_vendors FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view board actions"
  ON public.agency_board_actions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view plan documents"
  ON public.agency_plan_documents FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view pain points"
  ON public.agency_pain_points FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admin policies for full CRUD
CREATE POLICY "Admins can manage agency vendors"
  ON public.agency_vendors FOR ALL
  USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id));

CREATE POLICY "Admins can manage board actions"
  ON public.agency_board_actions FOR ALL
  USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id));

CREATE POLICY "Admins can manage plan documents"
  ON public.agency_plan_documents FOR ALL
  USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id));

CREATE POLICY "Admins can manage pain points"
  ON public.agency_pain_points FOR ALL
  USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agency_vendors_agency ON public.agency_vendors(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_vendors_component ON public.agency_vendors(service_category, service_component);
CREATE INDEX IF NOT EXISTS idx_agency_vendors_contract_end ON public.agency_vendors(contract_end_date) WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_agency_board_actions_agency ON public.agency_board_actions(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_board_actions_date ON public.agency_board_actions(action_date DESC);
CREATE INDEX IF NOT EXISTS idx_agency_board_actions_type ON public.agency_board_actions(action_type);

CREATE INDEX IF NOT EXISTS idx_agency_plan_docs_agency ON public.agency_plan_documents(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_plan_docs_type ON public.agency_plan_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_agency_plan_docs_planning ON public.agency_plan_documents(has_technology_upgrade_plans, has_service_model_changes);

CREATE INDEX IF NOT EXISTS idx_agency_pain_points_agency ON public.agency_pain_points(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_pain_points_category ON public.agency_pain_points(category);
CREATE INDEX IF NOT EXISTS idx_agency_pain_points_opportunity ON public.agency_pain_points(is_sales_opportunity) WHERE is_sales_opportunity = true;