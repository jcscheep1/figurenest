import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { catalogCategories, catalogTools } from '../../../api-server/src/routes/catalog';
import { constructionTools } from './construction';
import { canonicalToolHref, localCategories, localTools, publishedToolCount, publishedTools } from './catalog';
import { getSeoForPath, publicRouteKeys, renderSeoHead, SOCIAL_IMAGE_ALT, SOCIAL_IMAGE_URL } from './seo';
import { ADSENSE_CLIENT_ID, ADSENSE_SCRIPT_URL } from './adsense';
import { isCanonicalHostname, normalizeRoutePath, toCanonicalUrl, toPublicPath } from './public-url';
import { getRequestRedirect } from './redirects';
import { converterCalculatorContent, converterSlugs } from './converter-calculators';
import { businessCalculatorContent, businessCalculatorSlugs } from './business-calculators';
import { automotiveCalculatorContent, automotiveCalculatorSlugs } from './automotive-calculators';
import { articles } from './articles';
import { homepageArticlePreviews, homepageFaqData } from './homepage-content';
import { categoryContent } from './category-content';
import { isLikelyIndexableRoute } from './route-policy';
import { crossCategoryToolComplements, getRelatedTools, relatedToolGraph } from './related-tools';

const artifactRoot = new URL('../../', import.meta.url);
const sitemap = fs.readFileSync(new URL('public/sitemap.xml', artifactRoot), 'utf8');
const webManifest = JSON.parse(fs.readFileSync(new URL('public/manifest.webmanifest', artifactRoot), 'utf8')) as {
  name: string;
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  icons: { src: string; sizes: string; purpose: string }[];
};
const serviceWorker = fs.readFileSync(new URL('public/service-worker.js', artifactRoot), 'utf8');
const sitemapPaths = [...sitemap.matchAll(/<loc>https:\/\/figurenest\.com([^<]*)<\/loc>/g)].map((match) => match[1] || '/');

const comparableTool = (item: typeof localTools[number]) => ({
  slug: item.slug,
  name: item.name,
  description: item.description,
  category: item.category,
  categorySlug: item.categorySlug,
  href: item.href,
  featured: item.featured,
  lastUpdated: item.lastUpdated,
});

const comparableCategory = (item: typeof localCategories[number]) => ({
  slug: item.slug,
  name: item.name,
  description: item.description,
  accent: item.accent,
  toolCount: item.toolCount,
});

test('API and local fallback catalogs expose the same published tools', () => {
  const local = localTools.map(comparableTool).sort((a, b) => a.slug.localeCompare(b.slug));
  const api = catalogTools.map(comparableTool).sort((a, b) => a.slug.localeCompare(b.slug));
  assert.deepEqual(local, api);
});

test('API and local fallback catalogs expose the same non-empty categories', () => {
  const local = localCategories.map(comparableCategory).sort((a, b) => a.slug.localeCompare(b.slug));
  const api = catalogCategories.map(comparableCategory).sort((a, b) => a.slug.localeCompare(b.slug));
  assert.deepEqual(local, api);
  assert.ok(local.every((category) => category.toolCount > 0));
});

test('every public non-construction category has substantive visible guide content and FAQ schema', () => {
  for (const category of localCategories.filter((item) => item.slug !== 'construction')) {
    const content = categoryContent[category.slug as keyof typeof categoryContent];
    assert.ok(content, `${category.slug} is missing category guide content`);
    assert.ok(content.introduction.length >= 2, `${category.slug} needs a page-specific introduction`);
    assert.ok(content.questionsAnswered.length >= 3, `${category.slug} needs questions answered`);
    assert.ok(content.toolDescriptions.length > 0, `${category.slug} needs tool descriptions`);
    assert.ok(content.choosingTools.length >= 2, `${category.slug} needs choosing guidance`);
    assert.ok(content.unitCurrencyGuidance.length >= 1, `${category.slug} needs unit or safety guidance`);
    assert.ok(content.faqs.length >= 4, `${category.slug} needs visible FAQs`);
    const schema = JSON.stringify(getSeoForPath(`/category/${category.slug}`).schema);
    assert.match(schema, /FAQPage/, `${category.slug} is missing FAQ schema`);
    for (const faq of content.faqs) {
      assert.ok(schema.includes(faq.question), `${category.slug} FAQ schema is missing ${faq.question}`);
      assert.ok(schema.includes(faq.answer), `${category.slug} FAQ schema answer is missing`);
    }
  }
});

test('new category guides describe every published tool in their category', () => {
  const expandedCategories = ['electrical', 'technology', 'science-engineering', 'health', 'education'] as const;
  for (const slug of expandedCategories) {
    const described = new Set(categoryContent[slug].toolDescriptions.map((item) => item.slug));
    for (const tool of publishedTools.filter((item) => item.categorySlug === slug)) {
      assert.ok(described.has(tool.slug), `${slug} is missing a description for ${tool.slug}`);
    }
  }
});

