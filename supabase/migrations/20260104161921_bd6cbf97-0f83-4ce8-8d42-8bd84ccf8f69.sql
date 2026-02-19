-- Drop the new agency_vendors table I just created
DROP TABLE IF EXISTS public.agency_vendors CASCADE;

-- Rename service_providers to agency_vendors
ALTER TABLE public.service_providers RENAME TO agency_vendors;

-- Add new columns for ADA paratransit tracking
ALTER TABLE public.agency_vendors
ADD COLUMN IF NOT EXISTS service_category TEXT,
ADD COLUMN IF NOT EXISTS service_component TEXT,
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS contract_number TEXT,
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS source_type TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS extracted_data JSONB,
ADD COLUMN IF NOT EXISTS discovery_method TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.agency_vendors.service_category IS 'service_delivery, technology, customer_service, eligibility, travel_training, brokerage';
COMMENT ON COLUMN public.agency_vendors.service_component IS 'Specific component like turnkey, cad_avl, call_center, eligibility_assessment, etc';
COMMENT ON COLUMN public.agency_vendors.source_type IS 'ntd_report, website, board_minutes, rfp, news';
COMMENT ON COLUMN public.agency_vendors.discovery_method IS 'ntd_import, web_scrape, manual';

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_agency_vendors_service_category ON public.agency_vendors(service_category);
CREATE INDEX IF NOT EXISTS idx_agency_vendors_contract_end ON public.agency_vendors(contract_end_date) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_agency_vendors_is_current ON public.agency_vendors(is_current);

-- Update RLS policies (they were already on service_providers, just need to verify they work)
-- The policies should have been automatically renamed with the table