import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Clock3, ShieldCheck } from 'lucide-react';
import type { Category, Tool } from '@workspace/api-client-react';
import { localCategories, localTools, publishedToolCount } from '@/lib/catalog';
import { Shell, ToolIcon } from '@/components/FigureNestShell';
import { trackEvent } from '@/lib/analytics';
import { Link } from '@/components/PublicLink';
import { isCanonicalHostname } from '@/lib/public-url';
import { homepageArticlePreviews, homepageFaqData } from '@/lib/homepage-content';
import { FigureNestLogo } from '@/components/FigureNestLogo';

function Seo() {
  useEffect(() => {
    let cancelled = false;
    void import('@/lib/seo').then(({ getSeoForPath, SITE_NAME, SOCIAL_IMAGE_ALT, SOCIAL_IMAGE_URL }) => {
      if (cancelled) return;
      const seo = getSeoForPath('/');
      document.title = seo.title;
      const setMeta = (selector: string, attribute: string, value: string) => {
        const element = document.querySelector(selector) ?? document.head.appendChild(document.createElement('meta'));
        element.setAttribute(attribute, value);
      };
      setMeta('meta[name="description"]', 'content', seo.description);
      setMeta('meta[name="robots"]', 'content', isCanonicalHostname(window.location.hostname) ? seo.robots : 'noindex, nofollow');
      setMeta('meta[property="og:title"]', 'content', seo.title);
      setMeta('meta[property="og:description"]', 'content', seo.description);
      setMeta('meta[property="og:url"]', 'content', seo.canonical);
      setMeta('meta[property="og:type"]', 'content', 'website');
      setMeta('meta[property="og:site_name"]', 'content', SITE_NAME);
      setMeta('meta[property="og:image"]', 'content', SOCIAL_IMAGE_URL);
      setMeta('meta[property="og:image:width"]', 'content', '1200');
      setMeta('meta[property="og:image:height"]', 'content', '630');
      setMeta('meta[property="og:image:alt"]', 'content', SOCIAL_IMAGE_ALT);
      setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
      setMeta('meta[name="twitter:title"]', 'content', seo.title);
      setMeta('meta[name="twitter:description"]', 'content', seo.description);
      setMeta('meta[name="twitter:image"]', 'content', SOCIAL_IMAGE_URL);
      setMeta('meta[name="twitter:image:alt"]', 'content', SOCIAL_IMAGE_ALT);
      const canonical = document.querySelector('link[rel="canonical"]') ?? document.head.appendChild(document.createElement('link'));
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', seo.canonical);
      let schema = document.getElementById('figurenest-structured-data');
      if (!schema) {
        schema = document.createElement('script');
        schema.id = 'figurenest-structured-data';
        schema.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schema);
      }
      schema.textContent = JSON.stringify(seo.schema);
    });
    return () => { cancelled = true; };
  }, []);
  return null;
}

function ArrowUpRight() {
  return <ArrowRight size={16} className="-rotate-45" aria-hidden="true" />;
}

function ToolCard({ tool }: { tool: Tool }) {
  return <Link href={tool.href} className="tool-card" data-testid={`card-tool-${tool.slug}`}>
    <div className="tool-card-top"><ToolIcon category={tool.category} /><span className="arrow-circle" aria-hidden="true"><ArrowUpRight /></span></div>
    <div className="tool-category mono">{tool.category}</div><h3>{tool.name}</h3><p>{tool.description}</p>
    <div className="tool-card-foot"><span>Open tool</span><ArrowRight size={15} aria-hidden="true" /></div>
  </Link>;
}

