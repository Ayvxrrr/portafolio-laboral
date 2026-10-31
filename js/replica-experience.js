(() => {
    'use strict';
    const root = document.documentElement;
    const body = document.body;
    const main = document.getElementById('main');
    const i18n = window.portfolioI18n;
    if (!main || !i18n || !body.classList.contains('replica-site')) return;
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    const motion = () => root.dataset.motion !== 'reduced';
    const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
    const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const groups = () => $$('main > [data-view]');
    const viewNames = { home: 'Inicio', projects: 'Trabajos', about: 'Sobre mí' };
    let currentView = 'home';
    let initialized = false;
    let frame = 0;
    let needsLayout = true;
    let lastCanvasFrame = 0;
    let quality = 'medium';
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const pointer = { x: 0, y: 0, active: false };
    const tilt = { x: 0, y: 0, targetX: 0, targetY: 0, bulbX: 0, bulbY: 0, targetBulbX: 0, targetBulbY: 0, hover: 0, targetHover: 0, velocityX: 0, velocityY: 0, velocityHover: 0, time: 0 };
    const canvases = [];
    let gallery = null;
    let homeStory = null;
    let aboutStory = null;
    let videoVisible = false;
    let heroVisible = false;
    const video = $('#presentationVideo');
    const presentation = $('#home');
    const lighting = $('#presentationTheme');

    function viewFor(target) {
        return target?.closest('main > [data-view]')?.dataset.view || currentView;
    }
    function viewFromLocation() {
        try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return null; }
    }
    function applyView(view) {
        currentView = Object.hasOwn(viewNames, view) ? view : 'home';
        groups().forEach(element => { element.hidden = !element.dataset.view.split(/\s+/).includes(currentView); });
        body.dataset.view = currentView;
        i18n.text($('title'), () => `${i18n.t(viewNames[currentView])} | Ayvar Jose`);
        window.portfolioScroll?.refresh();
        document.dispatchEvent(new CustomEvent('portfolio:view', { detail: { id: currentView } }));
        needsLayout = true;
        if (initialized) requestRender();
    }
    function revealTarget(target) {
        const next = viewFor(target);
        const changed = next !== currentView;
        if (changed) applyView(next);
        for (let details = target.closest('details'); details; details = details.parentElement?.closest('details')) details.open = true;
        needsLayout = true;
        if (initialized) requestRender();
        return changed;
    }
    window.portfolioExperience = { viewFor, revealTarget, currentSection: () => currentView, alignTarget: (target, options) => aboutStory?.align(target, options) || false };
    applyView(viewFromLocation() ? viewFor(viewFromLocation()) : 'home');

    function renderTitle(animate = true) {
        $$('[data-presentation-line]').forEach(line => {
            i18n.html(line, () => [...(line.dataset.presentationLine === 'name' ? 'AYVAR JOSE.' : line.dataset.presentationLine === 'role' ? root.lang === 'en' ? 'FULL STACK' : 'DESARROLLADOR' : root.lang === 'en' ? 'DEVELOPER.' : 'FULL STACK.')].map((char, index) => `<span class="presentation-letter" style="--character:${index}">${char === ' ' ? '&nbsp;' : escape(char)}</span>`).join(''));
        });
        i18n.html($('.about-introduction h2'), () => (root.lang === 'en' ? ['I’M AYVAR JOSE.', 'JUNIOR FULL STACK', 'DEVELOPER.'] : ['SOY AYVAR JOSE.', 'DESARROLLADOR', 'FULL STACK JR.']).map((text, index) => `<span class="about-title-line"><span class="about-title-text${index === 2 ? ' about-title-stroke' : ''}" style="--line-index:${index}">${escape(text)}</span></span>`).join(''));
        $$('.biography-ribbon > span').forEach(ribbon => i18n.html(ribbon, () => Array(2).fill(`AYVAR JOSE — <b>${i18n.t('DESARROLLADOR FULL STACK')}</b> —`).join(' ')));
        if (animate && motion() && typeof Element.prototype.animate === 'function') {
            $$('[data-presentation-line]').forEach((line, row) => {
                $$('.presentation-letter', line).forEach((letter, index) => {
                    letter.animate([
                        { transform: 'translate3d(-35%, 120%, 0) skewY(12deg)', opacity: 0 },
                        { transform: 'translate3d(0, 0, 0) skewY(0deg)', opacity: 1 }
                    ], { duration: 850, delay: row * 90 + index * 18, easing: 'cubic-bezier(.16,1,.3,1)' });
                });
            });
        }
    }
    function syncVideo() {
        if (!video) return;
        if (motion() && currentView === 'home' && videoVisible && !document.hidden) video.play().catch(() => {});
        else video.pause();
    }
    function syncLightingControl() {
        if (!lighting) return;
        const light = root.dataset.theme === 'light';
        lighting.setAttribute('aria-checked', String(light));
        lighting.setAttribute('aria-label', i18n.t('Modo claro'));
        lighting.title = i18n.t(light ? 'Activar modo oscuro' : 'Activar modo claro');
    }
    function setProperty(element, name, value) { if (element && element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value); }
    function resetTilt(immediate = false) {
        tilt.targetX = tilt.targetY = tilt.targetBulbX = tilt.targetBulbY = tilt.targetHover = 0;
        if (immediate) {
            tilt.x = tilt.y = tilt.bulbX = tilt.bulbY = tilt.hover = tilt.velocityX = tilt.velocityY = tilt.velocityHover = 0;
            tilt.time = 0;
            presentation.classList.remove('is-3d-enabled', 'is-pointer-moving');
        }
        requestRender();
    }
    function spring(property, velocity, target, dt, threshold) {
        tilt[velocity] += ((tilt[target] - tilt[property]) * 170 - tilt[velocity] * 18) * dt;
        tilt[property] += tilt[velocity] * dt;
        if (Math.abs(tilt[target] - tilt[property]) < threshold && Math.abs(tilt[velocity]) < threshold) {
            tilt[property] = tilt[target]; tilt[velocity] = 0;
        }
    }
    function updateTilt(now) {
        const introReady = !body.classList.contains('is-introducing') || body.dataset.introPhase === 'interactive';
        const allowed = introReady && motion() && fine.matches && innerWidth > 768 && currentView === 'home' && heroVisible;
        presentation.classList.toggle('is-3d-enabled', allowed);
        if (!allowed) {
            tilt.targetX = tilt.targetY = tilt.targetBulbX = tilt.targetBulbY = tilt.targetHover = 0;
            tilt.x = tilt.y = tilt.bulbX = tilt.bulbY = tilt.hover = tilt.velocityX = tilt.velocityY = tilt.velocityHover = 0;
            tilt.time = 0;
        } else {
            const elapsed = tilt.time ? Math.max(1, Math.min(64, now - tilt.time)) : 16;
            const ease = 1 - Math.exp(-elapsed / 120);
            tilt.x += (tilt.targetX - tilt.x) * ease;
            tilt.y += (tilt.targetY - tilt.y) * ease;
            if (Math.abs(tilt.targetX - tilt.x) < .0005) tilt.x = tilt.targetX;
            if (Math.abs(tilt.targetY - tilt.y) < .0005) tilt.y = tilt.targetY;
            const dt = Math.min(elapsed / 1000, .04);
            spring('bulbX', 'velocityX', 'targetBulbX', dt, .02);
            spring('bulbY', 'velocityY', 'targetBulbY', dt, .02);
            spring('hover', 'velocityHover', 'targetHover', dt, .0005);
            tilt.time = now;
        }
        setProperty(presentation, '--presentation-x', `${(tilt.x * 40).toFixed(3)}px`);
        setProperty(presentation, '--presentation-y', `${(tilt.y * 40).toFixed(3)}px`);
        setProperty(presentation, '--presentation-rotate-x', `${(-tilt.y * 8).toFixed(3)}deg`);
        setProperty(presentation, '--presentation-rotate-y', `${(tilt.x * 8).toFixed(3)}deg`);
        setProperty(lighting, '--bulb-pan-x', `${(-tilt.x * 80).toFixed(3)}px`);
        setProperty(lighting, '--bulb-pan-y', `${(-tilt.y * 80).toFixed(3)}px`);
        setProperty(lighting, '--bulb-x', `${tilt.bulbX.toFixed(3)}px`);
        setProperty(lighting, '--bulb-y', `${tilt.bulbY.toFixed(3)}px`);
        setProperty(lighting, '--bulb-ring-scale', (1 + tilt.hover * .5).toFixed(4));
        setProperty(lighting, '--bulb-ring-z', `${(allowed ? 40 * (1 - tilt.hover) : 0).toFixed(3)}px`);
        setProperty(lighting, '--bulb-switch-z', `${(allowed ? 80 * (1 - tilt.hover) : 0).toFixed(3)}px`);
        setProperty(lighting, '--bulb-switch-y', `${(tilt.hover * 20).toFixed(3)}px`);
        const moving = allowed && (tilt.x !== tilt.targetX || tilt.y !== tilt.targetY || tilt.bulbX !== tilt.targetBulbX || tilt.bulbY !== tilt.targetBulbY || tilt.hover !== tilt.targetHover || tilt.velocityX !== 0 || tilt.velocityY !== 0 || tilt.velocityHover !== 0);
        presentation.classList.toggle('is-pointer-moving', Boolean(moving));
        if (!moving) tilt.time = 0;
        return moving;
    }
    function updateComposition() {
        const height = innerHeight;
        const home = $('#home');
        if (currentView === 'home') {
            const heroRect = home.getBoundingClientRect();
            heroVisible = heroRect.bottom > 0 && heroRect.top < height;
            const videoRect = video.getBoundingClientRect();
            videoVisible = videoRect.bottom > 0 && videoRect.top < height;
            const exit = clamp(-heroRect.top / Math.max(heroRect.height, 1));
            setProperty(home, '--presentation-scroll-y', `${motion() ? exit * 50 : 0}px`);
        } else { videoVisible = false; heroVisible = false; }
        homeStory?.layout();
        if (currentView === 'about') {
            if (aboutStory) aboutStory.layout();
            else {
                const resume = $('#resume');
                const rect = resume.getBoundingClientRect();
                const progress = clamp((height - rect.top) / (height + rect.height));
                setProperty(resume, '--resume-word-x', `${motion() ? (progress - .5) * innerWidth * -.25 : 0}px`);
                setProperty(resume, '--resume-rotation', `${motion() ? -35 + progress * 120 : -25}deg`);
            }
        }
        canvases.forEach(canvas => {
            const rect = canvas.element.getBoundingClientRect();
            canvas.visible = !canvas.element.closest('[hidden]') && rect.bottom > 0 && rect.top < height;
            if (canvas.visible && (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height))) resizeCanvas(canvas, rect);
        });
        syncVideo();
        gallery?.resize();
    }
    function resizeCanvas(canvas, rect = canvas.element.getBoundingClientRect()) {
        canvas.width = Math.max(1, Math.round(rect.width));
        canvas.height = Math.max(1, Math.round(rect.height));
        const ratio = Math.min(devicePixelRatio || 1, 1.5);
        canvas.element.width = Math.round(canvas.width * ratio);
        canvas.element.height = Math.round(canvas.height * ratio);
        canvas.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    function drawCanvas(canvas, time) {
        const { context: ctx, width: w, height: h } = canvas;
        ctx.clearRect(0, 0, w, h);
        const color = getComputedStyle(root).getPropertyValue('--text').trim();
        ctx.fillStyle = color;
        const density = quality === 'low' ? .6 : quality === 'high' ? 1.35 : 1;
        if (canvas.mode === 'about') {
            const rows = Math.round(25 * density), columns = Math.round(43 * density);
            const radius = Math.min(w * .29, h * .43), centerX = w * .76, centerY = h * .58;
            const turn = time * .14 + (motion() ? pointer.x * .15 : 0);
            for (let row = 1; row < rows; row++) {
                const latitude = row / rows * Math.PI;
                for (let column = 0; column < columns; column++) {
                    const longitude = column / columns * Math.PI * 2;
                    const wave = 1 + Math.sin(latitude * 5 + longitude * 3 + time * .4) * .055;
                    const x = Math.sin(latitude) * Math.cos(longitude + turn) * radius * wave;
                    const z = Math.sin(latitude) * Math.sin(longitude + turn);
                    const y = Math.cos(latitude) * radius * wave;
                    const perspective = 1 + z * .14;
                    ctx.globalAlpha = (.13 + (z + 1) * .2) * (w < 650 ? .65 : 1);
                    const size = .7 + (z + 1) * .45;
                    ctx.fillRect(centerX + x * perspective, centerY + y * perspective + (motion() ? pointer.y * 8 : 0), size, size);
                }
            }
        } else {
            const rows = Math.round(29 * density), columns = Math.round(70 * density);
            for (let row = 0; row < rows; row++) {
                const depth = row / rows;
                for (let column = 0; column < columns; column++) {
                    const x = column / columns * 2 - 1;
                    const wave = Math.sin(x * 4.5 + depth * 7 + time * .5) * .08 + Math.cos(x * 7 - depth * 3 - time * .4) * .04;
                    ctx.globalAlpha = .1 + depth * .23;
                    const size = .6 + depth * 1.05;
                    ctx.fillRect(w * (.5 + x * (.65 + depth * .35)), h * (.38 + depth * .6 + wave), size, size);
                }
            }
        }
        ctx.globalAlpha = 1;
    }
    function render(now = performance.now()) {
        frame = 0;
        if (document.hidden) return;
        if (needsLayout) { needsLayout = false; updateComposition(); }
        const tilting = updateTilt(now);
        const readingHome = homeStory?.render(now) || false;
        const readingWorks = gallery?.render(now) || false;
        const readingAbout = aboutStory?.render(now) || false;
        const active = canvases.filter(canvas => canvas.visible);
        if (!motion() || now - lastCanvasFrame > 40) {
            active.forEach(canvas => drawCanvas(canvas, motion() ? now / 1000 : 0));
            lastCanvasFrame = now;
        }
        if (motion() && (active.length || tilting || readingHome || readingWorks || readingAbout)) requestRender();
    }
    function requestRender() { if (!frame && !document.hidden) frame = requestAnimationFrame(render); }
    function invalidate() { needsLayout = true; requestRender(); }

    function initializeGallery() {
        const section = $('#projects');
        const cases = $$('.project-grid > [data-project]', section);
        if (!cases.length) return null;
        let current = 0, all = false, lastChange = 0, wheelDelta = 0, start = null, blockClickUntil = 0, lastHeight = 0;
        section.classList.add('works-slider-ready');
        const backdrop = document.createElement('span');
        backdrop.className = 'works-backdrop'; backdrop.setAttribute('aria-hidden', 'true');
        section.prepend(backdrop);
        const cue = document.createElement('div');
        cue.className = 'page-scroll-cue works-progress-cue'; cue.innerHTML = '<span></span>';
        const cueText = document.createElement('span'); i18n.text(cueText, 'DESLIZA PARA CAMBIAR'); cue.append(cueText); section.append(cue);
        const dots = document.createElement('div'); dots.className = 'works-dots'; dots.setAttribute('role', 'group'); dots.setAttribute('aria-label', i18n.t('Seleccionar proyecto'));
        const dotButtons = cases.map((element, index) => {
            const button = document.createElement('button'); button.className = 'works-dot'; button.type = 'button';
            button.setAttribute('aria-label', i18n.t('Ver proyecto {number}', { number: index + 1 }));
            button.addEventListener('click', () => show(index)); dots.append(button); return button;
        });
        section.append(dots);
        const controls = document.createElement('div'); controls.className = 'works-navigation';
        controls.innerHTML = '<button type="button" data-works-prev>⟵</button><p class="works-counter" role="status" aria-live="polite"></p><button type="button" data-works-next>⟶</button>';
        section.append(controls);
        const previous = $('[data-works-prev]', controls), next = $('[data-works-next]', controls), count = $('.works-counter', controls);
        const viewToggle = document.createElement('button'); viewToggle.type = 'button'; viewToggle.className = 'works-view-toggle'; section.append(viewToggle);
        const story = window.portfolioNarratives?.createWorks({ section, cases, backdrop, cue, getCurrent: () => current, isGrid: () => all, getView: () => currentView, getFeatures: () => window.portfolioExperience.projectFeatures || {}, motion, fine, invalidate });
        const transitions = window.portfolioWorksExperience?.create({ section, cases, backdrop, getCurrent: () => current, isGrid: () => all, getView: () => currentView, motion, fine, navigate: offset => show(current + offset), invalidate });
        function labels() {
            previous.setAttribute('aria-label', i18n.t('Proyecto anterior')); next.setAttribute('aria-label', i18n.t('Proyecto siguiente'));
            dotButtons.forEach((button, index) => button.setAttribute('aria-label', i18n.t('Ver proyecto {number}', { number: index + 1 })));
            i18n.text(viewToggle, all ? 'Volver a la galería' : 'Ver todos los proyectos');
        }
        function resize() {
            story?.layout();
            if (currentView !== 'projects' || all || innerWidth > 650) return;
            const content = $('.project-content', cases[current]);
            const height = Math.max(780, innerHeight, parseFloat(getComputedStyle(content).top) + content.offsetHeight + 75);
            if (Math.abs(lastHeight - height) > 1) { lastHeight = height; section.style.setProperty('--works-mobile-height', `${height}px`); }
        }
        function show(index, animate = true) {
            const destination = clamp(index, 0, cases.length - 1), changed = destination !== current;
            if (!changed && animate) return false;
            const direction = destination >= current ? 1 : -1, from = cases[current];
            const restoreFocus = changed && from.contains(document.activeElement);
            const update = () => {
                current = destination;
                cases.forEach((element, position) => {
                    const selected = position === current;
                    element.classList.toggle('is-current-project', selected);
                    element.inert = !all && !selected;
                    if (!all && !selected) element.setAttribute('aria-hidden', 'true'); else element.removeAttribute('aria-hidden');
                    dotButtons[position].setAttribute('aria-pressed', String(selected));
                });
                i18n.text(backdrop, () => i18n.t($('.project-title', cases[current]).textContent));
                i18n.text(count, () => `${current + 1} / ${cases.length}`);
                previous.disabled = current === 0; next.disabled = current === cases.length - 1;
                if (changed && !all && currentView === 'projects' && innerWidth <= 650) window.scrollTo({ top: Math.max(0, window.scrollY + section.getBoundingClientRect().top), behavior: 'instant' });
                labels(); resize(); story?.select();
                if (restoreFocus && !all) ($('.project-content', cases[current]) || $('.project-preview', cases[current])).focus({ preventScroll: true });
                window.portfolioScroll?.refresh();
            };
            if (transitions) transitions.change({ from, to: cases[destination], direction, update, animate });
            else update();
            return changed;
        }
        previous.addEventListener('click', () => show(current - 1)); next.addEventListener('click', () => show(current + 1));
        viewToggle.addEventListener('click', () => {
            all = !all;
            if (!all) $('#resetProjects').click();
            section.classList.toggle('works-grid-view', all);
            viewToggle.setAttribute('aria-expanded', String(all));
            show(current, false);
            if (all) $('#projectSearch').focus({ preventScroll: true }); else viewToggle.focus({ preventScroll: true });
            invalidate();
        });
        section.addEventListener('wheel', event => {
            if (story || currentView !== 'projects' || all || innerWidth <= 650 || event.ctrlKey || $('dialog[open]') || !$('.chapter-curtain')?.hidden) return;
            const content = event.target.closest('.project-content');
            if (content && content.scrollHeight > content.clientHeight + 1 && ((event.deltaY > 0 && content.scrollTop + content.clientHeight < content.scrollHeight - 2) || (event.deltaY < 0 && content.scrollTop > 2))) return;
            const now = performance.now();
            event.preventDefault();
            if (now - lastChange < 850) return;
            wheelDelta += event.deltaY;
            if (Math.abs(wheelDelta) > 65) { show(current + Math.sign(wheelDelta)); lastChange = now; wheelDelta = 0; }
        }, { passive: false });
        section.addEventListener('pointerdown', event => { if (!transitions && event.pointerType === 'touch') start = { x: event.clientX, y: event.clientY }; });
        section.addEventListener('pointerup', event => {
            if (!start || all) return;
            const dx = event.clientX - start.x, dy = event.clientY - start.y; start = null;
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) { show(current - Math.sign(dx)); blockClickUntil = performance.now() + 500; }
        });
        section.addEventListener('click', event => { if (performance.now() < blockClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
        document.addEventListener('keydown', event => {
            if (currentView !== 'projects' || all || event.ctrlKey || event.metaKey || event.altKey || $('dialog[open]') || event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1)); }
        });
        document.addEventListener('portfolio:language', () => { labels(); resize(); });
        document.addEventListener('portfolio:view', () => { if (currentView === 'projects') { show(current, false); invalidate(); } });
        show(0, false);
        return { resize, show, isGrid: () => all, render: now => story?.render(now) || false };
    }

    function initialize() {
        if (initialized) return;
        initialized = true;
        const languageSwitch = $('.language-switch');
        if (languageSwitch) body.append(languageSwitch);
        body.classList.add('replica-ready');
        renderTitle(false);
        if (!window.portfolioIntro?.play()) renderTitle();
        lighting?.addEventListener('click', () => $('#themeToggle').click());
        syncLightingControl();
        presentation.addEventListener('pointerleave', () => resetTilt());
        lighting?.addEventListener('pointerleave', () => { tilt.targetBulbX = tilt.targetBulbY = tilt.targetHover = 0; requestRender(); });
        fine.addEventListener('change', () => { resetTilt(true); invalidate(); });
        homeStory = window.portfolioNarratives?.createHome({ motion, getView: () => currentView, fine, invalidate }) || null;
        gallery = initializeGallery();
        try { const saved = localStorage.getItem('portfolio.quality'); if (['low', 'medium', 'high'].includes(saved)) quality = saved; } catch {}
        const qualityControl = document.createElement('div'); qualityControl.className = 'experience-quality'; qualityControl.setAttribute('role', 'group'); qualityControl.setAttribute('aria-label', i18n.t('Calidad de la animación'));
        [['low', 'LQ'], ['medium', 'MQ'], ['high', 'HQ']].forEach(([value, text]) => {
            const button = document.createElement('button'); button.type = 'button'; button.dataset.quality = value; button.innerHTML = `<span>${text}</span><i aria-hidden="true"></i>`;
            button.setAttribute('aria-pressed', String(quality === value));
            button.addEventListener('click', () => { quality = value; $$('[data-quality]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.quality === quality))); try { localStorage.setItem('portfolio.quality', quality); } catch {} document.dispatchEvent(new CustomEvent('portfolio:quality', { detail: { quality } })); invalidate(); }); qualityControl.append(button);
        });
        $('.about-presentation').append(qualityControl);
        [['aboutCanvas', 'about'], ['contactCanvas', 'contact']].forEach(([id, mode]) => {
            const element = document.getElementById(id), context = element?.getContext('2d');
            if (context) canvases.push({ element, context, mode, visible: false, width: 0, height: 0 });
        });
        aboutStory = window.portfolioNarratives?.createAbout({ motion, getView: () => currentView, getQuality: () => quality, getPointer: () => pointer, invalidate }) || null;
        const point = document.createElement('span'); point.className = 'experience-cursor-point'; point.setAttribute('aria-hidden', 'true'); point.hidden = true; body.append(point);
        document.addEventListener('pointermove', event => {
            pointer.x = event.clientX / innerWidth * 2 - 1; pointer.y = event.clientY / innerHeight * 2 - 1; pointer.active = true;
            const custom = fine.matches && motion() && event.pointerType !== 'touch'; body.dataset.cursor = custom ? 'custom' : 'native'; point.hidden = !custom;
            if (custom) point.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
            const inside = custom && innerWidth > 768 && currentView === 'home' && presentation.contains(event.target);
            tilt.targetX = inside ? clamp(pointer.x, -1, 1) : 0;
            tilt.targetY = inside ? clamp(pointer.y, -1, 1) : 0;
            if (inside && lighting?.contains(event.target)) {
                const rect = lighting.getBoundingClientRect();
                tilt.targetBulbX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1) * lighting.offsetWidth / 3;
                tilt.targetBulbY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1) * lighting.offsetHeight / 3;
                tilt.targetHover = 1;
            } else tilt.targetBulbX = tilt.targetBulbY = tilt.targetHover = 0;
            invalidate();
        }, { passive: true });
        document.documentElement.addEventListener('pointerleave', () => { point.hidden = true; pointer.active = false; resetTilt(); });
        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(invalidate);
            $$('main > section').forEach(element => observer.observe(element));
        }
        new MutationObserver(records => {
            records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === 1 && node.classList.contains('marquee')) { node.dataset.view = 'about'; node.hidden = currentView !== 'about'; } }));
        }).observe(main, { childList: true });
        const stack = $('.stack-strip');
        if (stack) $('#skills').before(stack);
        $$('.marquee').forEach(element => { element.dataset.view = 'about'; element.hidden = currentView !== 'about'; $('#skills').before(element); });
        const target = viewFromLocation();
        if (target && target !== main) requestAnimationFrame(() => scrollTarget(target));
        invalidate();
    }
    addEventListener('scroll', invalidate, { passive: true });
    addEventListener('resize', invalidate, { passive: true });
    addEventListener('blur', () => resetTilt());
    function scrollTarget(target) { if (!window.portfolioExperience.alignTarget(target, { behavior: 'instant' })) target.scrollIntoView({ behavior: 'instant', block: 'start' }); }
    addEventListener('popstate', () => { const target = viewFromLocation() || $('#home'); revealTarget(target); requestAnimationFrame(() => scrollTarget(target)); });
    addEventListener('hashchange', () => { const target = viewFromLocation(); if (target) { revealTarget(target); requestAnimationFrame(() => scrollTarget(target)); } });
    document.addEventListener('portfolio:language', () => { if (initialized) { renderTitle(); syncLightingControl(); invalidate(); } });
    document.addEventListener('portfolio:motion', () => { if (initialized) { if (!motion()) { resetTilt(true); body.dataset.cursor = 'native'; const point = $('.experience-cursor-point'); if (point) point.hidden = true; } syncVideo(); invalidate(); } });
    document.addEventListener('portfolio:palette', () => { syncLightingControl(); invalidate(); });
    document.addEventListener('portfolio:intro-ready', invalidate);
    document.addEventListener('portfolio:intro-complete', invalidate);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { resetTilt(true); cancelAnimationFrame(frame); frame = 0; video?.pause(); } else invalidate(); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true }); else initialize();
})();