test('category guide tool descriptions use published tool identities', () => {
  const publishedBySlug = new Map(publishedTools.map((tool) => [tool.slug, tool]));
  for (const [categorySlug, content] of Object.entries(categoryContent)) {
    for (const item of content.toolDescriptions) {
      const tool = publishedBySlug.get(item.slug);
      assert.ok(tool, `${categorySlug} describes an unpublished tool: ${item.slug}`);
      assert.equal(tool.slug, item.slug);
      assert.ok(tool.name.length > 0, `${item.slug} needs a published display name`);
    }
  }

  const categoryGuideSource = fs.readFileSync(new URL('src/components/SeoEducationalContent.tsx', artifactRoot), 'utf8');
  assert.match(categoryGuideSource, /publishedToolNames\.get\(item\.slug\)/);
  assert.doesNotMatch(categoryGuideSource, /item\.slug\.split\('-'\)/);
});

test('homepage and finance category metadata describe the current catalogue', () => {
  const home = getSeoForPath('/');
  const finance = getSeoForPath('/category/finance');
  assert.match(home.description, /free online calculators and converters/i);
  assert.doesNotMatch(home.description, /mortgage, loan payment, compound interest/i);
  assert.match(finance.description, /loan payments, interest, mortgage payoff, budgets, retirement/i);
});

test('every public meta description is complete, unique, and snippet-safe', () => {
  const descriptions = publicRouteKeys.map((path) => {
    const description = getSeoForPath(path).description;
    assert.ok(description.length >= 70 && description.length <= 160, `${path} has unsafe description length`);
    assert.match(description, /[.!?]$/, `${path} has an incomplete meta description`);
    assert.doesNotMatch(description, /…$/, `${path} has a visibly truncated meta description`);
    return description;
  });
  assert.equal(new Set(descriptions).size, descriptions.length);
});

test('all site-wide tool and category counts derive from published tool pages', () => {
  const canonicalHrefs = localTools.map(canonicalToolHref);
  assert.equal(publishedToolCount, 162);
  assert.equal(publishedToolCount, new Set(canonicalHrefs).size);
  assert.equal(localTools.length, 162);
  assert.ok(!localTools.some((tool) => tool.slug === 'unit'));
  assert.equal(localCategories.reduce((total, category) => total + category.toolCount, 0), publishedToolCount);
  for (const category of localCategories) {
    assert.equal(category.toolCount, new Set(localTools.filter((tool) => tool.categorySlug === category.slug).map(canonicalToolHref)).size, `${category.name} has a stale published-tool count`);
  }
  assert.equal(localCategories.find((category) => category.slug === 'automotive')?.toolCount, 8);
});

test('every catalog category has one indexable discovery route in the sitemap', () => {
  const discoveryRoutes = localCategories.map((category) => category.slug === 'construction' ? '/home-construction' : `/category/${category.slug}`);
  assert.equal(new Set(discoveryRoutes).size, localCategories.length);
  for (const route of discoveryRoutes) {
    assert.equal(isLikelyIndexableRoute(route), true, `${route} is missing from public route policy`);
    assert.ok(publicRouteKeys.includes(route), `${route} is missing from public route inventory`);
    assert.ok(sitemapPaths.includes(toPublicPath(route)), `${route} is missing from the sitemap`);
  }
  assert.ok(!sitemapPaths.includes('/category/construction/'));
});

test('homepage inventory metadata is dynamic and contains no stale legacy totals', () => {
  const home = getSeoForPath('/');
  assert.match(home.description, new RegExp(`\\b${publishedToolCount}\\b`));
  assert.match(home.description, new RegExp(`\\b${localCategories.length}\\b`));
  assert.doesNotMatch(`${home.title} ${home.description} ${home.h1}`, /\b51\b|\b9 categories?\b/i);
});

test('tool slugs, names, descriptions, and destinations are unique', () => {
  for (const values of [localTools.map((item) => item.slug), localTools.map((item) => item.name), localTools.map((item) => item.description), localTools.map((item) => item.href)]) assert.equal(new Set(values).size, values.length);
});

test('tool metadata has no malformed, generic, or duplicated descriptions', () => {
  const descriptions = publicRouteKeys.map((path) => getSeoForPath(path).description);
  assert.equal(new Set(descriptions).size, descriptions.length);
  for (const description of descriptions) {
    assert.doesNotMatch(description, /Calculation method:/);
    assert.doesNotMatch(description, /Enter the listed values to see the calculation method, assumptions, and practical limits/);
    assert.doesNotMatch(description, /…$/);
    assert.match(description, /[.!?]$/);
  }
});

