-- Create implementation_tasks table
CREATE TABLE implementation_tasks (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_number text UNIQUE NOT NULL,
  
  -- Task Details
  title text NOT NULL,
  description text,
  acceptance_criteria text[],
  
  -- Organization
  project_name text NOT NULL DEFAULT 'automated-queries',
  phase text NOT NULL,
  phase_order integer NOT NULL,
  category text NOT NULL,
  
  -- Status Tracking
  status text NOT NULL DEFAULT 'planned',
  priority text NOT NULL DEFAULT 'medium',
  
  -- Assignment and Ownership
  assigned_to uuid,
  created_by uuid,
  completed_by uuid,
  
  -- Timing
  estimated_hours numeric(5,2),
  actual_hours numeric(5,2),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  due_date timestamp with time zone,
  
  -- Dependencies and Relationships
  depends_on uuid[],
  blocks uuid[],
  related_table text,
  related_entity_id uuid,
  
  -- Implementation Details
  file_paths text[],
  edge_function_name text,
  migration_required boolean DEFAULT false,
  
  -- Progress Tracking
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  notes text,
  
  -- Technical Metadata
  pull_request_url text,
  commit_hash text,
  test_status text,
  
  -- Audit Trail
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('planned', 'in-progress', 'blocked', 'review', 'completed', 'cancelled')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_category CHECK (category IN ('database', 'edge-function', 'ui', 'testing', 'documentation')),
  CONSTRAINT valid_test_status CHECK (test_status IS NULL OR test_status IN ('not-started', 'passing', 'failing', 'skipped'))
);

