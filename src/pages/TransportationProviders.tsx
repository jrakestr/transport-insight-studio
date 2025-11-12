import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2, MapPin, Users, DollarSign } from "lucide-react";

const TransportationProviders = () => {
  const { data: contractors, isLoading } = useQuery({
    queryKey: ["transportation-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transportation_providers")
        .select("*")
        .not("contractee_operator_name", "is", null)
        .order("contractee_operator_name");
      
      if (error) throw error;
      
      // Group by contractor name
      const grouped = data.reduce((acc: any, contractor: any) => {
        const name = contractor.contractee_operator_name;
        if (!acc[name]) {
          acc[name] = {
            name,
            contracts: [],
            totalVoms: 0,
            agencies: new Set(),
            contractTypes: new Set(),
          };
        }
        acc[name].contracts.push(contractor);
        acc[name].totalVoms += contractor.voms_under_contract || 0;
        if (contractor.agency_name) acc[name].agencies.add(contractor.agency_name);
        if (contractor.type_of_contract) acc[name].contractTypes.add(contractor.type_of_contract);
        return acc;
      }, {});
      
      return Object.values(grouped).map((provider: any) => ({
        ...provider,
        agencies: Array.from(provider.agencies),
        contractTypes: Array.from(provider.contractTypes),
      }));
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="section-container relative py-16 lg:py-24">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">
                NTD Transportation Providers
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transportation <span className="text-primary">Providers</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Transportation providers with direct contractual relationships to transit agencies. Data from the National Transit Database (NTD).
              </p>
            </div>
          </div>
        </section>

        {/* Providers Grid */}
        <section className="py-16 lg:py-24">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : contractors && contractors.length > 0 ? (
                  contractors.map((provider: any) => (
                    <Link key={provider.name} to={`/transportation-providers/${encodeURIComponent(provider.name)}`}>
                      <Card className="border border-border hover:border-primary transition-colors h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                                {provider.name}
                              </h3>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span>{provider.contracts.length} {provider.contracts.length === 1 ? 'contract' : 'contracts'}</span>
                            </div>
                            
                            {provider.totalVoms > 0 && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <DollarSign className="h-4 w-4 flex-shrink-0" />
                                <span>{provider.totalVoms} vehicles under contract</span>
                              </div>
                            )}

                            {provider.agencies.length > 0 && (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <span className="line-clamp-2">
                                    Serving {provider.agencies.length} {provider.agencies.length === 1 ? 'agency' : 'agencies'}
                                  </span>
                                </div>
                              </div>
                            )}

                            {provider.contractTypes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {provider.contractTypes.slice(0, 2).map((type: string) => (
                                  <Badge key={type} variant="outline" className="text-xs">
                                    {type.split(',')[0]}
                                  </Badge>
                                ))}
                                {provider.contractTypes.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{provider.contractTypes.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No transportation providers available. Import NTD data to populate this directory.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TransportationProviders;