test('canonical related-tool graph covers every published tool with reciprocal semantic links', () => {
  assert.equal(publishedTools.length, 163);
  assert.equal(relatedToolGraph.size, publishedTools.length);
  const publishedSlugs = new Set(publishedTools.map((tool) => tool.slug));
  const explicitCrossCategoryPairs = new Set(crossCategoryToolComplements.flatMap(([left, right]) => [`${left}:${right}`, `${right}:${left}`]));
  for (const [left, right] of crossCategoryToolComplements) {
    assert.ok(publishedSlugs.has(left), `cross-category complement source is unpublished: ${left}`);
    assert.ok(publishedSlugs.has(right), `cross-category complement target is unpublished: ${right}`);
  }
  const inbound = new Map(publishedTools.map((tool) => [tool.slug, 0]));
  for (const source of publishedTools) {
    const related = getRelatedTools(source.slug);
    assert.ok(related.length >= 2, `${source.slug} needs at least two contextual links`);
    assert.equal(new Set(related.map((tool) => tool.slug)).size, related.length, `${source.slug} has duplicate links`);
    for (const target of related) {
      assert.ok(publishedSlugs.has(target.slug), `${source.slug} links to unpublished ${target.slug}`);
      assert.notEqual(target.slug, source.slug, `${source.slug} links to itself`);
      assert.ok(target.categorySlug === source.categorySlug || explicitCrossCategoryPairs.has(`${source.slug}:${target.slug}`), `${source.slug} has an uncurated cross-category link to ${target.slug}`);
      assert.ok(relatedToolGraph.get(target.slug)?.includes(source.slug), `${source.slug} -> ${target.slug} is not reciprocal`);
      inbound.set(target.slug, (inbound.get(target.slug) ?? 0) + 1);
    }
  }
  for (const [slug, count] of inbound) assert.ok(count > 0, `${slug} has no inbound contextual discovery`);
  assert.deepEqual(getRelatedTools('not-published'), []);
});

test('voltage drop has one electrical canonical route and no unpublished math duplicate', () => {
  const voltageDrop = publishedTools.find((tool) => tool.slug === 'voltage-drop');
  assert.equal(voltageDrop?.category, 'Electrical');
  assert.equal(voltageDrop?.categorySlug, 'electrical');
  assert.equal(voltageDrop?.href, '/calculators/electrical/voltage-drop');
  assert.ok(publicRouteKeys.includes('/calculators/electrical/voltage-drop'));
  assert.ok(!publicRouteKeys.includes('/calculators/math/voltage-drop'));
  assert.ok(sitemapPaths.includes('/calculators/electrical/voltage-drop/'));
  assert.ok(!sitemapPaths.includes('/calculators/math/voltage-drop/'));
  const seo = getSeoForPath('/calculators/electrical/voltage-drop');
  assert.equal(seo.canonical, 'https://figurenest.com/calculators/electrical/voltage-drop/');
  assert.equal(seo.h1, 'Voltage Drop Calculator');
});

test('public URLs use a stable trailing-slash convention without changing route keys', () => {
  assert.equal(normalizeRoutePath('/about/?source=test#section'), '/about');
  assert.equal(toPublicPath('/about?source=test#section'), '/about/?source=test#section');
  assert.equal(toPublicPath('/'), '/');
  assert.equal(toCanonicalUrl('/about'), 'https://figurenest.com/about/');
});

test('only the canonical production hostname is indexable', () => {
  assert.equal(isCanonicalHostname('figurenest.com'), true);
  assert.equal(isCanonicalHostname('FigureNest.com'), true);
  assert.equal(isCanonicalHostname('www.figurenest.com'), false);
  assert.equal(isCanonicalHostname('figurenest.replit.app'), false);
  assert.equal(isCanonicalHostname('localhost'), false);
});

test('legacy and hostname redirects collapse into one query-preserving 301 target', () => {
  const cases = [
    ['figurenest.com', 'http:', '/calculators/finance/loan', '?utm=1', 'https://figurenest.com/calculators/finance/loan/?utm=1'],
    ['figurenest.com', 'http:', '/calculators/finance/loan/', '?utm=1', 'https://figurenest.com/calculators/finance/loan/?utm=1'],
    ['www.figurenest.com', 'http:', '/calculators/finance/loan/', '?utm=1', 'https://figurenest.com/calculators/finance/loan/?utm=1'],
    ['www.figurenest.com', 'https:', '/calculators/finance/loan/', '?utm=1', 'https://figurenest.com/calculators/finance/loan/?utm=1'],
    ['figurenest.com', 'https:', '/index.php', '?source=legacy', 'https://figurenest.com/?source=legacy'],
    ['www.figurenest.com', 'http:', '/en/', '?source=legacy', 'https://figurenest.com/?source=legacy'],
    ['figurenest.com', 'https:', '/es/', '?source=legacy', 'https://figurenest.com/?source=legacy'],
  ] as const;
  for (const [hostname, protocol, pathname, search, expected] of cases) assert.equal(getRequestRedirect({ hostname, protocol, pathname, search }), expected);
  assert.equal(getRequestRedirect({ hostname: 'figurenest.com', protocol: 'https:', pathname: '/calculators/finance/loan/' }), null);
  assert.equal(getRequestRedirect({ hostname: 'localhost', protocol: 'http:', pathname: '/index.php', search: '?local=1' }), '/?local=1');
});

