import { normalizeRoutePath } from './public-url';
import { localCategories } from './catalog';

const publicStaticRoutes = new Set([
  '/', '/home-construction', '/articles', '/about', '/contact', '/privacy',
  '/terms', '/disclaimer', '/cookies', '/methodology',
  ...localCategories
    .filter((category) => category.slug !== 'construction')
    .map((category) => `/category/${category.slug}`),
]);

export function isPrivateRoute(pathname: string): boolean {
  const path = normalizeRoutePath(pathname);
  return path === '/sign-in' || path.startsWith('/sign-in/')
    || path === '/sign-up' || path.startsWith('/sign-up/')
    || path === '/control-center' || path.startsWith('/control-center/');
}

export function isLikelyIndexableRoute(pathname: string): boolean {
  const path = normalizeRoutePath(pathname);
  return publicStaticRoutes.has(path)
    || /^\/calculators\/[a-z0-9-]+\/[a-z0-9-]+$/.test(path)
    || /^\/converters\/[a-z0-9-]+$/.test(path)
    || /^\/articles\/[a-z0-9-]+$/.test(path);
}

export function renderedPageIsIndexable(): boolean {
  return document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content === 'index, follow';
}