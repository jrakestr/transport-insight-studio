import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// LinUCB hyperparameters
const ALPHA = 0.3; // Exploration bonus
const BETA = 0.5;  // Novelty bonus
const MIN_SCORE_THRESHOLD = 70; // Topic exhaustion threshold
const MAX_CANDIDATES = 50;
const FEATURE_DIM = 12; // Number of features per query

interface LearningState {
  id: string;
  context_key: string;
  theta: number[];
  a_matrix: number[][];
  proven_patterns: string[];
  effective_terms: Record<string, number>;
  exhausted_topics: string[];
  total_queries: number;
  avg_reward: number;
}

interface QueryCandidate {
  query: string;
  features: number[];
  predicted_reward: number;
  uncertainty: number;
  novelty_score: number;
  ucb_score: number;
  template_source?: string;
}

interface GenerateQueryRequest {
  context: {
    agency_id?: string;
    agency_name?: string;
    topic?: string;
    location?: string;
  };
  exploration_weight?: number; // Override ALPHA
  novelty_weight?: number;     // Override BETA
}

// Query templates for candidate generation
const QUERY_TEMPLATES = [
  { template: '[agency] [vehicle] contract award', exploration_level: 'exploit' },
  { template: '[agency] [vehicle] [event]', exploration_level: 'balanced' },
  { template: '[agency] [topic] announcement', exploration_level: 'balanced' },
  { template: '[location] transit [topic]', exploration_level: 'balanced' },
  { template: '[agency] RFP [vehicle] [service]', exploration_level: 'exploit' },
  { template: '[agency] [technology] implementation', exploration_level: 'explore' },
  { template: '[agency] [policy] changes', exploration_level: 'explore' },
  { template: '[location] transportation [challenge]', exploration_level: 'explore' },
];

