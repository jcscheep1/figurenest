import { SITE_HOSTNAME } from './public-url';

const WWW_HOSTNAME = `www.${SITE_HOSTNAME}`;
const CANONICAL_ORIGIN = `https://${SITE_HOSTNAME}`;

const legacyPathRedirects = new Map([
  ['/index.php', '/'],
  ['/en', '/'],
  ['/en/', '/'],
  ['/es', '/'],
  ['/es/', '/'],
  ['/category/construction', '/home-construction/'],
  ['/category/construction/', '/home-construction/'],
  ['/calculators/finance/interest', '/calculators/finance/simple-interest/'],
  ['/calculators/finance/interest/', '/calculators/finance/simple-interest/'],
]);

const canonicalPathForHostRedirect = (pathname: string) => {
  if (pathname === '/' || pathname.endsWith('/') || /\/[^/]*\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return `${pathname}/`;
};

export type RequestRedirectInput = {
  hostname: string;
  protocol: string;
  pathname: string;
  search?: string;
};

const normalizeHostname = (hostname: string) => hostname
  .trim()
  .toLowerCase()
  .replace(/:\d+$/, '');

const querySuffix = (search = '') => (
  !search ? '' : search.startsWith('?') ? search : `?${search}`
);

/**
 * Returns the single permanent redirect for a request, or null when the
 * request is already on the canonical host and path family.
 *
 * Legacy paths are resolved before host normalization so a request such as
 * http://www.figurenest.com/index.php?x=1 goes directly to
 * https://figurenest.com/?x=1 rather than passing through two redirects.
 */
export function getRequestRedirect({
  hostname,
  protocol,
  pathname,
  search,
}: RequestRedirectInput): string | null {
  const host = normalizeHostname(hostname);
  const isKnownFigureNestHost = host === SITE_HOSTNAME || host === WWW_HOSTNAME;
  const isHttp = protocol.trim().toLowerCase().replace(/:$/, '') === 'http';
  const needsHostRedirect = host === WWW_HOSTNAME || (host === SITE_HOSTNAME && isHttp);
  const legacyTarget = legacyPathRedirects.get(pathname);

  if (!legacyTarget && !needsHostRedirect) return null;

  const suffix = querySuffix(search);
  if (!isKnownFigureNestHost) {
    return legacyTarget ? `${legacyTarget}${suffix}` : null;
  }

  const targetPath = legacyTarget ?? canonicalPathForHostRedirect(pathname);
  return `${CANONICAL_ORIGIN}${targetPath}${suffix}`;
}

export const legacyRedirectPaths = [...legacyPathRedirects.keys()];