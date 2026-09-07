import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { ArrowLeft, ArrowRight, Check, Clock3, Copy } from 'lucide-react';
import { Shell } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { Seo } from '@/pages/AppPages';
import { trackEvent } from '@/lib/analytics';
import { convertCore } from '@/lib/core-calculators';
import { converterUnitPairs, convertFromCanonical, convertToCanonical, convertUnitValue, formatConvertedInput, isTemperatureBelowAbsoluteZero, unitRegistry, type MeasurementSystem, type UnitDimension, type UnitKey, useUnitsPreferences } from '@/lib/units-preferences';
import { MeasurementSystemSelector } from '@/components/UnitsPreferencesSelectors';
import {
  converterCalculatorContent,
  type ConverterSlug,
  type DedicatedConverterSlug,
} from '@/lib/converter-calculators';
import { getCalculatorSeoCapability } from '@/lib/seo-capabilities';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';

const categoryLabels: Record<DedicatedConverterSlug, string> = {
  length: 'Length & distance',
  weight: 'Weight & mass',
  temperature: 'Temperature',
  speed: 'Speed',
};

const converterHeadings: Record<ConverterSlug, string> = {
  unit: 'Unit Converter',
  length: 'Length Converter',
  weight: 'Weight Converter',
  temperature: 'Temperature Converter',
  speed: 'Speed Converter',
};
type HubCategory = 'length' | 'mass' | 'temperature' | 'speed' | 'area' | 'volume' | 'liquid' | 'energy' | 'power' | 'fuel-economy';
const hubCategoryLabels: Record<HubCategory, string> = {
  length: 'Length & distance', mass: 'Weight & mass', temperature: 'Temperature', speed: 'Speed',
  area: 'Area', volume: 'Volume', liquid: 'Liquid volume', energy: 'Energy', power: 'Power', 'fuel-economy': 'Fuel economy',
};
const hubCategoryDefaults: Record<HubCategory, { value: string; from: UnitKey; to: UnitKey }> = {
  length: { value: '10', from: 'm', to: 'ft' }, mass: { value: '10', from: 'kg', to: 'lb' },
  temperature: { value: '72', from: 'fahrenheit', to: 'celsius' }, speed: { value: '100', from: 'kph', to: 'mph' },
  area: { value: '10', from: 'm2', to: 'ft2' }, volume: { value: '10', from: 'm3', to: 'ft3' },
  liquid: { value: '10', from: 'l', to: 'usGal' }, energy: { value: '10', from: 'kwh', to: 'mj' },
  power: { value: '10', from: 'kw', to: 'hp' }, 'fuel-economy': { value: '25', from: 'usMpg', to: 'l100km' },
};
const dedicatedDimensions: Record<DedicatedConverterSlug, UnitDimension> = { length: 'length', weight: 'mass', temperature: 'temperature', speed: 'speed' };
const registryUnitNames: Record<string, UnitKey> = {
  meters: 'm', feet: 'ft', kilometers: 'km', miles: 'mi', kilograms: 'kg', pounds: 'lb',
  celsius: 'celsius', fahrenheit: 'fahrenheit', kph: 'kph', mph: 'mph',
};

