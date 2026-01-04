import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Newspaper, Building2, Truck, Target, FileText } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [articles, agencies, providers, opportunities, reports] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("transit_agencies").select("id", { count: "exact", head: true }),
        supabase.from("agency_vendors").select("id", { count: "exact", head: true }),
        supabase.from("opportunities").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }),
      ]);

      return {
        articles: articles.count || 0,
        agencies: agencies.count || 0,
        providers: providers.count || 0,
        opportunities: opportunities.count || 0,
        reports: reports.count || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: "Articles", value: stats?.articles || 0, icon: Newspaper },
    { title: "Transit Agencies", value: stats?.agencies || 0, icon: Building2 },
    { title: "Providers", value: stats?.providers || 0, icon: Truck },
    { title: "Opportunities", value: stats?.opportunities || 0, icon: Target },
    { title: "Reports", value: stats?.reports || 0, icon: FileText },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
