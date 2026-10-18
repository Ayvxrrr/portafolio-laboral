(() => {
    'use strict';
    const section = document.querySelector('#playground');
    const stage = document.querySelector('#portraitStage');
    const canvas = document.querySelector('#robotParticles');
    const status = document.querySelector('#portraitStatus');
    if (!section || !stage || !canvas || !status) return;

    const pointer = { x: 0, y: 0, active: false };
    let visible = false, frame = 0, robot = null, attempted = false, progress = .5, measureNeeded = true, bounds = null;
    let motionEnabled = document.documentElement.dataset.motion !== 'reduced';

    function readQuality() {
        try {
            const saved = localStorage.getItem('portfolio.quality');
            if (['low', 'medium', 'high'].includes(saved)) return saved;
        } catch {}
        return 'medium';
    }
    let selectedQuality = readQuality();

    function invalidate() {
        measureNeeded = true;
        schedule();
    }
    function measure() {
        bounds = stage.getBoundingClientRect();
        progress = Math.max(0, Math.min(1, (innerHeight - bounds.top) / Math.max(1, innerHeight + bounds.height)));
        measureNeeded = false;
    }

    function loadRobot() {
        if (attempted) return;
        attempted = true;
        stage.dataset.state = 'loading';
        status.textContent = 'Preparando robot interactivo…';
        status.hidden = false;
        if (!window.portfolioAboutRobot?.createParticles) {
            stage.dataset.state = 'error';
            status.textContent = 'No se pudo cargar el robot 3D. Intenta abrir el portafolio desde el servidor web.';
            console.error('No está disponible el renderizador del robot interactivo.');
            return;
        }
        window.portfolioAboutRobot.createParticles(canvas, () => selectedQuality, invalidate).then(model => {
            robot = model;
            stage.dataset.state = 'ready';
            status.hidden = true;
            invalidate();
        }).catch(error => {
            stage.dataset.state = 'error';
            status.textContent = 'No se pudo cargar el robot 3D. Intenta abrir el portafolio desde el servidor web.';
            status.hidden = false;
            console.error('No se pudo crear el robot interactivo de partículas.', error);
        });
    }

    function animate(now) {
        frame = 0;
        if (!visible || document.hidden || !robot) return;
        if (measureNeeded) measure();
        if (!bounds.width || bounds.bottom <= 0 || bounds.top >= innerHeight || stage.closest('[hidden]')) return;
        const keepAnimating = robot.render({
            progress,
            pointerX: pointer.x,
            pointerY: pointer.y,
            pointerActive: pointer.active,
            motion: motionEnabled,
            visible,
            now
        });
        if (keepAnimating) schedule();
    }

    function schedule() {
        if (visible && robot && !document.hidden && !frame) frame = requestAnimationFrame(animate);
    }

    function setPointer(event) {
        if (event.target.closest('a, button')) { releasePointer(); return; }
        if (event.pointerType === 'touch' && event.type !== 'pointerdown' && !pointer.active) return;
        if (measureNeeded || !bounds) measure();
        pointer.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
        pointer.y = Math.max(-1, Math.min(1, 1 - ((event.clientY - bounds.top) / bounds.height) * 2));
        pointer.active = true;
        schedule();
    }

    function releasePointer() { pointer.active = false; schedule(); }
    function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; }
    stage.addEventListener('pointermove', setPointer, { passive: true });
    stage.addEventListener('pointerleave', releasePointer);
    stage.addEventListener('pointerdown', setPointer, { passive: true });
    stage.addEventListener('pointerup', event => { if (event.pointerType !== 'mouse') releasePointer(); });
    stage.addEventListener('pointercancel', releasePointer);
    addEventListener('scroll', invalidate, { passive: true });
    addEventListener('resize', () => { robot?.resize(); invalidate(); }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else invalidate(); });
    document.addEventListener('portfolio:view', () => { if (stage.closest('[hidden]')) { visible = false; stop(); } else { if (!('IntersectionObserver' in window)) visible = true; invalidate(); } });
    document.addEventListener('portfolio:quality', event => { selectedQuality = event.detail.quality; invalidate(); });
    addEventListener('storage', event => { if (event.key === 'portfolio.quality') { selectedQuality = readQuality(); invalidate(); } });
    document.addEventListener('portfolio:motion', () => {
        motionEnabled = document.documentElement.dataset.motion !== 'reduced';
        schedule();
    });
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); stop(); stage.dataset.state = 'loading'; status.hidden = false; });
    canvas.addEventListener('webglcontextrestored', () => { stage.dataset.state = 'ready'; status.hidden = true; robot?.resize(); invalidate(); });

    if ('IntersectionObserver' in window) {
        // Precargo el busto cerca de la vista; fuera de pantalla no dibujo nada xd.
        const preload = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { loadRobot(); preload.disconnect(); }
        }, { rootMargin: '200px' });
        preload.observe(stage);
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) {
                loadRobot();
                invalidate();
            } else stop();
        });
        observer.observe(stage);
    } else {
        visible = true;
        measure();
        loadRobot();
    }
})();
