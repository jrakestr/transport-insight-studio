import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, content, existingImageUrl } = await req.json();

    // If there's already a valid image URL, return it
    if (existingImageUrl && existingImageUrl.startsWith('http')) {
      console.log('Using existing image URL:', existingImageUrl);
      return new Response(
        JSON.stringify({ success: true, imageUrl: existingImageUrl, source: 'existing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to extract image from content (markdown/html)
    const extractedImage = extractImageFromContent(content || '');
    if (extractedImage) {
      console.log('Extracted image from content:', extractedImage);
      return new Response(
        JSON.stringify({ success: true, imageUrl: extractedImage, source: 'extracted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate image using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating image for article:', title);

    // Create a prompt based on the article
    const imagePrompt = createImagePrompt(title, description);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: imagePrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI image generation failed:', errorText);
      throw new Error('Failed to generate image');
    }

    const aiData = await response.json();
    const generatedImage = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      throw new Error('No image generated');
    }

    console.log('Successfully generated image');

    return new Response(
      JSON.stringify({ success: true, imageUrl: generatedImage, source: 'generated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractImageFromContent(content: string): string | null {
  // Try markdown image syntax: ![alt](url)
  const markdownMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (markdownMatch) {
    return markdownMatch[1];
  }

  // Try HTML img tag: <img src="url">
  const htmlMatch = content.match(/<img[^>]+src=["']?(https?:\/\/[^\s"'>]+)["']?/i);
  if (htmlMatch) {
    return htmlMatch[1];
  }

  // Try bare URL that looks like an image
  const urlMatch = content.match(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/i);
  if (urlMatch) {
    return urlMatch[1];
  }

  return null;
}

function createImagePrompt(title: string, description: string | null): string {
  const context = description || title;
  
  // Identify key themes for the image
  const isElectricBus = /electric|ev|battery|zero.?emission/i.test(context);
  const isAutonomous = /autonomous|self.?driving|automated/i.test(context);
  const isRail = /rail|train|metro|subway|light.?rail/i.test(context);
  const isBus = /bus|transit|paratransit/i.test(context);
  const isTechnology = /software|app|platform|digital|technology|ai|data/i.test(context);
  const isContract = /contract|rfp|award|procurement|bid/i.test(context);
  const isFunding = /grant|fund|billion|million|invest/i.test(context);

  let subject = 'modern public transit';
  
  if (isElectricBus) subject = 'modern electric bus at a charging station';
  else if (isAutonomous) subject = 'autonomous transit vehicle in urban setting';
  else if (isRail) subject = 'modern light rail train at station';
  else if (isBus) subject = 'modern city bus on urban street';
  else if (isTechnology) subject = 'transit technology dashboard with data visualization';
  else if (isContract || isFunding) subject = 'transit infrastructure with urban skyline';

  return `Generate a professional, photorealistic hero image for a transit industry news article. 
Subject: ${subject}
Style: Clean, modern, professional photography style with good lighting.
Composition: 16:9 aspect ratio, suitable for a news article header.
Colors: Vibrant but professional, emphasizing innovation and modernity.
No text or logos in the image.`;
}
