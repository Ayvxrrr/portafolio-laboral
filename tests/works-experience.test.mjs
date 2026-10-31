import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/works-experience.js', import.meta.url), 'utf8');
const model = vm.createContext({ window: {} });
vm.runInContext(source, model);
const { imageFrames, swipeOffset } = model.window.portfolioWorksExperience.motion;

function fixture({ motion = true, animate = true, fine = true } = {}) {
  const events = new Map(), timers = new Map(), frames = new Map(), animations = [];
  const state = { motion, fine, grid: false, view: 'projects', current: 0, now: 0 };
  let nextTimer = 0, nextFrame = 0;
  function element(tag = 'div') {
    const classes = new Set(), handlers = new Map(), attributes = new Map(), properties = new Map();
    const el = {
      tagName: tag.toUpperCase(), dataset: {}, children: [], parentElement: null, offsetWidth: 400, inert: false,
      style: { getPropertyValue: name => properties.get(name) || '', setProperty: (name, value) => properties.set(name, value), removeProperty(name) { properties.delete(name); delete this[name]; } },
      classList: { add: (...names) => names.forEach(name => classes.add(name)), remove: (...names) => names.forEach(name => classes.delete(name)), contains: name => classes.has(name), toggle(name, active) { if (active) classes.add(name); else classes.delete(name); } },
      setAttribute: (name, value) => attributes.set(name, value), getAttribute: name => attributes.get(name),
      addEventListener(name, callback) { if (!handlers.has(name)) handlers.set(name, []); handlers.get(name).push(callback); },
      fire(name, event = {}) { const e = { target: el, cancelable: true, preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; }, ...event }; handlers.get(name)?.forEach(callback => callback(e)); return e; },
      append(...nodes) { nodes.forEach(node => { node.remove(); node.parentElement = el; el.children.push(node); }); },
      before(node) { this.parentElement?.append(node); },
      remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = null; },
      contains(node) { for (let item = node; item; item = item.parentElement) if (item === el) return true; return false; },
      closest(selector) { for (let node = this; node; node = node.parentElement) if (selector.split(',').some(part => part.startsWith('.') ? node.classList.contains(part.slice(1)) : node.tagName === part.toUpperCase())) return node; return null; },
      cloneNode() { const clone = element(tag); clone.classList.add('works-backdrop'); return clone; },
      setPointerCapture(id) { this.capture = id; }, hasPointerCapture(id) { return this.capture === id; }, releasePointerCapture() { this.capture = null; },
      querySelector: () => null, querySelectorAll: () => [],
      animate(keyframes, options) {
        let resolve, reject;
        const finished = new Promise((yes, no) => { resolve = yes; reject = no; });
        const animation = { target: el, keyframes, options, finished, done: false, cancelled: false, complete() { this.done = true; resolve(); }, cancel() { this.cancelled = true; reject(new Error('cancelled')); } };
        animations.push(animation); return animation;
      }
    };
    return el;
  }
  const section = element(), backdrop = element(), counter = element();
  backdrop.classList.add('works-backdrop'); section.append(backdrop, counter);
  const letters = [element('span'),element('span'),element('span')];
  backdrop.querySelectorAll = () => letters;
  const cases = [0,1,2].map(() => {
    const el = element(), stage = element(), preview = element('button'), content = element(), image = element('img');
    el.append(stage, content); stage.append(preview); preview.append(image); section.append(el);
    preview.querySelector = () => image;
    el.querySelector = selector => ({ '.project-preview': preview, '.work-preview-stage': stage, '.project-content': content })[selector];
    return el;
  });
  section.querySelector = () => counter;
  const document = { body: element('body'), hidden: false, createElement: element, addEventListener(name, callback) { events.set(name, callback); } };
  const media = { get matches() { return state.fine; }, addEventListener(name, callback) { events.set('media:' + name, callback); } };
  const context = vm.createContext({
    window: {}, document, innerWidth: 1440, Element: { prototype: animate ? { animate() {} } : {} },
    getComputedStyle: el => ({ transform: el.style.transform || 'none' }),
    performance: { now: () => state.now },
    setTimeout(callback) { timers.set(++nextTimer, callback); return nextTimer; }, clearTimeout: id => timers.delete(id),
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; }, cancelAnimationFrame: id => frames.delete(id),
    addEventListener(name, callback) { events.set(name, callback); }
  });
  vm.runInContext(source, context);
  let controller;
  function show(index, animate = true) {
    if (index < 0 || index >= cases.length || index === state.current) return false;
    const from = cases[state.current], to = cases[index], direction = Math.sign(index - state.current);
    controller.change({ from, to, direction, animate, update() {
      state.current = index;
      cases.forEach((el, position) => { el.classList.toggle('is-current-project', position === index); el.inert = !state.grid && position !== index; });
    } });
    return true;
  }
  controller = context.window.portfolioWorksExperience.create({ section, cases, backdrop, getCurrent: () => state.current, isGrid: () => state.grid, getView: () => state.view, motion: () => state.motion, fine: media, navigate: offset => show(state.current + offset), invalidate() {} });
  return {
    section, cases, controller, state, document, animations, timers, frames, show,
    preview: index => cases[index].querySelector('.project-preview'),
    event: name => events.get(name)?.(),
    frame() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); },
    async complete() { animations.filter(animation => !animation.cancelled).forEach(animation => animation.complete()); await new Promise(resolve => setImmediate(resolve)); },
    echoes: () => section.children.filter(el => el.classList.contains('works-backdrop-echo'))
  };
}

