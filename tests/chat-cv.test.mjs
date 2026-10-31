import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/ayvarcitoo.js', import.meta.url), 'utf8');
const i18nSource = await readFile(new URL('../js/i18n.js', import.meta.url), 'utf8');
const entries = vm.runInNewContext(i18nSource.slice(i18nSource.indexOf('    const entries = '), i18nSource.indexOf('    ];') + 6) + '\nentries');
const english = new Map(entries);
const helperStart = source.indexOf('    const norm = ');
const helperEnd = source.indexOf('    const age = ', helperStart);
const cardStart = source.indexOf('    function cvAttachment()');
const cardEnd = source.indexOf('    function add(', cardStart);
const answerStart = source.indexOf('    async function answer(');
const answerEnd = source.indexOf('    async function send(', answerStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart && cardStart > helperEnd && cardEnd > cardStart && answerEnd > answerStart);

function fixture({ language = 'es', ai = 'on' } = {}) {
  const root = { lang: language, dataset: {} }, state = { calls: 0, navigations: 0 };
  const bindings = new Map();
  function element(tag) {
    const attributes = new Map(), queries = new Map();
    return {
      tagName: tag.toUpperCase(), textContent: '', innerHTML: '', children: [],
      setAttribute: (name, value) => attributes.set(name, value), getAttribute: name => attributes.get(name),
      querySelector(selector) { if (!queries.has(selector)) queries.set(selector, element('span')); return queries.get(selector); },
      append(...children) { this.children.push(...children); }, addEventListener() {}
    };
  }
  const t = value => root.lang === 'en' ? english.get(value) || value : value;
  const context = vm.createContext({
    root, ai, t, document: { createElement: element },
    $: (selector, scope) => scope?.querySelector(selector),
    i18n: { text(el, value) { bindings.set(el, value); el.textContent = t(value); } },
    A: { cv: { attachment: 'cv' } }, sections: [['proyectos','projects']], sectionLabels: { projects: 'Proyectos' },
    askAI: async () => { state.calls++; return 'Respuesta de la IA.'; },
    setTimeout() { state.navigations++; }, lessons: [], kb: [], best: () => null, FALLBACK: { a: 'Respuesta local.' }
  });
  vm.runInContext(source.slice(helperStart, helperEnd) + source.slice(cardStart, cardEnd) + source.slice(answerStart, answerEnd) + '\nglobalThis.contract = { CV_FILE, wantsCV, cvAttachment, actions, answer };', context);
  return { ...context.contract, state, context, root, setLanguage(lang) { root.lang = lang; bindings.forEach((value, el) => { el.textContent = t(value); }); } };
}

test('reconoce solicitudes naturales del CV, currículum y hoja de vida en ES/EN', () => {
  const { wantsCV } = fixture();
  for (const text of [
    '¿Me brindas el CV de Ayvar?', '¿Me puedes dar su CV?', '¿Puedo tener el CV de Ayvar?', 'Mándame su currículum vitae', 'Pásame la hoja de vida de Ayvar',
    'Muéstrame el CV', 'Quiero ver su currículo', 'CV de Ayvar Jose', 'cv, por favor', 'Descargar CV',
    '¿Tienes el currículum de Jose?', '¿Cómo descargo el CV de Ayvar?', 'No puedo descargar el CV, ¿me lo envías?',
    'Please send me Ayvar’s CV', 'Can I download your résumé?', 'Can I have his resume?',
    'I would like to see his CV', 'Ayvar’s CV', 'CV please', 'Share the curriculum vitae'
  ]) assert.equal(wantsCV(text), true, text);
});

test('no confunde preguntas sobre el CV, ayuda con otro documento ni rechazos con una descarga', () => {
  const { wantsCV } = fixture();
  for (const text of [
    '¿Qué es un CV?', '¿Qué experiencia aparece en el CV de Ayvar?', 'Ayúdame a mejorar mi CV',
    'Can you review my resume?', 'Please create a curriculum vitae for me',
    'What does Ayvar’s CV say about JavaScript?', 'Quiero saber qué tecnologías figuran en su CV',
    'No me envíes el CV', 'No quiero su CV', 'Don’t send me his CV', 'I do not want his resume',
    '¿Cuál es el CVV de una tarjeta?', 'Cuéntame sobre sus proyectos', 'Show me his GitHub'
  ]) assert.equal(wantsCV(text), false, text);
});

