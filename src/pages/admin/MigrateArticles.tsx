import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { migrateArticlesToDatabase } from "@/utils/migrateArticles";

const MigrateArticles = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    success: string[];
    errors: { title: string; error: string }[];
  } | null>(null);

  const handleMigration = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const migrationResults = await migrateArticlesToDatabase();
      setResults(migrationResults);
    } catch (error) {
      setResults({
        success: [],
        errors: [{
          title: "Migration Failed",
          error: error instanceof Error ? error.message : "Unknown error occurred"
        }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Migrate Articles</h1>
          <p className="text-muted-foreground mt-2">
            Import articles from the static data file into the database
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Article Migration</CardTitle>
            <CardDescription>
              This will convert 6 articles from src/data/articles.ts to HTML and insert them into the database.
              Existing articles with matching slugs will be updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleMigration} 
              disabled={isLoading}
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Migrating..." : "Start Migration"}
            </Button>

            {results && (
              <div className="space-y-4 mt-6">
                {results.success.length > 0 && (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Successfully migrated {results.success.length} articles:</strong>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        {results.success.map((title) => (
                          <li key={title}>{title}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {results.errors.length > 0 && (
                  <Alert className="border-red-500 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Failed to migrate {results.errors.length} articles:</strong>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        {results.errors.map((error, index) => (
                          <li key={index}>
                            <strong>{error.title}</strong>: {error.error}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default MigrateArticles;
