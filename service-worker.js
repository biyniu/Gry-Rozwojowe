
const CACHE_NAME = 'startkids-v4';
const URLS_TO_CACHE = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We use {cache: 'reload'} to ensure we get fresh files during install
      return cache.addAll(URLS_TO_CACHE.map(url => new Request(url, {cache: 'reload'})));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients immediately
});

self.addEventListener('fetch', (event) => {
  // 1. Navigation Requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fails (offline or 404), return cached index.html
          return caches.match('./index.html').then(response => {
             if (response) return response;
             // Absolute fallback if cache is empty
             return new Response('Błąd: Brak połączenia. Odśwież stronę gdy będziesz online.', {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
             });
          });
        })
    );
    return;
  }

  // 2. Asset Requests (Images, Scripts, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached if present
      if (cachedResponse) {
        return cachedResponse;
      }
      // Otherwise fetch from network
      return fetch(event.request);
    })
  );
});
