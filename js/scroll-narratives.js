(() => {
    'use strict';
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    const i18n = window.portfolioI18n;
    const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
    const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
    const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const set = (element, property, value) => { if (element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value); };
    function layoutTop(element) { let top = 0; for (let node = element; node; node = node.offsetParent) top += node.offsetTop; return top; }
    function meter(element, caption, label) {
        const track = document.createElement('span'); track.className = 'scroll-meter-track';
        track.setAttribute('role', 'progressbar'); track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', '100'); track.setAttribute('aria-valuenow', '0'); track.setAttribute('aria-label', i18n.t(label));
        const fill = document.createElement('i'); fill.className = 'scroll-meter-fill'; fill.setAttribute('aria-hidden', 'true'); track.append(fill);
        const text = document.createElement('span'); text.className = 'scroll-meter-caption'; i18n.text(text, caption);
        element.replaceChildren(track, text);
        return progress => {
            const value = clamp(progress);
            set(element, '--reading-progress', value.toFixed(4));
            const rounded = String(Math.round(value * 100));
            if (track.getAttribute('aria-valuenow') !== rounded) track.setAttribute('aria-valuenow', rounded);
        };
    }
    function createHome({ motion, getView, fine, invalidate }) {
        const section = $('#statement'), biography = $('#biography');
        if (!section || !biography) return null;
        const photo = $('.statement-photo', section), badge = $('.statement-badge', section);
        const lines = $$('.statement-stroke > span, .statement-fill > span', section).map((element, row) => {
            const source = i18n.sourceOf(element.textContent.trim());
            element.classList.add('statement-line');
            i18n.html(element, () => {
                const text = i18n.t(source), characters = [...text];
                const middle = Math.floor(characters.length / 2);
                return `<span class="statement-line-copy" aria-hidden="true">${characters.map((char, index) => `<span class="statement-letter${row === 1 && Math.abs(index - middle) <= 1 ? ' is-solid-letter' : ''}">${char === ' ' ? '&nbsp;' : escape(char)}</span>`).join('')}</span><span class="visually-hidden">${escape(text)}</span>`;
            });
            return { element, row, letters: [] };
        });
        section.classList.add('statement-interactive');
        biography.classList.add('biography-interactive');
        const pointer = { x: 0, y: 0, hover: 0, targetX: 0, targetY: 0, targetHover: 0 };
        const progress = { statement: 0, photo: 0, badge: 0, biography: 0 };
        const target = { ...progress };
        let measured = false, width = innerWidth, compact = false, last = 0, moving = false, enabled = motion();
        let statementVisible = false, biographyVisible = false;
        function letters() { lines.forEach(line => { line.letters = $$('.statement-letter', line.element); }); }
        letters();
        function layout() {
            width = document.documentElement.clientWidth; compact = width <= 650;
            const home = getView() === 'home', height = innerHeight, scroll = window.scrollY;
            const read = element => {
                const top = layoutTop(element) - scroll;
                return { progress: clamp((height - top) / Math.max(1, height + element.offsetHeight)), visible: home && top < height && top + element.offsetHeight > 0 };
            };
            const statement = read(section), bio = read(biography);
            statementVisible = statement.visible; biographyVisible = bio.visible;
            target.statement = statement.progress; target.photo = read(photo).progress;
            target.badge = read(badge).progress; target.biography = bio.progress;
            section.classList.toggle('is-type-active', statementVisible && motion());
            biography.classList.toggle('is-type-active', biographyVisible && motion());
            biography.classList.toggle('is-offscreen', !biographyVisible);
            if (!measured || !motion()) Object.assign(progress, target);
            if (!statementVisible) ['statement', 'photo', 'badge'].forEach(key => { progress[key] = target[key]; });
            if (!biographyVisible) progress.biography = target.biography;
            if (!home) pointer.targetX = pointer.targetY = pointer.targetHover = 0;
            measured = true;
        }
        function reset() {
            lines.forEach(line => {
                set(line.element, '--line-x', '0px'); set(line.element, '--line-y', '0px'); set(line.element, '--line-skew', '0deg');
                line.letters.forEach(letter => { letter.style.removeProperty('transform'); });
            });
            [['--statement-photo-y', '0px'], ['--statement-photo-rotate', '-6deg'], ['--statement-badge-x', '0px'], ['--statement-badge-y', '0px'], ['--statement-badge-rotate', '-12deg']].forEach(([key, value]) => set(section, key, value));
            [['--biography-photo-x', '0px'], ['--biography-photo-y', '0px'], ['--biography-photo-turn', '3deg'], ['--biography-card-x', '0px'], ['--biography-card-turn', '-3.4deg'], ['--biography-tilt-x', '0deg'], ['--biography-tilt-y', '0deg']].forEach(([key, value]) => set(biography, key, value));
            pointer.x = pointer.y = pointer.hover = pointer.targetX = pointer.targetY = pointer.targetHover = 0;
        }
        function render(now) {
            if (enabled !== motion()) { enabled = motion(); if (!enabled) reset(); }
            if (getView() !== 'home' || (!statementVisible && !biographyVisible) || !enabled) { last = 0; return false; }
            const elapsed = last ? Math.min(64, now - last) : 16; last = now;
            const ease = 1 - Math.exp(-elapsed / 125), previous = progress.statement;
            moving = false;
            Object.keys(progress).forEach(key => {
                progress[key] += (target[key] - progress[key]) * ease;
                if (Math.abs(target[key] - progress[key]) < .0001) progress[key] = target[key];
                else moving = true;
            });
            ['x', 'y', 'hover'].forEach(key => {
                const destination = fine.matches ? pointer[`target${key[0].toUpperCase()}${key.slice(1)}`] : 0;
                pointer[key] += (destination - pointer[key]) * ease;
                if (Math.abs(destination - pointer[key]) < .001) pointer[key] = destination;
                else moving = true;
            });
            const velocity = clamp((progress.statement - previous) / elapsed * 1800, -1, 1);
            // Separo medidas y escrituras para no forzar el layout en cada letra xd.
            if (statementVisible) {
                const travel = progress.statement - .5;
                lines.forEach(({ element, row, letters: characters }) => {
                    const direction = row % 2 ? -1 : 1, filled = row >= 2;
                    set(element, '--line-x', `${(travel * width * (filled ? .42 : .32) * direction).toFixed(2)}px`);
                    set(element, '--line-y', `${(travel * (filled ? -42 : 30)).toFixed(2)}px`);
                    set(element, '--line-skew', `${(velocity * direction * 4).toFixed(2)}deg`);
                    characters.forEach((letter, index) => {
                        const position = index / Math.max(1, characters.length - 1);
                        const phase = progress.statement * Math.PI * 2 + position * Math.PI * 1.4 + row * .7;
                        const proximity = Math.max(0, 1 - Math.abs(position * 2 - 1 - pointer.x) * 2.5) * pointer.hover;
                        const amplitude = (compact ? 6 : 12) * (filled ? .35 : 1);
                        const y = Math.sin(phase) * amplitude - proximity * (compact ? 0 : 22);
                        const z = Math.cos(phase) * (compact ? 4 : 12) + proximity * 26;
                        const angle = Math.sin(phase) * (filled ? .5 : 2) + pointer.x * proximity * 5;
                        letter.style.transform = `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${(Math.cos(phase) * (filled ? 3 : 6)).toFixed(2)}deg) rotateZ(${angle.toFixed(2)}deg)`;
                    });
                });
                set(section, '--statement-photo-y', `${((1 - progress.photo * 2) * 120 + pointer.y * pointer.hover * 12).toFixed(2)}px`);
                set(section, '--statement-photo-rotate', `${(-6 + progress.photo * 4 + pointer.x * pointer.hover * 3).toFixed(2)}deg`);
                set(section, '--statement-badge-x', `${(pointer.x * pointer.hover * 12).toFixed(2)}px`);
                set(section, '--statement-badge-y', `${((1 - progress.badge * 2) * (compact ? 110 : 180)).toFixed(2)}px`);
                set(section, '--statement-badge-rotate', `${(-45 + progress.badge * 43 + pointer.x * pointer.hover * 12).toFixed(2)}deg`);
            }
            if (biographyVisible) {
                const travel = progress.biography - .5, tilt = fine.matches && !compact ? pointer.hover : 0;
                set(biography, '--biography-photo-x', `${(compact ? 0 : 10 - progress.biography * 15).toFixed(2)}px`);
                set(biography, '--biography-photo-y', `${(travel * (compact ? -20 : -70)).toFixed(2)}px`);
                set(biography, '--biography-photo-turn', `${(compact ? 0 : 4.5 - progress.biography * 3).toFixed(2)}deg`);
                set(biography, '--biography-card-x', `${(compact ? 0 : travel * 60).toFixed(2)}px`);
                set(biography, '--biography-card-turn', `${(compact ? 0 : -4.5 + progress.biography * 6).toFixed(2)}deg`);
                set(biography, '--biography-tilt-x', `${(-pointer.y * tilt * 3).toFixed(2)}deg`);
                set(biography, '--biography-tilt-y', `${(pointer.x * tilt * 4).toFixed(2)}deg`);
            }
            if (!moving) last = 0;
            return moving;
        }
        [section, biography].forEach(element => {
            element.addEventListener('pointermove', event => {
                if (!motion() || !fine.matches || event.pointerType === 'touch') return;
                const rect = element.getBoundingClientRect();
                pointer.targetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
                pointer.targetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
                pointer.targetHover = 1; invalidate();
            }, { passive: true });
            element.addEventListener('pointerleave', () => { pointer.targetX = pointer.targetY = pointer.targetHover = 0; invalidate(); });
        });
        document.addEventListener('portfolio:language', () => { letters(); layout(); invalidate(); });
        document.addEventListener('portfolio:motion', () => { layout(); invalidate(); });
        layout();
        return { layout, render };
    }
    function createWorks({ section, cases, backdrop, cue, getCurrent, isGrid, getView, getFeatures, motion, fine, invalidate }) {
        const updateMeter = meter(cue, 'DESLIZA HACIA ABAJO', 'Progreso de lectura del proyecto');
        const records = cases.map((element, index) => {
            const content = $('.project-content', element), preview = $('.project-preview', element);
            const copy = document.createElement('div'); copy.className = 'work-copy';
            while (content.firstChild) copy.append(content.firstChild);
            content.append(copy);
            content.setAttribute('tabindex', '0'); content.setAttribute('role', 'region'); content.setAttribute('aria-label', i18n.t('Contenido del proyecto'));
            const stage = document.createElement('div'); stage.className = 'work-preview-stage'; preview.before(stage); stage.append(preview);
            const description = $('.project-description', copy);
            const source = i18n.sourceOf(description.textContent.trim());
            i18n.html(description, () => `<span class="work-paragraph">${i18n.t(source).split(/\s+/).map((word, position) => `<span class="work-word" style="--word-side:${position % 2 ? 1 : -1}">${escape(word)}</span>`).join(' ')}</span>`);
            const features = document.createElement('div'); features.className = 'work-features';
            const heading = document.createElement('h3'); i18n.text(heading, 'Qué hay detrás'); features.append(heading);
            const list = document.createElement('ol');
            (getFeatures()[element.dataset.project] || []).forEach(text => { const item = document.createElement('li'); i18n.text(item, text); list.append(item); });
            features.append(list); copy.append(features);
            const steps = [...copy.children, ...list.children].filter(node => node !== features);
            steps.forEach(step => step.classList.add('work-step'));
            heading.classList.add('work-step'); steps.push(heading);
            const record = { element, content, copy, stage, preview, description, steps, metrics: [], index };
            content.addEventListener('scroll', () => { if (index === getCurrent()) readScroll(); }, { passive: true });
            stage.addEventListener('pointermove', event => {
                if (!canTilt() || event.pointerType === 'touch') return;
                const rect = stage.getBoundingClientRect();
                pose.targetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
                pose.targetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
                invalidate();
            });
            stage.addEventListener('pointerleave', () => { pose.targetX = pose.targetY = 0; invalidate(); });
            description.addEventListener('pointermove', event => {
                if (!canTilt() || event.pointerType === 'touch') return;
                const rect = description.getBoundingClientRect();
                pose.targetCopyX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
                pose.targetCopyY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
                invalidate();
            });
            description.addEventListener('pointerleave', () => { pose.targetCopyX = pose.targetCopyY = 0; invalidate(); });
            return record;
        });
        let progress = 0, target = 0, previousScroll = 0, velocity = 0, last = 0;
        const pose = { x: 0, y: 0, copyX: 0, copyY: 0, targetX: 0, targetY: 0, targetCopyX: 0, targetCopyY: 0 };
        const active = () => records[getCurrent()];
        const canTilt = () => motion() && fine.matches && innerWidth > 650 && getView() === 'projects' && !isGrid();
        function readScroll() {
            if (isGrid() || getView() !== 'projects') return;
            const record = active();
            const value = innerWidth > 650 ? record.content.scrollTop : Math.max(0, window.scrollY - layoutTop(section));
            const range = innerWidth > 650 ? record.content.scrollHeight - record.content.clientHeight : section.offsetHeight - innerHeight;
            target = range > 1 ? clamp(value / range) : 0;
            velocity = motion() ? clamp((value - previousScroll) * .18, -14, 14) : 0;
            previousScroll = value; invalidate();
        }
        function layout() {
            if (getView() !== 'projects') return;
            const record = active();
            record.metrics = record.steps.map(element => ({ element, top: layoutTop(element) - layoutTop(record.copy), height: element.offsetHeight }));
            const value = innerWidth > 650 ? record.content.scrollTop : Math.max(0, window.scrollY - layoutTop(section));
            const range = innerWidth > 650 ? record.content.scrollHeight - record.content.clientHeight : section.offsetHeight - innerHeight;
            target = range > 1 ? clamp(value / range) : 0;
            previousScroll = value;
        }
        function select() {
            records.forEach(record => { record.content.scrollTop = 0; });
            progress = target = previousScroll = velocity = 0;
            Object.keys(pose).forEach(key => { pose[key] = 0; });
            i18n.html(backdrop, () => [...i18n.t($('.project-title', active().element).textContent)].map((char, index) => `<span class="work-backdrop-letter" style="--letter-side:${index % 2 ? 1 : -1};--letter-index:${index}">${char === ' ' ? '&nbsp;' : escape(char)}</span>`).join(''));
            section.classList.toggle('work-story-enabled', !isGrid());
            updateMeter(0); layout(); invalidate();
        }
        section.addEventListener('wheel', event => {
            if (getView() !== 'projects' || isGrid() || innerWidth <= 650 || event.ctrlKey || $('dialog[open]') || !$('.chapter-curtain')?.hidden) return;
            const content = active().content;
            if (content.contains(event.target)) return;
            event.preventDefault();
            const delta = event.deltaY * (event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? content.clientHeight : 1);
            content.scrollTop += delta;
        }, { passive: false });
        addEventListener('scroll', () => { if (innerWidth <= 650) readScroll(); }, { passive: true });
        document.addEventListener('portfolio:language', () => { layout(); invalidate(); });
        function render(now) {
            if (getView() !== 'projects') return false;
            const record = active(), enabled = motion() && !isGrid();
            const elapsed = last ? Math.min(64, now - last) : 16; last = now;
            const ease = 1 - Math.exp(-elapsed / 120);
            progress = enabled ? progress + (target - progress) * ease : target;
            if (Math.abs(progress - target) < .0005) progress = target;
            velocity = enabled ? velocity * Math.exp(-elapsed / 100) : 0;
            if (Math.abs(velocity) < .03) velocity = 0;
            ['x', 'y', 'copyX', 'copyY'].forEach(key => {
                const goal = canTilt() ? pose[`target${key[0].toUpperCase()}${key.slice(1)}`] : 0;
                pose[key] = enabled ? pose[key] + (goal - pose[key]) * ease : goal;
                if (Math.abs(pose[key] - goal) < .0005) pose[key] = goal;
            });
            updateMeter(progress);
            set(backdrop, '--works-backdrop-x', `${enabled ? -progress * innerWidth * .7 : 0}px`);
            set(backdrop, '--works-backdrop-skew', `${velocity.toFixed(3)}deg`);
            set(backdrop, '--works-fill', `${(12 * (1 - progress)).toFixed(3)}%`);
            set(backdrop, '--works-stroke', `${(progress * 14).toFixed(3)}%`);
            set(backdrop, '--works-word-depth', `${enabled ? progress * 24 : 0}px`);
            set(record.stage, '--preview-x', `${(pose.x * 75).toFixed(3)}px`);
            set(record.stage, '--preview-y', `${(pose.y * 60).toFixed(3)}px`);
            set(record.stage, '--preview-rx', `${(-pose.y * 15).toFixed(3)}deg`);
            set(record.stage, '--preview-ry', `${(pose.x * 15).toFixed(3)}deg`);
            set(record.stage, '--preview-image-x', `${(-pose.x * 30).toFixed(3)}px`);
            set(record.stage, '--preview-image-y', `${(-pose.y * 24).toFixed(3)}px`);
            set(record.description, '--copy-rx', `${(-pose.copyY * 30).toFixed(3)}deg`);
            set(record.description, '--copy-ry', `${(pose.copyX * 20).toFixed(3)}deg`);
            set(record.description, '--copy-word-z', `${(pose.copyX * 15).toFixed(3)}px`);
            const viewport = innerWidth > 650 ? record.content.clientHeight : innerHeight;
            record.metrics.forEach(step => {
                const top = innerWidth > 650 ? step.top - record.content.scrollTop : step.element.getBoundingClientRect().top;
                const reveal = enabled ? smooth((viewport * .96 - top) / Math.min(viewport * .5, step.height + viewport * .22)) : 1;
                set(step.element, '--work-reveal', reveal.toFixed(4));
            });
            const moving = progress !== target || velocity !== 0 || ['x', 'y', 'copyX', 'copyY'].some(key => canTilt() && pose[key] !== pose[`target${key[0].toUpperCase()}${key.slice(1)}`]);
            record.stage.classList.toggle('is-preview-moving', moving && canTilt());
            return enabled && moving;
        }
        return { select, layout, render };
    }

    function createAbout({ motion, getView, getQuality, getPointer, invalidate }) {
        const section = $('#about'), stage = $('.about-presentation', section), resume = $('#resume'), intro = $('.about-introduction', stage);
        const journey = document.createElement('div'); journey.className = 'about-journey'; stage.before(journey); journey.append(stage); stage.append(resume); resume.hidden = false;
        stage.classList.add('about-story-stage'); resume.classList.add('about-resume-panel');
        const layer = document.createElement('div'); layer.className = 'about-robot-layer';
        const canvas = document.createElement('canvas'); canvas.id = 'aboutRobotCanvas'; canvas.setAttribute('aria-hidden', 'true'); layer.append(canvas); stage.prepend(layer);
        const status = document.createElement('span'); status.className = 'about-model-status'; status.setAttribute('role', 'status'); status.hidden = true; stage.append(status);
        const updateMeter = meter($('.page-scroll-cue', stage), 'DESLIZA HACIA ABAJO', 'Progreso de la historia de perfil');
        const backdrop = $('.resume-background', resume);
        i18n.html(backdrop, () => [...i18n.t('CURRICULUM')].map((char, index) => `<span class="resume-letter-shell" style="--resume-side:${index % 2 ? 1 : -1}"><span class="resume-letter">${escape(char)}</span></span>`).join(''));
        const blob = document.createElement('span'); blob.className = 'resume-blob'; blob.setAttribute('aria-hidden', 'true'); resume.prepend(blob);
        let start = 0, last = 0, clock = 0, active = false, staticMode = !motion(), actor = null, attempted = false, dirty = true;
        let phase = null, phaseAt = 0, background = 0, letters = 0, fromBackground = 0, fromLetters = 0;
        journey.classList.toggle('is-static', staticMode); journey.classList.add('about-story-ready');
        function align(element, options = {}) {
            if (element !== resume || !motion()) return false;
            const overflow = Math.max(0, stage.offsetHeight - innerHeight);
            window.scrollTo({ top: layoutTop(journey) + overflow + innerHeight * .6, behavior: options.behavior || 'instant' });
            dirty = true; invalidate(); return true;
        }
        function layout() {
            const nextStatic = !motion();
            if (staticMode !== nextStatic) {
                const wasVisible = getView() === 'about' && journey.getBoundingClientRect().top < innerHeight && journey.getBoundingClientRect().bottom > 0;
                const wasResume = phase === 'resume';
                staticMode = nextStatic; journey.classList.toggle('is-static', staticMode);
                if (wasVisible) {
                    if (wasResume && !staticMode) align(resume);
                    else window.scrollTo({ top: Math.max(0, layoutTop(wasResume ? resume : section) - (wasResume ? 106 : 0)), behavior: 'instant' });
                }
            }
            // Primero deja leer todo el perfil si la escena supera la altura disponible xd.
            const overflow = staticMode ? 0 : Math.max(0, stage.offsetHeight - innerHeight);
            set(journey, '--about-stage-overflow', `${overflow}px`);
            start = layoutTop(journey) + overflow;
            const rect = journey.getBoundingClientRect(); active = getView() === 'about' && rect.top < innerHeight && rect.bottom > 0;
            dirty = true;
        }
        function loadRobot() {
            if (attempted || !window.portfolioAboutRobot) return;
            attempted = true; stage.dataset.robot = 'loading'; status.hidden = false; i18n.text(status, 'Cargando escena 3D…');
            window.portfolioAboutRobot.create(canvas, getQuality).then(model => {
                actor = model; stage.dataset.robot = 'ready'; stage.classList.add('has-robot');
                $('#aboutCanvas').hidden = true; status.hidden = true; dirty = true; invalidate();
            }).catch(() => {
                stage.dataset.robot = 'fallback'; canvas.hidden = true;
                i18n.text(status, 'Vista 3D no disponible. Tu perfil y CV siguen accesibles.'); invalidate();
            });
        }
        function render(now) {
            if (!active) { last = 0; return false; }
            loadRobot();
            const elapsed = last ? Math.min(64, now - last) : 16; last = now;
            if (motion()) clock += elapsed;
            const offset = window.scrollY - start;
            const nextPhase = staticMode || stage.dataset.robot === 'fallback' ? 'profile' : window.portfolioAboutRobot.motion.phaseForOffset(offset, innerHeight);
            if (phase !== nextPhase) {
                fromBackground = background; fromLetters = letters; phaseAt = now; phase = nextPhase;
                stage.dataset.aboutPhase = phase;
            }
            const age = now - phaseAt, isResume = phase === 'resume';
            background = fromBackground + ((isResume ? 1 : 0) - fromBackground) * smooth(age / 1500);
            letters = fromLetters + ((isResume ? 1 : 0) - fromLetters) * smooth((age - (isResume ? 1000 : 0)) / (isResume ? 2000 : 1000));
            updateMeter(clamp(offset / (innerHeight * .6)));
            const shade = Math.round(background * 230), foreground = Math.round(255 - background * 210);
            set(stage, '--about-background', `rgb(${shade},${shade},${shade})`);
            const center = Math.round(60 + background * 170);
            set(stage, '--about-gradient-center', `rgb(${center},${center},${center})`);
            set(stage, '--about-foreground', `rgb(${foreground},${foreground},${foreground})`);
            set(stage, '--about-cv-enter', staticMode ? '1' : letters.toFixed(4));
            stage.classList.toggle('is-cv-visible', staticMode || isResume);
            set(resume, '--resume-word-x', `${motion() ? innerWidth * .25 * (1 - Math.cos(clock * Math.PI / 25000)) : 0}px`);
            set(resume, '--resume-float', `${motion() ? 50 * (1 - Math.cos(clock * Math.PI / 4000)) : 0}px`);
            const pointer = getPointer();
            set(resume, '--resume-pointer-x', `${motion() ? pointer.x * 35 : 0}px`);
            set(resume, '--resume-pointer-y', `${motion() ? pointer.y * 25 : 0}px`);
            const animated = actor?.render({ phase, pointerX: pointer.x, pointerY: -pointer.y, motion: motion(), visible: active, now, force: dirty });
            dirty = false;
            return motion() && (animated || age < 4000 || isResume);
        }
        resume.addEventListener('focusin', () => { if (motion() && phase !== 'resume') align(resume); });
        document.addEventListener('portfolio:view', () => { layout(); invalidate(); });
        document.addEventListener('portfolio:language', () => { layout(); invalidate(); });
        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(invalidate);
            observer.observe(intro); observer.observe(stage);
        }
        layout();
        if (getView() === 'about') loadRobot();
        else if ('requestIdleCallback' in window) requestIdleCallback(loadRobot, { timeout: 1200 });
        else setTimeout(loadRobot, 300);
        return { layout, render, align };
    }
    window.portfolioNarratives = { createHome, createWorks, createAbout };
})();
