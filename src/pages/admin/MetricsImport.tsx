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
        
        const metricsRecords = [];
        const contractorRecords = [];

        for (const line of batch) {
          const values = parseCSVLine(line);
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Parse metrics data
          const metricsRecord: any = {
            agency_id: row.agency_id || null,
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
            fare_revenues_per_unlinked: row.fare_revenues_per_unlinked_1 ? parseFloat(row.fare_revenues_per_unlinked_1) : null,
            fare_revenues_per_total: row.fare_revenues_per_total_1 ? parseFloat(row.fare_revenues_per_total_1) : null,
            cost_per_hour: row.cost_per_hour ? parseFloat(row.cost_per_hour) : null,
            cost_per_hour_questionable: row.cost_per_hour_questionable === 'true',
            passengers_per_hour: row.passengers_per_hour_1 ? parseFloat(row.passengers_per_hour_1) : null,
            cost_per_passenger: row.cost_per_passenger_1 ? parseFloat(row.cost_per_passenger_1) : null,
            cost_per_passenger_mile: row.cost_per_passenger_mile_1 ? parseFloat(row.cost_per_passenger_mile_1) : null,
            fare_revenues_earned: row.fare_revenues_earned_1 ? parseFloat(row.fare_revenues_earned_1) : null,
            total_operating_expenses: row.total_operating_expenses_1 ? parseFloat(row.total_operating_expenses_1) : null,
            unlinked_passenger_trips: row.unlinked_passenger_trips_1 ? parseInt(row.unlinked_passenger_trips_1) : null,
            vehicle_revenue_hours: row.vehicle_revenue_hours_1 ? parseFloat(row.vehicle_revenue_hours_1) : null,
            passenger_miles: row.passenger_miles ? parseFloat(row.passenger_miles) : null,
            passenger_miles_questionable: row.passenger_miles_questionable === 'true',
            vehicle_revenue_miles: row.vehicle_revenue_miles_1 ? parseFloat(row.vehicle_revenue_miles_1) : null,
          };

          if (metricsRecord.agency_id) {
            metricsRecords.push(metricsRecord);
          }

          // Parse contractor data if present
          if (row.ntd_id_contract && row.agency_id) {
            const contractorRecord: any = {
              agency_id: row.agency_id,
              ntd_id: row.ntd_id_contract || null,
              agency_name: row.agency_name || null,
              reporter_type: row.reporter_type_contract || null,
              reporting_module: row.reporting_module || null,
              mode: row.mode_contract || null,
              tos: row.tos || null,
              contractee_ntd_id: row.contractee_ntd_id || null,
              contractee_operator_name: row.contractee_operator_name || null,
              reporter_contractual_position: row.reporter_contractual_position || null,
              type_of_contract: row.type_of_contract || null,
              primary_feature: row.primary_feature || null,
              buyer_supplies_vehicles_to_seller: row.buyer_supplies_vehicles_to_seller === 'Y',
              buyer_provides_maintenance_facility_to_seller: row.buyer_provides_maintenance_facility_to_seller === 'Y',
              other_public_assets_provided: row.other_public_assets_provided === 'Y',
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

            contractorRecords.push(contractorRecord);
          }
        }

        // Insert metrics
        if (metricsRecords.length > 0) {
          const { error: metricsError } = await supabase
            .from('agency_performance_metrics')
            .insert(metricsRecords);
          
          if (metricsError) {
            console.error('Metrics insert error:', metricsError);
          }
        }

        // Insert contractors
        if (contractorRecords.length > 0) {
          const { error: contractorError } = await supabase
            .from('agency_contractors')
            .insert(contractorRecords);
          
          if (contractorError) {
            console.error('Contractor insert error:', contractorError);
          }
        }

        setProgress({ current: Math.min(i + batchSize, lines.length - 1), total: lines.length - 1 });
      }

      toast.success(`Successfully imported ${lines.length - 1} records`);
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
            <h2 className="text-2xl font-bold mb-2">Import Metrics & Contracts Data</h2>
            <p className="text-muted-foreground">
              Upload a CSV file containing agency performance metrics and contractor relationships.
              The file should match the NTD metrics format with contract data.
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
            <p className="text-sm text-muted-foreground">
              The CSV should contain columns for agency information, performance metrics, and contract details.
              Required fields include agency_id, mode, and various performance indicators.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
