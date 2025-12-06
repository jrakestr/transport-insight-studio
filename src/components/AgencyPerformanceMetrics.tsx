import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mode code to name mapping
const MODE_NAMES: Record<string, string> = {
  'MB': 'Bus',
  'DR': 'Demand Response',
  'CB': 'Commuter Bus',
  'RB': 'Bus Rapid Transit',
  'VP': 'Vanpool',
  'TB': 'Trolleybus',
  'FB': 'Ferryboat',
  'LR': 'Light Rail',
  'HR': 'Heavy Rail',
  'CR': 'Commuter Rail',
  'SR': 'Streetcar Rail',
  'MG': 'Monorail/Automated Guideway',
  'CC': 'Cable Car',
  'IP': 'Inclined Plane',
  'PB': 'Publico',
  'AR': 'Alaska Railroad',
  'YR': 'Hybrid Rail',
  'TR': 'Aerial Tramway',
  'DT': 'Demand Response - Taxi',
  'OR': 'Other Rail',
};

// Type of Service mapping
const TOS_NAMES: Record<string, string> = {
  'DO': 'Directly Operated',
  'PT': 'Purchased Transportation',
  'TN': 'Transportation Network Company',
  'TX': 'Taxi',
};

interface ContractorRecord {
  mode?: string;
  tos?: string;
  total_operating_expenses?: number;
  unlinked_passenger_trips?: number;
  vehicle_revenue_hours?: number;
  passenger_miles?: number;
  vehicle_revenue_miles?: number;
  cost_per_hour?: number;
  cost_per_passenger?: number;
  passengers_per_hour?: number;
  cost_per_passenger_mile?: number;
  voms_under_contract?: number;
  fare_revenues_earned?: number;
}

interface AgencyPerformanceMetricsProps {
  contractors: ContractorRecord[];
}

interface AggregatedMetrics {
  total_operating_expenses: number;
  unlinked_passenger_trips: number;
  vehicle_revenue_hours: number;
  passenger_miles: number;
  vehicle_revenue_miles: number;
  voms_under_contract: number;
  fare_revenues_earned: number;
  cost_per_hour: number;
  cost_per_passenger: number;
  passengers_per_hour: number;
  cost_per_passenger_mile: number;
}

