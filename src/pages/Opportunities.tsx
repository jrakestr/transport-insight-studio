import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOpportunities } from "@/hooks/useOpportunities";
import { ArrowRight, Loader2, Building2, MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const Opportunities = () => {
  const { data: opportunities, isLoading } = useOpportunities();

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
                Sales Intelligence
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transit Technology <span className="text-primary">Opportunities</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover active RFPs, procurement opportunities, and sales intelligence for transit agencies and transportation providers.
              </p>
            </div>
          </div>
        </section>

        {/* Opportunities Feed */}
        <section className="py-16 lg:py-24">
          <div className="section-container">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : opportunities && opportunities.length > 0 ? (
                  opportunities.map((opportunity) => (
                    <Card 
                      key={opportunity.id} 
                      className="border border-border hover:border-primary transition-colors"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1">
                            {/* Title */}
                            <h3 className="text-2xl font-semibold mb-3">
                              <Link 
                                to={`/opportunities/${opportunity.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {opportunity.title}
                              </Link>
                            </h3>

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                              {opportunity.transit_agencies && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <span>{opportunity.transit_agencies.name}</span>
                                </div>
                              )}
                              {opportunity.transit_agencies?.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{opportunity.transit_agencies.location}</span>
                                </div>
                              )}
                              {opportunity.created_at && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>Posted {format(new Date(opportunity.created_at), 'MMM d, yyyy')}</span>
                                </div>
                              )}
                            </div>

                            {/* Notes/Description */}
                            {opportunity.notes && (
                              <p className="text-muted-foreground mb-4 line-clamp-3">
                                {opportunity.notes}
                              </p>
                            )}

                            {/* Related Article */}
                            {opportunity.articles && (
                              <div className="mb-4">
                                <Badge variant="outline">
                                  Related: {opportunity.articles.title}
                                </Badge>
                              </div>
                            )}

                            <Link to={`/opportunities/${opportunity.id}`}>
                              <Button variant="ghost" size="sm">
                                View Full Details
                                <ArrowRight className="ml-2 h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No opportunities available at this time.
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

export default Opportunities;
