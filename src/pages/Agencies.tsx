import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAgencies } from "@/hooks/useAgencies";
import { Loader2, Building2, MapPin, Users, ExternalLink, ArrowRight, Search, ChevronLeft, ChevronRight } from "lucide-react";

const Agencies = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [sortBy, setSortBy] = useState("agency_name");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc");
  
  const { data, isLoading } = useAgencies({
    page,
    limit: 20,
    sortBy,
    sortOrder,
    search: search || undefined,
    state: state || undefined
  });

  const agencies = data?.agencies || [];
  const totalPages = data?.totalPages || 0;

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
              {/* Filters & Search */}
              <div className="mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search agencies, NTD ID, or city..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={state} onValueChange={(val) => { setState(val); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All States</SelectItem>
                      {["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(val) => {
                    const [field, order] = val.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agency_name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="agency_name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="state-asc">State (A-Z)</SelectItem>
                      <SelectItem value="total_voms-desc">Fleet Size (High-Low)</SelectItem>
                      <SelectItem value="total_voms-asc">Fleet Size (Low-High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <p>
                    Showing {agencies.length > 0 ? ((page - 1) * 20) + 1 : 0} - {Math.min(page * 20, data?.total || 0)} of {data?.total || 0} agencies
                  </p>
                  {(search || state) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearch("");
                        setState("");
                        setPage(1);
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : agencies && agencies.length > 0 ? (
                  agencies.map((agency) => (
                    <Link 
                      key={agency.id}
                      to={`/agencies/${agency.id}`}
                    >
                      <Card className="border border-border hover:border-primary transition-colors h-full">
                        <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                              {agency.agency_name}
                            </h3>
                            {agency.doing_business_as && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {agency.doing_business_as}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {(agency.city || agency.state) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="line-clamp-1">{[agency.city, agency.state].filter(Boolean).join(", ")}</span>
                            </div>
                          )}
                          {agency.total_voms && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span>Fleet: {agency.total_voms} vehicles</span>
                            </div>
                          )}
                          {agency.ntd_id && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">NTD ID:</span> {agency.ntd_id}
                            </div>
                          )}
                        </div>

                        {agency.url && (
                          <a 
                            href={agency.url}
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
                        
                        <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No agencies available at this time.
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Agencies;
