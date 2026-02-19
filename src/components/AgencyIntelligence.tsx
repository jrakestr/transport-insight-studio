import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAgencyIntelligence, useScrapeAgencyWebsite, useDeleteAgencyIntelligence } from "@/hooks/useAgencyIntelligence";
import { useAuth } from "@/hooks/useAuth";
import { Brain, Loader2, Search, Users, FileText, Newspaper, UserCircle, Trash2, ExternalLink, RefreshCw } from "lucide-react";

interface AgencyIntelligenceProps {
  agencyId: string;
  agencyUrl?: string | null;
  agencyName: string;
}

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  contacts: { icon: Users, label: "Contacts", color: "bg-blue-500" },
  procurement: { icon: FileText, label: "Procurement", color: "bg-green-500" },
  news: { icon: Newspaper, label: "News", color: "bg-purple-500" },
  leadership: { icon: UserCircle, label: "Leadership", color: "bg-orange-500" },
};

export const AgencyIntelligence = ({ agencyId, agencyUrl, agencyName }: AgencyIntelligenceProps) => {
  const { data: intelligence, isLoading } = useAgencyIntelligence(agencyId);
  const scrapeWebsite = useScrapeAgencyWebsite();
  const deleteIntelligence = useDeleteAgencyIntelligence();
  const { isAdmin } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleScrape = () => {
    if (!agencyUrl) return;
    scrapeWebsite.mutate({ agencyId, agencyUrl, agencyName });
  };

  const groupedIntelligence = intelligence?.reduce((acc, item) => {
    const type = item.intelligence_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, typeof intelligence>);

  const types = Object.keys(groupedIntelligence || {});

  const actionButtons = isAdmin && agencyUrl ? (
    <Button 
      size="sm" 
      onClick={handleScrape}
      disabled={scrapeWebsite.isPending}
    >
      {scrapeWebsite.isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Scanning...
        </>
      ) : intelligence && intelligence.length > 0 ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rescan Website
        </>
      ) : (
        <>
          <Search className="h-4 w-4 mr-2" />
          Scan Website
        </>
      )}
    </Button>
  ) : null;

  return (
    <>
      <CollapsibleSection
        title="Website Intelligence"
        icon={<div className="p-1.5 rounded-md bg-accent/10"><Brain className="h-4 w-4 text-accent" /></div>}
        isEmpty={!intelligence || intelligence.length === 0}
        actions={actionButtons}
      >
        {!agencyUrl ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No website URL available for this agency</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : intelligence && intelligence.length > 0 ? (
          <Tabs defaultValue={types[0]} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${types.length}, 1fr)` }}>
              {types.map(type => {
                const config = typeConfig[type] || { icon: Brain, label: type, color: "bg-gray-500" };
                const Icon = config.icon;
                return (
                  <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {config.label}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {groupedIntelligence?.[type]?.length || 0}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {types.map(type => (
              <TabsContent key={type} value={type} className="mt-4">
                <div className="space-y-4">
                  {groupedIntelligence?.[type]?.map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{item.title}</h4>
                            {item.confidence_score && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(item.confidence_score * 100)}% confidence
                              </Badge>
                            )}
                          </div>
                          
                          {type === 'contacts' && item.extracted_data?.contacts && (
                            <div className="space-y-2">
                              {item.extracted_data.contacts.map((contact: any, i: number) => (
                                <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                                  <p className="font-medium">{contact.name}</p>
                                  {contact.title && <p className="text-muted-foreground">{contact.title}</p>}
                                  {contact.email && (
                                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline block">
                                      {contact.email}
                                    </a>
                                  )}
                                  {contact.phone && <p>{contact.phone}</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          {type === 'leadership' && item.extracted_data?.leaders && (
                            <div className="space-y-2">
                              {item.extracted_data.leaders.map((leader: any, i: number) => (
                                <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                                  <p className="font-medium">{leader.name}</p>
                                  {leader.title && <p className="text-muted-foreground">{leader.title}</p>}
                                  {leader.department && <p className="text-xs text-muted-foreground">{leader.department}</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          {type === 'procurement' && item.extracted_data && (
                            <div className="space-y-2">
                              {item.extracted_data.source === 'open_web_search' && item.extracted_data.portals && (
                                <div className="space-y-2">
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Found via open web search
                                  </p>
                                  {item.extracted_data.portals.map((portal: any, i: number) => (
                                    <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <a 
                                            href={portal.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="font-medium text-primary hover:underline"
                                          >
                                            {portal.title}
                                          </a>
                                          <Badge variant="secondary" className="ml-2 text-xs">
                                            {portal.sourceType}
                                          </Badge>
                                          {portal.snippet && (
                                            <p className="text-muted-foreground mt-1 text-xs line-clamp-2">
                                              {portal.snippet}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {item.extracted_data.items && item.extracted_data.items.map((proc: any, i: number) => (
                                <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                                  <p className="font-medium">{proc.title}</p>
                                  {proc.type && <Badge variant="secondary" className="text-xs mr-2">{proc.type}</Badge>}
                                  {proc.deadline && <span className="text-xs text-muted-foreground">Deadline: {proc.deadline}</span>}
                                  {proc.description && <p className="text-muted-foreground mt-1">{proc.description}</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          {type === 'news' && item.extracted_data?.items && (
                            <div className="space-y-2">
                              {item.extracted_data.items.map((news: any, i: number) => (
                                <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                                  <p className="font-medium">{news.title}</p>
                                  {news.date && <p className="text-xs text-muted-foreground">{news.date}</p>}
                                  {news.summary && <p className="text-muted-foreground mt-1">{news.summary}</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>Scraped {new Date(item.scraped_at).toLocaleDateString()}</span>
                            <a 
                              href={item.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Source
                            </a>
                          </div>
                        </div>
                        
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No intelligence gathered yet</p>
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4" 
                onClick={handleScrape}
                disabled={scrapeWebsite.isPending}
              >
                {scrapeWebsite.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan Agency Website
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CollapsibleSection>
      
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Intelligence</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this intelligence item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirm) {
                  deleteIntelligence.mutate({ id: deleteConfirm, agencyId });
                  setDeleteConfirm(null);
                }
              }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
