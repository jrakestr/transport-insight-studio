-- Drop and recreate agency_performance_metrics with complete CSV schema
DROP TABLE IF EXISTS public.agency_performance_metrics CASCADE;

CREATE TABLE public.agency_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
  agency TEXT,
  city TEXT,
  state TEXT,
  ntd_id TEXT,
  organization_type TEXT,
  reporter_type TEXT,
  report_year INTEGER,
  uace_code TEXT,
  uza_name TEXT,
  primary_uza_population INTEGER,
  agency_voms INTEGER,
  mode TEXT,
  mode_name TEXT,
  type_of_service TEXT,
  mode_voms INTEGER,
  fare_revenues_per_unlinked NUMERIC,
  fare_revenues_per_unlinked_1 NUMERIC,
  fare_revenues_per_total NUMERIC,
  fare_revenues_per_total_1 NUMERIC,
  cost_per_hour NUMERIC,
  cost_per_hour_questionable TEXT,
  passengers_per_hour NUMERIC,
  passengers_per_hour_1 NUMERIC,
  cost_per_passenger NUMERIC,
  cost_per_passenger_1 NUMERIC,
  cost_per_passenger_mile NUMERIC,
  cost_per_passenger_mile_1 NUMERIC,
  fare_revenues_earned NUMERIC,
  fare_revenues_earned_1 NUMERIC,
  total_operating_expenses NUMERIC,
  total_operating_expenses_1 NUMERIC,
  unlinked_passenger_trips INTEGER,
  unlinked_passenger_trips_1 INTEGER,
  vehicle_revenue_hours NUMERIC,
  vehicle_revenue_hours_1 NUMERIC,
  passenger_miles NUMERIC,
  passenger_miles_questionable TEXT,
  vehicle_revenue_miles NUMERIC,
  vehicle_revenue_miles_1 NUMERIC,
  ntd_id_contract TEXT,
  agency_name TEXT,
  reporter_type_contract TEXT,
  reporting_module TEXT,
  mode_contract TEXT,
  tos TEXT,
  contractee_ntd_id TEXT,
  contractee_operator_name TEXT,
  reporter_contractual_position TEXT,
  type_of_contract TEXT,
  primary_feature TEXT,
  buyer_supplies_vehicles_to_seller TEXT,
  buyer_provides_maintenance_facility_to_seller TEXT,
  other_public_assets_provided TEXT,
  other_public_assets_provided_desc TEXT,
  service_captured TEXT,
  other_party TEXT,
  fares_retained_by TEXT,
  voms_under_contract INTEGER,
  months_seller_operated_in_fy INTEGER,
  pt_fare_revenues_passenger_fees NUMERIC,
  passenger_out_of_pocket_expenses NUMERIC,
  direct_payment_agency_subsidy NUMERIC,
  contract_capital_leasing_expenses NUMERIC,
  other_operating_expenses_incurred_by_the_buyer NUMERIC,
  total_modal_expenses NUMERIC,
  other_reconciling_item_expenses_incurred_by_the_buyer NUMERIC,
  contractee_agency_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agency_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read metrics"
  ON public.agency_performance_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert metrics"
  ON public.agency_performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update metrics"
  ON public.agency_performance_metrics FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete metrics"
  ON public.agency_performance_metrics FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_agency_performance_metrics_updated_at
  BEFORE UPDATE ON public.agency_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();