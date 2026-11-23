import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/skills-particles.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../css/skills-experience.css', import.meta.url), 'utf8');
const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');

function fixture(motion = 'full') {
  const frames = new Map(), listeners = new Map(), sectionListeners = new Map(), windowListeners = new Map();
  let next = 0, observer, painted = 0, hidden = false, top = 0, firstPoint;
  const context = { clearRect() { firstPoint = null; }, fillRect(x, y) { painted++; firstPoint ??= { x, y }; } };
  const canvas = { getContext: () => context };
  const section = {
    closest: () => hidden ? section : null,
    getBoundingClientRect: () => ({ width: 1000, height: 900, top, left: 0, bottom: top + 900 }),
    addEventListener: (name, callback) => sectionListeners.set(name, callback)
  };
  const root = { dataset: { motion, theme: 'dark' } };
  const math = Object.create(Math); math.random = () => .5;
  const document = {
    hidden: false, documentElement: root,
    getElementById: id => id === 'skills' ? section : canvas,
    addEventListener: (name, callback) => listeners.set(name, callback)
  };
  class Observer { constructor(callback) { observer = callback; } observe() {} }
  vm.runInNewContext(source, {
    document, window: { IntersectionObserver: Observer }, IntersectionObserver: Observer,
    requestAnimationFrame(callback) { frames.set(++next, callback); return next; },
    cancelAnimationFrame(id) { frames.delete(id); },
    addEventListener(name, callback) { windowListeners.set(name, callback); },
    innerHeight: 900, Math: math
  });
  return {
    frames, context, canvas, document, root, get painted() { return painted; },
    get firstPoint() { return firstPoint; },
    visible(value) { observer([{ isIntersecting: value }]); },
    event(name) { listeners.get(name)?.(); },
    sectionEvent(name, event = {}) { sectionListeners.get(name)?.(event); },
    scroll(value) { top = value; windowListeners.get('scroll')?.(); },
    setHidden(value) { hidden = value; },
    frame(time) { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(time)); }
  };
}

test('las partículas se pintan detrás del contenido y no bloquean los controles', () => {
  assert.match(html, /<canvas class="skills-particles" id="skillsParticles" aria-hidden="true">/);
  assert.match(css, /\.skills-particles\s*\{[^}]*pointer-events:\s*none/);
  assert.match(css, /:root\[data-theme="dark"\] #skills\.skills-experience\s*\{[^}]*background-color:\s*#000/);
  assert.ok(worker.includes("'js/skills-particles.js?v=3'"));
  const app = fixture();
  app.visible(true); app.frame(100);
  assert.ok(app.painted >= 4500);
  assert.equal(app.frames.size, 1);
  app.visible(false);
  assert.equal(app.frames.size, 0);
});

test('las partículas responden al cursor y al desplazamiento sin bloquear la página', () => {
  const app = fixture();
  app.visible(true); app.frame(100);
  const initial = app.firstPoint;
  app.sectionEvent('pointermove', { pointerType: 'mouse', clientX: 550, clientY: 450 });
  app.frame(140);
  assert.ok(app.firstPoint.x < initial.x - 1, 'las partículas cercanas se apartan del cursor');
  app.sectionEvent('pointerleave');
  const beforeScroll = app.firstPoint;
  app.scroll(-450);
  for (let time = 180; time <= 500; time += 40) app.frame(time);
  assert.notDeepEqual(app.firstPoint, beforeScroll);
  assert.equal(app.frames.size, 1);
});

test('movimiento reducido, pestañas ocultas y cambios de tema no dejan animaciones activas', () => {
  const app = fixture('reduced');
  app.visible(true); app.frame(100);
  assert.ok(app.painted > 0);
  assert.equal(app.frames.size, 0);
  app.root.dataset.theme = 'light'; app.event('portfolio:palette'); app.frame(200);
  assert.equal(app.context.fillStyle, '#111');
  app.root.dataset.motion = 'full'; app.event('portfolio:motion'); app.frame(300);
  assert.equal(app.frames.size, 1);
  app.document.hidden = true; app.event('visibilitychange');
  assert.equal(app.frames.size, 0);
  app.document.hidden = false; app.setHidden(true); app.event('portfolio:view');
  assert.equal(app.frames.size, 0);
});
