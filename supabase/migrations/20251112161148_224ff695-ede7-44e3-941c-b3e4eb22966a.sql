-- Step 1: Add provider_id to agency_contractors table to link to transportation_providers
ALTER TABLE public.agency_contractors
  ADD COLUMN provider_id uuid REFERENCES public.transportation_providers(id) ON DELETE SET NULL;

-- Step 2: Create index for provider_id only (agency_id index already exists)
CREATE INDEX idx_agency_contractors_provider_id ON public.agency_contractors(provider_id);

-- Step 3: Add provider_name column to store the transportation provider name from CSV
ALTER TABLE public.agency_contractors
  ADD COLUMN provider_name text;

-- Step 4: Add comments
COMMENT ON COLUMN public.agency_contractors.provider_id IS 'Links to the transportation provider entity';
COMMENT ON COLUMN public.agency_contractors.provider_name IS 'Provider name from CSV data (contractee_operator_name)';
COMMENT ON TABLE public.agency_contractors IS 'Stores contract-level metrics between agencies and transportation providers. Each row represents a unique agency-provider-mode contract with performance data.';