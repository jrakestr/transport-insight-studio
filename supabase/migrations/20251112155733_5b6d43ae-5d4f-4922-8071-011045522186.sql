-- Add missing columns to agency_performance_metrics table
ALTER TABLE public.agency_performance_metrics
  ADD COLUMN agency_name TEXT,
  ADD COLUMN city TEXT,
  ADD COLUMN state TEXT,
  ADD COLUMN ntd_id TEXT,
  ADD COLUMN organization_type TEXT,
  ADD COLUMN reporter_type TEXT;