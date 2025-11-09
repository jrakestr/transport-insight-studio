import { Link } from "react-router-dom";
import { useAgencies, useAgencyMutation } from "@/hooks/useAgencies";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, Upload } from "lucide-react";

export default function AgenciesAdmin() {
  const { data: agencies, isLoading } = useAgencies();
  const { deleteAgency } = useAgencyMutation();

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
        <h1 className="text-3xl font-bold">Transit Agencies</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/agencies/import">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/agencies/new">
              <Plus className="h-4 w-4 mr-2" />
              New Agency
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {agencies?.map((agency) => (
          <Card key={agency.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{agency.agency_name}</h3>
                  {agency.doing_business_as && (
                    <p className="text-sm text-muted-foreground mb-2">{agency.doing_business_as}</p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {(agency.city || agency.state) && <span>{[agency.city, agency.state].filter(Boolean).join(", ")}</span>}
                    {agency.total_voms && <span>Fleet: {agency.total_voms}</span>}
                    {agency.ntd_id && <span>NTD: {agency.ntd_id}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/agencies/${agency.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this agency?")) {
                        deleteAgency.mutate(agency.id);
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

        {agencies?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No agencies yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
