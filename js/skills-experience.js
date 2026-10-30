(() => {
    'use strict';
    const languages = {
        javascript: { name: 'JavaScript', symbol: 'JS', description: 'Interactividad en el navegador y lógica para conectar experiencias web.', usage: 'Interfaz · lógica · interacción' },
        php: { name: 'PHP', symbol: 'PHP', description: 'Lógica del servidor, formularios y acceso a la información.', usage: 'Servidor · formularios · datos' },
        python: { name: 'Python', symbol: 'Py', description: 'Fundamentos del lenguaje y resolución de problemas con código.', usage: 'Fundamentos · algoritmos · aprendizaje' },
        java: { name: 'Java', symbol: 'Jv', description: 'Programación orientada a objetos y desarrollo de servicios.', usage: 'Objetos · servicios · aplicaciones' },
        sql: { name: 'SQL', symbol: 'SQL', description: 'Consultas y organización de datos en bases relacionales.', usage: 'Consultas · relaciones · información' }
    };

    function initialize() {
        const section = document.getElementById('skills');
        const i18n = window.portfolioI18n;
        if (!section || !i18n) return;
        const $ = selector => section.querySelector(selector);
        const $$ = selector => [...section.querySelectorAll(selector)];
        const fine = matchMedia('(hover: hover) and (pointer: fine)');
        const motion = () => document.documentElement.dataset.motion !== 'reduced';
        const cards = $$('.skill-category-card');
        const choices = $$('.language-choice');
        const feature = $('#languageFeature');
        let selectedLanguage = 'javascript';

        function selectTechnology(card, key) {
            const buttons = [...card.querySelectorAll('.skill-trigger')];
            if (!buttons.some(button => button.dataset.tech === key)) return;
            card.dataset.selectedTech = key;
            buttons.forEach(button => {
                const selected = button.dataset.tech === key;
                button.setAttribute('aria-pressed', String(selected));
                button.closest('.skill-item').classList.toggle('is-selected', selected);
            });
        }
        cards.forEach(card => {
            const buttons = [...card.querySelectorAll('.skill-trigger')];
            buttons.forEach((button, index) => {
                const select = () => selectTechnology(card, button.dataset.tech);
                button.addEventListener('click', select);
                button.addEventListener('focus', select);
                button.addEventListener('keydown', event => {
                    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
                    buttons[next].focus();
                });
            });
            selectTechnology(card, buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.tech || buttons[0].dataset.tech);
        });

        function selectLanguage(key, animate = true) {
            const language = languages[key];
            if (!language) return;
            const changed = selectedLanguage !== key;
            selectedLanguage = key;
            feature.dataset.languageKey = key;
            choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.languageKey === key)));
            $('#languageMonogram').textContent = language.symbol;
            $('#languageFeatureTitle').textContent = language.name;
            i18n.text($('#languageFeatureDescription'), language.description);
            i18n.text($('#languageFeatureUsage'), language.usage);
            if (changed && animate && motion() && typeof Element.prototype.animate === 'function') {
                const core = $('#languageMonogram');
                core.getAnimations().forEach(animation => animation.cancel());
                core.animate([{ opacity: .35, transform: 'scale(.84) rotate(-12deg)' }, { opacity: 1, transform: 'scale(1) rotate(0deg)' }], { duration: 420, easing: 'cubic-bezier(.2,.7,.3,1)' });
            }
        }
        choices.forEach((button, index) => {
            button.addEventListener('click', event => {
                const changed = selectedLanguage !== button.dataset.languageKey;
                selectLanguage(button.dataset.languageKey);
                if (changed && !fine.matches && event.detail > 0) feature.scrollIntoView({ block: 'start', behavior: motion() ? 'smooth' : 'instant' });
            });
            button.addEventListener('keydown', event => {
                if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + choices.length) % choices.length;
                selectLanguage(choices[next].dataset.languageKey);
                choices[next].focus();
            });
        });
        $('#nextLanguage').addEventListener('click', () => {
            const index = choices.findIndex(button => button.dataset.languageKey === selectedLanguage);
            selectLanguage(choices[(index + 1) % choices.length].dataset.languageKey);
        });
        selectLanguage(selectedLanguage, false);

        // Solo calculo la inclinación al mover un ratón real, nunca al deslizar en móvil xd.
        const resets = new Map();
        $$('.skill-panel').forEach(panel => {
            let frame = 0, pointer = null;
            const reset = () => {
                cancelAnimationFrame(frame); frame = 0; pointer = null;
                panel.style.removeProperty('--panel-rx'); panel.style.removeProperty('--panel-ry');
            };
            resets.set(panel, reset);
            panel.addEventListener('pointermove', event => {
                if (!fine.matches || !motion() || event.pointerType === 'touch') return;
                pointer = { x: event.clientX, y: event.clientY };
                if (frame) return;
                frame = requestAnimationFrame(() => {
                    frame = 0;
                    if (!pointer || !fine.matches || !motion() || document.hidden) return;
                    const rect = panel.getBoundingClientRect();
                    const x = Math.max(-1, Math.min(1, (pointer.x - rect.left) / rect.width * 2 - 1));
                    const y = Math.max(-1, Math.min(1, (pointer.y - rect.top) / rect.height * 2 - 1));
                    panel.style.setProperty('--panel-rx', `${(-y * 2.5).toFixed(2)}deg`);
                    panel.style.setProperty('--panel-ry', `${(x * 2.5).toFixed(2)}deg`);
                });
            }, { passive: true });
            panel.addEventListener('pointerleave', reset);
            panel.addEventListener('pointercancel', reset);
        });
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => entries.forEach(entry => {
                entry.target.dataset.inView = String(entry.isIntersecting);
                if (!entry.isIntersecting) resets.get(entry.target)?.();
            }), { threshold: .05 });
            resets.forEach((reset, panel) => observer.observe(panel));
        } else resets.forEach((reset, panel) => { panel.dataset.inView = 'true'; });
        const resetPanels = () => {
            resets.forEach(reset => reset());
            if (!motion() || document.hidden) $('#languageMonogram').getAnimations?.().forEach(animation => animation.cancel());
        };
        fine.addEventListener('change', resetPanels);
        document.addEventListener('portfolio:motion', resetPanels);
        document.addEventListener('visibilitychange', () => {
            section.dataset.pageVisible = String(!document.hidden);
            if (document.hidden) resetPanels();
        });
        section.dataset.pageVisible = String(!document.hidden);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
    else initialize();
})();
