import { articles, getArticle } from './articles';
import { localCategories, publishedTools } from './catalog';
import { normalizeRoutePath, toCanonicalUrl } from './public-url';

export type BreadcrumbItem = {
  label: string;
  path: string;
};

const staticLabels: Record<string, string> = {
  '/home-construction': 'Home & Construction',
  '/articles': 'Articles',
  '/calculators': 'All Calculators',
  '/about': 'About FigureNest',
  '/contact': 'Contact FigureNest',
  '/privacy': 'Privacy Policy',
  '/cookies': 'Cookie Policy',
  '/terms': 'Terms of Use',
  '/disclaimer': 'Calculator Disclaimer',
  '/methodology': 'Editorial & Calculator Methodology',
};

export function getBreadcrumbItems(inputPath: string): BreadcrumbItem[] {
  const path = normalizeRoutePath(inputPath);
  if (path === '/') return [];

  const home: BreadcrumbItem = { label: 'Home', path: '/' };
  const staticLabel = staticLabels[path];
  if (staticLabel) return [home, { label: staticLabel, path }];

  const category = localCategories.find((item) => path === `/category/${item.slug}`);
  if (category) return [home, { label: category.name, path }];

  const article = path.startsWith('/articles/') ? getArticle(path.slice('/articles/'.length)) : undefined;
  if (article) {
    return [
      home,
      { label: 'Articles', path: '/articles' },
      { label: article.title, path: `/articles/${article.slug}` },
    ];
  }

  const tool = publishedTools.find((item) => normalizeRoutePath(item.href) === path);
  if (tool) {
    const categoryPath = tool.categorySlug === 'construction'
      ? '/home-construction'
      : `/category/${tool.categorySlug}`;
    return [
      home,
      { label: tool.category, path: categoryPath },
      { label: tool.name, path: tool.href },
    ];
  }

  return [home, { label: 'Page not found', path }];
}

export function breadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: toCanonicalUrl(item.path),
    })),
  };
}

export const breadcrumbPublicRouteCount = 1
  + localCategories.filter((category) => category.slug !== 'construction').length
  + publishedTools.length
  + 1
  + articles.length
  + 7;