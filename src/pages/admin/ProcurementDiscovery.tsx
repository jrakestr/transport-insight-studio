import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Loader2, Search, Play, ExternalLink, 
  CheckCircle, XCircle, Clock, AlertCircle, FileText 
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  useProcurementOpportunities,
  useAgenciesProcurementStatus,
  useRecentSearchRuns,
  useTriggerProcurementSearch,
} from "@/hooks/useProcurement";

const ProcurementDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: opportunities, isLoading: loadingOpps } = useProcurementOpportunities();
  const { data: agencyStatuses, isLoading: loadingStatuses } = useAgenciesProcurementStatus();
  const { data: searchRuns, isLoading: loadingRuns } = useRecentSearchRuns();
  const triggerSearch = useTriggerProcurementSearch();

  const handleBatchSearch = () => {
    triggerSearch.mutate({ mode: 'batch' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'running': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'failed': return 'bg-red-500/20 text-red-700 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getConfidenceColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredOpportunities = opportunities?.filter(opp => 
    !searchQuery || 
    opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opp as any).transit_agencies?.agency_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalOpportunities: opportunities?.length || 0,
    verifiedOpportunities: opportunities?.filter(o => o.is_verified)?.length || 0,
    activeRFPs: opportunities?.filter(o => 
      o.opportunity_type === 'rfp' && 
      (!o.deadline || new Date(o.deadline) > new Date())
    )?.length || 0,
    agenciesSearched: agencyStatuses?.length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Procurement Discovery</h1>
        <p className="text-muted-foreground">Agentic search for procurement opportunities</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">Total Opportunities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.verifiedOpportunities}</div>
            <p className="text-xs text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.activeRFPs}</div>
            <p className="text-xs text-muted-foreground">Active RFPs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.agenciesSearched}</div>
            <p className="text-xs text-muted-foreground">Agencies Searched</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={handleBatchSearch} 
          disabled={triggerSearch.isPending}
        >
          {triggerSearch.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run Batch Search
        </Button>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="agencies">Agency Status</TabsTrigger>
          <TabsTrigger value="runs">Search Runs</TabsTrigger>
        </TabsList>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Discovered Opportunities</CardTitle>
              <CardDescription>
                Procurement opportunities found across all agencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOpps ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredOpportunities && filteredOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {filteredOpportunities.map((opp: any) => (
                    <div 
                      key={opp.id} 
                      className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">
                              {opp.opportunity_type || 'Unknown'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {opp.source_type}
                            </Badge>
                            {opp.is_verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <h4 className="font-medium">{opp.title}</h4>
                          {opp.transit_agencies && (
                            <Link 
                              to={`/agencies/${opp.transit_agencies.id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {opp.transit_agencies.agency_name}
                            </Link>
                          )}
                          {opp.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {opp.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {opp.deadline && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(opp.deadline), 'MMM d, yyyy')}
                              </span>
                            )}
                            <span className={getConfidenceColor(opp.confidence_score)}>
                              {Math.round((opp.confidence_score || 0) * 100)}% confidence
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={opp.source_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No opportunities found. Run a batch search to discover opportunities.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agency Status Tab */}
        <TabsContent value="agencies">
          <Card>
            <CardHeader>
              <CardTitle>Agency Procurement Status</CardTitle>
              <CardDescription>
                Overview of procurement search status by agency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStatuses ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : agencyStatuses && agencyStatuses.length > 0 ? (
                <div className="space-y-3">
                  {agencyStatuses.map((status: any) => (
                    <div 
                      key={status.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <Link 
                          to={`/agencies/${status.transit_agencies?.id}`}
                          className="font-medium hover:underline"
                        >
                          {status.transit_agencies?.agency_name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {status.transit_agencies?.city}, {status.transit_agencies?.state}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{status.total_opportunities_found || 0}</div>
                          <div className="text-xs text-muted-foreground">Found</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-medium ${getConfidenceColor(status.overall_confidence)}`}>
                            {status.overall_confidence ? `${Math.round(status.overall_confidence * 100)}%` : '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">Confidence</div>
                        </div>
                        <div className="text-center">
                          {status.has_active_rfps ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                          <div className="text-xs text-muted-foreground">Active RFPs</div>
                        </div>
                        <div className="text-xs text-muted-foreground w-24 text-right">
                          {status.last_search_at 
                            ? format(new Date(status.last_search_at), 'MMM d, h:mm a')
                            : 'Never'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No agencies have been searched yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Runs Tab */}
        <TabsContent value="runs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Search Runs</CardTitle>
              <CardDescription>
                History of procurement discovery searches
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRuns ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : searchRuns && searchRuns.length > 0 ? (
                <div className="space-y-3">
                  {searchRuns.map((run: any) => (
                    <div 
                      key={run.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(run.status)}>
                          {run.status}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {run.transit_agencies?.agency_name || 'Unknown Agency'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(run.created_at), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{run.opportunities_found || 0}</div>
                          <div className="text-xs text-muted-foreground">Found</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-medium ${getConfidenceColor(run.confidence_score)}`}>
                            {run.confidence_score ? `${Math.round(run.confidence_score * 100)}%` : '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">Confidence</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{(run.phases_completed as any[])?.length || 0}/3</div>
                          <div className="text-xs text-muted-foreground">Phases</div>
                        </div>
                        {run.error_message && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent>{run.error_message}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No search runs yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProcurementDiscovery;
