import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicRoutes, SITE_ORIGIN } from '../src/lib/seo';
import { normalizeRoutePath, toCanonicalUrl, toPublicPath } from '../src/lib/public-url';
import { ADSENSE_ADS_TXT_RECORD, ADSENSE_SCRIPT_URL } from '../src/lib/adsense';
import { articles } from '../src/lib/articles';
import { homepageFaqData } from '../src/lib/homepage-content';
import { legacyRedirectPaths } from '../src/lib/redirects';
import { expandedCalculatorContent } from '../src/lib/expanded-calculator-content';
import { focusedConstructionContent } from '../src/lib/focused-construction-content';
import { categoryContent } from '../src/lib/category-content';
import { localCategories, localTools, publishedTools } from '../src/lib/catalog';
import { getBreadcrumbItems } from '../src/lib/breadcrumbs';
import { priorityOneExpansionDefinitions, priorityOneExpansionSlugs } from '../src/lib/priority-one-expansion';
import { phaseTwoDefinitions, phaseTwoSlugs } from '../src/lib/phase-two-expansion';
import { phaseThreeADefinitions, phaseThreeASlugs } from '../src/lib/phase-three-a';
import { phaseThreeBDefinitions, phaseThreeBSlugs } from '../src/lib/phase-three-b';
import { phaseThreeCDefinitions, phaseThreeCExpandedSlugs, phaseThreeCSlugs } from '../src/lib/phase-three-c';
import { phaseFourDefinitions, phaseFourSlugs } from '../src/lib/phase-four';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist/public');
const failures: string[] = [];
const titles = new Map<string, string>();
const descriptions = new Map<string, string>();
const headings = new Map<string, string>();
const canonicals = new Map<string, string>();
const routeSet = new Set(publicRoutes);
const productionOrigin = 'https://figurenest.com';
const expectedSitemapUrlCount = publicRoutes.length;
const expectedIndexablePageCount = 196;
const internalLinkGraph = new Map(publicRoutes.map((route) => [route, new Set<string>()]));
const calculatorProseBlocks: Array<{ route: string; text: string }> = [];
const normalizedLegacyPaths = new Set(legacyRedirectPaths.map(normalizeRoutePath));
const intentionalZeroInboundRoutes = new Set(['/']);
const productionHostname = new URL(productionOrigin).hostname;

const count = (html: string, pattern: RegExp) => html.match(pattern)?.length ?? 0;
const countText = (html: string, text: string) => html.split(text).length - 1;
const value = (html: string, pattern: RegExp) => html.match(pattern)?.[1]?.trim() ?? '';
const outputFile = (route: string) => {
  const routeKey = normalizeRoutePath(route);
  return routeKey === '/' ? path.join(output, 'index.html') : path.join(output, routeKey.slice(1), 'index.html');
};

