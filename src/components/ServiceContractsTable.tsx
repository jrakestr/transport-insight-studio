import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Contract {
  id: string;
  contractee_operator_name?: string;
  type_of_contract?: string;
  mode?: string;
  tos?: string;
  voms_under_contract?: number;
  months_seller_operated_in_fy?: number;
  total_modal_expenses?: number;
  direct_payment_agency_subsidy?: number;
  fares_retained_by?: string;
}

interface ServiceContractsTableProps {
  contractors: Contract[];
}

type SortField = 'contractor' | 'mode' | 'vehicles' | 'expenses' | 'subsidy';
type SortDirection = 'asc' | 'desc' | null;

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
        case 'mode':
          aVal = a.mode || '';
          bVal = b.mode || '';
          break;
        case 'vehicles':
          aVal = a.voms_under_contract || 0;
          bVal = b.voms_under_contract || 0;
          break;
        case 'expenses':
          aVal = a.total_modal_expenses || 0;
          bVal = b.total_modal_expenses || 0;
          break;
        case 'subsidy':
          aVal = a.direct_payment_agency_subsidy || 0;
          bVal = b.direct_payment_agency_subsidy || 0;
          break;
        default:
          return 0;
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

  const headerClass = "py-3 px-4 text-sm font-semibold cursor-pointer hover:bg-accent/50 transition-colors select-none";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Service Contracts ({contractors.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th 
                  className={`text-left ${headerClass}`}
                  onClick={() => handleSort('contractor')}
                >
                  <span className="inline-flex items-center">
                    Contractor
                    <SortIcon field="contractor" />
                  </span>
                </th>
                <th 
                  className={`text-left ${headerClass}`}
                  onClick={() => handleSort('mode')}
                >
                  <span className="inline-flex items-center">
                    Mode/Service
                    <SortIcon field="mode" />
                  </span>
                </th>
                <th 
                  className={`text-right ${headerClass}`}
                  onClick={() => handleSort('vehicles')}
                >
                  <span className="inline-flex items-center justify-end w-full">
                    Vehicles
                    <SortIcon field="vehicles" />
                  </span>
                </th>
                <th 
                  className={`text-right ${headerClass}`}
                  onClick={() => handleSort('expenses')}
                >
                  <span className="inline-flex items-center justify-end w-full">
                    Contract Expenses
                    <SortIcon field="expenses" />
                  </span>
                </th>
                <th 
                  className={`text-right ${headerClass}`}
                  onClick={() => handleSort('subsidy')}
                >
                  <span className="inline-flex items-center justify-end w-full">
                    Agency Subsidy
                    <SortIcon field="subsidy" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedContractors.map((contract) => (
                <tr key={contract.id} className="hover:bg-accent/50 transition-colors">
                  <td className="py-3 px-4">
                    {contract.contractee_operator_name ? (
                      <Link 
                        to={`/transportation-providers/${encodeURIComponent(contract.contractee_operator_name)}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {contract.contractee_operator_name}
                      </Link>
                    ) : (
                      <div className="font-medium">Unknown Contractor</div>
                    )}
                    {contract.type_of_contract && (
                      <div className="text-xs text-muted-foreground mt-1">{contract.type_of_contract}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {contract.mode && <Badge variant="outline" className="text-xs">{contract.mode}</Badge>}
                      {contract.tos && <Badge variant="secondary" className="text-xs">{contract.tos}</Badge>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {contract.voms_under_contract || '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {contract.total_modal_expenses 
                      ? `$${(contract.total_modal_expenses / 1000000).toFixed(2)}M`
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {contract.direct_payment_agency_subsidy
                      ? `$${(contract.direct_payment_agency_subsidy / 1000000).toFixed(2)}M`
                      : '-'}
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