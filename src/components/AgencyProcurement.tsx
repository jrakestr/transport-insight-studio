import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ExternalLink, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { 
  useAgencyProcurementOpportunities, 
  useAgencyProcurementStatus,
  useAgencySearchRuns,
  useTriggerProcurementSearch,
  useVerifyOpportunity,
} from "@/hooks/useProcurement";

interface AgencyProcurementProps {
  agencyId: string;
  agencyName: string;
  agencyUrl?: string;
}

export const AgencyProcurement = ({ agencyId, agencyName, agencyUrl }: AgencyProcurementProps) => {
  const { data: opportunities, isLoading: loadingOpps } = useAgencyProcurementOpportunities(agencyId);
  const { data: status, isLoading: loadingStatus } = useAgencyProcurementStatus(agencyId);
  const { data: searchRuns } = useAgencySearchRuns(agencyId);
  const triggerSearch = useTriggerProcurementSearch();
  const verifyOpportunity = useVerifyOpportunity();

  const handleSearch = () => {
    triggerSearch.mutate({ agencyId, mode: 'single' });
  };

  const getOpportunityTypeColor = (type: string | null) => {
    switch (type) {
      case 'rfp': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'rfq': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
      case 'bid': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'contract_award': return 'bg-amber-500/20 text-amber-700 dark:text-amber-300';
      case 'portal': return 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getConfidenceColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Procurement Intelligence</CardTitle>
            <CardDescription>
              {status?.last_search_at 
                ? `Last searched: ${format(new Date(status.last_search_at), 'MMM d, yyyy h:mm a')}`
                : 'No searches yet'
              }
            </CardDescription>
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={triggerSearch.isPending || !agencyUrl}
            size="sm"
          >
            {triggerSearch.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Search Now
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{opportunities?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Opportunities</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getConfidenceColor(status?.overall_confidence || null)}`}>
                {status?.overall_confidence ? `${Math.round(status.overall_confidence * 100)}%` : '-'}
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {status?.has_active_rfps ? (
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                ) : (
                  <XCircle className="h-6 w-6 text-muted-foreground mx-auto" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">Active RFPs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{searchRuns?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Searches Run</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Progress (if running) */}
      {searchRuns?.some(run => run.status === 'running') && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <div className="font-medium">Search in progress...</div>
                <div className="text-sm text-muted-foreground">
                  Scanning agency website and procurement portals
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Procurement Opportunities</CardTitle>
          <CardDescription>
            Found opportunities from agency website and procurement portals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOpps ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : opportunities && opportunities.length > 0 ? (
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <div 
                  key={opp.id} 
                  className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getOpportunityTypeColor(opp.opportunity_type)}>
                          {opp.opportunity_type || 'Unknown'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {opp.source_type}
                        </Badge>
                        {opp.is_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <h4 className="font-medium truncate">{opp.title}</h4>
                      {opp.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {opp.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {opp.deadline && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Deadline: {format(new Date(opp.deadline), 'MMM d, yyyy')}
                          </span>
                        )}
                        {opp.estimated_value && (
                          <span>${opp.estimated_value.toLocaleString()}</span>
                        )}
                        <span className={getConfidenceColor(opp.confidence_score)}>
                          {Math.round((opp.confidence_score || 0) * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={opp.is_verified ? "secondary" : "outline"}
                        onClick={() => verifyOpportunity.mutate({ 
                          id: opp.id, 
                          verified: !opp.is_verified 
                        })}
                      >
                        {opp.is_verified ? 'Verified' : 'Verify'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                      >
                        <a href={opp.source_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No procurement opportunities found yet.</p>
              {agencyUrl && (
                <Button 
                  variant="link" 
                  onClick={handleSearch}
                  disabled={triggerSearch.isPending}
                >
                  Run a search to discover opportunities
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