export function ConverterCalculatorPage({ slug }: { slug: ConverterSlug }) {
  const content = converterCalculatorContent[slug];
  const capability = getCalculatorSeoCapability(slug);
  const isHub = slug === 'unit';
  const [category, setCategory] = useState<HubCategory>(content.defaultCategory === 'weight' ? 'mass' : content.defaultCategory);
  const initial = isHub ? hubCategoryDefaults[content.defaultCategory === 'weight' ? 'mass' : content.defaultCategory] : {
    value: content.defaultValue,
    from: registryUnitNames[content.defaultFrom] ?? content.defaultFrom,
    to: registryUnitNames[content.defaultTo] ?? content.defaultTo,
  };
  const [value, setValue] = useState(initial.value);
  const [fromUnit, setFromUnit] = useState<UnitKey>(initial.from as UnitKey);
  const [toUnit, setToUnit] = useState<UnitKey>(initial.to as UnitKey);
  const canonicalValue = useRef(convertToCanonical(Number(initial.value), initial.from as UnitKey));
  const [copied, setCopied] = useState(false);
  const dimension = isHub ? category : dedicatedDimensions[slug as DedicatedConverterSlug];
  const units = useMemo(() => Object.entries(unitRegistry).filter(([, unit]) => unit.dimension === dimension) as [UnitKey, typeof unitRegistry[UnitKey]][], [dimension]);
  const registryMode = isHub || slug === 'length' || slug === 'weight' || slug === 'temperature' || slug === 'speed';
  const calculation = useMemo(
    () => {
      if (!registryMode) return convertCore(slug, value, fromUnit, toUnit);
      const number = Number(value);
      if (!value.trim() || !Number.isFinite(number)) return { primary: 'Enter a valid value', error: 'Enter a valid value' };
      if (dimension === 'temperature' && isTemperatureBelowAbsoluteZero(number, fromUnit)) {
        return { primary: 'Temperature is below absolute zero', error: 'Temperature is below absolute zero' };
      }
      if (dimension !== 'temperature' && number < 0) return { primary: 'Value cannot be negative', error: 'Value cannot be negative' };
      if (dimension === 'fuel-economy' && number <= 0) return { primary: 'Fuel economy must be greater than zero', error: 'Fuel economy must be greater than zero' };
      const converted = convertUnitValue(number, fromUnit as UnitKey, toUnit as UnitKey);
      return Number.isFinite(converted) ? { primary: `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(converted)} ${unitRegistry[toUnit as UnitKey].symbol}` } : { primary: 'Choose valid units', error: 'Choose valid units' };
    },
    [dimension, fromUnit, registryMode, slug, toUnit, value],
  );
  const resultIsValid = !calculation.error;
  const a11y = calculatorFieldA11y(`converter-${slug}`, calculation.error);
  const path = `/converters/${slug}`;

  const chooseCategory = (next: HubCategory) => {
    if (next === dimension) return;
    const defaults = hubCategoryDefaults[next];
    const pair = converterUnitPairs[next][preferences.measurementSystem];
    setCategory(next);
    setValue(defaults.value);
    setFromUnit(pair.from);
    setToUnit(pair.to);
    canonicalValue.current = convertToCanonical(Number(defaults.value), pair.from);
    setCopied(false);
    trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'converter', action: 'category_change', category: next });
  };

  const { forCalculator, setCalculatorOverride, setMeasurementSystem } = useUnitsPreferences();
  const preferences = forCalculator(slug);
  const appliedMeasurementSystem = useRef<MeasurementSystem>('metric');
  const applyMeasurementSystem = (measurementSystem: MeasurementSystem) => {
    if (measurementSystem === appliedMeasurementSystem.current) return;
    const pair = converterUnitPairs[dimension][measurementSystem];
    const converted = convertFromCanonical(canonicalValue.current, pair.from);
    if (Number.isFinite(converted)) setValue(formatConvertedInput(converted));
    setFromUnit(pair.from);
    setToUnit(pair.to);
    appliedMeasurementSystem.current = measurementSystem;
    setCopied(false);
  };
  useLayoutEffect(() => {
    if (appliedMeasurementSystem.current !== preferences.measurementSystem) {
      applyMeasurementSystem(preferences.measurementSystem);
    }
  }, [dimension, preferences.measurementSystem]);
  const reset = () => {
    const defaults = isHub ? hubCategoryDefaults[content.defaultCategory === 'weight' ? 'mass' : content.defaultCategory] : {
      value: content.defaultValue,
      from: content.defaultFrom,
      to: content.defaultTo,
    };
    if (isHub) setCategory(content.defaultCategory === 'weight' ? 'mass' : content.defaultCategory);
    setValue(defaults.value);
    setFromUnit((isHub ? defaults.from : (registryUnitNames[defaults.from] ?? defaults.from)) as UnitKey);
    setToUnit((isHub ? defaults.to : (registryUnitNames[defaults.to] ?? defaults.to)) as UnitKey);
    canonicalValue.current = convertToCanonical(Number(defaults.value), (isHub ? defaults.from : (registryUnitNames[defaults.from] ?? defaults.from)) as UnitKey);
    setCopied(false);
    trackEvent('calculator_used', { calculator_slug: slug, action: 'reset' });
  };

  const copy = () => {
    if (!resultIsValid) return;
    void navigator.clipboard?.writeText(calculation.primary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
    trackEvent('copy_result', { calculator_slug: slug, unit_system: dimension });
  };

  return (
    <Shell>
      <Seo path={path} />
      <div className="advanced-calc-page converter-page">

        <div className="advanced-calc-layout">
          <header className="advanced-calc-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> {content.eyebrow}</div>
            <h1>{converterHeadings[slug]}<span>.</span></h1>
            <p>{content.intro}</p>
             {capability && <p className="calc-capability-note">{capability.visibleNote}</p>}
            <div className="calc-updated mono"><Clock3 size={14} /> UPDATED <time dateTime="2026-08">AUGUST 2026</time></div>
          </header>

          <section className="advanced-calculator-card" aria-labelledby={a11y.regionLabelId}>
            <div className="advanced-calc-head">
              <span id={a11y.regionLabelId} className="mono">{converterHeadings[slug].toUpperCase()} — CONVERT</span>
              <span className="live-dot"><i /> LIVE RESULT</span>
            </div>

            <div className="advanced-fields">
              <label className="advanced-field" htmlFor={`measurement-system-${slug}`}>
                <span>Measurement system</span>
                <MeasurementSystemSelector id={`measurement-system-${slug}`} value={preferences.measurementSystem} onChange={(measurementSystem) => {
                  if (measurementSystem === preferences.measurementSystem) return;
                  applyMeasurementSystem(measurementSystem);
                  setMeasurementSystem(measurementSystem);
                  setCalculatorOverride(slug, { ...preferences, measurementSystem });
                  trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'converter', action: 'measurement_system' });
                }} />
              </label>
              {isHub && (
                <label className="advanced-field" htmlFor={a11y.field('category').id}>
                  <span>Measurement category</span>
                  <select
                    {...a11y.field('category')}
                    value={category}
                    onChange={(event) => chooseCategory(event.target.value as HubCategory)}
                    data-testid="select-converter-category"
                  >
                    {(Object.keys(hubCategoryLabels) as HubCategory[]).map((key) => (
                      <option key={key} value={key}>{hubCategoryLabels[key]}</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="advanced-field" htmlFor={a11y.field('from-unit').id}>
                <span>From unit</span>
                <select {...a11y.field('from-unit')} value={fromUnit} onChange={(event) => {
                  const next = event.target.value as UnitKey;
                  const number = Number(value);
                  if (value.trim() && Number.isFinite(number)) canonicalValue.current = convertToCanonical(number, next);
                  if (next === fromUnit) return;
                  setFromUnit(next);
                  setCopied(false);
                  trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'converter', action: 'from_unit' });
                }} data-testid="select-converter-from">
                  {units.map(([key, unit]) => <option key={key} value={key}>{unit.label}</option>)}
                </select>
              </label>
              <label className="advanced-field" htmlFor={a11y.field('to-unit').id}>
                <span>To unit</span>
                <select {...a11y.field('to-unit')} value={toUnit} onChange={(event) => { const next = event.target.value as UnitKey; if (next === toUnit) return; setToUnit(next); setCopied(false); trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'converter', action: 'to_unit' }); }} data-testid="select-converter-to">
                  {units.map(([key, unit]) => <option key={key} value={key}>{unit.label}</option>)}
                </select>
              </label>
              <label className="advanced-field" htmlFor={a11y.field('value').id}>
                <span>{content.valueLabel}</span>
                <input
                  {...a11y.field('value')}
                  type="number"
                  min={dimension === 'temperature' ? undefined : 0}
                  step="any"
                  value={value}
                  onChange={(event) => {
                    const next = event.target.value;
                    const number = Number(next);
                    if (next.trim() && Number.isFinite(number)) canonicalValue.current = convertToCanonical(number, fromUnit);
                    setValue(next);
                    setCopied(false);
                  }}
                  onBlur={() => resultIsValid && trackEvent('calculation_completed', { calculator_slug: slug, calculator_group: 'converter', unit_system: dimension })}
                  data-testid="input-converter-value"
                />
              </label>
            </div>

            <CalculatorResultAnnouncement error={calculation.error} result={calculation.primary} />
            <div className={`advanced-result${calculation.error ? ' has-error' : ''}`}>
              <span className="mono">{calculation.error ? 'CHECK THE VALUE' : 'CONVERTED VALUE'}</span>
              <strong data-testid="text-calculation-result">{calculation.primary}</strong>
              <p id={calculation.error ? a11y.errorId : undefined}>{calculation.error
                ? 'Correct the value or unit selection to continue.'
                : `${value || '0'} ${unitRegistry[fromUnit as UnitKey]?.label ?? ''} expressed in ${unitRegistry[toUnit as UnitKey]?.label ?? ''}.`}</p>
              <div className="advanced-result-actions">
                <button disabled={!resultIsValid} type="button" onClick={copy} className="copy-button" data-testid="button-copy-result">
                  {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy result'}
                </button>
              </div>
            </div>
            <button type="button" className="reset-button" onClick={reset} data-testid="button-reset-calculator">Reset values</button>
          </section>
        </div>

        <div className="advanced-content-grid">
          <article className="advanced-content">
            <section>
              <div className="eyebrow">PURPOSE</div>
              <h2>{content.purposeTitle}</h2>
              {content.purpose.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>

            <section>
              <div className="eyebrow">CONVERSION LOGIC</div>
              <h2>{content.formulaTitle}</h2>
              <p>{content.formulaIntro}</p>
              <div className="advanced-formula">
                {content.formulas.map((formula) => <p key={formula}>{formula}</p>)}
              </div>
            </section>

            <section>
              <div className="eyebrow">WORKED EXAMPLES</div>
              <h2>Conversions in real situations</h2>
              <div className="advanced-examples">
                {content.examples.map((example) => (
                  <div key={example.title}>
                    <span className="mono">{example.title}</span>
                    <h3>{example.setup}</h3>
                    <strong>{example.result}</strong>
                    <p>{example.explanation}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="eyebrow">PRACTICAL GUIDANCE</div>
              <h2>{content.guidanceTitle}</h2>
              {content.guidance.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>

            <section>
              <div className="eyebrow">COMMON LIMITS</div>
              <h2>What this conversion does not decide</h2>
              <ul className="advanced-list">
                {content.limitations.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section>
              <div className="eyebrow">FAQ</div>
              <h2>{content.slug === 'unit' ? 'Unit converter questions' : `${categoryLabels[content.defaultCategory]} questions`}</h2>
              <div className="advanced-faq">
                {content.faqs.map((faq) => (
                  <details key={faq.question}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </article>

          <aside className="advanced-aside">
            <div className="eyebrow">{isHub ? 'FOCUSED CONVERTERS' : 'RELATED CONVERSIONS'}</div>
            <h2>{isHub ? 'Go deeper by measurement' : 'Keep converting'}</h2>
            {!isHub && (
              <Link href="/converters/unit" className="converter-context-link" data-testid="link-converter-hub">
                <span><strong>Use the multi-category Unit Converter</strong><small>Switch among length, weight, temperature, and speed in one workspace.</small></span>
                <ArrowRight size={16} />
              </Link>
            )}
            {content.related.map((item) => (
              <Link href={`/converters/${item.slug}`} className="converter-context-link" key={item.slug} data-testid={`link-converter-${item.slug}`}>
                <span><strong>{item.label}</strong><small>{item.description}</small></span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </aside>
        </div>
      </div>
    </Shell>
  );
}