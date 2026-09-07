export const SITE_ORIGIN = 'https://figurenest.com';
export const SITE_HOSTNAME = new URL(SITE_ORIGIN).hostname;

export function isCanonicalHostname(hostname: string): boolean {
  return hostname.trim().toLowerCase() === SITE_HOSTNAME;
}

export function normalizeRoutePath(value: string): string {
  const pathname = value.split(/[?#]/, 1)[0] || '/';
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const normalized = withLeadingSlash.replace(/\/{2,}/g, '/');
  return normalized === '/' ? '/' : normalized.replace(/\/+$/, '');
}

export function toPublicPath(value: string): string {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) return value;

  const suffixIndex = value.search(/[?#]/);
  const pathname = suffixIndex === -1 ? value : value.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? '' : value.slice(suffixIndex);
  const route = normalizeRoutePath(pathname);
  return `${route === '/' ? '/' : `${route}/`}${suffix}`;
}

export function toCanonicalUrl(path: string): string {
  return `${SITE_ORIGIN}${toPublicPath(path)}`;
}