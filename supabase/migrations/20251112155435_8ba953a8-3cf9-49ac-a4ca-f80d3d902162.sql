-- Create table for agency performance metrics
CREATE TABLE public.agency_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES public.transit_agencies(id) ON DELETE CASCADE,
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
  fare_revenues_per_total NUMERIC,
  cost_per_hour NUMERIC,
  cost_per_hour_questionable BOOLEAN,
  passengers_per_hour NUMERIC,
  cost_per_passenger NUMERIC,
  cost_per_passenger_mile NUMERIC,
  fare_revenues_earned NUMERIC,
  total_operating_expenses NUMERIC,
  unlinked_passenger_trips INTEGER,
  vehicle_revenue_hours NUMERIC,
  passenger_miles NUMERIC,
  passenger_miles_questionable BOOLEAN,
  vehicle_revenue_miles NUMERIC,
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