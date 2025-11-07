import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAgency, useAgencyMutation } from "@/hooks/useAgencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AgencyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: agency, isLoading } = useAgency(id);
  const { createAgency, updateAgency } = useAgencyMutation();

  const [formData, setFormData] = useState({
    name: "",
    formal_name: "",
    location: "",
    ntd_id: "",
    fleet_size: "",
    website: "",
    notes: "",
  });

  useEffect(() => {
    if (agency) {
      setFormData({
        name: agency.name || "",
        formal_name: agency.formal_name || "",
        location: agency.location || "",
        ntd_id: agency.ntd_id || "",
        fleet_size: agency.fleet_size?.toString() || "",
        website: agency.website || "",
        notes: agency.notes || "",
      });
    }
  }, [agency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      fleet_size: formData.fleet_size ? parseInt(formData.fleet_size) : null,
    };

    if (isEditing && id) {
      await updateAgency.mutateAsync({ id, updates: data });
    } else {
      await createAgency.mutateAsync(data);
    }

    navigate("/admin/agencies");
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
      <h1 className="text-3xl font-bold mb-6">{isEditing ? "Edit" : "New"} Transit Agency</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Agency Information</CardTitle>
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
              <Label htmlFor="formal_name">Formal Name</Label>
              <Input
                id="formal_name"
                value={formData.formal_name}
                onChange={(e) => setFormData({ ...formData, formal_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ntd_id">NTD ID</Label>
                <Input
                  id="ntd_id"
                  value={formData.ntd_id}
                  onChange={(e) => setFormData({ ...formData, ntd_id: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="fleet_size">Fleet Size</Label>
                <Input
                  id="fleet_size"
                  type="number"
                  value={formData.fleet_size}
                  onChange={(e) => setFormData({ ...formData, fleet_size: e.target.value })}
                />
              </div>
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
              <Button type="submit" disabled={createAgency.isPending || updateAgency.isPending}>
                {(createAgency.isPending || updateAgency.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update" : "Create"} Agency
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/agencies")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
