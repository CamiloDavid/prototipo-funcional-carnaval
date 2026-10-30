// Guarda la app en el celular para usarla sin conexión (HU-08).
// Los datos de la edición se buscan primero en la red, para tener la versión más reciente (HU-09).
const CACHE = 'cnb-v2';
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
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.endsWith('/data/edicion-2026.json')) {
    // Red primero; sin señal, lo guardado
    e.respondWith(fetch(e.request).then((r) => {
      const copia = r.clone();
      caches.open(CACHE).then((c) => c.put('data/edicion-2026.json', copia));
      return r;
    }).catch(() => caches.match('data/edicion-2026.json')));
    return;
  }

  // Lo guardado primero, y se renueva en segundo plano
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((guardado) => {
    const red = fetch(e.request).then((r) => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
      return r;
    }).catch(() => guardado);
    return guardado || red;
  }));
});
