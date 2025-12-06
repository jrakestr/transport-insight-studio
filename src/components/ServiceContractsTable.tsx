import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowUpDown, ArrowUp, ArrowDown, Check, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Contract {
  id: string;
  contractee_operator_name?: string;
  type_of_contract?: string;
  mode?: string;
  tos?: string;
  voms_under_contract?: number;
  total_modal_expenses?: number;
  direct_payment_agency_subsidy?: number;
  buyer_supplies_vehicles_to_seller?: boolean;
  buyer_provides_maintenance_facility_to_seller?: boolean;
  unlinked_passenger_trips?: number;
  passenger_miles?: number;
  vehicle_revenue_hours?: number;
  vehicle_revenue_miles?: number;
  cost_per_hour?: number;
  cost_per_passenger?: number;
  cost_per_passenger_mile?: number;
  passengers_per_hour?: number;
}

interface ServiceContractsTableProps {
  contractors: Contract[];
}

type SortField = 
  | 'contractor' | 'type_of_contract' | 'mode' | 'tos' 
  | 'voms_under_contract' | 'total_modal_expenses' | 'direct_payment_agency_subsidy'
  | 'unlinked_passenger_trips' | 'passenger_miles' | 'vehicle_revenue_hours' | 'vehicle_revenue_miles'
  | 'cost_per_hour' | 'cost_per_passenger' | 'cost_per_passenger_mile' | 'passengers_per_hour';

type SortDirection = 'asc' | 'desc' | null;

const formatNumber = (val: number | undefined | null): string => {
  if (val === undefined || val === null) return '-';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString();
};

