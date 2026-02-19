-- Add crawl scheduling fields to agency_procurement_status
ALTER TABLE public.agency_procurement_status 
ADD COLUMN IF NOT EXISTS crawl_frequency text DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS crawl_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS crawl_error text,
ADD COLUMN IF NOT EXISTS pages_crawled integer DEFAULT 0;