// FileNova Service Worker - Offline Support, Caching & WASM Models Pre-fetching
const CACHE_NAME = 'filenova-v2';
const WASM_CACHE_NAME = 'filenova-wasm-models-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== WASM_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache-first for models and WASM runtimes, network-first for rest
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Intercept WASM modules and OCR dictionaries (Cache-First)
  if (
    url.endsWith('.wasm') || 
    url.endsWith('.traineddata') || 
    url.includes('ort-wasm') || 
    url.includes('tesseract.js') ||
    url.includes('pdf.worker')
  ) {
    event.respondWith(
      caches.open(WASM_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200 || networkResponse.status === 0) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.error('Failed to fetch and cache model asset:', url, err);
            // Return any available match or fail
            return caches.match(event.request);
          });
        });
      })
    );
    return;
  }

  // Skip caching external APIs or cross-origin calls
  if (!url.startsWith(self.location.origin)) return;

  // Network-First strategy with Cache Fallback for standard assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
