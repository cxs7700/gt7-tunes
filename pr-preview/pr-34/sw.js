// Service worker: cache tune images so the thousands of webp files are fetched
// once and served from cache on later visits. CacheFirst with a capped,
// FIFO-trimmed cache. Scope is the app's base path (set at registration).
const IMG_CACHE = 'gt7-images-v1';
const MAX_ENTRIES = 700;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop old cache versions.
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith('gt7-images-') && n !== IMG_CACHE).map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin && /\/images\/.+\.webp$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(IMG_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
      trim(cache); // fire-and-forget
    }
    return response;
  } catch (err) {
    // Offline and not cached.
    return cached || Response.error();
  }
}

async function trim(cache) {
  const keys = await cache.keys();
  const overflow = keys.length - MAX_ENTRIES;
  for (let i = 0; i < overflow; i++) await cache.delete(keys[i]);
}
