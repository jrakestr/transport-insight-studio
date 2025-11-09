import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AgencyImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = parseCSVLine(lines[0]);
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = parseCSVLine(lines[i]);
      const record: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/^"|"$/g, ''); // Remove surrounding quotes
        record[header] = value === '' || value === undefined ? null : value;
      });
      
      records.push(record);
    }
    
    return records;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result.map(v => v.trim());
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setImporting(true);
    setProgress(0);
    setStats({ total: 0, success: 0, failed: 0 });

    try {
      const text = await file.text();
      const records = parseCSV(text);
      
      setStats(prev => ({ ...prev, total: records.length }));

      // Process in batches of 100
      const batchSize = 100;
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        
        const transformedBatch = batch.map(record => ({
          id: record.id || undefined,
          agency_name: record.agency_name,
          doing_business_as: record.doing_business_as,
          city: record.city,
          state: record.state,
          zip_code: record.zip_code,
          ntd_id: record.ntd_id,
          total_voms: record.total_voms ? parseInt(record.total_voms) : null,
          population: record.population ? parseInt(record.population) : null,
          density: record.density ? parseFloat(record.density) : null,
          sq_miles: record.sq_miles ? parseFloat(record.sq_miles) : null,
          url: record.url,
          address_line_1: record.address_line_1,
          address_line_2: record.address_line_2,
          zip_code_ext: record.zip_code_ext,
          state_parent_ntd_id: record.state_parent_ntd_id,
          legacy_ntd_id: record.legacy_ntd_id,
          division_department: record.division_department,
          reporter_acronym: record.reporter_acronym,
          doing_business_as_old: record.doing_business_as_old,
          reporter_type: record.reporter_type,
          reporting_module: record.reporting_module,
          organization_type: record.organization_type,
          reported_by_ntd_id: record.reported_by_ntd_id,
          reported_by_name: record.reported_by_name,
          subrecipient_type: record.subrecipient_type,
          fy_end_date: record.fy_end_date || null,
          original_due_date: record.original_due_date || null,
          region: record.region,
          fta_recipient_id: record.fta_recipient_id,
          ueid: record.ueid,
          service_area_sq_miles: record.service_area_sq_miles ? parseFloat(record.service_area_sq_miles) : null,
          service_area_pop: record.service_area_pop ? parseInt(record.service_area_pop) : null,
          primary_uza_uace_code: record.primary_uza_uace_code,
          uza_name: record.uza_name,
          voms_do: record.voms_do ? parseInt(record.voms_do) : null,
          voms_pt: record.voms_pt ? parseInt(record.voms_pt) : null,
          volunteer_drivers: record.volunteer_drivers ? parseInt(record.volunteer_drivers) : null,
          personal_vehicles: record.personal_vehicles ? parseInt(record.personal_vehicles) : null,
          tam_tier: record.tam_tier,
          notes: null,
        }));

        const { data, error } = await supabase
          .from('transit_agencies')
          .upsert(transformedBatch, { onConflict: 'id' });

        if (error) {
          console.error('Batch error:', error);
          failedCount += batch.length;
        } else {
          successCount += batch.length;
        }

        setStats({ total: records.length, success: successCount, failed: failedCount });
        setProgress(((i + batch.length) / records.length) * 100);
      }

      if (failedCount === 0) {
        toast.success(`Successfully imported ${successCount} agencies`);
      } else {
        toast.warning(`Imported ${successCount} agencies, ${failedCount} failed`);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Import Transit Agencies</h1>
        <Button variant="outline" onClick={() => navigate("/admin/agencies")}>
          Back to Agencies
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={importing}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Upload a CSV file with NTD agency information
            </p>
          </div>

          {importing && (
            <div className="space-y-4">
              <Progress value={progress} />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing agencies...</span>
                </div>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">{stats.success}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-semibold">{stats.failed}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex items-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Agencies
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
