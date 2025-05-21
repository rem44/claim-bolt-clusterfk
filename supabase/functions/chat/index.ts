import { OpenAIStream, StreamingTextResponse } from 'npm:ai@3.0.0';
import { Configuration, OpenAIApi } from 'npm:openai-edge@1.2.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const configuration = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});
const openai = new OpenAIApi(configuration);

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

    // Create the system message
    const systemMessage = {
      role: 'system',
      content: `You are Shawn-Bot, a knowledgeable assistant for Venture Claims Management.
You help users with technical details, installation guidelines, warranty information, and maintenance guidance for carpet and flooring products.
Be professional, concise, and helpful. If you're not sure about something, say so.

You have expertise in:
- Product specifications and technical details
- Installation procedures and best practices
- Warranty terms and conditions
- Maintenance guidelines and cleaning procedures
- Troubleshooting common issues

When providing information:
1. Be specific and accurate
2. Reference industry standards when applicable
3. Provide step-by-step instructions when needed
4. Suggest preventive measures when relevant`
    };

    // Get the completion from OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Convert the response to a streaming response
    const stream = OpenAIStream(response);

    // Return the streaming response with CORS headers
    return new StreamingTextResponse(stream, { headers: corsHeaders });
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