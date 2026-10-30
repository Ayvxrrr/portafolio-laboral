import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/script.js', import.meta.url), 'utf8');
const start = source.indexOf("    const lab = $('#architectureLab');");
const end = source.indexOf('    function openDialog(', start);
assert.ok(start >= 0 && end > start);
const labSource = source.slice(start, end);
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function fixture({ observe = true } = {}) {
  const timers = new Map(), listeners = new Map(), elements = new Map();
  let now = 0, nextTimer = 0, observer;
  const state = { motion: true, hidden: false, viewHidden: false, onscreen: true };
  function element(dataset = {}) {
    const classes = new Set(), handlers = new Map();
    return {
      dataset, textContent: '', attributes: {},
      classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value), toggle: (value, active) => active ? classes.add(value) : classes.delete(value) },
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, callback) { handlers.set(name, callback); },
      fire(name) { handlers.get(name)?.(); }
    };
  }
  for (const id of ['architectureLab', 'flowLog', 'labStatus']) elements.set('#' + id, element());
  const lab = elements.get('#architectureLab');
  lab.closest = () => state.viewHidden ? lab : null;
  const nodes = ['frontend', 'backend', 'database'].map(layer => element({ layer }));
  const workspace = element();
  workspace.getBoundingClientRect = () => ({ width: state.viewHidden ? 0 : 900, top: state.onscreen ? 0 : 1000, bottom: state.onscreen ? 500 : 1500 });
  elements.set('.lab-workspace', workspace);
  class Observer { constructor(callback) { observer = callback; } observe() {} }
  const document = { get hidden() { return state.hidden; }, addEventListener(name, callback) { listeners.set(name, callback); } };
  const translate = (text, params = {}) => text.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? key);
  const context = vm.createContext({
    window: observe ? { IntersectionObserver: Observer } : {}, IntersectionObserver: Observer, document, innerHeight: 900,
    addEventListener: (name, callback) => listeners.set('window:' + name, callback),
    $: selector => elements.get(selector), $$: () => nodes, motionEnabled: () => state.motion, t: translate,
    i18n: { text(target, text) { target.textContent = typeof text === 'function' ? text() : text; } },
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); }, queueMicrotask: callback => callback()
  });
  vm.runInContext(labSource, context);
  return {
    state, timers, nodes, lab, log: elements.get('#flowLog'), status: elements.get('#labStatus'),
    selected: () => nodes.find(node => node.classList.contains('is-selected'))?.dataset.layer,
    visible: visible => observer([{ isIntersecting: visible }]),
    event: name => listeners.get(name)?.(),
    advance(milliseconds) {
      const target = now + milliseconds;
      while (true) {
        const entry = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!entry || entry[1].at > target) break;
        timers.delete(entry[0]); now = entry[1].at; entry[1].callback();
      }
      now = target;
    }
  };
}

test('el laboratorio recorre las tres capas y vuelve a empezar sin botón', () => {
  const app = fixture();
  assert.equal(app.timers.size, 0);
  app.visible(true);
  assert.equal(app.selected(), 'frontend');
  assert.equal(app.lab.dataset.activeLayer, 'frontend');
  app.advance(1600); assert.equal(app.selected(), 'backend');
  assert.equal(app.lab.dataset.activeLayer, 'backend');
  app.advance(1600); assert.equal(app.selected(), 'database');
  assert.equal(app.lab.dataset.activeLayer, 'database');
  app.advance(1600); assert.equal(app.lab.dataset.flowState, 'complete');
  app.advance(2000); assert.equal(app.lab.dataset.flowState, 'running');
  assert.equal(app.selected(), 'frontend');
});

test('los eventos de visibilidad no duplican los temporizadores', () => {
  const app = fixture();
  for (let i = 0; i < 10; i++) app.visible(true);
  assert.equal(app.timers.size, 1);
  app.advance(3200);
  assert.equal(app.selected(), 'database');
  assert.equal(app.timers.size, 1);
});

test('no quedan temporizadores al salir de la sección o esconder la pestaña', () => {
  const app = fixture();
  app.visible(true); app.advance(1600); app.visible(false);
  assert.equal(app.timers.size, 0);
  app.advance(10000); assert.equal(app.selected(), 'backend');
  app.visible(true); assert.equal(app.selected(), 'frontend');
  app.state.hidden = true; app.event('visibilitychange');
  assert.equal(app.timers.size, 0);
  app.state.hidden = false; app.event('visibilitychange');
  assert.equal(app.timers.size, 1);
  app.state.viewHidden = true; app.event('portfolio:view');
  assert.equal(app.timers.size, 0);
});

test('movimiento reducido muestra un resumen estático y reanuda la demo al activarlo', () => {
  const app = fixture();
  app.visible(true); app.state.motion = false; app.event('portfolio:motion');
  assert.equal(app.timers.size, 0);
  assert.equal(app.status.textContent, 'DEMO PAUSADA');
  assert.equal(app.log.textContent, 'Interfaz → servidor → datos → respuesta.');
  app.advance(10000);
  assert.equal(app.timers.size, 0);
  app.state.motion = true; app.event('portfolio:motion');
  assert.equal(app.selected(), 'frontend');
  assert.equal(app.timers.size, 1);
});

test('la demostración no tiene botones ni instrucciones para hacer clic', () => {
  const markup = html.slice(html.indexOf('<div class="architecture-lab'), html.indexOf('<div class="programming-languages'));
  assert.doesNotMatch(markup, /<button\b|tabindex|aria-pressed|layerDetail|layerTitle|layerDescription|Toca|INTERACTIVO|Del clic/);
  assert.match(markup, /DEMO AUTOMÁTICA/);
  assert.match(markup, /role="list" aria-label="Flujo de una solicitud web"/);
});

test('los mensajes son breves y la capa actual se identifica sin controles falsos', () => {
  const app = fixture();
  app.visible(true);
  for (let step = 0; step < 3; step++) {
    assert.ok(app.log.textContent.length <= 45);
    assert.equal(app.nodes.filter(node => node.attributes['aria-current'] === 'step').length, 1);
    assert.equal(app.nodes[step].attributes['aria-current'], 'step');
    app.advance(1600);
  }
  assert.equal(app.status.textContent, '04 / RESPUESTA');
  assert.equal(app.log.textContent, 'Respuesta → vuelve a la interfaz.');
});

test('sin IntersectionObserver se pausa y reanuda según la posición en pantalla', () => {
  const app = fixture({ observe: false });
  assert.equal(app.timers.size, 1);
  app.state.onscreen = false; app.event('window:scroll');
  assert.equal(app.timers.size, 0);
  app.state.onscreen = true; app.event('window:resize');
  assert.equal(app.timers.size, 1);
});

test('se retira el botón flotante de instalar sin desactivar el modo sin conexión', async () => {
  assert.doesNotMatch(html, /id="installApp"/);
  const enhancements = await readFile(new URL('../js/enhancements.js', import.meta.url), 'utf8');
  assert.doesNotMatch(enhancements, /getElementById\('installApp'\)/);
  assert.match(enhancements, /navigator\.serviceWorker\.register\('sw\.js'\)/);
});
