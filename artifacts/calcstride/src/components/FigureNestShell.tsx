import { lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Calculator, Menu, Search, X } from 'lucide-react';
import '@/styles/result-containment.css';
import { localCategories, localTools } from '@/lib/catalog';
import { ConsentManager, openConsentPreferences } from '@/components/ConsentManager';
import { AdSenseLoader } from '@/components/AdSenseLoader';
import { CalculatorExportActions } from '@/components/CalculatorExportActions';
import { Link } from '@/components/PublicLink';
import { normalizeRoutePath } from '@/lib/public-url';
import { FigureNestLogo } from '@/components/FigureNestLogo';
import { isPrivateRoute, renderedPageIsIndexable } from '@/lib/route-policy';
import { SiteBreadcrumbs } from '@/components/SiteBreadcrumbs';
import { getRelatedTools } from '@/lib/related-tools';

const seoEducationalContent = import.meta.env.SSR ? await import('@/components/SeoEducationalContent') : null;
const SeoEducationalContent = seoEducationalContent?.SeoEducationalContent
  ?? lazy(() => import('@/components/SeoEducationalContent').then(({ SeoEducationalContent: component }) => ({ default: component })));
const DeferredAdSlot = lazy(() => import('@/components/AdSlot').then(({ AdSlot: component }) => ({ default: component })));

export function Logo({ compactOnMobile = false }: { compactOnMobile?: boolean }) {
  return <Link href="/" className={`brand-mark${compactOnMobile ? ' brand-mark-responsive' : ''}`} aria-label="FigureNest home" data-testid="link-home">
    <FigureNestLogo className="brand-logo-full" aria-hidden="true" />
    {compactOnMobile && <FigureNestLogo compact className="brand-logo-compact" aria-hidden="true" />}
  </Link>;
}

