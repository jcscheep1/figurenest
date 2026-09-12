import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { getRequestRedirect } from '../src/lib/redirects';
import { toPublicPath } from '../src/lib/public-url';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = moduleDirectory.endsWith(`${path.sep}dist${path.sep}runtime`)
  ? path.resolve(moduleDirectory, '..', '..')
  : path.resolve(moduleDirectory, '..');
const publicRoot = path.join(root, 'dist/public');
const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error('PORT environment variable is required but was not provided.');
}

const port = Number(rawPort);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'text/xml; charset=utf-8',
};

const compressibleTypes = new Set([
  'text/css; charset=utf-8',
  'text/html; charset=utf-8',
  'text/javascript; charset=utf-8',
  'application/json; charset=utf-8',
  'application/manifest+json; charset=utf-8',
  'image/svg+xml',
  'text/plain; charset=utf-8',
  'text/xml; charset=utf-8',
]);

const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://*.googlesyndication.com https://*.google.com https://*.adtrafficquality.google",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.googlesyndication.com https://*.google.com https://*.adtrafficquality.google https://*.doubleclick.net",
  "frame-src https://*.google.com https://*.googlesyndication.com https://*.adtrafficquality.google https://*.doubleclick.net",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join('; ');

const securityHeaders = {
  'Content-Security-Policy-Report-Only': contentSecurityPolicyReportOnly,
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
} as const;

type CachedFile = {
  body: Buffer;
  contentType: string;
  etag: string;
  br?: Buffer;
  gzip?: Buffer;
};

const fileCache = new Map<string, Promise<CachedFile | null>>();

const loadFile = (filename: string) => {
  const existing = fileCache.get(filename);
  if (existing) return existing;
  const pending = fs.readFile(filename)
    .then((body): CachedFile => ({
      body,
      contentType: contentTypes[path.extname(filename).toLowerCase()] ?? 'application/octet-stream',
      etag: `"${createHash('sha256').update(body).digest('base64url')}"`,
    }))
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT' || error.code === 'EISDIR') return null;
      throw error;
    });
  fileCache.set(filename, pending);
  return pending;
};

const representationFor = (file: CachedFile, encoding: 'br' | 'gzip' | null) => {
  if (encoding === 'br') {
    file.br ??= brotliCompressSync(file.body);
    return file.br;
  }
  if (encoding === 'gzip') {
    file.gzip ??= gzipSync(file.body);
    return file.gzip;
  }
  return file.body;
};

const firstHeaderValue = (value: string | string[] | undefined) => (
  Array.isArray(value) ? value[0] : value?.split(',')[0]?.trim()
);

const isPrivatePath = (pathname: string) => (
  pathname === '/sign-in'
  || pathname.startsWith('/sign-in/')
  || pathname === '/sign-up'
  || pathname.startsWith('/sign-up/')
  || pathname === '/account'
  || pathname.startsWith('/account/')
  || pathname === '/admin'
  || pathname.startsWith('/admin/')
  || pathname === '/auth'
  || pathname.startsWith('/auth/')
  || pathname === '/internal'
  || pathname.startsWith('/internal/')
  || pathname === '/private'
  || pathname.startsWith('/private/')
  || pathname === '/control-center'
  || pathname.startsWith('/control-center/')
  || pathname === '/api'
  || pathname.startsWith('/api/')
);

const cacheControlFor = (pathname: string) => {
  if (isPrivatePath(pathname)) return 'private, no-store';
  if (pathname.startsWith('/assets/') || pathname.startsWith('/fonts/')) return 'public, max-age=31536000, immutable';
  if (
    pathname.startsWith('/social/')
    || pathname.startsWith('/pwa-')
    || pathname === '/favicon.svg'
    || pathname === '/apple-touch-icon.png'
  ) {
    return 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=2592000';
  }
  if (pathname === '/manifest.webmanifest' || pathname === '/site.webmanifest') {
    return 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';
  }
  if (pathname === '/service-worker.js') return 'no-cache, no-store, must-revalidate';
  return 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400';
};

const cdnCacheControlFor = (pathname: string) => {
  if (isPrivatePath(pathname) || pathname === '/service-worker.js') return 'no-store';
  if (pathname.startsWith('/assets/') || pathname.startsWith('/fonts/')) {
    return 'public, max-age=31536000, immutable';
  }
  if (
    pathname.startsWith('/social/')
    || pathname.startsWith('/pwa-')
    || pathname === '/favicon.svg'
    || pathname === '/apple-touch-icon.png'
  ) {
    return 'public, s-maxage=604800, stale-while-revalidate=2592000';
  }
  return 'public, s-maxage=300, stale-while-revalidate=86400';
};

const decodePathname = (pathname: string) => {
  try {
    const decoded = decodeURIComponent(pathname);
    if (decoded.includes('\0')) return null;
    return decoded;
  } catch {
    return null;
  }
};

