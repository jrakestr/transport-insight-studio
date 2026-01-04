import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAgencyRelationships(agencyId: string | undefined) {
  return useQuery({
    queryKey: ["agency-relationships", agencyId],
    queryFn: async () => {
      if (!agencyId) return null;

      // Fetch related articles
      const { data: articleRelations, error: articlesError } = await supabase
        .from("article_agencies")
        .select(`
          mention_type,
          articles (
            id,
            title,
            slug,
            description,
            published_at,
            image_url
          )
        `)
        .eq("agency_id", agencyId);

      if (articlesError) throw articlesError;

      // Fetch related opportunities
      const { data: opportunities, error: opportunitiesError } = await supabase
        .from("opportunities")
        .select(`
          id,
          title,
          notes,
          created_at,
          articles (
            id,
            title,
            slug
          ),
          agency_vendors (
            id,
            name
          )
        `)
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false });

      if (opportunitiesError) throw opportunitiesError;

      // Fetch related providers through opportunities
      const { data: providerRelations, error: providersError } = await supabase
        .from("opportunities")
        .select(`
          agency_vendors (
            id,
            name,
            provider_type,
            location,
            website
          )
        `)
        .eq("agency_id", agencyId)
        .not("provider_id", "is", null);

      if (providersError) throw providersError;

      // Deduplicate providers
      const providersMap = new Map();
      providerRelations?.forEach((rel: any) => {
        if (rel.agency_vendors) {
          providersMap.set(rel.agency_vendors.id, rel.agency_vendors);
        }
      });

      return {
        articles: articleRelations?.map((rel: any) => rel.articles).filter(Boolean) || [],
        opportunities: opportunities || [],
        providers: Array.from(providersMap.values()),
      };
    },
    enabled: !!agencyId,
  });
}