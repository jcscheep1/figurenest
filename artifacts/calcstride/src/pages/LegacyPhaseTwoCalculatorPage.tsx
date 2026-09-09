import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import '@/styles/advanced-calculator-pages.css';
import { Seo } from '@/pages/AppPages';
import { Shell } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { CurrencySelector } from '@/components/UnitsPreferencesSelectors';
import { ElectricalPreferencesSelector } from '@/components/ElectricalPreferencesSelector';
import { toCanonicalUrl } from '@/lib/public-url';
import { calculatePhaseTwo, phaseTwoDefinitions, type PhaseTwoField, type PhaseTwoResult, type PhaseTwoSlug } from '@/lib/phase-two-expansion';
import { calculateAverageReturn } from '@/lib/average-return';
import { validateWholeMinuteDuration } from '@/lib/time-calculator-validation';
import { useUnitsPreferences } from '@/lib/units-preferences';
import { useElectricalPreferences } from '@/lib/electrical-preferences';
import { publishedTools } from '@/lib/catalog';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';
import { TimeDurationEducationalContent } from '@/components/TimeDurationEducationalContent';
import { normalizeVoltageDropValues } from '@/lib/voltage-drop-units';

const voltageDropLengthUnitField: PhaseTwoField = {
  key: 'lengthUnit',
  label: 'Length unit',
  value: 'ft',
  type: 'select',
  options: [
    { value: 'ft', label: 'Feet (ft)' },
    { value: 'm', label: 'Metres (m)' },
  ],
};

function displayFieldsFor(slug: PhaseTwoSlug): readonly PhaseTwoField[] {
  const definition = phaseTwoDefinitions[slug];
  if (slug !== 'voltage-drop') return definition.fields;
  const [current, length, resistance] = definition.fields;
  return [
    current,
    { ...length, label: 'One-way length' },
    voltageDropLengthUnitField,
    resistance,
  ];
}

