const CACHE_VERSION = 'figurenest-shell-v3';
const OFFLINE_ASSETS = [
  './',
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(async (cache) => {
        const assetUrls = OFFLINE_ASSETS.map((asset) => new URL(asset, self.registration.scope).href);
        await cache.addAll(assetUrls);

        const rootUrl = new URL('./', self.registration.scope);
        const rootResponse = await fetch(rootUrl);
        if (!rootResponse.ok) return;
        await cache.put(rootUrl, rootResponse.clone());
        const html = await rootResponse.text();
        const shellAssets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)]
          .map((match) => new URL(match[1], rootUrl).href);
        await cache.addAll([...new Set(shellAssets)]);
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
          if (responseCanBeCached(response)) {
            const copy = response.clone();
            void caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
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

  if (isPublicStaticAsset(url) && ['style', 'script', 'font', 'image'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          if (responseCanBeCached(response)) {
            const copy = response.clone();
            void caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        });
        return cached || network;
      }),
    );
  }
});