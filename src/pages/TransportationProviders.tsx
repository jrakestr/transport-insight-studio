import { Link, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2, MapPin, Users, DollarSign, Search } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const TransportationProviders = () => {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Initialize state from sessionStorage if returning from detail page
  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = sessionStorage.getItem('providers-search');
    return saved || "";
  });
  const [contractTypeFilter, setContractTypeFilter] = useState<string>(() => {
    const saved = sessionStorage.getItem('providers-contract-filter');
    return saved || "all";
  });
  const [modeFilter, setModeFilter] = useState<string>(() => {
    const saved = sessionStorage.getItem('providers-mode-filter');
    return saved || "all";
  });
  const [tosFilter, setTosFilter] = useState<string>(() => {
    const saved = sessionStorage.getItem('providers-tos-filter');
    return saved || "all";
  });
  const [stateFilter, setStateFilter] = useState<string>(() => {
    const saved = sessionStorage.getItem('providers-state-filter');
    return saved || "all";
  });
  const [sortBy, setSortBy] = useState<string>(() => {
    const saved = sessionStorage.getItem('providers-sort');
    return saved || "name-asc";
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem('providers-page');
    return saved ? parseInt(saved) : 1;
  });
  const [pageSize, setPageSize] = useState(() => {
    const saved = sessionStorage.getItem('providers-page-size');
    return saved ? parseInt(saved) : 12;
  });

  const { data: contractors, isLoading } = useQuery({
    queryKey: ["transportation-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transportation_providers")
        .select("*")
        .not("contractee_operator_name", "is", null)
        .order("contractee_operator_name")
        .limit(10000);
      
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
            modes: new Set(),
            typeOfServices: new Set(),
            states: new Set(),
          };
        }
        acc[name].contracts.push(contractor);
        acc[name].totalVoms += contractor.voms_under_contract || 0;
        if (contractor.agency_name) acc[name].agencies.add(contractor.agency_name);
        if (contractor.type_of_contract) acc[name].contractTypes.add(contractor.type_of_contract);
        if (contractor.mode) acc[name].modes.add(contractor.mode);
        if (contractor.tos) acc[name].typeOfServices.add(contractor.tos);
        
        // Get state from agency relationship
        const stateMatch = data.find((d: any) => d.agency_id === contractor.agency_id);
        if (stateMatch?.agency_name) {
          // Extract state from agency if available through joined data
          acc[name].states.add(contractor.contractee_ntd_id?.substring(0, 2) || 'Unknown');
        }
        
        return acc;
      }, {});
      
      return Object.values(grouped).map((provider: any) => ({
        ...provider,
        agencies: Array.from(provider.agencies),
        contractTypes: Array.from(provider.contractTypes),
        modes: Array.from(provider.modes),
        typeOfServices: Array.from(provider.typeOfServices),
        states: Array.from(provider.states),
      }));
    },
  });

  // Restore scroll position when returning from detail page
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('providers-scroll');
    if (savedScrollPosition && location.state?.fromDetail) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
      }, 100);
    }
  }, [location]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('providers-search', searchQuery);
    sessionStorage.setItem('providers-contract-filter', contractTypeFilter);
    sessionStorage.setItem('providers-mode-filter', modeFilter);
    sessionStorage.setItem('providers-tos-filter', tosFilter);
    sessionStorage.setItem('providers-state-filter', stateFilter);
    sessionStorage.setItem('providers-sort', sortBy);
    sessionStorage.setItem('providers-page', currentPage.toString());
    sessionStorage.setItem('providers-page-size', pageSize.toString());
  }, [searchQuery, contractTypeFilter, modeFilter, tosFilter, stateFilter, sortBy, currentPage, pageSize]);

  const handleProviderClick = () => {
    sessionStorage.setItem('providers-scroll', window.scrollY.toString());
  };

  // Extract unique filter options
  const contractTypes = useMemo(() => {
    if (!contractors) return [];
    const types = new Set<string>();
    contractors.forEach((provider: any) => {
      provider.contractTypes.forEach((type: string) => types.add(type));
    });
    return Array.from(types).sort();
  }, [contractors]);

  const modes = useMemo(() => {
    if (!contractors) return [];
    const modeSet = new Set<string>();
    contractors.forEach((provider: any) => {
      provider.modes.forEach((mode: string) => modeSet.add(mode));
    });
    return Array.from(modeSet).sort();
  }, [contractors]);

  const typeOfServices = useMemo(() => {
    if (!contractors) return [];
    const tosSet = new Set<string>();
    contractors.forEach((provider: any) => {
      provider.typeOfServices.forEach((tos: string) => tosSet.add(tos));
    });
    return Array.from(tosSet).sort();
  }, [contractors]);

  const states = useMemo(() => {
    if (!contractors) return [];
    const stateSet = new Set<string>();
    contractors.forEach((provider: any) => {
      provider.states.forEach((state: string) => stateSet.add(state));
    });
    return Array.from(stateSet).sort();
  }, [contractors]);

  // Filter and paginate data
  const filteredContractors = useMemo(() => {
    if (!contractors) return [];
    
    let filtered = contractors.filter((provider: any) => {
      const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContractType = contractTypeFilter === "all" || 
        provider.contractTypes.some((type: string) => type === contractTypeFilter);
      const matchesMode = modeFilter === "all" || 
        provider.modes.some((mode: string) => mode === modeFilter);
      const matchesTos = tosFilter === "all" || 
        provider.typeOfServices.some((tos: string) => tos === tosFilter);
      const matchesState = stateFilter === "all" || 
        provider.states.some((state: string) => state === stateFilter);
      
      return matchesSearch && matchesContractType && matchesMode && matchesTos && matchesState;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "contracts-desc":
          return b.contracts.length - a.contracts.length;
        case "contracts-asc":
          return a.contracts.length - b.contracts.length;
        case "vehicles-desc":
          return b.totalVoms - a.totalVoms;
        case "vehicles-asc":
          return a.totalVoms - b.totalVoms;
        default:
          return 0;
      }
    });

    return filtered;
  }, [contractors, searchQuery, contractTypeFilter, modeFilter, tosFilter, stateFilter, sortBy]);

  const paginatedContractors = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredContractors.slice(startIndex, endIndex);
  }, [filteredContractors, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredContractors.length / pageSize);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleContractTypeFilterChange = (value: string) => {
    setContractTypeFilter(value);
    setCurrentPage(1);
  };

  const handleModeFilterChange = (value: string) => {
    setModeFilter(value);
    setCurrentPage(1);
  };

  const handleTosFilterChange = (value: string) => {
    setTosFilter(value);
    setCurrentPage(1);
  };

  const handleStateFilterChange = (value: string) => {
    setStateFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setCurrentPage(1);
  };

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
              {/* Search and Filters */}
              <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search providers..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-10"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="contracts-desc">Most Contracts</SelectItem>
                      <SelectItem value="contracts-asc">Least Contracts</SelectItem>
                      <SelectItem value="vehicles-desc">Most Vehicles</SelectItem>
                      <SelectItem value="vehicles-asc">Least Vehicles</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={modeFilter} onValueChange={handleModeFilterChange}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      {modes.map((mode) => (
                        <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={tosFilter} onValueChange={handleTosFilterChange}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Type of Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Service Types</SelectItem>
                      {typeOfServices.map((tos) => (
                        <SelectItem key={tos} value={tos}>{tos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stateFilter} onValueChange={handleStateFilterChange}>
                    <SelectTrigger className="w-full md:w-[140px]">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={contractTypeFilter} onValueChange={handleContractTypeFilterChange}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Contract Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contract Types</SelectItem>
                      {contractTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredContractors.length} {filteredContractors.length === 1 ? 'provider' : 'providers'}
                  </p>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 per page</SelectItem>
                      <SelectItem value="24">24 per page</SelectItem>
                      <SelectItem value="48">48 per page</SelectItem>
                      <SelectItem value="96">96 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : paginatedContractors && paginatedContractors.length > 0 ? (
                  paginatedContractors.map((provider: any) => (
                    <Link 
                      key={provider.name} 
                      to={`/transportation-providers/${encodeURIComponent(provider.name)}`}
                      onClick={handleProviderClick}
                    >
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        >
                          First
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        >
                          Last
                        </PaginationLink>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
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

export default TransportationProviders;
