
const CACHE_NAME = 'startkids-v5';
// Only cache the absolute essentials initially.
// Other files will be cached dynamically as the user uses the app.
const INITIAL_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(INITIAL_CACHE);
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
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NAVIGATION REQUESTS (HTML)
  // Strategy: Network First -> Fallback to Cache -> Fallback to Root
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If network works and gives us a page, return it
          if (response.status === 200) {
            return response;
          }
          // If server returns 404 on navigation, try cache
          return caches.match('./index.html');
        })
        .catch(() => {
          // If offline, try cache
          return caches.match('./index.html')
            .then(cachedRes => {
               if (cachedRes) return cachedRes;
               // Last resort: try matching the root if index.html specific path failed
               return caches.match('./');
            });
        })
    );
    return;
  }

  // 2. ASSET REQUESTS (JS, TSX, CSS, IMAGES)
  // Strategy: Stale-While-Revalidate (Dynamic Caching)
  // Try to serve from cache, but also fetch from network to update cache for next time.
  // If not in cache, fetch from network and save it.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If we have it in cache, return it immediately (fast!)
      if (cachedResponse) {
        // OPTIONAL: Update cache in background for next time (Stale-While-Revalidate)
        // This keeps the app up to date without slowing down the user.
        fetch(event.request).then(networkResponse => {
            if(networkResponse && networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
            }
        }).catch(() => {}); // Ignore background fetch errors

        return cachedResponse;
      }

      // If not in cache, fetch it from network
      return fetch(event.request).then((networkResponse) => {
        // Check if valid response
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // IMPORTANT: Cache this new file for future use!
        // This ensures .tsx files, external libs, and images get saved.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
