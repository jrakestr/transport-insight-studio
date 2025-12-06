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
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedTos, setSelectedTos] = useState<string>("");

  // Get unique mode/TOS combinations from contractors
  const modeTosOptions = useMemo(() => {
    const options: { mode: string; tos: string; label: string }[] = [];
    
    contractors.forEach(c => {
      if (c.mode && c.tos) {
        const existing = options.find(o => o.mode === c.mode && o.tos === c.tos);
        if (!existing) {
          const modeName = MODE_NAMES[c.mode] || c.mode;
          const tosName = TOS_NAMES[c.tos] || c.tos;
          options.push({
            mode: c.mode,
            tos: c.tos,
            label: `${modeName} (${c.mode}) - ${tosName} (${c.tos})`
          });
        }
      }
    });
    
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [contractors]);

  // Set default selection to first option
  useMemo(() => {
    if (modeTosOptions.length > 0 && !selectedMode && !selectedTos) {
      setSelectedMode(modeTosOptions[0].mode);
      setSelectedTos(modeTosOptions[0].tos);
    }
  }, [modeTosOptions, selectedMode, selectedTos]);

  // Get metrics for selected mode/TOS combination
  const metrics = useMemo((): AggregatedMetrics | null => {
    const record = contractors.find(c => c.mode === selectedMode && c.tos === selectedTos);
    if (!record) return null;

    return {
      total_operating_expenses: record.total_operating_expenses || 0,
      unlinked_passenger_trips: record.unlinked_passenger_trips || 0,
      vehicle_revenue_hours: record.vehicle_revenue_hours || 0,
      passenger_miles: record.passenger_miles || 0,
      vehicle_revenue_miles: record.vehicle_revenue_miles || 0,
      voms_under_contract: record.voms_under_contract || 0,
      fare_revenues_earned: record.fare_revenues_earned || 0,
      cost_per_hour: record.cost_per_hour || 0,
      cost_per_passenger: record.cost_per_passenger || 0,
      passengers_per_hour: record.passengers_per_hour || 0,
      cost_per_passenger_mile: record.cost_per_passenger_mile || 0,
    };
  }, [contractors, selectedMode, selectedTos]);

  // Generate description of what's being shown
  const selectionLabel = useMemo(() => {
    const modeName = MODE_NAMES[selectedMode] || selectedMode;
    const tosName = TOS_NAMES[selectedTos] || selectedTos;
    return `${modeName} (${selectedMode}) - ${tosName} (${selectedTos})`;
  }, [selectedMode, selectedTos]);

  const handleSelectionChange = (value: string) => {
    const option = modeTosOptions.find(o => `${o.mode}-${o.tos}` === value);
    if (option) {
      setSelectedMode(option.mode);
      setSelectedTos(option.tos);
    }
  };

  if (!metrics || modeTosOptions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Agency Performance Metrics
          </CardTitle>
          <Select 
            value={`${selectedMode}-${selectedTos}`} 
            onValueChange={handleSelectionChange}
          >
            <SelectTrigger className="w-[350px]">
              <SelectValue placeholder="Select Mode & Service Type" />
            </SelectTrigger>
            <SelectContent>
              {modeTosOptions.map(option => (
                <SelectItem key={`${option.mode}-${option.tos}`} value={`${option.mode}-${option.tos}`}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          <span className="font-medium">Mode:</span> {MODE_NAMES[selectedMode] || selectedMode} ({selectedMode}) | 
          <span className="font-medium ml-2">Type of Service:</span> {TOS_NAMES[selectedTos] || selectedTos} ({selectedTos})
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