export function Shell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const [location] = useLocation();
  const nav = [
    { href: '/calculators', label: 'All calculators' },
    { href: '/category/finance', label: 'Money & Finance', match: ['/category/finance', '/calculators/finance'] },
    { href: '/category/salary-work', label: 'Salary & Work', match: ['/category/salary-work', '/calculators/salary-work'] },
    { href: '/home-construction', label: 'Home & Construction', match: ['/home-construction', '/calculators/construction'] },
    { href: '/category/converters', label: 'Converters', match: ['/category/converters', '/converters'] },
  ];
  const isActive = (item: (typeof nav)[number]) => item.href === '/'
    ? location === '/'
    : item.match?.some((prefix) => location.startsWith(prefix));
  const currentTool = localTools.find((tool) => normalizeRoutePath(tool.href) === normalizeRoutePath(location));
  const relatedTools = currentTool ? getRelatedTools(currentTool.slug, 3) : [];
  const categoryLinks = localCategories.map((category) => ({
    href: category.slug === 'construction' ? '/home-construction' : `/category/${category.slug}`,
    label: category.name,
  }));
  const categoryLinkColumns = [
    categoryLinks.slice(0, Math.ceil(categoryLinks.length / 2)),
    categoryLinks.slice(Math.ceil(categoryLinks.length / 2)),
  ];
  const [advertisingEligible, setAdvertisingEligible] = useState(false);
  const [deferredServicesReady, setDeferredServicesReady] = useState(false);
  const decisionNotice = currentTool?.categorySlug === 'health'
    ? 'This tool provides an educational estimate, not a diagnosis or treatment recommendation. Check important health decisions with an appropriate qualified professional.'
    : currentTool?.categorySlug === 'finance'
      ? 'This tool provides a general estimate, not financial, tax, legal, or investment advice. Verify rates, fees, rules, and material decisions with current documents or an appropriate qualified professional.'
      : currentTool?.categorySlug === 'construction'
        ? 'This planning estimate cannot account for every site condition, product specification, permit, or local code. Confirm quantities and safety-critical decisions with current documents and an appropriate qualified professional.'
        : null;
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAdvertisingEligible(renderedPageIsIndexable()));
    return () => cancelAnimationFrame(frame);
  }, [location]);
  useEffect(() => {
    const activate = () => setDeferredServicesReady(true);
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idle = idleWindow.requestIdleCallback(activate, { timeout: 3000 });
      return () => idleWindow.cancelIdleCallback?.(idle);
    }
    const timer = globalThis.setTimeout(activate, 1800);
    return () => globalThis.clearTimeout(timer);
  }, []);
  const closeMenu = (returnFocus = false) => {
    setMobileOpen(false);
    if (returnFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  };
  useEffect(() => {
    if (!mobileOpen) return;
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('a')?.focus());
  }, [mobileOpen]);
  const onMenuKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...(menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return <div className="site-frame">
    <AdSenseLoader eligible={advertisingEligible} />
    <header className="topbar">
      <Logo compactOnMobile />
      <nav ref={menuRef} id="primary-navigation" className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary navigation" onKeyDown={onMenuKeyDown}>
        {nav.map((item) => <Link key={item.href} href={item.href} className={isActive(item) ? 'active' : ''} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => closeMenu()}>{item.label}</Link>)}
        <Link href="/about" data-testid="link-about" onClick={() => closeMenu()}>About</Link>
        <Link href="/contact" className="mobile-nav-contact" onClick={() => closeMenu()}>Contact</Link>
      </nav>
      <div className="top-actions">
        <Link href="/#search" className="icon-button" aria-label="Search calculators" data-testid="link-search"><Search size={18} aria-hidden="true" /></Link>
        <Link href="/contact" className="small-button" data-testid="link-contact">Contact <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
      <button ref={menuButtonRef} className="menu-toggle" onClick={() => mobileOpen ? closeMenu(true) : setMobileOpen(true)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="primary-navigation" data-testid="button-toggle-menu">{mobileOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}</button>
    </header>
    <main><SiteBreadcrumbs path={location} isPrivate={isPrivateRoute(location)} />{children}{currentTool && <CalculatorExportActions title={currentTool.name} href={currentTool.href} />}<Suspense fallback={null}><SeoEducationalContent /></Suspense>{decisionNotice && <aside className="decision-notice" aria-label="Important limitation"><strong>Before relying on this result</strong><p>{decisionNotice}</p></aside>}</main>
    {deferredServicesReady && <Suspense fallback={null}><DeferredAdSlot eligible={advertisingEligible} /></Suspense>}
    <footer className="footer">
      <div className="footer-brand"><Logo /><p>Clear answers for the numbers<br />behind your next move.</p></div>
      <div className="footer-links">{relatedTools.length > 0 && <div><strong>Related tools</strong>{relatedTools.map((tool) => <Link href={tool.href} key={tool.slug}>{tool.name}</Link>)}</div>}<div><strong>Explore</strong><Link href="/calculators">All calculators</Link>{categoryLinkColumns[0].map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}</div><div><strong>More categories</strong>{categoryLinkColumns[1].map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}</div><div><strong>Learn & Follow</strong><Link href="/articles">Practical guides</Link><Link href="/methodology">Methodology</Link><Link href="/about">About FigureNest</Link><Link href="/contact">Contact</Link><a href="https://www.facebook.com/share/1BN1QQpjjm/" target="_blank" rel="noopener noreferrer">Facebook</a><a href="https://www.instagram.com/figurenest_com?stkn=MXU4ZnlleGJuc3J1cg==" target="_blank" rel="noopener noreferrer">Instagram</a></div><div><strong>Policies</strong><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><Link href="/terms">Terms</Link><Link href="/disclaimer">Disclaimer</Link></div></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} FigureNest</span><button className="footer-preferences" onClick={openConsentPreferences}>Privacy / Cookie preferences</button><span className="mono">CALCULATE. CONVERT. FIGURE IT OUT.</span></div>
    </footer>
    <ConsentManager />
  </div>;
}

export function ToolIcon({ category }: { category?: string }) {
  return <span className="tool-icon" aria-hidden="true"><Calculator size={18} strokeWidth={1.8} /></span>;
}
