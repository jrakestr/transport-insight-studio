import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Building2, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

export default function TransportationProvidersAdmin() {
  const [isImporting, setIsImporting] = useState(false);
  
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
          };
        }
        acc[name].contracts.push(contractor);
        acc[name].totalVoms += contractor.voms_under_contract || 0;
        if (contractor.agency_name) acc[name].agencies.add(contractor.agency_name);
        if (contractor.type_of_contract) acc[name].contractTypes.add(contractor.type_of_contract);
        return acc;
      }, {});
      
      return Object.values(grouped).map((provider: any) => ({
        ...provider,
        agencies: Array.from(provider.agencies),
        contractTypes: Array.from(provider.contractTypes),
      }));
    },
  });

  const handleImport = async () => {
    setIsImporting(true);
    try {
      toast.info("Starting import of transportation providers data...");
      
      const { data, error } = await supabase.functions.invoke('import-transportation-providers');
      
      if (error) throw error;
      
      if (data.success) {
        toast.success(`Import completed! Inserted ${data.stats.inserted} records.`);
        refetch();
      } else {
        toast.error("Import failed. Check console for details.");
      }
      
      console.log("Import results:", data);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractors && contractors.length > 0 ? (
          contractors.map((provider: any) => (
            <Card key={provider.name}>
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
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No transportation providers yet. Import NTD metrics data to populate this list.
          </div>
        )}
      </div>
    </div>
  );
}