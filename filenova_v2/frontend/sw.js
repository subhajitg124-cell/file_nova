'use strict';
/* FileNova v2 service worker — installable PWA + offline fallback.
 * Static assets: cache-first. API + socket: network-only (never cached).
 * Navigations offline: offline.html. */

const CACHE = 'filenova-v2-2';
const STATIC = [
  '/', '/index.html', '/room.html', '/join.html', '/receive.html', '/offline.html',
  '/css/main.css', '/css/animations.css',
  '/js/app.js', '/js/room.js', '/js/join.js', '/js/receive.js',
  '/js/ui.js', '/js/crypto.js', '/js/socket.js', '/js/qr.js', '/js/audio.js',
  '/icon.svg', '/favicon.ico', '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) return; // never cache live data

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((hit) => {
        const miss = fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        }).catch(() => hit);
        return hit || miss;
      })
    );
  }
});
