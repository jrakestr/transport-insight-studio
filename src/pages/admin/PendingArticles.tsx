import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { usePendingArticles, usePendingArticleMutations } from "@/hooks/usePendingArticles";
import { Loader2, CheckCircle, XCircle, Search, Sparkles } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PendingArticles = () => {
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const { data: articles, isLoading } = usePendingArticles(selectedStatus);
  const { approveArticle, rejectArticle, triggerDiscovery } = usePendingArticleMutations();
  
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    articleId: string | null;
    action: "approve" | "reject" | null;
  }>({ open: false, articleId: null, action: null });
  
  const [notes, setNotes] = useState("");

  const handleReview = () => {
    if (!reviewDialog.articleId || !reviewDialog.action) return;

    if (reviewDialog.action === "approve") {
      approveArticle.mutate({ articleId: reviewDialog.articleId, notes });
    } else {
      rejectArticle.mutate({ articleId: reviewDialog.articleId, reason: notes });
    }

    setReviewDialog({ open: false, articleId: null, action: null });
    setNotes("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Article Review Queue</h1>
            <p className="text-muted-foreground">
              Review AI-discovered articles before publication
            </p>
          </div>
          <Button
            onClick={() => triggerDiscovery.mutate()}
            disabled={triggerDiscovery.isPending}
          >
            {triggerDiscovery.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Discovering...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Run Discovery
              </>
            )}
          </Button>
        </div>

        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="needs_edit">Needs Edit</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="space-y-4">
                {articles.map((article) => (
                  <Card key={article.id} className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {article.discovery_method}
                            </Badge>
                            {article.extracted_category && (
                              <Badge>{article.extracted_category}</Badge>
                            )}
                            <Badge variant="secondary">
                              Confidence: {((article.ai_confidence_score || 0) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {article.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Discovered: {format(new Date(article.discovered_at), "MMM d, yyyy")}
                            </span>
                            <a
                              href={article.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {article.source_name}
                            </a>
                          </div>
                        </div>
                        {article.image_url && (
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-32 h-32 object-cover rounded-lg ml-4"
                          />
                        )}
                      </div>

                      {/* AI Extracted Entities */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        {Array.isArray(article.extracted_agencies) && article.extracted_agencies.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Agencies</p>
                            <div className="space-y-1">
                              {article.extracted_agencies.map((agency: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  {agency.name}
                                  {agency.confidence && (
                                    <span className="text-muted-foreground ml-1">
                                      ({(agency.confidence * 100).toFixed(0)}%)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {Array.isArray(article.extracted_providers) && article.extracted_providers.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Providers</p>
                            <div className="space-y-1">
                              {article.extracted_providers.map((provider: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  {provider.name}
                                  {provider.type && (
                                    <span className="text-muted-foreground ml-1">
                                      ({provider.type})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {Array.isArray(article.extracted_opportunities) && article.extracted_opportunities.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Opportunities</p>
                            <div className="space-y-1">
                              {article.extracted_opportunities.map((opp: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  {opp.type}: {opp.description}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {article.review_status === "pending" && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            onClick={() =>
                              setReviewDialog({
                                open: true,
                                articleId: article.id,
                                action: "approve",
                              })
                            }
                            className="flex-1"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve & Publish
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              setReviewDialog({
                                open: true,
                                articleId: article.id,
                                action: "reject",
                              })
                            }
                            className="flex-1"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {article.reviewer_notes && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-semibold mb-1">Reviewer Notes:</p>
                          <p className="text-sm text-muted-foreground">{article.reviewer_notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No {selectedStatus} articles found.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialog.open} onOpenChange={(open) => !open && setReviewDialog({ open: false, articleId: null, action: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewDialog.action === "approve" ? "Approve Article" : "Reject Article"}
              </DialogTitle>
              <DialogDescription>
                {reviewDialog.action === "approve"
                  ? "Add any notes before publishing this article."
                  : "Please provide a reason for rejecting this article."}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder={reviewDialog.action === "approve" ? "Optional notes..." : "Reason for rejection..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReviewDialog({ open: false, articleId: null, action: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                variant={reviewDialog.action === "approve" ? "default" : "destructive"}
              >
                {reviewDialog.action === "approve" ? "Approve & Publish" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default PendingArticles;
