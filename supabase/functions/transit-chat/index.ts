import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for the AI to use
const tools = [
  {
    type: "function",
    function: {
      name: "search_agencies",
      description: "Search for transit agencies by name, state, city, or other criteria. Returns agency details including name, location, fleet size, and service area.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query - agency name, state abbreviation, or city name"
          },
          state: {
            type: "string",
            description: "Optional: Filter by state (2-letter code like CA, NY, TX)"
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default 10)"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_agency_details",
      description: "Get detailed information about a specific transit agency including contacts, software, and related articles.",
      parameters: {
        type: "object",
        properties: {
          agency_id: {
            type: "string",
            description: "The UUID of the agency to get details for"
          },
          agency_name: {
            type: "string",
            description: "Alternatively, the name of the agency to look up"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_providers",
      description: "Search for service providers (contractors that operate transit services) by name, type, or location. You can search by name, filter by provider_type, or both.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Optional: Search query for provider name"
          },
          provider_type: {
            type: "string",
            description: "Optional: Filter by exact provider type (e.g., 'operator', 'technology', 'tnc', 'other')"
          },
          limit: {
            type: "number",
            description: "Maximum number of results (default 10)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_agency_contracts",
      description: "Get information about contracts between transit agencies and service providers, including contract values and service details.",
      parameters: {
        type: "object",
        properties: {
          agency_name: {
            type: "string",
            description: "Name of the transit agency"
          },
          provider_name: {
            type: "string",
            description: "Name of the service provider"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_articles",
      description: "Search news articles about transit agencies and providers.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for article content or title"
          },
          agency_name: {
            type: "string",
            description: "Filter articles mentioning a specific agency"
          },
          limit: {
            type: "number",
            description: "Maximum number of results (default 5)"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_statistics",
      description: "Get aggregate statistics about transit agencies, such as total count by state, average fleet sizes, etc.",
      parameters: {
        type: "object",
        properties: {
          metric: {
            type: "string",
            enum: ["agencies_by_state", "largest_agencies", "total_fleet_size", "agencies_by_type"],
            description: "The type of statistic to retrieve"
          },
          state: {
            type: "string",
            description: "Optional state filter"
          }
        },
        required: ["metric"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "compare_agencies",
      description: "Compare two or more transit agencies on metrics like fleet size, service area, and operational efficiency.",
      parameters: {
        type: "object",
        properties: {
          agency_names: {
            type: "array",
            items: { type: "string" },
            description: "List of agency names to compare"
          }
        },
        required: ["agency_names"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web for current information about transit topics, news, regulations, or industry trends not in the database. Use this for recent news, external information, or topics not covered in the database.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for web search"
          },
          num_results: {
            type: "number",
            description: "Number of results to return (default 5)"
          }
        },
        required: ["query"]
      }
    }
  }
];

// Tool execution functions
async function executeSearchAgencies(supabase: any, args: any) {
  const { query, state, limit = 10 } = args;
  
  let dbQuery = supabase
    .from("transit_agencies")
    .select("id, agency_name, doing_business_as, city, state, total_voms, service_area_pop, organization_type, url")
    .order("total_voms", { ascending: false, nullsFirst: false })
    .limit(limit);
  
  if (state) {
    dbQuery = dbQuery.eq("state", state.toUpperCase());
  }
  
  if (query) {
    dbQuery = dbQuery.or(`agency_name.ilike.%${query}%,doing_business_as.ilike.%${query}%,city.ilike.%${query}%`);
  }
  
  const { data, error } = await dbQuery;
  if (error) throw error;
  
  return {
    results: data,
    count: data?.length || 0,
    source: "transit_agencies table"
  };
}

async function executeGetAgencyDetails(supabase: any, args: any) {
  const { agency_id, agency_name } = args;
  
  let query = supabase
    .from("transit_agencies")
    .select("*");
  
  if (agency_id) {
    query = query.eq("id", agency_id);
  } else if (agency_name) {
    query = query.or(`agency_name.ilike.%${agency_name}%,doing_business_as.ilike.%${agency_name}%`);
  }
  
  const { data: agency, error } = await query.limit(1).single();
  if (error) throw error;
  
  // Get related articles
  const { data: articleLinks } = await supabase
    .from("article_agencies")
    .select("article_id, articles(id, title, slug, published_at)")
    .eq("agency_id", agency.id)
    .limit(5);
  
  // Get contracts/providers
  const { data: contracts } = await supabase
    .from("transportation_providers")
    .select("*")
    .eq("agency_id", agency.id)
    .limit(10);
  
  return {
    agency,
    related_articles: articleLinks?.map((l: any) => l.articles).filter(Boolean) || [],
    contracts: contracts || [],
    source: "transit_agencies, article_agencies, transportation_providers tables"
  };
}

async function executeSearchProviders(supabase: any, args: any) {
  const { query, provider_type, limit = 10 } = args;
  
  let dbQuery = supabase
    .from("agency_vendors")
    .select("id, name, provider_type, location, website, state, city, total_operating_expenses, unlinked_passenger_trips")
    .order("total_operating_expenses", { ascending: false, nullsFirst: false })
    .limit(limit);
  
  // Allow searching by name OR provider_type (or both)
  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }
  
  if (provider_type) {
    // Use exact match for provider_type to properly filter
    dbQuery = dbQuery.eq("provider_type", provider_type);
  }
  
  const { data, error } = await dbQuery;
  if (error) throw error;
  
  return {
    results: data,
    count: data?.length || 0,
    source: "agency_vendors table"
  };
}

async function executeGetAgencyContracts(supabase: any, args: any) {
  const { agency_name, provider_name } = args;
  
  let query = supabase
    .from("transportation_providers")
    .select("*, transit_agencies!inner(agency_name, doing_business_as)")
    .limit(20);
  
  if (agency_name) {
    query = query.or(`agency_name.ilike.%${agency_name}%,transit_agencies.agency_name.ilike.%${agency_name}%,transit_agencies.doing_business_as.ilike.%${agency_name}%`);
  }
  
  if (provider_name) {
    query = query.ilike("contractee_operator_name", `%${provider_name}%`);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return {
    contracts: data,
    count: data?.length || 0,
    source: "transportation_providers table"
  };
}

async function executeSearchArticles(supabase: any, args: any) {
  const { query, agency_name, limit = 5 } = args;
  
  let dbQuery = supabase
    .from("articles")
    .select("id, title, slug, description, published_at, source_name")
    .order("published_at", { ascending: false })
    .limit(limit);
  
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`);
  }
  
  const { data, error } = await dbQuery;
  if (error) throw error;
  
  return {
    articles: data,
    count: data?.length || 0,
    source: "articles table"
  };
}

async function executeGetStatistics(supabase: any, args: any) {
  const { metric, state } = args;
  
  switch (metric) {
    case "agencies_by_state": {
      const { data } = await supabase
        .from("transit_agencies")
        .select("state")
        .not("state", "is", null);
      
      const counts: Record<string, number> = {};
      data?.forEach((a: any) => {
        counts[a.state] = (counts[a.state] || 0) + 1;
      });
      
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
      
      return { 
        statistics: Object.fromEntries(sorted), 
        total_agencies: data?.length,
        source: "transit_agencies table aggregation" 
      };
    }
    
    case "largest_agencies": {
      let query = supabase
        .from("transit_agencies")
        .select("agency_name, doing_business_as, state, total_voms, service_area_pop")
        .not("total_voms", "is", null)
        .order("total_voms", { ascending: false })
        .limit(15);
      
      if (state) {
        query = query.eq("state", state.toUpperCase());
      }
      
      const { data } = await query;
      return { 
        largest_agencies: data, 
        source: "transit_agencies table ordered by fleet size (VOMS)" 
      };
    }
    
    case "total_fleet_size": {
      let query = supabase
        .from("transit_agencies")
        .select("total_voms, state");
      
      if (state) {
        query = query.eq("state", state.toUpperCase());
      }
      
      const { data } = await query;
      const total = data?.reduce((sum: number, a: any) => sum + (a.total_voms || 0), 0);
      
      return { 
        total_fleet_size: total, 
        agency_count: data?.length,
        source: "transit_agencies table sum of VOMS" 
      };
    }
    
    case "agencies_by_type": {
      const { data } = await supabase
        .from("transit_agencies")
        .select("organization_type")
        .not("organization_type", "is", null);
      
      const counts: Record<string, number> = {};
      data?.forEach((a: any) => {
        counts[a.organization_type] = (counts[a.organization_type] || 0) + 1;
      });
      
      return { 
        by_type: counts, 
        source: "transit_agencies table aggregation by organization_type" 
      };
    }
    
    default:
      return { error: "Unknown metric" };
  }
}

async function executeCompareAgencies(supabase: any, args: any) {
  const { agency_names } = args;
  
  const agencies = [];
  for (const name of agency_names) {
    const { data } = await supabase
      .from("transit_agencies")
      .select("agency_name, doing_business_as, state, city, total_voms, service_area_pop, service_area_sq_miles, organization_type")
      .or(`agency_name.ilike.%${name}%,doing_business_as.ilike.%${name}%`)
      .limit(1)
      .single();
    
    if (data) agencies.push(data);
  }
  
  return {
    comparison: agencies,
    metrics_compared: ["total_voms (fleet size)", "service_area_pop", "service_area_sq_miles"],
    source: "transit_agencies table"
  };
}

async function executeWebSearch(args: any) {
  const { query, num_results = 5 } = args;
  
  const EXA_API_KEY = Deno.env.get("EXA_API_KEY");
  if (!EXA_API_KEY) {
    return { 
      error: "Web search not configured",
      results: [],
      source: "web search unavailable"
    };
  }
  
  try {
    const response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EXA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `${query} transit public transportation`,
        numResults: num_results,
        type: "neural",
        useAutoprompt: true,
        contents: {
          text: { maxCharacters: 500 }
        }
      })
    });
    
    if (!response.ok) {
      console.error("Exa search error:", response.status);
      return { error: "Web search failed", results: [], source: "web search" };
    }
    
    const data = await response.json();
    const results = data.results?.map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.text?.substring(0, 300),
      published: r.publishedDate
    })) || [];
    
    return {
      results,
      count: results.length,
      source: "web search (Exa)"
    };
  } catch (error) {
    console.error("Web search error:", error);
    return { error: "Web search failed", results: [], source: "web search" };
  }
}

async function executeTool(supabase: any, toolName: string, args: any) {
  console.log(`Executing tool: ${toolName}`, args);
  
  switch (toolName) {
    case "search_agencies":
      return await executeSearchAgencies(supabase, args);
    case "get_agency_details":
      return await executeGetAgencyDetails(supabase, args);
    case "search_providers":
      return await executeSearchProviders(supabase, args);
    case "get_agency_contracts":
      return await executeGetAgencyContracts(supabase, args);
    case "search_articles":
      return await executeSearchArticles(supabase, args);
    case "get_statistics":
      return await executeGetStatistics(supabase, args);
    case "compare_agencies":
      return await executeCompareAgencies(supabase, args);
    case "web_search":
      return await executeWebSearch(args);
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // Input validation
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages: must be an array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (messages.length > 100) {
      return new Response(JSON.stringify({ error: 'Too many messages: limit is 100' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate message structure
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object' || !msg.role || !msg.content) {
        return new Response(JSON.stringify({ error: 'Invalid message format: each message must have role and content' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (typeof msg.content === 'string' && msg.content.length > 50000) {
        return new Response(JSON.stringify({ error: 'Message content too long: limit is 50000 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert transit industry analyst with access to a comprehensive database of US public transit agencies and service providers, plus web search capabilities. Your role is to provide accurate, data-driven answers about transit agencies, their operations, contractors, and industry trends.

CRITICAL FORMATTING RULES:
- DO NOT use any markdown formatting in your responses
- DO NOT use asterisks (*) for bold or italics
- DO NOT use hash symbols (#) for headers
- Use plain text only with natural sentence structure
- Use numbered lists (1. 2. 3.) or dashes (-) for lists
- Separate sections with blank lines

IMPORTANT GUIDELINES:
1. ALWAYS use the available tools to search the database before answering questions about specific agencies, providers, or statistics.
2. When you retrieve data, cite the source (e.g., "According to our transit agencies database...").
3. If data is not available in the database, use the web_search tool to find current information.
4. Provide specific numbers, names, and details from the data when available.
5. For comparisons, use the compare_agencies tool.
6. For aggregate statistics, use the get_statistics tool.
7. For current news or external information, use the web_search tool.
8. Be concise but thorough. Include relevant context from the data.

Available data includes:
- Transit agency profiles (name, location, fleet size, service area, organization type)
- Service provider/contractor information  
- Contract relationships between agencies and providers
- News articles about transit agencies
- Operational metrics and statistics
- Web search for current news and external information

When presenting results:
- List specific agencies/providers with their key metrics
- Include location (city, state) for context
- Mention fleet size (VOMS) when relevant
- Cite the data source
- Use plain text formatting only`;

    // Initial API call with tools
    let response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    let data = await response.json();
    let assistantMessage = data.choices[0].message;
    
    const toolResults: any[] = [];
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    // Handle tool calls iteratively
    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log("Processing tool calls:", assistantMessage.tool_calls.length);
      
      conversationMessages.push(assistantMessage);
      
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing tool: ${toolName}`, toolArgs);
        const result = await executeTool(supabase, toolName, toolArgs);
        
        toolResults.push({
          tool: toolName,
          args: toolArgs,
          result
        });
        
        conversationMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }
      
      // Get next response after tool execution
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: conversationMessages,
          tools,
          tool_choice: "auto",
        }),
      });

      if (!response.ok) {
        throw new Error(`AI gateway error on tool response: ${response.status}`);
      }

      data = await response.json();
      assistantMessage = data.choices[0].message;
    }

    // Return final response with citations
    return new Response(JSON.stringify({
      content: assistantMessage.content,
      toolsUsed: toolResults.map(t => ({
        tool: t.tool,
        args: t.args,
        resultCount: t.result.count || t.result.results?.length || (t.result.contracts?.length) || 1
      })),
      sources: [...new Set(toolResults.map(t => t.result.source).filter(Boolean))]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Transit chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