test('public SEO includes one production-host-gated AdSense publisher tag after denied consent defaults', () => {
  const publicHead = renderSeoHead(getSeoForPath('/'));
  assert.equal(publicHead.split(ADSENSE_SCRIPT_URL).length - 1, 1);
  assert.equal(publicHead.split(`content="${ADSENSE_CLIENT_ID}"`).length - 1, 1);
  assert.match(publicHead, /figurenest\.com/);
  assert.match(publicHead, /www\.figurenest\.com/);
  assert.match(publicHead, /ad_storage:'denied'/);
  assert.match(publicHead, /ad_user_data:'denied'/);
  assert.match(publicHead, /ad_personalization:'denied'/);
  assert.ok(publicHead.indexOf("ad_storage:'denied'") < publicHead.indexOf(ADSENSE_SCRIPT_URL));
  const privateHead = renderSeoHead(getSeoForPath('/control-center'));
  assert.doesNotMatch(privateHead, /pagead2\.googlesyndication\.com/);
});

test('recognized private routes stay noindex without becoming 404 pages', () => {
  for (const path of ['/sign-in', '/sign-up/example', '/control-center', '/control-center/seo']) {
    const seo = getSeoForPath(path); assert.equal(seo.status, 200, path); assert.equal(seo.robots, 'noindex, nofollow', path);
  }
  assert.equal(getSeoForPath('/calculators/math/percentage').status, 404);
  assert.equal(getSeoForPath('/control-centerish').status, 404);
});

test('every SEO head uses the absolute accessible 1200 by 630 social card', () => {
  const head = renderSeoHead(getSeoForPath('/'));
  assert.match(head, new RegExp(`<meta property="og:image" content="${SOCIAL_IMAGE_URL}"`));
  assert.match(head, /<meta property="og:image:width" content="1200"/);
  assert.match(head, /<meta property="og:image:height" content="630"/);
  assert.ok(head.includes(`<meta property="og:image:alt" content="${SOCIAL_IMAGE_ALT}"`));
  assert.ok(head.includes(`<meta name="twitter:image" content="${SOCIAL_IMAGE_URL}"`));
  assert.ok(head.includes(`<meta name="twitter:image:alt" content="${SOCIAL_IMAGE_ALT}"`));
});

test('percentage and image scaling pages have distinct specific metadata', () => {
  const percentage = getSeoForPath('/calculators/finance/percentage');
  const imageScaling = getSeoForPath('/calculators/printing-design/image-scaling');
  assert.match(percentage.description, /discounts, tips, taxes/i);
  assert.match(imageScaling.description, /aspect ratio/i);
  assert.match(imageScaling.description, /scaled height/i);
  assert.notEqual(percentage.title, imageScaling.title);
  for (const seo of [percentage, imageScaling]) { assert.ok(seo.title.length <= 60); assert.ok(seo.description.length >= 150 && seo.description.length <= 160); }
});

test('PWA metadata uses the FigureNest identity without changing public routes', () => {
  assert.equal(webManifest.name, 'FigureNest'); assert.equal(webManifest.start_url, '/'); assert.equal(webManifest.scope, '/'); assert.equal(webManifest.display, 'standalone'); assert.equal(webManifest.theme_color, '#122B46');
  assert.ok(webManifest.icons.some((icon) => icon.src === './pwa-192.png' && icon.sizes === '192x192'));
  assert.ok(webManifest.icons.some((icon) => icon.src === './pwa-512.png' && icon.sizes === '512x512'));
  assert.ok(webManifest.icons.some((icon) => icon.src === './pwa-maskable-512.png' && icon.purpose === 'maskable'));
  for (const icon of webManifest.icons) assert.ok(fs.existsSync(new URL(`public/${icon.src.replace('./', '')}`, artifactRoot)), `missing PWA icon ${icon.src}`);
});

