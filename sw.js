// Intento la red primero y uso la caché si no hay conexión xd.
const CACHE = 'ayvar-v28';
const CORE = ['/', 'index.html', 'css/style.css?v=28', 'css/enhancements.css?v=23', 'css/extras.css?v=23', 'css/ayvarcitoo.css?v=23', 'css/scroll-scenes.css?v=23', 'css/replica.css?v=25', 'css/scroll-narratives.css?v=23', 'js/preferences.js?v=23', 'js/i18n.js?v=28', 'js/presentation-intro.js?v=23', 'js/replica-experience.js?v=25', 'js/scroll-narratives.js?v=24', 'js/about-robot.js?v=23', 'js/portrait-robot.js?v=23', 'js/vendor/three/three.min.js', 'img/models/robot/particle-bust.bin', 'js/chapter-transitions.js?v=23', 'js/scroll-scenes.js?v=23', 'js/script.js?v=28', 'js/enhancements.js?v=28', 'js/extras.js?v=23', 'js/ayvarcitoo.js?v=28', 'img/yo.jpg', 'img/light-bulb.jpg', 'img/presentation-typing.mp4', 'img/favicon.ico?v=3', 'img/icon-192.png?v=2'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
    const req = e.request;
    // Los POST del formulario nunca se guardan en caché xd.
    if (req.method !== 'GET' || !req.url.startsWith('http')) return;
    e.respondWith(
        fetch(req).then(res => {
            if (res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
                const copy = res.clone();
                caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
            }
            return res;
        }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('/') : Response.error())))
    );
});
