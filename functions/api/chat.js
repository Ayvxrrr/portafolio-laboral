import { handleChat } from '../../server/chat.mjs';

// Cloudflare inyecta GEMINI_API_KEY como secreto en env, no en el JavaScript público.
export async function onRequest({ request, env }) {
  const result = await handleChat({
    method: request.method,
    body: request.method === 'POST' ? await request.text() : '',
    env
  });
  return new Response(result.body, { status: result.statusCode, headers: result.headers });
}
