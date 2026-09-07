import { renderToString } from 'react-dom/server';
import App from './App';
import { getSeoForPath, renderSeoHead } from './lib/seo';

export function render(path: string, options: { noindex?: boolean } = {}) {
  const routeSeo = getSeoForPath(path);
  const seo = options.noindex
    ? { ...routeSeo, robots: 'noindex, nofollow' as const }
    : routeSeo;
  return {
    html: renderToString(<App ssrPath={seo.redirect ?? path} />),
    head: renderSeoHead(seo),
    seo,
  };
}