function SearchBox({ tools }: { tools: Tool[] }) {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [, navigate] = useLocation();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastZeroResultSearch = useRef('');
  const results = useMemo(() => search.trim() ? tools.filter((tool) => `${tool.name} ${tool.description} ${tool.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : [], [search, tools]);

  useEffect(() => {
    const normalized = search.trim().toLowerCase();
    if (!focused || normalized.length < 2 || results.length || normalized === lastZeroResultSearch.current) return;
    const timeout = window.setTimeout(() => {
      lastZeroResultSearch.current = normalized;
      trackEvent('zero_result_search', { search_result_state: 'zero' });
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [focused, results.length, search]);

  useEffect(() => {
    const focusSearch = () => {
      if (window.location.hash === '#search') requestAnimationFrame(() => inputRef.current?.focus());
    };
    const onShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    focusSearch();
    window.addEventListener('hashchange', focusSearch);
    document.addEventListener('keydown', onShortcut);
    return () => {
      window.removeEventListener('hashchange', focusSearch);
      document.removeEventListener('keydown', onShortcut);
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocused(true);
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocused(true);
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const tool = results[activeIndex];
      setFocused(false);
      setActiveIndex(-1);
      trackEvent('tool_search', { destination_slug: tool.slug });
      navigate(tool.href);
    } else if (event.key === 'Escape') {
      setFocused(false);
      setActiveIndex(-1);
    }
  };

  return <div className="search-wrap" id="search">
    <FigureNestLogo compact className="search-glyph" aria-hidden="true" />
    <input ref={inputRef} value={search} onChange={(event) => { setSearch(event.target.value); setActiveIndex(-1); }} onKeyDown={onKeyDown} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} placeholder="What do you want to figure out?" aria-label="Search calculators" role="combobox" aria-autocomplete="list" aria-expanded={Boolean(focused && search)} aria-controls={listboxId} aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined} autoComplete="off" data-testid="input-search-calculators" />
    <span className="search-shortcut mono">⌘ K</span>
    {focused && search && <div id={listboxId} className="search-results" role="listbox" aria-label="Calculator search results">{results.length ? results.map((tool, index) => <Link href={tool.href} id={`${listboxId}-${index}`} key={tool.slug} role="option" aria-selected={index === activeIndex} className={index === activeIndex ? 'is-active' : ''} data-testid={`result-search-${tool.slug}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => { setFocused(false); setActiveIndex(-1); trackEvent('tool_search', { destination_slug: tool.slug }); }}><ToolIcon /><span><strong>{tool.name}</strong><small>{tool.category}</small></span><ArrowRight size={15} aria-hidden="true" /></Link>) : <div className="search-empty" role="status">No matching tool yet. Try “loan”, “time”, or “length”.</div>}</div>}
  </div>;
}

