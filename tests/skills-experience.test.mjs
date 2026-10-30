import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/skills-experience.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const i18n = await readFile(new URL('../js/i18n.js', import.meta.url), 'utf8');
const entries = vm.runInNewContext(i18n.slice(i18n.indexOf('    const entries = '), i18n.indexOf('    ];') + 6) + '\nentries');
const english = new Map(entries);

function fixture({ fine = true, motion = 'full', observe = true } = {}) {
  const events = new Map(), frames = new Map(), bindings = new Map();
  let frameId = 0, observer;
  const state = { fine, language: 'es', focused: null, animations: 0, cancellations: 0 };
  function element(dataset = {}) {
    const handlers = new Map(), attributes = new Map(), classes = new Set(), styles = new Map();
    return {
      dataset, textContent: '',
      classList: { toggle: (name, active) => active ? classes.add(name) : classes.delete(name), contains: name => classes.has(name) },
      style: { setProperty: (name, value) => styles.set(name, value), removeProperty: name => styles.delete(name), getPropertyValue: name => styles.get(name) || '' },
      setAttribute: (name, value) => attributes.set(name, value), getAttribute: name => attributes.get(name),
      addEventListener: (name, handler) => handlers.set(name, handler),
      fire(name, event = {}) { return handlers.get(name)?.({ preventDefault() {}, ...event }); },
      focus() { state.focused = this; this.fire('focus'); },
      scrollIntoView(options) { this.scroll = options; },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 }),
      getAnimations: () => [{ cancel() { state.cancellations++; } }],
      animate() { state.animations++; }
    };
  }
  const cards = [ ['html','javascript','react','angular'], ['node','php','python','java'], ['sql','mongo','aws','docker'] ].map(keys => {
    const card = element();
    card.buttons = keys.map((tech, index) => {
      const button = element({ tech }), item = element();
      button.setAttribute('aria-pressed', String(index === 0));
      button.closest = () => item;
      return button;
    });
    card.querySelectorAll = () => card.buttons;
    return card;
  });
  const choices = ['javascript','php','python','java','sql'].map(languageKey => element({ languageKey }));
  const elements = new Map(['languageFeature','languageMonogram','languageFeatureTitle','languageFeatureDescription','languageFeatureUsage','nextLanguage'].map(id => [`#${id}`, element()]));
  const panels = [...cards, elements.get('#languageFeature')];
  const section = element();
  section.querySelector = selector => elements.get(selector);
  section.querySelectorAll = selector => ({ '.skill-category-card': cards, '.language-choice': choices, '.skill-panel': panels })[selector];
  const media = { get matches() { return state.fine; }, addEventListener: (name, handler) => events.set('media:' + name, handler) };
  const document = { readyState: 'complete', hidden: false, documentElement: { dataset: { motion } }, getElementById: () => section, addEventListener: (name, handler) => events.set(name, handler) };
  const translated = value => state.language === 'en' ? english.get(value) || value : value;
  const window = { portfolioI18n: { text(el, value) { bindings.set(el, value); el.textContent = translated(value); } } };
  if (observe) window.IntersectionObserver = class {
    constructor(callback) { observer = callback; }
    observe() {}
  };
  vm.runInNewContext(source, {
    document, window, matchMedia: () => media, Element: { prototype: { animate() {} } },
    IntersectionObserver: window.IntersectionObserver,
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); }
  });
  return {
    cards, choices, panels, elements, section, state, document, frames,
    event: name => events.get(name)?.(),
    frame() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); },
    visible(panel, active) { observer([{ target: panel, isIntersecting: active }]); },
    language(language) { state.language = language; bindings.forEach((value, el) => { el.textContent = translated(value); }); }
  };
}

test('cada tecnología mantiene su selección visual sin añadir descripciones', () => {
  const app = fixture();
  for (const card of app.cards) {
    for (const button of card.buttons) {
      button.fire('click');
      assert.equal(card.dataset.selectedTech, button.dataset.tech);
      assert.equal(card.buttons.filter(item => item.getAttribute('aria-pressed') === 'true').length, 1);
      assert.equal(button.getAttribute('aria-pressed'), 'true');
    }
  }
  assert.equal(app.cards[0].dataset.selectedTech, 'angular');
  assert.equal(app.cards[1].dataset.selectedTech, 'java');
});

test('el teclado explora tecnologías con flechas, Inicio y Fin sin salir de la categoría', () => {
  const { cards, state } = fixture();
  const buttons = cards[0].buttons;
  buttons[0].fire('keydown', { key: 'ArrowUp' });
  assert.equal(state.focused, buttons[3]);
  assert.equal(cards[0].dataset.selectedTech, 'angular');
  buttons[3].fire('keydown', { key: 'Home' });
  assert.equal(state.focused, buttons[0]);
  buttons[0].fire('keydown', { key: 'ArrowDown' });
  assert.equal(state.focused, buttons[1]);
  buttons[1].fire('keydown', { key: 'End' });
  assert.equal(state.focused, buttons[3]);
});

test('los cinco lenguajes son seleccionables y el botón siguiente repite el ciclo', () => {
  const { choices, elements } = fixture();
  for (const button of choices) {
    button.fire('click');
    assert.equal(elements.get('#languageFeature').dataset.languageKey, button.dataset.languageKey);
    assert.equal(choices.filter(item => item.getAttribute('aria-pressed') === 'true').length, 1);
  }
  elements.get('#nextLanguage').fire('click');
  assert.equal(elements.get('#languageFeatureTitle').textContent, 'JavaScript');
});

