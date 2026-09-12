const CACHE_VERSION = 'figurenest-shell-v4';
const OFFLINE_ASSETS = [
  './offline.html',
  './manifest.webmanifest',
  './favicon.svg',
  './pwa-192.png',
  './pwa-512.png',
];
const PUBLIC_NAVIGATION_ROUTES = new Set([
  '/',
  '/home-construction',
  '/about',
  '/contact',
  '/privacy',
  '/cookies',
  '/terms',
  '/disclaimer',
  '/methodology',
  '/articles',
]);
const PUBLIC_NAVIGATION_PREFIXES = ['/category/', '/calculators/', '/converters/', '/articles/'];
const PUBLIC_STATIC_ASSETS = new Set([
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/pwa-192.png',
  '/pwa-512.png',
  '/pwa-maskable-512.png',
]);

const routePathFor = (url) => {
  const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, '');
  if (scopePath && !url.pathname.startsWith(`${scopePath}/`) && url.pathname !== scopePath) return null;
  const routePath = scopePath ? url.pathname.slice(scopePath.length) : url.pathname;
  return (routePath || '/').replace(/\/$/, '') || '/';
};

const isPublicNavigation = (url) => {
  const routePath = routePathFor(url);
  return routePath !== null
    && (PUBLIC_NAVIGATION_ROUTES.has(routePath) || PUBLIC_NAVIGATION_PREFIXES.some((prefix) => routePath.startsWith(prefix)));
};

const isPublicStaticAsset = (url) => {
  const routePath = routePathFor(url);
  return routePath !== null && (routePath.startsWith('/assets/') || PUBLIC_STATIC_ASSETS.has(routePath));
};

const responseCanBeCached = (response) => {
  const cacheControl = response.headers.get('Cache-Control') || '';
  return response.ok
    && response.status === 200
    && response.type === 'basic'
    && !/(?:^|,)\s*(?:private|no-store)\b/i.test(cacheControl);
};

const cacheSuccessfulResponse = async (request, response) => {
  if (!responseCanBeCached(response)) return;
  const cache = await caches.open(CACHE_VERSION);
  await cache.put(request, response.clone());
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(async (cache) => {
        const assetUrls = OFFLINE_ASSETS.map((asset) => new URL(asset, self.registration.scope).href);
        await cache.addAll(assetUrls);

        const rootUrl = new URL('./', self.registration.scope);
        const rootResponse = await fetch(rootUrl, { cache: 'no-store' });
        if (rootResponse.ok) await cache.put(rootUrl, rootResponse.clone());
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    if (!isPublicNavigation(url)) return;
    event.respondWith(
      fetch(request)
        .then((response) => {
          void cacheSuccessfulResponse(request, response);
          return response;
        })
        .catch(async () => (
          await caches.match(request)
          || await caches.match(new URL('./', self.registration.scope).href)
          || caches.match(new URL('./offline.html', self.registration.scope).href)
        )),
    );
    return;
  }

  if (!isPublicStaticAsset(url)) return;

  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(async (response) => {
          if (response.ok) {
            void cacheSuccessfulResponse(request, response);
            return response;
          }
          return (await caches.match(request)) || response;
        })
        .catch(async () => (
          await caches.match(request)
          || new Response('', { status: 503, statusText: 'Offline' })
        )),
    );
    return;
  }

  if (request.destination === 'font' || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          void cacheSuccessfulResponse(request, response);
          return response;
        });
      }),
    );
  }
});