test('PWA offline behavior is network-first and bypasses private, auth, and API requests', () => {
  assert.match(serviceWorker, /request\.mode === 'navigate'/); assert.match(serviceWorker, /fetch\(request\)/); assert.match(serviceWorker, /offline\.html/); assert.match(serviceWorker, /request\.method !== 'GET'/); assert.match(serviceWorker, /url\.origin !== self\.location\.origin/); assert.match(serviceWorker, /responseCanBeCached/); assert.match(serviceWorker, /private\|no-store/);
  const listeners = new Map<string, (event: { request: Record<string, string>; respondWith: () => void }) => void>(); let networkRequests = 0;
  const workerSelf = { location: { origin: 'https://figurenest.com' }, registration: { scope: 'https://figurenest.com/' }, clients: { claim: async () => undefined }, skipWaiting: async () => undefined, addEventListener: (type: string, listener: (event: { request: Record<string, string>; respondWith: () => void }) => void) => listeners.set(type, listener) };
  vm.runInNewContext(serviceWorker, { self: workerSelf, URL, Set, Promise, console, caches: {}, fetch: () => { networkRequests += 1; throw new Error('private requests must bypass the worker'); } });
  const fetchListener = listeners.get('fetch'); assert.ok(fetchListener);
  for (const path of ['/sign-in', '/sign-up', '/control-center', '/control-center/seo', '/api/session']) { let intercepted = false; fetchListener({ request: { method: 'GET', url: `https://figurenest.com${path}`, mode: 'navigate', destination: 'document' }, respondWith: () => { intercepted = true; } }); assert.equal(intercepted, false, `${path} must bypass service-worker navigation caching`); }
  let apiImageIntercepted = false; fetchListener({ request: { method: 'GET', url: 'https://figurenest.com/api/account/avatar', mode: 'cors', destination: 'image' }, respondWith: () => { apiImageIntercepted = true; } }); assert.equal(apiImageIntercepted, false); assert.equal(networkRequests, 0);
});

test('SEO accepts legacy slash variants and redirects the retired construction category', () => {
  assert.equal(getSeoForPath('/about').canonical, 'https://figurenest.com/about/'); assert.equal(getSeoForPath('/about/').canonical, 'https://figurenest.com/about/'); const legacy = getSeoForPath('/category/construction/'); assert.equal(legacy.redirect, '/home-construction/'); assert.equal(legacy.canonical, 'https://figurenest.com/home-construction/'); assert.equal(legacy.robots, 'noindex, nofollow');
});

test('percentage change has dedicated indexable SEO and FAQ schema', () => {
  const seo = getSeoForPath('/calculators/math/percentage-increase-decrease'); assert.equal(seo.title, 'Percentage Change Calculator | FigureNest'); assert.equal(seo.canonical, 'https://figurenest.com/calculators/math/percentage-increase-decrease/'); assert.equal(seo.robots, 'index, follow'); assert.ok(seo.description.length >= 70 && seo.description.length <= 160); const schema = JSON.stringify(seo.schema); assert.match(schema, /WebApplication/); assert.match(schema, /BreadcrumbList/); assert.match(schema, /FAQPage/); assert.match(schema, /Why is percentage change undefined/);
});

test('date duration has dedicated indexable SEO and shared FAQ schema', () => {
  const seo = getSeoForPath('/calculators/date-time/date-difference'); assert.equal(seo.title, 'Date Duration Calculator | FigureNest'); assert.equal(seo.h1, 'Date Duration Calculator'); assert.equal(seo.canonical, 'https://figurenest.com/calculators/date-time/date-difference/'); assert.equal(seo.robots, 'index, follow'); assert.ok(seo.description.length >= 70 && seo.description.length <= 160); assert.match(seo.description, /exact duration/i); assert.match(seo.description, /reversed dates/i); assert.match(seo.description, /leap years/i); const schema = JSON.stringify(seo.schema); assert.match(schema, /WebApplication/); assert.match(schema, /BreadcrumbList/); assert.match(schema, /FAQPage/); assert.match(schema, /Does the calculator include the end date/);
});

test('loan, mortgage, and compound interest have distinct indexable SEO and visible FAQ schema', () => {
  const expected = [['loan', 'Loan Payment Calculator | FigureNest', 'How is a loan payment calculated'], ['mortgage', 'Mortgage Payment Calculator | FigureNest', 'What does the monthly mortgage estimate include'], ['compound-interest', 'Compound Interest Calculator | FigureNest', 'What is compound interest']] as const;
  for (const [slug, title, faqQuestion] of expected) { const path = `/calculators/finance/${slug}`; const seo = getSeoForPath(path); assert.equal(seo.title, title); assert.equal(seo.canonical, `https://figurenest.com${path}/`); assert.equal(seo.robots, 'index, follow'); assert.ok(seo.description.length >= 100 && seo.description.length <= 160); const schema = JSON.stringify(seo.schema); assert.match(schema, /WebApplication/); assert.match(schema, /BreadcrumbList/); assert.match(schema, /FAQPage/); assert.match(schema, new RegExp(faqQuestion)); }
});

