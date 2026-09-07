import assert from 'node:assert/strict';

const DEFAULT_ORIGIN = 'https://figurenest.com';
const MAX_WARM_TTFB_MS = Number(process.env.MAX_WARM_TTFB_MS ?? 300);
const COMPRESSIBLE = /^(text\/|application\/(?:javascript|json|xml)|image\/svg\+xml)/i;
const ENCODING = /^(?:br|gzip)(?:,|$)/i;

type Observation = {
  url: string;
  status: number;
  ttfbMs: number;
  totalMs: number;
  headers: Headers;
  body: string;
};

const failures: string[] = [];
const passes: string[] = [];

function pass(message: string) {
  passes.push(message);
}

function fail(message: string) {
  failures.push(message);
}

async function observe(url: URL, options: RequestInit = {}): Promise<Observation> {
  const started = performance.now();
  const response = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
    ...options,
  });
  const headersAt = performance.now();
  const body = options.method === 'HEAD' ? '' : await response.text();
  return {
    url: url.href,
    status: response.status,
    ttfbMs: Math.round(headersAt - started),
    totalMs: Math.round(performance.now() - started),
    headers: response.headers,
    body,
  };
}

function cacheDirectives(value: string | null) {
  const directives = new Map<string, string | true>();
  for (const item of (value ?? '').split(',')) {
    const [rawName, rawValue] = item.trim().split('=', 2);
    if (!rawName) continue;
    directives.set(rawName.toLowerCase(), rawValue?.replace(/^"|"$/g, '') ?? true);
  }
  return directives;
}

function checkStatus(observation: Observation, expected = 200) {
  if (observation.status === expected) pass(`${observation.url} returned ${expected}`);
  else fail(`${observation.url} returned ${observation.status}; expected ${expected}`);
}

function checkLatency(observation: Observation) {
  if (observation.ttfbMs <= MAX_WARM_TTFB_MS) {
    pass(`${observation.url} TTFB ${observation.ttfbMs}ms`);
  } else {
    fail(`${observation.url} TTFB ${observation.ttfbMs}ms exceeds ${MAX_WARM_TTFB_MS}ms`);
  }
}

function checkNoCookie(observation: Observation) {
  const cookie = observation.headers.get('set-cookie');
  if (!cookie) pass(`${observation.url} sets no response cookie`);
  else fail(`${observation.url} sets a response cookie (${cookie.split('=', 1)[0]})`);
}

function checkSharedCache(observation: Observation, immutable: boolean) {
  const value = observation.headers.get('cache-control');
  const directives = cacheDirectives(value);
  if (directives.has('private') || directives.has('no-store') || !directives.has('public')) {
    fail(`${observation.url} is not publicly cacheable (${value ?? 'missing Cache-Control'})`);
    return;
  }

  if (immutable) {
    const maxAge = Number(directives.get('max-age') ?? 0);
    if (directives.has('immutable') && maxAge >= 31_536_000) {
      pass(`${observation.url} has immutable one-year caching`);
    } else {
      fail(`${observation.url} lacks immutable one-year caching (${value})`);
    }
    const cdnValue = observation.headers.get('cdn-cache-control');
    const cdnDirectives = cacheDirectives(cdnValue);
    if (cdnDirectives.has('public') && cdnDirectives.has('immutable') && Number(cdnDirectives.get('max-age') ?? 0) >= 31_536_000) {
      pass(`${observation.url} has immutable CDN caching`);
    } else {
      fail(`${observation.url} lacks immutable CDN caching (${cdnValue ?? 'missing CDN-Cache-Control'})`);
    }
    return;
  }

  if (directives.has('s-maxage') && directives.has('stale-while-revalidate')) {
    pass(`${observation.url} has shared caching with revalidation`);
  } else {
    fail(`${observation.url} lacks s-maxage/stale-while-revalidate (${value})`);
  }
  const cdnValue = observation.headers.get('cdn-cache-control');
  const cdnDirectives = cacheDirectives(cdnValue);
  if (cdnDirectives.has('public') && cdnDirectives.has('s-maxage') && cdnDirectives.has('stale-while-revalidate')) {
    pass(`${observation.url} has dedicated CDN caching with revalidation`);
  } else {
    fail(`${observation.url} lacks dedicated CDN caching (${cdnValue ?? 'missing CDN-Cache-Control'})`);
  }
}