const safeFilePath = (pathname: string) => {
  const decoded = decodePathname(pathname);
  if (!decoded) return null;
  const relativePath = decoded === '/'
    ? 'index.html'
    : decoded.endsWith('/')
      ? `${decoded.slice(1)}index.html`
      : decoded.slice(1);
  const filename = path.resolve(publicRoot, relativePath);
  const relativeToRoot = path.relative(publicRoot, filename);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) return null;
  return filename;
};

const negotiateEncoding = (acceptEncoding: string | undefined, contentType: string) => {
  if (!compressibleTypes.has(contentType)) return null;
  const accepted = (acceptEncoding ?? '').toLowerCase();
  if (/(?:^|,|\s)br(?:\s|,|;|$)/.test(accepted)) return 'br';
  if (/(?:^|,|\s)gzip(?:\s|,|;|$)/.test(accepted)) return 'gzip';
  return null;
};

const sendBuffer = (
  request: http.IncomingMessage,
  response: http.ServerResponse,
  statusCode: number,
  headers: Record<string, string>,
  body: Buffer,
) => {
  response.writeHead(statusCode, { ...securityHeaders, ...headers });
  if (request.method !== 'HEAD') response.end(body);
  else response.end();
};

const server = http.createServer(async (request, response) => {
  const method = request.method ?? 'GET';
  const requestUrl = request.url ?? '/';
  const parsedUrl = new URL(requestUrl, 'http://localhost');
  const { pathname, search } = parsedUrl;

  if (method !== 'GET' && method !== 'HEAD') {
    response.writeHead(405, { ...securityHeaders, Allow: 'GET, HEAD', 'Cache-Control': 'no-store' });
    response.end();
    return;
  }

  if (pathname === '/healthz') {
    response.writeHead(204, {
      ...securityHeaders,
      'Cache-Control': 'private, no-store',
      'Content-Length': '0',
    });
    response.end();
    return;
  }

  const redirect = getRequestRedirect({
    hostname: firstHeaderValue(request.headers['x-forwarded-host']) ?? request.headers.host ?? '',
    protocol: firstHeaderValue(request.headers['x-forwarded-proto'])
      ?? (Boolean((request.socket as { encrypted?: boolean }).encrypted) ? 'https' : 'http'),
    pathname,
    search,
  });
  if (redirect) {
    response.writeHead(301, {
      ...securityHeaders,
      Location: redirect,
      'Cache-Control': 'public, max-age=86400',
    });
    response.end();
    return;
  }

  const requestedFile = safeFilePath(pathname);
  let filename = requestedFile;
  let statusCode = 200;
  if (!filename) {
    statusCode = 400;
  } else {
    const directFile = await loadFile(filename);
    if (!directFile && pathname !== '/' && !pathname.endsWith('/') && !path.extname(pathname)) {
      const directoryIndex = safeFilePath(toPublicPath(pathname));
      if (directoryIndex && await loadFile(directoryIndex)) {
        response.writeHead(308, {
          ...securityHeaders,
          Location: `${toPublicPath(pathname)}${search}`,
          'Cache-Control': 'public, max-age=86400',
        });
        response.end();
        return;
      }
    }
    if (!directFile) {
      filename = path.join(publicRoot, '404.html');
      statusCode = 404;
    }
  }

  if (!filename) {
    response.writeHead(statusCode, { ...securityHeaders, 'Cache-Control': 'no-store' });
    response.end();
    return;
  }

  try {
    const file = await loadFile(filename);
    if (!file) throw new Error(`Required public file is missing: ${filename}`);
    const encoding = negotiateEncoding(request.headers['accept-encoding'], file.contentType);
    const encodedBody = representationFor(file, encoding);
    const headers: Record<string, string> = {
      'Cache-Control': cacheControlFor(pathname),
      'CDN-Cache-Control': cdnCacheControlFor(pathname),
      'Content-Type': file.contentType,
      'Content-Length': String(encodedBody.byteLength),
      ETag: file.etag,
    };
    if (request.headers['if-none-match'] === file.etag) {
      response.writeHead(304, { ...securityHeaders, ...headers, 'Content-Length': '0' });
      response.end();
      return;
    }
    if (statusCode === 404) headers['X-Robots-Tag'] = 'noindex, follow';
    if (encoding) {
      headers['Content-Encoding'] = encoding;
      headers.Vary = 'Accept-Encoding';
    }
    sendBuffer(request, response, statusCode, headers, encodedBody);
  } catch (error) {
    console.error('Failed to serve public file', error);
    response.writeHead(500, { ...securityHeaders, 'Cache-Control': 'no-store' });
    response.end();
  }
});

server.on('error', (error) => {
  console.error('FigureNest production server failed', error);
  process.exit(1);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`FigureNest production server listening on ${port}`);
});
