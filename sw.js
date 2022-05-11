const cacheName = 'OSA-SW';
const cacheFiles = [
  '/',
  '/index.html',
  '/sw.js',
  '/manifest.json',
  '/favicon.ico',
  '/icons/osa-32.png',
  '/icons/osa-64.png',
  '/icons/osa-96.png',
  '/icons/osa-128.png',
  '/icons/osa-192.png',
  '/icons/osa-256.png'
];

self.addEventListener("install", (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(cacheFiles);
  })());
});

self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) return r;
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());
});

self.addEventListener("activate", event => {
  console.log("Service Worker activating.");
});

self.addEventListener('message', event => {
	if (event.data.type !== 'notification') return;
	console.log('Something going on');
});

setInterval(() => { self.registration.showNotification('test', {body: String.concat('date: ', new Date())})}, 10000);