const localAssetPaths = (html: string, extension: 'js' | 'css') => [...new Set(
  [...html.matchAll(new RegExp(`(?:src|href)="(/assets/[^"]+\\.${extension})"`, 'g'))].map((match) => match[1]),
)];
const decodeHtml = (text: string) => text
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');
const visibleText = (html: string) => decodeHtml(
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' '),
).replace(/\s+/g, ' ').trim();
const wordCount = (text: string) => text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
const calculatorRoutes = new Set(localTools.map((tool) => toPublicPath(tool.href)));
const advancedCalculatorDefinitions = [
  ...priorityOneExpansionSlugs
    .filter((slug) => !phaseThreeCExpandedSlugs.includes(slug as typeof phaseThreeCExpandedSlugs[number]))
    .map((slug) => priorityOneExpansionDefinitions[slug]),
  ...phaseTwoSlugs.map((slug) => phaseTwoDefinitions[slug]),
  ...phaseThreeASlugs.map((slug) => phaseThreeADefinitions[slug]),
  ...phaseThreeBSlugs.map((slug) => phaseThreeBDefinitions[slug]),
  ...phaseThreeCSlugs.map((slug) => phaseThreeCDefinitions[slug]),
  ...phaseFourSlugs.map((slug) => phaseFourDefinitions[slug]),
];
const qualifyingCalculatorText = (html: string) => {
  let depth = 0;
  let qualifyingDepth = 0;
  let text = '';
  const stack: Array<{ excluded: boolean }> = [];
  const tokens = html.matchAll(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<[^>]+>|[^<]+/gi);
  for (const token of tokens) {
    const markup = token[0];
    if (!markup.startsWith('<')) {
      if (qualifyingDepth && !stack.some((item) => item.excluded)) text += ` ${markup}`;
      continue;
    }
    if (/^<\//.test(markup)) {
      if (qualifyingDepth === depth) qualifyingDepth = 0;
      stack.pop();
      depth -= 1;
      continue;
    }
    if (/^<!|^<\?|^<script|^<style/i.test(markup)) continue;
    const selfClosing = /\/>$|^<(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i.test(markup);
    depth += 1;
    const className = value(markup, /\bclass="([^"]*)"/i);
    stack.push({ excluded: /seo-related-links|related-tool|related-links/i.test(className) });
    if (!qualifyingDepth && /^<article\b/i.test(markup) && /\badvanced-content\b/.test(className)) {
      qualifyingDepth = depth;
    }
    if (selfClosing) {
      if (qualifyingDepth === depth) qualifyingDepth = 0;
      stack.pop();
      depth -= 1;
    }
  }
  return visibleText(text);
};
const educationalProseBlocks = (html: string) => {
  let depth = 0;
  let articleDepth = 0;
  let captureDepth = 0;
  let capture = '';
  const blocks: string[] = [];
  const stack: Array<{ excluded: boolean; tag: string }> = [];
  const tokens = html.matchAll(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<[^>]+>|[^<]+/gi);
  for (const token of tokens) {
    const markup = token[0];
    if (!markup.startsWith('<')) {
      if (captureDepth && !stack.some((item) => item.excluded)) capture += ` ${markup}`;
      continue;
    }
    if (/^<\//.test(markup)) {
      if (captureDepth === depth) {
        const text = visibleText(capture);
        if (wordCount(text) >= 8) blocks.push(text);
        captureDepth = 0;
        capture = '';
      }
      if (articleDepth === depth) articleDepth = 0;
      stack.pop();
      depth -= 1;
      continue;
    }
    if (/^<!|^<\?|^<script|^<style/i.test(markup)) continue;
    const tag = markup.match(/^<([a-z0-9-]+)/i)?.[1]?.toLowerCase() ?? '';
    const selfClosing = /\/>$|^<(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i.test(markup);
    depth += 1;
    const className = value(markup, /\bclass="([^"]*)"/i);
    stack.push({ excluded: /seo-related-links|related-tool|related-links|advanced-formula-list/i.test(className), tag });
    if (!articleDepth && tag === 'article' && /\badvanced-content\b/.test(className)) articleDepth = depth;
    if (articleDepth && !captureDepth && (tag === 'p' || tag === 'li')) {
      captureDepth = depth;
      capture = '';
    }
    if (selfClosing) {
      stack.pop();
      depth -= 1;
    }
  }
  return blocks;
};
const normalizeProse = (text: string) => text
  .normalize('NFKC')
  .toLowerCase()
  .replace(/[’']/g, '')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const proseShingles = (text: string, size = 5) => {
  const words = normalizeProse(text).split(' ').filter(Boolean);
  const shingles = new Set<string>();
  for (let index = 0; index <= words.length - size; index += 1) shingles.add(words.slice(index, index + size).join(' '));
  return shingles;
};
const isAllowedSharedProse = (text: string) => (
  /^This tool provides a general estimate, not financial, tax, legal, or investment advice\./.test(text)
  || /^This planning estimate cannot account for every site condition, product specification, permit, or local code\./.test(text)
  || /^This tool provides an educational estimate, not a diagnosis or treatment recommendation\./.test(text)
  || /^This .+ result is for planning only\./.test(text)
  || /^This .+ result is an estimate, not a diagnosis or treatment plan\./.test(text)
  || /^Your school’s syllabus and official record control\./.test(text)
  || /^No\. The calculation runs locally in (?:your |the )browser/.test(text)
);
const forbiddenBoilerplate = [
  'Keep the labels and units together while checking the arithmetic.',
  'Record the entered values before comparing alternatives',
  'retain extra digits until the final display',
  'transparent planning value rather than an instruction',
  'test a conservative alternative',
  'This calculator is designed to make one clearly stated estimate',
  'Use the answer as a planning prompt rather than a promise.',
  'Before relying on the displayed answer, independently check one simple case.',
  'turns a small set of stated inputs into a transparent estimate.',
  'Use a calculator result as a planning reference rather than as a substitute',
];
const filesUnder = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(filename) : [filename];
  }))).flat();
};
const visibleFaqCount = (html: string) => {
  let depth = 0;
  let faqDepth = 0;
  let total = 0;
  for (const match of html.matchAll(/<[^>]+>/g)) {
    const markup = match[0];
    if (/^<\//.test(markup)) {
      if (faqDepth === depth) faqDepth = 0;
      depth -= 1;
      continue;
    }
    if (/^<!|^<\?/.test(markup)) continue;
    const selfClosing = /\/>$|^<(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i.test(markup);
    depth += 1;
    const className = value(markup, /\bclass="([^"]*)"/i);
    if (!faqDepth && /\b(?:advanced|construction)-faq\b/.test(className)) faqDepth = depth;
    if (faqDepth && /^<details\b/i.test(markup)) total += 1;
    if (selfClosing) depth -= 1;
  }
  return total;
};
const isLocalReference = (reference: string) => (
  !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)
);
const internalUrlFor = (reference: string, route: string) => {
  let resolved: URL;
  try {
    resolved = new URL(decodeHtml(reference), toCanonicalUrl(route));
  } catch {
    return null;
  }
  if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return null;
  if (resolved.hostname === `www.${productionHostname}`) {
    failures.push(`${route}: internal link uses redirecting www host ${reference}`);
    return resolved;
  }
  if (resolved.hostname !== productionHostname) return null;
  if (resolved.protocol !== 'https:') {
    failures.push(`${route}: internal link uses redirecting non-HTTPS origin ${reference}`);
  }
  return resolved;
};
const localFileFor = (reference: string, route: string) => {
  const routeUrl = toCanonicalUrl(route);
  const resolved = new URL(reference, routeUrl);
  if (resolved.origin !== productionOrigin) return null;
  return path.join(output, decodeURIComponent(resolved.pathname).replace(/^\/+/, ''));
};

const indexablePages = await Promise.all(publicRoutes.map(async (route) => ({
  route,
  html: await fs.readFile(outputFile(route), 'utf8'),
})));
for (const directory of [path.join(root, 'dist/server'), path.join(root, 'dist/runtime')]) {
  for (const filename of await filesUnder(directory)) {
    if (!/\.(?:js|mjs)$/.test(filename)) continue;
    const bundledSource = await fs.readFile(filename, 'utf8');
    for (const phrase of forbiddenBoilerplate) {
      if (bundledSource.toLowerCase().includes(phrase.toLowerCase())) {
        failures.push(`${path.relative(root, filename)}: packaged production code contains forbidden boilerplate: ${phrase}`);
      }
    }
  }
}
if (indexablePages.length !== expectedIndexablePageCount) {
  failures.push(`route inventory: expected ${expectedIndexablePageCount} rendered indexable HTML files, found ${indexablePages.length}`);
}
// The shortest intentional indexable page currently exceeds 1,400 visible
// characters. A fixed floor catches broad SSR/content regressions instead of
// weakening itself when every generated page becomes unexpectedly sparse.
const substantiveTextFloor = 1_000;

