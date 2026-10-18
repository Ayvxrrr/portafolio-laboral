(() => {
    'use strict';
    let active = null;
    let played = false;
    function finish(state = active) {
        if (!state || active !== state) return;
        active = null;
        state.timers.forEach(clearTimeout);
        state.animations.forEach(animation => animation.cancel());
        state.cleanups.forEach(cleanup => cleanup());
        state.cover.hidden = true;
        state.hero.classList.remove('is-introducing');
        document.body.classList.remove('is-introducing');
        delete document.body.dataset.introPhase;
        document.dispatchEvent(new Event('portfolio:intro-complete'));
    }
    function skip() { finish(); }
    function play() {
        if (played || document.documentElement.dataset.motion === 'reduced' || document.body.dataset.view !== 'home' || location.hash && location.hash !== '#home' || typeof Element.prototype.animate !== 'function') return false;
        const hero = document.getElementById('home'), media = hero?.querySelector('.presentation-media'), cover = media?.querySelector('.presentation-intro-cover');
        if (!hero || !media || !cover) return false;
        played = true;
        const state = { hero, cover, animations: [], timers: [], cleanups: [] };
        active = state;
        hero.classList.add('is-introducing'); hero.classList.remove('is-3d-enabled');
        document.body.classList.add('is-introducing'); document.body.dataset.introPhase = 'cover';
        cover.hidden = false;
        const animate = (element, frames, options) => {
            if (!element) return;
            const animation = element.animate(frames, { fill: 'both', ...options });
            state.animations.push(animation); return animation;
        };
        try {
            const style = getComputedStyle(media);
            if (innerWidth > 768) {
                const scale = hero.clientWidth / media.offsetWidth;
                const depth = 1000 * (1 - 1 / scale);
                const x = hero.clientWidth / 2 - (media.offsetLeft + media.offsetWidth / 2);
                const y = hero.clientHeight / 2 - (media.offsetTop + media.offsetHeight / 2);
                const vertical = hero.clientHeight / media.offsetHeight / scale;
                animate(media, [{ transform: `translate3d(${x}px,${y}px,${depth}px) scaleY(${vertical})` }, { transform: 'translate3d(0,0,0) scaleY(1)' }], { duration: 1500, delay: 500, easing: 'cubic-bezier(.76,0,.24,1)' });
            } else {
                animate(media, [{ left: '0px', top: '0px', width: `${hero.clientWidth}px`, height: `${hero.clientHeight}px`, transform: 'none' }, { left: style.left, top: style.top, width: style.width, height: style.height, transform: 'none' }], { duration: 1300, delay: 350, easing: 'cubic-bezier(.76,0,.24,1)' });
            }
            animate(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 1500, delay: 1000, easing: 'ease-out' });
            hero.querySelectorAll('[data-presentation-line]').forEach((line, row) => line.querySelectorAll('.presentation-letter').forEach((letter, index) => animate(letter, [
                { transform: 'translate3d(-40%,120%,0)', opacity: 0 },
                { transform: 'translate3d(0,0,0)', opacity: 1 }
            ], { duration: 1000, delay: 1500 + row * 125 + index * 15, easing: 'ease-in-out' })));
            const depth = innerWidth > 768 ? 'translateZ(60px)' : '';
            animate(document.getElementById('presentationTheme'), [
                { transform: `${depth} scale(0)`, offset: 0 },
                { transform: `${depth} scale(1.16)`, offset: .46 },
                { transform: `${depth} scale(.94)`, offset: .65 },
                { transform: `${depth} scale(1.025)`, offset: .83 },
                { transform: `${depth} scale(1)`, offset: 1 }
            ], { duration: 2400, delay: 1500, easing: 'ease-out' });
            hero.querySelectorAll('.presentation-social .social-icon').forEach((icon, index) => animate(icon, [{ transform: 'translateY(60px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 850, delay: 1500 + index * 200, easing: 'cubic-bezier(.16,1,.3,1)' }));
            hero.querySelectorAll('.presentation-actions, .presentation-scroll, .presentation-location').forEach((element, index) => animate(element, [{ opacity: 0, transform: 'translateY(15px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, delay: 2300 + index * 100, easing: 'ease-out' }));
            state.timers.push(setTimeout(() => { if (active === state) { document.body.dataset.introPhase = 'interactive'; document.dispatchEvent(new Event('portfolio:intro-ready')); } }, 2050));
            state.timers.push(setTimeout(() => finish(state), 4600));
            Promise.all(state.animations.map(animation => animation.finished.catch(() => {}))).then(() => finish(state));
            const listen = (target, name, handler, options) => { target.addEventListener(name, handler, options); state.cleanups.push(() => target.removeEventListener(name, handler, options)); };
            listen(document, 'pointerdown', skip, { capture: true, passive: true });
            listen(document, 'click', skip, true);
            listen(document, 'wheel', skip, { passive: true });
            listen(document, 'touchstart', skip, { passive: true });
            listen(document, 'keydown', event => { if (['Escape', 'Tab', 'Enter', ' '].includes(event.key)) skip(); }, true);
            listen(window, 'resize', skip);
            return true;
        } catch { finish(state); return false; }
    }
    document.addEventListener('portfolio:language', skip);
    document.addEventListener('portfolio:motion', () => { if (document.documentElement.dataset.motion === 'reduced') skip(); });
    document.addEventListener('portfolio:view', () => { if (document.body.dataset.view !== 'home') skip(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) skip(); });
    window.portfolioIntro = { play, skip, isActive: () => Boolean(active) };
})();
