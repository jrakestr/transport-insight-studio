import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractRecord {
  agency_id: string;
  provider_id?: string | null;
  provider_name: string | null;
  ntd_id: string | null;
  agency_name: string | null;
  reporter_type: string | null;
  reporting_module: string | null;
  mode: string | null;
  tos: string | null;
  contractee_ntd_id: string | null;
  contractee_operator_name: string | null;
  reporter_contractual_position: string | null;
  type_of_contract: string | null;
  primary_feature: string | null;
  buyer_supplies_vehicles_to_seller: boolean | null;
  buyer_provides_maintenance_facility_to_seller: boolean | null;
  other_public_assets_provided: string | null;
  other_public_assets_provided_desc: string | null;
  service_captured: string | null;
  other_party: string | null;
  fares_retained_by: string | null;
  fare_revenues_earned: number | null;
  total_operating_expenses: number | null;
  unlinked_passenger_trips: number | null;
  passenger_miles: number | null;
  vehicle_revenue_hours: number | null;
  vehicle_revenue_miles: number | null;
  voms_under_contract: number | null;
  months_seller_operated_in_fy: number | null;
  pt_fare_revenues_passenger_fees: number | null;
  passenger_out_of_pocket_expenses: number | null;
  direct_payment_agency_subsidy: number | null;
  contract_capital_leasing_expenses: number | null;
  other_operating_expenses_incurred_by_the_buyer: number | null;
  total_modal_expenses: number | null;
  other_reconciling_item_expenses_incurred_by_the_buyer: number | null;
  cost_per_passenger: number | null;
  cost_per_passenger_mile: number | null;
  passengers_per_hour: number | null;
  cost_per_hour: number | null;
}

function parseCSVLine(line: string): string[] {
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
}

function parseNumber(value: string | undefined, isInteger: boolean = false): number | null {
  if (!value || value === '' || value === 'null') return null;
  const cleaned = value.replace(/[,$]/g, '');
  const num = isInteger ? parseInt(cleaned, 10) : parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseBoolean(value: string | undefined): boolean | null {
  if (!value || value === '' || value === 'null') return null;
  const lower = value.toLowerCase().trim();
  if (lower === 'yes' || lower === 'true' || lower === '1') return true;
  if (lower === 'no' || lower === 'false' || lower === '0') return false;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting transportation providers import...');

    // Get CSV content from request body
    const { csvContent } = await req.json();
    
    if (!csvContent) {
      throw new Error('No CSV content provided');
    }
    
    console.log('Processing CSV content...');
    const csvText = csvContent;
    const lines = csvText.split('\n').filter((line: string) => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
    console.log('CSV headers:', headers);

    let processedCount = 0;
    let insertedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Process in batches of 50
    const batchSize = 50;
    
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, Math.min(i + batchSize, lines.length));
      const records: ContractRecord[] = [];

      for (const line of batch) {
        try {
          const values = parseCSVLine(line);
          const row: Record<string, string> = {};
          
          headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });

          // Look up agency_id from ntd_id
          const ntdId = row.ntd_id?.trim();
          if (!ntdId) {
            skippedCount++;
            continue;
          }

          const { data: agency } = await supabaseClient
            .from('transit_agencies')
            .select('id')
            .eq('ntd_id', ntdId)
            .maybeSingle();

          if (!agency) {
            skippedCount++;
            errors.push(`Agency not found for NTD ID: ${ntdId}`);
            continue;
          }

          const record: ContractRecord = {
            agency_id: agency.id,
            provider_name: row.transportation_provider || null,
            ntd_id: ntdId,
            agency_name: row.agency || null,
            reporter_type: row.reporter_type || null,
            reporting_module: row.reporting_module || null,
            mode: row.mode || null,
            tos: row.tos || null,
            contractee_ntd_id: row.contractee_ntd_id || null,
            contractee_operator_name: row.contractee_operator_name || null,
            reporter_contractual_position: row.reporter_contractual_position || null,
            type_of_contract: row.type_of_contract || null,
            primary_feature: row.primary_feature || null,
            buyer_supplies_vehicles_to_seller: parseBoolean(row.buyer_supplies_vehicles_to_seller),
            buyer_provides_maintenance_facility_to_seller: parseBoolean(row.buyer_provides_maintenance_facility_to_seller),
            other_public_assets_provided: row.other_public_assets_provided || null,
            other_public_assets_provided_desc: row.other_public_assets_provided_desc || null,
            service_captured: row.service_captured || null,
            other_party: row.other_party || null,
            fares_retained_by: row.fares_retained_by || null,
            fare_revenues_earned: parseNumber(row.fare_revenues_earned),
            total_operating_expenses: parseNumber(row.total_operating_expenses),
            unlinked_passenger_trips: parseNumber(row.unlinked_passenger_trips, true),
            passenger_miles: parseNumber(row.passenger_miles),
            vehicle_revenue_hours: parseNumber(row.vehicle_revenue_hours),
            vehicle_revenue_miles: parseNumber(row.vehicle_revenue_miles),
            voms_under_contract: parseNumber(row.voms_under_contract, true),
            months_seller_operated_in_fy: parseNumber(row.months_seller_operated_in_fy, true),
            pt_fare_revenues_passenger_fees: parseNumber(row.pt_fare_revenues_passenger_fees),
            passenger_out_of_pocket_expenses: parseNumber(row.passenger_out_of_pocket_expenses),
            direct_payment_agency_subsidy: parseNumber(row.direct_payment_agency_subsidy),
            contract_capital_leasing_expenses: parseNumber(row.contract_capital_leasing_expenses),
            other_operating_expenses_incurred_by_the_buyer: parseNumber(row.other_operating_expenses_incurred_by_the_buyer),
            total_modal_expenses: parseNumber(row.total_modal_expenses),
            other_reconciling_item_expenses_incurred_by_the_buyer: parseNumber(row.other_reconciling_item_expenses_incurred_by_the_buyer),
            cost_per_passenger: parseNumber(row.cost_per_passenger),
            cost_per_passenger_mile: parseNumber(row.cost_per_passenger_mile),
            passengers_per_hour: parseNumber(row.passengers_per_hour),
            cost_per_hour: parseNumber(row.cost_per_hour),
          };

          records.push(record);
          processedCount++;
        } catch (err) {
          console.error('Error processing row:', err);
          const errorMsg = err instanceof Error ? err.message : String(err);
          errors.push(`Row ${i}: ${errorMsg}`);
        }
      }

      // Batch insert with better error handling
      if (records.length > 0) {
        const { error: insertError } = await supabaseClient
          .from('transportation_providers')
          .insert(records);

        if (insertError) {
          console.error(`Batch ${Math.floor(i/batchSize)} insert error:`, insertError);
          errors.push(`Batch ${Math.floor(i/batchSize)}: ${insertError.message}`);
          // Continue processing other batches
        } else {
          insertedCount += records.length;
          console.log(`Batch ${Math.floor(i/batchSize)} completed: ${records.length} records inserted`);
        }
      }

      console.log(`Progress: ${i}/${lines.length - 1} lines processed`);
    }

    const result = {
      success: true,
      stats: {
        total_lines: lines.length - 1,
        processed: processedCount,
        inserted: insertedCount,
        skipped: skippedCount,
        errors: errors.slice(0, 10), // Return first 10 errors
      },
    };

    console.log('Import completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Import error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
