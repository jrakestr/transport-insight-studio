import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Building2, Users, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function TransportationProvidersAdmin() {
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [contractTypeFilter, setContractTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  
  const { data: contractors, isLoading, refetch } = useQuery({
    queryKey: ["transportation-providers-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transportation_providers")
        .select("*")
        .not("contractee_operator_name", "is", null)
        .order("contractee_operator_name");
      
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
          };
        }
        acc[name].contracts.push(contractor);
        acc[name].totalVoms += contractor.voms_under_contract || 0;
        if (contractor.agency_name) acc[name].agencies.add(contractor.agency_name);
        if (contractor.type_of_contract) acc[name].contractTypes.add(contractor.type_of_contract);
        if (contractor.mode) acc[name].modes.add(contractor.mode);
        return acc;
      }, {});
      
      return Object.values(grouped).map((provider: any) => ({
        ...provider,
        agencies: Array.from(provider.agencies),
        contractTypes: Array.from(provider.contractTypes),
        modes: Array.from(provider.modes),
      }));
    },
  });

  // Extract unique filter options
  const { uniqueModes, uniqueContractTypes } = useMemo(() => {
    if (!contractors) return { uniqueModes: [], uniqueContractTypes: [] };
    
    const modes = new Set<string>();
    const types = new Set<string>();
    
    contractors.forEach((provider: any) => {
      provider.modes?.forEach((mode: string) => modes.add(mode));
      provider.contractTypes?.forEach((type: string) => types.add(type));
    });
    
    return {
      uniqueModes: Array.from(modes).sort(),
      uniqueContractTypes: Array.from(types).sort(),
    };
  }, [contractors]);

  // Filter and paginate contractors
  const { filteredContractors, totalPages, totalResults } = useMemo(() => {
    if (!contractors) return { filteredContractors: [], totalPages: 0, totalResults: 0 };
    
    let filtered = contractors.filter((provider: any) => {
      // Search filter
      if (searchQuery && !provider.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Mode filter
      if (modeFilter !== "all" && !provider.modes?.includes(modeFilter)) {
        return false;
      }
      
      // Contract type filter
      if (contractTypeFilter !== "all" && !provider.contractTypes?.includes(contractTypeFilter)) {
        return false;
      }
      
      return true;
    });
    
    const total = filtered.length;
    const pages = Math.ceil(total / pageSize);
    
    // Paginate
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginated = filtered.slice(startIdx, endIdx);
    
    return { filteredContractors: paginated, totalPages: pages, totalResults: total };
  }, [contractors, searchQuery, modeFilter, contractTypeFilter, currentPage, pageSize]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleModeFilterChange = (value: string) => {
    setModeFilter(value);
    setCurrentPage(1);
  };

  const handleContractTypeFilterChange = (value: string) => {
    setContractTypeFilter(value);
    setCurrentPage(1);
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      toast.info("Loading CSV file...");
      
      // Fetch the CSV from public folder
      const response = await fetch('/data/2024_Metrics_With_Contracts_JOINED.csv');
      if (!response.ok) {
        throw new Error('Failed to load CSV file');
      }
      const csvContent = await response.text();
      
      toast.info("Starting import of transportation providers data...");
      
      let offset = 0;
      let totalInserted = 0;
      let clearExisting = true;
      
      // Keep calling the function until all data is imported
      while (true) {
        console.log(`Importing batch starting at offset ${offset}...`);
        
        const { data, error } = await supabase.functions.invoke('import-transportation-providers', {
          body: { csvContent, offset, clearExisting }
        });
        
        if (error) throw error;
        
        if (!data.success) {
          toast.error("Import failed. Check console for details.");
          console.error("Import error:", data);
          break;
        }
        
        totalInserted += data.stats.inserted;
        console.log(`Batch completed: ${data.stats.inserted} records, Progress: ${data.stats.progress_percentage}%`);
        
        toast.info(`Importing... ${data.stats.progress_percentage}% (${totalInserted} records)`);
        
        // If there's more data, continue with next batch
        if (data.stats.has_more && data.stats.next_offset !== null) {
          offset = data.stats.next_offset;
          clearExisting = false; // Only clear on first batch
        } else {
          // All done!
          toast.success(`Import completed! Inserted ${totalInserted} records total.`);
          break;
        }
      }
      
      refetch();
    } catch (error) {
      console.error("Import error:", error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Transportation Providers</h1>
        <Button onClick={handleImport} disabled={isImporting}>
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import NTD Data
            </>
          )}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={modeFilter} onValueChange={handleModeFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              {uniqueModes.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={contractTypeFilter} onValueChange={handleContractTypeFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by contract type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contract Types</SelectItem>
              {uniqueContractTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredContractors.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalResults)} of {totalResults} providers
          </span>
          
          <Select value={pageSize.toString()} onValueChange={(value) => {
            setPageSize(Number(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[120px]">
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
        {filteredContractors && filteredContractors.length > 0 ? (
          filteredContractors.map((provider: any) => (
            <Link key={provider.name} to={`/transportation-providers/${encodeURIComponent(provider.name)}`}>
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
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
            {contractors && contractors.length > 0 
              ? "No providers match your filters. Try adjusting your search criteria."
              : "No transportation providers yet. Import NTD metrics data to populate this list."
            }
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
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
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      )}
    </div>
  );
}