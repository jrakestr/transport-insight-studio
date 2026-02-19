import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Building2, FileText, TrendingUp, Users, DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo } from "react";

const formatCurrency = (val: number | undefined | null): string => {
  if (val === undefined || val === null) return 'N/A';
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
};

const formatNumber = (val: number | undefined | null): string => {
  if (val === undefined || val === null) return 'N/A';
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toLocaleString();
};

interface ModeTosSubtotal {
  mode: string;
  tos: string;
  vehicles: number;
  operatingExpenses: number;
  passengerTrips: number;
  count: number;
}

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
        .order("mode", { ascending: true })
        .order("tos", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!decodedName,
  });

  // Calculate subtotals by Mode and TOS
  const { subtotals, grandTotal } = useMemo(() => {
    if (!contracts) return { subtotals: [], grandTotal: { vehicles: 0, operatingExpenses: 0, passengerTrips: 0 } };

    const grouped = new Map<string, ModeTosSubtotal>();
    let totalVehicles = 0;
    let totalExpenses = 0;
    let totalTrips = 0;

    contracts.forEach(contract => {
      const mode = contract.mode || 'Unknown';
      const tos = contract.tos || 'Unknown';
      const key = `${mode}|${tos}`;
      
      const vehicles = contract.voms_under_contract || 0;
      const expenses = contract.total_operating_expenses || 0;
      const trips = contract.unlinked_passenger_trips || 0;

      totalVehicles += vehicles;
      totalExpenses += expenses;
      totalTrips += trips;

      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.vehicles += vehicles;
        existing.operatingExpenses += expenses;
        existing.passengerTrips += trips;
        existing.count += 1;
      } else {
        grouped.set(key, {
          mode,
          tos,
          vehicles,
          operatingExpenses: expenses,
          passengerTrips: trips,
          count: 1
        });
      }
    });

    return {
      subtotals: Array.from(grouped.values()).sort((a, b) => {
        if (a.mode !== b.mode) return a.mode.localeCompare(b.mode);
        return a.tos.localeCompare(b.tos);
      }),
      grandTotal: { vehicles: totalVehicles, operatingExpenses: totalExpenses, passengerTrips: totalTrips }
    };
  }, [contracts]);

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
          <Link to="/transportation-providers" state={{ fromDetail: true }}>
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
        <Link to="/transportation-providers" state={{ fromDetail: true }}>
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

        {/* Cumulative Operating Expense Banner */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Operating Expenses</p>
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrency(grandTotal.operatingExpenses)}
                  </p>
                </div>
              </div>
              <div className="hidden md:flex gap-8">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Vehicles</p>
                  <p className="text-2xl font-semibold">{formatNumber(grandTotal.vehicles)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Passenger Trips</p>
                  <p className="text-2xl font-semibold">{formatNumber(grandTotal.passengerTrips)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Subtotals by Mode & TOS */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Summary by Mode & Type of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mode</TableHead>
                    <TableHead>Type of Service</TableHead>
                    <TableHead className="text-right">Contracts</TableHead>
                    <TableHead className="text-right">Vehicles</TableHead>
                    <TableHead className="text-right">Operating Expenses</TableHead>
                    <TableHead className="text-right">Passenger Trips</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subtotals.map((subtotal, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{subtotal.mode}</TableCell>
                      <TableCell>{subtotal.tos}</TableCell>
                      <TableCell className="text-right">{subtotal.count}</TableCell>
                      <TableCell className="text-right">{formatNumber(subtotal.vehicles)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(subtotal.operatingExpenses)}</TableCell>
                      <TableCell className="text-right">{formatNumber(subtotal.passengerTrips)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>Grand Total</TableCell>
                    <TableCell className="text-right">{contracts.length}</TableCell>
                    <TableCell className="text-right">{formatNumber(grandTotal.vehicles)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(grandTotal.operatingExpenses)}</TableCell>
                    <TableCell className="text-right">{formatNumber(grandTotal.passengerTrips)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
                          ? formatCurrency(contract.total_operating_expenses)
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
