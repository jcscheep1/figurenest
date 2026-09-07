import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist/public');
const template = await fs.readFile(path.join(output, 'index.html'), 'utf8');
const clientManifest = JSON.parse(
  await fs.readFile(path.join(output, '.vite/manifest.json'), 'utf8'),
) as Record<string, { css?: string[] }>;
const serverEntry = await import(pathToFileURL(path.join(root, 'dist/server/entry-server.js')).href);
const { publicRouteKeys } = await import('../src/lib/seo');
const [
  { phaseTwoDefinitions, phaseTwoSlugs },
  { phaseThreeADefinitions, phaseThreeASlugs },
  { phaseThreeBDefinitions, phaseThreeBSlugs },
  { phaseThreeCDefinitions, phaseThreeCSlugs },
  { phaseFourRoutes },
] = await Promise.all([
  import('../src/lib/phase-two-expansion'),
  import('../src/lib/phase-three-a'),
  import('../src/lib/phase-three-b'),
  import('../src/lib/phase-three-c'),
  import('../src/lib/phase-four-routes'),
]);
const privateRouteKeys = [
  '/sign-in',
  '/sign-up',
  '/control-center',
  '/control-center/projects',
  '/control-center/seo',
  '/control-center/traffic',
  '/control-center/revenue',
  '/control-center/calculators',
  '/control-center/indexing',
  '/control-center/health',
  '/control-center/alerts',
  '/control-center/approvals',
  '/control-center/integrations',
  '/control-center/assistant',
  '/control-center/settings',
];

const stylesheetLinks = (source: string) => (clientManifest[source]?.css ?? [])
  .map((href) => `<link rel="stylesheet" crossorigin href="/${href}" />`)
  .join('\n');

const advancedCalculatorSources = new Map<string, string>([
  ...phaseTwoSlugs.map((slug) => [phaseTwoDefinitions[slug].href, 'src/pages/PhaseTwoCalculatorPage.tsx'] as const),
  ...phaseThreeASlugs.map((slug) => [phaseThreeADefinitions[slug].href, 'src/pages/PhaseThreeACalculatorPage.tsx'] as const),
  ...phaseThreeBSlugs.map((slug) => [phaseThreeBDefinitions[slug].href, 'src/pages/PhaseThreeBCalculatorPage.tsx'] as const),
  ...phaseThreeCSlugs.map((slug) => [phaseThreeCDefinitions[slug].href, 'src/pages/PhaseThreeCCalculatorPage.tsx'] as const),
  ...phaseFourRoutes.map((route) => [route.href, 'src/pages/PhaseFourCalculatorPage.tsx'] as const),
]);

const routeStyles = (route: string) => {
  const routeKey = route === '/' ? route : route.replace(/\/+$/, '');
  const advancedSource = advancedCalculatorSources.get(routeKey);
  if (advancedSource) return stylesheetLinks(advancedSource);
  if (routeKey === '/home-construction' || routeKey.startsWith('/calculators/construction/')) {
    return stylesheetLinks('src/pages/ConstructionPages.tsx');
  }
  if (
    routeKey === '/calculators/math/percentage-increase-decrease'
    || routeKey === '/calculators/date-time/date-difference'
    || routeKey.startsWith('/calculators/finance/')
    || routeKey.startsWith('/calculators/date-time/')
    || routeKey.startsWith('/calculators/salary-work/')
    || routeKey.startsWith('/calculators/business/')
    || routeKey.startsWith('/calculators/automotive/')
    || routeKey === '/converters/unit'
    || routeKey === '/converters/length'
    || routeKey === '/converters/weight'
    || routeKey === '/converters/temperature'
    || routeKey === '/converters/speed'
  ) {
    const source = routeKey === '/calculators/math/percentage-increase-decrease'
      ? 'src/pages/PercentageChangePage.tsx'
      : routeKey === '/calculators/date-time/date-difference'
        ? 'src/pages/DateDurationPage.tsx'
        : routeKey.startsWith('/calculators/finance/')
          ? 'src/pages/FinanceCalculatorPage.tsx'
          : routeKey.startsWith('/calculators/date-time/') || routeKey.startsWith('/calculators/salary-work/')
            ? 'src/pages/WorkDateCalculatorPage.tsx'
            : routeKey.startsWith('/calculators/business/')
              ? 'src/pages/BusinessCalculatorPage.tsx'
              : routeKey.startsWith('/calculators/automotive/')
                ? 'src/pages/AutomotiveCalculatorPage.tsx'
                : 'src/pages/ConverterCalculatorPage.tsx';
    return stylesheetLinks(source);
  }
  if (route === '/articles' || route.startsWith('/articles/')) {
    return stylesheetLinks('src/pages/ArticlePages.tsx');
  }
  if (['/about', '/contact', '/privacy', '/cookies', '/terms', '/disclaimer', '/methodology'].includes(route)) {
    return stylesheetLinks('src/pages/TrustPages.tsx');
  }
  if (route === '/sign-in' || route === '/sign-up' || route.startsWith('/control-center')) {
    return stylesheetLinks('src/PrivateApp.tsx');
  }
  return '';
};

const documentFor = (route: string) => {
  const rendered = serverEntry.render(route);
  const styles = routeStyles(route);
  return template
    .replace('<!--app-head-->', styles ? `${rendered.head}\n${styles}` : rendered.head)
    .replace('<div id="root"></div>', `<div id="root">${rendered.html}</div>`);
};

for (const route of publicRouteKeys) {
  const filename = route === '/' ? path.join(output, 'index.html') : path.join(output, route.slice(1), 'index.html');
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(filename, documentFor(route));
}

for (const route of privateRouteKeys) {
  const rendered = serverEntry.render(route, { noindex: true });
  const filename = path.join(output, route.slice(1), 'index.html');
  const title = route.startsWith('/control-center')
    ? 'FigureNest Control Center'
    : route === '/sign-in'
      ? 'Sign In | FigureNest'
      : 'Sign Up | FigureNest';
  const privateHead = [
    `<script id="figurenest-disable-umami">try{localStorage.setItem('umami.disabled','1')}catch(e){}</script>`,
    `<title>${title}</title>`,
    '<meta name="robots" content="noindex, nofollow, noarchive" />',
    '<meta name="referrer" content="no-referrer" />',
    routeStyles(route),
  ].join('\n');
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await fs.writeFile(
    filename,
    template
      .replace('<!--app-head-->', privateHead)
      .replace('<div id="root"></div>', `<div id="root">${rendered.html}</div>`),
  );
}

const notFound = serverEntry.render('/404-not-found');
await fs.writeFile(
  path.join(output, '404.html'),
  template.replace('<!--app-head-->', notFound.head).replace('<div id="root"></div>', `<div id="root">${notFound.html}</div>`),
);

const legacyConstruction = serverEntry.render('/category/construction');
const legacyRedirectFile = path.join(output, 'category/construction/index.html');
await fs.mkdir(path.dirname(legacyRedirectFile), { recursive: true });
await fs.writeFile(
  legacyRedirectFile,
  template
    .replace(
      '<!--app-head-->',
      `${legacyConstruction.head}
    <meta http-equiv="refresh" content="0;url=${legacyConstruction.seo.redirect}" />
    <script>window.location.replace("${legacyConstruction.seo.redirect}" + window.location.search + window.location.hash)</script>`,
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root"></div><noscript><p>This page moved to <a href="${legacyConstruction.seo.redirect}">Home &amp; Construction</a>.</p></noscript>`,
    ),
);

console.log(`Pre-rendered ${publicRouteKeys.length} public routes, ${privateRouteKeys.length} private routes, one legacy redirect, and 404.html`);