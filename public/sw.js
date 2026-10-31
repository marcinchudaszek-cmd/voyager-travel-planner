const CACHE_NAME = 'voyager-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;
  if (request.url.includes('api.anthropic.com')) return;
  if (request.url.includes('api.groq.com')) return;
  if (request.url.includes('api.open-meteo.com')) return;
  if (request.url.includes('nominatim.openstreetmap.org')) return;
  if (request.url.includes('api.frankfurter.dev')) return;
  if (request.url.includes('api.opentripmap.com')) return;
  if (request.url.includes('wikipedia.org')) return;

  // Strona (HTML) zawsze prosto z serwera — GitHub Pages daje max-age=600, więc zwykły
  // fetch potrafił przez 10 minut po wdrożeniu oddawać starą wersję aplikacji.
  // Pliki JS/CSS mają hash w nazwie, więc ich pamięć podręczna niczego nie psuje.
  const fresh = request.mode === 'navigate'
    ? fetch(request.url, { cache: 'no-store', credentials: 'same-origin' })
    : fetch(request);

  event.respondWith(
    fresh.then(response => {
      if (response.ok && request.url.startsWith('http')) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          try { cache.put(request, clone); } catch(e) {}
        });
      }
      return response;
    }).catch(() => {
      return caches.match(request).then(cached => {
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
