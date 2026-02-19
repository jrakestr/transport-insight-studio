import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProcurementOpportunities } from "@/hooks/useProcurement";
import { 
  ArrowRight, 
  Loader2, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign,
  ExternalLink,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { useState, useMemo } from "react";

const getTypeColor = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case 'rfp': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'rfq': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'bid': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    case 'contract_award': return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'solicitation': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getConfidenceColor = (score: number | null) => {
  if (!score) return 'text-muted-foreground';
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
};

const Procurement = () => {
  const { data: opportunities, isLoading } = useProcurementOpportunities();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    return opportunities.filter(opp => {
      const matchesSearch = !searchQuery || 
        opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.transit_agencies?.agency_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !typeFilter || opp.opportunity_type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [opportunities, searchQuery, typeFilter]);

  const opportunityTypes = useMemo(() => {
    if (!opportunities) return [];
    const types = new Set(opportunities.map(o => o.opportunity_type).filter(Boolean));
    return Array.from(types);
  }, [opportunities]);

  const stats = useMemo(() => {
    if (!opportunities) return { total: 0, active: 0, verified: 0, avgConfidence: 0 };
    const active = opportunities.filter(o => o.status === 'active' && (!o.deadline || !isPast(new Date(o.deadline)))).length;
    const verified = opportunities.filter(o => o.is_verified).length;
    const avgConfidence = opportunities.length > 0 
      ? opportunities.reduce((sum, o) => sum + (o.confidence_score || 0), 0) / opportunities.length 
      : 0;
    return { total: opportunities.length, active, verified, avgConfidence };
  }, [opportunities]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="section-container relative py-16 lg:py-24">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">
                AI-Powered Discovery
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Procurement <span className="text-primary">Intelligence</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Automatically discovered RFPs, bids, and procurement opportunities from transit agency websites. Updated daily.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Found</div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">{stats.verified}</div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-3xl font-bold">{(stats.avgConfidence * 100).toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Avg Confidence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b py-4">
          <div className="section-container">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={typeFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(null)}
                >
                  All
                </Button>
                {opportunityTypes.map(type => (
                  <Button
                    key={type}
                    variant={typeFilter === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter(type)}
                  >
                    {type?.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Opportunities Feed */}
        <section className="py-8 lg:py-12">
          <div className="section-container">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredOpportunities.length > 0 ? (
                  filteredOpportunities.map((opportunity) => {
                    const isExpired = opportunity.deadline && isPast(new Date(opportunity.deadline));
                    
                    return (
                      <Card 
                        key={opportunity.id} 
                        className={`border hover:border-primary transition-colors ${isExpired ? 'opacity-60' : ''}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-4">
                            {/* Header Row */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  {opportunity.opportunity_type && (
                                    <Badge className={getTypeColor(opportunity.opportunity_type)}>
                                      {opportunity.opportunity_type.toUpperCase()}
                                    </Badge>
                                  )}
                                  {opportunity.is_verified && (
                                    <Badge variant="outline" className="text-green-600 border-green-500/20">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                  {isExpired && (
                                    <Badge variant="destructive">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Expired
                                    </Badge>
                                  )}
                                  <span className={`text-xs ${getConfidenceColor(opportunity.confidence_score)}`}>
                                    {((opportunity.confidence_score || 0) * 100).toFixed(0)}% confidence
                                  </span>
                                </div>
                                <h3 className="text-xl font-semibold">
                                  {opportunity.title}
                                </h3>
                              </div>
                              
                              {opportunity.source_url && (
                                <a 
                                  href={opportunity.source_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="outline" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </a>
                              )}
                            </div>

                            {/* Metadata Row */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {opportunity.transit_agencies && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <Link 
                                    to={`/agencies/${opportunity.agency_id}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {opportunity.transit_agencies.agency_name}
                                  </Link>
                                </div>
                              )}
                              {opportunity.transit_agencies?.city && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>
                                    {[opportunity.transit_agencies.city, opportunity.transit_agencies.state].filter(Boolean).join(", ")}
                                  </span>
                                </div>
                              )}
                              {opportunity.deadline && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span className={isExpired ? 'text-red-500' : ''}>
                                    {isExpired ? 'Expired ' : 'Due '}
                                    {formatDistanceToNow(new Date(opportunity.deadline), { addSuffix: true })}
                                  </span>
                                </div>
                              )}
                              {opportunity.estimated_value && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>${opportunity.estimated_value.toLocaleString()}</span>
                                </div>
                              )}
                              {opportunity.created_at && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>Found {format(new Date(opportunity.created_at), 'MMM d, yyyy')}</span>
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {opportunity.description && (
                              <p className="text-muted-foreground line-clamp-2">
                                {opportunity.description}
                              </p>
                            )}

                            {/* Source */}
                            <div className="text-xs text-muted-foreground">
                              Source: {opportunity.source_type || 'Agency Website'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No procurement opportunities found.</p>
                    <p className="text-sm mt-2">Try adjusting your search or filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Procurement;
