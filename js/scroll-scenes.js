(() => {
    'use strict';
    const root = document.documentElement;
    const main = document.getElementById('main');
    if (!main) return;

    const preferences = matchMedia('(prefers-reduced-motion: reduce)');
    const compact = matchMedia('(max-width: 991.98px)');
    const clamp = value => Math.max(0, Math.min(1, value));
    const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
    const sections = [...main.querySelectorAll(':scope > section[id]')];
    const hero = document.getElementById('home');
    const nodes = new Map(), images = new Map();
    let enabled = false, printing = false, frame = 0, lastTime = 0;
    let scroll = window.scrollY, measureNeeded = true, height = innerHeight;

    sections.forEach(section => { section.dataset.scrollScene = section.id; });

    // Mido sin contar las transformaciones para que el scroll no se retroalimente xd.
    function layoutTop(element) {
        let top = 0;
        for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
        return top;
    }
    function measure() {
        height = innerHeight;
        [...main.querySelectorAll('[data-aos]')].forEach((element, index) => {
            if (hero?.contains(element)) return;
            let item = nodes.get(element);
            if (!item) {
                const heading = element.classList.contains('section-header'), card = element.hasAttribute('data-project');
                const direction = element.dataset.aos === 'fade-left' ? 1 : element.dataset.aos === 'fade-right' ? -1 : heading ? (index % 2 ? 1 : -1) : 0;
                item = { element, heading, card, direction, turn: index % 2 ? 1 : -1, zoom: element.dataset.aos === 'zoom-in', stagger: Math.min(Number(element.dataset.aosDelay || 0) / 1000, .14), last: -1 };
                nodes.set(element, item); element.classList.add('scroll-item');
            }
            item.top = layoutTop(element); item.height = element.offsetHeight; item.last = -1;
        });
        main.querySelectorAll('.project-screenshot').forEach(element => {
            element.classList.add('scroll-image');
            images.set(element, { element, top: layoutTop(element), height: element.offsetHeight });
        });
        measureNeeded = false;
    }
    function set(element, property, value) { element.style.setProperty(property, value); }
    function render(time = performance.now()) {
        frame = 0;
        if (!enabled || document.hidden) return;
        if (measureNeeded) measure();
        const target = window.scrollY;
        const elapsed = lastTime ? Math.min(64, time - lastTime) : 16;
        lastTime = time;
        if (Math.abs(target - scroll) > height * .9) scroll = target;
        else scroll += (target - scroll) * (1 - Math.exp(-elapsed / 65));
        if (Math.abs(target - scroll) < .25) scroll = target;
        const small = compact.matches;

        nodes.forEach(item => {
            const { element } = item;
            if (!element.isConnected || element.hidden || !item.height) return;
            const top = item.top - scroll;
            element.classList.toggle('is-scroll-active', top < height * 1.12 && top + item.height > -height * .15);
            const duration = height * (small ? .3 : .41) + Math.min(item.height * .12, height * .12);
            const progress = smooth((height * .98 - top) / duration - item.stagger);
            if (item.last === progress || (progress > 0 && progress < 1 && Math.abs(item.last - progress) < .0005)) return;
            item.last = progress;
            const rest = 1 - progress;
            set(element, '--scroll-x', `${rest * item.direction * (small ? 18 : item.heading ? 72 : 54)}px`);
            set(element, '--scroll-y', `${rest * (small ? 28 : item.heading ? 55 : 74)}px`);
            set(element, '--scroll-turn', `${small || !item.card ? 0 : rest * (item.direction || item.turn) * 1.8}deg`);
            set(element, '--scroll-scale', (1 - rest * (item.zoom ? .16 : item.heading ? .08 : .035)).toFixed(4));
            set(element, '--scroll-opacity', progress.toFixed(4));
        });
        images.forEach(item => {
            const top = item.top - scroll, active = top < height && top + item.height > 0;
            item.element.classList.toggle('is-scroll-active', active);
            if (!active) return;
            const progress = clamp((height - top) / (height + item.height));
            set(item.element, '--image-y', `${(progress - .5) * (small ? -10 : -24)}px`);
            set(item.element, '--image-scale', (1.105 - progress * .06).toFixed(4));
        });
        if (Math.abs(target - scroll) > .25) schedule();
    }
    function schedule() { if (enabled && !document.hidden && !frame) frame = requestAnimationFrame(render); }
    function refresh() { measureNeeded = true; schedule(); }
    function sync() {
        enabled = !printing && !preferences.matches && root.dataset.motion !== 'reduced';
        cancelAnimationFrame(frame); frame = 0; lastTime = 0;
        window.portfolioChapters?.sync(enabled);
        root.classList.toggle('scroll-scenes', enabled);
        if (!enabled) {
            nodes.forEach(item => item.element.classList.remove('is-scroll-active'));
            images.forEach(item => item.element.classList.remove('is-scroll-active'));
            return;
        }
        scroll = window.scrollY; measureNeeded = true; render();
    }
    window.portfolioScroll = { refresh };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', refresh, { passive: true });
    addEventListener('load', refresh, { once: true });
    addEventListener('beforeprint', () => { printing = true; sync(); });
    addEventListener('afterprint', () => { printing = false; sync(); });
    document.addEventListener('portfolio:motion', sync);
    document.addEventListener('portfolio:language', refresh);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
        else { scroll = window.scrollY; refresh(); }
    });
    preferences.addEventListener('change', sync); compact.addEventListener('change', refresh);
    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(refresh); observer.observe(main);
        sections.forEach(section => observer.observe(section));
    }
    if (document.fonts) document.fonts.ready.then(refresh);
    sync();
})();
