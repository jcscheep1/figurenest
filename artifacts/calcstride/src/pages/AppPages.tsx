import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ArrowLeft, ArrowRight, Check, Clock3, Copy, ShieldCheck, Sparkles } from 'lucide-react';
import type { Category, Tool } from '@workspace/api-client-react';
import { localCategories, localTools, publishedToolCount, findLocalTool } from '@/lib/catalog';
import { Shell, ToolIcon } from '@/components/FigureNestShell';
import { trackEvent } from '@/lib/analytics';
import { Link } from '@/components/PublicLink';
import { isCanonicalHostname } from '@/lib/public-url';
import { calculateCore, convertCore, converterUnits, coreFields, coreMethodology, type CoreField } from '@/lib/core-calculators';
import { homepageArticlePreviews, homepageFaqData } from '@/lib/homepage-content';
import { categoryContent } from '@/lib/category-content';
import { FigureNestLogo } from '@/components/FigureNestLogo';
import { CurrencySelector } from '@/components/UnitsPreferencesSelectors';
import { convertUnitValue, currencyPrefix, formatConvertedInput, localizeCurrencyText, unitRegistry, useUnitsPreferences, type CurrencyCode, type UnitKey } from '@/lib/units-preferences';
import { getCalculatorSeoCapability } from '@/lib/seo-capabilities';

export function Seo({ path = '/' }: { path?: string; title?: string; description?: string; type?: string; schema?: object }) {
  useEffect(() => {
    let cancelled = false;
    void import('@/lib/seo').then(({ getSeoForPath, SITE_NAME, SOCIAL_IMAGE_ALT, SOCIAL_IMAGE_URL }) => {
    if (cancelled) return;
    const seo = getSeoForPath(path);
    document.title = seo.title;
    const setMeta = (selector: string, attribute: string, value: string) => {
      const element = document.querySelector(selector) ?? document.head.appendChild(Object.assign(document.createElement('meta'), { }));
      element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', 'content', seo.description);
    setMeta(
      'meta[name="robots"]',
      'content',
      isCanonicalHostname(window.location.hostname) ? seo.robots : 'noindex, nofollow',
    );
    setMeta('meta[property="og:title"]', 'content', seo.title);
    setMeta('meta[property="og:description"]', 'content', seo.description);
    setMeta('meta[property="og:url"]', 'content', seo.canonical);
    setMeta('meta[property="og:type"]', 'content', path.startsWith('/articles/') && seo.status === 200 ? 'article' : 'website');
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
    const canonical = document.querySelector('link[rel="canonical"]') ?? document.head.appendChild(Object.assign(document.createElement('link'), { }));
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', seo.canonical);
     let schemaElement = document.getElementById('figurenest-structured-data');
    if (!schemaElement) {
      schemaElement = document.createElement('script');
       schemaElement.id = 'figurenest-structured-data';
      schemaElement.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaElement);
    }
    schemaElement.textContent = JSON.stringify(seo.schema);
    });
    return () => { cancelled = true; };
  }, [path]);
  return null;
}

type Field = CoreField;

function useCatalog() {
  return { tools: localTools as Tool[], categories: localCategories as Category[] };
}

export function ToolCard({ tool, sourceSlug }: { tool: Tool; sourceSlug?: string }) {
  return <Link href={tool.href} className="tool-card" data-testid={`card-tool-${tool.slug}`} onClick={() => sourceSlug && trackEvent('related_tool_clicked', { source_slug: sourceSlug, destination_slug: tool.slug })}>
    <div className="tool-card-top"><ToolIcon category={tool.category} /><span className="arrow-circle" aria-hidden="true"><ArrowUpRight /></span></div>
    <div className="tool-category mono">{tool.category}</div><h3>{tool.name}</h3><p>{tool.description}</p>
    <div className="tool-card-foot"><span>Open tool</span><ArrowRight size={15} aria-hidden="true" /></div>
  </Link>;
}