const formatCurrency = (val: number | undefined | null): string => {
  if (val === undefined || val === null) return '-';
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toFixed(2)}`;
};

const formatDecimal = (val: number | undefined | null): string => {
  if (val === undefined || val === null) return '-';
  return val.toFixed(2);
};

export const ServiceContractsTable = ({ contractors }: ServiceContractsTableProps) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedContractors = useMemo(() => {
    if (!sortField || !sortDirection) return contractors;

    return [...contractors].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'contractor':
          aVal = a.contractee_operator_name || '';
          bVal = b.contractee_operator_name || '';
          break;
        case 'type_of_contract':
          aVal = a.type_of_contract || '';
          bVal = b.type_of_contract || '';
          break;
        case 'mode':
          aVal = a.mode || '';
          bVal = b.mode || '';
          break;
        case 'tos':
          aVal = a.tos || '';
          bVal = b.tos || '';
          break;
        default:
          aVal = (a as any)[sortField] || 0;
          bVal = (b as any)[sortField] || 0;
      }

      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [contractors, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 ml-1" />;
    }
    return <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const BoolIcon = ({ value }: { value: boolean | undefined | null }) => {
    if (value === true) return <Check className="h-4 w-4 text-green-600" />;
    if (value === false) return <X className="h-4 w-4 text-muted-foreground" />;
    return <span className="text-muted-foreground">-</span>;
  };

  const thBase = "py-2 px-2 text-xs font-semibold cursor-pointer hover:bg-accent/50 transition-colors select-none whitespace-nowrap";
  const tdBase = "py-2 px-2 text-sm";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Service Contracts ({contractors.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {/* Group Headers */}
              <tr className="border-b bg-muted/30">
                <th colSpan={2} className="py-1 px-2 text-xs font-bold text-left">Contractor</th>
                <th colSpan={2} className="py-1 px-2 text-xs font-bold text-left border-l">Contract Info</th>
                <th colSpan={2} className="py-1 px-2 text-xs font-bold text-center border-l">Assets Provided</th>
                <th colSpan={3} className="py-1 px-2 text-xs font-bold text-right border-l">Financials</th>
                <th colSpan={4} className="py-1 px-2 text-xs font-bold text-right border-l">Service Volume</th>
                <th colSpan={4} className="py-1 px-2 text-xs font-bold text-right border-l">Efficiency Metrics</th>
              </tr>
              {/* Column Headers */}
              <tr className="border-b">
                {/* Contractor */}
                <th className={`text-left ${thBase}`} onClick={() => handleSort('contractor')}>
                  <span className="inline-flex items-center">Name<SortIcon field="contractor" /></span>
                </th>
                <th className={`text-left ${thBase}`} onClick={() => handleSort('type_of_contract')}>
                  <span className="inline-flex items-center">Type<SortIcon field="type_of_contract" /></span>
                </th>
                
                {/* Contract Info */}
                <th className={`text-left ${thBase} border-l`} onClick={() => handleSort('mode')}>
                  <span className="inline-flex items-center">Mode<SortIcon field="mode" /></span>
                </th>
                <th className={`text-left ${thBase}`} onClick={() => handleSort('tos')}>
                  <span className="inline-flex items-center">TOS<SortIcon field="tos" /></span>
                </th>
                
                {/* Assets Provided */}
                <th className={`text-center ${thBase} border-l`}>
                  <Tooltip><TooltipTrigger>Vehicles</TooltipTrigger><TooltipContent>Buyer Supplies Vehicles</TooltipContent></Tooltip>
                </th>
                <th className={`text-center ${thBase}`}>
                  <Tooltip><TooltipTrigger>Facility</TooltipTrigger><TooltipContent>Buyer Provides Maintenance Facility</TooltipContent></Tooltip>
                </th>
                
                {/* Financials */}
                <th className={`text-right ${thBase} border-l`} onClick={() => handleSort('voms_under_contract')}>
                  <span className="inline-flex items-center justify-end w-full">VOMS<SortIcon field="voms_under_contract" /></span>
                </th>
                <th className={`text-right ${thBase}`} onClick={() => handleSort('total_modal_expenses')}>
                  <span className="inline-flex items-center justify-end w-full">Expenses<SortIcon field="total_modal_expenses" /></span>
                </th>
                <th className={`text-right ${thBase}`} onClick={() => handleSort('direct_payment_agency_subsidy')}>
                  <span className="inline-flex items-center justify-end w-full">Subsidy<SortIcon field="direct_payment_agency_subsidy" /></span>
                </th>
                
                {/* Service Volume */}
                <th className={`text-right ${thBase} border-l`} onClick={() => handleSort('unlinked_passenger_trips')}>
                  <span className="inline-flex items-center justify-end w-full">UPT<SortIcon field="unlinked_passenger_trips" /></span>
                </th>
                <th className={`text-right ${thBase}`} onClick={() => handleSort('passenger_miles')}>
                  <span className="inline-flex items-center justify-end w-full">Pass. Miles<SortIcon field="passenger_miles" /></span>
                </th>
                <th className={`text-right ${thBase}`} onClick={() => handleSort('vehicle_revenue_hours')}>
                  <span className="inline-flex items-center justify-end w-full">VRH<SortIcon field="vehicle_revenue_hours" /></span>
                </th>
                <th className={`text-right ${thBase}`} onClick={() => handleSort('vehicle_revenue_miles')}>
                  <span className="inline-flex items-center justify-end w-full">VRM<SortIcon field="vehicle_revenue_miles" /></span>
                </th>
                
                {/* Efficiency Metrics */}
                <th className={`text-right ${thBase} border-l`} onClick={() => handleSort('cost_per_hour')}>
                  <span className="inline-flex items-center justify-end w-full">$/Hour<SortIcon field="cost_per_hour" /></span>
                </th>
                <th className={`text-right ${thBase}`} onClick={() => handleSort('cost_per_passenger')}>
                  <span className="inline-flex items-center justify-end w-full">$/Pass<SortIcon field="cost_per_passenger" /></span>
                </th>
                <th className={`text-right ${thBase}`} onClick={() => handleSort('cost_per_passenger_mile')}>
                  <span className="inline-flex items-center justify-end w-full">$/PM<SortIcon field="cost_per_passenger_mile" /></span>
                </th>
                <th className={`text-right ${thBase}`} onClick={() => handleSort('passengers_per_hour')}>
                  <span className="inline-flex items-center justify-end w-full">Pass/Hr<SortIcon field="passengers_per_hour" /></span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedContractors.map((contract) => (
                <tr key={contract.id} className="hover:bg-accent/50 transition-colors">
                  {/* Contractor */}
                  <td className={tdBase}>
                    {contract.contractee_operator_name ? (
                      <Link 
                        to={`/transportation-providers/${encodeURIComponent(contract.contractee_operator_name)}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {contract.contractee_operator_name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Unknown</span>
                    )}
                  </td>
                  <td className={tdBase}>
                    {contract.type_of_contract && (
                      <Badge variant="outline" className="text-xs">{contract.type_of_contract}</Badge>
                    )}
                  </td>
                  
                  {/* Contract Info */}
                  <td className={`${tdBase} border-l`}>
                    {contract.mode && <Badge variant="outline" className="text-xs">{contract.mode}</Badge>}
                  </td>
                  <td className={tdBase}>
                    {contract.tos && <Badge variant="secondary" className="text-xs">{contract.tos}</Badge>}
                  </td>
                  
                  {/* Assets Provided */}
                  <td className={`${tdBase} text-center border-l`}>
                    <BoolIcon value={contract.buyer_supplies_vehicles_to_seller} />
                  </td>
                  <td className={`${tdBase} text-center`}>
                    <BoolIcon value={contract.buyer_provides_maintenance_facility_to_seller} />
                  </td>
                  
                  {/* Financials */}
                  <td className={`${tdBase} text-right font-medium border-l`}>
                    {contract.voms_under_contract || '-'}
                  </td>
                  <td className={`${tdBase} text-right font-medium`}>
                    {formatCurrency(contract.total_modal_expenses)}
                  </td>
                  <td className={`${tdBase} text-right`}>
                    {formatCurrency(contract.direct_payment_agency_subsidy)}
                  </td>
                  
                  {/* Service Volume */}
                  <td className={`${tdBase} text-right border-l`}>
                    {formatNumber(contract.unlinked_passenger_trips)}
                  </td>
                  <td className={`${tdBase} text-right`}>
                    {formatNumber(contract.passenger_miles)}
                  </td>
                  <td className={`${tdBase} text-right`}>
                    {formatNumber(contract.vehicle_revenue_hours)}
                  </td>
                  <td className={`${tdBase} text-right`}>
                    {formatNumber(contract.vehicle_revenue_miles)}
                  </td>
                  
                  {/* Efficiency Metrics */}
                  <td className={`${tdBase} text-right border-l`}>
                    {formatCurrency(contract.cost_per_hour)}
                  </td>
                  <td className={`${tdBase} text-right`}>
                    {formatCurrency(contract.cost_per_passenger)}
                  </td>
                  <td className={`${tdBase} text-right`}>
                    {formatCurrency(contract.cost_per_passenger_mile)}
                  </td>
                  <td className={`${tdBase} text-right`}>
                    {formatDecimal(contract.passengers_per_hour)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
