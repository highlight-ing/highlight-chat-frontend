import { OpenAIStream, StreamingTextResponse } from 'ai';

const API_URL = 'https://highlight-chat-backend-fq27dri5ra-ue.a.run.app';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const prompt = messages[messages.length - 1].content;

  const response = await fetch(`${API_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      context,
      // You can add sessionId and topic if needed
    }),
  });

  const data = response.body;

  if (!data) {
    return new Response('No data received', { status: 500 });
  }

  // Forward the streaming response
  return new StreamingTextResponse(data);
}

// New function to handle LLM comparison
export async function compareLLMs(prompt: string, context: string) {
  const response = await fetch(`${API_URL}/compare-llms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      context,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to compare LLMs');
  }

  return response.json();
}