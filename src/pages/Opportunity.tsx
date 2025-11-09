import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Building2, MapPin, Calendar, ExternalLink, Newspaper } from "lucide-react";
import { useOpportunities } from "@/hooks/useOpportunities";
import { format } from "date-fns";

const Opportunity = () => {
  const { id } = useParams();
  const { data: opportunities, isLoading } = useOpportunities();
  const opportunity = opportunities?.find(o => o.id === id);

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

  if (!opportunity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Opportunity Not Found</h1>
            <Link to="/opportunities">
              <Button>View All Opportunities</Button>
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
            <Link to="/opportunities">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Opportunities
              </Button>
            </Link>
          </div>
        </section>

        {/* Opportunity Content */}
        <div className="bg-background px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <Badge>Sales Opportunity</Badge>
            </div>
            
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-6">
              {opportunity.title}
            </h1>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {opportunity.transit_agencies && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Transit Agency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-lg">{opportunity.transit_agencies.agency_name}</p>
                    {(opportunity.transit_agencies.city || opportunity.transit_agencies.state) && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {[opportunity.transit_agencies.city, opportunity.transit_agencies.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {opportunity.transit_agencies.total_voms && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Fleet Size: {opportunity.transit_agencies.total_voms}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {opportunity.transportation_providers && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Transportation Provider
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-lg">{opportunity.transportation_providers.name}</p>
                    {opportunity.transportation_providers.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {opportunity.transportation_providers.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Posted Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">
                    {format(new Date(opportunity.created_at), 'MMMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Opportunity Details */}
            {opportunity.notes && (
              <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                <h2 className="text-2xl font-semibold mb-4">Opportunity Details</h2>
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {opportunity.notes}
                </div>
              </div>
            )}

            {/* Related Article */}
            {opportunity.articles && (
              <div className="border-t pt-12">
                <h2 className="text-2xl font-semibold mb-6">Related Article</h2>
                <Card className="border border-border hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Newspaper className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          <Link 
                            to={`/article/${opportunity.articles.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {opportunity.articles.title}
                          </Link>
                        </h3>
                        {opportunity.articles.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {opportunity.articles.description}
                          </p>
                        )}
                        <Link to={`/article/${opportunity.articles.slug}`}>
                          <Button variant="ghost" size="sm">
                            Read Article
                            <ArrowLeft className="ml-2 h-3 w-3 rotate-180" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Opportunity;
