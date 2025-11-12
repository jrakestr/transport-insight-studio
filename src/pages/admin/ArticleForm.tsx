import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useArticle, useArticleMutation } from "@/hooks/useArticles";
import { useAgencies } from "@/hooks/useAgencies";
import { useProviders } from "@/hooks/useProviders";
import { useDebounce } from "@/hooks/useDebounce";
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
  
  // Track initially selected agencies/providers for display
  const [initialAgencies, setInitialAgencies] = useState<any[]>([]);
  const [initialProviders, setInitialProviders] = useState<any[]>([]);
  
  // Server-side search with debouncing
  const debouncedAgencySearch = useDebounce(agencySearch, 300);
  const debouncedProviderSearch = useDebounce(providerSearch, 300);
  
  const { data: agenciesData, isLoading: loadingAgencies } = useAgencies({ 
    search: debouncedAgencySearch.length >= 2 ? debouncedAgencySearch : undefined,
    limit: 100,
    sortBy: 'agency_name',
    sortOrder: 'asc'
  });
  const agencies = agenciesData?.agencies || [];
  
  const { data: providersData, isLoading: loadingProviders } = useProviders({
    search: debouncedProviderSearch.length >= 2 ? debouncedProviderSearch : undefined,
    limit: 100
  });
  const providers = providersData || [];
  
  const { createArticle, updateArticle } = useArticleMutation();

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
      
      // Store initial selections with full data for display
      if (article.article_agencies) {
        const agencyPromises = article.article_agencies.map(async (a: any) => {
          const { data } = await supabase.from('transit_agencies').select('*').eq('id', a.agency_id).single();
          return data;
        });
        Promise.all(agencyPromises).then(data => setInitialAgencies(data.filter(Boolean)));
      }
      
      if (article.article_providers) {
        const providerPromises = article.article_providers.map(async (p: any) => {
          const { data } = await supabase.from('service_providers').select('*').eq('id', p.provider_id).single();
          return data;
        });
        Promise.all(providerPromises).then(data => setInitialProviders(data.filter(Boolean)));
      }
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
            .from('service_providers')
            .select('id')
            .ilike('name', provider.name)
            .single();

          if (existing) {
            createdProviderIds.push(existing.id);
          } else {
            const { data: newProvider, error: providerError } = await supabase
              .from('service_providers')
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
              placeholder="Type at least 2 characters to search agencies..."
              value={agencySearch}
              onChange={(e) => setAgencySearch(e.target.value)}
              className="mb-4"
            />
            
            {selectedAgencies.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Selected ({selectedAgencies.length}):</p>
                <div className="space-y-1">
                  {initialAgencies.filter(a => selectedAgencies.includes(a.id)).map(agency => (
                    <div key={agency.id} className="text-sm flex items-center justify-between p-2 bg-background rounded">
                      <span>
                        <strong>{agency.agency_name}</strong>
                        {(agency.city || agency.state) && (
                          <span className="text-muted-foreground ml-2">
                            {[agency.city, agency.state].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAgencies(prev => prev.filter(id => id !== agency.id))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {agencies.filter(a => selectedAgencies.includes(a.id) && !initialAgencies.find(ia => ia.id === a.id)).map(agency => (
                    <div key={agency.id} className="text-sm flex items-center justify-between p-2 bg-background rounded">
                      <span>
                        <strong>{agency.agency_name}</strong>
                        {(agency.city || agency.state) && (
                          <span className="text-muted-foreground ml-2">
                            {[agency.city, agency.state].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAgencies(prev => prev.filter(id => id !== agency.id))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2 bg-background">
              {agencySearch.length < 2 ? (
                <p className="text-sm text-muted-foreground p-2 text-center">Type at least 2 characters to search</p>
              ) : loadingAgencies ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : agencies.length > 0 ? (
                <>
                  {agencies.filter(a => !selectedAgencies.includes(a.id)).map((agency) => (
                    <label key={agency.id} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-accent rounded">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => {
                          setSelectedAgencies([...selectedAgencies, agency.id]);
                          if (!initialAgencies.find(a => a.id === agency.id)) {
                            setInitialAgencies([...initialAgencies, agency]);
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
                  ))}
                  <p className="text-xs text-muted-foreground p-2 border-t mt-2">
                    Showing {agencies.filter(a => !selectedAgencies.includes(a.id)).length} results
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground p-2 text-center">No agencies found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transportation Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Type at least 2 characters to search providers..."
              value={providerSearch}
              onChange={(e) => setProviderSearch(e.target.value)}
              className="mb-4"
            />
            
            {selectedProviders.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Selected ({selectedProviders.length}):</p>
                <div className="space-y-1">
                  {initialProviders.filter(p => selectedProviders.includes(p.id)).map(provider => (
                    <div key={provider.id} className="text-sm flex items-center justify-between p-2 bg-background rounded">
                      <span>
                        <strong>{provider.name}</strong>
                        {(provider.provider_type || provider.location) && (
                          <span className="text-muted-foreground ml-2">
                            {[provider.provider_type, provider.location].filter(Boolean).join(" - ")}
                          </span>
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProviders(prev => prev.filter(id => id !== provider.id))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {providers.filter(p => selectedProviders.includes(p.id) && !initialProviders.find(ip => ip.id === p.id)).map(provider => (
                    <div key={provider.id} className="text-sm flex items-center justify-between p-2 bg-background rounded">
                      <span>
                        <strong>{provider.name}</strong>
                        {(provider.provider_type || provider.location) && (
                          <span className="text-muted-foreground ml-2">
                            {[provider.provider_type, provider.location].filter(Boolean).join(" - ")}
                          </span>
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProviders(prev => prev.filter(id => id !== provider.id))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2 bg-background">
              {providerSearch.length < 2 ? (
                <p className="text-sm text-muted-foreground p-2 text-center">Type at least 2 characters to search</p>
              ) : loadingProviders ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : providers.length > 0 ? (
                <>
                  {providers.filter(p => !selectedProviders.includes(p.id)).map((provider) => (
                    <label key={provider.id} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-accent rounded">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => {
                          setSelectedProviders([...selectedProviders, provider.id]);
                          if (!initialProviders.find(p => p.id === provider.id)) {
                            setInitialProviders([...initialProviders, provider]);
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
                  ))}
                  <p className="text-xs text-muted-foreground p-2 border-t mt-2">
                    Showing {providers.filter(p => !selectedProviders.includes(p.id)).length} results
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground p-2 text-center">No providers found</p>
              )}
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
