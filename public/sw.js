// Swifter Wallet — Service Worker
// Strategy:
//   - Static assets (_next/static/): cache-first, long-lived
//   - Navigation (pages):            network-first, fallback to cache
//   - API routes:                    network-only (no caching of financial data)

const CACHE_VERSION = 'swifter-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;

// Core app-shell resources to pre-cache on install
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGES_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name.startsWith('swifter-') && name !== STATIC_CACHE && name !== PAGES_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from the same origin
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // API routes — always go to the network, never cache financial data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'You are offline. Please check your connection.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Next.js static assets (_next/static/) — immutable, cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Next.js image optimisation endpoint — network-first with cache fallback
  if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Public static files (images, icons, fonts) — cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/') ||
    /\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|otf)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // All other navigation requests — network-first, fall back to cached page or root
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          // Last resort: serve the root page for navigation requests
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        })
      )
  );
});
