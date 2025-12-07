import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { BarChart3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  useMemo(() => {
    if (modeTosOptions.length > 0 && !selectedMode && !selectedTos) {
      setSelectedMode(modeTosOptions[0].mode);
      setSelectedTos(modeTosOptions[0].tos);
    }
  }, [modeTosOptions, selectedMode, selectedTos]);

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

  const modeSelector = (
    <Select 
      value={`${selectedMode}-${selectedTos}`} 
      onValueChange={handleSelectionChange}
    >
      <SelectTrigger className="w-full sm:w-[320px] bg-background">
        <SelectValue placeholder="Select Mode & Service" />
      </SelectTrigger>
      <SelectContent className="bg-background border shadow-lg z-50">
        {modeTosOptions.map(option => (
          <SelectItem key={`${option.mode}-${option.tos}`} value={`${option.mode}-${option.tos}`}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <TooltipProvider>
      <CollapsibleSection
        title="Performance"
        icon={<div className="p-1.5 rounded-md bg-primary/10"><BarChart3 className="h-4 w-4 text-primary" /></div>}
        actions={modeSelector}
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-1 rounded-full bg-primary" />
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Core Metrics</p>
            </div>
            <div className="space-y-0">
              {metrics.total_operating_expenses > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-baseline cursor-help py-3 border-b border-border/30 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                      <span className="text-sm text-muted-foreground">Total Operating Expenses</span>
                      <span className="text-lg font-bold text-foreground">{formatCurrency(metrics.total_operating_expenses)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Total cost to operate this mode and service type</TooltipContent>
                </Tooltip>
              )}
              {metrics.unlinked_passenger_trips > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-baseline cursor-help py-3 border-b border-border/30 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                      <span className="text-sm text-muted-foreground">Unlinked Passenger Trips (UPT)</span>
                      <span className="text-lg font-bold text-foreground">{formatNumber(metrics.unlinked_passenger_trips)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Number of passenger boardings, each boarding counted separately</TooltipContent>
                </Tooltip>
              )}
              {metrics.passenger_miles > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-baseline cursor-help py-3 border-b border-border/30 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                      <span className="text-sm text-muted-foreground">Passenger Miles</span>
                      <span className="text-lg font-bold text-foreground">{formatNumber(metrics.passenger_miles)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Total miles traveled by all passengers</TooltipContent>
                </Tooltip>
              )}
              {metrics.vehicle_revenue_hours > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-baseline cursor-help py-3 border-b border-border/30 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                      <span className="text-sm text-muted-foreground">Vehicle Revenue Hours (VRH)</span>
                      <span className="text-lg font-bold text-foreground">{formatNumber(metrics.vehicle_revenue_hours)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Hours vehicles spend in revenue-generating service</TooltipContent>
                </Tooltip>
              )}
              {metrics.vehicle_revenue_miles > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-baseline cursor-help py-3 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                      <span className="text-sm text-muted-foreground">Vehicle Revenue Miles (VRM)</span>
                      <span className="text-lg font-bold text-foreground">{formatNumber(metrics.vehicle_revenue_miles)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Miles vehicles travel while in revenue-generating service</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-1 rounded-full bg-accent" />
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Efficiency Metrics</p>
            </div>
            <div className="space-y-0">
              {metrics.cost_per_hour > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-baseline cursor-help py-3 border-b border-border/30 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                      <span className="text-sm text-muted-foreground">Cost per Hour</span>
                      <span className="text-lg font-bold text-foreground">${metrics.cost_per_hour.toFixed(2)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Total Operating Expenses ÷ Vehicle Revenue Hours</TooltipContent>
                </Tooltip>
              )}
              {metrics.cost_per_passenger > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-baseline cursor-help py-3 border-b border-border/30 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                      <span className="text-sm text-muted-foreground">Cost per Passenger</span>
                      <span className="text-lg font-bold text-foreground">${metrics.cost_per_passenger.toFixed(2)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Total Operating Expenses ÷ Unlinked Passenger Trips</TooltipContent>
                </Tooltip>
              )}
              {metrics.passengers_per_hour > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-baseline cursor-help py-3 border-b border-border/30 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                      <span className="text-sm text-muted-foreground">Passengers per Hour</span>
                      <span className="text-lg font-bold text-foreground">{metrics.passengers_per_hour.toFixed(1)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Unlinked Passenger Trips ÷ Vehicle Revenue Hours</TooltipContent>
                </Tooltip>
              )}
              {metrics.cost_per_passenger_mile > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-baseline cursor-help py-3 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                      <span className="text-sm text-muted-foreground">Cost per Passenger Mile</span>
                      <span className="text-lg font-bold text-foreground">${metrics.cost_per_passenger_mile.toFixed(2)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Total Operating Expenses ÷ Passenger Miles</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </TooltipProvider>
  );
}
