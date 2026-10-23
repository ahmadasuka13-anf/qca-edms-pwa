/**
 * Service Worker — QC-CMS EDMS PWA
 * Strategy:
 *  - HTML / Navigation: Network-First with fast Cache Fallback (Never stale!)
 *  - Static Assets: Stale-While-Revalidate (Instant load + background refresh)
 *  - API Calls: Direct Network (No caching)
 */

const CACHE_NAME = 'qccms-edms-v6.9';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/utils.js',
  '/gas-adapter.js',
  '/security.js',
  '/offline-queue.js',
  '/html5-qrcode.min.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/logo.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
  '/welcome-bg.jpg'
];

// 1. Install Event — Pre-cache static assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[SW] Precaching static assets for', CACHE_NAME);
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. Activate Event — Clean up old caches immediately
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) {
              console.log('[SW] Deleting old cache:', k);
              return caches.delete(k);
            })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 3. Message Event — Skip waiting when user confirms update
self.addEventListener('message', function(event) {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'skipWaiting')) {
    self.skipWaiting();
  }
});

// 4. Fetch Event — Network-First for HTML, Stale-While-Revalidate for Assets
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  // Jangan cache request API / Serverless POST
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // A. STRATEGI NETWORK-FIRST UNTUK NAVIGASI & HTML (Solusi Anti-Stale!)
  // Memastikan pengguna selalu mendapatkan UI terbaru saat online,
  // tapi tetap bisa dibuka offline jika tidak ada sinyal.
  const isHtml = event.request.mode === 'navigate' || 
                 (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) ||
                 url.pathname === '/' || url.pathname.endsWith('.html');

  if (isHtml) {
    event.respondWith(
      fetch(event.request)
        .then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(function() {
          console.log('[SW] Offline detected, serving cached HTML');
          return caches.match('/index.html').then(function(cached) {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // B. STRATEGI STALE-WHILE-REVALIDATE UNTUK ASET STATIK (Cepat + Selalu Update)
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      const fetchPromise = fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function() {
        return null;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
