import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgency } from "@/hooks/useAgencies";
import { useAgencyRelationships } from "@/hooks/useAgencyRelationships";
import { Loader2, Building2, MapPin, Users, ExternalLink, ArrowLeft, Globe, FileText, Calendar, Newspaper, Briefcase, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const AgencyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: agency, isLoading } = useAgency(id);
  const { data: relationships, isLoading: isLoadingRelationships } = useAgencyRelationships(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Agency Not Found</h1>
            <Button asChild>
              <Link to="/agencies">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Agencies
              </Link>
            </Button>
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
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="section-container relative py-12 lg:py-16">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Agencies
            </Button>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                  {agency.agency_name}
                </h1>
                {agency.doing_business_as && (
                  <p className="text-xl text-muted-foreground">
                    Also known as: {agency.doing_business_as}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {agency.reporter_type && (
                <Badge variant="secondary">{agency.reporter_type}</Badge>
              )}
              {agency.organization_type && (
                <Badge variant="outline">{agency.organization_type}</Badge>
              )}
              {agency.tam_tier && (
                <Badge variant="outline">TAM {agency.tam_tier}</Badge>
              )}
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="py-12 lg:py-16">
          <div className="section-container">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Contact & Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Contact & Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {agency.address_line_1 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Address</p>
                        <p className="text-muted-foreground">{agency.address_line_1}</p>
                        {agency.address_line_2 && (
                          <p className="text-muted-foreground">{agency.address_line_2}</p>
                        )}
                        {(agency.city || agency.state || agency.zip_code) && (
                          <p className="text-muted-foreground">
                            {[agency.city, agency.state, agency.zip_code].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                    {agency.url && (
                      <div>
                        <p className="text-sm font-medium mb-1">Website</p>
                        <a 
                          href={agency.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          {agency.url}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {agency.region && (
                      <div>
                        <p className="text-sm font-medium mb-1">FTA Region</p>
                        <p className="text-muted-foreground">Region {agency.region}</p>
                      </div>
                    )}
                    {agency.uza_name && (
                      <div>
                        <p className="text-sm font-medium mb-1">Urbanized Area</p>
                        <p className="text-muted-foreground">{agency.uza_name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Fleet & Operations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Fleet & Operations
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                  {agency.total_voms && (
                    <div>
                      <p className="text-sm font-medium mb-1">Total Fleet</p>
                      <p className="text-2xl font-bold text-primary">{agency.total_voms}</p>
                      <p className="text-xs text-muted-foreground">Vehicles</p>
                    </div>
                  )}
                  {agency.voms_do && (
                    <div>
                      <p className="text-sm font-medium mb-1">Directly Operated</p>
                      <p className="text-2xl font-bold">{agency.voms_do}</p>
                      <p className="text-xs text-muted-foreground">Vehicles</p>
                    </div>
                  )}
                  {agency.voms_pt && (
                    <div>
                      <p className="text-sm font-medium mb-1">Purchased Transport</p>
                      <p className="text-2xl font-bold">{agency.voms_pt}</p>
                      <p className="text-xs text-muted-foreground">Vehicles</p>
                    </div>
                  )}
                  {agency.volunteer_drivers !== null && agency.volunteer_drivers !== undefined && (
                    <div>
                      <p className="text-sm font-medium mb-1">Volunteer Drivers</p>
                      <p className="text-2xl font-bold">{agency.volunteer_drivers}</p>
                    </div>
                  )}
                  {agency.personal_vehicles !== null && agency.personal_vehicles !== undefined && (
                    <div>
                      <p className="text-sm font-medium mb-1">Personal Vehicles</p>
                      <p className="text-2xl font-bold">{agency.personal_vehicles}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Service Area */}
              {(agency.service_area_pop || agency.service_area_sq_miles || agency.population || agency.density) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Area</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    {agency.service_area_pop && (
                      <div>
                        <p className="text-sm font-medium mb-1">Population Served</p>
                        <p className="text-2xl font-bold">{agency.service_area_pop.toLocaleString()}</p>
                      </div>
                    )}
                    {agency.service_area_sq_miles && (
                      <div>
                        <p className="text-sm font-medium mb-1">Service Area</p>
                        <p className="text-2xl font-bold">{agency.service_area_sq_miles.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Square Miles</p>
                      </div>
                    )}
                    {agency.density && (
                      <div>
                        <p className="text-sm font-medium mb-1">Population Density</p>
                        <p className="text-2xl font-bold">{agency.density.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">per sq mile</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* NTD Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    NTD Reporting Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {agency.ntd_id && (
                      <div>
                        <p className="text-sm font-medium mb-1">NTD ID</p>
                        <p className="text-muted-foreground font-mono">{agency.ntd_id}</p>
                      </div>
                    )}
                    {agency.fta_recipient_id && (
                      <div>
                        <p className="text-sm font-medium mb-1">FTA Recipient ID</p>
                        <p className="text-muted-foreground font-mono">{agency.fta_recipient_id}</p>
                      </div>
                    )}
                    {agency.ueid && (
                      <div>
                        <p className="text-sm font-medium mb-1">UEID</p>
                        <p className="text-muted-foreground font-mono">{agency.ueid}</p>
                      </div>
                    )}
                    {agency.reporting_module && (
                      <div>
                        <p className="text-sm font-medium mb-1">Reporting Module</p>
                        <p className="text-muted-foreground">{agency.reporting_module}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {agency.fy_end_date && (
                      <div>
                        <p className="text-sm font-medium mb-1">Fiscal Year End</p>
                        <p className="text-muted-foreground">{new Date(agency.fy_end_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {agency.original_due_date && (
                      <div>
                        <p className="text-sm font-medium mb-1">Original Due Date</p>
                        <p className="text-muted-foreground">{new Date(agency.original_due_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {agency.reported_by_name && (
                      <div>
                        <p className="text-sm font-medium mb-1">Reported By</p>
                        <p className="text-muted-foreground">{agency.reported_by_name}</p>
                        {agency.reported_by_ntd_id && (
                          <p className="text-xs text-muted-foreground font-mono">{agency.reported_by_ntd_id}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              {agency.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{agency.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Related Articles */}
              {!isLoadingRelationships && relationships?.articles && relationships.articles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Newspaper className="h-5 w-5" />
                      Related Articles ({relationships.articles.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {relationships.articles.map((article: any) => (
                        <Link
                          key={article.id}
                          to={`/article/${article.slug}`}
                          className="block p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex gap-4">
                            {article.image_url && (
                              <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-20 h-20 rounded object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                                {article.title}
                              </h3>
                              {article.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {article.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(article.published_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Opportunities */}
              {!isLoadingRelationships && relationships?.opportunities && relationships.opportunities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Related Opportunities ({relationships.opportunities.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {relationships.opportunities.map((opportunity: any) => (
                        <Link
                          key={opportunity.id}
                          to={`/opportunities/${opportunity.id}`}
                          className="block p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition-colors"
                        >
                          <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                            {opportunity.title}
                          </h3>
                          {opportunity.notes && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {opportunity.notes}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {opportunity.articles && (
                              <span>Source: {opportunity.articles.title}</span>
                            )}
                            {opportunity.transportation_providers && (
                              <span>• Provider: {opportunity.transportation_providers.name}</span>
                            )}
                            <span>• {new Date(opportunity.created_at).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Providers */}
              {!isLoadingRelationships && relationships?.providers && relationships.providers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Related Transportation Providers ({relationships.providers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {relationships.providers.map((provider: any) => (
                        <Link
                          key={provider.id}
                          to={`/providers/${provider.id}`}
                          className="block p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                                {provider.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                {provider.provider_type && (
                                  <Badge variant="secondary">{provider.provider_type}</Badge>
                                )}
                                {provider.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {provider.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            {provider.website && (
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AgencyDetail;
