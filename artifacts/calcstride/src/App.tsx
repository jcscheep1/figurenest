import { lazy, Suspense, type ReactNode, useEffect } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { ScrollManager } from '@/components/ScrollManager';
import { disableAnalyticsProviders, trackEvent, trackPageView } from '@/lib/analytics';
import { disableAdvertisingProvider } from '@/lib/adsense';
import { isPrivateRoute, renderedPageIsIndexable } from '@/lib/route-policy';
import {
  Route,
  Redirect,
  Switch,
  useLocation,
  Router as WouterRouter
} from 'wouter';
import {
  phaseThreeARoutes,
  phaseThreeBRoutes,
  phaseThreeCRoutes,
  phaseTwoRoutes,
  priorityOneRoutes,
} from '@/lib/expansion-metadata';
import type { PriorityOneExpansionSlug } from '@/lib/priority-one-expansion';
import type { PhaseTwoSlug } from '@/lib/phase-two-expansion';
import type { PhaseThreeASlug } from '@/lib/phase-three-a';
import type { PhaseThreeBSlug } from '@/lib/phase-three-b';
import type { PhaseThreeCSlug } from '@/lib/phase-three-c';
import type { PhaseFourSlug } from '@/lib/phase-four-routes';

// renderToString cannot wait for React.lazy. The SSR build therefore resolves
// page families eagerly, while the browser build keeps each family in its own
// async chunk. Vite replaces import.meta.env.SSR at build time and removes the
// unused side of each branch.
const homePages = import.meta.env.SSR ? await import('@/pages/HomePage') : null;
const appPages = import.meta.env.SSR ? await import('@/pages/AppPages') : null;
const trustPages = import.meta.env.SSR ? await import('@/pages/TrustPages') : null;
const constructionPages = import.meta.env.SSR ? await import('@/pages/ConstructionPages') : null;
const percentagePages = import.meta.env.SSR ? await import('@/pages/PercentageChangePage') : null;
const dateDurationPages = import.meta.env.SSR ? await import('@/pages/DateDurationPage') : null;
const financePages = import.meta.env.SSR ? await import('@/pages/FinanceCalculatorPage') : null;
const workDatePages = import.meta.env.SSR ? await import('@/pages/WorkDateCalculatorPage') : null;
const converterPages = import.meta.env.SSR ? await import('@/pages/ConverterCalculatorPage') : null;
const businessPages = import.meta.env.SSR ? await import('@/pages/BusinessCalculatorPage') : null;
const automotivePages = import.meta.env.SSR ? await import('@/pages/AutomotiveCalculatorPage') : null;
const priorityFinancePages = import.meta.env.SSR ? await import('@/pages/PriorityFinanceCalculatorPage') : null;
const priorityOnePages = import.meta.env.SSR ? await import('@/pages/PriorityOneCalculatorPage') : null;
const phaseTwoPages = import.meta.env.SSR ? await import('@/pages/PhaseTwoCalculatorPage') : null;
const phaseThreeAPages = import.meta.env.SSR ? await import('@/pages/PhaseThreeACalculatorPage') : null;
const phaseThreeBPages = import.meta.env.SSR ? await import('@/pages/PhaseThreeBCalculatorPage') : null;
const phaseThreeCPages = import.meta.env.SSR ? await import('@/pages/PhaseThreeCCalculatorPage') : null;
const phaseFourPages = import.meta.env.SSR ? await import('@/pages/PhaseFourCalculatorPage') : null;
const cableFusePages = import.meta.env.SSR ? await import('@/pages/CableFuseSizeCalculatorPage') : null;
const directoryPages = import.meta.env.SSR ? await import('@/pages/CalculatorDirectoryPage') : null;
const articlePages = import.meta.env.SSR ? await import('@/pages/ArticlePages') : null;
const fileToolPages = import.meta.env.SSR ? await import('@/pages/PdfSignEditPage') : null;
const pdfConversionPages = import.meta.env.SSR ? await import('@/pages/PdfConversionPages') : null;
const imageToPdfPages = import.meta.env.SSR ? await import('@/pages/ImageToPdfPage') : null;
const notFoundPage = import.meta.env.SSR ? await import('@/pages/not-found') : null;

const HomePage = homePages?.HomePage
  ?? lazy(() => import('@/pages/HomePage').then(({ HomePage: page }) => ({ default: page })));
