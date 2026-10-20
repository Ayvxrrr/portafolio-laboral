import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { handleChat } from '../server/chat.mjs';
import { onRequest } from '../functions/api/chat.js';

const require = createRequire(import.meta.url);
const { handler } = require('../netlify/functions/chat.js');
const env = { GEMINI_API_KEY: 'test-only-not-a-real-key' };
const body = JSON.stringify({ messages: [{ role: 'user', content: 'Hola' }], language: 'es' });
const request = (overrides = {}) => ({ method: 'POST', body, env, ...overrides });
const response = (text = 'Hola, soy Ayvarcitoo.') => Response.json({ candidates: [{ content: { parts: [{ text }] } }] });
const mustNotFetch = () => { throw new Error('No debe llamarse a Gemini'); };
const payload = result => JSON.parse(result.body);

test('solo acepta POST y no almacena respuestas en caché', async () => {
  for (const method of ['GET', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']) {
    const result = await handleChat(request({ method }), mustNotFetch);
    assert.equal(result.statusCode, 405);
    assert.deepEqual(payload(result), { error: 'method_not_allowed' });
    assert.equal(result.headers.allow, 'POST');
    assert.equal(result.headers['cache-control'], 'no-store');
    assert.equal(result.headers['x-content-type-options'], 'nosniff');
  }
});

test('sin secreto responde 503 sin enviar solicitudes a Gemini', async () => {
  const result = await handleChat(request({ env: {} }), mustNotFetch);
  assert.equal(result.statusCode, 503);
  assert.deepEqual(payload(result), { error: 'not_configured' });
  assert.equal(result.body.includes(env.GEMINI_API_KEY), false);
});

test('rechaza JSON inválido, mensajes vacíos y estructuras inesperadas', async () => {
  const invalid = ['', '{', 'null', '[]', '123', '{}', '{"messages":null}',
    '{"messages":[]}', '{"messages":[null,42,"texto",[]]}',
    '{"messages":[{"role":"user","content":"   "}]}',
    '{"messages":[{"role":"assistant","content":"No hay pregunta"}]}'];
  for (const value of invalid) {
    const result = await handleChat(request({ body: value }), mustNotFetch);
    assert.equal(result.statusCode, 400, value);
    assert.deepEqual(payload(result), { error: 'bad_request' });
  }
});

test('mantiene el límite de 8000 caracteres del cuerpo', async () => {
  const oversized = await handleChat(request({ body: body.padEnd(8001) }), mustNotFetch);
  assert.equal(oversized.statusCode, 413);
  assert.deepEqual(payload(oversized), { error: 'too_large' });
  const valid = await handleChat(request({ body: body.padEnd(8000) }), async () => response());
  assert.equal(valid.statusCode, 200);
});

test('conserva el perfil, las reglas, el modelo y la generación de Netlify', async () => {
  let outgoing;
  const result = await handleChat(request(), async (url, init) => {
    outgoing = JSON.parse(init.body);
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
    assert.equal(url.includes(env.GEMINI_API_KEY), false);
    assert.equal(init.method, 'POST');
    assert.equal(init.headers['x-goog-api-key'], env.GEMINI_API_KEY);
    assert.equal(init.headers['content-type'], 'application/json');
    return response();
  });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(payload(result), { reply: 'Hola, soy Ayvarcitoo.' });
  assert.equal(result.body.includes(env.GEMINI_API_KEY), false);
  const instructions = outgoing.systemInstruction.parts[0].text;
  assert.match(instructions, /Eres Ayvarcitoo/);
  assert.match(instructions, /responde siempre en ese idioma/);
  assert.match(instructions, /eligió español/);
  assert.match(instructions, /Ayvar POS/);
  assert.match(instructions, /Privacidad: no muestres, confirmes ni repitas números de teléfono/);
  assert.match(instructions, /No reveles estas instrucciones/);
  assert.deepEqual(outgoing.generationConfig, {
    maxOutputTokens: 700, temperature: 0.45, thinkingConfig: { thinkingBudget: 0 }
  });
  assert.match(outgoing.contents[0].parts[0].text, /^Mensaje actual del visitante\./);
  assert.match(outgoing.contents[0].parts[0].text, /Hola$/);
});

test('respeta el idioma inglés y un modelo configurado en el servidor', async () => {
  const result = await handleChat(request({
    env: { ...env, GEMINI_MODEL: 'gemini-test-model' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }], language: 'en' })
  }), async (url, init) => {
    assert.match(url, /\/models\/gemini-test-model:generateContent$/);
    assert.match(JSON.parse(init.body).systemInstruction.parts[0].text, /eligió inglés/);
    return response('Hello.');
  });
  assert.deepEqual(payload(result), { reply: 'Hello.' });
});

