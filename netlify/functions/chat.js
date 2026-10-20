// Conserva el endpoint anterior y reutiliza la misma IA que Cloudflare.
exports.handler = async (event) => {
  const { handleChat } = await import('../../server/chat.mjs');
  return handleChat({
    method: event.httpMethod,
    body: event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '',
    env: process.env
  });
};