const CategoryPage = appPages?.CategoryPage
  ?? lazy(() => import('@/pages/AppPages').then(({ CategoryPage: page }) => ({ default: page })));
const ToolDetailPage = appPages?.ToolDetailPage
  ?? lazy(() => import('@/pages/AppPages').then(({ ToolDetailPage: page }) => ({ default: page })));
const TrustPage = trustPages?.TrustPage
  ?? lazy(() => import('@/pages/TrustPages').then(({ TrustPage: page }) => ({ default: page })));
const HomeConstructionPage = constructionPages?.HomeConstructionPage
  ?? lazy(() => import('@/pages/ConstructionPages').then(({ HomeConstructionPage: page }) => ({ default: page })));
const ConstructionCalculatorPage = constructionPages?.ConstructionCalculatorPage
  ?? lazy(() => import('@/pages/ConstructionPages').then(({ ConstructionCalculatorPage: page }) => ({ default: page })));
const PercentageChangePage = percentagePages?.PercentageChangePage
  ?? lazy(() => import('@/pages/PercentageChangePage').then(({ PercentageChangePage: page }) => ({ default: page })));
const DateDurationPage = dateDurationPages?.DateDurationPage
  ?? lazy(() => import('@/pages/DateDurationPage').then(({ DateDurationPage: page }) => ({ default: page })));
const FinanceCalculatorPage = financePages?.FinanceCalculatorPage
  ?? lazy(() => import('@/pages/FinanceCalculatorPage').then(({ FinanceCalculatorPage: page }) => ({ default: page })));
const WorkDateCalculatorPage = workDatePages?.WorkDateCalculatorPage
  ?? lazy(() => import('@/pages/WorkDateCalculatorPage').then(({ WorkDateCalculatorPage: page }) => ({ default: page })));
const ConverterCalculatorPage = converterPages?.ConverterCalculatorPage
  ?? lazy(() => import('@/pages/ConverterCalculatorPage').then(({ ConverterCalculatorPage: page }) => ({ default: page })));
const BusinessCalculatorPage = businessPages?.BusinessCalculatorPage
  ?? lazy(() => import('@/pages/BusinessCalculatorPage').then(({ BusinessCalculatorPage: page }) => ({ default: page })));
const AutomotiveCalculatorPage = automotivePages?.AutomotiveCalculatorPage
  ?? lazy(() => import('@/pages/AutomotiveCalculatorPage').then(({ AutomotiveCalculatorPage: page }) => ({ default: page })));
const PriorityFinanceCalculatorPage = priorityFinancePages?.PriorityFinanceCalculatorPage
  ?? lazy(() => import('@/pages/PriorityFinanceCalculatorPage').then(({ PriorityFinanceCalculatorPage: page }) => ({ default: page })));
const PriorityOneCalculatorPage = priorityOnePages?.PriorityOneCalculatorPage
  ?? lazy(() => import('@/pages/PriorityOneCalculatorPage').then(({ PriorityOneCalculatorPage: page }) => ({ default: page })));
const PhaseTwoCalculatorPage = phaseTwoPages?.PhaseTwoCalculatorPage
  ?? lazy(() => import('@/pages/PhaseTwoCalculatorPage').then(({ PhaseTwoCalculatorPage: page }) => ({ default: page })));
const PhaseThreeACalculatorPage = phaseThreeAPages?.PhaseThreeACalculatorPage
  ?? lazy(() => import('@/pages/PhaseThreeACalculatorPage').then(({ PhaseThreeACalculatorPage: page }) => ({ default: page })));
const PhaseThreeBCalculatorPage = phaseThreeBPages?.PhaseThreeBCalculatorPage
  ?? lazy(() => import('@/pages/PhaseThreeBCalculatorPage').then(({ PhaseThreeBCalculatorPage: page }) => ({ default: page })));
const PhaseThreeCCalculatorPage = phaseThreeCPages?.PhaseThreeCCalculatorPage
  ?? lazy(() => import('@/pages/PhaseThreeCCalculatorPage').then(({ PhaseThreeCCalculatorPage: page }) => ({ default: page })));
const PhaseFourCalculatorPage = phaseFourPages?.PhaseFourCalculatorPage
  ?? lazy(() => import('@/pages/PhaseFourCalculatorPage').then(({ PhaseFourCalculatorPage: page }) => ({ default: page })));
