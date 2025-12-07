import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { DollarSign, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface Contract {
  id: string;
  contractee_operator_name?: string;
  type_of_contract?: string;
  mode?: string;
  tos?: string;
  voms_under_contract?: number;
  total_modal_expenses?: number;
  direct_payment_agency_subsidy?: number;
}

interface ServiceContractsTableProps {
  contractors: Contract[];
}

type SortField = 
  | 'contractor' | 'type_of_contract' | 'mode' | 'tos' 
  | 'voms_under_contract' | 'total_modal_expenses' | 'direct_payment_agency_subsidy';

type SortDirection = 'asc' | 'desc' | null;

const formatCurrency = (val: number | undefined | null): string => {
  if (val === undefined || val === null) return '-';
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toFixed(2)}`;
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

  const filteredContractors = useMemo(() => {
    return contractors.filter(c => c.tos || c.type_of_contract || c.contractee_operator_name);
  }, [contractors]);

  const sortedContractors = useMemo(() => {
    if (!sortField || !sortDirection) return filteredContractors;

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
  }, [filteredContractors, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 ml-1" />;
    }
    return <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const thBase = "py-2 px-2 text-xs font-semibold cursor-pointer hover:bg-accent/50 transition-colors select-none whitespace-nowrap";
  const thSticky = "sticky left-0 z-20 bg-background";
  const tdBase = "py-2 px-2 text-sm";
  const tdSticky = "sticky left-0 z-10 bg-background";

  return (
    <TooltipProvider>
      <CollapsibleSection
        title="Service Contracts"
        icon={<div className="p-1.5 rounded-md bg-success/10"><DollarSign className="h-4 w-4 text-success" /></div>}
        count={filteredContractors.length}
        isEmpty={filteredContractors.length === 0}
      >
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th colSpan={2} className="py-1 px-2 text-xs font-bold text-left sticky left-0 z-20 bg-muted/30">Contractor</th>
                <th colSpan={3} className="py-1 px-2 text-xs font-bold text-left border-l">Contract Info</th>
                <th colSpan={3} className="py-1 px-2 text-xs font-bold text-right border-l">Financials</th>
              </tr>
              <tr className="border-b">
                <th className={`text-left ${thBase} ${thSticky} min-w-[180px]`} onClick={() => handleSort('contractor')}>
                  <span className="inline-flex items-center">Name<SortIcon field="contractor" /></span>
                </th>
                <th className={`text-left ${thBase}`} onClick={() => handleSort('type_of_contract')}>
                  <span className="inline-flex items-center">Type<SortIcon field="type_of_contract" /></span>
                </th>
                
                <th className={`text-left ${thBase} border-l`} onClick={() => handleSort('mode')}>
                  <span className="inline-flex items-center">Mode<SortIcon field="mode" /></span>
                </th>
                <th className={`text-left ${thBase}`} onClick={() => handleSort('tos')}>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center">TOS<SortIcon field="tos" /></TooltipTrigger>
                    <TooltipContent>Type of Service</TooltipContent>
                  </Tooltip>
                </th>
                <th className={`text-right ${thBase}`} onClick={() => handleSort('voms_under_contract')}>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center justify-end w-full">VOMS<SortIcon field="voms_under_contract" /></TooltipTrigger>
                    <TooltipContent>Vehicles Operated in Maximum Service</TooltipContent>
                  </Tooltip>
                </th>
                
                <th className={`text-right ${thBase} border-l`} onClick={() => handleSort('total_modal_expenses')}>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center justify-end w-full">Expenses<SortIcon field="total_modal_expenses" /></TooltipTrigger>
                    <TooltipContent>Total Modal Expenses</TooltipContent>
                  </Tooltip>
                </th>
                <th className={`text-right ${thBase}`} onClick={() => handleSort('direct_payment_agency_subsidy')}>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center justify-end w-full">Subsidy<SortIcon field="direct_payment_agency_subsidy" /></TooltipTrigger>
                    <TooltipContent>Direct Payment Agency Subsidy</TooltipContent>
                  </Tooltip>
                </th>
                <th className={`text-right ${thBase}`}>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center justify-end w-full">$/VOMS</TooltipTrigger>
                    <TooltipContent>Cost per Vehicle (total_modal_expenses / VOMS)</TooltipContent>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedContractors.map((contract) => (
                <tr key={contract.id} className="hover:bg-accent/50 transition-colors">
                  <td className={`${tdBase} ${tdSticky} min-w-[180px]`}>
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
                  
                  <td className={`${tdBase} border-l`}>
                    {contract.mode && <Badge variant="outline" className="text-xs">{contract.mode}</Badge>}
                  </td>
                  <td className={tdBase}>
                    {contract.tos && <Badge variant="secondary" className="text-xs">{contract.tos}</Badge>}
                  </td>
                  <td className={`${tdBase} text-right font-medium`}>
                    {contract.voms_under_contract || '-'}
                  </td>
                  
                  <td className={`${tdBase} text-right font-medium border-l`}>
                    {formatCurrency(contract.total_modal_expenses)}
                  </td>
                  <td className={`${tdBase} text-right`}>
                    {formatCurrency(contract.direct_payment_agency_subsidy)}
                  </td>
                  <td className={`${tdBase} text-right`}>
                    {contract.total_modal_expenses && contract.voms_under_contract
                      ? formatCurrency(contract.total_modal_expenses / contract.voms_under_contract)
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>
    </TooltipProvider>
  );
};
