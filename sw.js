// Guarda la app en el celular para usarla sin conexión (HU-08).
// Siempre se busca primero la versión publicada, para que el celular no se quede con una anterior (HU-09).
const CACHE = 'cnb-v6';
const ARCHIVOS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/tokens.css', 'css/base.css', 'css/components.css',
  'js/app.js', 'js/icons.js', 'js/mapa.js',
  'data/edicion-2026.json', 'data/mapa-pasto.json',
  'assets/icono-192.png', 'assets/icono-512.png',
  'assets/fonts/inter-latin-400-normal.woff2', 'assets/fonts/inter-latin-500-normal.woff2',
  'assets/fonts/inter-latin-600-normal.woff2', 'assets/fonts/inter-latin-700-normal.woff2',
  'assets/fonts/inter-latin-800-normal.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(ARCHIVOS.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Red primero (con límite de 5 s, por la señal débil en los desfiles); sin señal, lo guardado
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const guardado = () => caches.match(e.request, { ignoreSearch: true })
    .then((r) => r || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()));
  const red = fetch(e.request, { cache: 'no-cache' }).then((r) => {
    if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
    return r;
  });
  const limite = new Promise((ok) => setTimeout(ok, 5000)).then(() => caches.match(e.request, { ignoreSearch: true }));
  e.respondWith(Promise.race([red, limite]).then((r) => r || red).catch(guardado));
});