const CableFuseSizeCalculatorPage = cableFusePages?.CableFuseSizeCalculatorPage
  ?? lazy(() => import('@/pages/CableFuseSizeCalculatorPage').then(({ CableFuseSizeCalculatorPage: page }) => ({ default: page })));
const CalculatorDirectoryPage = directoryPages?.CalculatorDirectoryPage
  ?? lazy(() => import('@/pages/CalculatorDirectoryPage').then(({ CalculatorDirectoryPage: page }) => ({ default: page })));
const ArticleIndexPage = articlePages?.ArticleIndexPage
  ?? lazy(() => import('@/pages/ArticlePages').then(({ ArticleIndexPage: page }) => ({ default: page })));
const ArticlePage = articlePages?.ArticlePage
  ?? lazy(() => import('@/pages/ArticlePages').then(({ ArticlePage: page }) => ({ default: page })));
const PdfSignEditPage = fileToolPages?.PdfSignEditPage
  ?? lazy(() => import('@/pages/PdfSignEditPage').then(({ PdfSignEditPage: page }) => ({ default: page })));
const PdfToImagePage = pdfConversionPages?.PdfToImagePage
  ?? lazy(() => import('@/pages/PdfConversionPages').then(({ PdfToImagePage: page }) => ({ default: page })));
const PdfToTextPage = pdfConversionPages?.PdfToTextPage
  ?? lazy(() => import('@/pages/PdfConversionPages').then(({ PdfToTextPage: page }) => ({ default: page })));
const ImageToPdfPage = imageToPdfPages?.ImageToPdfPage
  ?? lazy(() => import('@/pages/ImageToPdfPage').then(({ ImageToPdfPage: page }) => ({ default: page })));
const NotFound = notFoundPage?.default ?? lazy(() => import('@/pages/not-found'));
const PrivateApp = lazy(() => import('./PrivateApp'));

const phaseFourRoutePaths: ReadonlyArray<[PhaseFourSlug, string]> = [
  ['mileage', '/calculators/automotive/mileage'],
  ['roman-numeral', '/converters/roman-numeral'],
  ['shoe-size', '/converters/shoe-size'],
  ['social-security', '/calculators/finance/social-security'],
  ['take-home-pay', '/calculators/finance/take-home-pay'],
  ['tire-size', '/calculators/automotive/tire-size'],
  ['401k', '/calculators/finance/401k'],
  ['annuity', '/calculators/finance/annuity'],
  ['apr', '/calculators/finance/apr'],
  ['auto-lease', '/calculators/finance/auto-lease'],
  ['bond', '/calculators/finance/bond'],
  ['budget', '/calculators/finance/budget'],
  ['commission', '/calculators/business/commission'],
  ['credit-card', '/calculators/finance/credit-card'],
  ['debt-consolidation', '/calculators/finance/debt-consolidation'],
];

function OptionalServicesRouteGuard() {
  const [location] = useLocation();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!isPrivateRoute(location) && renderedPageIsIndexable()) return;
      const providerWasLoaded = Boolean(
        document.getElementById('figurenest-ga4')
        || document.getElementById('figurenest-adsense'),
      );
      disableAnalyticsProviders();
      disableAdvertisingProvider();
      if (providerWasLoaded) window.location.reload();
    });
    return () => cancelAnimationFrame(frame);
  }, [location]);

  return null;
}

function AnalyticsRouteTracker() {
  const [location] = useLocation();
  useEffect(() => trackPageView(location), [location]);
  return null;
}

function OutboundClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;
      let destination: URL;
      try {
        destination = new URL(anchor.href);
      } catch {
        return;
      }
      if (!/^https?:$/.test(destination.protocol) || destination.origin === window.location.origin) return;
      const dimensions = { link_domain: destination.hostname.toLowerCase() };
      const affiliate = anchor.dataset.affiliate === 'true'
        || anchor.rel.split(/\s+/).includes('sponsored');
      trackEvent(affiliate ? 'affiliate_click' : 'outbound_click', dimensions);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}

function PrivateLoading() {
  return (
    <main
      className="min-h-[100dvh] flex items-center justify-center bg-background text-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <p role="status" className="text-sm text-muted-foreground">Loading secure area…</p>
    </main>
  );
}

