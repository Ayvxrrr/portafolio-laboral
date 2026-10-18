(() => {
    'use strict';
    const root = document.documentElement;
    const main = document.getElementById('main');
    const i18n = window.portfolioI18n;
    if (!main || !i18n) return;

    const definitions = [
        { id: 'home', label: 'Inicio', number: '01' },
        { id: 'projects', label: 'Trabajos', number: '02', inverted: true },
        { id: 'about', label: 'Sobre mí', number: '03' }
    ].filter(chapter => document.getElementById(chapter.id));
    const total = '03';
    const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    let enabled = false;
    let navigation = null;
    let curtainChapter = definitions[0];

    function label(chapter) { return i18n.t(chapter.label).toLocaleUpperCase(root.lang); }
    function letters(chapter) {
        return [...label(chapter)].map((char, index) => `<span class="chapter-letter" style="--letter-index:${index}">${char === ' ' ? '&nbsp;' : escape(char)}</span>`).join('');
    }
    function fit(stage, chapter) {
        stage.style.setProperty('--chapter-length', Math.max(5, label(chapter).length));
    }
    function createStage(chapter) {
        const stage = document.createElement('div');
        stage.className = 'chapter-stage';
        stage.innerHTML = '<div class="chapter-frame"></div><div class="chapter-meta"><span>AYVAR JOSE / PORTFOLIO</span><span class="chapter-index"></span></div><div class="chapter-copy"><span class="chapter-outline"></span><p class="chapter-word"></p></div><div class="chapter-bottom"><span class="chapter-hint"></span><span class="chapter-arrow">↘</span></div><span class="chapter-rule"></span>';
        stage.querySelector('.chapter-index').textContent = `${chapter.number} / ${total}`;
        i18n.html(stage.querySelector('.chapter-word'), () => letters(chapter));
        i18n.text(stage.querySelector('.chapter-outline'), () => label(chapter));
        i18n.text(stage.querySelector('.chapter-hint'), 'DESLIZA PARA ENTRAR');
        i18n.text(stage.querySelector('.chapter-meta > span:first-child'), 'AYVAR JOSE / PORTAFOLIO');
        fit(stage, chapter);
        return stage;
    }
    const curtain = document.createElement('div');
    curtain.className = 'chapter-curtain';
    curtain.hidden = true;
    curtain.setAttribute('aria-hidden', 'true');
    curtain.setAttribute('data-i18n-ignore', '');
    const curtainStage = createStage(curtainChapter);
    curtain.append(curtainStage);
    document.body.append(curtain);
    i18n.text(curtainStage.querySelector('.chapter-hint'), 'IDEAS QUE TOMAN FORMA');
    i18n.html(curtainStage.querySelector('.chapter-word'), () => letters(curtainChapter));
    i18n.text(curtainStage.querySelector('.chapter-outline'), () => label(curtainChapter));

    function finishNavigation(commit = false) {
        const state = navigation;
        navigation = null;
        if (state) {
            clearTimeout(state.timer);
            clearTimeout(state.watchdog);
            state.resume?.();
            state.animations.forEach(animation => animation.cancel());
            if (commit && !state.committed) { state.committed = true; state.arrive(); }
        }
        curtain.hidden = true;
        root.classList.remove('has-chapter-transition');
    }
    function sync(next) {
        enabled = next;
        if (!enabled) finishNavigation(true);
    }
    function animate(state, element, frames, options) {
        const animation = element.animate(frames, options);
        state.animations.push(animation);
        return animation;
    }
    async function play(state) {
        try {
            const covers = state.destination === 'projects' ? [
                { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' },
                { clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 15% 100%)', offset: .6 },
                { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }
            ] : state.destination === 'home' ? [
                { clipPath: 'polygon(0 50%, 100% 50%, 100% 50%, 0 50%)' },
                { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }
            ] : [
                { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' },
                { clipPath: 'polygon(0 36%, 100% 15%, 100% 100%, 0 100%)', offset: .55 },
                { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }
            ];
            const cover = animate(state, curtain, covers, { duration: 440, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'both' });
            curtain.querySelectorAll('.chapter-letter').forEach((letter, index) => animate(state, letter, [
                { transform: 'translate3d(0, 125%, 0) rotateX(65deg)', opacity: 0 },
                { transform: 'translate3d(0, 0, 0) rotateX(0deg)', opacity: 1 }
            ], { duration: 460, delay: 100 + index * 20, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }));
            animate(state, curtain.querySelector('.chapter-outline'), [
                { transform: 'translate3d(10%, -65%, 0) scale(1.2)' },
                { transform: 'translate3d(-8%, -65%, 0) scale(1.2)' }
            ], { duration: 1300, easing: 'ease-out', fill: 'both' });
            await cover.finished;
            if (navigation !== state) return;
            state.committed = true;
            state.arrive();
            window.portfolioScroll?.refresh();
            await new Promise(resolve => { state.resume = resolve; state.timer = setTimeout(resolve, 340); });
            if (navigation !== state) return;
            animate(state, curtain.querySelector('.chapter-word'), [
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(-45%)' }
            ], { duration: 380, easing: 'ease-in', fill: 'both' });
            await animate(state, curtain, [
                { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
                { clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 10%)', offset: .65 },
                { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }
            ], { duration: 500, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'both' }).finished;
        } catch {
            if (navigation === state && !state.committed) { state.committed = true; state.arrive(); }
        } finally {
            if (navigation === state) finishNavigation();
        }
    }
    function navigate(target, arrive) {
        const section = target.closest('main > section[id]');
        const destination = window.portfolioExperience?.viewFor(target) || section?.id;
        if (destination === window.portfolioExperience.currentSection()) return false;
        const chapter = definitions.find(item => item.id === destination);
        if (!enabled || !chapter || document.hidden || typeof curtain.animate !== 'function') return false;
        finishNavigation();
        curtainChapter = chapter;
        fit(curtainStage, chapter);
        curtain.classList.toggle('is-inverted', Boolean(chapter.inverted));
        curtain.dataset.destination = chapter.id;
        curtainStage.querySelector('.chapter-index').textContent = `${chapter.number} / ${total}`;
        i18n.html(curtainStage.querySelector('.chapter-word'), () => letters(curtainChapter));
        i18n.text(curtainStage.querySelector('.chapter-outline'), () => label(curtainChapter));
        curtain.hidden = false;
        root.classList.add('has-chapter-transition');
        const state = { arrive, destination, committed: false, animations: [], timer: 0, watchdog: 0, resume: null };
        navigation = state;
        state.watchdog = setTimeout(() => { if (navigation === state) finishNavigation(true); }, 2600);
        void play(state);
        return true;
    }

    window.portfolioChapters = { sync, navigate };
    document.addEventListener('portfolio:language', () => {
        fit(curtainStage, curtainChapter);
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation) finishNavigation(true); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && navigation) finishNavigation(true); });
})();