export function HomePage() {
  const tools = localTools as Tool[];
  const categories = localCategories as Category[];
  const featured = tools.filter((tool) => tool.featured).slice(0, 6);

  return <Shell><Seo />
    <section className="hero">
      <div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-dot" /> CALCULATE. CONVERT. FIGURE IT OUT.</div><h1><span>Free Online Calculators &amp; Converters</span><em>Figure It Out Faster.</em></h1><p>FigureNest helps you work through money, construction, health, maths, science, technology, vehicles, business, work, conversions, dates, print, education, and everyday questions. Get clear inputs, transparent methods, and useful context with no sign-up.</p><SearchBox tools={tools} /><div className="hero-notes"><span><ShieldCheck size={16} aria-hidden="true" /> Free to use</span><span><Clock3 size={16} aria-hidden="true" /> Takes less than a minute</span></div></div>
      <aside className="hero-summary reveal delay-2" aria-label="FigureNest toolkit summary"><span className="mono">FIGURENEST / TOOLKIT</span><strong data-testid="text-toolkit-count">{publishedToolCount}</strong><p>Tools for forward motion</p><small>Precision without the fuss</small></aside>
    </section>
    <section className="trust-strip"><div><span className="mono" aria-hidden="true">///</span> A practical toolkit for <strong>real decisions</strong></div><div className="trust-stats"><span data-testid="text-published-tool-count">{publishedToolCount} published tools</span><span>{categories.length} active categories</span><span className="status-pill online"><i aria-hidden="true" /> No sign-up required</span></div></section>
    <section className="section-block"><div className="section-heading"><div><div className="eyebrow">START HERE</div><h2>Popular for a reason.</h2></div><Link href="/category/finance" className="text-link" data-testid="link-view-money">Browse money tools <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="featured-grid">{featured.map((tool) => <ToolCard tool={tool} key={tool.slug} />)}</div></section>
    <section className="category-band"><div className="section-heading"><div><div className="eyebrow">THE FULL TOOLKIT</div><h2>Pick a lane. Keep moving.</h2></div><span className="muted-copy">Built around the questions that<br />come up most often.</span></div><div className="category-grid">{categories.map((category, index) => <Link href={category.slug === 'construction' ? '/home-construction' : `/category/${category.slug}`} className="category-tile" key={category.slug} style={{ '--tile-accent': category.accent } as CSSProperties} data-testid={`card-category-${category.slug}`}><span className="tile-index mono" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{category.name}</h3><p>{category.description}</p><span className="category-count mono">{category.toolCount} tools <ArrowUpRight /></span></Link>)}</div></section>
    <section className="principles"><div className="principle-mark" aria-hidden="true">+</div><div><div className="eyebrow">WHY FIGURENEST</div><h2>Useful beats impressive.</h2><p>Every result is paired with the method, assumptions, or context needed to read it responsibly. We make quiet, careful tools for everyday estimates and comparisons.</p></div><div className="principle-list"><div><span className="mono" aria-hidden="true">01</span><strong>Clear by default</strong><p>Plain labels, helpful context, and visible calculation methods.</p></div><div><span className="mono" aria-hidden="true">02</span><strong>Private inputs</strong><p>Public calculator values are processed in your browser and never require an account.</p></div><div><span className="mono" aria-hidden="true">03</span><strong>Accessible anywhere</strong><p>Keyboard-friendly controls and responsive layouts support desktop and mobile use.</p></div><div><span className="mono" aria-hidden="true">04</span><strong>Open to corrections</strong><p>We review reported issues and update confirmed errors or unclear instructions.</p></div></div></section>
    <section className="section-block" style={{ paddingTop: 0 }}><div className="home-methodology"><div><div className="eyebrow" style={{ marginBottom: 8 }}>TRANSPARENCY</div><h2>How we calculate.</h2><p>Numbers should not be a black box. We explain the formulas, units, assumptions, and limitations that shape each result.</p><Link href="/methodology" className="text-link">Read our full methodology <ArrowRight size={16} aria-hidden="true" /></Link></div><div><ul><li><strong>Defined methods:</strong> Each tool starts with a stated formula or conversion relationship suited to a general estimate.</li><li><strong>Input checks:</strong> Required, invalid, boundary, and unit-sensitive values are checked where the calculation needs them.</li><li><strong>Useful rounding:</strong> Results are formatted for their context, so displayed values may be rounded from the underlying calculation.</li><li><strong>Clear limits:</strong> Assumptions and omitted real-world factors explain when to verify an estimate elsewhere.</li></ul></div></div></section>
    <section className="section-block" style={{ paddingTop: 0 }}><div className="section-heading"><div><div className="eyebrow">LEARN MORE</div><h2>Guides &amp; basics.</h2></div><Link href="/articles" className="text-link">Browse all guides <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="home-articles-grid">{homepageArticlePreviews.map((article) => <Link href={article.href} key={article.href} className="home-article-card"><span className="mono">Guide</span><h3>{article.title}</h3><p>{article.description}</p><div><span>Read guide</span> <ArrowRight size={14} aria-hidden="true" /></div></Link>)}</div></section>
    <section className="home-faq-section"><h2>Frequently asked questions</h2><div className="home-faq-list">{homepageFaqData.map((faq, i) => <details key={i} className="home-faq-item"><summary>{faq.question}</summary><div className="faq-answer">{faq.answer}{' '}{faq.linkText && faq.linkHref && <Link href={faq.linkHref}>{faq.linkText}</Link>}</div></details>)}</div></section>
  </Shell>;
}
