import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  Loader2,
  AlertCircle,
  Lightbulb,
  Target
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface OpportunityItem {
  id: string;
  title: string;
  agency_name: string;
  agency_id: string;
  deadline: string | null;
  estimated_value: number | null;
  opportunity_type: string | null;
  created_at: string;
}

interface IntelligenceItem {
  id: string;
  title: string | null;
  agency_name: string;
  agency_id: string;
  intelligence_type: string;
  content: string | null;
  scraped_at: string;
}

interface ArticleInsight {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  published_at: string;
  agency_count: number;
  provider_count: number;
}

export function IntelligenceFeed() {
  // Fetch recent procurement opportunities
  const { data: opportunities, isLoading: loadingOpps } = useQuery({
    queryKey: ["feed-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procurement_opportunities")
        .select(`
          id,
          title,
          deadline,
          estimated_value,
          opportunity_type,
          created_at,
          agency_id,
          transit_agencies!inner(agency_name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        agency_name: d.transit_agencies?.agency_name || "Unknown Agency",
      })) as OpportunityItem[];
    },
  });

  // Fetch recent agency intelligence
  const { data: intelligence, isLoading: loadingIntel } = useQuery({
    queryKey: ["feed-intelligence"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agency_intelligence")
        .select(`
          id,
          title,
          intelligence_type,
          content,
          scraped_at,
          agency_id,
          transit_agencies!inner(agency_name)
        `)
        .order("scraped_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        agency_name: d.transit_agencies?.agency_name || "Unknown Agency",
      })) as IntelligenceItem[];
    },
  });

  // Fetch articles with entity counts
  const { data: articleInsights, isLoading: loadingArticles } = useQuery({
    queryKey: ["feed-article-insights"],
    queryFn: async () => {
      const { data: articles, error } = await supabase
        .from("articles")
        .select(`
          id,
          title,
          slug,
          category,
          published_at,
          article_agencies(count),
          article_providers(count)
        `)
        .order("published_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return (articles || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        category: a.category,
        published_at: a.published_at,
        agency_count: a.article_agencies?.[0]?.count || 0,
        provider_count: a.article_providers?.[0]?.count || 0,
      })) as ArticleInsight[];
    },
  });

  const isLoading = loadingOpps || loadingIntel || loadingArticles;
  const hasData = (opportunities?.length || 0) + (intelligence?.length || 0) + (articleInsights?.length || 0) > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasData) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "rfp":
      case "bid":
        return <FileText className="h-4 w-4" />;
      case "contract":
        return <Target className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getIntelTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "board_meeting":
        return "bg-blue-500/10 text-blue-600";
      case "press_release":
        return "bg-green-500/10 text-green-600";
      case "procurement":
        return "bg-amber-500/10 text-amber-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{opportunities?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Opportunities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Lightbulb className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{intelligence?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Intel Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Building2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {articleInsights?.reduce((sum, a) => sum + a.agency_count, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Agencies Mentioned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <FileText className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{articleInsights?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Recent Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Procurement Opportunities */}
        {opportunities && opportunities.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Active Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {opportunities.map((opp) => (
                <Link
                  key={opp.id}
                  to={`/agencies/${opp.agency_id}`}
                  className="block p-3 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{opp.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opp.agency_name}</p>
                    </div>
                    {opp.opportunity_type && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {opp.opportunity_type}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {opp.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(opp.deadline), "MMM d, yyyy")}
                      </span>
                    )}
                    {opp.estimated_value && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {(opp.estimated_value / 1000000).toFixed(1)}M
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              <Button variant="ghost" size="sm" asChild className="w-full mt-2">
                <Link to="/procurement">
                  View All Opportunities
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Agency Intelligence */}
        {intelligence && intelligence.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-accent" />
                Agency Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {intelligence.map((intel) => (
                <Link
                  key={intel.id}
                  to={`/agencies/${intel.agency_id}`}
                  className="block p-3 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">
                        {intel.title || intel.content?.slice(0, 60) || "Intelligence Update"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{intel.agency_name}</p>
                    </div>
                    <Badge className={`shrink-0 text-xs ${getIntelTypeColor(intel.intelligence_type)}`}>
                      {intel.intelligence_type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(intel.scraped_at), { addSuffix: true })}
                  </p>
                </Link>
              ))}
              <Button variant="ghost" size="sm" asChild className="w-full mt-2">
                <Link to="/agencies">
                  Explore Agencies
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Article Insights */}
      {articleInsights && articleInsights.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-warning" />
              Articles with Entity Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {articleInsights.filter(a => a.agency_count > 0 || a.provider_count > 0).slice(0, 6).map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="block p-3 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <p className="font-medium text-sm line-clamp-2 mb-2">{article.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {article.agency_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {article.agency_count} {article.agency_count === 1 ? "agency" : "agencies"}
                      </span>
                    )}
                    {article.provider_count > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {article.provider_count} {article.provider_count === 1 ? "provider" : "providers"}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
