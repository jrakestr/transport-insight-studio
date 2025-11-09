import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAgencies } from "@/hooks/useAgencies";
import { Loader2, Building2, MapPin, Users, ExternalLink } from "lucide-react";

const Agencies = () => {
  const { data: agencies, isLoading } = useAgencies();

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
                Transit Agencies Directory
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transit <span className="text-primary">Agencies</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Comprehensive directory of transit agencies and transportation authorities across North America.
              </p>
            </div>
          </div>
        </section>

        {/* Agencies Grid */}
        <section className="py-16 lg:py-24">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : agencies && agencies.length > 0 ? (
                  agencies.map((agency) => (
                    <Card 
                      key={agency.id} 
                      className="border border-border hover:border-primary transition-colors"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                              {agency.name}
                            </h3>
                            {agency.formal_name && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {agency.formal_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {agency.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="line-clamp-1">{agency.location}</span>
                            </div>
                          )}
                          {agency.fleet_size && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span>Fleet: {agency.fleet_size} vehicles</span>
                            </div>
                          )}
                          {agency.ntd_id && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">NTD ID:</span> {agency.ntd_id}
                            </div>
                          )}
                        </div>

                        {agency.website && (
                          <a 
                            href={agency.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Visit Website
                          </a>
                        )}

                        {agency.notes && (
                          <p className="mt-4 text-sm text-muted-foreground line-clamp-3 border-t pt-4">
                            {agency.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No agencies available at this time.
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

export default Agencies;
