import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { toPublicPath } from '../src/lib/public-url';
import { getRequestRedirect } from '../src/lib/redirects';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 18840);
const previewContentSecurityPolicy = [
  "default-src 'self' https: data: blob:",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https:",
  "connect-src 'self' https: ws: wss:",
].join('; ');
const vite = await createViteServer({
  root,
  server: { middlewareMode: true, allowedHosts: true },
  appType: 'custom',
});

const isAssetRequest = (pathname: string) => (
  pathname.startsWith('/src/')
  || pathname.startsWith('/@')
  || pathname.startsWith('/node_modules/')
  || /\.[a-z0-9]+$/i.test(pathname)
);

const firstHeaderValue = (value: string | string[] | undefined) => (
  Array.isArray(value) ? value[0] : value?.split(',')[0]?.trim()
);

const server = http.createServer(async (request, response) => {
  const url = request.url || '/';
  const parsedUrl = new URL(url, 'http://localhost');
  const pathname = parsedUrl.pathname;
  if (request.method === 'GET' || request.method === 'HEAD') {
    const redirect = getRequestRedirect({
      hostname: firstHeaderValue(request.headers['x-forwarded-host']) ?? request.headers.host ?? 'localhost',
      protocol: firstHeaderValue(request.headers['x-forwarded-proto'])
        ?? (request.socket.encrypted ? 'https' : 'http'),
      pathname,
      search: parsedUrl.search,
    });
    if (redirect) {
      response.statusCode = 301;
      response.setHeader('Location', redirect);
      response.setHeader('Cache-Control', 'public, max-age=86400');
      response.end();
      return;
    }
  }
  if (request.method !== 'GET' || isAssetRequest(pathname)) {
    vite.middlewares(request, response);
    return;
  }
  if (pathname === '/category/construction' || pathname === '/category/construction/') {
    response.statusCode = 301;
    response.setHeader('Location', `/home-construction/${parsedUrl.search}`);
    response.end();
    return;
  }
  if (pathname !== '/' && !pathname.endsWith('/')) {
    response.statusCode = 308;
    response.setHeader('Location', `${toPublicPath(pathname)}${parsedUrl.search}`);
    response.end();
    return;
  }
  try {
    const entry = await vite.ssrLoadModule('/src/entry-server.tsx');
    const rendered = entry.render(pathname, { noindex: true });
    if (rendered.seo.redirect) {
      response.statusCode = 301;
      response.setHeader('Location', rendered.seo.redirect);
      response.end();
      return;
    }
    const source = await fs.readFile(path.join(root, 'index.html'), 'utf8');
    const transformed = await vite.transformIndexHtml(url, source);
    const document = transformed
      .replace('<!--app-head-->', rendered.head)
      .replace('<div id="root"></div>', `<div id="root">${rendered.html}</div>`);
    response.statusCode = rendered.seo.status;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Content-Security-Policy', previewContentSecurityPolicy);
    response.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    response.end(document);
  } catch (error) {
    vite.ssrFixStacktrace(error as Error);
    response.statusCode = 500;
    response.end('Internal server error');
    console.error(error);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`FigureNest SSR preview listening on ${port}`);
});