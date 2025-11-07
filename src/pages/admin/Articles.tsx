import { Link } from "react-router-dom";
import { useArticles, useArticleMutation } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function ArticlesAdmin() {
  const { data: articles, isLoading } = useArticles();
  const { deleteArticle } = useArticleMutation();
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const handleBulkExtract = async () => {
    setIsBulkProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-extract-entities', {});
      
      if (error) throw error;
      
      toast.success(
        `Processed ${data.processed} articles! Created ${data.agenciesCreated} agencies and ${data.providersCreated} providers.`
      );
      
      if (data.errors?.length > 0) {
        console.error('Extraction errors:', data.errors);
        toast.warning(`${data.errors.length} articles had errors - check console`);
      }
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      console.error('Bulk extraction error:', error);
      toast.error(error.message || 'Failed to process articles');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Articles</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleBulkExtract}
            disabled={isBulkProcessing}
          >
            {isBulkProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Extract All Entities
              </>
            )}
          </Button>
          <Button asChild>
            <Link to="/admin/articles/new">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {articles?.map((article) => (
          <Card key={article.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{article.description}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Published: {format(new Date(article.published_at), "MMM d, yyyy")}</span>
                    <span>Slug: {article.slug}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/articles/${article.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this article?")) {
                        deleteArticle.mutate(article.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {articles?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No articles yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
