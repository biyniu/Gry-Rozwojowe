
const CACHE_NAME = 'startkids-v3';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install: Cache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activate: Clean old caches
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
  self.clients.claim();
});

// Fetch: Handle requests
self.addEventListener('fetch', (event) => {
  // Navigation strategy (HTML): Network first, then Cache (fallback to index.html)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('./index.html')
            .then((response) => {
              // If index.html is found in cache, return it
              if (response) return response;
              // If not, try matching the root '/' (common in some setups)
              return caches.match('./');
            });
        })
    );
    return;
  }

  // Asset strategy: Cache first, then Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
