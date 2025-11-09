import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Truck, MapPin, ExternalLink, Tag } from "lucide-react";
import { useProviders } from "@/hooks/useProviders";

const ProviderDetail = () => {
  const { id } = useParams();
  const { data: providers, isLoading } = useProviders();
  const provider = providers?.find(p => p.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Provider Not Found</h1>
            <Link to="/providers">
              <Button>View All Providers</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Back Button */}
        <section className="border-b">
          <div className="section-container py-6">
            <Link to="/providers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Providers
              </Button>
            </Link>
          </div>
        </section>

        {/* Provider Content */}
        <div className="bg-background px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              {provider.provider_type && (
                <Badge variant="secondary">{provider.provider_type}</Badge>
              )}
            </div>
            
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-6">
              {provider.name}
            </h1>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {provider.location && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-lg">{provider.location}</p>
                  </CardContent>
                </Card>
              )}

              {provider.provider_type && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Provider Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-lg">{provider.provider_type}</p>
                  </CardContent>
                </Card>
              )}

              {provider.website && (
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Website
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-lg text-primary hover:underline inline-flex items-center gap-2"
                    >
                      {provider.website}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Provider Details */}
            {provider.notes && (
              <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                <h2 className="text-2xl font-semibold mb-4">About This Provider</h2>
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {provider.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProviderDetail;
