import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { OpenAI } from 'npm:openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Get the request body
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request body', {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Get relevant context from the database based on the user's question
    const latestMessage = messages[messages.length - 1].content.toLowerCase();
    let context = '';

    if (latestMessage.includes('product') || latestMessage.includes('carpet')) {
      const { data: products } = await supabaseClient
        .from('products')
        .select('*')
        .limit(5);
      
      if (products) {
        context += '\nProduct information:\n' + JSON.stringify(products, null, 2);
      }
    }

    if (latestMessage.includes('claim') || latestMessage.includes('warranty')) {
      const { data: claims } = await supabaseClient
        .from('claims')
        .select(`
          *,
          client:clients(name)
        `)
        .limit(5);
      
      if (claims) {
        context += '\nClaim information:\n' + JSON.stringify(claims, null, 2);
      }
    }

    // Prepare the messages for OpenAI
    const systemPrompt = `You are Shawn-Bot, a knowledgeable assistant for Venture Claims Management.
You help users with technical details, installation guidelines, warranty information, and maintenance guidance for carpet and flooring products.
Be professional, concise, and helpful. If you're not sure about something, say so.

Here is some context from our database that might be relevant:
${context}`;

    const apiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // Get the response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Return the response
    return new Response(
      JSON.stringify({
        message: completion.choices[0].message.content,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});