test('las flechas y los extremos del teclado actualizan el lenguaje y el foco', () => {
  const { choices, state, elements } = fixture();
  choices[0].fire('keydown', { key: 'ArrowLeft' });
  assert.equal(state.focused, choices[4]);
  assert.equal(elements.get('#languageFeatureTitle').textContent, 'SQL');
  choices[4].fire('keydown', { key: 'Home' });
  assert.equal(state.focused, choices[0]);
  choices[0].fire('keydown', { key: 'ArrowDown' });
  assert.equal(state.focused, choices[1]);
  choices[1].fire('keydown', { key: 'End' });
  assert.equal(state.focused, choices[4]);
});

test('tocar un lenguaje en móvil muestra su panel sin desplazar el foco del teclado', () => {
  const mobile = fixture({ fine: false });
  mobile.choices[1].fire('click', { detail: 1 });
  assert.equal(mobile.elements.get('#languageFeature').scroll.block, 'start');
  assert.equal(mobile.elements.get('#languageFeature').scroll.behavior, 'smooth');
  assert.equal(mobile.state.focused, null);
  const keyboard = fixture({ fine: false });
  keyboard.choices[1].fire('click', { detail: 0 });
  assert.equal(keyboard.elements.get('#languageFeature').scroll, undefined);
  const reduced = fixture({ fine: false, motion: 'reduced' });
  reduced.choices[1].fire('click', { detail: 1 });
  assert.equal(reduced.elements.get('#languageFeature').scroll.behavior, 'instant');
});

test('todas las descripciones dinámicas están traducidas y conservan el idioma seleccionado', () => {
  const app = fixture();
  for (const button of app.choices) {
    app.language('es'); button.fire('click');
    for (const id of ['#languageFeatureDescription', '#languageFeatureUsage']) {
      const spanish = app.elements.get(id).textContent;
      app.language('en'); assert.equal(app.elements.get(id).textContent, english.get(spanish));
      app.language('es');
    }
  }
});

test('las tarjetas no contienen subtítulos, pies explicativos ni controles a elementos eliminados', () => {
  const deck = html.slice(html.indexOf('<div class="row g-4 skills-deck">'), html.indexOf('<div class="architecture-lab'));
  assert.doesNotMatch(deck, /<p\b|skill-card-detail|TechDetail|EN PRÁCTICA/);
  assert.doesNotMatch(html, /skills-interaction-hint/);
  assert.equal([...deck.matchAll(/class="skill-info skill-trigger"/g)].length, 12);
});

test('la inclinación solo usa un frame pendiente y se desactiva con tacto o movimiento reducido', () => {
  const app = fixture(), panel = app.panels[0];
  const move = { pointerType: 'mouse', clientX: 190, clientY: 10 };
  panel.fire('pointermove', move); panel.fire('pointermove', move);
  assert.equal(app.frames.size, 1);
  app.frame();
  assert.equal(panel.style.getPropertyValue('--panel-ry'), '2.25deg');
  panel.fire('pointerleave');
  assert.equal(panel.style.getPropertyValue('--panel-ry'), '');
  panel.fire('pointermove', { ...move, pointerType: 'touch' });
  assert.equal(app.frames.size, 0);
  app.state.fine = false; panel.fire('pointermove', move);
  assert.equal(app.frames.size, 0);
  app.state.fine = true; app.document.documentElement.dataset.motion = 'reduced';
  panel.fire('pointermove', move); app.choices[1].fire('click');
  assert.equal(app.frames.size, 0);
  assert.equal(app.state.animations, 0);
});

test('salir de pantalla o esconder la pestaña cancela frames y detiene efectos', () => {
  const app = fixture(), panel = app.panels[0];
  panel.fire('pointermove', { pointerType: 'mouse', clientX: 100, clientY: 10 });
  app.visible(panel, false);
  assert.equal(panel.dataset.inView, 'false');
  assert.equal(app.frames.size, 0);
  app.visible(panel, true);
  assert.equal(panel.dataset.inView, 'true');
  app.document.hidden = true; app.event('visibilitychange');
  assert.equal(app.section.dataset.pageVisible, 'false');
  assert.ok(app.state.cancellations > 0);
  app.document.hidden = false; app.event('visibilitychange');
  assert.equal(app.section.dataset.pageVisible, 'true');
  const fallback = fixture({ observe: false });
  assert.ok(fallback.panels.every(item => item.dataset.inView === 'true'));
});

test('pausar animaciones también cancela la transición nativa del monograma', () => {
  const app = fixture();
  app.choices[1].fire('click');
  assert.equal(app.state.animations, 1);
  const before = app.state.cancellations;
  app.document.documentElement.dataset.motion = 'reduced'; app.event('portfolio:motion');
  assert.ok(app.state.cancellations > before);
});

test('se mantienen los porcentajes y se incluyen los nuevos recursos en HTML y caché', async () => {
  assert.deepEqual([...html.matchAll(/class="progress-bar" data-width="(\d+)"/g)].map(match => Number(match[1])), [95,90,85,80,85,90,75,70,90,80,75,85]);
  assert.deepEqual([...html.matchAll(/class="chart-circle" data-percent="(\d+)"/g)].map(match => Number(match[1])), [90,90,85,80,75]);
  const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  for (const asset of ['css/skills-experience.css', 'css/replica.css', 'css/extras.css', 'js/skills-experience.js', 'js/i18n.js', 'js/script.js', 'js/enhancements.js']) {
    const versioned = html.match(new RegExp(asset.replaceAll('.', '\\.') + '\\?v=\\d+'))?.[0];
    assert.ok(versioned, asset);
    assert.ok(worker.includes(`'${versioned}'`), versioned);
  }
});
