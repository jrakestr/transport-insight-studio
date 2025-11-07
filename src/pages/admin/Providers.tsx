import { Link } from "react-router-dom";
import { useProviders, useProviderMutation } from "@/hooks/useProviders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

export default function ProvidersAdmin() {
  const { data: providers, isLoading } = useProviders();
  const { deleteProvider } = useProviderMutation();

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
        <h1 className="text-3xl font-bold">Transportation Providers</h1>
        <Button asChild>
          <Link to="/admin/providers/new">
            <Plus className="h-4 w-4 mr-2" />
            New Provider
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {providers?.map((provider) => (
          <Card key={provider.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{provider.name}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {provider.provider_type && <span>Type: {provider.provider_type}</span>}
                    {provider.location && <span>{provider.location}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/providers/${provider.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this provider?")) {
                        deleteProvider.mutate(provider.id);
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

        {providers?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No providers yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