const VEHICLE_TYPES = ['bus', 'paratransit', 'microtransit', 'shuttle', 'van', 'minibus'];
const EVENT_TYPES = ['contract', 'award', 'procurement', 'RFP', 'bid', 'tender', 'agreement'];
const SERVICE_TYPES = ['maintenance', 'operations', 'management', 'repair', 'cleaning'];
const TECHNOLOGY_TYPES = ['electric', 'autonomous', 'contactless payment', 'GPS', 'real-time tracking'];
const POLICY_TYPES = ['fare', 'service expansion', 'route optimization', 'accessibility'];
const CHALLENGES = ['funding', 'expansion', 'ridership', 'efficiency', 'sustainability'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: GenerateQueryRequest = await req.json();

    console.log('Generating adaptive query for context:', body.context);

    // Build context key
    const contextKey = body.context.agency_id 
      ? `agency:${body.context.agency_id}`
      : body.context.topic 
        ? `topic:${body.context.topic}`
        : 'global';

    // Load or initialize learning state
    let state = await loadLearningState(supabase, contextKey);
    if (!state) {
      console.log('Initializing new learning state for:', contextKey);
      state = await initializeLearningState(supabase, contextKey);
    }

    console.log(`Learning state loaded: ${state.total_queries} queries executed, avg reward: ${state.avg_reward}`);

    // Generate candidate queries
    const candidates = generateCandidates(body.context, state);
    console.log(`Generated ${candidates.length} candidate queries`);

    // Score all candidates using LinUCB + novelty
    const alpha = body.exploration_weight ?? ALPHA;
    const beta = body.novelty_weight ?? BETA;
    
    const scoredCandidates: QueryCandidate[] = [];
    for (const candidate of candidates) {
      const features = extractFeatures(candidate, state);
      const predicted_reward = dotProduct(state.theta, features);
      const uncertainty = calculateUncertainty(features, state.a_matrix);
      const novelty_score = await calculateNovelty(supabase, candidate, state.context_key);
      
      const ucb_score = predicted_reward + (alpha * uncertainty) + (beta * novelty_score);

      scoredCandidates.push({
        query: candidate,
        features,
        predicted_reward,
        uncertainty,
        novelty_score,
        ucb_score,
      });
    }

    // Select best query
    scoredCandidates.sort((a, b) => b.ucb_score - a.ucb_score);
    const bestQuery = scoredCandidates[0];

    console.log(`Selected query: "${bestQuery.query}"`);
    console.log(`  Predicted reward: ${bestQuery.predicted_reward.toFixed(2)}`);
    console.log(`  Uncertainty: ${bestQuery.uncertainty.toFixed(2)}`);
    console.log(`  Novelty: ${bestQuery.novelty_score.toFixed(2)}`);
    console.log(`  UCB score: ${bestQuery.ucb_score.toFixed(2)}`);

    // Log execution
    await supabase.from('query_execution_log').insert({
      learning_state_id: state.id,
      query_text: bestQuery.query,
      query_features: bestQuery.features,
      predicted_reward: bestQuery.predicted_reward,
      uncertainty: bestQuery.uncertainty,
      novelty_score: bestQuery.novelty_score,
      ucb_score: bestQuery.ucb_score,
    });

    return new Response(
      JSON.stringify({
        success: true,
        query: bestQuery.query,
        metadata: {
          predicted_reward: bestQuery.predicted_reward,
          uncertainty: bestQuery.uncertainty,
          novelty_score: bestQuery.novelty_score,
          ucb_score: bestQuery.ucb_score,
          exploration_level: bestQuery.uncertainty > 1.0 ? 'high' : bestQuery.novelty_score > 0.7 ? 'medium' : 'low',
          context_key: contextKey,
          total_queries_executed: state.total_queries,
        },
        top_alternatives: scoredCandidates.slice(1, 4).map(c => ({
          query: c.query,
          ucb_score: c.ucb_score,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating adaptive query:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function loadLearningState(supabase: any, contextKey: string): Promise<LearningState | null> {
  const { data, error } = await supabase
    .from('query_learning_state')
    .select('*')
    .eq('context_key', contextKey)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    context_key: data.context_key,
    theta: data.theta || Array(FEATURE_DIM).fill(0),
    a_matrix: data.a_matrix || createIdentityMatrix(FEATURE_DIM),
    proven_patterns: data.proven_patterns || [],
    effective_terms: data.effective_terms || {},
    exhausted_topics: data.exhausted_topics || [],
    total_queries: data.total_queries || 0,
    avg_reward: data.avg_reward || 0,
  };
}

async function initializeLearningState(supabase: any, contextKey: string): Promise<LearningState> {
  const initialTheta = Array(FEATURE_DIM).fill(0);
  const initialA = createIdentityMatrix(FEATURE_DIM);

  const { data, error } = await supabase
    .from('query_learning_state')
    .insert({
      context_key: contextKey,
      theta: initialTheta,
      a_matrix: initialA,
      proven_patterns: [],
      effective_terms: {},
      exhausted_topics: [],
      total_queries: 0,
      avg_reward: 0,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    context_key: contextKey,
    theta: initialTheta,
    a_matrix: initialA,
    proven_patterns: [],
    effective_terms: {},
    exhausted_topics: [],
    total_queries: 0,
    avg_reward: 0,
  };
}

function generateCandidates(context: any, state: LearningState): string[] {
  const candidates: string[] = [];
  const agencyName = context.agency_name || '';
  const location = context.location || '';
  const topic = context.topic || '';

  // Strategy 1: Template-based generation (70% of candidates)
  for (const template of QUERY_TEMPLATES) {
    let query = template.template;

    // Replace placeholders
    if (query.includes('[agency]') && agencyName) {
      query = query.replace('[agency]', agencyName);
    }
    if (query.includes('[location]') && location) {
      query = query.replace('[location]', location);
    }
    if (query.includes('[topic]') && topic) {
      query = query.replace('[topic]', topic);
    }

    // Replace vehicle types
    if (query.includes('[vehicle]')) {
      for (const vehicle of VEHICLE_TYPES.slice(0, 3)) {
        candidates.push(query.replace('[vehicle]', vehicle));
      }
    }

    // Replace event types
    if (query.includes('[event]')) {
      for (const event of EVENT_TYPES.slice(0, 3)) {
        candidates.push(query.replace('[event]', event));
      }
    }

    // Replace service types
    if (query.includes('[service]')) {
      for (const service of SERVICE_TYPES.slice(0, 2)) {
        candidates.push(query.replace('[service]', service));
      }
    }

    // Replace technology types
    if (query.includes('[technology]')) {
      for (const tech of TECHNOLOGY_TYPES.slice(0, 2)) {
        candidates.push(query.replace('[technology]', tech));
      }
    }

    // Replace policy types
    if (query.includes('[policy]')) {
      for (const policy of POLICY_TYPES.slice(0, 2)) {
        candidates.push(query.replace('[policy]', policy));
      }
    }

    // Replace challenges
    if (query.includes('[challenge]')) {
      for (const challenge of CHALLENGES.slice(0, 2)) {
        candidates.push(query.replace('[challenge]', challenge));
      }
    }
  }

  // Strategy 2: Pattern-based generation from proven_patterns (20% of candidates)
  for (const pattern of state.proven_patterns.slice(0, 5)) {
    // Apply pattern with variations
    if (agencyName) {
      candidates.push(pattern.replace('[agency]', agencyName));
    }
  }

  // Strategy 3: Term substitution from effective_terms (10% of candidates)
  const effectiveTermsList = Object.entries(state.effective_terms)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([term]) => term);

  if (agencyName && effectiveTermsList.length > 0) {
    for (const term of effectiveTermsList) {
      candidates.push(`${agencyName} ${term}`);
    }
  }

  // Remove duplicates and filter out exhausted topics
  const uniqueCandidates = [...new Set(candidates)]
    .filter(q => !isExhausted(q, state.exhausted_topics))
    .slice(0, MAX_CANDIDATES);

  return uniqueCandidates;
}

function extractFeatures(query: string, state: LearningState): number[] {
  const features: number[] = [];
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/);

  // Feature 1: Query length (normalized)
  features.push(Math.min(words.length / 10, 1));

  // Feature 2: Contains agency name (0 or 1)
  features.push(words.some(w => w.length > 5 && /[A-Z]/.test(query)) ? 1 : 0);

  // Feature 3: Contains vehicle type
  features.push(VEHICLE_TYPES.some(v => queryLower.includes(v)) ? 1 : 0);

  // Feature 4: Contains event type (contract, RFP, etc.)
  features.push(EVENT_TYPES.some(e => queryLower.includes(e.toLowerCase())) ? 1 : 0);

  // Feature 5: Specificity score (number of specific terms)
  const specificTerms = [...VEHICLE_TYPES, ...EVENT_TYPES, ...SERVICE_TYPES].filter(t => 
    queryLower.includes(t.toLowerCase())
  );
  features.push(Math.min(specificTerms.length / 3, 1));

  // Feature 6: Contains proven effective terms
  const effectiveTermScore = words.reduce((sum, word) => {
    return sum + (state.effective_terms[word] || 0);
  }, 0) / words.length;
  features.push(Math.min(effectiveTermScore / 100, 1));

  // Feature 7: Matches proven pattern
  const matchesPattern = state.proven_patterns.some(p => 
    similarityScore(query, p) > 0.6
  );
  features.push(matchesPattern ? 1 : 0);

  // Feature 8: Contains technology terms
  features.push(TECHNOLOGY_TYPES.some(t => queryLower.includes(t)) ? 1 : 0);

  // Feature 9: Contains policy terms
  features.push(POLICY_TYPES.some(p => queryLower.includes(p)) ? 1 : 0);

  // Feature 10: Query diversity (unique word ratio)
  const uniqueWords = new Set(words);
  features.push(uniqueWords.size / words.length);

  // Feature 11: Contains service type
  features.push(SERVICE_TYPES.some(s => queryLower.includes(s)) ? 1 : 0);

  // Feature 12: Temporal relevance (contains time-based keywords)
  const temporalKeywords = ['2024', '2025', 'recent', 'upcoming', 'new', 'latest'];
  features.push(temporalKeywords.some(t => queryLower.includes(t)) ? 1 : 0);

  return features;
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function calculateUncertainty(features: number[], aMatrix: number[][]): number {
  // Calculate √(x^T * A^-1 * x)
  const aInv = invertMatrix(aMatrix);
  const aInvX = matrixVectorMultiply(aInv, features);
  const uncertainty = Math.sqrt(Math.max(0, dotProduct(features, aInvX)));
  return uncertainty;
}

async function calculateNovelty(supabase: any, query: string, contextKey: string): Promise<number> {
  // Fetch recent queries for this context
  const { data: recentQueries } = await supabase
    .from('query_execution_log')
    .select('query_text')
    .eq('learning_state_id', contextKey)
    .order('executed_at', { ascending: false })
    .limit(20);

  if (!recentQueries || recentQueries.length === 0) {
    return 1.0; // Completely novel if no history
  }

  // Calculate maximum similarity to any past query
  const similarities = recentQueries.map((r: any) => 
    similarityScore(query, r.query_text)
  );
  const maxSimilarity = Math.max(...similarities);

  return 1.0 - maxSimilarity;
}

function similarityScore(query1: string, query2: string): number {
  // Simple Jaccard similarity on word sets
  const words1 = new Set(query1.toLowerCase().split(/\s+/));
  const words2 = new Set(query2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

function isExhausted(query: string, exhaustedTopics: string[]): boolean {
  const queryLower = query.toLowerCase();
  return exhaustedTopics.some(topic => queryLower.includes(topic.toLowerCase()));
}

function createIdentityMatrix(dim: number): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < dim; i++) {
    matrix[i] = [];
    for (let j = 0; j < dim; j++) {
      matrix[i][j] = i === j ? 1 : 0;
    }
  }
  return matrix;
}

function matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
  return matrix.map(row => dotProduct(row, vector));
}

function invertMatrix(matrix: number[][]): number[][] {
  // For simplicity, using a basic inversion for small matrices
  // In production, use a proper linear algebra library
  const n = matrix.length;
  const identity = createIdentityMatrix(n);
  const augmented: number[][] = matrix.map((row, i) => [...row, ...identity[i]]);

  // Gaussian elimination (simplified)
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Make diagonal 1
    const pivot = augmented[i][i];
    if (Math.abs(pivot) < 1e-10) continue; // Skip singular matrices
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }

    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  // Extract inverse from augmented matrix
  return augmented.map(row => row.slice(n));
}
