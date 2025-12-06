import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3 } from "lucide-react";
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
            label: `${modeName} (${c.mode}) — ${tosName} (${c.tos})`
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

  const handleSelectionChange = (value: string) => {
    const option = modeTosOptions.find(o => `${o.mode}-${o.tos}` === value);
    if (option) {
      setSelectedMode(option.mode);
      setSelectedTos(option.tos);
    }
  };

  if (!metrics || modeTosOptions.length === 0) return null;

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(2)}`;
  };

  const formatNumber = (val: number) => val.toLocaleString();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance
          </CardTitle>
          <Select 
            value={`${selectedMode}-${selectedTos}`} 
            onValueChange={handleSelectionChange}
          >
            <SelectTrigger className="w-full sm:w-[320px]">
              <SelectValue placeholder="Select Mode & Service" />
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
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Core Metrics - Left Column */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Core Metrics</p>
              <div className="space-y-4">
                {metrics.total_operating_expenses > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-baseline cursor-help py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Total Operating Expenses</span>
                        <span className="text-lg font-bold">{formatCurrency(metrics.total_operating_expenses)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Total cost to operate this mode and service type</TooltipContent>
                  </Tooltip>
                )}
                {metrics.unlinked_passenger_trips > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-baseline cursor-help py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Unlinked Passenger Trips (UPT)</span>
                        <span className="text-lg font-bold">{formatNumber(metrics.unlinked_passenger_trips)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Number of passenger boardings, each boarding counted separately</TooltipContent>
                  </Tooltip>
                )}
                {metrics.passenger_miles > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-baseline cursor-help py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Passenger Miles</span>
                        <span className="text-lg font-bold">{formatNumber(metrics.passenger_miles)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Total miles traveled by all passengers</TooltipContent>
                  </Tooltip>
                )}
                {metrics.vehicle_revenue_hours > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-baseline cursor-help py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Vehicle Revenue Hours (VRH)</span>
                        <span className="text-lg font-bold">{formatNumber(metrics.vehicle_revenue_hours)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Hours vehicles spend in revenue-generating service</TooltipContent>
                  </Tooltip>
                )}
                {metrics.vehicle_revenue_miles > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-baseline cursor-help py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Vehicle Revenue Miles (VRM)</span>
                        <span className="text-lg font-bold">{formatNumber(metrics.vehicle_revenue_miles)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Miles vehicles travel while in revenue-generating service</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Efficiency Metrics - Right Column */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Efficiency Metrics</p>
              <div className="space-y-4">
                {metrics.cost_per_hour > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-baseline cursor-help py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Cost per Hour</span>
                        <span className="text-lg font-bold">${metrics.cost_per_hour.toFixed(2)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Total Operating Expenses ÷ Vehicle Revenue Hours</TooltipContent>
                  </Tooltip>
                )}
                {metrics.cost_per_passenger > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-baseline cursor-help py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Cost per Passenger</span>
                        <span className="text-lg font-bold">${metrics.cost_per_passenger.toFixed(2)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Total Operating Expenses ÷ Unlinked Passenger Trips</TooltipContent>
                  </Tooltip>
                )}
                {metrics.passengers_per_hour > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-baseline cursor-help py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Passengers per Hour</span>
                        <span className="text-lg font-bold">{metrics.passengers_per_hour.toFixed(1)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Unlinked Passenger Trips ÷ Vehicle Revenue Hours</TooltipContent>
                  </Tooltip>
                )}
                {metrics.cost_per_passenger_mile > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-baseline cursor-help py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Cost per Passenger Mile</span>
                        <span className="text-lg font-bold">${metrics.cost_per_passenger_mile.toFixed(2)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Total Operating Expenses ÷ Passenger Miles</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