for (const { route, html } of indexablePages) {
  const title = value(html, /<title>([^<]+)<\/title>/i);
  const description = value(html, /<meta name="description" content="([^"]+)"/i);
  const canonical = value(html, /<link rel="canonical" href="([^"]+)"/i);
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1 = h1s.length === 1 ? visibleText(h1s[0][1]) : '';
  const pageText = visibleText(html);
  const sourceEdges = internalLinkGraph.get(route);
  for (const anchor of html.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/gi)) {
    const reference = anchor[2];
    const linkedUrl = internalUrlFor(reference, route);
    if (!linkedUrl) continue;
    const linkedPath = normalizeRoutePath(linkedUrl.pathname);
    if (normalizedLegacyPaths.has(linkedPath)) {
      failures.push(`${route}: internal link points to redirecting legacy path ${reference}`);
      continue;
    }
    if (path.extname(linkedPath)) continue;
    const targetRoute = toPublicPath(linkedPath);
    const privatePath = ['/sign-in', '/sign-up', '/control-center', '/api', '/admin', '/account', '/auth', '/internal', '/private']
      .find((prefix) => linkedPath === prefix || linkedPath.startsWith(`${prefix}/`));
    if (privatePath) {
      failures.push(`${route}: link leaks a private route ${reference}`);
    } else if (!routeSet.has(targetRoute)) {
      failures.push(`${route}: broken internal link ${reference}`);
    } else {
      sourceEdges?.add(targetRoute);
    }
  }
  const expectedBreadcrumbs = getBreadcrumbItems(route);
  const breadcrumbNavs = [...html.matchAll(/<nav class="site-breadcrumbs" aria-label="Breadcrumb">([\s\S]*?)<\/nav>/gi)];
  const structuredDataText = value(html, /<script id="figurenest-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  const structuredData = JSON.parse(structuredDataText) as { '@graph'?: Array<{ '@type'?: string; itemListElement?: Array<{ position: number; name: string; item: string }> }> };
  const schemaBreadcrumbs = (structuredData['@graph'] ?? []).filter((node) => node['@type'] === 'BreadcrumbList');

  if (normalizeRoutePath(route) === '/') {
    if (breadcrumbNavs.length !== 0) failures.push(`${route}: homepage must not render breadcrumbs`);
    if (schemaBreadcrumbs.length !== 0) failures.push(`${route}: homepage must not emit BreadcrumbList schema`);
  } else {
    if (breadcrumbNavs.length !== 1) failures.push(`${route}: expected exactly one shared breadcrumb trail`);
    if (schemaBreadcrumbs.length !== 1) failures.push(`${route}: expected exactly one BreadcrumbList schema node`);
    const nav = breadcrumbNavs[0]?.[1] ?? '';
    const visibleItems = [...nav.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => visibleText(match[1]));
    if (JSON.stringify(visibleItems) !== JSON.stringify(expectedBreadcrumbs.map((item) => item.label))) {
      failures.push(`${route}: visible breadcrumb labels do not match route metadata`);
    }
    if (count(nav, /aria-current="page"/gi) !== 1) failures.push(`${route}: breadcrumb needs one current-page indication`);
    const currentMarkup = value(nav, /(<span aria-current="page">[\s\S]*?<\/span>)/i);
    if (!currentMarkup || /<a\b/i.test(currentMarkup)) failures.push(`${route}: current breadcrumb must be unlinked text`);
    const ancestorLinks = [...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gi)].map((match) => normalizeRoutePath(match[1]));
    if (JSON.stringify(ancestorLinks) !== JSON.stringify(expectedBreadcrumbs.slice(0, -1).map((item) => normalizeRoutePath(item.path)))) {
      failures.push(`${route}: breadcrumb ancestor links do not match route metadata`);
    }
    const schemaItems = schemaBreadcrumbs[0]?.itemListElement ?? [];
    const expectedSchemaItems = expectedBreadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: toCanonicalUrl(item.path),
    }));
    if (JSON.stringify(schemaItems) !== JSON.stringify(expectedSchemaItems)) {
      failures.push(`${route}: BreadcrumbList schema does not exactly match the visible trail`);
    }
  }

  if (html.includes('<div id="root"></div>')) failures.push(`${route}: empty app root`);
  if (count(html, /<main\b/gi) !== 1) failures.push(`${route}: expected exactly one main landmark`);
  if (h1s.length !== 1) failures.push(`${route}: expected exactly one H1`);
  if (h1s.length === 1 && !visibleText(h1s[0][1])) failures.push(`${route}: H1 has no visible text`);
  if (h1 && headings.has(h1)) failures.push(`${route}: duplicate H1 also used by ${headings.get(h1)}`);
  if (h1) headings.set(h1, route);
  if (pageText.length < substantiveTextFloor) {
    failures.push(`${route}: server-rendered visible text is ${pageText.length} characters; ${substantiveTextFloor}-character floor required`);
  }
  if (/\b51\s+(?:published\s+)?tools?\b|\b9\s+(?:active\s+)?categories?\b/i.test(pageText)) {
    failures.push(`${route}: contains a stale legacy inventory total`);
  }
  if (count(html, /<title>/gi) !== 1) failures.push(`${route}: expected exactly one title`);
  if (count(html, /<meta name="description"/gi) !== 1) failures.push(`${route}: expected exactly one meta description`);
  if (count(html, /<meta name="robots"/gi) !== 1) failures.push(`${route}: expected exactly one robots meta tag`);
  if (count(html, /rel="canonical"/gi) !== 1) failures.push(`${route}: expected exactly one canonical`);
  if (canonical !== toCanonicalUrl(route)) failures.push(`${route}: incorrect canonical ${canonical}`);
  try {
    if (new URL(canonical).origin !== productionOrigin) failures.push(`${route}: canonical is not on the production origin`);
  } catch {
    failures.push(`${route}: canonical is not a valid URL`);
  }
  if (value(html, /<meta name="robots" content="([^"]+)"/i).toLowerCase() !== 'index, follow') {
    failures.push(`${route}: robots must be index, follow`);
  }
  for (const [label, tagValue, expected] of [
    ['Open Graph title', value(html, /<meta property="og:title" content="([^"]+)"/i), title],
    ['Open Graph description', value(html, /<meta property="og:description" content="([^"]+)"/i), description],
    ['Open Graph type', value(html, /<meta property="og:type" content="([^"]+)"/i), null],
    ['Open Graph image', value(html, /<meta property="og:image" content="([^"]+)"/i), `${productionOrigin}/social/figurenest-social-card.png`],
    ['Twitter card', value(html, /<meta name="twitter:card" content="([^"]+)"/i), null],
    ['Twitter title', value(html, /<meta name="twitter:title" content="([^"]+)"/i), title],
    ['Twitter description', value(html, /<meta name="twitter:description" content="([^"]+)"/i), description],
    ['Twitter image', value(html, /<meta name="twitter:image" content="([^"]+)"/i), `${productionOrigin}/social/figurenest-social-card.png`],
  ] as const) {
    if (!tagValue || (expected !== null && tagValue !== expected)) failures.push(`${route}: incomplete or incorrect ${label}`);
  }
  if (value(html, /<meta property="og:url" content="([^"]+)"/i) !== canonical) failures.push(`${route}: Open Graph URL does not match canonical`);
  if (value(html, /<meta property="og:image" content="([^"]+)"/i) !== `${productionOrigin}/social/figurenest-social-card.png`) {
    failures.push(`${route}: missing absolute default Open Graph image`);
  }
  if (value(html, /<meta property="og:image:width" content="([^"]+)"/i) !== '1200') failures.push(`${route}: incorrect Open Graph image width`);
  if (value(html, /<meta property="og:image:height" content="([^"]+)"/i) !== '630') failures.push(`${route}: incorrect Open Graph image height`);
  if (!value(html, /<meta property="og:image:alt" content="([^"]+)"/i)) failures.push(`${route}: missing Open Graph image alt`);
  if (value(html, /<meta name="twitter:image" content="([^"]+)"/i) !== `${productionOrigin}/social/figurenest-social-card.png`) {
    failures.push(`${route}: missing absolute Twitter image`);
  }
  if (!value(html, /<meta name="twitter:image:alt" content="([^"]+)"/i)) failures.push(`${route}: missing Twitter image alt`);
  if (!title || titles.has(title)) failures.push(`${route}: missing or duplicate title`);
  if (!description || descriptions.has(description)) failures.push(`${route}: missing or duplicate description`);
  if (!canonical || canonicals.has(canonical)) failures.push(`${route}: missing or duplicate canonical`);
  if (title.length > 60) failures.push(`${route}: title exceeds 60 characters`);
  if (description.length < 70 || description.length > 160) failures.push(`${route}: description length is ${description.length}`);
  if (/\.replit\.(dev|app)|localhost/i.test(html)) failures.push(`${route}: development domain leaked into HTML`);
  if (countText(html, ADSENSE_SCRIPT_URL) !== 1) failures.push(`${route}: expected exactly one AdSense publisher script reference`);
  if (countText(html, 'name="google-adsense-account"') !== 1) failures.push(`${route}: expected exactly one AdSense account meta`);
  if (!html.includes('figurenest.com') || !html.includes('www.figurenest.com')) failures.push(`${route}: missing exact AdSense production-host gate`);
  if (
    !html.includes("ad_storage:'denied'")
    || !html.includes("ad_user_data:'denied'")
    || !html.includes("ad_personalization:'denied'")
  ) {
    failures.push(`${route}: missing denied-by-default Google consent state`);
  }
  if (html.indexOf("ad_storage:'denied'") > html.indexOf(ADSENSE_SCRIPT_URL)) failures.push(`${route}: AdSense appears before consent defaults`);
  titles.set(title, route);
  descriptions.set(description, route);
  canonicals.set(canonical, route);

  if (calculatorRoutes.has(route)) {
    const proseBlocks = educationalProseBlocks(html);
    calculatorProseBlocks.push(...proseBlocks.map((text) => ({ route, text })));
    if (proseBlocks.length < 4) failures.push(`${route}: calculator guide has ${proseBlocks.length} substantive prose blocks; at least 4 required`);
    if (visibleFaqCount(html) < 2) failures.push(`${route}: calculator guide needs at least 2 visible FAQs`);
    for (const phrase of forbiddenBoilerplate) {
      if (qualifyingCalculatorText(html).includes(phrase)) failures.push(`${route}: contains forbidden boilerplate: ${phrase}`);
    }
    const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
    for (const image of images) {
      if (!/\balt="[^"]*"/i.test(image)) failures.push(`${route}: image is missing alt text`);
      const hasDimensions = /\bwidth="\d+"/i.test(image) && /\bheight="\d+"/i.test(image);
      const reservesRatio = /\bstyle="[^"]*aspect-ratio\s*:/i.test(image);
      if (!hasDimensions && !reservesRatio) failures.push(`${route}: image is missing dimensions or a reserved aspect ratio`);
      if (!/\bloading="lazy"/i.test(image) && !/\bfetchpriority="high"/i.test(image)) {
        failures.push(`${route}: image must be lazy loaded or explicitly identified as the LCP image`);
      }
    }
  }

  const moduleScripts = [...html.matchAll(/<script\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => /\btype="module"/i.test(tag))
    .map((tag) => value(tag, /\bsrc="([^"]+)"/i))
    .filter(Boolean);
  if (!moduleScripts.length) failures.push(`${route}: missing module script`);
  for (const script of moduleScripts) {
    const filename = localFileFor(script, route);
    try {
      if (!filename) throw new Error('external module');
      await fs.access(filename);
    } catch {
      failures.push(`${route}: module script does not resolve ${script}`);
    }
  }

  const schemas = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if (schemas.length !== 1) failures.push(`${route}: expected exactly one JSON-LD block`);
  for (const script of schemas) {
    try {
      const schema = JSON.parse(script[1]) as { '@graph'?: Record<string, unknown>[] };
      const graph = schema['@graph'] ?? [];
      const types = graph.map((node) => node['@type']);
      if (route === '/') {
        if (!types.includes('Organization') || !types.includes('WebSite') || !types.includes('WebPage') || !types.includes('FAQPage')) {
          failures.push('home: missing Organization, WebSite, WebPage, or FAQPage schema');
        }
        const faq = graph.find((node) => node['@type'] === 'FAQPage') as { mainEntity?: { name: string }[] } | undefined;
        if (faq?.mainEntity?.length !== homepageFaqData.length) failures.push('home: FAQ schema does not match visible FAQ count');
        const organization = graph.find((node) => node['@type'] === 'Organization');
        if (
          organization?.['@id'] !== `${productionOrigin}/#organization`
          || typeof organization.logo !== 'object'
          || typeof organization.image !== 'object'
        ) failures.push('home: Organization schema is missing its stable identity, logo, or image');
      } else if (calculatorRoutes.has(route)) {
        const application = graph.find((node) => node['@type'] === 'WebApplication');
        if (
          !types.includes('WebApplication')
          || !types.includes('BreadcrumbList')
          || application?.url !== canonical
          || typeof application?.name !== 'string'
          || !application.name
        ) failures.push(`${route}: missing or incorrect WebApplication or BreadcrumbList schema`);
        const renderedFaqCount = visibleFaqCount(html);
        const faqNodes = graph.filter((node) => node['@type'] === 'FAQPage') as Array<{ mainEntity?: unknown[] }>;
        const schemaFaqCount = faqNodes.reduce((total, node) => total + (node.mainEntity?.length ?? 0), 0);
        if (renderedFaqCount !== schemaFaqCount) {
          failures.push(`${route}: ${renderedFaqCount} visible FAQs do not match ${schemaFaqCount} FAQ schema questions`);
        }
        if (faqNodes.length > 1) failures.push(`${route}: expected no more than one FAQPage schema node`);
      } else if (route === '/articles/') {
        if (!types.includes('CollectionPage') || !types.includes('BreadcrumbList')) failures.push('articles: missing CollectionPage or BreadcrumbList schema');
      } else if (route.startsWith('/articles/')) {
        const article = articles.find((item) => toPublicPath(`/articles/${item.slug}`) === route);
        if (!article || !types.includes('Article') || !types.includes('BreadcrumbList') || !types.includes('FAQPage')) {
          failures.push(`${route}: missing Article, BreadcrumbList, or FAQPage schema`);
        } else {
          const articleNode = graph.find((node) => node['@type'] === 'Article');
          const organization = graph.find((node) => node['@type'] === 'Organization');
          if (
            !articleNode?.image
            || (articleNode.publisher as { '@id'?: string } | undefined)?.['@id'] !== `${productionOrigin}/#organization`
            || (articleNode.author as { '@id'?: string } | undefined)?.['@id'] !== `${productionOrigin}/#organization`
            || !organization?.logo
          ) failures.push(`${route}: Article identity, image, publisher, or publisher logo is incomplete`);
          const faq = graph.find((node) => node['@type'] === 'FAQPage') as { mainEntity?: { name: string }[] } | undefined;
          if (faq?.mainEntity?.length !== article.faqs.length) failures.push(`${route}: FAQ schema does not match visible FAQ count`);
          for (const item of article.faqs) if (!html.includes(item.question)) failures.push(`${route}: visible FAQ is missing ${item.question}`);
        }
      }
    } catch {
      failures.push(`${route}: invalid JSON-LD`);
    }
  }

  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/gi)) {
    const reference = match[1];
    if (!isLocalReference(reference)) continue;
    const referenceUrl = new URL(reference, toCanonicalUrl(route));
    const localFile = localFileFor(reference, route);
    const linkedPath = referenceUrl.pathname;
    const isAsset = path.extname(linkedPath) !== '';
    if (isAsset) {
      try {
        if (!localFile) throw new Error('not local');
        await fs.access(localFile);
      } catch {
        failures.push(`${route}: missing asset ${reference}`);
      }
      continue;
    }
    if (!match[0].toLowerCase().startsWith('href=')) continue;
    const href = reference;
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    // Anchor destinations (including absolute canonical URLs) are validated
    // once above while constructing the complete indexable-page graph.
  }
}