test('age, working days, salary, and overtime have distinct indexable SEO and visible FAQ schema', () => {
  const expected = [
    ['/calculators/date-time/age', 'Age Calculator — Years, Months & Days | FigureNest', 'How does the calculator determine exact age'],
    ['/calculators/date-time/working-days', 'Working Days Calculator — Count Workdays | FigureNest', 'Are the start and end dates included'],
    ['/calculators/salary-work/salary', 'Salary Converter — Annual to Hourly Pay | FigureNest', 'How do I convert annual salary to hourly pay'],
    ['/calculators/salary-work/overtime', 'Overtime Pay Calculator — Time and a Half | FigureNest', 'How is overtime pay calculated'],
  ] as const;
  for (const [path, title, faqQuestion] of expected) { const seo = getSeoForPath(path); assert.equal(seo.title, title); assert.equal(seo.canonical, `https://figurenest.com${path}/`); assert.equal(seo.robots, 'index, follow'); assert.ok(seo.description.length >= 100 && seo.description.length <= 160); const schema = JSON.stringify(seo.schema); assert.match(schema, /WebApplication/); assert.match(schema, /BreadcrumbList/); assert.match(schema, /FAQPage/); assert.match(schema, new RegExp(faqQuestion)); }
});

test('core converter cluster has distinct indexable SEO and schema synchronized with visible FAQs', () => {
  for (const slug of converterSlugs) { const path = `/converters/${slug}`; const content = converterCalculatorContent[slug]; const seo = getSeoForPath(path); assert.equal(seo.title, content.seoTitle); assert.equal(seo.description, content.seoDescription); assert.equal(seo.h1, `${slug[0].toUpperCase()}${slug.slice(1)} Converter`); assert.equal(seo.canonical, `https://figurenest.com${path}/`); assert.equal(seo.robots, 'index, follow'); const schema = JSON.stringify(seo.schema); assert.match(schema, /WebApplication/); assert.match(schema, /BreadcrumbList/); assert.match(schema, /FAQPage/); for (const faq of content.faqs) { assert.ok(schema.includes(faq.question)); assert.ok(schema.includes(faq.answer)); } }
});

test('business calculator cluster has distinct indexable SEO and visible FAQ schema', () => {
  for (const slug of businessCalculatorSlugs) { const path = `/calculators/business/${slug}`; const content = businessCalculatorContent[slug]; const seo = getSeoForPath(path); assert.equal(seo.title, content.seoTitle); assert.equal(seo.description, content.seoDescription); assert.equal(seo.h1, content.title); assert.equal(seo.canonical, `https://figurenest.com${path}/`); assert.equal(seo.robots, 'index, follow'); assert.ok(sitemapPaths.includes(`${path}/`)); const schema = JSON.stringify(seo.schema); assert.match(schema, /WebApplication/); assert.match(schema, /BreadcrumbList/); assert.match(schema, /FAQPage/); for (const faq of content.faqs) { assert.ok(schema.includes(faq.question)); assert.ok(schema.includes(faq.answer)); } }
});

test('automotive energy cluster has distinct indexable SEO and visible FAQ schema', () => {
  for (const slug of automotiveCalculatorSlugs) { const path = `/calculators/automotive/${slug}`; const content = automotiveCalculatorContent[slug]; const seo = getSeoForPath(path); assert.equal(seo.title, content.seoTitle); assert.equal(seo.description, content.seoDescription); assert.equal(seo.h1, content.title); assert.equal(seo.canonical, `https://figurenest.com${path}/`); assert.equal(seo.robots, 'index, follow'); assert.ok(sitemapPaths.includes(`${path}/`)); const schema = JSON.stringify(seo.schema); assert.match(schema, /WebApplication/); assert.match(schema, /BreadcrumbList/); assert.match(schema, /FAQPage/); for (const faq of content.faqs) { assert.ok(schema.includes(faq.question)); assert.ok(schema.includes(faq.answer)); } }
});

test('percentage change and date duration remain sitemap-listed and internally discoverable', () => {
  const expected = [{ slug: 'percentage-increase-decrease', categorySlug: 'math', path: '/calculators/math/percentage-increase-decrease/' }, { slug: 'date-difference', categorySlug: 'date-time', path: '/calculators/date-time/date-difference/' }];
  for (const item of expected) { const tool = publishedTools.find((candidate) => candidate.slug === item.slug); assert.ok(tool, `${item.slug} is missing from the published catalog`); assert.equal(tool.categorySlug, item.categorySlug); assert.ok(sitemapPaths.includes(item.path), `${item.slug} is missing from the sitemap`); assert.ok(localCategories.some((category) => category.slug === item.categorySlug && category.toolCount > 0), `${item.slug} has no internally linked category`); const seo = getSeoForPath(tool.href); assert.equal(seo.robots, 'index, follow'); assert.equal(seo.canonical, toCanonicalUrl(tool.href)); }
});

