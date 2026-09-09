import { useLayoutEffect, useRef, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import '@/styles/advanced-calculator-pages.css';
import { Seo } from '@/pages/AppPages';
import { Shell } from '@/components/FigureNestShell';
import { CurrencySelector, MeasurementSystemSelector } from '@/components/UnitsPreferencesSelectors';
import { Link } from '@/components/PublicLink';
import { publishedTools } from '@/lib/catalog';
import { toCanonicalUrl } from '@/lib/public-url';
import { priorityOneExpansionDefinitions, type PriorityOneExpansionSlug, type PriorityOneResult } from '@/lib/priority-one-expansion';
import { calculatePriorityOneWithInputContracts, priorityOneFieldMax } from '@/lib/priority-one-input-contracts';
import { STUDENT_LOAN_MIN_YEARS, STUDENT_LOAN_TERM_ERROR, STUDENT_LOAN_YEAR_STEP, studentLoanTermMonths } from '@/lib/student-loan-validation';
import { useUnitsPreferences, type MeasurementSystem } from '@/lib/units-preferences';
import { convertPriorityOneValues, localizePriorityOneResult, normalizePriorityOneValues, priorityOneFieldLabel, supportsPriorityOneMeasurementSystem } from '@/lib/priority-one-measurement';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';
import { CalculatorDecisionExpansion, CalculatorModeSwitch, useCalculatorMode } from '@/components/calculators/CalculatorDecisionExpansion';

const studentLoanTermError = (): PriorityOneResult => ({ primary: STUDENT_LOAN_TERM_ERROR, summary: STUDENT_LOAN_TERM_ERROR, details: [], error: STUDENT_LOAN_TERM_ERROR });

export function PriorityOneCalculatorPage({ slug }: { slug: PriorityOneExpansionSlug }) {
  const definition = priorityOneExpansionDefinitions[slug];
  const relatedTools = definition.relatedRoutes.flatMap((href) => { const tool = publishedTools.find((candidate) => candidate.href === href); return tool ? [tool] : []; });
  const [values, setValues] = useState(() => definition.fields.map(field => field.value));
  const [copied, setCopied] = useState(false);
  const supportsAdvancedMode = slug === 'retirement';
  const supportsCurrency = definition.category === 'finance' && slug !== 'currency';
  const supportsMeasurement = supportsPriorityOneMeasurementSystem(slug);
  const [advancedMode, setAdvancedMode] = useCalculatorMode(supportsAdvancedMode);
  const { forCalculator, setCurrency, setMeasurementSystem, setCalculatorOverride } = useUnitsPreferences();
  const preferences = forCalculator(slug);
  const currency = preferences.currency;
  const appliedMeasurementSystem = useRef<MeasurementSystem>('metric');

  useLayoutEffect(() => {
    if (!supportsMeasurement || appliedMeasurementSystem.current === preferences.measurementSystem) return;
    setValues(current => convertPriorityOneValues(slug, current, appliedMeasurementSystem.current, preferences.measurementSystem));
    appliedMeasurementSystem.current = preferences.measurementSystem;
    setCopied(false);
  }, [preferences.measurementSystem, slug, supportsMeasurement]);

  const normalizedValues = normalizePriorityOneValues(slug, values, preferences.measurementSystem);
  const calculatedResult = calculatePriorityOneWithInputContracts(slug, normalizedValues, currency);
  const baseResult = slug === 'student-loan' && studentLoanTermMonths(values[2] ?? '') === null ? studentLoanTermError() : calculatedResult;
  const result = baseResult.error ? baseResult : { ...baseResult, primary: localizePriorityOneResult(slug, baseResult.primary, preferences.measurementSystem) };
  const a11y = calculatorFieldA11y(slug, result.error);
  const update = (index: number, value: string) => { setValues(current => current.map((item, itemIndex) => itemIndex === index ? value : item)); setCopied(false); };
  const text = `${definition.name}: ${result.primary}. ${result.summary}`;
  const copy = async () => { if (result.error || !navigator.clipboard) return; await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const share = async () => { if (result.error) return; if (navigator.share) await navigator.share({ title: definition.name, text, url: toCanonicalUrl(definition.href) }); else await copy(); };
  return <Shell>
    <Seo path={definition.href} />
    <div className="advanced-calc-page" data-testid={`page-${slug}`}>
      <nav aria-label="Breadcrumb" className="mono" data-testid={`breadcrumbs-${slug}`}><Link href="/">Home</Link> / <Link href={`/category/${definition.categorySlug}`}>{definition.category}</Link> / {definition.name}</nav>
      <div className="advanced-calc-layout">
        <header className="advanced-calc-copy"><div className="eyebrow"><span className="eyebrow-dot" /> FIGURENEST {definition.category.toUpperCase()}</div><h1>{definition.name}<span>.</span></h1><p>{definition.description}</p></header>
        <section className="advanced-calculator-card" aria-labelledby={a11y.regionLabelId}>
          <div className="advanced-calc-head"><span id={a11y.regionLabelId} className="mono">{definition.name.toUpperCase()} — CALCULATE</span><div className="live-dot"><i /> LIVE RESULT</div></div>
          {supportsAdvancedMode && <CalculatorModeSwitch advanced={advancedMode} onChange={setAdvancedMode} />}
          <div className="date-method-notes" role="note" data-testid={`safety-notice-${slug}`}><p><strong>Important context:</strong> {definition.safetyNotice}</p></div>
          {supportsCurrency && <label className="advanced-field" htmlFor={`${slug}-currency`}><span>Display currency</span><CurrencySelector id={`${slug}-currency`} value={currency} onChange={next => { setCurrency(next); setCalculatorOverride(slug, { ...forCalculator(slug).calculatorOverrides[slug], currency: next }); }} /></label>}
          {supportsMeasurement && <label className="advanced-field" htmlFor={`${slug}-measurement-system`}><span>Measurement system</span><MeasurementSystemSelector id={`${slug}-measurement-system`} value={preferences.measurementSystem} onChange={next => { setMeasurementSystem(next); setCalculatorOverride(slug, { ...forCalculator(slug).calculatorOverrides[slug], measurementSystem: next }); }} /></label>}
          <div className="advanced-fields">{definition.fields.map((field, index) => {
            const isStudentLoanTerm = slug === 'student-loan' && field.key === 'years';
            const label = priorityOneFieldLabel(slug, index, field.label, preferences.measurementSystem);
            return <label className="advanced-field" key={field.key} htmlFor={a11y.field(field.key).id}><span>{label}</span><div>{field.type === 'select' ? <select {...a11y.field(field.key)} value={values[index]} onChange={event => update(index, event.target.value)} data-testid={`input-${slug}-${field.key}`}>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input {...a11y.field(field.key)} type={field.type === 'date' || field.type === 'time' ? field.type : 'number'} min={isStudentLoanTerm ? STUDENT_LOAN_MIN_YEARS : field.min} max={priorityOneFieldMax(slug, field.key, field.max)} step={isStudentLoanTerm ? STUDENT_LOAN_YEAR_STEP : field.step ?? (field.type === 'date' || field.type === 'time' ? undefined : 'any')} value={values[index]} onChange={event => update(index, event.target.value)} data-testid={`input-${slug}-${field.key}`} />}{field.suffix && <small>{field.suffix}</small>}</div></label>;
          })}</div>
          {slug === 'retirement' && <CalculatorDecisionExpansion slug="retirement" values={values} currency={currency} open={advancedMode} />}
          <CalculatorResultAnnouncement error={result.error} result={result.primary} />
          <div className={`advanced-result${result.error ? ' has-error' : ''}`} data-testid={`status-${slug}`}><span className="mono">{result.error ? 'CHECK THE VALUES' : definition.resultLabel}</span><strong data-testid={`result-${slug}`}>{result.primary}</strong><p id={result.error ? a11y.errorId : undefined}>{result.summary}</p><div className="advanced-result-actions"><button type="button" className="copy-button" disabled={Boolean(result.error)} onClick={() => void copy()} data-testid={`button-copy-${slug}`}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? ' Copied' : ' Copy result'}</button><button type="button" className="copy-button" disabled={Boolean(result.error)} onClick={() => void share()} data-testid={`button-share-${slug}`}><Share2 size={15} /> Share</button></div></div>
          <div className="advanced-breakdown">{result.details.map(detail => <div key={detail.label}><span>{detail.label}</span><strong>{detail.value}</strong></div>)}</div>
          <button type="button" className="reset-button mt-6" onClick={() => { const defaults = definition.fields.map(field => field.value); setValues(preferences.measurementSystem === 'metric' ? defaults : convertPriorityOneValues(slug, defaults, 'metric', 'imperial')); setCopied(false); }} data-testid={`button-reset-${slug}`}>Reset values</button>
        </section>
      </div>
      <div className="advanced-content-grid"><article className="advanced-content"><section><div className="eyebrow">METHOD</div><h2>Formula and practical context.</h2><div className="advanced-formula-list"><div><strong>Formula</strong><code>{definition.formula}</code></div></div></section>{definition.educationalSections.map(section => <section key={section.heading}><div className="eyebrow">GUIDANCE</div><h2>{section.heading}</h2>{section.body.split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}<section><div className="eyebrow">LIMITATIONS</div><h2>Check the assumptions.</h2><p>{definition.limitations}</p></section>{definition.sourceLinks.length > 0 && <section><div className="eyebrow">SOURCES</div><h2>Official context and guidance.</h2>{definition.sourceLinks.map(source => <p key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></p>)}</section>}<section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Common questions.</h2>{definition.faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section></article><aside><div className="related-tools"><div className="eyebrow">RELATED TOOLS</div>{relatedTools.map(tool => <Link href={tool.href} key={tool.href} className="advanced-aside-link" data-testid={`link-related-${slug}-${tool.href.replaceAll('/','-')}`}>{tool.name}</Link>)}</div></aside></div>
    </div>
  </Shell>;
}
