import { useLayoutEffect, useRef, useState } from 'react';
import '@/styles/construction-pages.css';
import { ArrowLeft, ArrowRight, Check, Copy, Share2 } from 'lucide-react';
import { useRoute } from 'wouter';
import { Seo } from '@/pages/AppPages';
import { Shell, ToolIcon } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { adaptConstructionValues, calculateConstruction, constructionDefaults, constructionTools, constructionUnitLabel, constructionUnitsForField, convertConstructionFieldValue, defaultConstructionFieldUnit, formatConstructionConvertedInput, getConstructionTool, type ConstructionUnit, type UnitSystem } from '@/lib/construction';
import { concreteCalculatorContent, isConcreteCalculatorSlug, type ConcreteCalculatorContent } from '@/lib/concrete-calculators';
import { trackEvent } from '@/lib/analytics';
import { toCanonicalUrl } from '@/lib/public-url';
import { CurrencySelector, MeasurementSystemSelector } from '@/components/UnitsPreferencesSelectors';
import { currencyPrefix, localizeCurrencyText, useUnitsPreferences, type CurrencyCode } from '@/lib/units-preferences';
import { getCalculatorSeoCapability } from '@/lib/seo-capabilities';
import { publishedTools } from '@/lib/catalog';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';

const sectionOrder = ['Concrete', 'Flooring & Tiles', 'Painting', 'Roofing', 'Landscaping', 'Timber & Decking', 'Walls & Building Materials'];