test('every catalog destination matches its slug and route family', () => {
  for (const item of localTools) { const expected = item.href.startsWith('/converters/') ? `/converters/${item.slug}` : `/calculators/${item.categorySlug}/${item.slug}`; assert.equal(item.href, expected, `${item.name} has a mismatched destination`); }
});

test('construction related links all resolve to published construction tools', () => {
  const published = new Set(constructionTools.map((item) => item.slug)); for (const item of constructionTools) { assert.ok(item.related.length > 0, `${item.name} has no related links`); for (const related of item.related) assert.ok(published.has(related), `${item.name} links to missing tool ${related}`); }
});

test('sitemap exactly matches all indexable app pages', () => {
  const staticPaths = ['/', '/calculators', '/converters/unit', '/home-construction', '/about', '/contact', '/privacy', '/cookies', '/terms', '/disclaimer', '/methodology', '/articles'].map(toPublicPath); const categoryPaths = localCategories.filter((category) => category.slug !== 'construction').map((category) => toPublicPath(`/category/${category.slug}`)); const articlePaths = articles.map((article) => toPublicPath(`/articles/${article.slug}`)); const expected = [...staticPaths, ...categoryPaths, ...localTools.map((item) => toPublicPath(item.href)), ...articlePaths].sort(); assert.deepEqual([...sitemapPaths].sort(), expected); assert.equal(new Set(sitemapPaths).size, sitemapPaths.length);
});