test('el barrido de imagen cambia de dirección y termina sin deformación', () => {
  assert.match(imageFrames(1, false)[0].clipPath, /100% 0,100% 0/);
  assert.match(imageFrames(-1, false)[0].clipPath, /0 0,0 0/);
  assert.match(imageFrames(1, false)[0].transform, /rotateY\(-24deg\)/);
  assert.match(imageFrames(1, true)[0].transform, /rotateY\(-5deg\)/);
  assert.equal(imageFrames(1, false).at(-1).transform, imageFrames(-1, false).at(-1).transform);
});

test('el gesto requiere desplazamiento horizontal suficiente y no roba el scroll vertical', () => {
  assert.equal(swipeOffset(-80, 5, 400), 1);
  assert.equal(swipeOffset(80, 5, 400), -1);
  assert.equal(swipeOffset(-40, 2, 400), 0);
  assert.equal(swipeOffset(-80, 100, 400), 0);
  assert.equal(swipeOffset(-80, 0, 800), 0);
});

test('al cambiar se animan salida, entrada y fondo sin hacer accesible el proyecto anterior', async () => {
  const app = fixture();
  app.show(1);
  assert.equal(app.state.current, 1);
  assert.equal(app.section.dataset.worksTransition, 'running');
  assert.ok(app.cases[0].classList.contains('is-leaving-project'));
  assert.equal(app.cases[0].inert, true);
  assert.equal(app.cases[1].inert, false);
  assert.equal(app.echoes().length, 1);
  assert.equal(app.echoes()[0].getAttribute('aria-hidden'), 'true');
  assert.equal(app.echoes()[0].inert, true);
  assert.ok(app.animations.some(animation => animation.keyframes[0].clipPath));
  await app.complete();
  assert.equal(app.section.dataset.worksTransition, 'idle');
  assert.equal(app.echoes().length, 0);
  assert.equal(app.timers.size, 0);
  assert.ok(app.cases.every(el => !el.classList.contains('is-leaving-project')));
});

test('clics rápidos cancelan la secuencia anterior y solo conservan el último destino', async () => {
  const app = fixture();
  app.show(1); const first = [...app.animations];
  app.show(2); await Promise.resolve();
  assert.ok(first.every(animation => animation.cancelled));
  assert.equal(app.state.current, 2);
  assert.equal(app.section.dataset.worksTransition, 'running');
  assert.equal(app.echoes().length, 1);
  assert.equal(app.cases.filter(el => el.classList.contains('is-leaving-project')).length, 1);
  await app.complete();
  assert.equal(app.section.dataset.worksTransition, 'idle');
  assert.equal(app.state.current, 2);
});

test('movimiento reducido y navegadores sin Web Animations cambian de inmediato', () => {
  for (const options of [{ motion: false }, { animate: false }]) {
    const app = fixture(options); app.show(1);
    assert.equal(app.state.current, 1);
    assert.equal(app.animations.length, 0);
    assert.equal(app.echoes().length, 0);
    assert.equal(app.section.dataset.worksTransition, 'idle');
  }
});

