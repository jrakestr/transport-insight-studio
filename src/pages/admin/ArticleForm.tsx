import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useArticle, useArticleMutation } from "@/hooks/useArticles";
import { useAgencies } from "@/hooks/useAgencies";
import { useProviders } from "@/hooks/useProviders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VERTICALS = [
  "paratransit",
  "corporate-shuttles",
  "school",
  "healthcare",
  "government",
  "fixed-route",
];

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: article, isLoading: loadingArticle } = useArticle(id);
  const { data: agencies } = useAgencies();
  const { data: providers } = useProviders();
  const { createArticle, updateArticle } = useArticleMutation();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    author_name: "",
    author_role: "",
    image_url: "",
    source_name: "",
    source_url: "",
    category: "",
    published_at: new Date().toISOString().split("T")[0],
  });

  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [isTransforming, setIsTransforming] = useState(false);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        slug: article.slug || "",
        description: article.description || "",
        content: article.content || "",
        author_name: article.author_name || "",
        author_role: article.author_role || "",
        image_url: article.image_url || "",
        source_name: article.source_name || "",
        source_url: article.source_url || "",
        category: article.category || "",
        published_at: article.published_at?.split("T")[0] || "",
      });

      setSelectedVerticals(article.article_verticals?.map((v: any) => v.vertical) || []);
      setSelectedAgencies(article.article_agencies?.map((a: any) => a.agency_id) || []);
      setSelectedProviders(article.article_providers?.map((p: any) => p.provider_id) || []);
    }
  }, [article]);

  const handleTransformWithAI = async () => {
    if (!formData.content.trim()) {
      toast.error("Please paste article content first");
      return;
    }

    // Check if content is already transformed HTML
    if (formData.content.includes('<div class="bg-white') || 
        formData.content.includes('text-indigo-600') ||
        formData.content.includes('max-w-3xl')) {
      toast.error("This content is already transformed HTML. Transform only works on raw article text.");
      return;
    }

    setIsTransforming(true);
    try {
      const { data, error } = await supabase.functions.invoke('transform-article', {
        body: { content: formData.content }
      });

      if (error) throw error;

      if (data?.transformedContent) {
        setFormData({ ...formData, content: data.transformedContent });
        toast.success("Article transformed successfully!");
      }
    } catch (error: any) {
      console.error("Error transforming article:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else if (error.message?.includes("402")) {
        toast.error("AI credits exhausted. Please add funds to your workspace.");
      } else {
        toast.error("Failed to transform article. Please try again.");
      }
    } finally {
      setIsTransforming(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && id) {
      await updateArticle.mutateAsync({
        id,
        updates: formData,
      });
    } else {
      await createArticle.mutateAsync(formData);
    }

    navigate("/admin/articles");
  };

  if (loadingArticle) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{isEditing ? "Edit" : "New"} Article</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content">Content (HTML)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTransformWithAI}
                  disabled={isTransforming}
                  className="gap-2"
                >
                  {isTransforming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Transforming...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Transform with AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                placeholder="Paste your article content here, then click 'Transform with AI' for structured HTML formatting..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author_name">Author Name</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="author_role">Author Role</Label>
                <Input
                  id="author_role"
                  value={formData.author_role}
                  onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="published_at">Published Date *</Label>
                <Input
                  id="published_at"
                  type="date"
                  value={formData.published_at}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source_name">Source Name</Label>
                <Input
                  id="source_name"
                  value={formData.source_name}
                  onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="source_url">Source URL</Label>
                <Input
                  id="source_url"
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verticals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {VERTICALS.map((vertical) => (
                <label key={vertical} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedVerticals.includes(vertical)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVerticals([...selectedVerticals, vertical]);
                      } else {
                        setSelectedVerticals(selectedVerticals.filter((v) => v !== vertical));
                      }
                    }}
                  />
                  <span className="text-sm capitalize">{vertical.replace("-", " ")}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={createArticle.isPending || updateArticle.isPending}>
            {(createArticle.isPending || updateArticle.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Update" : "Create"} Article
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/articles")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