function checkCompression(observation: Observation) {
  const contentType = observation.headers.get('content-type') ?? '';
  const contentEncoding = observation.headers.get('content-encoding') ?? '';
  const vary = observation.headers.get('vary') ?? '';
  if (!COMPRESSIBLE.test(contentType)) return;
  if (!ENCODING.test(contentEncoding)) {
    fail(`${observation.url} did not negotiate Brotli or gzip (${contentType})`);
  } else if (!/(?:^|,)\s*accept-encoding\s*(?:,|$)/i.test(vary)) {
    fail(`${observation.url} is compressed without Vary: Accept-Encoding`);
  } else {
    pass(`${observation.url} negotiated ${contentEncoding} with correct Vary`);
  }
}

function checkPrivateCache(observation: Observation) {
  const value = observation.headers.get('cache-control');
  const directives = cacheDirectives(value);
  if ((directives.has('private') || directives.has('no-store')) && !directives.has('public')) {
    pass(`${observation.url} is not publicly cacheable`);
  } else {
    fail(`${observation.url} must not be publicly cached (${value ?? 'missing Cache-Control'})`);
  }
}

function checkSecurityHeaders(observation: Observation) {
  const required = [
    ['strict-transport-security', /^max-age=63072000; includeSubDomains$/i],
    ['x-content-type-options', /^nosniff$/i],
    ['referrer-policy', /^strict-origin-when-cross-origin$/i],
    ['permissions-policy', /camera=\(\)/i],
    ['content-security-policy-report-only', /default-src 'self'.*frame-src[^;]*https:\/\/\*\.adtrafficquality\.google[^;]*https:\/\/\*\.doubleclick\.net/i],
  ] as const;
  for (const [name, pattern] of required) {
    const header = observation.headers.get(name) ?? '';
    if (pattern.test(header)) pass(`${observation.url} has ${name}`);
    else fail(`${observation.url} is missing or has invalid ${name}`);
  }
}

function pathAndQuery(url: URL) {
  return `${url.pathname}${url.search}`;
}