test('salir de la vista, esconder la pestaña, cambiar idioma o pausar limpia la transición', () => {
  for (const event of ['portfolio:view','visibilitychange','portfolio:motion','portfolio:language','resize','blur','media:change']) {
    const app = fixture(); app.show(1); app.event(event);
    assert.equal(app.section.dataset.worksTransition, 'idle', event);
    assert.equal(app.echoes().length, 0, event);
    assert.ok(app.animations.every(animation => animation.cancelled), event);
    assert.equal(app.timers.size, 0, event);
  }
});

test('cambiar a la cuadrícula durante una animación no deja capas encima', () => {
  const app = fixture(); app.show(1); app.state.grid = true; app.show(2, false);
  assert.equal(app.section.dataset.worksTransition, 'idle');
  assert.equal(app.echoes().length, 0);
  assert.ok(app.cases.every(el => !el.inert));
});

test('el arrastre con ratón cambia proyecto sin abrir accidentalmente los detalles', () => {
  const app = fixture(), target = app.preview(0);
  app.section.fire('pointerdown', { target, pointerId: 1, pointerType: 'mouse', clientX: 250, clientY: 100, button: 0 });
  app.section.fire('pointermove', { target, pointerId: 1, pointerType: 'mouse', clientX: 120, clientY: 105 });
  app.frame();
  assert.ok(app.section.classList.contains('is-works-dragging'));
  app.section.fire('lostpointercapture', { target, pointerId: 1 });
  assert.ok(app.section.classList.contains('is-works-dragging'));
  assert.equal(app.section.hasPointerCapture(1), true);
  assert.match(target.parentElement.style.transform, /rotateY/);
  app.section.fire('pointerup', { target, pointerId: 1, clientX: 120, clientY: 105 });
  assert.equal(app.state.current, 1);
  const click = app.section.fire('click', { target });
  assert.equal(click.prevented, true); assert.equal(click.stopped, true);
  app.state.now = 501;
  assert.equal(app.section.fire('click', { target }).prevented, undefined);
  app.controller.finish();
});

test('tocar sin arrastrar conserva el clic original y cancelar el gesto restaura la imagen', () => {
  const app = fixture(), target = app.preview(0);
  app.section.fire('pointerdown', { target, pointerId: 1, pointerType: 'touch', clientX: 120, clientY: 100 });
  app.section.fire('pointerup', { target, pointerId: 1, clientX: 120, clientY: 100 });
  assert.equal(app.state.current, 0);
  assert.equal(app.section.fire('click', { target }).prevented, undefined);
  app.section.fire('pointerdown', { target, pointerId: 2, pointerType: 'mouse', clientX: 120, clientY: 100 });
  app.section.fire('pointermove', { target, pointerId: 2, pointerType: 'mouse', clientX: 140, clientY: 100 });
  app.frame(); app.section.fire('pointercancel');
  assert.equal(target.parentElement.style.transform, undefined);
  assert.equal(app.frames.size, 0);
  assert.equal(app.state.current, 0);
  app.controller.finish();
});

test('los límites no cambian de proyecto y el gesto táctil funciona sin animaciones', () => {
  const app = fixture({ motion: false, fine: false }), target = app.preview(0);
  for (const [id, end] of [[1, 240], [2, 0]]) {
    app.section.fire('pointerdown', { target, pointerId: id, pointerType: 'touch', clientX: 120, clientY: 100 });
    app.section.fire('pointermove', { target, pointerId: id, pointerType: 'touch', clientX: end, clientY: 105 });
    app.section.fire('pointerup', { target, pointerId: id, clientX: end, clientY: 105 });
    assert.equal(app.state.current, id === 1 ? 0 : 1);
    assert.equal(app.animations.length, 0);
  }
});

test('los recursos se cargan antes de la galería y sus versiones coinciden con la caché', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  for (const asset of ['css/works-experience.css','js/works-experience.js','js/replica-experience.js','js/scroll-narratives.js']) {
    const version = html.match(new RegExp(asset.replaceAll('.', '\\.') + '\\?v=\\d+'))?.[0];
    assert.ok(version, asset); assert.ok(worker.includes(`'${version}'`), version);
  }
  assert.ok(html.indexOf('src="js/works-experience.js') < html.indexOf('src="js/replica-experience.js'));
});
