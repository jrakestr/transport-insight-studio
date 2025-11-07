import { Link } from "react-router-dom";
import { useOpportunities, useOpportunityMutation } from "@/hooks/useOpportunities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

export default function OpportunitiesAdmin() {
  const { data: opportunities, isLoading } = useOpportunities();
  const { deleteOpportunity } = useOpportunityMutation();

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
        <h1 className="text-3xl font-bold">Opportunities</h1>
        <Button asChild>
          <Link to="/admin/opportunities/new">
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {opportunities?.map((opportunity) => (
          <Card key={opportunity.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{opportunity.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                    {opportunity.transit_agencies && (
                      <span>Agency: {opportunity.transit_agencies.name}</span>
                    )}
                    {opportunity.transportation_providers && (
                      <span>Provider: {opportunity.transportation_providers.name}</span>
                    )}
                  </div>
                  {opportunity.articles && (
                    <p className="text-sm text-muted-foreground">
                      Related: {opportunity.articles.title}
                    </p>
                  )}
                  {opportunity.notes && (
                    <p className="text-sm mt-2">{opportunity.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/opportunities/${opportunity.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this opportunity?")) {
                        deleteOpportunity.mutate(opportunity.id);
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

        {opportunities?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No opportunities yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
