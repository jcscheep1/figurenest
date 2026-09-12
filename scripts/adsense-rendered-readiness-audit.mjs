import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, 'artifacts/calcstride/dist/public');
const sitemapPath = path.join(repoRoot, 'artifacts/calcstride/public/sitemap.xml');
const reportPath = path.join(repoRoot, 'artifacts/calcstride/dist/adsense-rendered-audit.json');

const failures = [];
const warnings = [];
const records = [];
const seenTitles = new Map();
const seenDescriptions = new Map();
const seenCanonicals = new Map();

const fail = (route, message) => failures.push({ route, message });
const warn = (route, message) => warnings.push({ route, message });
const decode = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

function cleanText(html) {
  return decode(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim());
}

function capture(html, expression) {
  return decode(html.match(expression)?.[1]?.trim() ?? '');
}

function fileForRoute(route) {
  if (route === '/') return path.join(publicRoot, 'index.html');
  return path.join(publicRoot, route.replace(/^\//, '').replace(/\/$/, ''), 'index.html');
}

function registerUnique(map, value, route, label) {
  if (!value) return;
  const previous = map.get(value);
  if (previous && previous !== route) fail(route, `duplicate ${label} also used by ${previous}`);
  else map.set(value, route);
}

if (!fs.existsSync(publicRoot)) throw new Error('Build output is missing; run the production build first.');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urls = [...sitemap.matchAll(/<loc>(https:\/\/figurenest\.com[^<]+)<\/loc>/g)].map((match) => match[1]);
if (urls.length < 200) fail('/sitemap.xml', `expected at least 200 public URLs, found ${urls.length}`);

for (const url of urls) {
  const parsed = new URL(url);
  const route = parsed.pathname;
  const file = fileForRoute(route);
  if (!fs.existsSync(file)) {
    fail(route, 'sitemap route has no prerendered index.html');
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const title = capture(html, /<title>([\s\S]*?)<\/title>/i);
  const description = capture(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)
    || capture(html, /<meta\s+content=["']([^"']*)["']\s+name=["']description["'][^>]*>/i);
  const canonical = capture(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)
    || capture(html, /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i);
  const mainMatches = html.match(/<main\b/gi) ?? [];
  const mainHtml = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
  const mainText = cleanText(mainHtml);
  const words = mainText ? mainText.split(/\s+/).filter(Boolean).length : 0;
  const h1Count = (mainHtml.match(/<h1\b/gi) ?? []).length;
  const schemas = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].length;

  if (!title) fail(route, 'missing rendered title');
  else if (title.length > 65) warn(route, `title is ${title.length} characters`);
  if (!description) fail(route, 'missing rendered meta description');
  else if (description.length < 90 || description.length > 180) warn(route, `meta description is ${description.length} characters`);
  if (canonical !== url) fail(route, `canonical mismatch: expected ${url}, found ${canonical || 'none'}`);
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) fail(route, 'sitemap URL is marked noindex');
  if (mainMatches.length !== 1) fail(route, `expected one main landmark, found ${mainMatches.length}`);
  if (h1Count !== 1) fail(route, `expected one H1 in main, found ${h1Count}`);

  const isCategory = route.startsWith('/category/');
  const isDirectory = route === '/calculators/';
  const isTool = route.startsWith('/calculators/') || route.startsWith('/converters/') || route.startsWith('/file-tools/');
  const minimumWords = isCategory ? 450 : isDirectory ? 350 : isTool ? 220 : 160;
  if (words < minimumWords) fail(route, `thin rendered main content: ${words} words; minimum ${minimumWords}`);
  if (/\b(coming soon|placeholder|lorem ipsum|still being stocked)\b/i.test(mainText)) fail(route, 'unfinished or placeholder language is publicly rendered');
  if ((isCategory || isTool) && schemas === 0) fail(route, 'missing rendered JSON-LD schema');

  registerUnique(seenTitles, title, route, 'title');
  registerUnique(seenDescriptions, description, route, 'meta description');
  registerUnique(seenCanonicals, canonical, route, 'canonical');
  records.push({ route, file: path.relative(repoRoot, file), title, descriptionLength: description.length, canonical, words, h1Count, schemas });
}

const report = {
  generatedAt: new Date().toISOString(),
  auditedUrls: urls.length,
  failures,
  warnings,
  records,
};
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(`Rendered AdSense audit: ${records.length}/${urls.length} routes inspected, ${failures.length} failure(s), ${warnings.length} warning(s).`);
for (const item of failures) console.error(`FAIL  ${item.route} — ${item.message}`);
for (const item of warnings) console.warn(`WARN  ${item.route} — ${item.message}`);
console.log(`Report: ${path.relative(repoRoot, reportPath)}`);
if (failures.length) process.exit(1);
