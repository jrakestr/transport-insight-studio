import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgency } from "@/hooks/useAgencies";
import { useAgencyRelationships } from "@/hooks/useAgencyRelationships";
import { useAgencyContractors } from "@/hooks/useAgencyContractors";
import { AgencyContacts } from "@/components/AgencyContacts";
import { AgencyIntelligence } from "@/components/AgencyIntelligence";
import { AgencySoftware } from "@/components/AgencySoftware";
import { ServiceContractsTable } from "@/components/ServiceContractsTable";
import { AgencyPerformanceMetrics } from "@/components/AgencyPerformanceMetrics";
import { AgencyMap } from "@/components/AgencyMap";
import { Loader2, Building2, MapPin, Users, ExternalLink, ArrowLeft, Globe, Newspaper, Briefcase, Truck, Bus, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AgencyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: agency, isLoading } = useAgency(id);
  const { data: relationships, isLoading: isLoadingRelationships } = useAgencyRelationships(id);
  const { data: contractors, isLoading: isLoadingContractors } = useAgencyContractors(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
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

  // Generate one-line descriptor
  const getDescriptor = () => {
    const parts: string[] = [];
    if (agency.organization_type) parts.push(agency.organization_type);
    if (agency.uza_name) parts.push(`serving ${agency.uza_name}`);
    return parts.join(' ') || 'Transit Agency';
  };

  // Build Google Maps URL from address
  const getMapUrl = () => {
    const addressParts = [
      agency.address_line_1,
      agency.city,
      agency.state,
      agency.zip_code
    ].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section with gradient */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
          <div className="section-container relative py-10 lg:py-14">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-start gap-5 mb-6">
              <div className="p-4 rounded-xl bg-gradient-primary shadow-soft">
                <Building2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 leading-tight text-foreground">
                  {agency.agency_name}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {getDescriptor()}
                </p>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <TooltipProvider>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
                {agency.service_area_pop && (
                  <div className="stat-card">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Population</p>
                    <p className="text-xl font-bold text-foreground">{agency.service_area_pop.toLocaleString()}</p>
                  </div>
                )}
                {agency.service_area_sq_miles && (
                  <div className="stat-card">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Service Area</p>
                    <p className="text-xl font-bold text-foreground">{agency.service_area_sq_miles.toLocaleString()} <span className="text-sm font-normal">mi²</span></p>
                  </div>
                )}
                {agency.total_voms && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="stat-card cursor-help">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Fleet Size</p>
                        <p className="text-xl font-bold text-foreground">{agency.total_voms.toLocaleString()}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Vehicles Operated in Maximum Service (VOMS)</TooltipContent>
                  </Tooltip>
                )}
                {agency.density && (
                  <div className="stat-card">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Density</p>
                    <p className="text-xl font-bold text-foreground">{agency.density.toLocaleString()}<span className="text-sm font-normal">/mi²</span></p>
                  </div>
                )}
              </div>
            </TooltipProvider>

            {/* Primary Actions */}
            <div className="flex flex-wrap gap-3">
              {agency.url && (
                <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft">
                  <a href={agency.url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {agency.address_line_1 && (
                <Button variant="outline" asChild className="border-border/60 hover:border-primary/50 hover:bg-primary/5">
                  <a href={getMapUrl()} target="_blank" rel="noopener noreferrer">
                    <MapPin className="h-4 w-4 mr-2" />
                    Directions
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="py-8 lg:py-12">
          <div className="section-container">
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* Overview Card */}
              <TooltipProvider>
                <Card className="card-elevated border-border/50">
                  <CardHeader className="border-b border-border/30 bg-muted/20">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {agency.organization_type && (
                        <div className="group">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Agency Type</p>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{agency.organization_type}</p>
                        </div>
                      )}
                      {agency.reporting_module && (
                        <div className="group">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Reporting Module</p>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{agency.reporting_module}</p>
                        </div>
                      )}
                      {agency.region && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help group">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">FTA Region</p>
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors">Region {agency.region}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Federal Transit Administration Region</TooltipContent>
                        </Tooltip>
                      )}
                      {agency.uza_name && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help group">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Urbanized Area</p>
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors">{agency.uza_name}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Census-designated urbanized area</TooltipContent>
                        </Tooltip>
                      )}
                      {agency.ntd_id && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help group">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">NTD ID</p>
                              <p className="font-medium font-mono text-foreground group-hover:text-primary transition-colors">{agency.ntd_id}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>National Transit Database Identifier</TooltipContent>
                        </Tooltip>
                      )}
                      {agency.reporter_type && (
                        <div className="group">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Reporter Type</p>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{agency.reporter_type}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipProvider>

              {/* Contact Card */}
              <Card className="card-elevated border-border/50">
                <CardHeader className="border-b border-border/30 bg-muted/20">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-md bg-accent/10">
                      <MapPin className="h-4 w-4 text-accent" />
                    </div>
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {agency.address_line_1 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Address</p>
                        <a 
                          href={getMapUrl()} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-primary transition-colors block"
                        >
                          <p className="font-medium">{agency.address_line_1}</p>
                          {agency.address_line_2 && <p>{agency.address_line_2}</p>}
                          <p>{[agency.city, agency.state, agency.zip_code].filter(Boolean).join(", ")}</p>
                        </a>
                      </div>
                    )}
                    {agency.url && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Website</p>
                        <a 
                          href={agency.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
                        >
                          <Globe className="h-4 w-4" />
                          {agency.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              {agency.address_line_1 && (
                <AgencyMap 
                  address={[agency.address_line_1, agency.city, agency.state, agency.zip_code].filter(Boolean).join(', ')}
                  agencyName={agency.agency_name}
                />
              )}

              {/* Fleet & Operations */}
              <TooltipProvider>
                <Card className="card-elevated border-border/50">
                  <CardHeader className="border-b border-border/30 bg-muted/20">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-1.5 rounded-md bg-success/10">
                        <Bus className="h-4 w-4 text-success" />
                      </div>
                      Fleet & Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {agency.total_voms && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help border-l-2 border-primary pl-4">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total Fleet</p>
                              <p className="text-2xl font-bold text-primary">{agency.total_voms.toLocaleString()}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Vehicles Operated in Maximum Service (VOMS)</TooltipContent>
                        </Tooltip>
                      )}
                      {agency.voms_do !== null && agency.voms_do !== undefined && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help border-l-2 border-accent/60 pl-4">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Directly Operated</p>
                              <p className="text-2xl font-bold text-foreground">{agency.voms_do.toLocaleString()}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>DO - Vehicles operated directly by the agency</TooltipContent>
                        </Tooltip>
                      )}
                      {agency.voms_pt !== null && agency.voms_pt !== undefined && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help border-l-2 border-warning/60 pl-4">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Purchased Transport</p>
                              <p className="text-2xl font-bold text-foreground">{agency.voms_pt.toLocaleString()}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>PT - Vehicles operated by contractors</TooltipContent>
                        </Tooltip>
                      )}
                      {agency.volunteer_drivers !== null && agency.volunteer_drivers !== undefined && agency.volunteer_drivers > 0 && (
                        <div className="border-l-2 border-muted-foreground/30 pl-4">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Volunteer Drivers</p>
                          <p className="text-2xl font-bold text-foreground">{agency.volunteer_drivers.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipProvider>

              {/* Service Area */}

              {/* Performance Metrics */}
              {!isLoadingContractors && contractors && contractors.length > 0 && (
                <AgencyPerformanceMetrics contractors={contractors} />
              )}

              {/* Service Contracts */}
              {!isLoadingContractors && contractors && contractors.length > 0 && (
                <ServiceContractsTable contractors={contractors} />
              )}

              {/* Divider */}
              <div className="divider-gradient my-8" />

              {/* CRM Contacts */}
              <AgencyContacts agencyId={agency.id} />

              {/* Website Intelligence */}
              <AgencyIntelligence 
                agencyId={agency.id} 
                agencyUrl={agency.url} 
                agencyName={agency.agency_name}
              />

              {/* Software Stack */}
              <AgencySoftware agencyId={agency.id} />

              {/* Related Articles */}
              {!isLoadingRelationships && relationships?.articles && relationships.articles.length > 0 && (
                <Card className="card-elevated border-border/50">
                  <CardHeader className="border-b border-border/30 bg-muted/20">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <Newspaper className="h-4 w-4 text-primary" />
                      </div>
                      Related Articles ({relationships.articles.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {relationships.articles.map((article: any) => (
                        <Link
                          key={article.id}
                          to={`/article/${article.slug}`}
                          className="block p-4 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 hover:shadow-soft transition-all duration-200"
                        >
                          <div className="flex gap-4">
                            {article.image_url && (
                              <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1 text-foreground hover:text-primary transition-colors">
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
                <Card className="card-elevated border-border/50">
                  <CardHeader className="border-b border-border/30 bg-muted/20">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-1.5 rounded-md bg-success/10">
                        <Briefcase className="h-4 w-4 text-success" />
                      </div>
                      Related Opportunities ({relationships.opportunities.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {relationships.opportunities.map((opportunity: any) => (
                        <Link
                          key={opportunity.id}
                          to={`/opportunities/${opportunity.id}`}
                          className="block p-4 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 hover:shadow-soft transition-all duration-200"
                        >
                          <h3 className="font-semibold mb-2 text-foreground hover:text-primary transition-colors">
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
                            {opportunity.service_providers && (
                              <span>• Provider: {opportunity.service_providers.name}</span>
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
                <Card className="card-elevated border-border/50">
                  <CardHeader className="border-b border-border/30 bg-muted/20">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-1.5 rounded-md bg-accent/10">
                        <Truck className="h-4 w-4 text-accent" />
                      </div>
                      Related Transportation Providers ({relationships.providers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {relationships.providers.map((provider: any) => (
                        <Link
                          key={provider.id}
                          to={`/providers/${provider.id}`}
                          className="block p-4 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 hover:shadow-soft transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1 text-foreground hover:text-primary transition-colors">
                                {provider.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                {provider.provider_type && (
                                  <Badge variant="secondary" className="bg-secondary/80">{provider.provider_type}</Badge>
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