const pageByRoute = new Map(indexablePages.map((page) => [page.route, page.html]));
const timeDurationRoute = '/calculators/date-time/time-duration/';
const timeDurationText = visibleText(pageByRoute.get(timeDurationRoute) ?? '');
const requiredTimeDurationContent = [
  'duration = end instant − start instant',
  'shifts, travel, events, study sessions, and other intervals',
  'Convert each clock time to minutes after midnight on its selected date',
  'For 09:35 to 14:20, the start is 575 minutes after midnight and the end is 860 minutes after midnight',
  'The difference is 285 minutes, or 4 hours 45 minutes',
  'that is 4.75 decimal hours, not 4.45',
  'For an overnight interval such as 22:30 to 01:15, select the following date for the end time',
  'Equal entries produce zero',
  'breaks or pauses are not deducted automatically',
  'timesheet rounding policies, time-zone changes, daylight-saving transitions, or employer-specific payroll rules',
];
const obsoleteTimeDurationContent = [
  '09:00 to 17:30 on one date is 8 hours 30 minutes',
  'GUIDANCE',
];
for (const requiredText of requiredTimeDurationContent) {
  if (!timeDurationText.includes(requiredText)) {
    failures.push(`${timeDurationRoute}: production HTML is missing required calculator-specific content: ${requiredText}`);
  }
}
for (const obsoleteText of obsoleteTimeDurationContent) {
  if (timeDurationText.toLowerCase().includes(obsoleteText.toLowerCase())) {
    failures.push(`${timeDurationRoute}: production HTML still contains obsolete content: ${obsoleteText}`);
  }
}
if (/<div class="eyebrow">PRACTICAL GUIDE<\/div>/i.test(pageByRoute.get(timeDurationRoute) ?? '')) {
  failures.push(`${timeDurationRoute}: production HTML still contains obsolete content: PRACTICAL GUIDE section`);
}
for (const phrase of forbiddenBoilerplate) {
  if (timeDurationText.toLowerCase().includes(phrase.toLowerCase())) {
    failures.push(`${timeDurationRoute}: production HTML contains forbidden boilerplate: ${phrase}`);
  }
}

