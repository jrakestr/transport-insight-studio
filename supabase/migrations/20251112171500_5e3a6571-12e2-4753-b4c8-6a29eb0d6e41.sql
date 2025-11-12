-- Create new transportation_providers table with CSV schema
CREATE TABLE transportation_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES transit_agencies(id),
  provider_id uuid REFERENCES service_providers(id),
  agency_name text,
  ntd_id text,
  provider_name text,
  contractee_operator_name text,
  contractee_ntd_id text,
  contractee_agency_id uuid,
  reporter_type text,
  reporting_module text,
  mode text,
  tos text,
  type_of_contract text,
  primary_feature text,
  reporter_contractual_position text,
  service_captured text,
  other_party text,
  fares_retained_by text,
  other_public_assets_provided text,
  other_public_assets_provided_desc text,
  buyer_supplies_vehicles_to_seller boolean,
  buyer_provides_maintenance_facility_to_seller boolean,
  voms_under_contract integer,
  months_seller_operated_in_fy integer,
  pt_fare_revenues_passenger_fees numeric,
  passenger_out_of_pocket_expenses numeric,
  direct_payment_agency_subsidy numeric,
  contract_capital_leasing_expenses numeric,
  other_operating_expenses_incurred_by_the_buyer numeric,
  total_modal_expenses numeric,
  other_reconciling_item_expenses_incurred_by_the_buyer numeric,
  fare_revenues_earned numeric,
  total_operating_expenses numeric,
  unlinked_passenger_trips integer,
  vehicle_revenue_hours numeric,
  passenger_miles numeric,
  vehicle_revenue_miles numeric,
  cost_per_hour numeric,
  passengers_per_hour numeric,
  cost_per_passenger numeric,
  cost_per_passenger_mile numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE transportation_providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read transportation providers"
  ON transportation_providers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert transportation providers"
  ON transportation_providers FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update transportation providers"
  ON transportation_providers FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete transportation providers"
  ON transportation_providers FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop agency_contractors table
DROP TABLE IF EXISTS agency_contractors;