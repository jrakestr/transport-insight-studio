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
import { Loader2, Building2, MapPin, Users, ExternalLink, ArrowLeft, Globe, Newspaper, Briefcase, Truck, Bus, Map, UserCheck } from "lucide-react";
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="section-container relative py-12 lg:py-16">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                  {agency.agency_name}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {getDescriptor()}
                </p>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <TooltipProvider>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                {agency.service_area_pop && (
                  <div className="bg-card border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Population Served</p>
                    <p className="text-xl font-bold">{agency.service_area_pop.toLocaleString()}</p>
                  </div>
                )}
                {agency.service_area_sq_miles && (
                  <div className="bg-card border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Service Area</p>
                    <p className="text-xl font-bold">{agency.service_area_sq_miles.toLocaleString()} sq mi</p>
                  </div>
                )}
                {agency.total_voms && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-card border rounded-lg p-4 cursor-help">
                        <p className="text-xs text-muted-foreground mb-1">Total Fleet</p>
                        <p className="text-xl font-bold">{agency.total_voms.toLocaleString()}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Vehicles Operated in Maximum Service</TooltipContent>
                  </Tooltip>
                )}
                {agency.density && (
                  <div className="bg-card border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Density</p>
                    <p className="text-xl font-bold">{agency.density.toLocaleString()}/mi²</p>
                  </div>
                )}
              </div>
            </TooltipProvider>

            {/* Primary Actions */}
            <div className="flex flex-wrap gap-3">
              {agency.url && (
                <Button asChild>
                  <a href={agency.url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {agency.address_line_1 && (
                <Button variant="outline" asChild>
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
              
              {/* Overview */}
              <TooltipProvider>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agency.organization_type && (
                      <div>
                        <p className="text-sm text-muted-foreground">Agency Type</p>
                        <p className="font-medium">{agency.organization_type}</p>
                      </div>
                    )}
                    {agency.reporting_module && (
                      <div>
                        <p className="text-sm text-muted-foreground">Reporting Module</p>
                        <p className="font-medium">{agency.reporting_module}</p>
                      </div>
                    )}
                    {agency.region && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <p className="text-sm text-muted-foreground">FTA Region</p>
                            <p className="font-medium">Region {agency.region}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Federal Transit Administration Region</TooltipContent>
                      </Tooltip>
                    )}
                    {agency.uza_name && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <p className="text-sm text-muted-foreground">Urbanized Area</p>
                            <p className="font-medium">{agency.uza_name}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Census-designated urbanized area</TooltipContent>
                      </Tooltip>
                    )}
                    {agency.ntd_id && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <p className="text-sm text-muted-foreground">NTD ID</p>
                            <p className="font-medium font-mono">{agency.ntd_id}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>National Transit Database Identifier</TooltipContent>
                      </Tooltip>
                    )}
                    {agency.reporter_type && (
                      <div>
                        <p className="text-sm text-muted-foreground">Reporter Type</p>
                        <p className="font-medium">{agency.reporter_type}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipProvider>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  {agency.address_line_1 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Address</p>
                      <a 
                        href={getMapUrl()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <p>{agency.address_line_1}</p>
                        {agency.address_line_2 && <p>{agency.address_line_2}</p>}
                        <p>{[agency.city, agency.state, agency.zip_code].filter(Boolean).join(", ")}</p>
                      </a>
                    </div>
                  )}
                  {agency.url && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Website</p>
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
                </CardContent>
              </Card>

              {/* Fleet & Operations */}
              <TooltipProvider>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bus className="h-5 w-5" />
                      Fleet & Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {agency.total_voms && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <p className="text-sm text-muted-foreground mb-1">Total Fleet</p>
                            <p className="text-2xl font-bold text-primary">{agency.total_voms.toLocaleString()}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Vehicles Operated in Maximum Service (VOMS)</TooltipContent>
                      </Tooltip>
                    )}
                    {agency.voms_do !== null && agency.voms_do !== undefined && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <p className="text-sm text-muted-foreground mb-1">Directly Operated</p>
                            <p className="text-2xl font-bold">{agency.voms_do.toLocaleString()}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>DO - Vehicles operated directly by the agency</TooltipContent>
                      </Tooltip>
                    )}
                    {agency.voms_pt !== null && agency.voms_pt !== undefined && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <p className="text-sm text-muted-foreground mb-1">Purchased Transport</p>
                            <p className="text-2xl font-bold">{agency.voms_pt.toLocaleString()}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>PT - Vehicles operated by contractors</TooltipContent>
                      </Tooltip>
                    )}
                    {agency.volunteer_drivers !== null && agency.volunteer_drivers !== undefined && agency.volunteer_drivers > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Volunteer Drivers</p>
                        <p className="text-2xl font-bold">{agency.volunteer_drivers.toLocaleString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TooltipProvider>

              {/* Service Area */}
              {(agency.service_area_pop || agency.service_area_sq_miles || agency.density) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="h-5 w-5" />
                      Service Area
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {agency.service_area_pop && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Population Served</p>
                        <p className="text-2xl font-bold">{agency.service_area_pop.toLocaleString()}</p>
                      </div>
                    )}
                    {agency.service_area_sq_miles && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Geographic Area</p>
                        <p className="text-2xl font-bold">{agency.service_area_sq_miles.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">sq mi</span></p>
                      </div>
                    )}
                    {agency.density && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Population Density</p>
                        <p className="text-2xl font-bold">{agency.density.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">per sq mi</span></p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Performance Metrics */}
              {!isLoadingContractors && contractors && contractors.length > 0 && (
                <AgencyPerformanceMetrics contractors={contractors} />
              )}

              {/* Service Contracts */}
              {!isLoadingContractors && contractors && contractors.length > 0 && (
                <ServiceContractsTable contractors={contractors} />
              )}

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
