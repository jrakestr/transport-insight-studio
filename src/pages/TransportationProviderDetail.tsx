import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Building2, FileText, TrendingUp, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TransportationProviderDetail() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name || "");

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["transportation-provider-detail", decodedName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transportation_providers")
        .select(`
          *,
          transit_agencies:agency_id (
            agency_name,
            city,
            state,
            ntd_id
          )
        `)
        .eq("contractee_operator_name", decodedName)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!decodedName,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-12">
          <Link to="/transportation-providers">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Providers
            </Button>
          </Link>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Provider Not Found</h1>
            <p className="text-muted-foreground">No contracts found for this provider.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalVoms = contracts.reduce((sum, c) => sum + (c.voms_under_contract || 0), 0);
  const uniqueAgencies = new Set(contracts.map(c => c.agency_id)).size;
  const contractTypes = [...new Set(contracts.map(c => c.type_of_contract).filter(Boolean))];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Link to="/transportation-providers">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Providers
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{decodedName}</h1>
              <p className="text-muted-foreground">Transportation Provider</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehicles Under Contract</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVoms}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transit Agencies Served</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueAgencies}</div>
            </CardContent>
          </Card>
        </div>

        {contractTypes.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contract Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {contractTypes.map((type, idx) => (
                  <Badge key={idx} variant="outline">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Type of Service</TableHead>
                    <TableHead className="text-right">Vehicles</TableHead>
                    <TableHead className="text-right">Operating Expenses</TableHead>
                    <TableHead className="text-right">Passenger Trips</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <Link 
                          to={`/agencies/${contract.agency_id}`}
                          className="font-medium hover:text-primary"
                        >
                          {contract.transit_agencies?.agency_name || contract.agency_name || 'N/A'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {contract.transit_agencies?.city && contract.transit_agencies?.state
                          ? `${contract.transit_agencies.city}, ${contract.transit_agencies.state}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{contract.mode || 'N/A'}</TableCell>
                      <TableCell>{contract.tos || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        {contract.voms_under_contract?.toLocaleString() || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {contract.total_operating_expenses
                          ? `$${contract.total_operating_expenses.toLocaleString()}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {contract.unlinked_passenger_trips?.toLocaleString() || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
