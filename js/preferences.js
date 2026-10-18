// Cargo el tema antes de pintar la página para evitar el parpadeo xd.
(() => {
    const root = document.documentElement;
    root.dataset.accent = 'mono';
    try {
        const theme = localStorage.getItem('portfolio.theme');
        const language = localStorage.getItem('portfolio.language');
        if (['dark', 'light'].includes(theme)) root.dataset.theme = theme;
        if (['es', 'en'].includes(language)) root.lang = language;
        const paused = localStorage.getItem('portfolio.motion') === 'paused';
        root.dataset.motion = paused || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
    } catch {
        root.dataset.motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
    }
    try { localStorage.setItem('portfolio.accent', 'mono'); } catch {}
})();