function ArrowUpRight() { return <ArrowRight size={16} className="-rotate-45" aria-hidden="true" />; }

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
    <SearchGlyph />
    <input ref={inputRef} value={search} onChange={(event) => { setSearch(event.target.value); setActiveIndex(-1); }} onKeyDown={onKeyDown} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} placeholder="What do you want to figure out?" aria-label="Search calculators" role="combobox" aria-autocomplete="list" aria-expanded={Boolean(focused && search)} aria-controls={listboxId} aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined} autoComplete="off" data-testid="input-search-calculators" />
    <span className="search-shortcut mono">⌘ K</span>
    {focused && search && <div id={listboxId} className="search-results" role="listbox" aria-label="Calculator search results">{results.length ? results.map((tool, index) => <Link href={tool.href} id={`${listboxId}-${index}`} key={tool.slug} role="option" aria-selected={index === activeIndex} className={index === activeIndex ? 'is-active' : ''} data-testid={`result-search-${tool.slug}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => { setFocused(false); setActiveIndex(-1); trackEvent('tool_search', { destination_slug: tool.slug }); }}><ToolIcon /><span><strong>{tool.name}</strong><small>{tool.category}</small></span><ArrowRight size={15} aria-hidden="true" /></Link>) : <div className="search-empty" role="status">No matching tool yet. Try “loan”, “time”, or “length”.</div>}</div>}
  </div>;
}

function SearchGlyph() { return <FigureNestLogo compact className="search-glyph" aria-hidden="true" />; }

export function HomePage() {
  const { tools, categories } = useCatalog();
  const featured = tools.filter((tool) => tool.featured).slice(0, 6);
     return <Shell><Seo path="/" /><section className="hero">
     <div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-dot" /> CALCULATE. CONVERT. FIGURE IT OUT.</div><h1><span>Free Online Calculators &amp; Converters</span><em>Figure It Out Faster.</em></h1><p>FigureNest helps you work through money, construction, health, maths, science, technology, vehicles, business, work, conversions, dates, print, education, and everyday questions. Get clear inputs, transparent methods, and useful context with no sign-up.</p><SearchBox tools={tools} /><div className="hero-notes"><span><ShieldCheck size={16} aria-hidden="true" /> Free to use</span><span><Clock3 size={16} aria-hidden="true" /> Takes less than a minute</span></div></div>
      <aside className="hero-summary reveal delay-2" aria-label="FigureNest toolkit summary"><span className="mono">FIGURENEST / TOOLKIT</span><strong data-testid="text-toolkit-count">{publishedToolCount}</strong><p>Tools for forward motion</p><small>Precision without the fuss</small></aside>
  </section>
   <section className="trust-strip"><div><span className="mono" aria-hidden="true">///</span> A practical toolkit for <strong>real decisions</strong></div><div className="trust-stats"><span data-testid="text-published-tool-count">{publishedToolCount} published tools</span><span>{categories.length} active categories</span><span className="status-pill online"><i aria-hidden="true" /> No sign-up required</span></div></section>
  <section className="section-block"><div className="section-heading"><div><div className="eyebrow">START HERE</div><h2>Popular for a reason.</h2></div><Link href="/category/finance" className="text-link" data-testid="link-view-money">Browse money tools <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="featured-grid">{featured.map((tool) => <ToolCard tool={tool} key={tool.slug} />)}</div></section>
   <section className="category-band"><div className="section-heading"><div><div className="eyebrow">THE FULL TOOLKIT</div><h2>Pick a lane. Keep moving.</h2></div><span className="muted-copy">Built around the questions that<br />come up most often.</span></div><div className="category-grid">{categories.map((category, index) => <Link href={category.slug === 'construction' ? '/home-construction' : `/category/${category.slug}`} className="category-tile" key={category.slug} style={{ '--tile-accent': category.accent } as CSSProperties} data-testid={`card-category-${category.slug}`}><span className="tile-index mono" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{category.name}</h3><p>{category.description}</p><span className="category-count mono">{category.toolCount} tools <ArrowUpRight /></span></Link>)}</div></section>
   <section className="principles"><div className="principle-mark" aria-hidden="true">+</div><div><div className="eyebrow">WHY FIGURENEST</div><h2>Useful beats impressive.</h2><p>Every result is paired with the method, assumptions, or context needed to read it responsibly. We make quiet, careful tools for everyday estimates and comparisons.</p></div><div className="principle-list"><div><span className="mono" aria-hidden="true">01</span><strong>Clear by default</strong><p>Plain labels, helpful context, and visible calculation methods.</p></div><div><span className="mono" aria-hidden="true">02</span><strong>Private inputs</strong><p>Public calculator values are processed in your browser and never require an account.</p></div><div><span className="mono" aria-hidden="true">03</span><strong>Accessible anywhere</strong><p>Keyboard-friendly controls and responsive layouts support desktop and mobile use.</p></div><div><span className="mono" aria-hidden="true">04</span><strong>Open to corrections</strong><p>We review reported issues and update confirmed errors or unclear instructions.</p></div></div></section>

   <section className="section-block" style={{ paddingTop: 0 }}>
     <div className="home-methodology">
       <div>
         <div className="eyebrow" style={{ marginBottom: 8 }}>TRANSPARENCY</div>
         <h2>How we calculate.</h2>
         <p>Numbers should not be a black box. We explain the formulas, units, assumptions, and limitations that shape each result.</p>
         <Link href="/methodology" className="text-link">Read our full methodology <ArrowRight size={16} aria-hidden="true" /></Link>
       </div>
       <div>
         <ul>
           <li><strong>Defined methods:</strong> Each tool starts with a stated formula or conversion relationship suited to a general estimate.</li>
           <li><strong>Input checks:</strong> Required, invalid, boundary, and unit-sensitive values are checked where the calculation needs them.</li>
           <li><strong>Useful rounding:</strong> Results are formatted for their context, so displayed values may be rounded from the underlying calculation.</li>
           <li><strong>Clear limits:</strong> Assumptions and omitted real-world factors explain when to verify an estimate elsewhere.</li>
         </ul>
       </div>
     </div>
   </section>

   <section className="section-block" style={{ paddingTop: 0 }}>
     <div className="section-heading"><div><div className="eyebrow">LEARN MORE</div><h2>Guides &amp; basics.</h2></div><Link href="/articles" className="text-link">Browse all guides <ArrowRight size={16} aria-hidden="true" /></Link></div>
     <div className="home-articles-grid">
       {homepageArticlePreviews.map(article => (
         <Link href={article.href} key={article.href} className="home-article-card">
           <span className="mono">Guide</span>
           <h3>{article.title}</h3>
           <p>{article.description}</p>
           <div><span>Read guide</span> <ArrowRight size={14} aria-hidden="true" /></div>
         </Link>
       ))}
     </div>
   </section>

   <section className="home-faq-section">
     <h2>Frequently asked questions</h2>
     <div className="home-faq-list">
       {homepageFaqData.map((faq, i) => (
         <details key={i} className="home-faq-item">
           <summary>{faq.question}</summary>
           <div className="faq-answer">
             {faq.answer}{' '}
             {faq.linkText && faq.linkHref && <Link href={faq.linkHref}>{faq.linkText} <ArrowRight size={14} aria-hidden="true" /></Link>}
           </div>
         </details>
       ))}
     </div>
   </section>
  </Shell>;
}

export function CategoryPage() {
  const [, params] = useRoute('/category/:slug');
  const { tools, categories } = useCatalog();
  const category = categories.find((item) => item.slug === params?.slug) ?? localCategories.find((item) => item.slug === params?.slug);
  const visible = tools.filter((tool) => tool.categorySlug === params?.slug);
  if (!category) return <Shell><NotFoundInner /></Shell>;
  const introduction = categoryContent[category.slug as keyof typeof categoryContent]?.introduction[0] ?? category.description;
  return <Shell><Seo path={`/category/${category.slug}`} /><section className="page-intro category-intro"><Link href="/calculators" className="back-link" data-testid="link-back-home"><ArrowLeft size={15} aria-hidden="true" /> All calculators</Link><div className="eyebrow">CATEGORY / {category.name.toUpperCase()}</div><h1>{category.name}<span>.</span></h1><p>{introduction}</p><div className="intro-meta mono">{visible.length} PUBLISHED TOOLS</div></section><section className="section-block category-results"><div className="section-heading"><h2>Tools in {category.name.toLowerCase()}</h2><span className="mono result-count">{visible.length} RESULTS</span></div>{visible.length ? <div className="tool-list-grid">{visible.map((tool) => <ToolCard tool={tool} key={tool.slug} />)}</div> : <EmptyState />}</section></Shell>;
}

function EmptyState() { return <div className="empty-state"><Sparkles size={22} aria-hidden="true" /><h3>That shelf is still being stocked.</h3><p>Try another category, or search the full toolkit.</p><Link href="/calculators" className="text-link" data-testid="link-empty-home">Back to all tools <ArrowRight size={15} aria-hidden="true" /></Link></div>; }
function NotFoundInner() { return <div className="empty-state"><h1>Not found.</h1><p>That page wandered off. The rest of the toolkit is here.</p><Link href="/" className="text-link" data-testid="link-not-found-home">Return home <ArrowRight size={15} aria-hidden="true" /></Link></div>; }

export function ToolDetailPage({ converter = false }: { converter?: boolean }) {
  const [, calcParams] = useRoute('/calculators/:category/:slug');
  const [, convParams] = useRoute('/converters/:slug');
  const slug = converter ? convParams?.slug : calcParams?.slug;
  const local = findLocalTool(slug);
  const capability = slug ? getCalculatorSeoCapability(slug) : undefined;
  const tool = local && capability ? { ...local, description: `${local.description} ${capability.visibleNote}` } : local;
  const isConverter = converter || tool?.href.startsWith('/converters');
  const converterLabels: Field[] = [{ key: 'value', label: 'Value', value: slug === 'temperature' ? '72' : '10' }];
  const template: Field[] = isConverter ? converterLabels : coreFields[slug ?? ''] ?? [{ key: 'value', label: 'Value', value: '100' }];
  const [values, setInputValues] = useState(template.map((item) => item.value));
  const units = converterUnits[slug ?? ''];
  const unitKeys = units ? Object.keys(units) : [];
  const [fromUnit, setFromUnit] = useState(unitKeys[0] ?? '');
  const [toUnit, setToUnit] = useState(unitKeys[1] ?? unitKeys[0] ?? '');
  const [mode, setMode] = useState('default');
  const [copied, setCopied] = useState(false);
  const { forCalculator, setCalculatorOverride, setCurrency } = useUnitsPreferences();
  const currencySlugs = ['compound-interest', 'loan', 'mortgage', 'savings', 'vat', 'salary', 'overtime', 'roi', 'profit-margin', 'markup', 'break-even'];
  const hasCurrency = currencySlugs.includes(slug ?? '');
  const currency = forCalculator(slug ?? '').currency;
  const [dimensionUnit, setDimensionUnit] = useState<UnitKey>(slug === 'area' ? 'm' : 'm');
  const [resultUnit, setResultUnit] = useState<UnitKey>(slug === 'area' ? 'm2' : 'm3');
  const [printUnit, setPrintUnit] = useState<'in' | 'cm'>('in');
  const [pixelResultUnit, setPixelResultUnit] = useState<'cm' | 'in'>('cm');
  const dimensionCanonicalValues = useRef(template.map(item => Number(item.value)));
  const printWidthInches = useRef(Number(template[1]?.value ?? 0));
  useEffect(() => {
    if (slug !== 'dpi-ppi') return;
    const converted = printUnit === 'in'
      ? printWidthInches.current
      : convertUnitValue(printWidthInches.current, 'in', 'cm');
    if (Number.isFinite(converted)) {
      setInputValues(current => [current[0], formatConvertedInput(converted)]);
    }
  }, [printUnit, slug]);
  const setValues = (next: string[] | ((current: string[]) => string[])) => {
    if (Array.isArray(next) && next.every((value, index) => value === template[index]?.value)) {
      setFromUnit(unitKeys[0] ?? '');
      setToUnit(unitKeys[1] ?? unitKeys[0] ?? '');
      setMode('default');
      setCopied(false);
      dimensionCanonicalValues.current = template.map(item => Number(item.value));
      printWidthInches.current = Number(template[1]?.value ?? 0);
    }
    setInputValues(next);
  };
  if (!tool && !local) return <Shell><NotFoundInner /></Shell>;
  if (tool && tool.href !== (converter ? `/converters/${slug}` : `/calculators/${calcParams?.category}/${slug}`)) {
    return <Shell><NotFoundInner /></Shell>;
  }
  const canonicalValues = (slug === 'area' || slug === 'volume')
    ? values.map((value, index) => value.trim() && Number.isFinite(dimensionCanonicalValues.current[index])
      ? String(dimensionCanonicalValues.current[index])
      : value)
    : slug === 'dpi-ppi' && printUnit === 'cm'
      ? [values[0], String(printWidthInches.current)]
      : values;
  const rawCalculation = isConverter ? convertCore(slug ?? '', values[0], fromUnit, toUnit) : calculateCore(slug ?? '', canonicalValues, mode, { currency });
  const calculation = rawCalculation;
  const result = (slug === 'area' || slug === 'volume') && !calculation.error
    ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(unitRegistry[resultUnit].fromCanonical(dimensionCanonicalValues.current.reduce((total, value) => total * value, 1)))} ${unitRegistry[resultUnit].symbol}`
    : slug === 'pixels-to-cm' && !calculation.error && pixelResultUnit === 'in'
      ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(values[0]) / Number(values[1]))} in`
      : calculation.primary;
  const update = (index: number, value: string) => {
    const number = Number(value);
    if ((slug === 'area' || slug === 'volume') && value.trim() && Number.isFinite(number)) {
      dimensionCanonicalValues.current[index] = unitRegistry[dimensionUnit].toCanonical(number);
    }
    if (slug === 'dpi-ppi' && index === 1 && value.trim() && Number.isFinite(number)) {
      printWidthInches.current = printUnit === 'in' ? number : convertUnitValue(number, 'cm', 'in');
    }
    setValues((current) => current.map((item, i) => i === index ? value : item));
  };
  const updateDimensionUnit = (next: UnitKey) => {
    if (next === dimensionUnit) return;
    setValues(current => current.map((value, index) => {
      const converted = unitRegistry[next].fromCanonical(dimensionCanonicalValues.current[index]);
      return Number.isFinite(converted) ? formatConvertedInput(converted) : value;
    }));
    setDimensionUnit(next);
    trackEvent('unit_changed', { calculator_slug: slug ?? 'unknown', calculator_group: 'standard', action: 'dimension_unit' });
  };
  const setSelectedCurrency = (nextCurrency: CurrencyCode) => {
    if (nextCurrency === currency) return;
    setCurrency(nextCurrency);
    setCalculatorOverride(slug ?? '', { ...forCalculator(slug ?? '').calculatorOverrides[slug ?? ''], currency: nextCurrency });
    trackEvent('currency_changed', { calculator_slug: slug ?? 'unknown', calculator_group: 'standard', action: 'currency_change' });
  };
  const trackUnitChanged = (action: string) => trackEvent('unit_changed', {
    calculator_slug: slug ?? 'unknown',
    calculator_group: isConverter ? 'converter' : 'standard',
    action,
  });
  const resultIsValid = !calculation.error;
  const related = localTools.filter((candidate) => candidate.categorySlug === tool?.categorySlug && candidate.slug !== slug).slice(0, 3);
  const trackCompleted = () => {
    if (resultIsValid) trackEvent('calculation_completed', { calculator_slug: slug ?? 'unknown', calculator_group: isConverter ? 'converter' : 'standard' });
  };
  const seoPath = tool?.href ?? (converter ? `/converters/${slug}` : `/calculators/${calcParams?.category ?? 'finance'}/${slug}`);
   const methodology = coreMethodology[slug ?? ''];
   const dimensionOptions: UnitKey[] = ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'];
   const outputOptions: UnitKey[] = slug === 'area' ? ['mm2', 'cm2', 'm2', 'km2', 'in2', 'ft2', 'yd2', 'mi2'] : ['mm3', 'cm3', 'm3', 'km3', 'in3', 'ft3', 'yd3', 'mi3'];
   return <Shell><Seo title={`${tool?.name ?? 'Calculator'} | FigureNest`} description={`${tool?.description ?? 'Free online calculator'} Calculate, convert, and figure it out with FigureNest.`} path={seoPath} type="tool" /><section className="calculator-page"><nav className="calc-breadcrumb" aria-label="Breadcrumb"><Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link><Link href={`/category/${tool?.categorySlug}`} data-testid="link-calc-category">{tool?.category}</Link><span className="mono" aria-current="page">/ {tool?.name?.toUpperCase()}</span></nav><div className="calc-layout"><div className="calc-title"><div className="eyebrow"><span className="eyebrow-dot" /> {isConverter ? 'UNIT CONVERTER' : 'CALCULATOR'}</div><h1>{tool?.name}<span>.</span></h1><p>{tool?.description}</p><div className="calc-updated mono"><Clock3 size={14} aria-hidden="true" /> UPDATED {tool?.lastUpdated ?? 'RECENTLY'}</div></div><div className="calculator-card"><div className="calculator-card-head"><span className="mono">{isConverter ? 'CONVERT' : 'CALCULATE'}</span><span className="live-dot"><i /> LIVE RESULT</span></div>{hasCurrency && <label className="calc-field"><span>Currency</span><CurrencySelector value={currency} onChange={setSelectedCurrency} id={`${slug}-currency`} /></label>}{(slug === 'area' || slug === 'volume') && <div className="calc-fields"><label className="calc-field"><span>Dimension unit</span><select value={dimensionUnit} onChange={event => updateDimensionUnit(event.target.value as UnitKey)}>{dimensionOptions.map(key => <option key={key} value={key}>{unitRegistry[key].label}</option>)}</select></label><label className="calc-field"><span>Output unit</span><select value={resultUnit} onChange={event => { if (event.target.value !== resultUnit) { setResultUnit(event.target.value as UnitKey); trackUnitChanged('output_unit'); } }}>{outputOptions.map(key => <option key={key} value={key}>{unitRegistry[key].label}</option>)}</select></label></div>}{slug === 'dpi-ppi' && <label className="calc-field"><span>Print width unit</span><select value={printUnit} onChange={event => { const next = event.target.value as 'in' | 'cm'; if (next === printUnit) return; setValues(current => [current[0], String(convertUnitValue(Number(current[1]), printUnit, next))]); setPrintUnit(next); trackUnitChanged('print_unit'); }}><option value="in">Inches</option><option value="cm">Centimetres</option></select></label>}{slug === 'pixels-to-cm' && <label className="calc-field"><span>Output unit</span><select value={pixelResultUnit} onChange={event => { const next = event.target.value as 'cm' | 'in'; if (next !== pixelResultUnit) { setPixelResultUnit(next); trackUnitChanged('output_unit'); } }}><option value="cm">Centimetres</option><option value="in">Inches</option></select></label>}{slug === 'vat' && <label className="calc-field"><span>Calculation</span><select value={mode} onChange={(event) => setMode(event.target.value)}><option value="default">Add VAT</option><option value="remove">Remove VAT</option></select></label>}{isConverter && units && <div className="calc-fields"><label className="calc-field"><span>From</span><select value={fromUnit} onChange={(event) => { if (event.target.value !== fromUnit) { setFromUnit(event.target.value); trackUnitChanged('from_unit'); } }}>{unitKeys.map(key => <option key={key} value={key}>{units[key].label}</option>)}</select></label><label className="calc-field"><span>To</span><select value={toUnit} onChange={(event) => { if (event.target.value !== toUnit) { setToUnit(event.target.value); trackUnitChanged('to_unit'); } }}>{unitKeys.map(key => <option key={key} value={key}>{units[key].label}</option>)}</select></label></div>}<div className="calc-fields">{template.map((field, index) => <label className="calc-field" key={field.key}><span>{field.label}</span><div>{field.prefix && <b>{field.prefix.replace('$', currencyPrefix(currency))}</b>}<input type={field.type ?? 'number'} min={field.type === 'date' || slug === 'temperature' ? undefined : 0} step="any" value={values[index]} onChange={(event) => update(index, event.target.value)} onBlur={trackCompleted} data-testid={`input-calc-${index}`} />{field.suffix && <small>{(slug === 'area' || slug === 'volume') && ['length', 'width', 'height'].includes(field.key) ? unitRegistry[dimensionUnit].symbol : slug === 'dpi-ppi' && field.key === 'inches' ? printUnit : field.suffix.replace('$', currencyPrefix(currency))}</small>}</div></label>)}</div><div className="calc-result" role="status" aria-live="polite" aria-atomic="true"><span className="mono">YOUR RESULT</span><strong data-testid="text-calculation-result">{localizeCurrencyText(result, currency)}</strong>{calculation.details?.map(detail => <small key={detail.label}>{detail.label}: <b>{localizeCurrencyText(detail.value, currency)}</b></small>)}<button disabled={!resultIsValid} onClick={() => { void navigator.clipboard?.writeText(localizeCurrencyText(result, currency)); trackEvent('copy_result', { calculator_slug: slug ?? 'unknown' }); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="copy-button" data-testid="button-copy-result">{copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />} {copied ? 'Copied' : 'Copy result'}</button></div><button className="reset-button" onClick={() => { setValues(template.map((item) => item.value)); trackEvent('calculator_used', { calculator_slug: slug ?? 'unknown', action: 'reset' }); }} data-testid="button-reset-calculator">Reset values</button></div></div></section><section className="how-section"><div><div className="eyebrow">HOW THIS TOOL WORKS</div><h2>Clear assumptions.<br />Useful estimates.</h2></div><div>{methodology && <><p><strong>Method:</strong> {methodology.method}</p><p><strong>Assumptions:</strong> {methodology.assumptions}</p><p><strong>Example:</strong> {localizeCurrencyText(methodology.example, currency)}</p><p><strong>Limitations:</strong> {methodology.limitation}</p></>}</div></section>{related.length > 0 && <section className="section-block related-section"><div className="section-heading"><div><div className="eyebrow">KEEP GOING</div><h2>Related tools.</h2></div></div><div className="featured-grid">{related.map((candidate) => <ToolCard tool={candidate} sourceSlug={slug} key={candidate.slug} />)}</div></section>}</Shell>;
}