const trustRoutes = ['/contact/', '/about/', '/methodology/'] as const;
for (const route of trustRoutes) {
  const html = pageByRoute.get(route) ?? '';
  const text = visibleText(html);
  if (!html) failures.push(`${route}: missing production HTML`);
  if (/\bmailto:/i.test(html) || /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text)) {
    failures.push(`${route}: exposes a public email address instead of the established contact-form channel`);
  }
}
const contactHtml = pageByRoute.get('/contact/') ?? '';
if (!/<form\b/i.test(contactHtml)) failures.push('/contact/: missing public support form');
for (const route of ['/about/', '/methodology/'] as const) {
  const html = pageByRoute.get(route) ?? '';
  if (!/contact form/i.test(visibleText(html)) || !/href="\/contact\/?"/i.test(html)) {
    failures.push(`${route}: does not consistently direct public support to the contact form`);
  }
}

const inboundCounts = new Map(publicRoutes.map((route) => [route, 0]));
for (const [source, targets] of internalLinkGraph) {
  for (const target of targets) {
    if (target !== source) inboundCounts.set(target, (inboundCounts.get(target) ?? 0) + 1);
  }
}
for (const [route, inbound] of inboundCounts) {
  if (inbound === 0 && !intentionalZeroInboundRoutes.has(normalizeRoutePath(route))) {
    failures.push(`${route}: zero-inbound orphan in the rendered indexable-page graph`);
  }
}
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const definition of advancedCalculatorDefinitions) {
  const route = toPublicPath(definition.href);
  const html = pageByRoute.get(route);
  const relatedMarkup = html?.match(/<div class="related-tools">([\s\S]*?)<\/div><\/aside>/i)?.[1];
  if (!html || !relatedMarkup) {
    failures.push(`${route}: missing related tools section`);
    continue;
  }
  for (const href of definition.relatedRoutes) {
    const tool = publishedTools.find((candidate) => candidate.href === href);
    if (!tool) {
      failures.push(`${route}: related route is not a published tool: ${href}`);
      continue;
    }
    const publicHref = toPublicPath(href);
    const link = relatedMarkup.match(new RegExp(`<a\\b[^>]*href="${escapeRegExp(publicHref)}"[^>]*>([\\s\\S]*?)<\\/a>`, 'i'));
    if (!link) {
      failures.push(`${route}: related published tool is not rendered: ${href}`);
    } else if (visibleText(link[1]) !== tool.name) {
      failures.push(`${route}: related link ${href} must use the readable published tool name`);
    }
  }
}
for (const tool of localTools) {
  const route = toPublicPath(tool.href);
  if (!pageByRoute.has(route)) failures.push(`${route}: catalog calculator is missing prerendered HTML`);
  const discoveryRoute = tool.categorySlug === 'construction' ? '/home-construction/' : toPublicPath(`/category/${tool.categorySlug}`);
  const discoveryHtml = pageByRoute.get(discoveryRoute);
  if (!discoveryHtml || !discoveryHtml.includes(`href="${toPublicPath(tool.href)}"`)) {
    failures.push(`${route}: calculator is orphaned from its category or hub page`);
  }
  if ((inboundCounts.get(route) ?? 0) === 0) {
    failures.push(`${route}: calculator has no inbound discovery in rendered HTML`);
  }
  const contextualToolTargets = [...(internalLinkGraph.get(route) ?? [])]
    .filter((target) => target !== route && calculatorRoutes.has(target));
  if (contextualToolTargets.length < 2) {
    failures.push(`${route}: calculator has ${contextualToolTargets.length} outbound contextual tool links; at least 2 required`);
  }
}
const exactProse = new Map<string, Array<{ route: string; text: string }>>();
for (const block of calculatorProseBlocks) {
  if (isAllowedSharedProse(block.text) || wordCount(block.text) < 16) continue;
  const normalized = normalizeProse(block.text);
  const matches = exactProse.get(normalized) ?? [];
  matches.push(block);
  exactProse.set(normalized, matches);
}
for (const matches of exactProse.values()) {
  const routes = [...new Set(matches.map((match) => match.route))];
  if (routes.length > 1) {
    failures.push(`duplicate calculator prose across ${routes.join(', ')}: "${matches[0].text.slice(0, 120)}"`);
  }
  const perRoute = new Map<string, number>();
  for (const match of matches) perRoute.set(match.route, (perRoute.get(match.route) ?? 0) + 1);
  for (const [route, repetitions] of perRoute) {
    if (repetitions > 1) failures.push(`${route}: repeats the same educational paragraph ${repetitions} times`);
  }
}
const longBlocks = calculatorProseBlocks.filter((block) => !isAllowedSharedProse(block.text) && wordCount(block.text) >= 40);
for (let left = 0; left < longBlocks.length; left += 1) {
  const a = longBlocks[left];
  const aShingles = proseShingles(a.text);
  for (let right = left + 1; right < longBlocks.length; right += 1) {
    const b = longBlocks[right];
    if (a.route === b.route) continue;
    const bShingles = proseShingles(b.text);
    const intersection = [...aShingles].filter((shingle) => bShingles.has(shingle)).length;
    const union = new Set([...aShingles, ...bShingles]).size;
    const similarity = union ? intersection / union : 0;
    if (similarity >= 0.85) {
      failures.push(`near-duplicate calculator prose (${similarity.toFixed(2)}) across ${a.route} and ${b.route}: "${a.text.slice(0, 120)}"`);
    }
  }
}
for (const slug of Object.keys(expandedCalculatorContent)) {
  const tool = publishedTools.find((item) => item.slug === slug);
  const html = tool ? pageByRoute.get(toPublicPath(tool.href)) : undefined;
  if (!tool || !html) {
    failures.push(`expanded calculator content: missing published route for ${slug}`);
    continue;
  }
  if (educationalProseBlocks(html).length < 4) failures.push(`${tool.href}: expanded guide lacks substantive calculator-specific sections`);
}
for (const slug of Object.keys(focusedConstructionContent)) {
  const tool = publishedTools.find((item) => item.slug === slug);
  const html = tool ? pageByRoute.get(toPublicPath(tool.href)) : undefined;
  if (!tool || !html) {
    failures.push(`focused construction content: missing published route for ${slug}`);
    continue;
  }
  if (educationalProseBlocks(html).length < 6) failures.push(`${tool.href}: focused construction guide lacks substantive calculator-specific sections`);
}
for (const slug of Object.keys(categoryContent)) {
  const route = toPublicPath(`/category/${slug}`);
  const html = pageByRoute.get(route);
  if (!html) {
    failures.push(`category content: missing published route for ${slug}`);
    continue;
  }
  const main = value(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const words = wordCount(visibleText(main));
  if (words < 500) failures.push(`${route}: main content has ${words} words; 500 required`);
}

const homeHtml = await fs.readFile(outputFile('/'), 'utf8');
for (const category of localCategories) {
  const destination = toPublicPath(category.slug === 'construction' ? '/home-construction' : `/category/${category.slug}`);
  if (!homeHtml.includes(`href="${destination}"`)) {
    failures.push(`homepage/footer discovery is missing ${category.name}: ${destination}`);
  }
}
if (/\b51\s+(?:published\s+)?tools?\b|\b9\s+(?:active\s+)?categories?\b/i.test(visibleText(homeHtml))) {
  failures.push('homepage contains a stale legacy inventory total');
}
const initialJavaScript = localAssetPaths(homeHtml, 'js');
const initialJavaScriptBytes = (await Promise.all(
  initialJavaScript.map((asset) => fs.stat(path.join(output, asset.slice(1))).then((stat) => stat.size)),
)).reduce((total, size) => total + size, 0);
if (initialJavaScriptBytes > 530_000) {
  failures.push(`performance: initial JavaScript is ${initialJavaScriptBytes} bytes; 530000-byte budget exceeded`);
}

const globalCss = localAssetPaths(homeHtml, 'css');
const globalCssBytes = (await Promise.all(
  globalCss.map((asset) => fs.stat(path.join(output, asset.slice(1))).then((stat) => stat.size)),
)).reduce((total, size) => total + size, 0);
if (globalCssBytes > 150_000) {
  failures.push(`performance: global CSS is ${globalCssBytes} bytes; 150000-byte budget exceeded`);
}

for (const [route, marker] of [
  ['/articles', 'ArticlePages-'],
  ['/privacy', 'TrustPages-'],
  ['/home-construction', 'ConstructionPages-'],
  ['/calculators/finance/loan', 'advanced-calculator-pages-'],
  ['/calculators/math/average', 'advanced-calculator-pages-'],
  ['/calculators/technology/bandwidth', 'advanced-calculator-pages-'],
  ['/calculators/math/binary', 'advanced-calculator-pages-'],
  ['/calculators/health/bac', 'advanced-calculator-pages-'],
  ['/calculators/automotive/mileage', 'advanced-calculator-pages-'],
] as const) {
  const html = await fs.readFile(outputFile(route), 'utf8');
  const routeCss = localAssetPaths(html, 'css');
  if (!routeCss.some((asset) => asset.includes(marker))) {
    failures.push(`${route}: prerendered HTML is missing its route stylesheet`);
  }
}
if (localAssetPaths(homeHtml, 'css').some((asset) => /(?:ArticlePages|TrustPages|PrivateApp|construction-pages|advanced-calculator-pages)-/.test(asset))) {
  failures.push('performance: homepage eagerly loads route-only CSS');
}

const notFound = await fs.readFile(path.join(output, '404.html'), 'utf8');
if (!notFound.includes('noindex, follow')) failures.push('404.html: missing noindex, follow directive');
if (count(notFound, /<h1[\s>]/gi) !== 1) failures.push('404.html: expected exactly one H1');
if (!notFound.includes('FigureNest') || !notFound.includes('Search the toolkit')) failures.push('404.html: missing branded recovery content');
if (value(notFound, /<link rel="canonical" href="([^"]+)"/i) !== toCanonicalUrl('/404-not-found')) failures.push('404.html: incorrect canonical');
if (notFound.includes(ADSENSE_SCRIPT_URL)) failures.push('404.html: AdSense loader must not be present');

for (const privateRoute of ['sign-in', 'sign-up', 'control-center']) {
  const privateHtml = await fs.readFile(path.join(output, privateRoute, 'index.html'), 'utf8');
  if (privateHtml.includes(ADSENSE_SCRIPT_URL)) failures.push(`${privateRoute}: AdSense loader must not be present`);
  if (!privateHtml.includes('noindex, nofollow')) failures.push(`${privateRoute}: missing noindex directive`);
  if (!localAssetPaths(privateHtml, 'css').some((asset) => asset.includes('PrivateApp-'))) {
    failures.push(`${privateRoute}: prerendered HTML is missing private route CSS`);
  }
}

const legacyConstruction = await fs.readFile(path.join(output, 'category/construction/index.html'), 'utf8');
if (!legacyConstruction.includes('noindex, nofollow')) failures.push('legacy construction redirect: missing noindex directive');
if (value(legacyConstruction, /<link rel="canonical" href="([^"]+)"/i) !== toCanonicalUrl('/home-construction')) {
  failures.push('legacy construction redirect: incorrect canonical');
}
if (value(legacyConstruction, /<meta http-equiv="refresh" content="([^"]+)"/i) !== '0;url=/home-construction/') {
  failures.push('legacy construction redirect: missing static redirect');
}
if (!legacyConstruction.includes('window.location.replace("/home-construction/" + window.location.search + window.location.hash)')) {
  failures.push('legacy construction redirect: query-preserving browser redirect is missing');
}
if (!legacyConstruction.includes('<div id="root"></div><noscript>')) {
  failures.push('legacy construction redirect: fallback is not hydration-safe');
}
if (routeSet.has('/category/construction/')) failures.push('legacy construction redirect: must not appear in public route inventory');

