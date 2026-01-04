import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY_1') || Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FIRECRAWL_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('Missing required API keys');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get pending documents
    const { data: documents, error: fetchError } = await supabase
      .from('procurement_documents')
      .select('*')
      .eq('parse_status', 'pending')
      .limit(10);

    if (fetchError) throw fetchError;

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No pending documents', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${documents.length} pending documents`);

    const results: any[] = [];

    for (const doc of documents) {
      try {
        console.log(`Processing: ${doc.url}`);

        // Update status to processing
        await supabase
          .from('procurement_documents')
          .update({ parse_status: 'processing' })
          .eq('id', doc.id);

        // Use Firecrawl to scrape the document
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: doc.url,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 3000, // Wait for PDF rendering
          }),
        });

        const scrapeData = await scrapeResponse.json();

        if (!scrapeResponse.ok || !scrapeData.success) {
          console.error(`Failed to scrape ${doc.url}:`, scrapeData);
          await supabase
            .from('procurement_documents')
            .update({ 
              parse_status: 'failed',
              parse_error: scrapeData.error || 'Scrape failed'
            })
            .eq('id', doc.id);
          continue;
        }

        const content = scrapeData.data?.markdown || '';
        
        if (content.length < 50) {
          await supabase
            .from('procurement_documents')
            .update({ 
              parse_status: 'failed',
              parse_error: 'Insufficient content extracted'
            })
            .eq('id', doc.id);
          continue;
        }

        // Use AI to extract structured data from the document
        const extractedData = await extractDocumentDataWithAI(content, doc.url, LOVABLE_API_KEY);

        // Update document with extracted content
        await supabase
          .from('procurement_documents')
          .update({
            raw_content: content.substring(0, 50000), // Limit storage
            parse_status: 'completed',
            parsed_at: new Date().toISOString(),
            page_count: Math.ceil(content.length / 3000), // Rough estimate
          })
          .eq('id', doc.id);

        // If we extracted opportunity data and the document is linked to an opportunity, update it
        if (extractedData && doc.opportunity_id) {
          await supabase
            .from('procurement_opportunities')
            .update({
              extracted_data: extractedData,
              confidence_score: 0.95, // High confidence when we have document content
            })
            .eq('id', doc.opportunity_id);
        }

        // If this is a standalone document, create an opportunity from it
        if (extractedData && extractedData.title && !doc.opportunity_id) {
          const { data: newOpp } = await supabase
            .from('procurement_opportunities')
            .insert({
              agency_id: doc.agency_id,
              title: extractedData.title,
              description: extractedData.description || content.substring(0, 500),
              opportunity_type: extractedData.opportunity_type || 'document',
              source_url: doc.url,
              source_type: 'document',
              deadline: extractedData.deadline,
              estimated_value: extractedData.estimated_value,
              contact_info: extractedData.contact_info,
              extracted_data: extractedData,
              confidence_score: 0.85,
            })
            .select('id')
            .single();

          if (newOpp) {
            await supabase
              .from('procurement_documents')
              .update({ opportunity_id: newOpp.id })
              .eq('id', doc.id);
          }
        }

        results.push({ id: doc.id, url: doc.url, status: 'completed' });
        console.log(`Successfully processed: ${doc.url}`);

      } catch (docError) {
        console.error(`Error processing ${doc.url}:`, docError);
        await supabase
          .from('procurement_documents')
          .update({ 
            parse_status: 'failed',
            parse_error: docError instanceof Error ? docError.message : 'Unknown error'
          })
          .eq('id', doc.id);
        
        results.push({ id: doc.id, url: doc.url, status: 'failed', error: docError instanceof Error ? docError.message : 'Unknown' });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document processing error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper: Extract structured data from document content
async function extractDocumentDataWithAI(
  content: string,
  sourceUrl: string,
  apiKey: string
): Promise<any> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Extract procurement information from this document. Return JSON:
{
  "title": "Document/RFP title",
  "description": "Brief summary of what's being procured",
  "opportunity_type": "rfp|rfq|bid|contract|solicitation|addendum",
  "deadline": "ISO date string or null",
  "submission_deadline": "ISO date string or null",
  "estimated_value": number or null,
  "budget_range": { "min": number, "max": number } or null,
  "contact_info": { "name": "", "email": "", "phone": "", "department": "" } or null,
  "requirements": ["key requirement 1", "key requirement 2"],
  "scope_of_work": "Brief scope description",
  "evaluation_criteria": ["criterion 1", "criterion 2"],
  "contract_duration": "e.g., 3 years",
  "insurance_requirements": "e.g., $1M liability",
  "key_dates": [{ "description": "", "date": "ISO" }]
}
Return null for fields you can't determine. Focus on accuracy.`
          },
          {
            role: 'user',
            content: `Source: ${sourceUrl}\n\nDocument content:\n${content.substring(0, 20000)}`
          }
        ],
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;
    
    if (!aiContent) return null;

    // Extract JSON from response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI extraction error:', error);
    return null;
  }
}