export function HomeConstructionPage() {
  const constructionToolCount = publishedTools.filter((tool) => tool.categorySlug === 'construction').length;
  const btuTool = publishedTools.find((tool) => tool.slug === 'btu');
  return <Shell>
    <Seo
      title="Home & Construction Calculators | FigureNest"
      description="Plan concrete, paint, tile, flooring, roofing, landscaping, timber, fencing, drywall, and brick projects with free practical calculators."
      path="/home-construction"
    />
    <section className="construction-hub-hero">
      <Link href="/" className="back-link"><ArrowLeft size={15} /> All calculators</Link>
      <div className="eyebrow"><span className="eyebrow-dot" /> HOME & CONSTRUCTION</div>
      <h1>Plan the work<br /><em>before the work.</em></h1>
      <p>Measure materials with formulas you can follow. FigureNest’s construction tools turn a tape measure and a few supplier details into a useful first estimate.</p>
      <div className="construction-hub-actions">
        <a href="#concrete" className="primary-button">Start with concrete <ArrowRight size={16} /></a>
        <span className="mono">{constructionToolCount} SPECIALIZED TOOLS</span>
      </div>
    </section>
    <section className="construction-hub-intro">
      <div><div className="eyebrow">A BETTER TAKEOFF</div><h2>Know what to buy<br />before you buy it.</h2></div>
      <p>These estimates are built around the decisions that cause the most waste: thickness, coverage, cuts, slope, spacing, and supplier units. Enter your measurements, keep an allowance that matches the job, and compare the result with the product label or local quote.</p>
    </section>
    <section className="construction-sections">
      {btuTool && <section className="construction-section" id="heating-and-cooling">
        <div className="construction-section-heading"><div><div className="eyebrow">FIELD 01</div><h2>Heating &amp; Cooling</h2></div><span className="mono">1 TOOL</span></div>
        <div className="construction-tool-grid"><Link href={btuTool.href} className="construction-tool-card"><div className="tool-card-top"><ToolIcon /><span className="arrow-circle"><ArrowRight size={16} className="-rotate-45" /></span></div><span className="mono construction-card-label">{btuTool.name.toUpperCase()}</span><h3>{btuTool.name}</h3><p>{btuTool.description}</p><span className="construction-card-link">Open calculator <ArrowRight size={15} /></span></Link></div>
      </section>}
      {sectionOrder.map((section) => {
        const tools = constructionTools.filter((tool) => tool.section === section);
        return <section className="construction-section" id={section.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')} key={section}>
          <div className="construction-section-heading"><div><div className="eyebrow">FIELD {String(sectionOrder.indexOf(section) + 1).padStart(2, '0')}</div><h2>{section}</h2></div><span className="mono">{tools.length} TOOLS</span></div>
          <div className="construction-tool-grid">{tools.map((tool) => <Link href={tool.href} className="construction-tool-card" key={tool.slug}><div className="tool-card-top"><ToolIcon /><span className="arrow-circle"><ArrowRight size={16} className="-rotate-45" /></span></div><span className="mono construction-card-label">{tool.name.toUpperCase()}</span><h3>{tool.name}</h3><p>{tool.description}</p><span className="construction-card-link">Open calculator <ArrowRight size={15} /></span></Link>)}</div>
        </section>;
      })}
    </section>
    <section className="construction-hub-note"><div className="principle-mark">+</div><div><div className="eyebrow">GOOD ESTIMATES HAVE BOUNDARIES</div><h2>Use the result to make a plan, not to skip the plan.</h2><p>Material quantities vary with grade, product coverage, soil, code, access, and the shape of the job. Every calculator shows its method so you can see what is included and what still needs a supplier or professional check.</p><Link href="/articles/construction-materials-estimating" className="text-link">Read the construction materials estimating guide <ArrowRight size={16} aria-hidden="true" /></Link></div></section>
  </Shell>;
}

function RelatedTools({ slugs, sourceSlug }: { slugs: string[]; sourceSlug: string }) {
  return <div className="related-tools"><div className="eyebrow">KEEP GOING</div><div className="related-tool-list">{slugs.map((slug) => { const related = getConstructionTool(slug); return related ? <Link href={related.href} className="related-tool" key={slug} onClick={() => trackEvent('related_tool_clicked', { source_slug: sourceSlug, destination_slug: slug })}><ToolIcon /><span><strong>{related.name}</strong><small>{related.description}</small></span><ArrowRight size={15} /></Link> : null; })}</div></div>;
}

function ConcreteRelatedTools({ content }: { content: ConcreteCalculatorContent }) {
  return <div className="related-tools"><div className="eyebrow">CONNECTED CONCRETE PLANNING</div><div className="related-tool-list">{content.relatedTools.map(({ slug, label, context }) => {
    const related = getConstructionTool(slug);
    return related ? <Link href={related.href} className="related-tool" key={slug} onClick={() => trackEvent('related_tool_clicked', { source_slug: content.slug, destination_slug: slug })}><ToolIcon /><span><strong>{label}</strong><small>{context}</small></span><ArrowRight size={15} /></Link> : null;
  })}</div></div>;
}

export function ConstructionCalculatorPage() {
  const [, params] = useRoute('/calculators/construction/:slug');
  const slug = params?.slug ?? '';
  const tool = getConstructionTool(slug);
  const content = isConcreteCalculatorSlug(slug) ? concreteCalculatorContent[slug] : undefined;
  const capability = getCalculatorSeoCapability(slug);
  const { forCalculator, setCalculatorOverride, setMeasurementSystem, setCurrency: setGlobalCurrency } = useUnitsPreferences();
  const saved = forCalculator(slug);
  const [unit, setUnit] = useState<UnitSystem>('imperial');
  const [values, setValues] = useState<Record<string, string>>(() => constructionDefaults(slug, 'imperial'));
  const [fieldUnits, setFieldUnits] = useState<Record<string, ConstructionUnit | undefined>>(() => Object.fromEntries((tool?.fields ?? []).map(item => [item.key, defaultConstructionFieldUnit(item, 'imperial')])));
  const canonicalUnits = useRef<Record<string, ConstructionUnit | undefined>>({ ...fieldUnits });
  const canonicalValues = useRef<Record<string, number>>(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)])));
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [copied, setCopied] = useState(false);
  useLayoutEffect(() => {
    if (!tool) return;
    const preferred = saved.measurementSystem;
    setCurrency(saved.currency);
    setUnit(current => {
      if (current === preferred) return current;
      const nextUnits = Object.fromEntries(tool.fields.map(item => [item.key, defaultConstructionFieldUnit(item, preferred)]));
      setValues(currentValues => Object.fromEntries(tool.fields.map(item => {
        const from = canonicalUnits.current[item.key];
        const to = nextUnits[item.key];
        const number = canonicalValues.current[item.key];
        return [item.key, from && to && Number.isFinite(number) ? formatConstructionConvertedInput(convertConstructionFieldValue(number, from, to), to) : currentValues[item.key]];
      })));
      setFieldUnits(nextUnits);
      return preferred;
    });
  }, [tool, saved.measurementSystem, saved.currency]);
  if (!tool) return <Shell><section className="page-intro"><h1>Calculator not found.</h1><Link href="/home-construction" className="text-link">Back to Home & Construction <ArrowRight size={15} /></Link></section></Shell>;
  const exactValues = Object.fromEntries(tool.fields.map(item => {
    const from = canonicalUnits.current[item.key];
    const to = fieldUnits[item.key];
    const canonical = canonicalValues.current[item.key];
    return [item.key, values[item.key]?.trim() && from && to && Number.isFinite(canonical)
      ? String(convertConstructionFieldValue(canonical, from, to))
      : values[item.key]];
  }));
  const engineValues = adaptConstructionValues(exactValues, tool, fieldUnits, unit);
  const isMonetary = slug === 'concrete-cost' || slug === 'gravel';
  const result = calculateConstruction(slug, engineValues, unit, currency);
  const a11y = calculatorFieldA11y(`construction-${slug}`, result.error);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebApplication', name: tool.name, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: toCanonicalUrl(tool.href), description: tool.description },
      { '@type': 'FAQPage', mainEntity: tool.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) },
    ],
  };
  const analyticsDimensions = { calculator_slug: slug, unit_system: unit };
  const trackSuccessfulCalculation = (nextValues: Record<string, string>, nextUnit: UnitSystem) => {
     const nextResult = calculateConstruction(slug, adaptConstructionValues(nextValues, tool, fieldUnits, nextUnit), nextUnit, currency);
    if (!nextResult.error) trackEvent('calculation_completed', { calculator_slug: slug, unit_system: nextUnit, calculator_group: 'construction' });
  };
  const updateUnit = (next: UnitSystem) => {
    if (next === unit) return;
    const nextFieldUnits = Object.fromEntries(tool.fields.map(item => [item.key, defaultConstructionFieldUnit(item, next)]));
    const nextValues = Object.fromEntries(tool.fields.map(item => {
      const source = canonicalUnits.current[item.key];
      const destination = nextFieldUnits[item.key];
      const value = canonicalValues.current[item.key];
      return [item.key, source && destination && Number.isFinite(value) ? formatConstructionConvertedInput(convertConstructionFieldValue(value, source, destination), destination) : values[item.key]];
    }));
    setUnit(next);
    setValues(nextValues);
    setFieldUnits(nextFieldUnits);
    setMeasurementSystem(next);
    setCalculatorOverride(slug, { ...saved, measurementSystem: next });
    setCopied(false);
    trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'construction', unit_system: next, action: 'measurement_system' });
  };
  const update = (key: string, value: string) => {
    const source = fieldUnits[key];
    const target = canonicalUnits.current[key];
    const number = Number(value);
    if (value.trim() && source && target && Number.isFinite(number)) {
      canonicalValues.current[key] = convertConstructionFieldValue(number, source, target);
    } else if (value.trim() && Number.isFinite(number)) {
      canonicalValues.current[key] = number;
    }
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);
    setCopied(false);
  };
  const updateFieldUnit = (item: typeof tool.fields[number], next: ConstructionUnit) => {
    if (next === fieldUnits[item.key]) return;
    const base = canonicalUnits.current[item.key];
    const number = canonicalValues.current[item.key];
    if (base && Number.isFinite(number)) setValues(current => ({ ...current, [item.key]: formatConstructionConvertedInput(convertConstructionFieldValue(number, base, next), next) }));
    setFieldUnits(current => ({ ...current, [item.key]: next }));
    setCopied(false);
    trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'construction', unit_system: unit, action: 'field_unit' });
  };
  const updateCurrency = (next: CurrencyCode) => {
    if (next === currency) return;
    setCurrency(next);
    setGlobalCurrency(next);
    setCalculatorOverride(slug, { ...saved, currency: next });
    setCopied(false);
    trackEvent('currency_changed', { calculator_slug: slug, calculator_group: 'construction', action: 'currency_change' });
  };
  const resetValues = () => {
    const defaults = constructionDefaults(slug, unit);
    const displayedDefaults: Record<string, string> = {};
    for (const item of tool.fields) {
      const source = defaultConstructionFieldUnit(item, unit);
      const displayUnit = fieldUnits[item.key];
      const target = canonicalUnits.current[item.key];
      const number = Number(defaults[item.key]);
      if (source && target && Number.isFinite(number)) canonicalValues.current[item.key] = convertConstructionFieldValue(number, source, target);
      else canonicalValues.current[item.key] = number;
      displayedDefaults[item.key] = source && displayUnit && Number.isFinite(number)
        ? formatConstructionConvertedInput(convertConstructionFieldValue(number, source, displayUnit), displayUnit)
        : defaults[item.key];
    }
    setValues(displayedDefaults);
    setCopied(false);
    trackEvent('calculator_used', { calculator_slug: slug, unit_system: unit, action: 'reset' });
  };
  const resultSummary = result.error
    ? result.summary
    : content
      ? `${result.summary} ${content.resultSummary}`
      : result.summary;
  const resultText = `${content?.title ?? tool.name}: ${result.primary}. ${resultSummary}`;
  const writeResultToClipboard = async () => {
    try {
      if (result.error || !navigator.clipboard?.writeText) return false;
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      return true;
    } catch {
      setCopied(false);
      return false;
    }
  };
  const copyResult = async () => {
    if (await writeResultToClipboard()) trackEvent('copy_result', analyticsDimensions);
  };
  const shareResult = async () => {
    if (result.error) return;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: tool.name, text: resultText, url: toCanonicalUrl(tool.href) });
        trackEvent('share_result', { ...analyticsDimensions, share_method: 'native' });
      } else if (await writeResultToClipboard()) {
        trackEvent('share_result', { ...analyticsDimensions, share_method: 'copy_fallback' });
      }
    } catch {
      // Dismissing the native share sheet should not surface an application error.
    }
  };
  return <Shell>
    {content
      ? <Seo path={tool.href} />
      : <Seo title={`${tool.name} | FigureNest`} description={`${tool.description} See the formula, worked example, instructions, and material planning tips.`} path={tool.href} type="tool" schema={faqSchema} />}
    <div className="construction-calculator-page">
      <div className="construction-calc-layout">
        <div className="construction-calc-copy"><div className="eyebrow"><span className="eyebrow-dot" /> {tool.section.toUpperCase()}</div><h1>{content?.title ?? tool.name}<span>.</span></h1><p>{content?.description ?? tool.description}</p>{capability && <p className="calc-capability-note">{capability.visibleNote}</p>}<div className="calc-updated mono">IMPERIAL + METRIC · LIVE CALCULATION</div></div>
        <section className="construction-calculator-card" aria-labelledby={a11y.regionLabelId}>
          <div className="construction-calc-head"><span id={a11y.regionLabelId} className="mono">{tool.name.toUpperCase()} — CALCULATE</span><label className="unit-switch" htmlFor={`construction-${slug}-system`}>Units<MeasurementSystemSelector id={`construction-${slug}-system`} value={unit} onChange={updateUnit} /></label>{isMonetary && <label className="unit-switch" htmlFor={`construction-${slug}-currency`}>Currency<CurrencySelector id={`construction-${slug}-currency`} value={currency} onChange={updateCurrency} /></label>}</div>
          <div className="construction-fields">{tool.fields.map((item) => { const choices = constructionUnitsForField(item); const selected = fieldUnits[item.key]; const fieldProps = a11y.field(item.key); return <label className="construction-field" key={item.key} htmlFor={fieldProps.id}><span>{item.label}<small>{choices.length ? <select id={`${fieldProps.id}-unit`} value={selected} onChange={(event) => updateFieldUnit(item, event.target.value as ConstructionUnit)} aria-label={`${item.label} unit`}>{choices.map(choice => <option key={choice} value={choice}>{item.key === 'price' ? currencyPrefix(currency) : ''}{constructionUnitLabel(choice)}</option>)}</select> : (unit === 'imperial' ? item.imperialUnit : item.metricUnit)}</small></span><input {...fieldProps} type="number" min={item.allowZero ? 0 : Number.EPSILON} step={item.step ?? 'any'} value={values[item.key] ?? ''} onChange={(event) => update(item.key, event.target.value)} onBlur={() => trackSuccessfulCalculation(values, unit)} /></label>; })}</div>
          <CalculatorResultAnnouncement error={result.error} result={result.primary} /><div className={`construction-result ${result.error ? 'has-error' : ''}`}><span className="mono">{result.error ? 'CHECK THE VALUES' : content?.resultLabel ?? 'YOUR RESULT'}</span><strong>{result.primary}</strong><p id={result.error ? a11y.errorId : undefined}>{resultSummary}</p><div className="construction-result-actions"><button onClick={copyResult} className="copy-button" disabled={Boolean(result.error)}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy result'}</button><button onClick={() => void shareResult()} className="copy-button" disabled={Boolean(result.error)}><Share2 size={15} /> Share</button></div></div>
          {result.breakdown.length > 0 && <div className="construction-breakdown"><span className="mono">BREAKDOWN</span>{result.breakdown.map((line) => <div key={line.label}><span>{line.label}</span><strong>{line.value}</strong></div>)}</div>}
          {content && <button type="button" className="reset-button mt-6" onClick={resetValues} data-testid="button-reset-concrete-calculator">Reset values</button>}
        </section>
      </div>
      <div className="construction-content-grid">
        {content ? <article className="construction-content advanced-content">
          <section><div className="eyebrow">WHEN THIS TOOL HELPS</div><h2>{content.purposeTitle}.</h2>{content.purpose.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
          <section><div className="eyebrow">CHOOSING THE RIGHT CONCRETE TOOL</div><h2>Match the estimate to the purchasing decision.</h2><p>{content.distinction}</p></section>
          <section><div className="eyebrow">HOW IT WORKS</div><h2>Formula and calculation method.</h2><div className="advanced-formula-list"><div><strong>Formula</strong><code>{content.formula}</code></div></div><p>{content.formulaExplanation}</p></section>
          <section><div className="eyebrow">WORKED EXAMPLES</div><h2>Follow realistic concrete takeoffs.</h2><div className="advanced-example-list finance-example-list">{content.examples.map((example) => <article key={example.title}><span className="mono">{example.title.toUpperCase()}</span><h3>{example.inputs}</h3><p><strong>Working:</strong> {example.working}</p><p><strong>Result:</strong> {example.result}</p><p><strong>Interpretation:</strong> {example.interpretation}</p></article>)}</div></section>
          <section><div className="eyebrow">INTERPRETING THE RESULT</div><h2>Turn the estimate into an order plan.</h2>{content.interpretation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
          <section><div className="eyebrow">USE IT CAREFULLY</div><h2>Assumptions and common mistakes.</h2><div className="finance-guidance-grid"><div><h3>What the estimate assumes</h3><ul>{content.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Mistakes to avoid</h3><ul>{content.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul></div></div></section>
          <section><div className="eyebrow">EDGE CASES</div><h2>Handle unusual concrete plans explicitly.</h2><div className="finance-edge-list">{content.edgeCases.map((item) => <div key={item.title}><strong>{item.title}</strong><p>{item.explanation}</p></div>)}</div></section>
          <section><div className="eyebrow">LIMITATIONS</div><h2>What this estimate leaves out.</h2><p>{content.limitations}</p></section>
          <section className="construction-faq"><div className="eyebrow">FAQ</div><h2>Concrete planning questions.</h2>{content.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
        </article> : <article className="construction-content">
          <section><div className="eyebrow">HOW IT WORKS</div><h2>Formula & methodology</h2><p>{tool.formula}</p></section>
          <section><div className="eyebrow">WORKED EXAMPLE</div><h2>See the estimate in context.</h2><p>{isMonetary ? localizeCurrencyText(tool.example, currency) : tool.example}</p></section>
          <section><div className="eyebrow">USEFUL INSTRUCTIONS</div><h2>Before you order.</h2><ol>{tool.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol></section>
          <section className="construction-faq"><div className="eyebrow">FAQ</div><h2>Questions people ask.</h2>{tool.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
        </article>}
        <aside>{content ? <ConcreteRelatedTools content={content} /> : <RelatedTools slugs={tool.related} sourceSlug={slug} />}<Link href="/home-construction" className="construction-aside-link"><span>Back to the hub</span><ArrowRight size={15} /></Link></aside>
      </div>
    </div>
  </Shell>;
}