const sitemap = await fs.readFile(path.join(output, 'sitemap.xml'), 'utf8');
const sitemapEntries = [...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><\/url>/g)];
const sitemapUrls = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
if (publicRoutes.length !== expectedSitemapUrlCount) {
  failures.push(`route inventory: expected ${expectedSitemapUrlCount} public routes, found ${publicRoutes.length}`);
}
if (sitemapUrls.length !== expectedSitemapUrlCount) failures.push(`sitemap: expected exactly ${expectedSitemapUrlCount} URLs, found ${sitemapUrls.length}`);
if (sitemapEntries.length !== sitemapUrls.length) failures.push('sitemap: every URL must include a parseable lastmod entry');
if (new Set(sitemapUrls).size !== sitemapUrls.length) failures.push('sitemap: duplicate URLs');
if (sitemapUrls.some((url) => /\/(?:api|admin|account|auth|internal|private|control-center|sign-in|sign-up)(?:\/|$)/.test(url))) {
  failures.push('sitemap: private route leaked into the public sitemap');
}
if (sitemapEntries.some((match) => Number.isNaN(Date.parse(`${match[2]}T00:00:00Z`)))) failures.push('sitemap: an invalid lastmod date was generated');
for (const trustRoute of ['/about', '/contact', '/privacy', '/cookies', '/terms', '/disclaimer', '/methodology']) {
  const entry = sitemapEntries.find((match) => match[1] === toCanonicalUrl(trustRoute));
  if (entry?.[2] !== '2026-09-01') failures.push(`sitemap: ${trustRoute} is missing its content update date`);
}
for (const route of publicRoutes) {
  const url = toCanonicalUrl(route);
  if (!sitemapUrls.includes(url)) failures.push(`sitemap: missing ${url}`);
}
for (const sitemapUrl of sitemapUrls) {
  try {
    const parsed = new URL(sitemapUrl);
    if (parsed.origin !== productionOrigin) {
      failures.push(`sitemap: URL is not on the production origin: ${sitemapUrl}`);
      continue;
    }
    if (parsed.search || parsed.hash) failures.push(`sitemap: URL must not include a query or fragment: ${sitemapUrl}`);
    const route = toPublicPath(parsed.pathname);
    if (!routeSet.has(route)) {
      failures.push(`sitemap: URL does not map to a public route: ${sitemapUrl}`);
      continue;
    }
    if (toCanonicalUrl(route) !== sitemapUrl) failures.push(`sitemap: URL is not canonical: ${sitemapUrl}`);
    try {
      await fs.access(outputFile(route));
    } catch {
      failures.push(`sitemap: route-specific HTML is missing for ${sitemapUrl}`);
    }
  } catch {
    failures.push(`sitemap: invalid URL ${sitemapUrl}`);
  }
}

