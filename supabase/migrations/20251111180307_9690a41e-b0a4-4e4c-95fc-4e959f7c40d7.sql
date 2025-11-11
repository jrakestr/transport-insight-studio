-- Create agency_contractors table for NTD contractor/service provider data
CREATE TABLE public.agency_contractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES public.transit_agencies(id) ON DELETE CASCADE NOT NULL,
  
  -- NTD identifiers
  ntd_id text,
  agency_name text,
  
  -- Reporter information
  reporter_type text,
  reporting_module text,
  
  -- Service details
  mode text,
  tos text,
  
  -- Contractee information
  contractee_ntd_id text,
  contractee_operator_name text,
  contractee_agency_id uuid REFERENCES public.transit_agencies(id) ON DELETE SET NULL,
  
  -- Contract details
  reporter_contractual_position text,
  type_of_contract text,
  primary_feature text,
  
  -- Asset provision flags
  buyer_supplies_vehicles_to_seller boolean,
  buyer_provides_maintenance_facility_to_seller boolean,
  other_public_assets_provided boolean,
  other_public_assets_provided_desc text,
  
  -- Service capture and parties
  service_captured text,
  other_party text,
  fares_retained_by text,
  
  -- Operational metrics
  voms_under_contract integer,
  months_seller_operated_in_fy integer,
  
  -- Financial data
  pt_fare_revenues_passenger_fees numeric(15,2),
  passenger_out_of_pocket_expenses numeric(15,2),
  direct_payment_agency_subsidy numeric(15,2),
  contract_capital_leasing_expenses numeric(15,2),
  other_operating_expenses_incurred_by_the_buyer numeric(15,2),
  total_modal_expenses numeric(15,2),
  other_reconciling_item_expenses_incurred_by_the_buyer numeric(15,2),
  
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_agency_contractors_agency_id ON public.agency_contractors(agency_id);
CREATE INDEX idx_agency_contractors_contractee_agency_id ON public.agency_contractors(contractee_agency_id);
CREATE INDEX idx_agency_contractors_ntd_id ON public.agency_contractors(ntd_id);
CREATE INDEX idx_agency_contractors_contractee_ntd_id ON public.agency_contractors(contractee_ntd_id);

-- Enable RLS
ALTER TABLE public.agency_contractors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read agency contractors"
  ON public.agency_contractors
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert agency contractors"
  ON public.agency_contractors
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update agency contractors"
  ON public.agency_contractors
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete agency contractors"
  ON public.agency_contractors
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_agency_contractors_updated_at
  BEFORE UPDATE ON public.agency_contractors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();