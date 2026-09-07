import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localCategories, publishedTools } from '../src/lib/catalog';
import { publicRoutes, SITE_ORIGIN } from '../src/lib/seo';
import { normalizeRoutePath, toCanonicalUrl } from '../src/lib/public-url';
import { articles } from '../src/lib/articles';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const monthNumbers: Record<string, string> = {
  January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
  July: '07', August: '08', September: '09', October: '10', November: '11', December: '12',
};

const lastmodFor = (value: string) => {
  const match = /^([A-Z][a-z]+) (\d{4})$/.exec(value);
  if (!match || !monthNumbers[match[1]]) throw new Error(`Invalid catalog lastUpdated value: ${value}`);
  return `${match[2]}-${monthNumbers[match[1]]}-01`;
};

const catalogLastmod = new Map(publishedTools.map((tool) => [tool.href, lastmodFor(tool.lastUpdated)]));
const latestArticleModified = articles.map((article) => article.modified).sort().at(-1);
if (!latestArticleModified) throw new Error('Cannot assign an articles lastmod without published articles');
const contentLastmod = new Map<string, string>([
  ['/', '2026-09-01'],
  ['/calculators', '2026-09-03'],
  ['/articles', latestArticleModified],
  ['/about', '2026-09-01'],
  ['/contact', '2026-09-01'],
  ['/privacy', '2026-09-01'],
  ['/cookies', '2026-09-01'],
  ['/terms', '2026-09-01'],
  ['/disclaimer', '2026-09-01'],
  ['/methodology', '2026-09-01'],
  ...articles.map((article) => [`/articles/${article.slug}`, article.modified] as const),
]);
for (const category of localCategories) {
  const categoryTools = publishedTools.filter((tool) => tool.categorySlug === category.slug);
  const latest = categoryTools.map((tool) => catalogLastmod.get(tool.href)!).sort().at(-1);
  if (!latest) throw new Error(`Cannot assign a lastmod to empty category: ${category.slug}`);
  catalogLastmod.set(category.slug === 'construction' ? '/home-construction' : `/category/${category.slug}`, latest);
}

const urls = publicRoutes.map((route) => {
  const routeKey = normalizeRoutePath(route);
  const lastmod = contentLastmod.get(routeKey) ?? catalogLastmod.get(routeKey);
  if (!lastmod) throw new Error(`No source-owned lastmod is defined for public route: ${routeKey}`);
  return `  <url><loc>${toCanonicalUrl(route)}</loc><lastmod>${lastmod}</lastmod></url>`;
}).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /account/\nDisallow: /auth/\nDisallow: /internal/\nDisallow: /private/\nDisallow: /control-center/\nDisallow: /sign-in/\nDisallow: /sign-up/\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;

await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemap);
await fs.writeFile(path.join(publicDir, 'robots.txt'), robots);
console.log(`Generated sitemap.xml and robots.txt for ${publicRoutes.length} routes`);