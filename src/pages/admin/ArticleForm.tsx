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

const CATEGORIES = [
  "Funding",
  "RFPs & Procurement",
  "Technology Partnerships",
  "Safety & Security",
  "Technology",
  "Market Trends",
  "Microtransit",
  "Government",
];

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: article, isLoading: loadingArticle } = useArticle(id);
  const { data: agenciesData } = useAgencies();
  const agencies = agenciesData?.agencies || [];
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
    published_at: new Date().toISOString().split("T")[0],
  });

  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [isTransforming, setIsTransforming] = useState(false);
  const [agencySearch, setAgencySearch] = useState("");
  const [providerSearch, setProviderSearch] = useState("");

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
        published_at: article.published_at?.split("T")[0] || "",
      });

      setSelectedVerticals(article.article_verticals?.map((v: any) => v.vertical) || []);
      setSelectedCategories(article.article_categories?.map((c: any) => c.category) || []);
      setSelectedAgencies(article.article_agencies?.map((a: any) => a.agency_id) || []);
      setSelectedProviders(article.article_providers?.map((p: any) => p.provider_id) || []);
    }
  }, [article]);

  const handleTransformWithAI = async () => {
    if (!formData.content.trim()) {
      toast.error("Please enter article content first");
      return;
    }

    setIsTransforming(true);
    try {
      const { data, error } = await supabase.functions.invoke('transform-article', {
        body: { content: formData.content }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Update content
      setFormData(prev => ({
        ...prev,
        content: data.transformedContent
      }));

      // Auto-create agencies and providers
      const createdAgencyIds: string[] = [];
      const createdProviderIds: string[] = [];

      if (data.agencies?.length > 0) {
        for (const agency of data.agencies) {
          // Check if agency already exists by name
          const { data: existing } = await supabase
            .from('transit_agencies')
            .select('id')
            .ilike('agency_name', agency.name)
            .single();

          if (existing) {
            createdAgencyIds.push(existing.id);
          } else {
            const { data: newAgency, error: agencyError } = await supabase
              .from('transit_agencies')
              .insert({
                agency_name: agency.name,
                city: agency.location || null,
                notes: agency.notes || null
              })
              .select('id')
              .single();

            if (!agencyError && newAgency) {
              createdAgencyIds.push(newAgency.id);
            }
          }
        }
      }

      if (data.providers?.length > 0) {
        for (const provider of data.providers) {
          // Check if provider already exists by name
          const { data: existing } = await supabase
            .from('transportation_providers')
            .select('id')
            .ilike('name', provider.name)
            .single();

          if (existing) {
            createdProviderIds.push(existing.id);
          } else {
            const { data: newProvider, error: providerError } = await supabase
              .from('transportation_providers')
              .insert({
                name: provider.name,
                location: provider.location || null,
                provider_type: provider.provider_type || null,
                notes: provider.notes || null
              })
              .select('id')
              .single();

            if (!providerError && newProvider) {
              createdProviderIds.push(newProvider.id);
            }
          }
        }
      }

      // Update selected agencies and providers
      setSelectedAgencies(createdAgencyIds);
      setSelectedProviders(createdProviderIds);

      const entityCount = createdAgencyIds.length + createdProviderIds.length;
      toast.success(`Content transformed! Auto-created ${entityCount} entities.`);
    } catch (error: any) {
      console.error('Transform error:', error);
      toast.error(error.message || "Failed to transform content");
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
        verticals: selectedVerticals,
        categories: selectedCategories,
        agencies: selectedAgencies,
        providers: selectedProviders,
      });
    } else {
      await createArticle.mutateAsync({
        article: formData,
        verticals: selectedVerticals,
        categories: selectedCategories,
        agencies: selectedAgencies,
        providers: selectedProviders,
      });
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

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, category]);
                      } else {
                        setSelectedCategories(selectedCategories.filter((c) => c !== category));
                      }
                    }}
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transit Agencies</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search agencies..."
              value={agencySearch}
              onChange={(e) => setAgencySearch(e.target.value)}
              className="mb-4"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2 bg-background">
              {agencies && agencies.length > 0 ? (
                agencies
                  .filter((agency) => 
                    !agencySearch || 
                    agency.agency_name.toLowerCase().includes(agencySearch.toLowerCase()) ||
                    agency.city?.toLowerCase().includes(agencySearch.toLowerCase()) ||
                    agency.state?.toLowerCase().includes(agencySearch.toLowerCase()) ||
                    agency.ntd_id?.toLowerCase().includes(agencySearch.toLowerCase())
                  )
                  .map((agency) => (
                    <label key={agency.id} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-accent rounded">
                      <input
                        type="checkbox"
                        checked={selectedAgencies.includes(agency.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAgencies([...selectedAgencies, agency.id]);
                          } else {
                            setSelectedAgencies(selectedAgencies.filter((id) => id !== agency.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{agency.agency_name}</div>
                        {(agency.city || agency.state) && (
                          <div className="text-xs text-muted-foreground">
                            {[agency.city, agency.state].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                    </label>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground p-2">No agencies available</p>
              )}
            </div>
            {selectedAgencies.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedAgencies.length} {selectedAgencies.length === 1 ? 'agency' : 'agencies'} selected
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transportation Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search providers..."
              value={providerSearch}
              onChange={(e) => setProviderSearch(e.target.value)}
              className="mb-4"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2 bg-background">
              {providers && providers.length > 0 ? (
                providers
                  .filter((provider) => 
                    !providerSearch || 
                    provider.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
                    provider.provider_type?.toLowerCase().includes(providerSearch.toLowerCase()) ||
                    provider.location?.toLowerCase().includes(providerSearch.toLowerCase())
                  )
                  .map((provider) => (
                    <label key={provider.id} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-accent rounded">
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProviders([...selectedProviders, provider.id]);
                          } else {
                            setSelectedProviders(selectedProviders.filter((id) => id !== provider.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{provider.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {[provider.provider_type, provider.location].filter(Boolean).join(" - ")}
                        </div>
                      </div>
                    </label>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground p-2">No providers available</p>
              )}
            </div>
            {selectedProviders.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedProviders.length} {selectedProviders.length === 1 ? 'provider' : 'providers'} selected
              </p>
            )}
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
