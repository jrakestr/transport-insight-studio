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
    agency_name: "",
    doing_business_as: "",
    address_line_1: "",
    city: "",
    state: "",
    zip_code: "",
    ntd_id: "",
    total_voms: "",
    population: "",
    density: "",
    sq_miles: "",
    url: "",
    notes: "",
  });

  useEffect(() => {
    if (agency) {
      setFormData({
        agency_name: agency.agency_name || "",
        doing_business_as: agency.doing_business_as || "",
        address_line_1: agency.address_line_1 || "",
        city: agency.city || "",
        state: agency.state || "",
        zip_code: agency.zip_code || "",
        ntd_id: agency.ntd_id || "",
        total_voms: agency.total_voms?.toString() || "",
        population: agency.population?.toString() || "",
        density: agency.density?.toString() || "",
        sq_miles: agency.sq_miles?.toString() || "",
        url: agency.url || "",
        notes: agency.notes || "",
      });
    }
  }, [agency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      total_voms: formData.total_voms ? parseInt(formData.total_voms) : null,
      population: formData.population ? parseInt(formData.population) : null,
      density: formData.density ? parseFloat(formData.density) : null,
      sq_miles: formData.sq_miles ? parseFloat(formData.sq_miles) : null,
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
              <Label htmlFor="agency_name">Agency Name *</Label>
              <Input
                id="agency_name"
                value={formData.agency_name}
                onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="doing_business_as">Doing Business As</Label>
              <Input
                id="doing_business_as"
                value={formData.doing_business_as}
                onChange={(e) => setFormData({ ...formData, doing_business_as: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="address_line_1">Address</Label>
              <Input
                id="address_line_1"
                value={formData.address_line_1}
                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  maxLength={2}
                  placeholder="CA"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                />
              </div>
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
                <Label htmlFor="total_voms">Total VOMs</Label>
                <Input
                  id="total_voms"
                  type="number"
                  value={formData.total_voms}
                  onChange={(e) => setFormData({ ...formData, total_voms: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="population">Population</Label>
                <Input
                  id="population"
                  type="number"
                  value={formData.population}
                  onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="density">Density</Label>
                <Input
                  id="density"
                  type="number"
                  step="0.01"
                  placeholder="per sq mile"
                  value={formData.density}
                  onChange={(e) => setFormData({ ...formData, density: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="sq_miles">Square Miles</Label>
                <Input
                  id="sq_miles"
                  type="number"
                  step="0.01"
                  value={formData.sq_miles}
                  onChange={(e) => setFormData({ ...formData, sq_miles: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="url">Website</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
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