-- Create indexes for performance
CREATE INDEX idx_tasks_status ON implementation_tasks(status) WHERE status != 'completed';
CREATE INDEX idx_tasks_assigned ON implementation_tasks(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_tasks_project_phase ON implementation_tasks(project_name, phase_order);
CREATE INDEX idx_tasks_priority ON implementation_tasks(priority, status);
CREATE INDEX idx_tasks_depends ON implementation_tasks USING gin(depends_on);
CREATE INDEX idx_tasks_category ON implementation_tasks(category);
CREATE INDEX idx_tasks_due_date ON implementation_tasks(due_date) WHERE status != 'completed' AND due_date IS NOT NULL;

-- Enable RLS
ALTER TABLE implementation_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all tasks"
  ON implementation_tasks
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view tasks"
  ON implementation_tasks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update assigned tasks"
  ON implementation_tasks
  FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Add automatic timestamp trigger
CREATE TRIGGER update_implementation_tasks_updated_at
  BEFORE UPDATE ON implementation_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Populate with initial automated queries implementation tasks
-- Phase 1: Database Schema (with migration_required)
INSERT INTO implementation_tasks (task_number, title, description, project_name, phase, phase_order, category, priority, acceptance_criteria, estimated_hours, file_paths, migration_required) VALUES
('AQ-1.1', 'Create automated_searches table', 'Design and implement the automated_searches table with entity relationships, search configuration, and scheduling fields', 'automated-queries', 'Phase 1', 1, 'database', 'critical', 
  ARRAY['Table created with all required columns', 'Foreign keys to transit_agencies and service_providers', 'RLS policies implemented', 'Indexes created for performance'], 
  2.0, ARRAY['supabase/migrations/YYYYMMDDHHMMSS_create_automated_searches.sql'], true),
('AQ-1.2', 'Create search_results table', 'Implement search_results table with deduplication and processing status tracking', 'automated-queries', 'Phase 1', 1, 'database', 'critical',
  ARRAY['Table created with unique constraint on search_id + source_url', 'Foreign key to automated_searches', 'Link field for pending_articles', 'RLS policies implemented'],
  1.5, ARRAY['supabase/migrations/YYYYMMDDHHMMSS_create_search_results.sql'], true),
('AQ-1.3', 'Add performance indexes', 'Create indexes for scheduled search lookup, entity lookups, and deduplication', 'automated-queries', 'Phase 1', 1, 'database', 'high',
  ARRAY['Index on next_run_at for scheduling', 'Index on agency_id and provider_id', 'Index on source_url for deduplication', 'Query performance verified'],
  1.0, ARRAY['supabase/migrations/YYYYMMDDHHMMSS_add_search_indexes.sql'], true);

-- Phase 2: Edge Functions (with edge_function_name)
INSERT INTO implementation_tasks (task_number, title, description, project_name, phase, phase_order, category, priority, acceptance_criteria, estimated_hours, file_paths, edge_function_name) VALUES
('AQ-2.1', 'Create generate-targeted-searches edge function', 'Build edge function to query agencies/providers and generate targeted search queries', 'automated-queries', 'Phase 2', 2, 'edge-function', 'critical',
  ARRAY['Function queries transit_agencies table', 'Function queries service_providers table', 'Generates agency-specific searches', 'Generates provider-specific searches', 'Generates vertical/keyword searches', 'Admin authentication enforced', 'Proper error handling and logging'],
  4.0, ARRAY['supabase/functions/generate-targeted-searches/index.ts'], 'generate-targeted-searches'),
('AQ-2.2', 'Create execute-automated-searches edge function', 'Build edge function to execute scheduled searches using Exa API', 'automated-queries', 'Phase 2', 2, 'edge-function', 'critical',
  ARRAY['Finds searches ready to run', 'Calls Exa API with search queries', 'Handles API errors gracefully', 'Inserts results with deduplication', 'Updates scheduling fields', 'Logs to discovery_runs', 'Respects rate limits'],
  5.0, ARRAY['supabase/functions/execute-automated-searches/index.ts'], 'execute-automated-searches'),
('AQ-2.3', 'Create process-search-results edge function', 'Build edge function to convert search results into pending articles', 'automated-queries', 'Phase 2', 2, 'edge-function', 'high',
  ARRAY['Finds unprocessed search_results', 'Checks for duplicates in pending_articles', 'Calls transform-article for new URLs', 'Creates pending_articles records', 'Links search_result to pending_article', 'Marks results as processed', 'Proper error handling'],
  4.0, ARRAY['supabase/functions/process-search-results/index.ts'], 'process-search-results');

-- Phase 3: Scheduling (with migration_required)
INSERT INTO implementation_tasks (task_number, title, description, project_name, phase, phase_order, category, priority, acceptance_criteria, estimated_hours, migration_required) VALUES
('AQ-3.1', 'Enable pg_cron extension', 'Enable and configure pg_cron extension for scheduled job execution', 'automated-queries', 'Phase 3', 3, 'database', 'high',
  ARRAY['pg_cron extension enabled', 'pg_net extension enabled', 'Permissions configured', 'Test job runs successfully'],
  1.0, true),
('AQ-3.2', 'Create hourly search execution cron job', 'Set up cron job to execute automated searches every hour', 'automated-queries', 'Phase 3', 3, 'database', 'high',
  ARRAY['Cron job scheduled for hourly execution', 'Calls execute-automated-searches function', 'Proper authentication configured', 'Monitoring enabled'],
  2.0, true),
('AQ-3.3', 'Create daily query regeneration cron job', 'Set up cron job to regenerate search queries daily', 'automated-queries', 'Phase 3', 3, 'database', 'medium',
  ARRAY['Cron job scheduled for daily execution', 'Calls generate-targeted-searches function', 'Updates existing searches', 'Deactivates stale searches'],
  1.5, true);

-- Phase 4: Admin UI Integration (with file_paths)
INSERT INTO implementation_tasks (task_number, title, description, project_name, phase, phase_order, category, priority, acceptance_criteria, estimated_hours, file_paths) VALUES
('AQ-4.1', 'Create automated searches admin page', 'Build admin page to manage automated searches', 'automated-queries', 'Phase 4', 4, 'ui', 'high',
  ARRAY['Table view of all automated searches', 'Filter by search_type, status, entity', 'Sort by next_run_at, results_count, priority', 'Pagination implemented', 'Responsive design'],
  4.0, ARRAY['src/pages/admin/AutomatedSearches.tsx', 'src/hooks/useAutomatedSearches.tsx']),
('AQ-4.2', 'Add search performance metrics dashboard', 'Create dashboard showing search performance and conversion rates', 'automated-queries', 'Phase 4', 4, 'ui', 'medium',
  ARRAY['Charts showing discoveries over time', 'Conversion rate (discoveries → pending articles)', 'Top performing search queries', 'Entity coverage metrics', 'Cost tracking (API calls)'],
  5.0, ARRAY['src/pages/admin/SearchMetrics.tsx', 'src/components/SearchMetricsChart.tsx']),
('AQ-4.3', 'Add manual trigger functionality', 'Allow admins to manually trigger search execution', 'automated-queries', 'Phase 4', 4, 'ui', 'medium',
  ARRAY['Button to trigger generate-targeted-searches', 'Button to trigger execute-automated-searches', 'Button to trigger process-search-results', 'Loading states during execution', 'Success/error notifications', 'Confirmation dialogs'],
  3.0, ARRAY['src/pages/admin/AutomatedSearches.tsx']),
('AQ-4.4', 'Link articles to source searches', 'Show which automated search discovered each article', 'automated-queries', 'Phase 4', 4, 'ui', 'low',
  ARRAY['Badge on pending articles showing source search', 'Filter pending articles by search source', 'Link from article to search details', 'Search attribution preserved after approval'],
  2.0, ARRAY['src/pages/admin/PendingArticles.tsx', 'src/components/SearchSourceBadge.tsx']),
('AQ-4.5', 'Search query editor', 'Build interface to edit and test search queries', 'automated-queries', 'Phase 4', 4, 'ui', 'medium',
  ARRAY['Form to edit search_query and parameters', 'Test button to preview results', 'Activate/deactivate searches', 'Adjust frequency and priority', 'Input validation'],
  4.0, ARRAY['src/pages/admin/AutomatedSearchForm.tsx']);

-- Phase 5: Testing & Optimization (basic tasks)
INSERT INTO implementation_tasks (task_number, title, description, project_name, phase, phase_order, category, priority, acceptance_criteria, estimated_hours) VALUES
('AQ-5.1', 'Test with pilot batch of agencies', 'Run system with 10 high-priority agencies', 'automated-queries', 'Phase 5', 5, 'testing', 'high',
  ARRAY['Select 10 diverse transit agencies', 'Generate searches for pilot agencies', 'Execute searches and monitor results', 'Verify pending articles created', 'Document success rate and issues'],
  3.0),
('AQ-5.2', 'Monitor conversion rates', 'Track and analyze discovery-to-article conversion', 'automated-queries', 'Phase 5', 5, 'testing', 'high',
  ARRAY['Measure discovery → pending article rate', 'Measure pending → published article rate', 'Identify low-performing searches', 'Document quality of AI extractions', 'Create performance baseline'],
  2.0),
('AQ-5.3', 'Optimize search queries', 'Refine queries based on performance data', 'automated-queries', 'Phase 5', 5, 'testing', 'medium',
  ARRAY['Adjust queries with low hit rates', 'Add exclusion terms to reduce noise', 'Test vertical-specific variations', 'Update search parameters', 'A/B test query variations'],
  4.0),
('AQ-5.4', 'Tune relevance scoring', 'Adjust AI confidence thresholds and filters', 'automated-queries', 'Phase 5', 5, 'testing', 'medium',
  ARRAY['Analyze false positives', 'Adjust AI confidence threshold', 'Refine entity extraction', 'Improve category classification', 'Document tuning decisions'],
  3.0),
('AQ-5.5', 'Create workflow documentation', 'Document system for team and future reference', 'automated-queries', 'Phase 5', 5, 'documentation', 'high',
  ARRAY['System architecture diagram', 'Admin user guide', 'Troubleshooting guide', 'Query optimization guide', 'Update DATABASE_SCHEMA.md'],
  4.0);

-- Update task dependencies (must be done after all tasks are inserted)
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-1.1')] WHERE task_number = 'AQ-2.1';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-1.1'), (SELECT id FROM implementation_tasks WHERE task_number = 'AQ-1.2')] WHERE task_number = 'AQ-2.2';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-2.2')] WHERE task_number = 'AQ-2.3';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-2.2')] WHERE task_number = 'AQ-3.1';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-3.1')] WHERE task_number = 'AQ-3.2';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-3.1')] WHERE task_number = 'AQ-3.3';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-2.1')] WHERE task_number = 'AQ-4.1';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-2.2')] WHERE task_number = 'AQ-4.2';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-4.1')] WHERE task_number = 'AQ-4.3';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-2.3')] WHERE task_number = 'AQ-4.4';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-4.1')] WHERE task_number = 'AQ-4.5';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-2.1'), (SELECT id FROM implementation_tasks WHERE task_number = 'AQ-2.2'), (SELECT id FROM implementation_tasks WHERE task_number = 'AQ-2.3')] WHERE task_number = 'AQ-5.1';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-5.1')] WHERE task_number = 'AQ-5.2';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-5.2')] WHERE task_number = 'AQ-5.3';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-5.2')] WHERE task_number = 'AQ-5.4';
UPDATE implementation_tasks SET depends_on = ARRAY[(SELECT id FROM implementation_tasks WHERE task_number = 'AQ-5.4')] WHERE task_number = 'AQ-5.5';