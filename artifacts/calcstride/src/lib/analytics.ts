import type { ConsentPreferences } from '@/lib/consent';
import { clearAccessibleGaCookies } from '@/lib/consent';
import { normalizeRoutePath } from '@/lib/public-url';
import { isProduction } from '@/lib/monetization-config';
import { isLikelyIndexableRoute, renderedPageIsIndexable } from '@/lib/route-policy';

type AnalyticsData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_MEASUREMENT_ID = 'G-DXVBC2FNSS';
const GA_SCRIPT_ID = 'figurenest-ga4';
const PRODUCTION_HOSTS = new Set(['figurenest.com', 'www.figurenest.com']);

const allowedFields = new Set([
  'calculator_slug',
  'calculator_group',
  'unit_system',
  'currency',
  'share_method',
  'category',
  'page_type',
  'action',
  'source_slug',
  'destination_slug',
  'link_domain',
  'form_name',
  'search_result_state',
]);
const allowedEvents = new Set([
  'calculator_opened',
  'calculator_used',
  'calculation_completed',
  'tool_search',
  'zero_result_search',
  'related_tool_clicked',
  'share_result',
  'copy_result',
  'unit_changed',
  'currency_changed',
  'outbound_click',
  'form_submitted',
  'affiliate_click',
  'consent_updated',
]);

let analyticsEnabled = false;
let lastPagePath: string | null = null;
let lastCanonical = '';

function currentPageMetadata(path: string) {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href
    ?? `https://figurenest.com${path === '/' ? '/' : `${path}/`}`;
  return { canonical, title: document.title };
}

export function isAnalyticsEligible(hostname: string, pathname: string): boolean {
  const path = normalizeRoutePath(pathname);
  return PRODUCTION_HOSTS.has(hostname.trim().toLowerCase())
    && isLikelyIndexableRoute(path);
}

export function safeAnalyticsData(data?: AnalyticsData): AnalyticsData | undefined {
  if (!data) return undefined;
  const result: AnalyticsData = {};
  for (const [key, value] of Object.entries(data)) {
    if (!allowedFields.has(key)) continue;
    if (typeof value === 'string' && (value.length > 80 || !/^[a-z0-9_.-]+$/i.test(value))) continue;
    result[key] = value;
  }
  return Object.keys(result).length ? result : undefined;
}

function setGoogleConsent(analytics: 'granted' | 'denied'): void {
  window.gtag?.('consent', 'update', {
    analytics_storage: analytics,
  });
}

export function disableAnalyticsProviders(): void {
  analyticsEnabled = false;
  lastPagePath = null;
  lastCanonical = '';
  if (typeof window === 'undefined') return;
  setGoogleConsent('denied');
  document.getElementById(GA_SCRIPT_ID)?.remove();
  clearAccessibleGaCookies();
}

export function trackPageView(pathname: string): void {
  if (typeof window === 'undefined' || !analyticsEnabled) return;
  const path = normalizeRoutePath(pathname);
  if (!isAnalyticsEligible(window.location.hostname, path) || !renderedPageIsIndexable() || path === lastPagePath) return;
  const seo = currentPageMetadata(path);
  const pageReferrer = lastCanonical;
  lastPagePath = path;
  lastCanonical = seo.canonical;
  try {
    window.gtag?.('event', 'page_view', {
      page_location: seo.canonical,
      page_path: path,
      page_title: seo.title,
      page_referrer: pageReferrer,
    });
    const calculatorMatch = /^\/calculators\/([^/]+)\/([^/]+)$/.exec(path);
    const converterMatch = /^\/converters\/([^/]+)$/.exec(path);
    if (calculatorMatch || converterMatch) {
      window.gtag?.('event', 'calculator_opened', {
        calculator_slug: calculatorMatch?.[2] ?? converterMatch?.[1],
        calculator_group: calculatorMatch?.[1] ?? 'converter',
      });
    }
  } catch {
    // Analytics must never break the app.
  }
}

export function configureConsent(preferences: ConsentPreferences | null): void {
  if (typeof window === 'undefined') return;
  const eligible = isProduction
    && isAnalyticsEligible(window.location.hostname, window.location.pathname);
  analyticsEnabled = eligible && preferences?.analytics === true;
  if (!analyticsEnabled) {
    disableAnalyticsProviders();
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
  window.gtag('js', new Date());
  setGoogleConsent('granted');
  const path = normalizeRoutePath(window.location.pathname);
  const seo = currentPageMetadata(path);
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: seo.canonical,
    page_path: path,
    page_title: seo.title,
    page_referrer: '',
  });
  if (!document.getElementById(GA_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = GA_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }
  trackPageView(window.location.pathname);
}

export function trackEvent(name: string, data?: AnalyticsData): void {
  if (
    typeof window === 'undefined'
    || !analyticsEnabled
    || !isAnalyticsEligible(window.location.hostname, window.location.pathname)
    || !renderedPageIsIndexable()
    || !allowedEvents.has(name)
  ) return;

  try {
    const path = normalizeRoutePath(window.location.pathname);
    const seo = currentPageMetadata(path);
    window.gtag?.('event', name, {
      ...(safeAnalyticsData(data) ?? {}),
      page_location: seo.canonical,
      page_path: path,
      page_title: seo.title,
      page_referrer: seo.canonical,
    });
  } catch {
    // Analytics must never break the app.
  }
}