import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useProviders } from "@/hooks/useProviders";
import { Loader2, Truck, MapPin, ExternalLink, Tag } from "lucide-react";
const Providers = () => {
  const {
    data: providers,
    isLoading
  } = useProviders();
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="section-container relative py-16 lg:py-24">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">
                Transportation Providers Directory
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">Transportation <span className="text-primary">Providers</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Transportation providers with contractual relationships to transit agencies. Data from National Transit Database (NTD).
              </p>
            </div>
          </div>
        </section>

        {/* Providers Grid */}
        <section className="py-16 lg:py-24">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? <div className="col-span-full flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div> : providers && providers.length > 0 ? providers.map(provider => <Link key={provider.id} to={`/providers/${provider.id}`} className="block">
                      <Card className="border border-border hover:border-primary transition-colors cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Truck className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                                {provider.name}
                              </h3>
                              {provider.provider_type && <Badge variant="outline" className="mt-1">
                                  {provider.provider_type}
                                </Badge>}
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {provider.location && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span className="line-clamp-1">{provider.location}</span>
                              </div>}
                          </div>

                          {provider.website && <div className="inline-flex items-center gap-2 text-sm text-primary">
                              <ExternalLink className="h-3 w-3" />
                              Visit Website
                            </div>}

                          {provider.notes && <p className="mt-4 text-sm text-muted-foreground line-clamp-3 border-t pt-4">
                              {provider.notes}
                            </p>}
                        </CardContent>
                      </Card>
                    </Link>) : <div className="col-span-full text-center py-12 text-muted-foreground">
                    No providers available at this time.
                  </div>}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default Providers;