async function main() {
  const originArgument = process.argv.slice(2).find((argument) => argument !== '--');
  const origin = new URL(originArgument ?? DEFAULT_ORIGIN);
  if (process.env.ALLOW_HTTP_AUDIT !== '1') assert.equal(origin.protocol, 'https:', 'Production origin must use HTTPS');
  assert.equal(origin.pathname, '/', 'Production origin must not include a path');

  const requestHeaders = { 'Accept-Encoding': 'br, gzip' };
  const warmup = await observe(new URL('/', origin), { headers: requestHeaders });
  checkStatus(warmup);
  pass(`${warmup.url} warm-up completed in ${warmup.ttfbMs}ms`);

  const home = await observe(new URL('/', origin), { headers: requestHeaders });
  checkStatus(home);
  checkLatency(home);
  checkNoCookie(home);
  checkSharedCache(home, false);
  checkCompression(home);
  checkSecurityHeaders(home);

  const assetPaths = [...home.body.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+\.(?:js|css))"/g)]
    .map((match) => match[1]);
  const uniqueAssets = [...new Set(assetPaths)];
  const fingerprintedAssets = [
    uniqueAssets.find((path) => path.endsWith('.js')),
    uniqueAssets.find((path) => path.endsWith('.css')),
  ].filter((path): path is string => Boolean(path));
  if (!fingerprintedAssets.length) fail(`${home.url} did not expose fingerprinted JS/CSS assets`);

  const publicPaths = [
    '/robots.txt',
    '/sitemap.xml',
    '/site.webmanifest',
    '/social/figurenest-social-card.png',
    ...fingerprintedAssets,
  ];
  for (const path of publicPaths) {
    const observation = await observe(new URL(path, origin), { headers: requestHeaders });
    checkStatus(observation);
    checkLatency(observation);
    checkNoCookie(observation);
    checkSharedCache(observation, path.includes('/assets/'));
    checkCompression(observation);
    checkSecurityHeaders(observation);
    if (observation.headers.get('content-type')?.startsWith('image/')
      && observation.headers.has('content-encoding')) {
      fail(`${observation.url} unnecessarily compresses an image response`);
    }
  }

  for (const path of ['/sign-in/', '/control-center/', '/api']) {
    const observation = await observe(new URL(path, origin), { headers: requestHeaders });
    if (path !== '/api') checkStatus(observation);
    checkPrivateCache(observation);
    checkSecurityHeaders(observation);
  }

  const sitemap = await observe(new URL('/sitemap.xml', origin), { headers: requestHeaders });
  const sitemapUrls = [...sitemap.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
  for (const sitemapUrl of sitemapUrls) {
    const parsed = new URL(sitemapUrl);
    const observation = await observe(new URL(`${parsed.pathname}${parsed.search}`, origin), { headers: requestHeaders });
    checkStatus(observation);
    if (observation.headers.get('x-robots-tag')?.toLowerCase().includes('noindex')) {
      fail(`${observation.url} is in the sitemap but has an X-Robots-Tag noindex directive`);
    }
  }
  if (sitemapUrls.length) pass(`all ${sitemapUrls.length} sitemap URLs returned 200`);
  else fail('sitemap exposed no URLs');

  const parameterized = await observe(new URL('/calculators/finance/percentage/?utm_source=audit&value=private', origin), { headers: requestHeaders });
  checkStatus(parameterized);
  if (/<link rel="canonical" href="https:\/\/figurenest\.com\/calculators\/finance\/percentage\/"/i.test(parameterized.body)) {
    pass('query parameters do not leak into the canonical URL');
  } else {
    fail('query parameters changed or removed the canonical metadata');
  }

  for (const method of ['GET', 'HEAD'] as const) {
    for (const path of [`/missing-audit-${Date.now()}/`, `/missing-audit-${Date.now()}.html`]) {
      const observation = await observe(new URL(path, origin), { method, headers: requestHeaders });
      checkStatus(observation, 404);
      checkSecurityHeaders(observation);
      if (observation.headers.get('x-robots-tag')?.toLowerCase() === 'noindex, follow') {
        pass(`${method} missing route has noindex, follow response policy`);
      } else {
        fail(`${method} missing route lacks X-Robots-Tag: noindex, follow`);
      }
      if (method === 'GET' && (!observation.body.includes('FigureNest') || !observation.body.includes('Search the toolkit'))) {
        fail(`${observation.url} did not return the branded recovery page`);
      }
    }
  }

  const redirectPath = '/performance-host-probe/?source=canonical-check';
  const localAudit = process.env.ALLOW_HTTP_AUDIT === '1';
  const canonicalRedirectOrigin = new URL('https://figurenest.com');
  const canonicalUrl = new URL(redirectPath, canonicalRedirectOrigin);
  const wwwHostname = `www.${canonicalRedirectOrigin.hostname}`;
  const redirectRequest = (path: string, hostname: string, protocol: 'http' | 'https') => ({
    url: localAudit ? new URL(path, origin) : new URL(path, `${protocol}://${hostname}`),
    headers: localAudit ? { 'X-Forwarded-Host': hostname, 'X-Forwarded-Proto': protocol } : {},
  });
  const redirectCases = [
    { label: 'HTTP apex', ...redirectRequest(redirectPath, canonicalRedirectOrigin.hostname, 'http'), expected: canonicalUrl.href },
    { label: 'HTTP www', ...redirectRequest(redirectPath, wwwHostname, 'http'), expected: canonicalUrl.href },
    { label: 'HTTPS www', ...redirectRequest(redirectPath, wwwHostname, 'https'), expected: canonicalUrl.href },
    { label: 'legacy index.php', ...redirectRequest('/index.php?source=legacy', canonicalRedirectOrigin.hostname, 'https'), expected: `${canonicalRedirectOrigin.origin}/?source=legacy` },
    { label: 'legacy en', ...redirectRequest('/en/?source=legacy', canonicalRedirectOrigin.hostname, 'https'), expected: `${canonicalRedirectOrigin.origin}/?source=legacy` },
    { label: 'legacy es', ...redirectRequest('/es/?source=legacy', canonicalRedirectOrigin.hostname, 'https'), expected: `${canonicalRedirectOrigin.origin}/?source=legacy` },
  ];
  for (const method of ['GET', 'HEAD'] as const) {
    for (const redirectCase of redirectCases) {
      try {
        const redirect = await observe(redirectCase.url, { method, headers: { ...requestHeaders, ...redirectCase.headers } });
        if (redirect.status === 301 && redirect.headers.get('location') === redirectCase.expected) {
          pass(`${method} ${redirectCase.label} redirects in one 301 hop`);
          checkSecurityHeaders(redirect);
        } else {
          fail(`${method} ${redirectCase.label} returned ${redirect.status} ${redirect.headers.get('location') ?? '(no Location)'}; expected 301 ${redirectCase.expected}`);
        }
      } catch (error) {
        fail(`${method} ${redirectCase.label} could not be reached: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  console.log(`Production response audit: ${passes.length} passed, ${failures.length} failed`);
  for (const message of passes) console.log(`PASS ${message}`);
  for (const message of failures) console.error(`FAIL ${message}`);
  if (failures.length) process.exitCode = 1;
}

await main();