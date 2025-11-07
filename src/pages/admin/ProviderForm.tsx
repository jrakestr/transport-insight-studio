import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProvider, useProviderMutation } from "@/hooks/useProviders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ProviderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: provider, isLoading } = useProvider(id);
  const { createProvider, updateProvider } = useProviderMutation();

  const [formData, setFormData] = useState({
    name: "",
    provider_type: "",
    location: "",
    website: "",
    notes: "",
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || "",
        provider_type: provider.provider_type || "",
        location: provider.location || "",
        website: provider.website || "",
        notes: provider.notes || "",
      });
    }
  }, [provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && id) {
      await updateProvider.mutateAsync({ id, updates: formData });
    } else {
      await createProvider.mutateAsync(formData);
    }

    navigate("/admin/providers");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{isEditing ? "Edit" : "New"} Provider</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Provider Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="provider_type">Provider Type</Label>
              <Input
                id="provider_type"
                placeholder="e.g., TNC, Broker, Operator"
                value={formData.provider_type}
                onChange={(e) => setFormData({ ...formData, provider_type: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State or Country"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
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
              <Button type="submit" disabled={createProvider.isPending || updateProvider.isPending}>
                {(createProvider.isPending || updateProvider.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update" : "Create"} Provider
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/providers")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
