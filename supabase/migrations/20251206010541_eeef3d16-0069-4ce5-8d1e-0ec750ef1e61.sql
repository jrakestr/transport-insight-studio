-- Add modes column to software_providers to track which transit modes the software supports
ALTER TABLE public.software_providers
ADD COLUMN modes text[] DEFAULT '{}';

-- Add a comment for documentation
COMMENT ON COLUMN public.software_providers.modes IS 'Transit modes supported by this software (e.g., Bus, Rail, Demand Response)';