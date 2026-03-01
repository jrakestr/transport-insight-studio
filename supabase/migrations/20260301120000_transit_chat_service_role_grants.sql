-- Ensure service_role has explicit read access for transit-chat edge function
-- (Edge functions use SUPABASE_SERVICE_ROLE_KEY; explicit grants avoid permission-denied edge cases)

GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT ON public.transit_agencies TO service_role;
GRANT SELECT ON public.article_agencies TO service_role;
GRANT SELECT ON public.articles TO service_role;
GRANT SELECT ON public.transportation_providers TO service_role;
GRANT SELECT ON public.agency_vendors TO service_role;
