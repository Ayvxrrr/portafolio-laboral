(() => {
    'use strict';
    const AI_ENDPOINT = '/.netlify/functions/chat'; // Vacío para usar solo respuestas locales.
    const root = document.documentElement;
    const i18n = window.portfolioI18n;
    const t = i18n.t;
    const $ = (s, c = document) => c.querySelector(s);
    const full = () => root.dataset.motion !== 'reduced';
    const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const fmt = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
    const norm = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9+\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const has = (t, k) => k.length <= 3 ? ` ${t} `.includes(` ${k} `) : t.includes(k);

    const age = () => { const t = new Date(); let a = t.getFullYear() - 2005; if (t < new Date(t.getFullYear(), 3, 28)) a--; return a; };
    const WA = 'https://wa.me/51946016559?text=Hola%20Jose%2C%20vi%20tu%20portafolio%20y%20quiero%20hablar%20contigo.';
    const A = {
        wa: { label: 'WhatsApp', href: WA }, mail: { label: 'Correo', href: 'mailto:joseayvar28@gmail.com' },
        gh: { label: 'GitHub', href: 'https://github.com/Ayvxrrr' }, li: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jose-ayvar-82a980398' },
        cv: { label: 'Descargar CV', href: 'docs/CV-Ayvar-Jose.pdf', download: true },
        go: (label, id) => ({ label, go: id })
    };
    const sections = [['inicio', 'home'], ['home', 'home'], ['sobre mi', 'about'], ['about', 'about'], ['stack', 'skills'], ['habilidades', 'skills'], ['skills', 'skills'], ['proyectos', 'projects'], ['projects', 'projects'], ['taller', 'playground'], ['retrato', 'playground'], ['particulas', 'playground'], ['playground', 'playground'], ['workshop', 'playground'], ['editor', 'playground'], ['retos', 'playground'], ['challenges', 'playground'], ['contacto', 'contact'], ['contact', 'contact']];
    const sectionLabels = { home: 'Inicio', about: 'Sobre mí', skills: 'Stack', projects: 'Proyectos', playground: 'Robot interactivo', contact: 'Contacto' };

    // Respuestas locales por si la IA falla xd.
    const kb = [
        { k: ['hola', 'buenas', 'hey', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos'], a: '¡Hola! 👋 Soy <strong>Ayvarcitoo</strong>. Pregúntame sobre el perfil de Jose, sus proyectos y tecnologías, o cómo se relacionan con una idea de trabajo.' },
        { k: ['quien eres', 'que eres', 'como te llamas', 'eres un bot', 'eres una ia', 'eres humano', 'ayvarcitoo'], a: 'Soy <strong>Ayvarcitoo</strong>, el asistente del portafolio de Jose. Puedo conversar sobre su perfil profesional, proyectos, tecnologías y explicar temas relacionados con su trabajo.' },
        { k: ['quien es jose', 'sobre jose', 'presentate', 'cuentame de', 'perfil', 'sobre ti', 'quien es', 'junior', 'jr', 'senior'], a: '<strong>Ayvar Jose</strong> es desarrollador <strong>Full Stack Junior</strong> en Lima, Perú. Es titulado en Computación e Informática y cuenta con experiencia en proyectos de sistemas, páginas web y aplicaciones móviles. También combina el desarrollo freelance con la docencia en tecnología.', act: [A.go('Sobre mí', 'about')] },
        { k: ['experiencia', 'cedro', 'sistema de ventas', 'trayectoria'], a: 'Trabaja como <strong>desarrollador web freelance desde enero de 2026</strong>. Colaboró como apoyo técnico en un sistema de ventas para Negociaciones Cedro con Java, Jaspersoft y JPOS. También tiene experiencia docente en computación, programación y robótica. Puedes revisar su experiencia completa en el CV.', act: [A.cv, A.go('Ver proyectos', 'projects')] },
        { k: ['servicio', 'que ofrece', 'que puede hacer', 'mi negocio', 'mi emprendimiento'], a: 'Puede ayudarte con <strong>sitios web para presentar tu negocio</strong>, formularios, conexión con APIs y sistemas para registrar y consultar información. Lo mejor es contarle tu necesidad para revisar el alcance, los plazos y el presupuesto, sin prometer funciones antes de evaluar el proyecto.', act: [A.wa, A.go('Ver proyectos', 'projects')] },
        { k: ['tecnolog', 'stack', 'lenguaje', 'habilidad', 'skills', 'sabe programar', 'dominas', 'domina', 'react', 'node', 'php', 'java', 'javascript', 'python', 'mysql', 'aws', 'docker', 'angular', 'tailwind', 'frameworks'], a: 'Su base es <strong>JavaScript, HTML5 y CSS3</strong>, con <strong>PHP, Node.js y Java (Spring Boot)</strong> en el backend. Usa <strong>React, Angular, Bootstrap y Tailwind</strong>; bases de datos <strong>MySQL, PostgreSQL, MongoDB y Firebase</strong>; y trabaja con <strong>AWS, Git/GitHub, Docker</strong> y CI/CD inicial.', act: [A.go('Ver stack', 'skills')] },
        { k: ['docente', 'profesor', 'ensena', 'ensenar', 'clases', 'colegio', 'roblox', 'robotica', 'arduino', 'alumnos'], a: 'Enseña computación en primaria, secundaria y academia: ofimática, diseño gráfico y 3D, <strong>Roblox Studio (Luau)</strong>, algoritmos y desarrollo web. También dictó un taller de <strong>robótica con Arduino</strong>. En esta página puedes interactuar con un robot 3D de partículas.', act: [A.go('Ver robot interactivo', 'playground')] },
        { k: ['estudi', 'universidad', 'instituto', 'carrera', 'titulo', 'educacion', 'certificad', 'curso', 'ingeniero'], a: 'Es <strong>titulado en Computación e Informática</strong> por el IESTP Trentino Juan Pablo II. Su perfil combina desarrollo de software y docencia en tecnología.', act: [A.go('Sobre mí', 'about')] },
        { k: ['proyecto', 'proyectos', 'trabajos hechos', 'realizado', 'demo', 'portafolio de', 'ayvar pos', 'ayvar-pos'], a: 'Puedes probar <strong>Ayvar AI</strong>, su asistente de inteligencia artificial; <strong>El Toñito</strong>, una web para pollería con carta interactiva, pedidos por WhatsApp y asistente con IA; y <strong>Ayvar POS</strong>, un sistema de ventas e inventario con React, Node.js y Firebase. Los tres tienen vista previa, demo pública y código en GitHub. En la información de Ayvar POS están los accesos de administrador, cajero y almacén, exclusivos para la demo pública. Fitness y dashboard siguen siendo conceptos visuales.', act: [A.go('Ver proyectos', 'projects'), A.gh] },
        { k: ['contact', 'escribir', 'whatsapp', 'wsp', 'correo', 'email', 'mail', 'telefono', 'numero', 'llamar', 'celular', 'hablar con'], a: 'Puedes escribirle usando el botón de <strong>WhatsApp</strong>, el formulario de contacto o su correo <strong>joseayvar28@gmail.com</strong>.', act: [A.wa, A.mail, A.go('Formulario', 'contact')] },
        { k: ['disponible', 'contratar', 'contratarte', 'freelance', 'cotizar', 'presupuesto', 'precio', 'cobras', 'cuanto cuesta', 'tarifa', 'sitio web para', 'pagina web para'], a: 'Sí, Jose está <strong>disponible para nuevos proyectos</strong> web y sistemas a medida. El presupuesto depende de lo que necesites, así que lo mejor es contarle tu idea por WhatsApp.', act: [A.wa, A.mail] },
        { k: ['cv', 'curriculum', 'hoja de vida', 'resume'], a: 'Aquí tienes su CV en PDF 📄', act: [A.cv] },
        { k: ['donde vive', 'ubicacion', 'ubicado', 'lima', 'pachacamac', 'pais', 'remoto', 'presencial'], a: 'Jose vive en <strong>Lima, Perú</strong> (Pachacámac). Para coordinar la modalidad de trabajo, escríbele directamente.', act: [A.wa] },
        { k: ['ingles', 'idioma', 'idiomas', 'english'], a: 'Su CV indica <strong>inglés nivel básico</strong>. Español es su idioma principal.' },
        { k: ['github', 'linkedin', 'redes', 'repositorio'], a: 'Encuentras a Jose en GitHub y LinkedIn:', act: [A.gh, A.li] },
        { k: ['taller', 'retrato', 'robot', 'particulas', 'editor', 'codigo en vivo', 'como funciona el taller'], a: 'En la sección <strong>Robot interactivo</strong>, un modelo 3D se forma con partículas, gira con el desplazamiento y se desintegra al acercar el cursor para volver a integrarse cuando lo alejas.', act: [A.go('Ver robot interactivo', 'playground')] },
        { k: ['como esta hecho', 'hecho con', 'como lo hizo', 'tecnologias del portafolio', 'esta pagina', 'este portafolio'], a: 'Este portafolio está hecho con <strong>HTML, CSS y JavaScript puros</strong>, sin frameworks: experiencias animadas, un robot 3D interactivo de partículas y un asistente virtual. Se publica en Netlify.' },
        { k: ['edad', 'cuantos anos', 'anos tiene', 'que edad', 'nacio', 'cumpleanos', 'fecha de nacimiento', 'cuando naciste'], a: () => t('Jose nació el <strong>28 de abril de 2005</strong> y tiene <strong>{age} años</strong>. Joven, pero con bastante código a cuestas 😄', { age: age() }) },
        { k: ['novia', 'novio', 'pareja', 'soltero', 'casado', 'esposa', 'enamorado'], a: 'Prefiero mantener la conversación en el perfil profesional de Jose 😊. Puedo contarte sobre sus proyectos, experiencia y tecnologías.' },
        { k: ['hobby', 'hobbies', 'pasatiempo', 'pasatiempos', 'le gusta', 'aficion', 'tiempo libre', 'gustos'], a: 'Eso es parte de su misterio 😄. Lo que sí se nota es que lo suyo es <strong>programar y enseñar tecnología</strong>. Si quieres conocerlo mejor, escríbele.', act: [A.wa] },
        { k: ['instalar', 'instalo', 'app', 'aplicacion', 'descargar la pagina', 'pantalla de inicio'], a: 'Este portafolio se puede <strong>instalar como app</strong> y abrir incluso sin conexión. En Android o PC pulsa el botón; en iPhone usa <em>Compartir</em> y luego <em>Añadir a pantalla de inicio</em>.', act: [{ label: 'Instalar app', install: true }] },
        { k: ['gracias', 'genial', 'excelente', 'buenisimo', 'chevere'], a: '¡Con gusto! 😊 Si quieres, pregúntame algo más o escríbele a Jose.' },
        { k: ['chau', 'adios', 'hasta luego', 'nos vemos'], a: '¡Hasta pronto! 👋 Cuando quieras volver, aquí estaré.' },
        { k: ['chiste', 'algo gracioso'], a: '¿Por qué los programadores confunden Halloween con Navidad? Porque <code>Oct 31 == Dec 25</code> 🎃🎄' },
        { k: ['ayuda', 'que puedes hacer', 'que haces', 'comandos', 'opciones'], a: 'Puedo conversar sobre el <strong>perfil y los proyectos</strong> de Jose, explicar tecnologías que usa, relacionar sus habilidades con una necesidad laboral, ayudarte a explorar la página o preparar preguntas profesionales. Pregúntame con tus propias palabras.' }
    ];
    const aliases = {
        hola: ['hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'greetings'],
        'quien eres': ['who are you', 'what are you', 'your name', 'are you a bot', 'are you human'],
        'quien es jose': ['who is jose', 'about jose', 'introduce', 'profile', 'tell me about him'],
        experiencia: ['experience', 'background', 'sales system'],
        servicio: ['service', 'what can he do', 'my business', 'my startup'],
        tecnolog: ['technolog', 'programming language', 'framework', 'what does he use', 'what can he build'],
        docente: ['teacher', 'teach', 'robotics', 'student', 'class', 'school'],
        estudi: ['education', 'studies', 'study', 'university', 'degree', 'certificate', 'academic', 'course'],
        proyecto: ['project', 'portfolio', 'what has he built'],
        contact: ['reach him', 'write to', 'phone', 'number', 'message jose', 'talk to jose'],
        disponible: ['available', 'availability', 'hire', 'quote', 'budget', 'pricing', 'price', 'cost', 'rate', 'website for'],
        cv: ['curriculum vitae'],
        'donde vive': ['where does he live', 'where is he', 'location', 'remote', 'on site', 'peru'],
        ingles: ['spoken language', 'spanish'],
        github: ['social', 'repository', 'repositories'],
        taller: ['playground', 'workshop', 'challenge', 'live editor'],
        'como esta hecho': ['how was this built', 'how is this built', 'this website', 'this portfolio', 'made with'],
        edad: ['age', 'how old', 'birthday', 'born', 'birth date'],
        novia: ['girlfriend', 'boyfriend', 'partner', 'single', 'married', 'wife'],
        hobby: ['hobbies', 'free time', 'interest', 'likes'],
        instalar: ['install', 'offline', 'home screen'],
        gracias: ['thanks', 'thank you', 'awesome', 'great', 'excellent'],
        chau: ['bye', 'goodbye', 'see you'], chiste: ['joke', 'funny'],
        ayuda: ['help', 'what can you do', 'commands', 'options']
    };
    kb.forEach(entry => entry.k.push(...(aliases[entry.k[0]] || [])));
    const lessons = [
        { k: ['html'], a: '<strong>HTML</strong> da estructura a una página: define títulos, párrafos, imágenes y botones con etiquetas como <code>&lt;h1&gt;</code> o <code>&lt;p&gt;</code>. Es parte de la base con la que Jose crea experiencias web.' },
        { k: ['css'], a: '<strong>CSS</strong> define la presentación: colores, tamaños, espacios y animaciones. Se usa junto con HTML y JavaScript en los proyectos web de Jose para construir interfaces claras y adaptables.' },
        { k: ['javascript', 'js'], a: '<strong>JavaScript</strong> añade comportamiento a una web: responde a clics, valida formularios y actualiza la interfaz. Es una de las tecnologías principales del stack de Jose y aparece en sus proyectos Full Stack.' },
        { k: ['api'], a: 'Una <strong>API</strong> permite que dos programas intercambien solicitudes y respuestas, a menudo en JSON. Entender APIs ayuda a comprender cómo se conectan interfaces y servicios en el desarrollo Full Stack que realiza Jose.' },
        { k: ['base de datos', 'sql', 'mysql'], a: 'Una <strong>base de datos</strong> organiza información, y <strong>SQL</strong> permite consultarla o modificarla. Jose incluye MySQL y PostgreSQL entre sus tecnologías; por ejemplo, una consulta podría ser <code>SELECT * FROM clientes;</code>.' },
        { k: ['git', 'github'], a: '<strong>Git</strong> registra cambios del código para revisar versiones y colaborar; <strong>GitHub</strong> aloja repositorios. Puedes explorar en GitHub el código de proyectos publicados de Jose, como Ayvar AI y El Toñito.' },
        { k: ['frontend', 'backend', 'full stack', 'fullstack'], a: 'El <strong>frontend</strong> es la interfaz con la que interactúa el usuario; el <strong>backend</strong> maneja lógica y servicios. El perfil <strong>Full Stack</strong> de Jose abarca ambos lados del desarrollo.' },
        { k: ['responsive', 'adaptable'], a: 'Un diseño <strong>responsive</strong> adapta la interfaz a móviles y computadoras con técnicas como Grid, Flexbox y media queries. Jose presenta sus proyectos para celular y escritorio.' },
        { k: ['variable'], a: 'Una <strong>variable</strong> guarda un valor que el programa puede consultar o cambiar, por ejemplo <code>let edad = 20;</code>. Es un concepto básico de JavaScript, una tecnología central del stack de Jose.' },
        { k: ['funcion'], a: 'Una <strong>función</strong> agrupa instrucciones reutilizables, por ejemplo <code>function saludar() { console.log("Hola"); }</code>. Es uno de los fundamentos de JavaScript y del trabajo web de Jose.' }
    ];
    lessons[4].k.push('database');
    lessons[8].k.push('variable');
    lessons[9].k.push('function');
    const FALLBACK = { a: 'No tengo suficiente información para responder eso con seguridad. Puedo ayudarte con el perfil profesional, los proyectos o las tecnologías de Jose; si quieres, cuéntame cómo se relaciona tu pregunta con alguno de esos temas.' };

    const fab = document.createElement('button');
    fab.className = 'ayv-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Abrir chat con Ayvarcitoo');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'ayvPanel');
    fab.innerHTML = '<i class="fas fa-robot" aria-hidden="true"></i><span class="ayv-dot" aria-hidden="true"></span>';
    const tip = document.createElement('div');
    tip.className = 'ayv-tip';
    tip.hidden = true;
    tip.textContent = '¡Hola! Soy Ayvarcitoo 👋 ¿Tienes dudas?';
    const panel = document.createElement('section');
    panel.className = 'ayv-panel';
    panel.id = 'ayvPanel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat con Ayvarcitoo');
    panel.innerHTML = `<header class="ayv-head"><div class="ayv-ava" aria-hidden="true"><i class="fas fa-robot"></i></div><div><strong>Ayvarcitoo</strong><span id="ayvState"><i class="status-dot" aria-hidden="true"></i> En línea</span></div><button type="button" class="ayv-close" aria-label="Cerrar chat"><i class="fas fa-xmark" aria-hidden="true"></i></button></header>
        <div class="ayv-log" id="ayvLog" role="log" aria-live="polite"></div>
        <div class="ayv-chips" id="ayvChips"></div>
        <form class="ayv-form" id="ayvForm"><label class="visually-hidden" for="ayvInput">Escribe tu pregunta</label><input id="ayvInput" type="text" maxlength="300" placeholder="Pregúntame sobre Jose y su trabajo…" autocomplete="off"><button type="submit" aria-label="Enviar"><i class="fas fa-paper-plane" aria-hidden="true"></i></button></form>`;
    document.body.append(fab, tip, panel);
    const log = $('#ayvLog'), input = $('#ayvInput'), chips = $('#ayvChips');
    const hist = [];
    let ai = AI_ENDPOINT ? 'unknown' : 'off', welcomed = false, busy = false;

    function actions(list) {
        const box = document.createElement('div');
        box.className = 'ayv-acts';
        list.forEach(a => {
            const el = document.createElement(a.go || a.install ? 'button' : 'a');
            el.className = 'ayv-act';
            el.textContent = a.label;
            if (a.install) { el.type = 'button'; el.addEventListener('click', () => { if (window.__pwaPrompt) window.__pwaPrompt.prompt(); else add('bot', 'Tu navegador no muestra el botón de instalación. Abre el menú del navegador y busca <strong>Instalar app</strong> o <strong>Añadir a pantalla de inicio</strong>.'); }); }
            else if (a.go) { el.type = 'button'; el.addEventListener('click', () => go(a.go)); }
            else { el.href = a.href; if (a.download) el.download = ''; else { el.target = '_blank'; el.rel = 'noopener noreferrer'; } }
            box.append(el);
        });
        return box;
    }
    function add(role, html, act, remote = false) {
        const m = document.createElement('div');
        m.className = `ayv-msg ${role}`;
        const b = document.createElement('div');
        b.className = 'ayv-bubble';
        if (role === 'bot' && !remote) i18n.html(b, html);
        else { b.innerHTML = html; b.setAttribute('data-i18n-ignore', ''); }
        m.append(b);
        if (act?.length) m.append(actions(act));
        log.append(m);
        log.scrollTop = log.scrollHeight;
        return m;
    }
    function go(id) {
        const a = document.createElement('a');
        a.href = `#${id}`;
        document.body.append(a);
        a.click();
        a.remove();
        if (innerWidth < 768) close();
    }
    function typing() { const m = add('bot', '<span class="ayv-typing"><i></i><i></i><i></i></span>'); m.classList.add('is-typing'); return m; }
    const plain = html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent; };
    const wait = ms => new Promise(r => setTimeout(r, full() ? ms : 0));
    const best = (n, list) => { let top = null, score = 0; list.forEach(e => { const s = e.k.reduce((t, k) => t + (has(n, k) ? 2 + (k.includes(' ') ? 1 : 0) : 0), 0); if (s > score) { score = s; top = e; } }); return top; };

    async function askAI() {
        if (ai === 'off') return null;
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 20000);
        try {
            const r = await fetch(AI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: hist.slice(-8), language: root.lang }), signal: ctl.signal });
            if (!r.ok) throw new Error(String(r.status));
            const { reply } = await r.json();
            if (!reply) throw new Error('vacío');
            ai = 'on';
            $('#ayvState').innerHTML = '<i class="status-dot" aria-hidden="true"></i> En línea · IA activa';
            return reply;
        } catch { if (ai === 'unknown') ai = 'off'; return null; } finally { clearTimeout(t); }
    }
    async function answer(text) {
        const n = norm(text);
        const nav = /(llevame|lleva|ir a|ve a|vamos|muestrame|mostrar|abre|abrir|quiero ver|ver|take me|go to|show|open|want to see)\b/.test(n) && sections.find(([k]) => n.includes(k));
        if (nav) { setTimeout(() => go(nav[1]), 500); return { a: () => t('Te llevo a <strong>{section}</strong> 🚀', { section: t(sectionLabels[nav[1]]) }) }; }
        const th = n.match(/\b(claro|oscuro|light|dark)\b/);
        if (th && /(modo|tema|activa|pon|cambia|mode|theme|enable|switch|set|turn)/.test(n)) {
            const want = ['claro', 'light'].includes(th[1]) ? 'light' : 'dark';
            if ((root.dataset.theme || 'dark') !== want) $('#themeToggle')?.click();
            return { a: () => t('Listo, activé el modo <strong>{theme}</strong> ✨', { theme: t(want === 'light' ? 'claro' : 'oscuro') }) };
        }
        if (ai !== 'off') { const r = await askAI(); if (r) return { ai: r }; }
        const generic = /^(que es|que son|como (se|puedo|hago)|explica|explicame|diferencia|por que|para que sirve|cual es la diferencia|what is|what are|how (do|does|can|to)|explain|difference|why|what does)/.test(n);
        if (generic) {
            const les = best(n, lessons);
            if (les) return les;
        }
        const hit = best(n, kb);
        if (hit) return hit;
        return FALLBACK;
    }
    async function send(text) {
        text = text.trim();
        if (!text || busy) return;
        busy = true;
        chips.hidden = true;
        add('user', esc(text));
        hist.push({ role: 'user', content: text });
        const pending = typing();
        const [res] = await Promise.all([answer(text), wait(550)]);
        pending.remove();
        const html = res.ai ? fmt(res.ai) : res.a;
        add('bot', html, res.act, Boolean(res.ai));
        hist.push({ role: 'assistant', content: res.ai || plain(typeof res.a === 'function' ? res.a() : t(res.a)) });
        busy = false;
        input.focus({ preventScroll: true });
    }
    function open() {
        tip.hidden = true;
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add('is-open'));
        fab.setAttribute('aria-expanded', 'true');
        if (!welcomed) {
            welcomed = true;
            add('bot', '¡Hola! Soy <strong>Ayvarcitoo</strong> 👋, el asistente del portafolio de Jose. Pregúntame sobre su perfil, proyectos y tecnologías, o cómo sus habilidades podrían relacionarse con una oportunidad o idea. También puedo guiarte por la página.');
            ['¿Qué tecnologías usa?', '¿Está disponible?', 'Llévame a proyectos', '¿Puedo instalar la app?', 'Descargar CV'].forEach(q => {
                const b = document.createElement('button');
                b.type = 'button';
                b.textContent = q;
                b.addEventListener('click', () => send(t(q)));
                chips.append(b);
            });
        }
        setTimeout(() => input.focus({ preventScroll: true }), 120);
    }
    function close() {
        panel.classList.remove('is-open');
        fab.setAttribute('aria-expanded', 'false');
        setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, full() ? 250 : 0);
        fab.focus({ preventScroll: true });
    }
    fab.addEventListener('click', () => (panel.hidden || !panel.classList.contains('is-open') ? open() : close()));
    $('.ayv-close', panel).addEventListener('click', close);
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    $('#ayvForm').addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });
    try {
        if (!sessionStorage.getItem('ayv.tip')) setTimeout(() => {
            if (!panel.hidden) return;
            tip.hidden = false;
            sessionStorage.setItem('ayv.tip', '1');
            setTimeout(() => { tip.hidden = true; }, 8000);
        }, 7000);
    } catch {}
    tip.addEventListener('click', open);
})();
