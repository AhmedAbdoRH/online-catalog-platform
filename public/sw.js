// Service worker for per-merchant catalog app.
// IMPORTANT: This SW must only handle requests for the CURRENT merchant's
// slug. Requests for other merchants are passed straight to the network so
// that an installed PWA for /store-a never serves cached content for /store-b.

const CACHE_NAME = 'online-menu-cache-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
];

// The active merchant slug, set from the page via postMessage.
let currentSlug = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_SLUG') {
    currentSlug = event.data.slug || null;
    console.log('[SW] active slug set to:', currentSlug);
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Returns true if the request belongs to the current merchant's scope.
function isInCurrentScope(url) {
  if (url.origin !== self.location.origin) return false;
  const pathSlug = url.pathname.split('/')[1] || '';
  // No slug (e.g. "/", "/dashboard", "/login") → treat as platform-level, safe to cache.
  if (!pathSlug) return true;
  // If we know the current slug, only handle matching slug.
  if (currentSlug) {
    return pathSlug === currentSlug;
  }
  // Fallback: if slug unknown, allow same-origin GETs (caching still works).
  return true;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Cross-merchant or out-of-scope request → do NOT intercept, let the
  // browser fetch normally so the correct merchant's page is loaded.
  if (!isInCurrentScope(url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      const fetchRequest = event.request.clone();
      return fetch(fetchRequest).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
          return response;
        });
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