test('entrega el archivo antes de invocar la IA o navegar fuera de la conversación', async () => {
  for (const ai of ['on','unknown','off']) {
    const app = fixture({ ai });
    const reply = await app.answer('Muéstrame el CV de Ayvar y sus proyectos');
    assert.equal(reply.a, 'Aquí tienes su CV en PDF 📄');
    assert.equal(reply.act[0].attachment, 'cv');
    assert.equal(app.state.calls, 0);
    assert.equal(app.state.navigations, 0);
  }
});

test('las preguntas normales siguen llegando a la IA y no adjuntan documentos sin pedirlos', async () => {
  const app = fixture();
  const reply = await app.answer('¿Qué experiencia aparece en el CV de Ayvar?');
  assert.equal(reply.ai, 'Respuesta de la IA.');
  assert.equal(reply.act, undefined);
  assert.equal(app.state.calls, 1);
});

test('la tarjeta descarga únicamente el PDF permitido con su nombre real y conserva otras acciones', () => {
  const app = fixture();
  const box = app.actions([{ attachment: 'cv', href: 'https://invalid.example/otro.pdf' }, { label: 'GitHub', href: 'https://github.com/Ayvxrrr' }]);
  const [card, link] = box.children;
  assert.equal(card.tagName, 'A');
  assert.equal(card.href, '/docs/CV-Ayvar-Jose.pdf');
  assert.equal(card.download, 'CV-Ayvar-Jose.pdf');
  assert.equal(card.getAttribute('data-attachment'), 'cv');
  assert.equal(card.getAttribute('aria-label'), 'Descargar CV de Ayvar Jose en PDF');
  assert.equal(card.querySelector('.ayv-file-name').textContent, 'CV-Ayvar-Jose.pdf');
  assert.equal(card.target, undefined);
  assert.equal(link.href, 'https://github.com/Ayvxrrr');
  assert.equal(link.target, '_blank');
  assert.equal(link.rel, 'noopener noreferrer');
});

test('el título y la acción del adjunto se traducen sin modificar el archivo', () => {
  const app = fixture({ language: 'en' }), card = app.cvAttachment();
  assert.equal(card.querySelector('.ayv-file-info strong').textContent, 'Ayvar Jose’s CV');
  assert.equal(card.querySelector('.ayv-file-download').textContent, 'Download CV');
  assert.equal(card.getAttribute('aria-label'), 'Download Ayvar Jose’s CV as a PDF');
  app.setLanguage('es');
  assert.equal(card.querySelector('.ayv-file-info strong').textContent, 'CV de Ayvar Jose');
  assert.equal(card.querySelector('.ayv-file-download').textContent, 'Descargar CV');
  assert.equal(card.href, '/docs/CV-Ayvar-Jose.pdf');
  assert.equal(card.download, 'CV-Ayvar-Jose.pdf');
});

test('el adjunto existe, es un PDF y coincide con la descarga principal y la caché sin conexión', async () => {
  const { CV_FILE } = fixture();
  const pdf = await readFile(new URL('..' + CV_FILE.href, import.meta.url));
  assert.equal(pdf.subarray(0,5).toString(), '%PDF-');
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /href="docs\/CV-Ayvar-Jose\.pdf" id="downloadCV" download="CV-Ayvar-Jose\.pdf"/);
  const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  assert.ok(worker.includes(`'${CV_FILE.href.slice(1)}'`));
  for (const asset of ['js/ayvarcitoo.js','css/ayvarcitoo.css','js/i18n.js']) {
    const version = html.match(new RegExp(asset.replaceAll('.', '\\.') + '\\?v=\\d+'))?.[0];
    assert.ok(version, asset); assert.ok(worker.includes(`'${version}'`), version);
  }
});
