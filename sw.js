const CACHE_NAME = 'lift-lab-cache-v1.0.31';
const CORE_ASSETS = ['./', './index.html'];
const OPTIONAL_ASSETS = [
  'https://telegram.org/js/telegram-web-app.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/vanilla-calendar-pro/build/vanilla-calendar.min.css',
  'https://cdn.jsdelivr.net/npm/vanilla-calendar-pro/build/vanilla-calendar.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    await Promise.allSettled(OPTIONAL_ASSETS.map(url => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('lift-lab-cache-') && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put('./index.html', response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }
  if (url.origin === self.location.origin || OPTIONAL_ASSETS.some(asset => request.url.startsWith(asset))) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try { return await fetch(request); } catch (_) { return Response.error(); }
    })());
  }
});
