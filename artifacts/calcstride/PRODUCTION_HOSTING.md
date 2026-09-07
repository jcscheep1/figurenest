# FigureNest production hosting boundary

FigureNest is built from the catalog-driven set of public routes plus static JavaScript, CSS, images, `robots.txt`, and `sitemap.xml`. Its authenticated control center uses the separate `/api` artifact. The current Replit production publication remains a combined Autoscale deployment, with the web and API artifacts in the same project.

## Confirmed latency diagnosis

There is no per-request SSR, database query, external request, sitemap generation, or route generation on public production requests. Those operations happen at build time.

The September 2026 production logs identified a controllable cold-start gate in addition to the platform wake-up: Autoscale waited for both runnable artifact ports while the web artifact launched through `pnpm`, `tsx`, and on-the-fly TypeScript transformation. Repeated root health checks returned 500 while only the API port had opened. Because HTML and `/assets/*` share that web port, every resource waited behind the same startup chain.

The active production deployment remains Autoscale. This preserves usage-based compute cost but means an occasional first request after an idle period can remain slow. Moving to an always-on Reserved VM would remove scale-to-zero latency at a fixed monthly cost, but is not part of the current setup.

The web production server is now built to a 7.45 KB ESM file and launched directly with Node. It opens a dedicated `/healthz` response without loading React SSR, Clerk, the database, the API, or any build-time route generation. Production-like fresh-process tests measured launch-to-health at 59–72 ms and launch-through-first-response at 75–205 ms across HTML, SEO files, JavaScript, and CSS. The existing API bootstrap remains unchanged and opens its port before loading its heavier application modules.

## Cache, compression, and cookie boundary

The root `.replit` contains best-effort policies for:

- short-lived shared caching with stale revalidation for public HTML and generated SEO files;
- one-year immutable caching for fingerprinted `/assets/*`;
- longer shared caching for stable public icons and social images;
- private, no-store handling for sign-in, control-center, and API paths.

The production web service applies these policies itself before serving the
prerendered files, including public `Cache-Control`, dedicated
`CDN-Cache-Control`, ETags, private no-store handling, and Brotli/gzip
negotiation. Fingerprinted assets receive one-year immutable browser and CDN
caching. The API artifact remains independently routed at `/api` and its
production service is unchanged.

The currently published Replit edge was observed adding a `GAESA` affinity
cookie and rewriting application `public` responses to `private`. That behavior
occurs after the application response and cannot be removed by application
middleware. The next user-initiated publish must therefore be checked with the
production response audit. A pass requires no public response cookie and public
browser/CDN directives at the live edge; do not claim edge-cache success from
local headers alone.

Run the production response audit after every publication:

```bash
pnpm --filter @workspace/calcstride run audit:production-responses -- https://figurenest.com
```

The audit checks public/private cache boundaries, response cookies, compression and `Vary`, representative warm TTFB, HTTP canonicalization, `www`, and the current fingerprinted assets discovered from the deployed HTML.

If a future Replit edge policy overrides application response headers, an
owner-controlled CDN/reverse proxy can be added in front of the existing
Autoscale publication. Splitting or retiring the API is not required for the
current setup.

Do not publicly cache `/sign-in`, `/control-center`, `/api`, Clerk authentication responses, or authenticated account data.

## Canonical hosts

The application canonical remains `https://figurenest.com/`.

- Requests that reach the Autoscale web service are returned with the exact
  canonical origin `https://figurenest.com` and never an explicit `:443`.
- Add `www.figurenest.com` as a separate custom domain in Replit Publishing,
  then add the exact DNS records Replit provides at GoDaddy. Once `www` resolves
  to this publication, the application redirects it to the apex host.
- Replit automatically provisions HTTPS for linked custom domains. If Replit's
  automatic HTTP edge response still emits a visible `:443` before the request
  reaches the application, that edge response cannot be changed by application
  code and must be corrected in the domain/CDN layer.