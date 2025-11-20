import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AutomatedSearchTest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, any>>({});

  const executeStep = async (step: string, functionName: string, body: any = {}) => {
    setLoading(prev => ({ ...prev, [step]: true }));
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      
      if (error) throw error;
      
      setResults(prev => ({ ...prev, [step]: data }));
      toast({
        title: 'Success',
        description: `${step} completed successfully`,
      });
      return data;
    } catch (error: any) {
      console.error(`Error in ${step}:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to execute ${step}`,
        variant: 'destructive',
      });
      setResults(prev => ({ ...prev, [step]: { error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [step]: false }));
    }
  };

  const step1GenerateSearches = () => executeStep(
    'Generate Searches',
    'generate-targeted-searches',
    {}
  );

  const step2ExecuteSearches = async () => {
    const data = await executeStep(
      'Execute Searches',
      'execute-automated-searches',
      { limit: 5 }
    );
    return data;
  };

  const step3ProcessResults = () => executeStep(
    'Process Results',
    'process-search-results',
    { limit: 5, minRelevanceScore: 60 }
  );

  const runFullWorkflow = async () => {
    toast({ title: 'Starting full workflow test...' });
    
    const step1 = await step1GenerateSearches();
    if (!step1 || step1.error) return;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const step2 = await step2ExecuteSearches();
    if (!step2 || step2.error) return;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await step3ProcessResults();
    
    toast({
      title: 'Workflow Complete',
      description: 'All steps executed successfully',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automated Search Test</h1>
          <p className="text-muted-foreground mt-2">
            Test the complete automated search workflow
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Workflow Steps</h2>
        
        <div className="space-y-4">
            {/* Step 1 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                    1
                  </div>
                  <h3 className="font-semibold">Generate Targeted Searches</h3>
                </div>
                <Button
                  onClick={step1GenerateSearches}
                  disabled={loading['Generate Searches']}
                  size="sm"
                >
                  {loading['Generate Searches'] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Run'
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Generates searches based on agencies, providers, and verticals
              </p>
              {results['Generate Searches'] && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(results['Generate Searches'], null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                    2
                  </div>
                  <h3 className="font-semibold">Execute Automated Searches</h3>
                </div>
                <Button
                  onClick={step2ExecuteSearches}
                  disabled={loading['Execute Searches']}
                  size="sm"
                >
                  {loading['Execute Searches'] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Run'
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Calls Exa API to find articles and stores results
              </p>
              {results['Execute Searches'] && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(results['Execute Searches'], null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Step 3 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                    3
                  </div>
                  <h3 className="font-semibold">Process Search Results</h3>
                </div>
                <Button
                  onClick={step3ProcessResults}
                  disabled={loading['Process Results']}
                  size="sm"
                >
                  {loading['Process Results'] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Run'
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Extracts content, analyzes with AI, adds to pending articles
              </p>
              {results['Process Results'] && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(results['Process Results'], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button
              onClick={runFullWorkflow}
              disabled={Object.values(loading).some(Boolean)}
              className="w-full"
              size="lg"
            >
              {Object.values(loading).some(Boolean) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Workflow...
                </>
              ) : (
                'Run Full Workflow'
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Database Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard title="Automated Searches" table="automated_searches" />
            <StatsCard title="Search Results" table="search_results" />
            <StatsCard title="Pending Articles" table="pending_articles" />
          </div>
        </Card>
      </div>
    );
  }

function StatsCard({ title, table }: { title: string; table: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true });
      
      if (!error) setCount(count || 0);
      setLoading(false);
    };
    fetchCount();
  }, [table]);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <p className="text-3xl font-bold">{count}</p>
      )}
    </div>
  );
}
