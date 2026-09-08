import assert from 'node:assert/strict';
import { publicRoutes } from '../src/lib/seo';
import { normalizeRoutePath, SITE_ORIGIN, toCanonicalUrl } from '../src/lib/public-url';

const origin = new URL(SITE_ORIGIN);
const expectedPrivateDisallows = [
  '/api/',
  '/admin/',
  '/account/',
  '/auth/',
  '/internal/',
  '/private/',
  '/control-center/',
  '/sign-in/',
  '/sign-up/',
];

async function fetchText(pathname: string) {
  const response = await fetch(new URL(pathname, origin), {
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
    headers: { 'User-Agent': 'FigureNest-production-indexing-audit/1.0' },
  });
  const body = await response.text();
  assert.equal(response.status, 200, `${pathname} returned ${response.status}; expected 200`);
  return { response, body };
}

function auditRobots(body: string) {
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  assert(lines.some((line) => /^User-agent:\s*\*$/i.test(line)), 'robots.txt is missing User-agent: *');
  assert(lines.some((line) => /^Allow:\s*\/$/i.test(line)), 'robots.txt is missing Allow: /');
  assert(!lines.some((line) => /^Disallow:\s*\/$/i.test(line)), 'robots.txt blocks the entire site');

  for (const path of expectedPrivateDisallows) {
    assert(lines.some((line) => line.toLowerCase() === `disallow: ${path}`.toLowerCase()), `robots.txt is missing Disallow: ${path}`);
  }

  const sitemapLines = lines.filter((line) => /^Sitemap:/i.test(line));
  assert.deepEqual(sitemapLines, [`Sitemap: ${SITE_ORIGIN}/sitemap.xml`], 'robots.txt must declare exactly the canonical production sitemap');
  console.log(`PASS robots.txt: public crawl allowed, ${expectedPrivateDisallows.length} private paths blocked, canonical sitemap declared`);
}

function auditSitemap(body: string) {
  assert(/^<\?xml\s+version="1\.0"\s+encoding="UTF-8"\?>/i.test(body.trimStart()), 'sitemap.xml is missing the XML declaration');
  assert(/<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/i.test(body), 'sitemap.xml has an invalid or missing sitemap urlset namespace');

  const locs = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
  assert(locs.length > 0, 'sitemap.xml contains no <loc> entries');
  assert.equal(new Set(locs).size, locs.length, 'sitemap.xml contains duplicate URLs');

  const expectedUrls = publicRoutes.map((route) => toCanonicalUrl(route));
  const expectedSet = new Set(expectedUrls);
  const actualSet = new Set(locs);

  const missing = expectedUrls.filter((url) => !actualSet.has(url));
  const unexpected = locs.filter((url) => !expectedSet.has(url));
  assert.deepEqual(missing, [], `sitemap.xml is missing ${missing.length} published routes: ${missing.slice(0, 10).join(', ')}`);
  assert.deepEqual(unexpected, [], `sitemap.xml contains ${unexpected.length} unexpected routes: ${unexpected.slice(0, 10).join(', ')}`);
  assert.equal(locs.length, expectedUrls.length, `sitemap.xml contains ${locs.length} URLs; expected ${expectedUrls.length}`);

  for (const value of locs) {
    const url = new URL(value);
    assert.equal(url.origin, SITE_ORIGIN, `non-canonical sitemap origin: ${value}`);
    assert.equal(url.search, '', `sitemap URL contains query parameters: ${value}`);
    assert.equal(url.hash, '', `sitemap URL contains a fragment: ${value}`);
    assert.equal(value, toCanonicalUrl(normalizeRoutePath(url.pathname)), `sitemap URL is not normalized/canonical: ${value}`);
    assert(!/^\/(?:api|admin|account|auth|internal|private|control-center|sign-in|sign-up)(?:\/|$)/.test(url.pathname), `private route leaked into sitemap: ${value}`);
  }

  const lastmods = [...body.matchAll(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/g)].map((match) => match[1]);
  assert.equal(lastmods.length, locs.length, `sitemap.xml has ${lastmods.length} lastmod entries for ${locs.length} URLs`);
  for (const value of lastmods) assert(/^\d{4}-\d{2}-\d{2}$/.test(value), `invalid sitemap lastmod: ${value}`);

  console.log(`PASS sitemap.xml: ${locs.length} canonical URLs exactly match the published route inventory; no duplicates/private routes; all lastmod values valid`);
}

const robots = await fetchText('/robots.txt');
console.log(`PASS /robots.txt returned 200 (${robots.response.headers.get('content-type') ?? 'unknown content-type'})`);
auditRobots(robots.body);

const sitemap = await fetchText('/sitemap.xml');
console.log(`PASS /sitemap.xml returned 200 (${sitemap.response.headers.get('content-type') ?? 'unknown content-type'})`);
auditSitemap(sitemap.body);

console.log('Production indexing audit passed.');
