const CACHE_NAME = 'lift-lab-cache-v1.0.39';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.skipWaiting());
self.addEventListener('fetch', e => e.respondWith(fetch(e.request).catch(() => caches.match(e.request))));