test('every literal internal link points to an indexable route or the home search anchor', () => {
  const sourceFiles = ['src/components/FigureNestShell.tsx', 'src/pages/AppPages.tsx', 'src/pages/TrustPages.tsx', 'src/pages/ConstructionPages.tsx', 'src/pages/ArticlePages.tsx', 'src/pages/FinanceCalculatorPage.tsx']; const allowed = new Set([...sitemapPaths, '/#search']); for (const path of sourceFiles) { const source = fs.readFileSync(new URL(path, artifactRoot), 'utf8'); const hrefs = [...source.matchAll(/href="(\/[^"]*)"/g)].map((match) => match[1]); for (const href of hrefs) assert.ok(allowed.has(toPublicPath(href)), `${path} links to an unindexed or missing route: ${href}`); }
});

test('article registry is substantial, unique, connected, and metadata-safe', () => {
  assert.equal(articles.length, 9); for (const values of [articles.map((article) => article.slug), articles.map((article) => article.title), articles.map((article) => article.seoTitle), articles.map((article) => article.metaDescription)]) assert.equal(new Set(values).size, articles.length); const slugs = new Set(articles.map((article) => article.slug)); const calculatorPaths = new Set(publishedTools.map((tool) => tool.href)); for (const article of articles) { assert.ok(article.seoTitle.length <= 60, `${article.slug} title is too long`); assert.ok(article.metaDescription.length >= 70 && article.metaDescription.length <= 160, `${article.slug} description length is unsafe`); assert.ok(article.sections.length >= 4, `${article.slug} needs substantive sections`); assert.equal(article.faqs.length, 4, `${article.slug} needs four visible FAQs`); assert.ok(article.assumptions.length >= 3 && article.limitations.length >= 3 && article.nextSteps.length >= 3); assert.ok(article.sections.some((section) => section.formula), `${article.slug} needs a visible formula`); assert.ok(article.sections.some((section) => section.example), `${article.slug} needs a worked example`); for (const related of article.relatedArticles) assert.ok(slugs.has(related), `${article.slug} links to missing article ${related}`); for (const calculator of article.relatedCalculators) assert.ok(calculatorPaths.has(calculator.href), `${article.slug} links to missing calculator ${calculator.href}`); }
});

test('article worked examples match their stated formulas and rounding convention', () => {
  const fixedPayment = (principal: number, annualRate: number, payments: number) => { const periodicRate = annualRate / 12; return principal * periodicRate / (1 - (1 + periodicRate) ** -payments); }; const articleText = (slug: string) => JSON.stringify(articles.find((article) => article.slug === slug)); const mortgagePayment = fixedPayment(320_000, 0.06, 360); assert.equal(mortgagePayment.toFixed(2), '1918.56'); assert.equal((Number(mortgagePayment.toFixed(2)) * 360).toFixed(2), '690681.60'); assert.equal((Number(mortgagePayment.toFixed(2)) * 360 - 320_000).toFixed(2), '370681.60'); assert.match(articleText('mortgage-payment-basics'), /690,681\.60/); assert.match(articleText('mortgage-payment-basics'), /370,681\.60/); const loanPayment = fixedPayment(18_000, 0.072, 48); assert.equal(loanPayment.toFixed(2), '432.70'); assert.equal((Number(loanPayment.toFixed(2)) * 48).toFixed(2), '20769.60'); assert.equal((Number(loanPayment.toFixed(2)) * 48 - 18_000).toFixed(2), '2769.60'); assert.match(articleText('loan-payment-calculations'), /20,769\.60/); assert.match(articleText('loan-payment-calculations'), /2,769\.60/); const refinancingBreakEvenMonths = 4_800 / (1_850 - 1_690); assert.equal(refinancingBreakEvenMonths, 30); assert.match(articleText('refinancing-considerations'), /30 months/); const compoundBalance = 10_000 * (1 + 0.04 / 12) ** (12 * 5); assert.equal(compoundBalance.toFixed(2), '12209.97'); assert.equal((compoundBalance - 10_000).toFixed(2), '2209.97'); assert.match(articleText('compound-interest-guide'), /12,209\.97/); assert.match(articleText('compound-interest-guide'), /2,209\.97/);
});

test('article and homepage schemas stay aligned with visible FAQ registries', () => {
  const home = getSeoForPath('/'); const homeGraph = (home.schema as { '@graph': Record<string, unknown>[] })['@graph']; const homeFaq = homeGraph.find((node) => node['@type'] === 'FAQPage') as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }; assert.deepEqual(homeFaq.mainEntity.map((item) => [item.name, item.acceptedAnswer.text]), homepageFaqData.map((item) => [item.question, item.answer])); const homeOrganization = homeGraph.find((node) => node['@type'] === 'Organization') as Record<string, unknown>; assert.equal(homeOrganization['@id'], 'https://figurenest.com/#organization'); assert.ok(homeOrganization.logo); assert.ok(homeOrganization.image); const indexTypes = ((getSeoForPath('/articles').schema as { '@graph': { '@type': string }[] })['@graph']).map((node) => node['@type']); assert.ok(indexTypes.includes('CollectionPage')); assert.ok(indexTypes.includes('BreadcrumbList')); for (const article of articles) { const seo = getSeoForPath(`/articles/${article.slug}`); assert.equal(seo.title, article.seoTitle); assert.equal(seo.description, article.metaDescription); assert.equal(seo.status, 200); const graph = (seo.schema as { '@graph': Record<string, unknown>[] })['@graph']; const types = graph.map((node) => node['@type']); assert.ok(types.includes('Article')); assert.ok(types.includes('BreadcrumbList')); assert.ok(types.includes('FAQPage')); assert.ok(types.includes('Organization')); const articleSchema = graph.find((node) => node['@type'] === 'Article') as Record<string, unknown>; assert.ok(articleSchema.image); assert.deepEqual(articleSchema.publisher, { '@id': 'https://figurenest.com/#organization' }); assert.deepEqual(articleSchema.author, { '@id': 'https://figurenest.com/#organization' }); const faq = graph.find((node) => node['@type'] === 'FAQPage') as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }; assert.deepEqual(faq.mainEntity.map((item) => [item.name, item.acceptedAnswer.text]), article.faqs.map((item) => [item.question, item.answer])); } assert.equal(getSeoForPath('/articles/not-a-real-guide').status, 404); assert.equal(getSeoForPath('/articles/not-a-real-guide').robots, 'noindex, follow');
});

test('homepage guide previews cover the complete article collection', () => { assert.deepEqual(homepageArticlePreviews.map((preview) => preview.href).sort(), articles.map((article) => `/articles/${article.slug}`).sort()); });

test('user-facing sources contain no retired demo or preview content', () => {
  const files = ['src/App.tsx', 'src/components/FigureNestShell.tsx', 'src/pages/AppPages.tsx', 'src/pages/ConstructionPages.tsx', 'src/pages/ArticlePages.tsx', 'src/lib/articles.ts', 'src/lib/homepage-content.ts', 'src/lib/catalog.ts', 'src/lib/seo.ts', 'index.html', 'public/manifest.webmanifest', 'public/sitemap.xml', '../api-server/src/routes/catalog.ts']; const content = files.map((path) => fs.readFileSync(new URL(path, artifactRoot), 'utf8')).join('\n'); for (const retired of [/READ-ONLY PREVIEW/i, /ADMIN FOUNDATION/i, /calculations today/i, /EST\. 2025/i, /2025-02-18/i, /12847/, /href="\/admin"/i, /category\/(?:health-fitness|travel|everyday-tools)/i, new RegExp(['s', 'olve', 'ora'].join(''), 'i')]) assert.doesNotMatch(content, retired);
});