function PublicLoading() {
  return (
    <main className="min-h-[100dvh] bg-background" aria-busy="true" aria-live="polite">
      <p role="status" className="sr-only">Loading page…</p>
    </main>
  );
}

function PrivateRoute() {
  return (
    <Suspense fallback={<PrivateLoading />}>
      <PrivateApp />
    </Suspense>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <>
      <ScrollManager />
      <AnalyticsRouteTracker />
      <OutboundClickTracker />
      <OptionalServicesRouteGuard />
      {/* Keep a shared shell outside the boundary so it survives a page crash. */}
      <RoutedErrorBoundary>
        <Suspense fallback={<PublicLoading />}>
        <Switch>
        {/* Public Routes */}
        <Route path="/" component={HomePage} />
        <Route path="/calculators" component={CalculatorDirectoryPage} />
        <Route path="/home-construction" component={HomeConstructionPage} />
        <Route path="/calculators/electrical/cable-fuse-size" component={CableFuseSizeCalculatorPage} />
        {phaseTwoRoutes.map(({ slug, href }) => (
          <Route path={href} key={slug}>
            <PhaseTwoCalculatorPage slug={slug as PhaseTwoSlug} />
          </Route>
        ))}
        {phaseThreeARoutes.map(({ slug, href }) => (
          <Route path={href} key={slug}>
            <PhaseThreeACalculatorPage slug={slug as PhaseThreeASlug} />
          </Route>
        ))}
        {phaseThreeBRoutes.map(({ slug, href }) => (
          <Route path={href} key={slug}>
            <PhaseThreeBCalculatorPage slug={slug as PhaseThreeBSlug} />
          </Route>
        ))}
        {phaseThreeCRoutes.map(({ slug, href }) => (
          <Route path={href} key={slug}>
            <PhaseThreeCCalculatorPage slug={slug as PhaseThreeCSlug} />
          </Route>
        ))}
        {phaseFourRoutePaths.map(([slug, href]) => (
          <Route path={href} key={slug}>
            <PhaseFourCalculatorPage slug={slug} />
          </Route>
        ))}
        <Route path="/calculators/construction/:slug"><ConstructionCalculatorPage /></Route>
        <Route path="/calculators/math/percentage-increase-decrease"><PercentageChangePage /></Route>
        <Route path="/calculators/date-time/date-difference"><DateDurationPage /></Route>
        <Route path="/calculators/finance/loan"><FinanceCalculatorPage key="loan" slug="loan" /></Route>
        <Route path="/calculators/finance/mortgage"><FinanceCalculatorPage key="mortgage" slug="mortgage" /></Route>
        <Route path="/calculators/finance/compound-interest"><FinanceCalculatorPage key="compound-interest" slug="compound-interest" /></Route>
        <Route path="/calculators/finance/auto-loan"><PriorityFinanceCalculatorPage key="auto-loan" slug="auto-loan" /></Route>
        <Route path="/calculators/finance/interest-rate"><PriorityFinanceCalculatorPage key="interest-rate" slug="interest-rate" /></Route>
        <Route path="/calculators/finance/mortgage-amortization"><PriorityFinanceCalculatorPage key="mortgage-amortization" slug="mortgage-amortization" /></Route>
        <Route path="/calculators/finance/mortgage-payoff"><PriorityFinanceCalculatorPage key="mortgage-payoff" slug="mortgage-payoff" /></Route>
        <Route path="/calculators/finance/simple-interest"><PriorityFinanceCalculatorPage key="simple-interest" slug="simple-interest" /></Route>
        <Route path="/calculators/date-time/age"><WorkDateCalculatorPage key="age" slug="age" /></Route>
        <Route path="/calculators/date-time/working-days"><WorkDateCalculatorPage key="working-days" slug="working-days" /></Route>
        <Route path="/calculators/salary-work/salary"><WorkDateCalculatorPage key="salary" slug="salary" /></Route>
        <Route path="/calculators/salary-work/overtime"><WorkDateCalculatorPage key="overtime" slug="overtime" /></Route>
        <Route path="/converters/unit"><ConverterCalculatorPage key="unit" slug="unit" /></Route>
        <Route path="/converters/length"><ConverterCalculatorPage key="length" slug="length" /></Route>
        <Route path="/converters/weight"><ConverterCalculatorPage key="weight" slug="weight" /></Route>
        <Route path="/converters/temperature"><ConverterCalculatorPage key="temperature" slug="temperature" /></Route>
        <Route path="/converters/speed"><ConverterCalculatorPage key="speed" slug="speed" /></Route>
        <Route path="/calculators/business/roi"><BusinessCalculatorPage key="roi" slug="roi" /></Route>
        <Route path="/calculators/business/profit-margin"><BusinessCalculatorPage key="profit-margin" slug="profit-margin" /></Route>
        <Route path="/calculators/business/markup"><BusinessCalculatorPage key="markup" slug="markup" /></Route>
        <Route path="/calculators/business/break-even"><BusinessCalculatorPage key="break-even" slug="break-even" /></Route>
        <Route path="/calculators/business/roas"><BusinessCalculatorPage key="roas" slug="roas" /></Route>
        <Route path="/calculators/business/conversion-rate"><BusinessCalculatorPage key="conversion-rate" slug="conversion-rate" /></Route>
        <Route path="/calculators/business/cpc"><BusinessCalculatorPage key="cpc" slug="cpc" /></Route>
        <Route path="/calculators/business/cpm"><BusinessCalculatorPage key="cpm" slug="cpm" /></Route>
        <Route path="/calculators/business/customer-acquisition-cost"><BusinessCalculatorPage key="customer-acquisition-cost" slug="customer-acquisition-cost" /></Route>
        <Route path="/calculators/automotive/fuel-cost"><AutomotiveCalculatorPage key="fuel-cost" slug="fuel-cost" /></Route>
        <Route path="/calculators/automotive/fuel-economy"><AutomotiveCalculatorPage key="fuel-economy" slug="fuel-economy" /></Route>
        <Route path="/calculators/automotive/ev-charging-cost"><AutomotiveCalculatorPage key="ev-charging-cost" slug="ev-charging-cost" /></Route>
        <Route path="/calculators/automotive/ev-charging-time"><AutomotiveCalculatorPage key="ev-charging-time" slug="ev-charging-time" /></Route>
        {priorityOneRoutes.map(({ slug, href }) => (
          <Route path={href} key={slug}>
            <PriorityOneCalculatorPage slug={slug as PriorityOneExpansionSlug} />
          </Route>
        ))}
        <Route path="/file-tools/pdf-sign-edit" component={PdfSignEditPage} />
        <Route path="/file-tools/pdf-to-image" component={PdfToImagePage} />
        <Route path="/file-tools/image-to-pdf" component={ImageToPdfPage} />
        <Route path="/file-tools/pdf-to-text" component={PdfToTextPage} />
        <Route path="/articles" component={ArticleIndexPage} />
        <Route path="/articles/:slug"><ArticlePage /></Route>
        <Route path="/calculators/:category/:slug"><ToolDetailPage /></Route>
        <Route path="/converters/:slug"><ToolDetailPage converter /></Route>
        <Route path="/category/construction"><Redirect to="/home-construction/" replace /></Route>
        <Route path="/category/:slug" component={CategoryPage} />
        <Route path="/about"><TrustPage kind="about" /></Route>
        <Route path="/contact"><TrustPage kind="contact" /></Route>
        <Route path="/privacy"><TrustPage kind="privacy" /></Route>
        <Route path="/terms"><TrustPage kind="terms" /></Route>
        <Route path="/disclaimer"><TrustPage kind="disclaimer" /></Route>
        <Route path="/cookies"><TrustPage kind="cookies" /></Route>
        <Route path="/methodology"><TrustPage kind="methodology" /></Route>

        {/* Auth and control-center code is loaded only for private routes. */}
        <Route path="/sign-in/*?">
          <PrivateRoute />
        </Route>
        <Route path="/sign-up/*?">
          <PrivateRoute />
        </Route>

        {/* Private Control Center */}
        <Route path="/control-center">
          <PrivateRoute />
        </Route>
        <Route path="/control-center/:section">
          <PrivateRoute />
        </Route>

        <Route component={NotFound} />
        </Switch>
        </Suspense>
      </RoutedErrorBoundary>
    </>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App({ ssrPath }: { ssrPath?: string }) {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')} ssrPath={ssrPath}>
      <Router />
    </WouterRouter>
  );
}

export default App;