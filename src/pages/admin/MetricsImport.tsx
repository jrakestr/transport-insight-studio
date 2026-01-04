/**
 * MetricsImport Component
 * 
 * Purpose: Import agency contract metrics from CSV files into the transportation_providers table.
 * 
 * Data Flow:
 * 1. Parse CSV file with 68 columns containing contract and performance data
 * 2. For each row:
 *    a. Look up agency_id from transit_agencies using ntd_id
 *    b. Create or find service provider by name
 *    c. Build contract record with metrics and relationships
 * 3. Batch insert into transportation_providers table
 * 
 * Database Structure:
 * - agency_vendors: Directory of provider entities (id, name, type, location, website, notes)
 * - transportation_providers: Contract records with 68 metric columns + foreign keys (agency_id, provider_id)
 * - transit_agencies: Agency directory (used for ntd_id lookup)
 * 
 * Each row in the CSV represents a unique agency-provider-mode contract with performance metrics.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Type definitions for better code clarity
interface ImportProgress {
  current: number;
  total: number;
}

interface ContractRecord {
  agency_id: string | null;
  provider_id?: string;
  provider_name: string | null;
  ntd_id: string | null;
  // ... 68 metric columns (defined by CSV structure)
  [key: string]: any;
}

interface ImportStats {
  processed: number;
  inserted: number;
  skipped: number;
  errors: string[];
}

export default function MetricsImport() {
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  /**
   * Parse a single CSV line, handling quoted fields correctly
   * Handles commas within quotes by tracking quote state
   */
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

  /**
   * Parse numeric value safely, returning null if invalid
   */
  const parseNumber = (value: string | undefined, isInteger = false): number | null => {
    if (!value || value.trim() === '') return null;
    const parsed = isInteger ? parseInt(value) : parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  /**
   * Build contract record from CSV row data
   * Maps all 68 columns to database schema
   */
  const buildContractRecord = (row: Record<string, string>): Partial<ContractRecord> => {
    return {
      // Identifiers (will be populated via lookup)
      agency_id: null,
      provider_name: row.contractee_operator_name || null,
      
      // Agency information
      agency_name: row.agency || null,
      city: row.city || null,
      state: row.state || null,
      ntd_id: row.ntd_id || null,
      organization_type: row.organization_type || null,
      reporter_type: row.reporter_type || null,
      report_year: parseNumber(row.report_year, true),
      
      // Geographic information
      uace_code: row.uace_code || null,
      uza_name: row.uza_name || null,
      primary_uza_population: parseNumber(row.primary_uza_population, true),
      
      // Fleet information
      agency_voms: parseNumber(row.agency_voms, true),
      mode_voms: parseNumber(row.mode_voms, true),
      
      // Service information
      mode: row.mode || null,
      mode_name: row.mode_name || null,
      type_of_service: row.type_of_service || null,
      
      // Performance metrics - Fare revenues
      fare_revenues_per_unlinked: parseNumber(row.fare_revenues_per_unlinked),
      fare_revenues_per_unlinked_1: parseNumber(row.fare_revenues_per_unlinked_1),
      fare_revenues_per_total: parseNumber(row.fare_revenues_per_total),
      fare_revenues_per_total_1: parseNumber(row.fare_revenues_per_total_1),
      fare_revenues_earned: parseNumber(row.fare_revenues_earned),
      fare_revenues_earned_1: parseNumber(row.fare_revenues_earned_1),
      
      // Performance metrics - Cost efficiency
      cost_per_hour: parseNumber(row.cost_per_hour),
      cost_per_hour_questionable: row.cost_per_hour_questionable || null,
      cost_per_passenger: parseNumber(row.cost_per_passenger),
      cost_per_passenger_1: parseNumber(row.cost_per_passenger_1),
      cost_per_passenger_mile: parseNumber(row.cost_per_passenger_mile),
      cost_per_passenger_mile_1: parseNumber(row.cost_per_passenger_mile_1),
      
      // Performance metrics - Service delivery
      passengers_per_hour: parseNumber(row.passengers_per_hour),
      passengers_per_hour_1: parseNumber(row.passengers_per_hour_1),
      unlinked_passenger_trips: parseNumber(row.unlinked_passenger_trips, true),
      unlinked_passenger_trips_1: parseNumber(row.unlinked_passenger_trips_1, true),
      passenger_miles: parseNumber(row.passenger_miles),
      passenger_miles_questionable: row.passenger_miles_questionable || null,
      
      // Performance metrics - Operating data
      vehicle_revenue_hours: parseNumber(row.vehicle_revenue_hours),
      vehicle_revenue_hours_1: parseNumber(row.vehicle_revenue_hours_1),
      vehicle_revenue_miles: parseNumber(row.vehicle_revenue_miles),
      vehicle_revenue_miles_1: parseNumber(row.vehicle_revenue_miles_1),
      
      // Performance metrics - Operating expenses
      total_operating_expenses: parseNumber(row.total_operating_expenses),
      total_operating_expenses_1: parseNumber(row.total_operating_expenses_1),
      total_modal_expenses: parseNumber(row.total_modal_expenses),
      
      // Contract information
      ntd_id_contract: row.ntd_id_contract || null,
      reporter_type_contract: row.reporter_type_contract || null,
      reporting_module: row.reporting_module || null,
      mode_contract: row.mode_contract || null,
      tos: row.tos || null,
      contractee_ntd_id: row.contractee_ntd_id || null,
      reporter_contractual_position: row.reporter_contractual_position || null,
      type_of_contract: row.type_of_contract || null,
      primary_feature: row.primary_feature || null,
      
      // Contract details - Asset provision
      buyer_supplies_vehicles_to_seller: row.buyer_supplies_vehicles_to_seller || null,
      buyer_provides_maintenance_facility_to_seller: row.buyer_provides_maintenance_facility_to_seller || null,
      other_public_assets_provided: row.other_public_assets_provided || null,
      other_public_assets_provided_desc: row.other_public_assets_provided_desc || null,
      
      // Contract details - Financial
      service_captured: row.service_captured || null,
      other_party: row.other_party || null,
      fares_retained_by: row.fares_retained_by || null,
      voms_under_contract: parseNumber(row.voms_under_contract, true),
      months_seller_operated_in_fy: parseNumber(row.months_seller_operated_in_fy, true),
      pt_fare_revenues_passenger_fees: parseNumber(row.pt_fare_revenues_passenger_fees),
      passenger_out_of_pocket_expenses: parseNumber(row.passenger_out_of_pocket_expenses),
      direct_payment_agency_subsidy: parseNumber(row.direct_payment_agency_subsidy),
      contract_capital_leasing_expenses: parseNumber(row.contract_capital_leasing_expenses),
      other_operating_expenses_incurred_by_the_buyer: parseNumber(row.other_operating_expenses_incurred_by_the_buyer),
      other_reconciling_item_expenses_incurred_by_the_buyer: parseNumber(row.other_reconciling_item_expenses_incurred_by_the_buyer),
      contractee_agency_id: row.contractee_agency_id || null,
    };
  };

  /**
   * Find or create transportation provider
   * Returns provider_id if successful, null otherwise
   */
  const getOrCreateProvider = async (providerName: string): Promise<string | null> => {
    if (!providerName) return null;

    try {
      // Try to find existing provider
      const { data: existingProvider, error: findError } = await supabase
        .from('agency_vendors')
        .select('id')
        .eq('name', providerName)
        .maybeSingle();

      if (findError) {
        console.error('Error finding provider:', findError);
        return null;
      }

      if (existingProvider) {
        return existingProvider.id;
      }

      // Create new provider if not found
      const { data: newProvider, error: createError } = await supabase
        .from('agency_vendors')
        .insert({ name: providerName })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating provider:', createError);
        return null;
      }

      return newProvider?.id || null;
    } catch (error) {
      console.error('Exception in getOrCreateProvider:', error);
      return null;
    }
  };

  /**
   * Look up agency ID from transit_agencies table using ntd_id
   * Returns agency_id if found, null otherwise
   */
  const lookupAgencyId = async (ntdId: string): Promise<string | null> => {
    if (!ntdId) return null;

    try {
      const { data: agency, error } = await supabase
        .from('transit_agencies')
        .select('id')
        .eq('ntd_id', ntdId)
        .maybeSingle();

      if (error) {
        console.error(`Error looking up agency with ntd_id ${ntdId}:`, error);
        return null;
      }

      return agency?.id || null;
    } catch (error) {
      console.error('Exception in lookupAgencyId:', error);
      return null;
    }
  };

  /**
   * Main import handler
   * Processes CSV file in batches to prevent memory issues
   */
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a valid CSV file');
      return;
    }

    setImporting(true);
    setProgress({ current: 0, total: 0 });

    const stats: ImportStats = {
      processed: 0,
      inserted: 0,
      skipped: 0,
      errors: []
    };

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file appears to be empty or has no data rows');
      }

      const headers = parseCSVLine(lines[0]);
      const totalRows = lines.length - 1;
      
      setProgress({ current: 0, total: totalRows });

      // Process in batches to prevent memory issues and show progress
      const batchSize = 100;
      
      for (let i = 1; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, Math.min(i + batchSize, lines.length));
        const contractorRecords: ContractRecord[] = [];

        // Process each line in the batch
        for (const line of batch) {
          stats.processed++;
          
          try {
            const values = parseCSVLine(line);
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            const contractRecord = buildContractRecord(row) as ContractRecord;

            // Required field validation
            if (!contractRecord.ntd_id) {
              stats.skipped++;
              stats.errors.push(`Row ${stats.processed}: Missing ntd_id`);
              continue;
            }

            // Look up agency_id from transit_agencies
            const agencyId = await lookupAgencyId(contractRecord.ntd_id);
            if (!agencyId) {
              stats.skipped++;
              stats.errors.push(`Row ${stats.processed}: Agency not found for ntd_id ${contractRecord.ntd_id}`);
              continue;
            }

            contractRecord.agency_id = agencyId;

            // Get or create provider if provider name exists
            if (contractRecord.provider_name) {
              const providerId = await getOrCreateProvider(contractRecord.provider_name);
              if (providerId) {
                contractRecord.provider_id = providerId;
              }
            }

            contractorRecords.push(contractRecord);
          } catch (error: any) {
            stats.skipped++;
            stats.errors.push(`Row ${stats.processed}: ${error.message}`);
          }
        }

        // Batch insert into transportation_providers table
        if (contractorRecords.length > 0) {
          const { error, count } = await supabase
            .from('transportation_providers')
            .insert(contractorRecords);

          if (error) {
            console.error('Batch insert error:', error);
            stats.errors.push(`Batch insert failed: ${error.message}`);
          } else {
            stats.inserted += contractorRecords.length;
          }
        }

        setProgress({ 
          current: Math.min(i + batchSize - 1, totalRows), 
          total: totalRows 
        });
      }

      // Show detailed results
      const successMessage = `Import complete: ${stats.inserted} records inserted, ${stats.skipped} skipped`;
      
      if (stats.errors.length > 0) {
        console.warn('Import errors:', stats.errors);
        toast.warning(successMessage + `. Check console for ${stats.errors.length} errors.`);
      } else {
        toast.success(successMessage);
      }

      navigate('/admin/agencies');
    } catch (error: any) {
      console.error('Import failed:', error);
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
              Upload CSV file with contract and performance data. Each row represents a unique 
              agency-provider-mode contract with 68 metric columns.
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Prerequisites:</strong> Agencies must exist in transit_agencies table with valid ntd_id values.
              Provider records will be created automatically if they don't exist.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="file">CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                disabled={importing}
                className="cursor-pointer"
              />
            </div>

            {progress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing records...</span>
                  <span className="font-mono">{progress.current} / {progress.total}</span>
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
                <span>Importing and processing data...</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Data Structure
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Source:</strong> CSV with 68 columns containing agency info, mode details, 
                contract terms, and performance metrics.
              </p>
              <p>
                <strong>Processing:</strong> Each row is validated, agency_id is looked up via ntd_id, 
                provider records are created/found, then inserted into transportation_providers table.
              </p>
              <p>
                <strong>Result:</strong> Contract records with proper relationships to both 
                transit_agencies and agency_vendors tables.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
