import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProcurementFinder, ProcurementResult } from "@/hooks/useProcurementFinder";
import { 
  Search, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Building2,
  FileText,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProcurementFinderProps {
  agencyId: string;
  agencyName: string;
  currentProcurementUrl?: string | null;
}

const SOURCE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  bidnet: { label: "BidNet", color: "bg-blue-500" },
  public_purchase: { label: "PublicPurchase", color: "bg-green-500" },
  govwin: { label: "GovWin", color: "bg-purple-500" },
  bid_express: { label: "BidExpress", color: "bg-orange-500" },
  bonfire: { label: "Bonfire", color: "bg-red-500" },
  ionwave: { label: "IonWave", color: "bg-cyan-500" },
  procurenow: { label: "ProcureNow", color: "bg-indigo-500" },
  negometrix: { label: "Negometrix", color: "bg-pink-500" },
  periscope: { label: "Periscope", color: "bg-teal-500" },
  government: { label: "Government", color: "bg-emerald-500" },
  city_website: { label: "City Site", color: "bg-amber-500" },
  other: { label: "Other", color: "bg-gray-500" },
  unknown: { label: "Unknown", color: "bg-gray-400" },
};

export const ProcurementFinder = ({ 
  agencyId, 
  agencyName,
  currentProcurementUrl 
}: ProcurementFinderProps) => {
  const [results, setResults] = useState<ProcurementResult[]>([]);
  const [queriesUsed, setQueriesUsed] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [confirmedUrl, setConfirmedUrl] = useState<string | null>(currentProcurementUrl || null);
  const [savingUrl, setSavingUrl] = useState<string | null>(null);

  const { mutate: search, isPending } = useProcurementFinder();

  const handleSearch = () => {
    search(agencyId, {
      onSuccess: (data) => {
        setResults(data.results);
        setQueriesUsed(data.queriesUsed);
        setHasSearched(true);
        if (data.results.length === 0) {
          toast.info("No procurement pages found for this agency");
        } else {
          toast.success(`Found ${data.results.length} potential procurement pages`);
        }
      }
    });
  };

  const handleConfirm = async (result: ProcurementResult) => {
    setSavingUrl(result.url);
    try {
      // Update the agency with the confirmed procurement URL
      const { error } = await supabase
        .from('transit_agencies')
        .update({ 
          notes: `Procurement URL: ${result.url}\nSource: ${result.sourceType}\nConfirmed: ${new Date().toISOString()}`
        })
        .eq('id', agencyId);

      if (error) throw error;

      setConfirmedUrl(result.url);
      toast.success("Procurement URL confirmed and saved");
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setSavingUrl(null);
    }
  };

  const handleReject = (result: ProcurementResult) => {
    // Remove from results list
    setResults(prev => prev.filter(r => r.url !== result.url));
    toast.info("Result dismissed");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Procurement Page Finder
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isPending}
            size="sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Find Procurement Page
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current confirmed URL */}
        {confirmedUrl && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium text-sm">Confirmed Procurement Page</span>
            </div>
            <a 
              href={confirmedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {confirmedUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Search queries used */}
        {hasSearched && queriesUsed.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Queries used:</p>
            <div className="space-y-1">
              {queriesUsed.map((q, i) => (
                <code key={i} className="text-xs block text-muted-foreground">
                  {q}
                </code>
              ))}
            </div>
          </div>
        )}

        {/* No results state */}
        {hasSearched && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No procurement pages found.</p>
            <p className="text-sm">Try searching manually or check the agency website directly.</p>
          </div>
        )}

        {/* Results list */}
        {results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Found {results.length} potential procurement pages. Review and confirm the correct one:
            </p>
            
            {results.map((result, index) => {
              const sourceInfo = SOURCE_TYPE_LABELS[result.sourceType] || SOURCE_TYPE_LABELS.unknown;
              const isConfirmed = confirmedUrl === result.url;
              const isSaving = savingUrl === result.url;

              return (
                <div 
                  key={result.url}
                  className={`p-4 rounded-lg border transition-colors ${
                    isConfirmed 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-card hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className={`${sourceInfo.color} text-white text-xs`}
                        >
                          {sourceInfo.label}
                        </Badge>
                        {result.hasPathIndicator && (
                          <Badge variant="outline" className="text-xs">
                            URL matches
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Score: {result.adjustedScore.toFixed(2)}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-sm mb-1 truncate">
                        {result.title || 'Untitled'}
                      </h4>
                      
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
                      >
                        {result.url.length > 80 ? result.url.substring(0, 80) + '...' : result.url}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>

                      {result.snippet && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.snippet}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isConfirmed ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Confirmed
                        </Badge>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirm(result)}
                            disabled={isSaving}
                            className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(result)}
                            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Initial state */}
        {!hasSearched && !confirmedUrl && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Click "Find Procurement Page" to search for {agencyName}'s procurement portal.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