const robots = await fs.readFile(path.join(output, 'robots.txt'), 'utf8');
const requiredRobotDirectives = [
  'Allow: /',
  'Disallow: /api/',
  'Disallow: /admin/',
  'Disallow: /account/',
  'Disallow: /auth/',
  'Disallow: /internal/',
  'Disallow: /private/',
  'Disallow: /control-center/',
  'Disallow: /sign-in/',
  'Disallow: /sign-up/',
  `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
];
if (requiredRobotDirectives.some((directive) => !robots.includes(directive))) {
  failures.push('robots.txt: incorrect crawl or sitemap directive');
}
for (const obsoletePath of legacyRedirectPaths) {
  const escapedPath = obsoletePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp(`^\\s*Disallow:\\s*${escapedPath}(?:/)?\\s*$`, 'm').test(robots)) {
    failures.push(`robots.txt: obsolete redirect path is blocked: ${obsoletePath}`);
  }
  if (sitemapUrls.some((url) => new URL(url).pathname === obsoletePath)) {
    failures.push(`sitemap: obsolete redirect path is listed: ${obsoletePath}`);
  }
}

const adsTxt = await fs.readFile(path.join(output, 'ads.txt'), 'utf8');
if (adsTxt.trim() !== ADSENSE_ADS_TXT_RECORD) {
  failures.push('ads.txt: incorrect or missing Google AdSense authorization record');
}

const requiredOutputAssets = [
  'robots.txt',
  'sitemap.xml',
  'ads.txt',
  '404.html',
  'favicon.svg',
  'favicon.ico',
  'favicon-16.png',
  'favicon-32.png',
  'favicon-64.png',
  'figurenest-icon-96.png',
  'figurenest-logo.svg',
  'figurenest-icon-mono.svg',
  'apple-touch-icon.png',
  'manifest.webmanifest',
  'site.webmanifest',
  'pwa-192.png',
  'pwa-512.png',
  'pwa-maskable-512.png',
  'pwa-maskable.svg',
  'social/figurenest-social-card.png',
  'social/figurenest-social-card.svg',
  'service-worker.js',
  'offline.html',
];
for (const asset of requiredOutputAssets) {
  try {
    await fs.access(path.join(output, asset));
  } catch {
    failures.push(`required output asset is missing: ${asset}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Built-site audit passed: ${publicRoutes.length} indexable pages, ${localTools.length} directory tool guides checked for discovery plus ${publishedTools.length - localTools.length} indexable converter hub, ${Object.keys(categoryContent).length} expanded categories, and the custom 404`);