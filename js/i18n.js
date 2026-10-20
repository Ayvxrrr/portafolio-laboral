(() => {
    'use strict';
    const root = document.documentElement;
    const entries = [
        ['Ayvar Jose | Desarrollo web para negocios', 'Ayvar Jose | Web development for businesses'],
        ['Ayvar Jose, desarrollador Full Stack Junior y titulado en Computación e Informática en Lima, Perú. Proyectos de sistemas, páginas web y aplicaciones móviles.', 'Ayvar Jose, Junior Full Stack developer with a technical degree in Computing and Informatics in Lima, Peru. Systems, websites and mobile app projects.'],
        ['Sitios web para presentar tu negocio y sistemas a medida para organizar su información. Conoce mis proyectos y conversemos sobre tu idea.', 'Websites to showcase your business and custom systems to organize its information. Explore my projects and let’s talk about your idea.'],
        ['Ayvar Jose, desarrollador Full Stack Junior', 'Ayvar Jose, Junior Full Stack developer'],
        ['Saltar al contenido', 'Skip to content'],
        ['Navegación principal', 'Main navigation'],
        ['Ayvar Jose, inicio', 'Ayvar Jose, home'],
        ['Inicio', 'Home'], ['Sobre mí', 'About me'], ['Proyectos', 'Projects'], ['Contacto', 'Contact'], ['Retrato', 'Portrait'], ['Taller', 'Playground'],
        ['Trabajos', 'Works'], ['Ayvar Jose, desarrollador Full Stack', 'Ayvar Jose, Full Stack developer'],
        ['DESLIZA PARA EXPLORAR', 'SCROLL TO EXPLORE'], ['Mi forma de crear', 'How I create'],
        ['DISEÑO CON', 'DESIGNED WITH'], ['INTENCIÓN.', 'INTENTION.'], ['CÓDIGO CON', 'CODE WITH'], ['PROPÓSITO.', 'PURPOSE.'],
        ['Detrás del código', 'Behind the code'], ['Hola, soy Ayvar Jose.', 'Hi, I’m Ayvar Jose.'],
        ['Soy desarrollador Full Stack Junior y titulado en Computación e Informática. Trabajo en proyectos de sistemas, páginas web y aplicaciones móviles, buscando soluciones prácticas para cada necesidad.', 'I’m a Junior Full Stack developer with a technical degree in Computing and Informatics. I work on systems, websites and mobile app projects, looking for practical solutions to each need.'],
        ['MIS TRABAJOS', 'MY WORKS'], ['SOBRE MÍ', 'ABOUT ME'], ['SOY AYVAR JOSE.', 'I’M AYVAR JOSE.'], ['DESARROLLADOR', 'DEVELOPER'],
        ['DESARROLLADOR FULL STACK', 'FULL STACK DEVELOPER'],
        ['Soy titulado en Computación e Informática, con experiencia en proyectos de sistemas, páginas web y aplicaciones móviles. Me enfoco en crear soluciones prácticas y fáciles de usar.', 'I hold a technical degree in Computing and Informatics, with experience in systems, websites and mobile app projects. I focus on creating practical, easy-to-use solutions.'],
        ['MI STACK ↘', 'MY STACK ↘'], ['ROBOT INTERACTIVO ↘', 'INTERACTIVE ROBOT ↘'], ['MI CV ↘', 'MY CV ↘'],
        ['Más sobre mí · terminal y detalles', 'More about me · terminal and details'],
        ['CURRICULUM', 'RESUME'], ['DESCARGA AQUÍ', 'DOWNLOAD HERE'], ['MI CV EN', 'MY CV IN'], ['FORMATO PDF', 'PDF FORMAT'],
        ['Seleccionar proyecto', 'Select a project'], ['Ver proyecto {number}', 'View project {number}'],
        ['Proyecto anterior', 'Previous project'], ['Proyecto siguiente', 'Next project'],
        ['Ver todos los proyectos', 'View all projects'], ['Volver a la galería', 'Back to the gallery'],
        ['DESLIZA PARA CAMBIAR', 'SCROLL TO CHANGE'], ['Calidad de la animación', 'Animation quality'],
        ['Abrir menú de navegación', 'Open navigation menu'], ['Cerrar menú de navegación', 'Close navigation menu'],
        ['Abrir navegación rápida, Control K', 'Open quick navigation, Control K'],
        ['Activar modo claro', 'Switch to light mode'], ['Activar modo oscuro', 'Switch to dark mode'],
        ['Modo claro', 'Light mode'],
        ['Progreso de lectura del proyecto', 'Project reading progress'], ['Contenido del proyecto', 'Project content'],
        ['DESLIZA HACIA ABAJO', 'SCROLL DOWN'],
        ['Progreso de la historia de perfil', 'Profile story progress'], ['Cargando escena 3D…', 'Loading 3D scene…'],
        ['Vista 3D no disponible. Tu perfil y CV siguen accesibles.', '3D view unavailable. Your profile and CV are still accessible.'],
        ['Idioma del sitio', 'Site language'],
        ['Cambiar a inglés', 'Switch to English'], ['Cambiar a español', 'Switch to Spanish'],
        ['PORTAFOLIO PERSONAL / 2026', 'PERSONAL PORTFOLIO / 2026'], ['LIMA, PERÚ', 'LIMA, PERU'],
        ['Disponible para nuevos proyectos', 'Available for new projects'], ['Hola, soy Ayvar Jose', 'Hi, I’m Ayvar Jose'],
        ['Transformo ideas', 'I turn ideas'], ['en', 'into'], ['experiencias', 'digital'], ['digitales', 'experiences'],
        ['Desarrollador Full Stack Junior', 'Junior Full Stack developer'], ['FULL STACK JR.', 'JUNIOR FULL STACK.'],
        ['Código con propósito. Diseño con intención. Desarrollo soluciones web con JavaScript, PHP, React y Node.js que conectan ideas con personas.', 'Purposeful code. Intentional design. I build web solutions with JavaScript, PHP, React and Node.js that connect ideas with people.'],
        ['Explorar proyectos', 'Explore projects'], ['Descargar CV', 'Download CV'], ['ENCUÉNTRAME EN', 'FIND ME ON'],
        ['Enviar correo', 'Send email'], ['Retrato de Ayvar Jose, desarrollador Full Stack', 'Portrait of Ayvar Jose, Full Stack developer'],
        ['DETRÁS DEL CÓDIGO', 'BEHIND THE CODE'], ['Siempre aprendiendo', 'Always learning'],
        ['Explorar habilidades en React', 'Explore React skills'], ['Explorar habilidades en JavaScript', 'Explore JavaScript skills'],
        ['Presencia digital', 'Online presence'], ['Gestión', 'Management'], ['Sistemas a medida', 'Custom systems'], ['EXPLORA MI UNIVERSO', 'EXPLORE MY WORLD'],
        ['Tecnologías principales', 'Core technologies'], ['MI KIT DE CREACIÓN', 'MY BUILDING KIT'],
        ['01 / Un poco sobre mí', '01 / A little about me'],
        ['Curiosidad que se convierte', 'Curiosity turned'], ['soluciones.', 'solutions.'],
        ['Terminal interactiva del portafolio', 'Interactive portfolio terminal'], ['¡Bienvenido a mi espacio de trabajo!', 'Welcome to my workspace!'],
        ['Una forma diferente de conocerme.', 'A different way to get to know me.'], ['Resultados de la terminal', 'Terminal output'],
        ['Ayvar Jose · Desarrollador Full Stack Junior', 'Ayvar Jose · Junior Full Stack developer'],
        ['Titulado en Computación e Informática · Desarrollo de software y docencia.', 'Technical degree in Computing and Informatics · Software development and teaching.'],
        ['Escribe help para ver los comandos disponibles.', 'Type help to see the available commands.'],
        ['Escribe un comando', 'Type a command'], ['Prueba: help', 'Try: help'], ['Ejecutar comando', 'Run command'], ['PRUEBA', 'TRY'],
        ['Aprender. Crear. Compartir.', 'Learn. Build. Share.'],
        ['La tecnología tiene sentido cuando ayuda a alguien.', 'Technology matters when it helps someone.'],
        ['Desarrollo web con aprendizaje continuo', 'Web development through continuous learning'],
        ['Trabajo en proyectos web freelance desde enero de 2026. Desarrollo páginas y sistemas personalizados con JavaScript, PHP y bases de datos, según lo que necesita cada negocio.', 'I’ve worked on freelance web projects since January 2026. I build websites and custom systems with JavaScript, PHP and databases, based on each business’s needs.'],
        ['Colaboré en un sistema de ventas para Negociaciones Cedro, con apoyo en Java, reportes con Jaspersoft e integración de una etiquetera con JPOS. También enseño computación y programación: explicar con claridad es parte de mi trabajo.', 'I contributed to a sales system for Negociaciones Cedro, helping with Java, Jaspersoft reports and label printer integration using JPOS. I also teach computing and programming: clear explanations are part of my work.'],
        ['Nombre:', 'Name:'], ['Edad:', 'Age:'], ['Ubicación:', 'Location:'], ['Pachacamac Perú', 'Pachacamac, Peru'],
        ['Escríbeme por WhatsApp', 'Message me on WhatsApp'], ['Disponibilidad:', 'Availability:'], ['Disponible', 'Available'],
        ['Hola Jose, vi tu portafolio y quiero hablar contigo.', 'Hi Jose, I saw your portfolio and would like to get in touch.'],
        ['Mis Intereses', 'My interests'], ['Desarrollo Web', 'Web Development'], ['Apps Móviles', 'Mobile Apps'],
        ['Bases de Datos', 'Databases'], ['Inteligencia Artificial', 'Artificial Intelligence'],
        ['Certificaciones', 'Certifications'], ['Fundamentos de Python: variables, estructuras de control y funciones.', 'Python fundamentals: variables, control flow and functions.'],
        ['Formación básica', 'Foundational training'], ['Formación técnica', 'Technical training'],
        ['Java - Curso Técnico', 'Java — Technical Course'], ['Programación orientada a objetos, manejo de APIs y desarrollo de aplicaciones.', 'Object-oriented programming, APIs and application development.'],
        ['02 / Mi ecosistema tecnológico', '02 / My technology ecosystem'], ['Las herramientas.', 'The tools.'], ['Las posibilidades.', 'The possibilities.'],
        ['Del primer píxel a la última consulta. Un stack para construir de principio a fin.', 'From the first pixel to the final query. A stack for building from start to finish.'],
        ['LIVE LAB / INTERACTIVO', 'LIVE LAB / INTERACTIVE'], ['Del clic', 'From click'], ['al', 'to'], ['dato.', 'data.'],
        ['Así se conectan las piezas de una aplicación Full Stack. Toca cada capa o sigue el recorrido de una solicitud.', 'See how the pieces of a Full Stack application connect. Select a layer or follow a request through the system.'],
        ['Simular solicitud', 'Simulate request'], ['Simulación visual · sin llamadas externas', 'Visual simulation · no external requests'],
        ['LISTO PARA EXPLORAR', 'READY TO EXPLORE'], ['Explorar capas de la arquitectura', 'Explore architecture layers'],
        ['Interfaz', 'Interface'], ['Servidor', 'Server'], ['Datos', 'Data'],
        ['La experiencia comienza aquí.', 'The experience starts here.'],
        ['Interfaces adaptables e interactivas que convierten las acciones del usuario en solicitudes al servidor.', 'Responsive, interactive interfaces that turn user actions into server requests.'],
        ['Sistema listo. Explora una capa o inicia la simulación.', 'System ready. Explore a layer or start the simulation.'],
        ['Lenguajes de Programación', 'Programming Languages'],
        ['03 / Ideas llevadas a la realidad', '03 / Ideas brought to life'], ['Menos palabras.', 'Fewer words.'], ['Más', 'More'], ['proyectos.', 'projects.'],
        ['Prueba las demos de Ayvar AI, El Toñito y Ayvar POS y revisa su código. Las otras dos propuestas son conceptos visuales, no productos publicados.', 'Try the Ayvar AI, El Toñito and Ayvar POS demos and explore their source code. The other two proposals are visual concepts, not released products.'],
        ['Filtrar proyectos por categoría', 'Filter projects by category'], ['Todos', 'All'], ['Diseño', 'Design'],
        ['Buscar proyecto o tecnología', 'Search projects or technologies'], ['Buscar proyecto o tecnología…', 'Search projects or technologies…'],
        ['5 proyectos seleccionados', '5 selected projects'], ['Demo disponible', 'Live demo'],
        ['Ver detalles de Ayvar AI', 'View Ayvar AI details'],
        ['Vista previa de Ayvar AI, con su chat y opciones de creatividad, código y aprendizaje', 'Ayvar AI preview, showing its chat and creativity, coding and learning modes'],
        ['Web · Inteligencia artificial', 'Web · Artificial intelligence'],
        ['Asistente de inteligencia artificial para crear ideas, programar y aprender. Un espacio de conversación con modos de creatividad, código y aprendizaje.', 'An AI assistant for exploring ideas, coding and learning. A conversation space with creativity, coding and learning modes.'],
        ['IA', 'AI'], ['Ver demo', 'View demo'], ['Ver demo de Ayvar AI (abre en otra pestaña)', 'View Ayvar AI demo (opens in a new tab)'],
        ['Ver código de Ayvar AI en GitHub', 'View Ayvar AI source on GitHub'], ['Código', 'Source'], ['Explorar proyecto', 'Explore project'],
        ['Ver detalles de El Toñito · Pollería y Parrillas', 'View El Toñito · Chicken & Grill details'],
        ['Vista previa de Pollería El Toñito, con su presentación de pollo a la brasa y acceso a la carta y pedidos', 'El Toñito preview, featuring rotisserie chicken, its menu and ordering options'],
        ['Web · Diseño', 'Web · Design'], ['El Toñito · Pollería y Parrillas', 'El Toñito · Chicken & Grill'],
        ['Web para Pollería El Toñito en Manchay: carta interactiva, promociones, carrito para solicitar pedidos por WhatsApp y asistente con inteligencia artificial. Diseño adaptable a celulares y computadoras.', 'Website for El Toñito in Manchay: an interactive menu, special offers, a cart for WhatsApp orders and an AI assistant. Responsive design for mobile and desktop.'],
        ['Ver demo de Pollería El Toñito (abre en otra pestaña)', 'View El Toñito demo (opens in a new tab)'],
        ['Ver código de Pollería El Toñito en GitHub', 'View El Toñito source on GitHub'],
        ['Ver detalles de Ayvar POS', 'View Ayvar POS details'],
        ['Vista previa de Ayvar POS, con su pantalla de acceso al sistema de ventas e inventario', 'Ayvar POS preview, showing the sign-in screen for its sales and inventory system'],
        ['Full Stack · Punto de venta', 'Full Stack · Point of sale'],
        ['Sistema de punto de venta e inventario para gestionar ventas, productos, clientes y reportes. Demo pública con acceso por roles: administrador, cajero y almacén.', 'Point-of-sale and inventory system for managing sales, products, customers and reports. Public demo with role-based access: administrator, cashier and warehouse.'],
        ['Ver demo de Ayvar POS (abre en otra pestaña)', 'View Ayvar POS demo (opens in a new tab)'],
        ['Ver código de Ayvar POS en GitHub', 'View Ayvar POS source on GitHub'],
        ['Información y accesos demo', 'Project info and demo accounts'],
        ['Accesos a la demo pública', 'Public demo accounts'], ['Proyecto:', 'Project:'], ['Negocio demo:', 'Demo business:'], ['Estado:', 'Status:'],
        ['Administrador', 'Administrator'], ['Cajero', 'Cashier'], ['Almacén', 'Warehouse'], ['Correo:', 'Email:'], ['Contraseña:', 'Password:'],
        ['Estas contraseñas son para una demo pública. Nunca reutilizarlas en cuentas reales.', 'These passwords are for a public demo. Never reuse them for real accounts.'],
        ['Concepto · Mobile', 'Concept · Mobile'], ['Concepto · Web', 'Concept · Web'],
        ['Ver detalles de App Fitness', 'View Fitness App details'], ['Hazlo por ti', 'Do it for you'], ['Tu actividad de hoy', 'Your activity today'],
        ['Energía', 'Energy'], ['Progreso', 'Progress'], ['Un paso más cerca', 'One step closer'], ['App Fitness', 'Fitness App'],
        ['Concepto visual de una app para registrar ejercicios y progreso físico. No es una aplicación publicada; el stack mostrado es una propuesta técnica.', 'Visual concept for an app to log workouts and fitness progress. This is not a released app; the displayed stack is a technical proposal.'],
        ['Ver detalles de Dashboard Analítico', 'View Analytics Dashboard details'], ['Todo, en perspectiva.', 'Everything in perspective.'],
        ['En tiempo real', 'In real time'], ['En un solo lugar', 'In one place'], ['Dashboard Analítico', 'Analytics Dashboard'],
        ['Concepto visual de un panel con métricas y gráficos. No está conectado a datos reales; el stack mostrado es una propuesta técnica.', 'Visual concept for a dashboard with metrics and charts. It is not connected to real data; the displayed stack is a technical proposal.'],
        ['No encontré ese proyecto', 'No matching projects'], ['Prueba con otra tecnología o explora todos los proyectos.', 'Try another technology or explore all projects.'],
        ['Restablecer filtros', 'Reset filters'], ['Repositorios recientes en GitHub', 'Recent GitHub repositories'],
        ['Cada proyecto, una nueva oportunidad de crear.', 'Every project, a new chance to create.'], ['Más en GitHub', 'More on GitHub'],
        ['04 / UNA IDENTIDAD CREADA CON CÓDIGO', '04 / AN IDENTITY BUILT WITH CODE'],
        ['Ideas claras.', 'Clear ideas.'], ['Soluciones que', 'Solutions that'], ['conectan.', 'connect.'],
        ['Una web para presentar tu negocio o un sistema para organizar tu información. Cuéntame qué necesitas y revisamos el alcance de tu proyecto.', 'A website to showcase your business or a system to organize your information. Tell me what you need and let’s review your project’s scope.'],
        ['HABLEMOS DE TU PRÓXIMO PROYECTO', 'LET’S TALK ABOUT YOUR NEXT PROJECT'],
        ['ROBOT INTERACTIVO ↘', 'INTERACTIVE ROBOT ↘'],
        ['04 / ROBÓTICA GENERATIVA', '04 / GENERATIVE ROBOTICS'],
        ['Robot 3D de partículas que se dispersan y se reconstruyen con el cursor', '3D particle robot that disperses and rebuilds with the pointer'],
        ['AYVAR JOSE', 'AYVAR JOSE'], ['FULL STACK', 'FULL STACK'], ['LIMA · PERÚ', 'LIMA · PERU'],
        ['Preparando robot interactivo…', 'Preparing interactive robot…'],
        ['No se pudo cargar el robot 3D. Intenta abrir el portafolio desde el servidor web.', 'The 3D robot could not be loaded. Try opening the portfolio from its web server.'],
        ['05 / El siguiente paso', '05 / The next step'], ['¿Hablamos de', 'Let’s talk about'], ['tu proyecto?', 'your project.'],
        ['Sitios web y sistemas a medida para negocios y emprendimientos.', 'Websites and custom systems for businesses and entrepreneurs.'],
        ['Hablemos de tu proyecto', 'Let’s talk about your project'],
        ['Cuéntame qué necesita tu negocio. Revisamos juntos las funciones, los plazos y el presupuesto antes de empezar.', 'Tell me what your business needs. We’ll review the features, timeline and budget together before getting started.'],
        ['Información de Contacto', 'Contact information'],
        ['Estoy disponible para proyectos web freelance y oportunidades como desarrollador junior. Si necesitas una página o un sistema para tu negocio, conversemos sobre lo que buscas.', 'I’m available for freelance web projects and junior developer opportunities. If you need a website or a system for your business, let’s talk about your needs.'],
        ['Ubicación', 'Location'], ['Pachacamac, Lima - Perú', 'Pachacamac, Lima — Peru'],
        ['Copiar correo electrónico', 'Copy email address'], ['Copiar correo', 'Copy email'], ['Envíame un mensaje', 'Send me a message'], ['Disponibilidad', 'Availability'],
        ['Sígueme en redes sociales', 'Find me on social media'], ['INICIEMOS UNA CONVERSACIÓN', 'LET’S START A CONVERSATION'], ['Cuéntame tu idea', 'Tell me your idea'],
        ['Seleccionar asunto del mensaje', 'Choose a message topic'], ['Desarrollo web', 'Web development'], ['Oportunidad laboral', 'Job opportunity'], ['Colaboración', 'Collaboration'],
        ['Proyecto de desarrollo web', 'Web development project'], ['Propuesta de colaboración', 'Collaboration proposal'],
        ['Nombre completo *', 'Full name *'], ['¿Cómo te llamas?', 'What’s your name?'], ['Correo electrónico *', 'Email address *'], ['tu@correo.com', 'you@example.com'],
        ['Asunto *', 'Subject *'], ['¿Qué tienes en mente?', 'What do you have in mind?'], ['Mensaje *', 'Message *'],
        ['Háblame de tu proyecto, tus objetivos o cómo podemos colaborar…', 'Tell me about your project, your goals or how we can collaborate…'], ['Enviar mensaje', 'Send message'],
        ['. Todos los derechos reservados.', '. All rights reserved.'], ['Hecho con intención', 'Made with intention'], ['y mucho código.', 'and lots of code.'],
        ['Volver al inicio', 'Back to top'], ['Personalizar apariencia', 'Customize appearance'], ['TU ESTILO', 'YOUR STYLE'], ['Color de acento', 'Accent color'],
        ['Neón blanco y negro', 'Black & white neon'], ['NEÓN B/N', 'B/W NEON'],
        ['PORTAFOLIO / SIGUIENTE CAPÍTULO', 'PORTFOLIO / NEXT CHAPTER'], ['DESLIZA PARA ENTRAR', 'SCROLL TO ENTER'], ['IDEAS QUE TOMAN FORMA', 'IDEAS TAKING SHAPE'],
        ['AYVAR JOSE / PORTAFOLIO', 'AYVAR JOSE / PORTFOLIO'],
        ['Pausar animaciones', 'Pause animations'], ['Activar animaciones', 'Enable animations'],
        ['Movimiento reducido por la configuración de tu dispositivo', 'Reduced motion is enabled on your device'],
        ['Abrir navegación rápida', 'Open quick navigation'], ['Navegación rápida · Ctrl K', 'Quick navigation · Ctrl K'], ['Instalar app', 'Install app'],
        ['¿A dónde vamos?', 'Where shall we go?'], ['Cerrar navegación rápida', 'Close quick navigation'],
        ['Buscar sección, proyecto o acción', 'Search sections, projects or actions'], ['Busca una sección, proyecto o acción…', 'Search a section, project or action…'],
        ['Acciones disponibles', 'Available actions'], ['navegar', 'navigate'], ['abrir', 'open'], ['cerrar', 'close'],
        ['DETRÁS DEL PROYECTO', 'BEHIND THE PROJECT'], ['Cerrar detalles del proyecto', 'Close project details'], ['Qué hay detrás', 'Behind the scenes'],
        ['Stack tecnológico', 'Technology stack'], ['Hablemos de este proyecto', 'Let’s talk about this project'], ['Perfil de GitHub', 'GitHub profile'],
        ['Concepto visual, no un producto publicado. Las funciones y tecnologías mostradas son una propuesta.', 'Visual concept, not a released product. The features and technologies shown are a proposal.'],
        ['Captura real del sitio. Abre la demo para explorar el proyecto en funcionamiento.', 'Actual website screenshot. Open the demo to explore the live project.'],
        ['Ver código en GitHub', 'View source on GitHub'],

        ['Se respeta la preferencia de movimiento reducido de tu dispositivo.', 'Your device’s reduced-motion preference is respected.'],
        ['Animaciones pausadas. Tú marcas el ritmo.', 'Animations paused. You set the pace.'], ['Animaciones activadas.', 'Animations enabled.'],
        ['{count} proyecto encontrado', '{count} project found'], ['{count} proyectos encontrados', '{count} projects found'],
        ['La lógica que conecta todo.', 'The logic that connects everything.'],
        ['El servidor recibe la solicitud, valida la información y coordina la respuesta mediante una API y las reglas de la aplicación.', 'The server receives the request, validates the input and coordinates the response through an API and the application’s rules.'],
        ['Información organizada, decisiones claras.', 'Organized data, clear decisions.'],
        ['La capa de datos almacena y consulta la información que necesita la aplicación, usando bases de datos relacionales o documentales.', 'The data layer stores and queries the information the application needs, using relational or document databases.'],
        ['RECORRIDO COMPLETADO', 'FLOW COMPLETE'], ['✓ Simulación completada: interfaz → servidor → datos → respuesta.', '✓ Simulation complete: interface → server → data → response.'],
        ['EXPLORANDO ARQUITECTURA', 'EXPLORING THE ARCHITECTURE'],
        ['❯ Capa seleccionada: {layer}. Inicia la simulación para recorrer el flujo completo.', '❯ Selected layer: {layer}. Start the simulation to follow the complete flow.'],
        ['Simulando…', 'Simulating…'], ['01 / SOLICITUD', '01 / REQUEST'], ['02 / PROCESAMIENTO', '02 / PROCESSING'], ['03 / CONSULTA', '03 / QUERY'],
        ['❯ Interfaz → el usuario solicita la lista de proyectos.', '❯ Interface → the user requests the project list.'],
        ['❯ Servidor → la API valida y prepara la consulta.', '❯ Server → the API validates the request and prepares the query.'],
        ['❯ Datos → la información vuelve al servidor y a la interfaz.', '❯ Data → the information returns to the server and interface.'],
        ['Chat con inteligencia artificial para explorar ideas y resolver dudas.', 'AI chat for exploring ideas and answering questions.'],
        ['Modos de conversación: general, creativo, código y aprendizaje.', 'Conversation modes: general, creative, coding and learning.'],
        ['Historial de conversaciones y aplicación instalable.', 'Conversation history and an installable app.'],
        ['Demo pública desplegada en Netlify y código disponible en GitHub.', 'Public demo deployed on Netlify and source code on GitHub.'],
        ['Carta interactiva de pollo a la brasa, parrillas y promociones.', 'Interactive menu with rotisserie chicken, grilled dishes and special offers.'],
        ['Carrito para armar pedidos y solicitarlos por WhatsApp.', 'A cart for building orders and sending them through WhatsApp.'],
        ['Asistente con inteligencia artificial y diseño adaptable a celulares y computadoras.', 'AI assistant and responsive design for mobile and desktop.'],
        ['Aplicación en React y TypeScript, publicada en Netlify con código disponible en GitHub.', 'Built with React and TypeScript, deployed on Netlify with source on GitHub.'],
        ['Punto de venta con carrito, validación de stock y registro de ventas.', 'Point of sale with a cart, stock validation and sales recording.'],
        ['Gestión de productos, categorías, inventario y clientes.', 'Product, category, inventory and customer management.'],
        ['Acceso por roles: administrador, cajero y almacén.', 'Role-based access: administrator, cashier and warehouse.'],
        ['Reportes de ventas y exportación CSV/PDF; tickets internos no válidos ante SUNAT.', 'Sales reports and CSV/PDF exports; internal receipts, not valid for SUNAT tax purposes.'],
        ['Demo pública desplegada en Vercel y código disponible en GitHub.', 'Public demo deployed on Vercel and source code on GitHub.'],
        ['Propuesta de registro de ejercicios y actividad física.', 'Proposed workout and physical activity logging.'], ['Diseño de un seguimiento de progreso personal.', 'Personal progress tracking design.'],
        ['Visualización conceptual de la actividad.', 'Conceptual activity visualization.'], ['Stack propuesto: React Native, Firebase, Redux y Chart.js.', 'Proposed stack: React Native, Firebase, Redux and Chart.js.'],
        ['Propuesta de gráficos y visualización de datos.', 'Proposed charts and data visualization.'], ['Métricas de ejemplo, sin conexión a datos reales.', 'Sample metrics, not connected to real data.'],
        ['Stack de interfaz propuesto: Vue.js y D3.js.', 'Proposed interface stack: Vue.js and D3.js.'], ['Stack de servidor propuesto: Express y PostgreSQL.', 'Proposed server stack: Express and PostgreSQL.'],
        ['Consulta sobre {project}', 'Question about {project}'], ['Correo copiado. ¡Hablemos de tu próxima idea!', 'Email copied. Let’s talk about your next idea!'],
        ['Puedes copiar mi correo: {email}', 'You can copy my email: {email}'],
        ['Stack y habilidades', 'Stack and skills'], ['Robot interactivo', 'Interactive robot'], ['SECCIÓN', 'SECTION'], ['EXPLORAR', 'EXPLORE'], ['PROYECTO', 'PROJECT'], ['ACCIÓN', 'ACTION'], ['APARIENCIA', 'APPEARANCE'],
        ['Laboratorio Full Stack interactivo', 'Interactive Full Stack lab'], ['Cambiar tema claro / oscuro', 'Toggle light / dark theme'],
        ['Pausar / activar animaciones', 'Pause / enable animations'], ['Cambiar idioma ES / EN', 'Switch language ES / EN'],
        ['{count} acciones disponibles', '{count} available actions'], ['No hay resultados. Prueba con «proyectos», «CV» o «contacto».', 'No results. Try “projects”, “CV” or “contact”.'],
        ['whoami      Sobre mí\nskills      Mi stack tecnológico\nlab         Laboratorio Full Stack\nprojects    Explorar proyectos\ncontact     Hablemos\ncv          Descargar mi CV\ntheme       Cambiar claro / oscuro\nclear       Limpiar la terminal\n\n↑ / ↓ para recuperar comandos anteriores.', 'whoami      About me\nskills      My technology stack\nlab         Full Stack lab\nprojects    Explore projects\ncontact     Let’s talk\ncv          Download my CV\ntheme       Toggle light / dark\nclear       Clear the terminal\n\n↑ / ↓ to recall previous commands.'],
        ['Ayvar Jose · Desarrollador Full Stack Junior\nTitulado en Computación e Informática.\nExperiencia en proyectos de sistemas, páginas web y aplicaciones móviles.\nDesarrollador freelance y docente de computación.\nPachacamac, Lima, Perú. Disponible para nuevos proyectos.', 'Ayvar Jose · Junior Full Stack developer\nTechnical degree in Computing and Informatics.\nExperience in systems, websites and mobile app projects.\nFreelance developer and computing teacher.\nPachacamac, Lima, Peru. Available for new projects.'],
        ['Abriendo el laboratorio. Explora las capas o simula una solicitud Full Stack.', 'Opening the lab. Explore the layers or simulate a Full Stack request.'],
        ['Abriendo mis proyectos. Filtra por categoría o busca tu tecnología favorita.', 'Opening my projects. Filter by category or search for your favorite technology.'],
        ['Conectemos: {email}\nTambién puedes usar el formulario de contacto.', 'Let’s connect: {email}\nYou can also use the contact form.'],
        ['Descarga solicitada: CV-Ayvar-Jose.pdf', 'Download requested: CV-Ayvar-Jose.pdf'], ['Tema oscuro activado.', 'Dark theme enabled.'], ['Tema claro activado.', 'Light theme enabled.'],
        ['Comando no encontrado: {command}\nEscribe help para explorar los comandos disponibles.', 'Command not found: {command}\nType help to explore the available commands.'],
        ['Completa este campo para continuar.', 'Please fill in this field to continue.'], ['Escribe un correo electrónico válido.', 'Please enter a valid email address.'],
        ['Cuéntame un poco más: al menos 10 caracteres.', 'Tell me a little more: at least 10 characters.'], ['Usa un máximo de {count} caracteres.', 'Use no more than {count} characters.'],
        ['Enviando mensaje…', 'Sending message…'], ['Conectando con el servicio de mensajes…', 'Connecting to the messaging service…'],
        ['¡Gracias, {name}! Tu mensaje se envió correctamente. Te responderé al correo que indicaste.', 'Thanks, {name}! Your message was sent successfully. I’ll reply to the email address you provided.'],
        ['¿Urgente? Escríbeme por WhatsApp', 'Urgent? Message me on WhatsApp'],
        ['Hola Jose, soy {name}. Te acabo de escribir desde tu portafolio: {subject}.', 'Hi Jose, I’m {name}. I just sent you a message through your portfolio: {subject}.'],
        ['La conexión tardó demasiado y no se pudo confirmar el envío. Tu texto sigue aquí. Puedes intentarlo de nuevo o escribirme a {email}.', 'The connection timed out and delivery could not be confirmed. Your text is still here. Try again or email me at {email}.'],
        ['No se pudo enviar el mensaje. Tu texto sigue aquí para que puedas intentarlo de nuevo. También puedes escribirme a {email}.', 'Your message could not be sent. Your text is still here so you can try again. You can also email me at {email}.'],
        ['Enviar con mi app de correo', 'Send with my email app'],
        ['jose@portfolio\n──────────────\nRol:       Desarrollador Full Stack Junior\nFormación: Titulado en Computación e Informática\nStack:     JavaScript · PHP · React · Node.js\nDatos:     MySQL · PostgreSQL · MongoDB\nNube:      AWS EC2 · RDS · S3\nDocente:   Informática, Robótica y Programación\nUbicación: Lima, Perú\nEstado:    ● disponible', 'jose@portfolio\n──────────────\nRole:      Junior Full Stack developer\nEducation: Technical degree in Computing and Informatics\nStack:     JavaScript · PHP · React · Node.js\nData:      MySQL · PostgreSQL · MongoDB\nCloud:     AWS EC2 · RDS · S3\nTeaching:  Computing, Robotics and Programming\nLocation:  Lima, Peru\nStatus:    ● available'],
        ['Buena decisión. Te llevo al formulario de contacto.\nTambién puedes escribirme a joseayvar28@gmail.com', 'Great choice. Let me take you to the contact form.\nYou can also email me at joseayvar28@gmail.com'],
        ['GITHUB EN VIVO', 'LIVE GITHUB'], ['Repositorio público', 'Public repository'],
        ['Página web de Pollería El Toñito con carta interactiva, promociones, carrito para solicitar pedidos por WhatsApp y asistente con inteligencia artificial. Desarrollada con React y diseñada para celulares y computadoras.', 'El Toñito restaurant website with an interactive menu, special offers, WhatsApp ordering and an AI assistant. Built with React for mobile and desktop.'],
        ['En iPhone: toca Compartir y luego "Añadir a pantalla de inicio".', 'On iPhone: tap Share, then “Add to Home Screen”.'],
        ['Abre el menú del navegador y elige "Instalar app" o "Añadir a pantalla de inicio".', 'Open your browser menu and choose “Install app” or “Add to Home Screen”.'],

        ['Abrir chat con Ayvarcitoo', 'Open chat with Ayvarcitoo'], ['¡Hola! Soy Ayvarcitoo 👋 ¿Tienes dudas?', 'Hi! I’m Ayvarcitoo 👋 Any questions?'],
        ['Chat con Ayvarcitoo', 'Chat with Ayvarcitoo'], ['En línea', 'Online'], ['En línea · IA activa', 'Online · AI enabled'], ['Cerrar chat', 'Close chat'],
        ['Escribe tu pregunta', 'Type your question'], ['Pregúntame sobre Jose y su trabajo…', 'Ask about Jose and his work…'], ['Enviar', 'Send'],
        ['Correo', 'Email'], ['Ver stack', 'View stack'], ['Ver robot interactivo', 'View interactive robot'], ['Ver proyectos', 'View projects'], ['Formulario', 'Contact form'],
        ['¿Qué tecnologías usa?', 'What technologies does he use?'], ['¿Está disponible?', 'Is he available?'], ['Llévame a proyectos', 'Take me to projects'], ['¿Puedo instalar la app?', 'Can I install the app?'],
        ['¡Hola! Soy <strong>Ayvarcitoo</strong> 👋, el asistente del portafolio de Jose. Pregúntame sobre su perfil, proyectos y tecnologías, o cómo sus habilidades podrían relacionarse con una oportunidad o idea. También puedo guiarte por la página.', 'Hi! I’m <strong>Ayvarcitoo</strong> 👋, the assistant for Jose’s portfolio. Ask about his profile, projects and technologies, or how his skills might relate to an opportunity or idea. I can also guide you around the site.'],
        ['¡Hola! 👋 Soy <strong>Ayvarcitoo</strong>. Pregúntame sobre el perfil de Jose, sus proyectos y tecnologías, o cómo se relacionan con una idea de trabajo.', 'Hi! 👋 I’m <strong>Ayvarcitoo</strong>. Ask me about Jose’s profile, projects and technologies, or how they relate to a work idea.'],
        ['Soy <strong>Ayvarcitoo</strong>, el asistente del portafolio de Jose. Puedo conversar sobre su perfil profesional, proyectos, tecnologías y explicar temas relacionados con su trabajo.', 'I’m <strong>Ayvarcitoo</strong>, Jose’s portfolio assistant. I can talk about his professional profile, projects and technologies, and explain topics related to his work.'],
        ['<strong>Ayvar Jose</strong> es desarrollador <strong>Full Stack Junior</strong> en Lima, Perú. Es titulado en Computación e Informática y cuenta con experiencia en proyectos de sistemas, páginas web y aplicaciones móviles. También combina el desarrollo freelance con la docencia en tecnología.', '<strong>Ayvar Jose</strong> is a <strong>Junior Full Stack developer</strong> in Lima, Peru. He holds a technical degree in Computing and Informatics and has experience in systems, websites and mobile app projects. He also combines freelance development with teaching technology.'],
        ['Trabaja como <strong>desarrollador web freelance desde enero de 2026</strong>. Colaboró como apoyo técnico en un sistema de ventas para Negociaciones Cedro con Java, Jaspersoft y JPOS. También tiene experiencia docente en computación, programación y robótica. Puedes revisar su experiencia completa en el CV.', 'He has worked as a <strong>freelance web developer since January 2026</strong>. He provided technical support on a sales system for Negociaciones Cedro using Java, Jaspersoft and JPOS. He also has teaching experience in computing, programming and robotics. See his CV for his full experience.'],
        ['Puede ayudarte con <strong>sitios web para presentar tu negocio</strong>, formularios, conexión con APIs y sistemas para registrar y consultar información. Lo mejor es contarle tu necesidad para revisar el alcance, los plazos y el presupuesto, sin prometer funciones antes de evaluar el proyecto.', 'He can help with <strong>websites to showcase your business</strong>, forms, API integration and systems to record and query information. Tell him what you need so you can review scope, timelines and budget, without promising features before evaluating the project.'],
        ['Su base es <strong>JavaScript, HTML5 y CSS3</strong>, con <strong>PHP, Node.js y Java (Spring Boot)</strong> en el backend. Usa <strong>React, Angular, Bootstrap y Tailwind</strong>; bases de datos <strong>MySQL, PostgreSQL, MongoDB y Firebase</strong>; y trabaja con <strong>AWS, Git/GitHub, Docker</strong> y CI/CD inicial.', 'His foundation is <strong>JavaScript, HTML5 and CSS3</strong>, with <strong>PHP, Node.js and Java (Spring Boot)</strong> on the backend. He uses <strong>React, Angular, Bootstrap and Tailwind</strong>; <strong>MySQL, PostgreSQL, MongoDB and Firebase</strong> databases; and <strong>AWS, Git/GitHub, Docker</strong> with foundational CI/CD.'],
        ['Enseña computación en primaria, secundaria y academia: ofimática, diseño gráfico y 3D, <strong>Roblox Studio (Luau)</strong>, algoritmos y desarrollo web. También dictó un taller de <strong>robótica con Arduino</strong>. En esta página puedes interactuar con un robot 3D de partículas.', 'He teaches computing at primary, secondary and academy levels: office tools, graphic and 3D design, <strong>Roblox Studio (Luau)</strong>, algorithms and web development. He also taught an <strong>Arduino robotics</strong> workshop. This page features an interactive 3D particle robot.'],
        ['Es <strong>titulado en Computación e Informática</strong> por el IESTP Trentino Juan Pablo II. Su perfil combina desarrollo de software y docencia en tecnología.', 'He holds a <strong>technical degree in Computing and Informatics</strong> from IESTP Trentino Juan Pablo II. His profile combines software development and teaching technology.'],
        ['Puedes probar <strong>Ayvar AI</strong>, su asistente de inteligencia artificial; <strong>El Toñito</strong>, una web para pollería con carta interactiva, pedidos por WhatsApp y asistente con IA; y <strong>Ayvar POS</strong>, un sistema de ventas e inventario con React, Node.js y Firebase. Los tres tienen vista previa, demo pública y código en GitHub. En la información de Ayvar POS están los accesos de administrador, cajero y almacén, exclusivos para la demo pública. Fitness y dashboard siguen siendo conceptos visuales.', 'Try <strong>Ayvar AI</strong>, his AI assistant; <strong>El Toñito</strong>, a restaurant website with an interactive menu, WhatsApp ordering and an AI assistant; and <strong>Ayvar POS</strong>, a sales and inventory system built with React, Node.js and Firebase. All three have previews, public demos and GitHub source. Ayvar POS project details include administrator, cashier and warehouse accounts for the public demo only. Fitness and dashboard remain visual concepts.'],
        ['Puedes escribirle usando el botón de <strong>WhatsApp</strong>, el formulario de contacto o su correo <strong>joseayvar28@gmail.com</strong>.', 'Reach him using the <strong>WhatsApp</strong> button, the contact form or email at <strong>joseayvar28@gmail.com</strong>.'],
        ['Sí, Jose está <strong>disponible para nuevos proyectos</strong> web y sistemas a medida. El presupuesto depende de lo que necesites, así que lo mejor es contarle tu idea por WhatsApp.', 'Yes, Jose is <strong>available for new projects</strong>, including websites and custom systems. Pricing depends on your needs, so tell him about your idea on WhatsApp.'],
        ['Aquí tienes su CV en PDF 📄', 'Here’s his CV in PDF format 📄'],
        ['Jose vive en <strong>Lima, Perú</strong> (Pachacámac). Para coordinar la modalidad de trabajo, escríbele directamente.', 'Jose lives in <strong>Lima, Peru</strong> (Pachacámac). Contact him directly to discuss working arrangements.'],
        ['Su CV indica <strong>inglés nivel básico</strong>. Español es su idioma principal.', 'His CV lists <strong>basic English</strong>. Spanish is his primary language.'],
        ['Encuentras a Jose en GitHub y LinkedIn:', 'Find Jose on GitHub and LinkedIn:'],
        ['En la sección <strong>Robot interactivo</strong>, un modelo 3D se forma con partículas, gira con el desplazamiento y se desintegra al acercar el cursor para volver a integrarse cuando lo alejas.', 'In the <strong>Interactive robot</strong> section, a 3D model is made of particles, rotates as you scroll and disintegrates when the pointer gets close, then reassembles when you move away.'],
        ['Este portafolio está hecho con <strong>HTML, CSS y JavaScript puros</strong>, sin frameworks: experiencias animadas, un robot 3D interactivo de partículas y un asistente virtual. Se publica en Netlify.', 'This portfolio uses <strong>vanilla HTML, CSS and JavaScript</strong>, without frameworks: animated experiences, an interactive 3D particle robot and a virtual assistant. It’s hosted on Netlify.'],
        ['Jose nació el <strong>28 de abril de 2005</strong> y tiene <strong>{age} años</strong>. Joven, pero con bastante código a cuestas 😄', 'Jose was born on <strong>April 28, 2005</strong> and is <strong>{age} years old</strong>. Young, but with plenty of code behind him 😄'],
        ['Prefiero mantener la conversación en el perfil profesional de Jose 😊. Puedo contarte sobre sus proyectos, experiencia y tecnologías.', 'I’ll keep the conversation focused on Jose’s professional profile 😊. I can tell you about his projects, experience and technologies.'],
        ['Eso es parte de su misterio 😄. Lo que sí se nota es que lo suyo es <strong>programar y enseñar tecnología</strong>. Si quieres conocerlo mejor, escríbele.', 'That’s part of his mystery 😄. What’s clear is his passion for <strong>coding and teaching technology</strong>. Message him to get to know him better.'],
        ['Este portafolio se puede <strong>instalar como app</strong> y abrir incluso sin conexión. En Android o PC pulsa el botón; en iPhone usa <em>Compartir</em> y luego <em>Añadir a pantalla de inicio</em>.', 'You can <strong>install this portfolio as an app</strong> and open it offline. On Android or desktop, use the button; on iPhone, tap <em>Share</em>, then <em>Add to Home Screen</em>.'],
        ['¡Con gusto! 😊 Si quieres, pregúntame algo más o escríbele a Jose.', 'You’re welcome! 😊 Ask me anything else or message Jose.'],
        ['¡Hasta pronto! 👋 Cuando quieras volver, aquí estaré.', 'See you soon! 👋 I’ll be here whenever you come back.'],
        ['¿Por qué los programadores confunden Halloween con Navidad? Porque <code>Oct 31 == Dec 25</code> 🎃🎄', 'Why do programmers confuse Halloween with Christmas? Because <code>Oct 31 == Dec 25</code> 🎃🎄'],
        ['Puedo conversar sobre el <strong>perfil y los proyectos</strong> de Jose, explicar tecnologías que usa, relacionar sus habilidades con una necesidad laboral, ayudarte a explorar la página o preparar preguntas profesionales. Pregúntame con tus propias palabras.', 'I can discuss Jose’s <strong>profile and projects</strong>, explain technologies he uses, relate his skills to a work need, help you explore the site or prepare professional questions. Ask me in your own words.'],
        ['No tengo suficiente información para responder eso con seguridad. Puedo ayudarte con el perfil profesional, los proyectos o las tecnologías de Jose; si quieres, cuéntame cómo se relaciona tu pregunta con alguno de esos temas.', 'I don’t have enough information to answer that confidently. I can help with Jose’s professional profile, projects or technologies; tell me how your question relates to one of those topics.'],
        ['Tu navegador no muestra el botón de instalación. Abre el menú del navegador y busca <strong>Instalar app</strong> o <strong>Añadir a pantalla de inicio</strong>.', 'Your browser isn’t showing the install button. Open its menu and look for <strong>Install app</strong> or <strong>Add to Home Screen</strong>.'],
        ['Te llevo a <strong>{section}</strong> 🚀', 'Taking you to <strong>{section}</strong> 🚀'],
        ['Listo, activé el modo <strong>{theme}</strong> ✨', 'Done, I enabled <strong>{theme}</strong> mode ✨'], ['claro', 'light'], ['oscuro', 'dark'],
        ['<strong>HTML</strong> da estructura a una página: define títulos, párrafos, imágenes y botones con etiquetas como <code>&lt;h1&gt;</code> o <code>&lt;p&gt;</code>. Es parte de la base con la que Jose crea experiencias web.', '<strong>HTML</strong> structures a page: headings, paragraphs, images and buttons use tags like <code>&lt;h1&gt;</code> or <code>&lt;p&gt;</code>. It is part of the foundation Jose uses to build web experiences.'],
        ['<strong>CSS</strong> define la presentación: colores, tamaños, espacios y animaciones. Se usa junto con HTML y JavaScript en los proyectos web de Jose para construir interfaces claras y adaptables.', '<strong>CSS</strong> defines presentation: colors, sizes, spacing and animations. Jose uses it with HTML and JavaScript in his web projects to build clear, adaptable interfaces.'],
        ['<strong>JavaScript</strong> añade comportamiento a una web: responde a clics, valida formularios y actualiza la interfaz. Es una de las tecnologías principales del stack de Jose y aparece en sus proyectos Full Stack.', '<strong>JavaScript</strong> adds behavior to a website: it handles clicks, validates forms and updates the interface. It is one of the main technologies in Jose’s stack and appears in his Full Stack projects.'],
        ['Una <strong>API</strong> permite que dos programas intercambien solicitudes y respuestas, a menudo en JSON. Entender APIs ayuda a comprender cómo se conectan interfaces y servicios en el desarrollo Full Stack que realiza Jose.', 'An <strong>API</strong> lets two programs exchange requests and responses, often in JSON. Understanding APIs helps explain how interfaces and services connect in the Full Stack development Jose does.'],
        ['Una <strong>base de datos</strong> organiza información, y <strong>SQL</strong> permite consultarla o modificarla. Jose incluye MySQL y PostgreSQL entre sus tecnologías; por ejemplo, una consulta podría ser <code>SELECT * FROM clientes;</code>.', 'A <strong>database</strong> organizes information, and <strong>SQL</strong> lets you query or change it. Jose lists MySQL and PostgreSQL among his technologies; for example, a query could be <code>SELECT * FROM clientes;</code>.'],
        ['<strong>Git</strong> registra cambios del código para revisar versiones y colaborar; <strong>GitHub</strong> aloja repositorios. Puedes explorar en GitHub el código de proyectos publicados de Jose, como Ayvar AI y El Toñito.', '<strong>Git</strong> tracks code changes to review versions and collaborate; <strong>GitHub</strong> hosts repositories. You can explore the code for Jose’s published projects, such as Ayvar AI and El Toñito, on GitHub.'],
        ['El <strong>frontend</strong> es la interfaz con la que interactúa el usuario; el <strong>backend</strong> maneja lógica y servicios. El perfil <strong>Full Stack</strong> de Jose abarca ambos lados del desarrollo.', 'The <strong>frontend</strong> is the user-facing interface; the <strong>backend</strong> handles logic and services. Jose’s <strong>Full Stack</strong> profile spans both sides of development.'],
        ['Un diseño <strong>responsive</strong> adapta la interfaz a móviles y computadoras con técnicas como Grid, Flexbox y media queries. Jose presenta sus proyectos para celular y escritorio.', 'A <strong>responsive</strong> design adapts an interface to phones and computers with techniques such as Grid, Flexbox and media queries. Jose presents his projects for mobile and desktop.'],
        ['Una <strong>variable</strong> guarda un valor que el programa puede consultar o cambiar, por ejemplo <code>let edad = 20;</code>. Es un concepto básico de JavaScript, una tecnología central del stack de Jose.', 'A <strong>variable</strong> stores a value that a program can read or change, for example <code>let edad = 20;</code>. It is a JavaScript basic, and JavaScript is central to Jose’s stack.'],
        ['Una <strong>función</strong> agrupa instrucciones reutilizables, por ejemplo <code>function saludar() { console.log("Hola"); }</code>. Es uno de los fundamentos de JavaScript y del trabajo web de Jose.', 'A <strong>function</strong> groups reusable instructions, for example <code>function saludar() { console.log("Hola"); }</code>. It is one of the foundations of JavaScript and Jose’s web work.']
    ];

    const normalize = value => String(value).trim().replace(/\s+/g, ' ');
    const english = new Map(entries.map(([es, en]) => [normalize(es), en]));
    const spanish = new Map(entries.map(([es, en]) => [normalize(en), es]));
    const sourceOf = value => spanish.get(normalize(value)) || String(value);
    function t(value, params = {}, language = root.lang) {
        const source = sourceOf(value);
        let result = language === 'en' ? english.get(normalize(source)) || source : source;
        if (language === 'en' && /^(\d+) años$/.test(normalize(source))) result = normalize(source).replace(/^(\d+) años$/, '$1 years old');
        return result.replace(/\{(\w+)\}/g, (match, key) => Object.hasOwn(params, key) ? String(params[key]) : match);
    }

    // Guardo el original para cambiar ES/EN sin perder lo que escribió el visitante xd.
    const textSources = new WeakMap();
    const attributeSources = new WeakMap();
    const bindings = new Map();
    const attributes = ['aria-label', 'title', 'placeholder', 'alt'];
    const ignored = 'script, style, textarea, code, [data-i18n-ignore], [data-i18n-managed], .ayv-msg.user';
    const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function renderBinding(element, binding) {
        const params = binding.html ? Object.fromEntries(Object.entries(binding.params).map(([key, value]) => [key, escape(value)])) : binding.params;
        const value = typeof binding.source === 'function' ? binding.source() : t(binding.source, params);
        const property = binding.html ? 'innerHTML' : 'textContent';
        if (element[property] !== value) element[property] = value;
    }
    function bind(element, source, params = {}, html = false) {
        if (!element) return;
        const binding = { source, params, html };
        bindings.set(element, binding);
        element.setAttribute('data-i18n-managed', '');
        renderBinding(element, binding);
    }
    function translateText(node) {
        if (!node.parentElement || node.parentElement.closest(ignored) || !node.nodeValue.trim()) return;
        const previous = textSources.get(node);
        const source = previous?.output === node.nodeValue ? previous.source : sourceOf(node.nodeValue);
        const translated = t(source);
        const output = translated === source ? source : `${source.match(/^\s*/)[0]}${translated}${source.match(/\s*$/)[0]}`;
        textSources.set(node, { source, output });
        if (node.nodeValue !== output) node.nodeValue = output;
    }
    function translateAttributes(element) {
        if (element.closest('[data-i18n-ignore]')) return;
        if (element.matches('a[href^="https://wa.me/"]')) {
            const url = new URL(element.href);
            const message = url.searchParams.get('text');
            if (message && t(message) !== message) { url.searchParams.set('text', t(message)); element.href = url.href; }
        }
        let saved = attributeSources.get(element);
        if (!saved) { saved = new Map(); attributeSources.set(element, saved); }
        const names = [...attributes];
        if (element.matches('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[property="og:image:alt"], meta[name="twitter:title"], meta[name="twitter:description"], meta[name="twitter:image:alt"]')) names.push('content');
        names.forEach(name => {
            if (!element.hasAttribute(name)) return;
            const current = element.getAttribute(name), previous = saved.get(name);
            const source = previous?.output === current ? previous.source : sourceOf(current);
            const output = t(source);
            saved.set(name, { source, output });
            if (current !== output) element.setAttribute(name, output);
        });
    }
    function translate(scope) {
        if (scope.nodeType === Node.TEXT_NODE) { translateText(scope); return; }
        if (![Node.DOCUMENT_NODE, Node.ELEMENT_NODE].includes(scope.nodeType)) return;
        if (scope.nodeType === Node.ELEMENT_NODE) translateAttributes(scope);
        scope.querySelectorAll('*').forEach(translateAttributes);
        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) translateText(walker.currentNode);
    }
    const pending = new Set();
    let scheduled = false;
    const observer = new MutationObserver(records => {
        records.forEach(record => {
            if (record.type === 'childList') record.addedNodes.forEach(node => pending.add(node));
            else pending.add(record.target);
        });
        if (!scheduled && pending.size) {
            scheduled = true;
            queueMicrotask(() => {
                scheduled = false;
                observer.disconnect();
                pending.forEach(node => { if (node.isConnected) translate(node); });
                pending.clear();
                observe();
            });
        }
    });
    function observe() { observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes }); }
    function refresh() {
        observer.disconnect();
        bindings.forEach((binding, element) => {
            if (element.isConnected) renderBinding(element, binding);
            else bindings.delete(element);
        });
        translate(document);
        document.querySelector('meta[property="og:locale"]').content = root.lang === 'en' ? 'en_US' : 'es_PE';
        document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === root.lang)));
        document.querySelectorAll('[data-language-toggle]').forEach(button => {
            button.querySelector('[data-language-code]').textContent = root.lang.toUpperCase();
            const label = t(root.lang === 'es' ? 'Cambiar a inglés' : 'Cambiar a español');
            button.setAttribute('aria-label', label); button.title = label; button.lang = root.lang;
        });
        observe();
    }
    function setLanguage(language) {
        if (!['es', 'en'].includes(language)) return;
        root.lang = language;
        try { localStorage.setItem('portfolio.language', language); } catch {}
        refresh();
        document.dispatchEvent(new CustomEvent('portfolio:language', { detail: { language } }));
        document.getElementById('languageStatus').textContent = language === 'en' ? 'Language changed to English.' : 'Idioma cambiado a español.';
    }
    window.portfolioI18n = {
        t, sourceOf, setLanguage, refresh,
        clear(element) { bindings.delete(element); element.removeAttribute('data-i18n-managed'); element.textContent = ''; },
        text: (element, source, params) => bind(element, source, params),
        html: (element, source, params) => bind(element, source, params, true)
    };
    document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
    document.querySelectorAll('[data-language-toggle]').forEach(button => button.addEventListener('click', () => setLanguage(root.lang === 'es' ? 'en' : 'es')));
    refresh();
})();