export function AgencyPerformanceMetrics({ contractors }: AgencyPerformanceMetricsProps) {
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedTos, setSelectedTos] = useState<string>("all");

  // Get unique modes and TOS from contractors
  const { availableModes, availableTos } = useMemo(() => {
    const modes = new Set<string>();
    const tos = new Set<string>();
    
    contractors.forEach(c => {
      if (c.mode) modes.add(c.mode);
      if (c.tos) tos.add(c.tos);
    });
    
    return {
      availableModes: Array.from(modes).sort(),
      availableTos: Array.from(tos).sort(),
    };
  }, [contractors]);

  // Calculate aggregated metrics based on selection
  const metrics = useMemo((): AggregatedMetrics | null => {
    const filtered = contractors.filter(c => {
      const modeMatch = selectedMode === "all" || c.mode === selectedMode;
      const tosMatch = selectedTos === "all" || c.tos === selectedTos;
      return modeMatch && tosMatch;
    });

    if (filtered.length === 0) return null;

    // Sum up the volume metrics
    const totals = filtered.reduce((acc, c) => ({
      total_operating_expenses: acc.total_operating_expenses + (c.total_operating_expenses || 0),
      unlinked_passenger_trips: acc.unlinked_passenger_trips + (c.unlinked_passenger_trips || 0),
      vehicle_revenue_hours: acc.vehicle_revenue_hours + (c.vehicle_revenue_hours || 0),
      passenger_miles: acc.passenger_miles + (c.passenger_miles || 0),
      vehicle_revenue_miles: acc.vehicle_revenue_miles + (c.vehicle_revenue_miles || 0),
      voms_under_contract: acc.voms_under_contract + (c.voms_under_contract || 0),
      fare_revenues_earned: acc.fare_revenues_earned + (c.fare_revenues_earned || 0),
    }), {
      total_operating_expenses: 0,
      unlinked_passenger_trips: 0,
      vehicle_revenue_hours: 0,
      passenger_miles: 0,
      vehicle_revenue_miles: 0,
      voms_under_contract: 0,
      fare_revenues_earned: 0,
    });

    // Calculate derived efficiency metrics
    const cost_per_hour = totals.vehicle_revenue_hours > 0 
      ? totals.total_operating_expenses / totals.vehicle_revenue_hours 
      : 0;
    const cost_per_passenger = totals.unlinked_passenger_trips > 0 
      ? totals.total_operating_expenses / totals.unlinked_passenger_trips 
      : 0;
    const passengers_per_hour = totals.vehicle_revenue_hours > 0 
      ? totals.unlinked_passenger_trips / totals.vehicle_revenue_hours 
      : 0;
    const cost_per_passenger_mile = totals.passenger_miles > 0 
      ? totals.total_operating_expenses / totals.passenger_miles 
      : 0;

    return {
      total_operating_expenses: totals.total_operating_expenses,
      unlinked_passenger_trips: totals.unlinked_passenger_trips,
      vehicle_revenue_hours: totals.vehicle_revenue_hours,
      passenger_miles: totals.passenger_miles,
      vehicle_revenue_miles: totals.vehicle_revenue_miles,
      voms_under_contract: totals.voms_under_contract,
      fare_revenues_earned: totals.fare_revenues_earned,
      cost_per_hour,
      cost_per_passenger,
      passengers_per_hour,
      cost_per_passenger_mile,
    };
  }, [contractors, selectedMode, selectedTos]);

  // Generate description of what's being shown
  const selectionLabel = useMemo(() => {
    const modeName = selectedMode === "all" 
      ? "All Modes" 
      : MODE_NAMES[selectedMode] || selectedMode;
    const tosName = selectedTos === "all" 
      ? "All Service Types" 
      : TOS_NAMES[selectedTos] || selectedTos;
    
    return `${modeName} • ${tosName}`;
  }, [selectedMode, selectedTos]);

  if (!metrics) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Agency Performance Metrics
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                {availableModes.map(mode => (
                  <SelectItem key={mode} value={mode}>
                    {MODE_NAMES[mode] || mode} ({mode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTos} onValueChange={setSelectedTos}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Service Types</SelectItem>
                {availableTos.map(tos => (
                  <SelectItem key={tos} value={tos}>
                    {TOS_NAMES[tos] || tos} ({tos})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Showing aggregated metrics for: <span className="font-medium">{selectionLabel}</span>
        </p>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid md:grid-cols-3 gap-6">
            {metrics.total_operating_expenses > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <p className="text-sm font-medium mb-1">Total Operating Expenses</p>
                    <p className="text-2xl font-bold">${(metrics.total_operating_expenses / 1000000).toFixed(2)}M</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total cost to operate service for the selected mode and service type</p>
                </TooltipContent>
              </Tooltip>
            )}
            {metrics.unlinked_passenger_trips > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <p className="text-sm font-medium mb-1">Unlinked Passenger Trips (UPT)</p>
                    <p className="text-2xl font-bold">{metrics.unlinked_passenger_trips.toLocaleString()}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of passenger boardings, counting each boarding separately</p>
                </TooltipContent>
              </Tooltip>
            )}
            {metrics.vehicle_revenue_hours > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <p className="text-sm font-medium mb-1">Vehicle Revenue Hours (VRH)</p>
                    <p className="text-2xl font-bold">{metrics.vehicle_revenue_hours.toLocaleString()}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hours vehicles spend in revenue-generating service</p>
                </TooltipContent>
              </Tooltip>
            )}
            {metrics.passenger_miles > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <p className="text-sm font-medium mb-1">Passenger Miles</p>
                    <p className="text-2xl font-bold">{metrics.passenger_miles.toLocaleString()}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total miles traveled by all passengers</p>
                </TooltipContent>
              </Tooltip>
            )}
            {metrics.vehicle_revenue_miles > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <p className="text-sm font-medium mb-1">Vehicle Revenue Miles (VRM)</p>
                    <p className="text-2xl font-bold">{metrics.vehicle_revenue_miles.toLocaleString()}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Miles vehicles travel while in revenue-generating service</p>
                </TooltipContent>
              </Tooltip>
            )}
            {metrics.voms_under_contract > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <p className="text-sm font-medium mb-1">VOMS</p>
                    <p className="text-2xl font-bold">{metrics.voms_under_contract.toLocaleString()}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vehicles Operated in Maximum Service</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* Efficiency Metrics */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-4">Efficiency Metrics (Calculated)</p>
            <div className="grid md:grid-cols-4 gap-6">
              {metrics.cost_per_hour > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <p className="text-sm font-medium mb-1">Cost Per Hour</p>
                      <p className="text-2xl font-bold">${metrics.cost_per_hour.toFixed(2)}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total Operating Expenses ÷ Vehicle Revenue Hours</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {metrics.cost_per_passenger > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <p className="text-sm font-medium mb-1">Cost Per Passenger</p>
                      <p className="text-2xl font-bold">${metrics.cost_per_passenger.toFixed(2)}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total Operating Expenses ÷ Unlinked Passenger Trips</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {metrics.passengers_per_hour > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <p className="text-sm font-medium mb-1">Passengers Per Hour</p>
                      <p className="text-2xl font-bold">{metrics.passengers_per_hour.toFixed(1)}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unlinked Passenger Trips ÷ Vehicle Revenue Hours</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {metrics.cost_per_passenger_mile > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <p className="text-sm font-medium mb-1">Cost Per Passenger Mile</p>
                      <p className="text-2xl font-bold">${metrics.cost_per_passenger_mile.toFixed(2)}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total Operating Expenses ÷ Passenger Miles</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