export function PhaseTwoCalculatorPage({ slug }: { slug: PhaseTwoSlug }) {
  const definition = phaseTwoDefinitions[slug];
  const displayFields = displayFieldsFor(slug);
  const [values, setValues] = useState(() => displayFields.map((field) => field.value));
  const [copied, setCopied] = useState(false);
  const { forCalculator, setCurrency, setCalculatorOverride } = useUnitsPreferences();
  const { preferences: electricalPreferences } = useElectricalPreferences();
  const currency = forCalculator(slug).currency;
  const isMonetary = slug === 'percent-off' || slug === 'time-card';
  const categoryHref = definition.categorySlug === 'construction' ? '/home-construction' : `/category/${definition.categorySlug}`;
  const relatedTools = definition.relatedRoutes.flatMap((href) => {
    const tool = publishedTools.find((candidate) => candidate.href === href);
    return tool ? [tool] : [];
  });
  const timePrecisionError = slug === 'time' ? validateWholeMinuteDuration(values[1] ?? '', values[2] ?? '') : undefined;
  const voltageDropDisplayValues = slug === 'voltage-drop'
    ? [...values, electricalPreferences.phase]
    : values;
  const calculationValues = slug === 'voltage-drop' ? normalizeVoltageDropValues(voltageDropDisplayValues) : values;
  const result: PhaseTwoResult = timePrecisionError
    ? { primary: timePrecisionError, summary: timePrecisionError, details: [], error: timePrecisionError }
    : slug === 'average-return'
      ? calculateAverageReturn(values)
      : calculatePhaseTwo(slug, calculationValues, isMonetary ? currency : undefined);
  const voltageDropV = slug === 'voltage-drop' && !result.error ? Number.parseFloat(result.primary) : Number.NaN;
  const voltageDropPct = Number.isFinite(voltageDropV) && electricalPreferences.voltage > 0
    ? voltageDropV / electricalPreferences.voltage * 100
    : Number.NaN;
  const a11y = calculatorFieldA11y(slug, result.error);
  const update = (index: number, value: string) => {
    setValues((current) => current.map((old, itemIndex) => itemIndex === index ? value : old));
    setCopied(false);
  };
  const text = `${definition.name}: ${result.primary}. ${result.summary}`;
  const copy = async () => {
    if (result.error || !navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const share = async () => {
    if (result.error) return;
    if (navigator.share) await navigator.share({ title: definition.name, text, url: toCanonicalUrl(definition.href) });
    else await copy();
  };

  return <Shell>
    <Seo path={definition.href} />
    <div className="advanced-calc-page" data-testid={`page-${slug}`}>
      <nav aria-label="Breadcrumb" className="mono">
        <Link href="/">Home</Link> / <Link href={categoryHref}>{definition.category}</Link> / {definition.name}
      </nav>
      <div className="advanced-calc-layout">
        <header className="advanced-calc-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> FIGURENEST {definition.category.toUpperCase()}</div>
          <h1>{definition.h1}<span>.</span></h1>
          <p>{definition.description}</p>
        </header>
        <section className="advanced-calculator-card" aria-labelledby={a11y.regionLabelId}>
          <div className="advanced-calc-head"><span id={a11y.regionLabelId} className="mono">{definition.name.toUpperCase()} — CALCULATE</span><div className="live-dot"><i /> LIVE RESULT</div></div>
          {isMonetary && <label className="advanced-field" htmlFor={`${slug}-currency`}>
            <span>Display currency</span>
            <CurrencySelector
              id={`${slug}-currency`}
              value={currency}
              onChange={(next) => {
                setCurrency(next);
                setCalculatorOverride(slug, { ...forCalculator(slug).calculatorOverrides[slug], currency: next });
              }}
            />
          </label>}
          {slug === 'voltage-drop' && <>
            <div className="date-method-notes" role="note"><p><strong>Electrical supply preference:</strong> Voltage sets the percentage-drop basis and phase sets the single- or three-phase formula. This preference carries to other applicable electrical calculators.</p></div>
            <ElectricalPreferencesSelector idPrefix="voltage-drop-supply" />
          </>}
          <div className="advanced-fields">
            {displayFields.map((field, index) => <label className="advanced-field" key={field.key} htmlFor={a11y.field(field.key).id}>
              <span>{field.label}</span>
              <div>{field.type === 'select'
                ? <select {...a11y.field(field.key)} value={values[index]} onChange={(event) => update(index, event.target.value)} data-testid={`input-${slug}-${field.key}`}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                : <input {...a11y.field(field.key)} type={field.type || 'number'} min={field.min} step={slug === 'time' && field.key === 'minutes' ? '1' : field.step || (field.type === 'number' ? 'any' : undefined)} value={values[index]} onChange={(event) => update(index, event.target.value)} data-testid={`input-${slug}-${field.key}`} />}
              </div>
            </label>)}
          </div>
          <CalculatorResultAnnouncement error={result.error} result={result.primary} />
          <div className={`advanced-result${result.error ? ' has-error' : ''}`} data-testid={`status-${slug}`}>
            <span className="mono">{result.error ? 'CHECK THE VALUES' : definition.resultLabel}</span>
            <strong>{result.primary}</strong>
            <p id={result.error ? a11y.errorId : undefined}>{slug === 'voltage-drop' && Number.isFinite(voltageDropPct) ? `${result.summary} That is approximately ${voltageDropPct.toFixed(2)}% of the selected ${electricalPreferences.voltage} V supply.` : result.summary}</p>
            <div className="advanced-result-actions">
              <button type="button" className="copy-button" disabled={Boolean(result.error)} onClick={() => void copy()} data-testid={`button-copy-${slug}`}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy result'}</button>
              <button type="button" className="copy-button" disabled={Boolean(result.error)} onClick={() => void share()} data-testid={`button-share-${slug}`}><Share2 size={15} /> Share</button>
            </div>
          </div>
          <div className="advanced-breakdown">
            {slug === 'voltage-drop' && !result.error && <>
              <div><span>Supply basis</span><strong>{electricalPreferences.voltage} V · {electricalPreferences.phase === 'single' ? 'single-phase' : 'three-phase'}</strong></div>
              <div><span>Voltage drop percentage</span><strong>{voltageDropPct.toFixed(2)}%</strong></div>
            </>}
            {result.details.map((detail) => <div key={detail.label}><span>{detail.label}</span><strong>{detail.value}</strong></div>)}
          </div>
          <button type="button" className="reset-button mt-6" onClick={() => { setValues(displayFields.map((field) => field.value)); setCopied(false); }} data-testid={`button-reset-${slug}`}>Reset values</button>
        </section>
      </div>
      <div className="advanced-content-grid">
        <article className="advanced-content">
          <section><div className="eyebrow">METHOD</div><h2>Formula and practical context.</h2><div className="advanced-formula-list"><div><strong>Formula</strong><code>{definition.formula}</code><p>{definition.variables}</p></div></div></section>
          {slug === 'time-duration'
            ? <TimeDurationEducationalContent definition={definition} />
            : definition.educationalSections.map((section) => <section key={section.heading}><div className="eyebrow">GUIDANCE</div><h2>{section.heading}</h2><p>{section.body}</p></section>)}
          <section><div className="eyebrow">LIMITATIONS</div><h2>Check the assumptions.</h2><p>{definition.limitations}</p></section>
          {definition.sourceLinks.length > 0 && <section><div className="eyebrow">SOURCES</div><h2>Official context and sources.</h2>{definition.sourceLinks.map((source) => <p key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></p>)}</section>}
          <section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Common questions.</h2>{definition.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
        </article>
        <aside><div className="related-tools"><div className="eyebrow">RELATED TOOLS</div>{relatedTools.map((tool) => <Link href={tool.href} key={tool.href} className="advanced-aside-link" data-testid={`link-related-${slug}-${tool.href.replaceAll('/', '-')}`}>{tool.name}</Link>)}</div></aside>
      </div>
    </div>
  </Shell>;
}
