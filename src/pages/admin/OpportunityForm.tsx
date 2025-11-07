import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOpportunity, useOpportunityMutation } from "@/hooks/useOpportunities";
import { useAgencies } from "@/hooks/useAgencies";
import { useProviders } from "@/hooks/useProviders";
import { useArticles } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function OpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: opportunity, isLoading: loadingOpportunity } = useOpportunity(id);
  const { data: agencies } = useAgencies();
  const { data: providers } = useProviders();
  const { data: articles } = useArticles();
  const { createOpportunity, updateOpportunity } = useOpportunityMutation();

  const [formData, setFormData] = useState({
    title: "",
    agency_id: "",
    provider_id: "",
    article_id: "",
    notes: "",
  });

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || "",
        agency_id: opportunity.agency_id || "",
        provider_id: opportunity.provider_id || "",
        article_id: opportunity.article_id || "",
        notes: opportunity.notes || "",
      });
    }
  }, [opportunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      agency_id: formData.agency_id || null,
      provider_id: formData.provider_id || null,
      article_id: formData.article_id || null,
    };

    if (isEditing && id) {
      await updateOpportunity.mutateAsync({ id, updates: data });
    } else {
      await createOpportunity.mutateAsync(data);
    }

    navigate("/admin/opportunities");
  };

  if (loadingOpportunity) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{isEditing ? "Edit" : "New"} Opportunity</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Information</CardTitle>
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
              <Label htmlFor="agency_id">Transit Agency</Label>
              <Select
                value={formData.agency_id}
                onValueChange={(value) => setFormData({ ...formData, agency_id: value })}
              >
                <SelectTrigger id="agency_id">
                  <SelectValue placeholder="Select agency (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {agencies?.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="provider_id">Transportation Provider</Label>
              <Select
                value={formData.provider_id}
                onValueChange={(value) => setFormData({ ...formData, provider_id: value })}
              >
                <SelectTrigger id="provider_id">
                  <SelectValue placeholder="Select provider (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {providers?.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="article_id">Related Article</Label>
              <Select
                value={formData.article_id}
                onValueChange={(value) => setFormData({ ...formData, article_id: value })}
              >
                <SelectTrigger id="article_id">
                  <SelectValue placeholder="Select article (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {articles?.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createOpportunity.isPending || updateOpportunity.isPending}>
                {(createOpportunity.isPending || updateOpportunity.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update" : "Create"} Opportunity
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/opportunities")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
