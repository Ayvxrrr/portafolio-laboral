(() => {
    'use strict';
    const ease = 'cubic-bezier(.16,1,.3,1)';
    const full = 'polygon(0 0,100% 0,100% 100%,0 100%)';
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    function imageFrames(direction, compact) {
        const d = direction < 0 ? -1 : 1;
        const closed = d > 0 ? 'polygon(100% 0,100% 0,100% 100%,100% 100%)' : 'polygon(0 0,0 0,0 100%,0 100%)';
        return [
            { clipPath: closed, transform: `perspective(1100px) translate3d(${d * (compact ? 8 : 18)}%,0,0) rotateY(${d * (compact ? -5 : -24)}deg) rotateZ(${d * (compact ? 0 : 3)}deg) scale(1.06)` },
            { clipPath: full, transform: 'perspective(1100px) translate3d(0,0,0) rotateY(0deg) rotateZ(0deg) scale(1)' }
        ];
    }
    function swipeOffset(dx, dy, width) {
        const threshold = clamp(width * .16, 48, 90);
        return Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.4 ? -Math.sign(dx) : 0;
    }

    function create({ section, cases, backdrop, getCurrent, isGrid, getView, motion, fine, navigate, invalidate }) {
        const records = cases.map(element => {
            const preview = element.querySelector('.project-preview');
            const stage = element.querySelector('.work-preview-stage');
            let layer = preview, curtain = null;
            if (stage) {
                layer = document.createElement('div'); layer.className = 'work-preview-motion';
                preview.before(layer); layer.append(preview);
                curtain = document.createElement('span'); curtain.className = 'work-media-curtain';
                curtain.setAttribute('aria-hidden', 'true'); layer.append(curtain);
            }
            const image = preview.querySelector('.project-screenshot');
            if (image) image.draggable = false;
            const title = element.querySelector('.project-title');
            let titleInk = null;
            if (title) {
                title.classList.add('work-title-mask');
                titleInk = document.createElement('span'); titleInk.className = 'work-title-ink';
                while (title.firstChild) titleInk.append(title.firstChild);
                title.append(titleInk);
            }
            return { element, preview, stage, layer, curtain, image, titleInk, content: element.querySelector('.project-content') };
        });
        let active = null, gesture = null, dragFrame = 0, snap = null, blockClickUntil = 0;
        const visible = () => getView() === 'projects' && !isGrid() && !document.hidden;
        const animated = () => visible() && motion() && typeof Element.prototype.animate === 'function';
        function warm() {
            if (getView() !== 'projects') return;
            records.forEach(record => { if (record.image) record.image.loading = 'eager'; });
        }
        function resetGesture() {
            cancelAnimationFrame(dragFrame); dragFrame = 0;
            const previous = gesture; gesture = null;
            if (previous?.capture?.hasPointerCapture?.(previous.id)) previous.capture.releasePointerCapture(previous.id);
            section.classList.remove('is-works-dragging');
            delete document.body.dataset.worksPointer;
            return previous;
        }
        function finish() {
            const previous = active; active = null;
            if (previous) {
                clearTimeout(previous.watchdog);
                previous.animations.forEach(animation => animation.cancel());
                previous.echo?.remove();
            }
            snap?.cancel(); snap = null;
            resetGesture();
            records.forEach(record => {
                record.element.classList.remove('is-leaving-project', 'is-entering-project');
                record.layer.style.removeProperty('transform');
            });
            section.classList.remove('is-works-transitioning');
            section.dataset.worksTransition = 'idle';
            invalidate();
        }
        function animate(state, element, frames, options = {}) {
            if (!element) return;
            const animation = element.animate(frames, { duration: 850, easing: ease, fill: 'both', ...options });
            state.animations.push(animation);
        }
        function change({ from, to, direction, update, animate: requested = true }) {
            const outgoing = records.find(record => record.element === from);
            const incoming = records.find(record => record.element === to);
            const initial = outgoing ? getComputedStyle(outgoing.layer).transform : 'none';
            const allowed = requested && from !== to && outgoing && incoming && animated();
            const echo = allowed ? backdrop.cloneNode(true) : null;
            finish();
            if (echo) {
                echo.classList.add('works-backdrop-echo'); echo.setAttribute('data-i18n-ignore', '');
                echo.setAttribute('aria-hidden', 'true'); echo.inert = true; section.append(echo);
            }
            update(); warm();
            if (!allowed) return;
            const d = direction < 0 ? -1 : 1, compact = innerWidth <= 650;
            const state = { animations: [], echo, watchdog: 0 }; active = state;
            section.classList.add('is-works-transitioning');
            section.dataset.worksTransition = 'running';
            section.dataset.worksDirection = d > 0 ? 'next' : 'previous';
            from.classList.add('is-leaving-project'); to.classList.add('is-entering-project');
            try {
                animate(state, outgoing.layer, [
                    { transform: initial, opacity: 1 },
                    { transform: `perspective(1100px) translate3d(${-d * 14}%,0,-90px) rotateY(${d * (compact ? 4 : 17)}deg) scale(.94)`, opacity: 0 }
                ], { duration: 800, easing: 'cubic-bezier(.55,0,.25,1)' });
                animate(state, incoming.layer, imageFrames(d, compact), { duration: compact ? 820 : 1050 });
                animate(state, incoming.curtain, [
                    { transform: `translateX(0%) skewX(${-d * 12}deg) scaleX(1.3)` },
                    { transform: `translateX(${-d * 130}%) skewX(${-d * 12}deg) scaleX(1.3)` }
                ], { duration: compact ? 680 : 900, delay: 90, easing: 'cubic-bezier(.76,0,.24,1)' });
                animate(state, outgoing.content, [
                    { opacity: 1, transform: 'translate3d(0,0,0)' },
                    { opacity: 0, transform: `translate3d(${-d * 24}px,-24px,0)` }
                ], { duration: 280 });
                animate(state, incoming.content, [
                    { opacity: 0, transform: `perspective(1200px) translate3d(${d * 32}px,35px,0) rotateY(${-d * 5}deg)` },
                    { opacity: 1, transform: 'perspective(1200px) translate3d(0,0,0) rotateY(0deg)' }
                ], { duration: 780, delay: 160 });
                animate(state, outgoing.titleInk, [
                    { transform: 'translateY(0) rotateX(0deg)' }, { transform: 'translateY(-110%) rotateX(-35deg)' }
                ], { duration: 320 });
                animate(state, incoming.titleInk, [
                    { transform: 'translateY(110%) rotateX(35deg)' }, { transform: 'translateY(0) rotateX(0deg)' }
                ], { duration: 800, delay: 170 });
                animate(state, echo, [
                    { opacity: 1, transform: getComputedStyle(echo).transform },
                    { opacity: 0, transform: `translate3d(${-d * 18}vw,0,0) skewX(${-d * 9}deg)` }
                ], { duration: 500 });
                [...backdrop.querySelectorAll('.work-backdrop-letter')].forEach((letter, index) => animate(state, letter, [
                    { opacity: 0, transform: `perspective(700px) translate3d(${d * 55}px,16%,0) rotateY(${-d * 55}deg)` },
                    { opacity: 1, transform: 'perspective(700px) translate3d(0,0,0) rotateY(0deg)' }
                ], { duration: 850, delay: 90 + Math.min(index * 16, 190) }));
                animate(state, section.querySelector('.works-counter'), [
                    { opacity: .2, transform: `translateY(${d * 12}px)` }, { opacity: 1, transform: 'translateY(0)' }
                ], { duration: 450 });
                state.watchdog = setTimeout(() => { if (active === state) finish(); }, 1800);
                Promise.all(state.animations.map(animation => animation.finished)).then(
                    () => { if (active === state) finish(); },
                    () => { if (active === state) finish(); }
                );
            } catch { if (active === state) finish(); }
        }
        function settle(record, initial) {
            record.layer.style.removeProperty('transform');
            if (!animated()) return;
            snap?.cancel();
            const animation = record.layer.animate([{ transform: initial }, { transform: 'none' }], { duration: 460, easing: ease });
            snap = animation;
            animation.finished.then(() => { if (snap === animation) snap = null; }, () => {});
        }
        section.addEventListener('pointerdown', event => {
            if (!visible() || active || gesture || event.isPrimary === false || event.button > 0 || event.ctrlKey || event.metaKey || event.altKey) return;
            const record = records[getCurrent()], touch = event.pointerType === 'touch';
            const onPreview = record.preview.contains(event.target);
            if ((!touch && (!fine.matches || !onPreview)) || (!onPreview && event.target.closest('a,button,input,textarea,select'))) return;
            snap?.cancel(); snap = null;
            // Capturo en el contenedor estable, no en la imagen que se inclina y cambia de capa xd.
            gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0, record, onPreview, dragging: false, capture: section, width: record.preview.offsetWidth };
        });
        section.addEventListener('pointermove', event => {
            if (!visible()) return;
            if (!gesture) {
                const hover = records[getCurrent()].preview.contains(event.target) && fine.matches && motion() && event.pointerType !== 'touch';
                if (hover) document.body.dataset.worksPointer = 'hover'; else delete document.body.dataset.worksPointer;
                return;
            }
            if (gesture.id !== event.pointerId) return;
            gesture.dx = event.clientX - gesture.x; gesture.dy = event.clientY - gesture.y;
            if (!gesture.dragging && Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2) {
                gesture.dragging = true; gesture.capture.setPointerCapture?.(gesture.id);
                section.classList.add('is-works-dragging'); invalidate();
            }
            if (!gesture.dragging) return;
            if (event.cancelable) event.preventDefault();
            if (fine.matches && event.pointerType !== 'touch') document.body.dataset.worksPointer = 'dragging';
            if (!motion() || !gesture.onPreview || dragFrame) return;
            dragFrame = requestAnimationFrame(() => {
                dragFrame = 0;
                if (!gesture?.dragging) return;
                const dx = clamp(gesture.dx, -300, 300), ratio = clamp(dx / Math.max(1, gesture.width), -1, 1);
                gesture.record.layer.style.transform = `perspective(1000px) translate3d(${dx * .38}px,${clamp(gesture.dy * .1, -18, 18)}px,0) rotateY(${ratio * 15}deg) rotateZ(${ratio * 3}deg) scale(.985)`;
            });
        }, { passive: false });
        section.addEventListener('pointerup', event => {
            if (!gesture || gesture.id !== event.pointerId) return;
            gesture.dx = event.clientX - gesture.x; gesture.dy = event.clientY - gesture.y;
            const previous = resetGesture();
            if (!previous.dragging) return;
            blockClickUntil = performance.now() + 500;
            const offset = swipeOffset(previous.dx, previous.dy, previous.width);
            if (!offset || !navigate(offset)) settle(previous.record, getComputedStyle(previous.record.layer).transform);
        });
        section.addEventListener('pointercancel', event => {
            if (gesture && event.pointerId !== undefined && event.pointerId !== gesture.id) return;
            const previous = resetGesture();
            if (previous) settle(previous.record, getComputedStyle(previous.record.layer).transform);
        });
        section.addEventListener('lostpointercapture', event => {
            if (!gesture || event.pointerId !== gesture.id || event.target !== gesture.capture) return;
            const previous = resetGesture(); settle(previous.record, getComputedStyle(previous.record.layer).transform);
        });
        section.addEventListener('pointerleave', () => { if (!gesture) delete document.body.dataset.worksPointer; });
        section.addEventListener('click', event => {
            if (performance.now() >= blockClickUntil || event.target.closest('.works-navigation,.works-dots,.works-view-toggle')) return;
            event.preventDefault(); event.stopImmediatePropagation();
        }, true);
        document.addEventListener('portfolio:view', () => { finish(); warm(); });
        document.addEventListener('portfolio:motion', finish);
        document.addEventListener('portfolio:language', finish);
        document.addEventListener('visibilitychange', finish);
        fine.addEventListener('change', finish);
        addEventListener('resize', finish);
        addEventListener('blur', finish);
        section.classList.add('works-experience-ready');
        section.dataset.worksTransition = 'idle'; warm();
        return { change, finish };
    }
    window.portfolioWorksExperience = { create, motion: { imageFrames, swipeOffset } };
})();
