(() => {
    'use strict';

    const root = document.documentElement;
    const i18n = window.portfolioI18n;
    const t = i18n.t;
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const motionEnabled = () => root.dataset.motion !== 'reduced';
    const emailAddress = 'joseayvar28@gmail.com';
    const storage = {
        get(key) { try { return localStorage.getItem(`portfolio.${key}`); } catch { return null; } },
        set(key, value) { try { localStorage.setItem(`portfolio.${key}`, value); } catch {} }
    };

    let toastTimer;
    function notify(message, params = {}) {
        const region = $('#toastRegion');
        clearTimeout(toastTimer);
        i18n.text(region, message, params);
        region.classList.add('is-visible');
        toastTimer = setTimeout(() => region.classList.remove('is-visible'), 4000);
    }

    const themeToggle = $('#themeToggle');
    const motionToggle = $('#motionToggle');
    let motionPaused = storage.get('motion') === 'paused';

    function updateAppearance() {
        const dark = root.dataset.theme === 'dark';
        const label = t(dark ? 'Activar modo claro' : 'Activar modo oscuro');
        themeToggle.setAttribute('aria-label', label);
        themeToggle.title = label;
        $('i', themeToggle).className = `fas fa-${dark ? 'sun' : 'moon'}`;
        $('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--bg').trim();
        document.dispatchEvent(new Event('portfolio:palette'));
    }

    function toggleTheme() {
        root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        storage.set('theme', root.dataset.theme);
        updateAppearance();
    }

    function updateMotion() {
        const paused = motionPaused || reducedMotion.matches;
        root.dataset.motion = paused ? 'reduced' : 'full';
        motionToggle.disabled = reducedMotion.matches;
        motionToggle.setAttribute('aria-pressed', String(paused));
        const label = reducedMotion.matches ? 'Movimiento reducido por la configuración de tu dispositivo' : paused ? 'Activar animaciones' : 'Pausar animaciones';
        motionToggle.setAttribute('aria-label', label);
        motionToggle.title = label;
        $('i', motionToggle).className = `fas fa-${paused ? 'play' : 'pause'}`;
        document.dispatchEvent(new Event('portfolio:motion'));
    }

    function toggleMotion() {
        if (reducedMotion.matches) {
            notify('Se respeta la preferencia de movimiento reducido de tu dispositivo.');
            return;
        }
        motionPaused = !motionPaused;
        storage.set('motion', motionPaused ? 'paused' : 'full');
        updateMotion();
        notify(motionPaused ? 'Animaciones pausadas. Tú marcas el ritmo.' : 'Animaciones activadas.');
    }

    themeToggle.addEventListener('click', toggleTheme);
    motionToggle.addEventListener('click', toggleMotion);
    reducedMotion.addEventListener('change', updateMotion);
    updateAppearance();
    updateMotion();

    const socialNames = { 'fa-instagram': 'Instagram', 'fa-linkedin-in': 'LinkedIn', 'fa-github': 'GitHub', 'fa-tiktok': 'TikTok', 'fa-envelope': 'Enviar correo' };
    $$('.social-icon').forEach(link => {
        const icon = $('i', link);
        const name = Object.entries(socialNames).find(([className]) => icon?.classList.contains(className))?.[1];
        if (name) {
            link.setAttribute('aria-label', name);
            link.title = name;
        }
        if (icon) icon.setAttribute('aria-hidden', 'true');
    });
    $$('a[target="_blank"]').forEach(link => { link.rel = 'noopener noreferrer'; });

    const navbar = $('.navbar');
    const navLinks = $$('.navbar-nav .nav-link');
    const sections = $$('main > section[id]');

    function goTo(id) {
        const target = document.getElementById(id.replace(/^#/, ''));
        if (!target) return;
        const arrive = (instant = false) => {
            const changedView = window.portfolioExperience?.revealTarget(target) || false;
            const behavior = instant || !motionEnabled() ? 'instant' : 'smooth';
            if (!window.portfolioExperience?.alignTarget(target, { behavior })) target.scrollIntoView({ behavior, block: 'start' });
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
            try { history[changedView ? 'pushState' : 'replaceState']({ view: window.portfolioExperience?.currentSection() }, '', `#${target.id}`); } catch {}
        };
        if (window.portfolioChapters?.navigate(target, () => arrive(true))) return;
        arrive();
    }

    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const id = link.getAttribute('href').slice(1);
        if (!document.getElementById(id)) return;
        event.preventDefault();
        goTo(id);
    });

    let scrollFrame = 0;
    function updateScroll() {
        const y = window.scrollY;
        const total = root.scrollHeight - window.innerHeight;
        $('#scrollProgress').style.transform = `scaleX(${total > 0 ? Math.min(1, y / total) : 0})`;
        navbar.classList.toggle('scrolled', y > 30);
        const chapter = window.portfolioExperience?.currentSection();
        const visible = sections.filter(section => !section.hidden);
        const active = visible.find(section => section.id === chapter) || [...visible].reverse().find(section => section.offsetTop <= y + 150) || visible[0];
        navLinks.forEach(link => {
            const selected = link.getAttribute('href') === `#${active.id}`;
            link.classList.toggle('active', selected);
            if (selected) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        scrollFrame = 0;
    }
    function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll, { passive: true });
    document.addEventListener('portfolio:view', scheduleScroll);
    updateScroll();

    const timeFormatter = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false });
    function updateClock() {
        if (document.hidden) return;
        $('#localTime').textContent = `${timeFormatter.format(new Date())} PET`;
    }
    updateClock();
    setInterval(updateClock, 60000);
    document.addEventListener('visibilitychange', updateClock);

    function observeOnce(elements, callback, options = {}) {
        if (!('IntersectionObserver' in window)) { elements.forEach(callback); return; }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                callback(entry.target);
            });
        }, { threshold: 0.12, ...options });
        elements.forEach(element => observer.observe(element));
    }

    const revealElements = $$('[data-aos]');
    if (!window.portfolioScroll && motionEnabled() && 'IntersectionObserver' in window) {
        revealElements.forEach(element => element.classList.add('reveal-pending'));
        observeOnce(revealElements, element => {
            element.classList.remove('reveal-pending');
            element.classList.add('reveal-visible');
        }, { rootMargin: '0px 0px -25px 0px', threshold: 0.05 });
    }

    function animateNumber(target, render, duration = 1200) {
        if (!motionEnabled()) { render(target); return; }
        const start = performance.now();
        function frame(now) {
            const progress = motionEnabled() ? Math.min((now - start) / duration, 1) : 1;
            render(target * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }
    observeOnce($$('.stat-number[data-count]'), element => {
        animateNumber(Number(element.dataset.count), value => { element.textContent = `${Math.round(value)}+`; });
    });
    observeOnce($$('.progress-bar[data-width]'), bar => {
        bar.style.width = `${bar.dataset.width}%`;
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-valuenow', bar.dataset.width);
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', '100');
        bar.setAttribute('aria-label', $('.skill-name', bar.closest('.skill-item')).textContent);
    });
    observeOnce($$('.chart-circle[data-percent]'), circle => {
        animateNumber(Number(circle.dataset.percent), value => circle.style.setProperty('--percent', value.toFixed(1)));
    });

    const cards = $$('.certificate-card, .skill-category-card, .project-card, .contact-form-container');
    cards.forEach(card => card.classList.add('spotlight-card'));
    cards.forEach(card => {
        let frame = 0;
        card.addEventListener('pointermove', event => {
            if (!finePointer.matches || !motionEnabled()) return;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                card.style.setProperty('--spot-x', `${x}px`);
                card.style.setProperty('--spot-y', `${y}px`);
            });
        }, { passive: true });
        card.addEventListener('pointerleave', () => {
            cancelAnimationFrame(frame);
        });
    });

    const halo = $('.cursor-halo');
    let haloFrame = 0;
    document.addEventListener('pointermove', event => {
        if (!finePointer.matches || !motionEnabled() || event.pointerType === 'touch') return;
        cancelAnimationFrame(haloFrame);
        haloFrame = requestAnimationFrame(() => {
            const interactive = Boolean(event.target.closest('a, button, input, textarea'));
            halo.classList.add('is-active');
            halo.classList.toggle('is-hovering', interactive);
            const halfSize = halo.offsetWidth / 2;
            halo.style.transform = `translate3d(${event.clientX - halfSize}px, ${event.clientY - halfSize}px, 0)`;
        });
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => halo.classList.remove('is-active'));
    document.addEventListener('click', event => {
        const button = event.target.closest('.btn, .filter-btn');
        if (!button || !motionEnabled() || event.detail === 0) return;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'click-ripple';
        ripple.setAttribute('aria-hidden', 'true');
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        button.append(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // Comparto los filtros con la galería para que ambos muestren lo mismo xd.
    const projectItems = $$('.project-grid > [data-category]');
    const projectSearch = $('#projectSearch');
    let activeFilter = 'all';
    const projectIndex = projectItems.map(element => ({
        element,
        categories: element.dataset.category.split(' '),
        searchText: () => normalize(`${$$('.project-title, .project-description, .project-category, .tech-tag', element).map(node => `${t(node.textContent, {}, 'es')} ${t(node.textContent, {}, 'en')}`).join(' ')} ${element.dataset.category}`)
    }));
    function filterProjects() {
        const terms = normalize(projectSearch.value).split(/\s+/).filter(Boolean);
        let visible = 0;
        projectIndex.forEach(project => {
            const text = project.searchText();
            const matches = (activeFilter === 'all' || project.categories.includes(activeFilter)) && terms.every(term => text.includes(term));
            project.element.hidden = !matches;
            if (matches) visible++;
        });
        $$('.filter-btn').forEach(button => {
            const active = button.dataset.filter === activeFilter;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        i18n.text($('#projectResults'), visible === 1 ? '{count} proyecto encontrado' : '{count} proyectos encontrados', { count: visible });
        $('#projectsEmpty').hidden = visible !== 0;
        scheduleScroll();
    }
    $$('.filter-btn').forEach(button => button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        filterProjects();
    }));
    projectSearch.addEventListener('input', filterProjects);
    $('#resetProjects').addEventListener('click', () => {
        activeFilter = 'all';
        projectSearch.value = '';
        filterProjects();
        projectSearch.focus({ preventScroll: true });
    });

    // Es una simulación visual; no envío solicitudes a un servidor xd.
    const lab = $('#architectureLab');
    const runFlow = $('#runFlow');
    const flowLog = $('#flowLog');
    const layerContent = {
        frontend: { title: 'La experiencia comienza aquí.', description: 'Interfaces adaptables e interactivas que convierten las acciones del usuario en solicitudes al servidor.' },
        backend: { title: 'La lógica que conecta todo.', description: 'El servidor recibe la solicitud, valida la información y coordina la respuesta mediante una API y las reglas de la aplicación.' },
        database: { title: 'Información organizada, decisiones claras.', description: 'La capa de datos almacena y consulta la información que necesita la aplicación, usando bases de datos relacionales o documentales.' }
    };
    let flowTimer;
    let flowRunning = false;
    function selectLayer(layer) {
        const content = layerContent[layer];
        if (!content) return;
        $$('[data-layer]').forEach(button => {
            const selected = button.dataset.layer === layer;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        $('#layerTitle').textContent = content.title;
        $('#layerDescription').textContent = content.description;
    }
    function stopFlow() {
        clearTimeout(flowTimer);
        flowRunning = false;
        runFlow.disabled = false;
        lab.classList.remove('flow-running');
        $('span', runFlow).textContent = 'Simular solicitud';
    }
    function finishFlow() {
        stopFlow();
        selectLayer('frontend');
        $('#labStatus').textContent = 'RECORRIDO COMPLETADO';
        flowLog.classList.add('is-complete');
        i18n.text(flowLog, '✓ Simulación completada: interfaz → servidor → datos → respuesta.');
    }
    $$('[data-layer]').forEach(button => button.addEventListener('click', () => {
        stopFlow();
        selectLayer(button.dataset.layer);
        $('#labStatus').textContent = 'EXPLORANDO ARQUITECTURA';
        flowLog.classList.remove('is-complete');
        const layer = { frontend: 'Interfaz', backend: 'Servidor', database: 'Datos' }[button.dataset.layer];
        i18n.text(flowLog, () => t('❯ Capa seleccionada: {layer}. Inicia la simulación para recorrer el flujo completo.', { layer: t(layer) }));
    }));
    runFlow.addEventListener('click', () => {
        stopFlow();
        if (!motionEnabled()) { finishFlow(); return; }
        flowRunning = true;
        runFlow.disabled = true;
        $('span', runFlow).textContent = 'Simulando…';
        lab.classList.add('flow-running');
        flowLog.classList.remove('is-complete');
        const steps = [
            ['frontend', '01 / SOLICITUD', '❯ Interfaz → el usuario solicita la lista de proyectos.'],
            ['backend', '02 / PROCESAMIENTO', '❯ Servidor → la API valida y prepara la consulta.'],
            ['database', '03 / CONSULTA', '❯ Datos → la información vuelve al servidor y a la interfaz.']
        ];
        function step(index) {
            if (index === steps.length) { finishFlow(); return; }
            const [layer, status, message] = steps[index];
            selectLayer(layer);
            $('#labStatus').textContent = status;
            i18n.text(flowLog, message);
            flowTimer = setTimeout(() => step(index + 1), 1000);
        }
        step(0);
    });
    document.addEventListener('portfolio:motion', () => { if (flowRunning && !motionEnabled()) finishFlow(); });

    function openDialog(dialog) {
        $$('dialog[open]').forEach(open => open.close());
        dialog.showModal();
        root.classList.add('has-dialog');
        document.body.classList.add('dialog-open');
    }
    $$('dialog').forEach(dialog => {
        $('[data-close-dialog]', dialog).addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', event => {
            const rect = dialog.getBoundingClientRect();
            if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
        });
        dialog.addEventListener('close', () => {
            if (!$('dialog[open]')) {
                document.body.classList.remove('dialog-open');
                root.classList.remove('has-dialog');
            }
        });
    });

    const projectFeatures = {
        'ayvar-ai': ['Chat con inteligencia artificial para explorar ideas y resolver dudas.', 'Modos de conversación: general, creativo, código y aprendizaje.', 'Historial de conversaciones y aplicación instalable.', 'Demo pública desplegada en Netlify y código disponible en GitHub.'],
        'el-tonito': ['Carta interactiva de pollo a la brasa, parrillas y promociones.', 'Carrito para armar pedidos y solicitarlos por WhatsApp.', 'Asistente con inteligencia artificial y diseño adaptable a celulares y computadoras.', 'Aplicación en React y TypeScript, publicada en Netlify con código disponible en GitHub.'],
        ecommerce: ['Propuesta de catálogo de productos y carrito.', 'Flujo de pago conceptual con Stripe.', 'Diseño de un panel de administración.', 'Stack propuesto: React, Node.js y MongoDB.'],
        fitness: ['Propuesta de registro de ejercicios y actividad física.', 'Diseño de un seguimiento de progreso personal.', 'Visualización conceptual de la actividad.', 'Stack propuesto: React Native, Firebase, Redux y Chart.js.'],
        dashboard: ['Propuesta de gráficos y visualización de datos.', 'Métricas de ejemplo, sin conexión a datos reales.', 'Stack de interfaz propuesto: Vue.js y D3.js.', 'Stack de servidor propuesto: Express y PostgreSQL.']
    };
    if (window.portfolioExperience) window.portfolioExperience.projectFeatures = projectFeatures;
    const projectDialog = $('#projectDialog');
    let selectedProject = '';
    function showProject(id) {
        const item = projectItems.find(project => project.dataset.project === id);
        if (!item) return;
        selectedProject = i18n.sourceOf($('.project-title', item).textContent);
        $('#projectDialogTitle').textContent = t(selectedProject);
        $('#projectDialogCategory').textContent = $('.project-category', item).textContent;
        $('#projectDialogDescription').textContent = $('.project-description', item).textContent;
        $('#projectDialogTechnologies').replaceChildren(...$$('.tech-tag', item).map(tag => tag.cloneNode(true)));
        $('#projectDialogFeatures').replaceChildren(...projectFeatures[id].map(text => {
            const li = document.createElement('li');
            li.textContent = text;
            return li;
        }));
        const preview = $('.project-preview', item);
        const detail = $('#projectDialogPreview');
        detail.className = `detail-preview ${[...preview.classList].find(name => name.startsWith('preview-'))}`;
        detail.replaceChildren(...[...preview.children].map(child => child.cloneNode(true)));
        const demo = $('#projectDemo');
        demo.hidden = !item.dataset.demo;
        if (item.dataset.demo) demo.href = item.dataset.demo;
        else demo.removeAttribute('href');
        const repository = $('#projectRepository');
        repository.href = item.dataset.repo || 'https://github.com/Ayvxrrr';
        $('span', repository).textContent = item.dataset.repo ? 'Ver código en GitHub' : 'Perfil de GitHub';
        $('#projectDialogCaption').textContent = item.dataset.demo
            ? 'Captura real del sitio. Abre la demo para explorar el proyecto en funcionamiento.'
            : 'Concepto visual, no un producto publicado. Las funciones y tecnologías mostradas son una propuesta.';
        openDialog(projectDialog);
        projectDialog.scrollTop = 0;
    }
    $$('[data-project-open]').forEach(button => button.addEventListener('click', () => showProject(button.dataset.projectOpen)));
    $('#projectContact').addEventListener('click', event => {
        event.preventDefault();
        setSubject('Consulta sobre {project}', { project: selectedProject });
        projectDialog.close();
        goTo('contact');
    });

    async function copyEmail() {
        let copied = false;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(emailAddress);
                copied = true;
            }
        } catch {}
        if (!copied) {
            const previous = document.activeElement;
            const field = document.createElement('textarea');
            field.value = emailAddress;
            field.readOnly = true;
            field.style.cssText = 'position:fixed;left:-9999px;top:0';
            ($('dialog[open]') || document.body).append(field);
            field.select();
            try { copied = document.execCommand('copy'); } catch { copied = false; }
            field.remove();
            previous?.focus({ preventScroll: true });
        }
        notify(copied ? 'Correo copiado. ¡Hablemos de tu próxima idea!' : 'Puedes copiar mi correo: {email}', { email: emailAddress });
    }
    $$('[data-copy-email]').forEach(button => button.addEventListener('click', copyEmail));

    const commandDialog = $('#commandDialog');
    const commandSearch = $('#commandSearch');
    const commandResults = $('#commandResults');
    const navigationActions = [
        ['Inicio', 'home', 'house'], ['Sobre mí', 'about', 'user'],
        ['Stack y habilidades', 'skills', 'code'], ['Proyectos', 'projects', 'layer-group'], ['Robot interactivo', 'playground', 'robot'],
        ['Contacto', 'contact', 'envelope']
    ].map(([label, id, icon]) => ({ label, icon, group: 'SECCIÓN', run: () => goTo(id) }));
    const commandActions = [
        ...navigationActions,
        { label: 'Laboratorio Full Stack interactivo', icon: 'microchip', group: 'EXPLORAR', run: () => goTo('architectureLab') },
        ...projectItems.map(item => ({ label: $('.project-title', item).textContent, icon: 'arrow-up-right-from-square', group: 'PROYECTO', run: () => showProject(item.dataset.project) })),
        { label: 'Descargar CV', icon: 'download', group: 'ACCIÓN', run: () => $('#downloadCV').click() },
        { label: 'Copiar correo electrónico', icon: 'copy', group: 'ACCIÓN', run: copyEmail },
        { label: 'Cambiar tema claro / oscuro', icon: 'circle-half-stroke', group: 'APARIENCIA', run: toggleTheme },
        { label: 'Pausar / activar animaciones', icon: 'pause', group: 'APARIENCIA', run: toggleMotion },
        { label: 'Cambiar idioma ES / EN', icon: 'language', group: 'APARIENCIA', run: () => i18n.setLanguage(root.lang === 'es' ? 'en' : 'es') }
    ];
    let matchingActions = [];

    function renderCommands() {
        const query = normalize(commandSearch.value);
        matchingActions = commandActions.filter(action => normalize(`${t(action.label)} ${t(action.group)} ${action.label}`).includes(query));
        commandResults.replaceChildren(...matchingActions.map((action, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'command-result';
            const icon = document.createElement('i');
            icon.className = `fas fa-${action.icon}`;
            icon.setAttribute('aria-hidden', 'true');
            const label = document.createElement('span');
            label.textContent = action.label;
            const group = document.createElement('small');
            group.textContent = action.group;
            button.append(icon, label, group);
            button.addEventListener('click', () => executeCommand(index));
            return button;
        }));
        i18n.text($('#commandStatus'), '{count} acciones disponibles', { count: matchingActions.length });
        if (!matchingActions.length) {
            const empty = document.createElement('p');
            empty.className = 'command-empty';
            empty.textContent = 'No hay resultados. Prueba con «proyectos», «CV» o «contacto».';
            commandResults.append(empty);
        }
    }
    function executeCommand(index) {
        const action = matchingActions[index];
        if (!action) return;
        commandDialog.close();
        action.run();
    }
    function openCommands() {
        commandSearch.value = '';
        renderCommands();
        openDialog(commandDialog);
        commandSearch.focus();
    }
    $$('[data-open-command]').forEach(button => button.addEventListener('click', openCommands));
    commandSearch.addEventListener('input', renderCommands);
    commandDialog.addEventListener('keydown', event => {
        const buttons = $$('.command-result', commandResults);
        if (['ArrowDown', 'ArrowUp'].includes(event.key) && buttons.length) {
            event.preventDefault();
            const current = buttons.indexOf(document.activeElement);
            const next = current === -1 ? (event.key === 'ArrowDown' ? 0 : buttons.length - 1) : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
            buttons[next].focus();
        } else if (event.key === 'Enter' && event.target === commandSearch) {
            event.preventDefault();
            executeCommand(0);
        }
    });
    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.repeat) {
            event.preventDefault();
            if (commandDialog.open) commandDialog.close();
            else openCommands();
        }
    });

    // Solo ejecuto los comandos de esta lista, nunca código del visitante xd.
    const terminalInput = $('#terminalInput');
    const terminalOutput = $('#terminalOutput');
    const terminalHistory = [];
    let historyIndex = 0;
    let terminalDraft = '';
    function runTerminal(raw) {
        const command = normalize(raw);
        if (!command) return;
        terminalHistory.push(raw.trim());
        if (terminalHistory.length > 50) terminalHistory.shift();
        historyIndex = terminalHistory.length;
        terminalInput.value = '';
        terminalDraft = '';
        if (command === 'clear') { terminalOutput.replaceChildren(); return; }
        let result;
        let params = {};
        switch (command) {
            case 'help':
                result = 'whoami      Sobre mí\nskills      Mi stack tecnológico\nlab         Laboratorio Full Stack\nprojects    Explorar proyectos\ncontact     Hablemos\ncv          Descargar mi CV\ntheme       Cambiar claro / oscuro\nclear       Limpiar la terminal\n\n↑ / ↓ para recuperar comandos anteriores.';
                break;
            case 'whoami':
            case 'about':
                result = 'Ayvar Jose · Desarrollador Full Stack Junior\nTitulado en Computación e Informática.\nExperiencia en proyectos de sistemas, páginas web y aplicaciones móviles.\nDesarrollador freelance y docente de computación.\nPachacamac, Lima, Perú. Disponible para nuevos proyectos.';
                break;
            case 'skills': result = $$('.skill-name').map(name => `→ ${name.textContent}`).join('\n'); break;
            case 'lab': result = 'Abriendo el laboratorio. Explora las capas o simula una solicitud Full Stack.'; goTo('architectureLab'); break;
            case 'projects': result = 'Abriendo mis proyectos. Filtra por categoría o busca tu tecnología favorita.'; goTo('projects'); break;
            case 'contact': result = 'Conectemos: {email}\nTambién puedes usar el formulario de contacto.'; params = { email: emailAddress }; goTo('contact'); break;
            case 'cv': result = 'Descarga solicitada: CV-Ayvar-Jose.pdf'; $('#downloadCV').click(); break;
            case 'theme': toggleTheme(); result = `Tema ${root.dataset.theme === 'dark' ? 'oscuro' : 'claro'} activado.`; break;
            default: result = 'Comando no encontrado: {command}\nEscribe help para explorar los comandos disponibles.'; params = { command: raw.trim() };
        }
        const entry = document.createElement('div');
        entry.className = 'terminal-entry';
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = 'jose@portfolio ~ $ ';
        const output = document.createElement('p');
        i18n.text(output, result, params);
        const commandText = document.createElement('span');
        commandText.setAttribute('data-i18n-ignore', '');
        commandText.textContent = raw.trim();
        entry.append(prompt, commandText, output);
        terminalOutput.append(entry);
        while (terminalOutput.children.length > 30) terminalOutput.firstElementChild.remove();
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    $('#terminalForm').addEventListener('submit', event => { event.preventDefault(); runTerminal(terminalInput.value); });
    $$('[data-command]').forEach(button => button.addEventListener('click', () => runTerminal(button.dataset.command)));
    terminalInput.addEventListener('keydown', event => {
        if (!['ArrowUp', 'ArrowDown'].includes(event.key) || !terminalHistory.length) return;
        event.preventDefault();
        if (historyIndex === terminalHistory.length) terminalDraft = terminalInput.value;
        historyIndex = Math.max(0, Math.min(terminalHistory.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
        terminalInput.value = historyIndex === terminalHistory.length ? terminalDraft : terminalHistory[historyIndex];
        terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
    });

    // Solo marco el envío como exitoso cuando Netlify lo confirma xd.
    const contactForm = $('#contactForm');
    const formFields = ['name', 'email', 'subject', 'message'].map(id => document.getElementById(id));
    const formStatus = $('#formStatus');
    const subjectInput = $('#subject');
    const messageInput = $('#message');
    contactForm.noValidate = true;
    let sending = false;
    let generatedSubject = null;

    function syncTopics() {
        $$('[data-subject]').forEach(button => button.setAttribute('aria-pressed', String(t(button.dataset.subject) === subjectInput.value)));
    }
    function setSubject(source, params = {}) {
        const localized = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, t(value)]));
        subjectInput.value = t(source, localized);
        generatedSubject = { source, params, value: subjectInput.value };
        clearError(subjectInput);
        syncTopics();
    }
    function updateMessageCount() { $('#messageCount').textContent = `${messageInput.value.length} / 3000`; }
    function clearError(input) {
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
        const feedback = $('.form-feedback', input.closest('.form-group'));
        if (feedback) i18n.clear(feedback);
    }
    function validateField(input) {
        let message = '';
        let params = {};
        if (!input.value.trim()) message = 'Completa este campo para continuar.';
        else if (input.type === 'email' && input.validity.typeMismatch) message = 'Escribe un correo electrónico válido.';
        else if (input.id === 'message' && input.value.trim().length < 10) message = 'Cuéntame un poco más: al menos 10 caracteres.';
        else if (input.maxLength > 0 && input.value.length > input.maxLength) { message = 'Usa un máximo de {count} caracteres.'; params = { count: input.maxLength }; }
        clearError(input);
        if (!message) return true;
        const feedback = $('.form-feedback', input.closest('.form-group'));
        feedback.id = `${input.id}Feedback`;
        i18n.text(feedback, message, params);
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', `${input.id === 'message' ? 'messageCount ' : ''}${feedback.id}`);
        return false;
    }
    formFields.forEach(input => {
        input.addEventListener('input', () => clearError(input));
        input.addEventListener('blur', () => { if (input.value) validateField(input); });
    });
    $$('[data-subject]').forEach(button => button.addEventListener('click', () => setSubject(button.dataset.subject)));
    subjectInput.addEventListener('input', () => { generatedSubject = null; syncTopics(); });
    messageInput.addEventListener('input', updateMessageCount);

    contactForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (sending) return;
        const valid = formFields.map(validateField).every(Boolean);
        if (!valid) { $('.is-invalid', contactForm).focus(); return; }
        sending = true;
        const button = $('button[type="submit"]', contactForm);
        const submitText = $('.submit-text', button);
        const spinner = $('.spinner-border', button);
        button.disabled = true;
        contactForm.setAttribute('aria-busy', 'true');
        submitText.textContent = 'Enviando mensaje…';
        spinner.classList.remove('d-none');
        spinner.setAttribute('aria-hidden', 'true');
        formStatus.hidden = false;
        const statusText = document.createElement('span');
        formStatus.replaceChildren(statusText);
        formStatus.dataset.status = 'sending';
        i18n.text(statusText, 'Conectando con el servicio de mensajes…');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
            const response = await fetch('/', {
                method: 'POST', body: new URLSearchParams(new FormData(contactForm)).toString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: controller.signal
            });
            if (!response.ok) throw new Error('El servicio no confirmó la entrega.');
            const name = $('#name').value.trim();
            formStatus.dataset.status = 'success';
            i18n.text(statusText, '¡Gracias, {name}! Tu mensaje se envió correctamente. Te responderé al correo que indicaste.', { name });
            const urgent = document.createElement('a');
            urgent.className = 'form-fallback';
            urgent.target = '_blank';
            urgent.rel = 'noopener noreferrer';
            urgent.textContent = '¿Urgente? Escríbeme por WhatsApp';
            urgent.href = `https://wa.me/51946016559?text=${encodeURIComponent(t('Hola Jose, soy {name}. Te acabo de escribir desde tu portafolio: {subject}.', { name, subject: $('#subject').value.trim() }))}`;
            formStatus.append(' ', urgent);
            contactForm.reset();
            generatedSubject = null;
            syncTopics();
            updateMessageCount();
        } catch (error) {
            formStatus.dataset.status = 'error';
            i18n.text(statusText, error.name === 'AbortError'
                ? 'La conexión tardó demasiado y no se pudo confirmar el envío. Tu texto sigue aquí. Puedes intentarlo de nuevo o escribirme a {email}.'
                : 'No se pudo enviar el mensaje. Tu texto sigue aquí para que puedas intentarlo de nuevo. También puedes escribirme a {email}.', { email: emailAddress });
            const fallback = document.createElement('a');
            fallback.className = 'form-fallback';
            fallback.textContent = 'Enviar con mi app de correo';
            fallback.href = `mailto:${emailAddress}?subject=${encodeURIComponent($('#subject').value.trim())}&body=${encodeURIComponent(`${messageInput.value.trim().slice(0, 1500)}\n\n— ${$('#name').value.trim()} (${$('#email').value.trim()})`)}`;
            formStatus.append(' ', fallback);
        } finally {
            clearTimeout(timeout);
            sending = false;
            button.disabled = false;
            contactForm.removeAttribute('aria-busy');
            submitText.innerHTML = `<i class="fas fa-paper-plane me-2"></i> ${t('Enviar mensaje')}`;
            spinner.classList.add('d-none');
        }
    });

    document.addEventListener('portfolio:language', () => {
        updateAppearance();
        updateMotion();
        filterProjects();
        if (commandDialog.open) renderCommands();
        if (generatedSubject && subjectInput.value === generatedSubject.value) setSubject(generatedSubject.source, generatedSubject.params);
        syncTopics();
    });

})();
