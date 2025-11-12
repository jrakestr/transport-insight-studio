import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MetricsImport() {
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setProgress({ current: 0, total: 0 });

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = parseCSVLine(lines[0]);
      
      setProgress({ current: 0, total: lines.length - 1 });

      // Process in batches
      const batchSize = 100;
      for (let i = 1; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, Math.min(i + batchSize, lines.length));
        
        const contractorRecords = [];

        for (const line of batch) {
          const values = parseCSVLine(line);
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Parse ALL CSV columns into contract record
          const contractRecord: any = {
            // Will be set after lookup
            agency_id: null,
            provider_name: row.contractee_operator_name || null,
            agency_name: row.agency || null,
            city: row.city || null,
            state: row.state || null,
            ntd_id: row.ntd_id || null,
            organization_type: row.organization_type || null,
            reporter_type: row.reporter_type || null,
            report_year: row.report_year ? parseInt(row.report_year) : null,
            uace_code: row.uace_code || null,
            uza_name: row.uza_name || null,
            primary_uza_population: row.primary_uza_population ? parseInt(row.primary_uza_population) : null,
            agency_voms: row.agency_voms ? parseInt(row.agency_voms) : null,
            mode: row.mode || null,
            mode_name: row.mode_name || null,
            type_of_service: row.type_of_service || null,
            mode_voms: row.mode_voms ? parseInt(row.mode_voms) : null,
            fare_revenues_per_unlinked: row.fare_revenues_per_unlinked ? parseFloat(row.fare_revenues_per_unlinked) : null,
            fare_revenues_per_unlinked_1: row.fare_revenues_per_unlinked_1 ? parseFloat(row.fare_revenues_per_unlinked_1) : null,
            fare_revenues_per_total: row.fare_revenues_per_total ? parseFloat(row.fare_revenues_per_total) : null,
            fare_revenues_per_total_1: row.fare_revenues_per_total_1 ? parseFloat(row.fare_revenues_per_total_1) : null,
            cost_per_hour: row.cost_per_hour ? parseFloat(row.cost_per_hour) : null,
            cost_per_hour_questionable: row.cost_per_hour_questionable || null,
            passengers_per_hour: row.passengers_per_hour ? parseFloat(row.passengers_per_hour) : null,
            passengers_per_hour_1: row.passengers_per_hour_1 ? parseFloat(row.passengers_per_hour_1) : null,
            cost_per_passenger: row.cost_per_passenger ? parseFloat(row.cost_per_passenger) : null,
            cost_per_passenger_1: row.cost_per_passenger_1 ? parseFloat(row.cost_per_passenger_1) : null,
            cost_per_passenger_mile: row.cost_per_passenger_mile ? parseFloat(row.cost_per_passenger_mile) : null,
            cost_per_passenger_mile_1: row.cost_per_passenger_mile_1 ? parseFloat(row.cost_per_passenger_mile_1) : null,
            fare_revenues_earned: row.fare_revenues_earned ? parseFloat(row.fare_revenues_earned) : null,
            fare_revenues_earned_1: row.fare_revenues_earned_1 ? parseFloat(row.fare_revenues_earned_1) : null,
            total_operating_expenses: row.total_operating_expenses ? parseFloat(row.total_operating_expenses) : null,
            total_operating_expenses_1: row.total_operating_expenses_1 ? parseFloat(row.total_operating_expenses_1) : null,
            unlinked_passenger_trips: row.unlinked_passenger_trips ? parseInt(row.unlinked_passenger_trips) : null,
            unlinked_passenger_trips_1: row.unlinked_passenger_trips_1 ? parseInt(row.unlinked_passenger_trips_1) : null,
            vehicle_revenue_hours: row.vehicle_revenue_hours ? parseFloat(row.vehicle_revenue_hours) : null,
            vehicle_revenue_hours_1: row.vehicle_revenue_hours_1 ? parseFloat(row.vehicle_revenue_hours_1) : null,
            passenger_miles: row.passenger_miles ? parseFloat(row.passenger_miles) : null,
            passenger_miles_questionable: row.passenger_miles_questionable || null,
            vehicle_revenue_miles: row.vehicle_revenue_miles ? parseFloat(row.vehicle_revenue_miles) : null,
            vehicle_revenue_miles_1: row.vehicle_revenue_miles_1 ? parseFloat(row.vehicle_revenue_miles_1) : null,
            ntd_id_contract: row.ntd_id_contract || null,
            reporter_type_contract: row.reporter_type_contract || null,
            reporting_module: row.reporting_module || null,
            mode_contract: row.mode_contract || null,
            tos: row.tos || null,
            contractee_ntd_id: row.contractee_ntd_id || null,
            
            reporter_contractual_position: row.reporter_contractual_position || null,
            type_of_contract: row.type_of_contract || null,
            primary_feature: row.primary_feature || null,
            buyer_supplies_vehicles_to_seller: row.buyer_supplies_vehicles_to_seller || null,
            buyer_provides_maintenance_facility_to_seller: row.buyer_provides_maintenance_facility_to_seller || null,
            other_public_assets_provided: row.other_public_assets_provided || null,
            other_public_assets_provided_desc: row.other_public_assets_provided_desc || null,
            service_captured: row.service_captured || null,
            other_party: row.other_party || null,
            fares_retained_by: row.fares_retained_by || null,
            voms_under_contract: row.voms_under_contract ? parseInt(row.voms_under_contract) : null,
            months_seller_operated_in_fy: row.months_seller_operated_in_fy ? parseInt(row.months_seller_operated_in_fy) : null,
            pt_fare_revenues_passenger_fees: row.pt_fare_revenues_passenger_fees ? parseFloat(row.pt_fare_revenues_passenger_fees) : null,
            passenger_out_of_pocket_expenses: row.passenger_out_of_pocket_expenses ? parseFloat(row.passenger_out_of_pocket_expenses) : null,
            direct_payment_agency_subsidy: row.direct_payment_agency_subsidy ? parseFloat(row.direct_payment_agency_subsidy) : null,
            contract_capital_leasing_expenses: row.contract_capital_leasing_expenses ? parseFloat(row.contract_capital_leasing_expenses) : null,
            other_operating_expenses_incurred_by_the_buyer: row.other_operating_expenses_incurred_by_the_buyer ? parseFloat(row.other_operating_expenses_incurred_by_the_buyer) : null,
            total_modal_expenses: row.total_modal_expenses ? parseFloat(row.total_modal_expenses) : null,
            other_reconciling_item_expenses_incurred_by_the_buyer: row.other_reconciling_item_expenses_incurred_by_the_buyer ? parseFloat(row.other_reconciling_item_expenses_incurred_by_the_buyer) : null,
            contractee_agency_id: row.contractee_agency_id || null,
          };

          // Lookup agency_id from transit_agencies by ntd_id
          if (contractRecord.ntd_id) {
            const { data: agency } = await supabase
              .from('transit_agencies')
              .select('id')
              .eq('ntd_id', contractRecord.ntd_id)
              .single();
            
            if (agency) {
              contractRecord.agency_id = agency.id;
              
              // Create or find provider in transportation_providers table
              if (contractRecord.provider_name) {
                // Try to find existing provider
                const { data: existingProvider } = await supabase
                  .from('transportation_providers')
                  .select('id')
                  .eq('name', contractRecord.provider_name)
                  .single();
                
                if (existingProvider) {
                  contractRecord.provider_id = existingProvider.id;
                } else {
                  // Create new provider
                  const { data: newProvider } = await supabase
                    .from('transportation_providers')
                    .insert({ name: contractRecord.provider_name })
                    .select('id')
                    .single();
                  
                  if (newProvider) {
                    contractRecord.provider_id = newProvider.id;
                  }
                }
              }
              
              contractorRecords.push(contractRecord);
            }
          }
        }

        // Insert into agency_contractors table
        if (contractorRecords.length > 0) {
          const { error } = await supabase
            .from('agency_contractors')
            .insert(contractorRecords);
          
          if (error) {
            console.error('Import error:', error);
          }
        }

        setProgress({ current: Math.min(i + batchSize, lines.length - 1), total: lines.length - 1 });
      }

      toast.success(`Successfully imported contract records to agency_contractors table`);
      navigate('/admin/agencies');
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import data');
    } finally {
      setImporting(false);
      setProgress(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate('/admin/agencies')}>
          Back to Agencies
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Import Agency Contract Metrics</h2>
            <p className="text-muted-foreground">
              Upload CSV file with all 68 columns. Data will be imported into the agency_contractors table.
              Each row represents a unique agency-provider-mode contract with performance metrics.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="file">CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                disabled={importing}
              />
            </div>

            {progress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing records...</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {importing && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Importing data...</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Expected CSV Format
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All 68 CSV columns will be imported into agency_contractors: agency info, mode details, 
              contract information, performance metrics (fare revenues, operating expenses, passenger counts, etc.), 
              and provider information (contractee_operator_name → provider_name). Each row creates a contract record linking 
              an agency to a provider with specific service and performance data. The agency_id is looked up from transit_agencies using the ntd_id column.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