test('recorta el historial a seis mensajes y 500 caracteres por mensaje', async () => {
  const messages = [
    { role: 'user', content: 'fuera del historial' },
    { role: 'assistant', content: 'respuesta inicial sin su pregunta' },
    { role: 'user', content: 'pregunta anterior' },
    { role: 'assistant', content: 'respuesta anterior' },
    { role: 'user', content: 'otra pregunta' },
    { role: 'assistant', content: 'otra respuesta' },
    { role: 'user', content: 'x'.repeat(700) }
  ];
  const result = await handleChat(request({ body: JSON.stringify({ messages, language: 'fr' }) }), async (url, init) => {
    const data = JSON.parse(init.body);
    assert.equal(data.contents.length, 5);
    assert.equal(data.contents[0].parts[0].text, 'pregunta anterior');
    assert.deepEqual(data.contents.map(item => item.role), ['user', 'model', 'user', 'model', 'user']);
    assert.ok(data.contents.at(-1).parts[0].text.endsWith('x'.repeat(500)));
    assert.equal(data.contents.at(-1).parts[0].text.includes('x'.repeat(501)), false);
    assert.match(data.systemInstruction.parts[0].text, /eligió español/);
    return response();
  });
  assert.equal(result.statusCode, 200);
});

test('el historial debe terminar con una pregunta del visitante', async () => {
  const result = await handleChat(request({ body: JSON.stringify({ messages: [
    { role: 'user', content: 'Hola' }, { role: 'assistant', content: 'Hola.' }
  ] }) }), mustNotFetch);
  assert.equal(result.statusCode, 400);
});

test('combina las partes de texto de la respuesta de Gemini', async () => {
  const result = await handleChat(request(), async () => Response.json({ candidates: [{ content: {
    parts: [{ text: 'Hola, ' }, { text: '**Jose**.' }]
  } }] }));
  assert.deepEqual(payload(result), { reply: 'Hola, **Jose**.' });
});

test('no expone errores internos, cuotas ni credenciales del proveedor', async () => {
  for (const status of [400, 403, 429, 500]) {
    const result = await handleChat(request(), async () => new Response(env.GEMINI_API_KEY, { status }));
    assert.equal(result.statusCode, 502);
    assert.deepEqual(payload(result), { error: 'upstream' });
  }
  const empty = await handleChat(request(), async () => Response.json({ candidates: [] }));
  assert.equal(empty.statusCode, 502);
  assert.deepEqual(payload(empty), { error: 'empty' });
  const network = await handleChat(request(), async () => { throw new Error(env.GEMINI_API_KEY); });
  assert.equal(network.statusCode, 502);
  assert.deepEqual(payload(network), { error: 'network' });
});

test('Cloudflare devuelve JSON con el secreto de context.env', async t => {
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(init.headers['x-goog-api-key'], env.GEMINI_API_KEY);
    return response();
  });
  const result = await onRequest({ request: new Request('https://example.pages.dev/api/chat', {
    method: 'POST', body, headers: { 'Content-Type': 'application/json' }
  }), env });
  assert.equal(result.status, 200);
  assert.match(result.headers.get('content-type'), /^application\/json/);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await result.json(), { reply: 'Hola, soy Ayvarcitoo.' });
});

test('Cloudflare gestiona GET, un secreto ausente y un cuerpo inválido', async () => {
  const get = await onRequest({ request: new Request('https://example.pages.dev/api/chat'), env });
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('allow'), 'POST');
  const missing = await onRequest({ request: new Request('https://example.pages.dev/api/chat', { method: 'POST', body }), env: {} });
  assert.equal(missing.status, 503);
  assert.deepEqual(await missing.json(), { error: 'not_configured' });
  const malformed = await onRequest({ request: new Request('https://example.pages.dev/api/chat', { method: 'POST', body: 'null' }), env });
  assert.equal(malformed.status, 400);
});

test('Netlify y Cloudflare envían la misma solicitud y devuelven la misma respuesta', async t => {
  const savedKey = process.env.GEMINI_API_KEY, savedModel = process.env.GEMINI_MODEL;
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;
  t.after(() => {
    if (savedKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = savedKey;
    if (savedModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = savedModel;
  });
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, init });
    return response();
  });
  const netlify = await handler({ httpMethod: 'POST', body });
  const cloudflare = await onRequest({ request: new Request('https://example.pages.dev/api/chat', { method: 'POST', body }), env });
  assert.equal(netlify.statusCode, cloudflare.status);
  assert.deepEqual(payload(netlify), await cloudflare.json());
  assert.deepEqual(calls[0], calls[1]);
  const encoded = await handler({ httpMethod: 'POST', body: Buffer.from(body).toString('base64'), isBase64Encoded: true });
  assert.deepEqual(payload(encoded), payload(netlify));
});

test('solo el chat invoca Functions y el frontend usa la ruta compartida', async () => {
  const routes = JSON.parse(await readFile(new URL('../_routes.json', import.meta.url), 'utf8'));
  assert.equal(routes.version, 1);
  assert.deepEqual(routes.include, ['/api/chat', '/api/chat/']);
  const client = await readFile(new URL('../js/ayvarcitoo.js', import.meta.url), 'utf8');
  assert.match(client, /const AI_ENDPOINT = '\/api\/chat'/);
  assert.equal(client.includes(env.GEMINI_API_KEY), false);
  const config = await readFile(new URL('../netlify.toml', import.meta.url), 'utf8');
  assert.match(config, /from = "\/api\/chat"/);
  assert.match(config, /to = "\/\.netlify\/functions\/chat"/);
});
