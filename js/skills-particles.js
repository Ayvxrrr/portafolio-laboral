(() => {
    'use strict';
    const section = document.getElementById('skills');
    const canvas = document.getElementById('skillsParticles');
    if (!section || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const root = document.documentElement;
    let visible = false, frame = 0, lastFrame = 0, elapsed = 0;
    let width = 0, height = 0, needsResize = true, points = [];
    let scrollProgress = .5, targetProgress = .5;
    const pointer = { x: 0, y: 0, clientX: 0, clientY: 0, active: false, strength: 0 };
    const moving = () => root.dataset.motion !== 'reduced';
    const active = () => visible && !document.hidden && !section.closest('[hidden]');
    const randomCenter = () => (Math.random() + Math.random() + Math.random()) / 3;

    function resize() {
        const rect = section.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;
        width = rect.width;
        height = rect.height;
        // Un píxel por punto limita el consumo en pantallas de alta densidad.
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const count = Math.min(7500, Math.max(4500, Math.round(width * height / 160)));
        points = Array.from({ length: count }, () => ({
            x: randomCenter(),
            y: Math.random(),
            phase: Math.random() * Math.PI * 2,
            speed: .35 + Math.random() * .65,
            drift: 4 + Math.random() * 22,
            size: Math.random() > .94 ? 1.4 : .7,
            opacity: .18 + Math.random() * .45
        }));
        needsResize = false;
        return true;
    }

    function draw(now) {
        frame = 0;
        if (!active()) { lastFrame = 0; return; }
        if (needsResize && !resize()) return;
        if (moving() && lastFrame && now - lastFrame < 32) {
            frame = requestAnimationFrame(draw);
            return;
        }
        if (moving() && lastFrame) elapsed += Math.min(now - lastFrame, 80) / 1000;
        lastFrame = now;
        if (moving()) {
            scrollProgress += (targetProgress - scrollProgress) * .08;
            pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * .12;
        } else {
            pointer.strength = 0;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = root.dataset.theme === 'light' ? '#111' : '#fff';
        for (const point of points) {
            const angle = elapsed * point.speed * .3 + point.phase + (moving() ? scrollProgress * 1.5 : 0);
            let x = point.x * width + Math.cos(angle) * point.drift;
            let y = point.y * height + Math.sin(angle * .8) * point.drift;
            if (pointer.strength > .001) {
                const dx = x - pointer.x, dy = y - pointer.y;
                const distance = Math.max(1, Math.hypot(dx, dy));
                const force = 48 * pointer.strength * Math.exp(-(distance * distance) / (2 * 125 * 125));
                x += dx / distance * force;
                y += dy / distance * force;
            }
            context.globalAlpha = point.opacity;
            context.fillRect(x, y, point.size, point.size);
        }
        context.globalAlpha = 1;
        if (moving()) frame = requestAnimationFrame(draw);
    }

    function stop() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastFrame = 0;
    }
    function refresh() {
        if (!active()) { stop(); return; }
        if (!frame) frame = requestAnimationFrame(draw);
    }
    function updatePosition() {
        if (!active()) return;
        const rect = section.getBoundingClientRect();
        targetProgress = Math.max(0, Math.min(1, (innerHeight - rect.top) / Math.max(1, innerHeight + rect.height)));
        if (pointer.active) {
            pointer.x = pointer.clientX - rect.left;
            pointer.y = pointer.clientY - rect.top;
        }
        if (moving()) refresh();
    }
    section.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch' || !moving()) return;
        pointer.clientX = event.clientX;
        pointer.clientY = event.clientY;
        pointer.active = true;
        updatePosition();
    }, { passive: true });
    section.addEventListener('pointerleave', () => { pointer.active = false; refresh(); });
    section.addEventListener('pointercancel', () => { pointer.active = false; refresh(); });
    addEventListener('scroll', updatePosition, { passive: true });
    function resizeAndRefresh() { needsResize = true; refresh(); }
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) updatePosition();
            refresh();
        }).observe(section);
    } else {
        const updateVisibility = () => {
            const rect = section.getBoundingClientRect();
            visible = rect.width > 0 && rect.bottom > 0 && rect.top < innerHeight;
            refresh();
        };
        addEventListener('scroll', updateVisibility, { passive: true });
        addEventListener('resize', updateVisibility, { passive: true });
        updateVisibility();
    }
    if ('ResizeObserver' in window) new ResizeObserver(resizeAndRefresh).observe(section);
    else addEventListener('resize', resizeAndRefresh, { passive: true });
    document.addEventListener('visibilitychange', refresh);
    document.addEventListener('portfolio:motion', refresh);
    document.addEventListener('portfolio:view', refresh);
    document.addEventListener('portfolio:palette', refresh);
})();
