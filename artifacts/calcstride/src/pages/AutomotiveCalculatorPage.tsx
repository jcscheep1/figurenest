import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { ArrowLeft, ArrowRight, Check, Clock3, Copy, Share2 } from 'lucide-react';
import { Seo } from '@/pages/AppPages';
import { Shell, ToolIcon } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { trackEvent } from '@/lib/analytics';
import { toCanonicalUrl } from '@/lib/public-url';
import { calculateCore, convertCore, converterUnits } from '@/lib/core-calculators';
import { automotiveCalculatorContent, type AutomotiveCalculatorSlug } from '@/lib/automotive-calculators';
import { localTools } from '@/lib/catalog';
import { CurrencySelector, MeasurementSystemSelector } from '@/components/UnitsPreferencesSelectors';
import { formatConvertedInput, formatCurrency, useUnitsPreferences, type CurrencyCode, type MeasurementSystem } from '@/lib/units-preferences';
import { getCalculatorSeoCapability } from '@/lib/seo-capabilities';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';

const liquidUnits = {
  usGallons: { label: 'US gallons', short: 'US gal', litres: 3.785411784 },
  imperialGallons: { label: 'Imperial gallons', short: 'imp gal', litres: 4.54609 },
  litres: { label: 'Litres', short: 'L', litres: 1 },
};
const energyUnits = {
  wh: { label: 'Watt-hours', short: 'Wh', kwh: 0.001 },
  kwh: { label: 'Kilowatt-hours', short: 'kWh', kwh: 1 },
  mj: { label: 'Megajoules', short: 'MJ', kwh: 1 / 3.6 },
};
const powerUnits = {
  w: { label: 'Watts', short: 'W', kw: 0.001 },
  kw: { label: 'Kilowatts', short: 'kW', kw: 1 },
  mw: { label: 'Megawatts', short: 'MW', kw: 1000 },
};
const distanceUnits = { miles: { label: 'Miles', miles: 1 }, kilometres: { label: 'Kilometres', miles: 1 / 1.609344 } };
const efficiencyUnits = { mpg: 'US MPG', imperialMpg: 'Imperial MPG', l100km: 'L/100 km', kml: 'km/L' };
type EfficiencyUnit = keyof typeof efficiencyUnits;
const efficiencyToUsMpg = (value: number, unit: EfficiencyUnit) => unit === 'mpg' ? value
  : unit === 'imperialMpg' ? value / 1.2009499255
    : unit === 'l100km' ? 235.214583 / value : value * 2.35214583;
const efficiencyFromUsMpg = (value: number, unit: EfficiencyUnit) => unit === 'mpg' ? value
  : unit === 'imperialMpg' ? value * 1.2009499255
    : unit === 'l100km' ? 235.214583 / value : value / 2.35214583;
const decimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function AutomotiveCalculatorPage({ slug }: { slug: AutomotiveCalculatorSlug }) {
  const content = automotiveCalculatorContent[slug];
  const capability = getCalculatorSeoCapability(slug);
  const path = `/calculators/automotive/${slug}`;
  const converter = content.converter;
  const [values, setValues] = useState(() => content.fields.map((field) => field.value));
  const [converterValue, setConverterValue] = useState(converter?.value ?? '');
  const [fromUnit, setFromUnit] = useState(converter?.from ?? '');
  const [toUnit, setToUnit] = useState(converter?.to ?? '');
  const [copied, setCopied] = useState(false);
  const { forCalculator, setCalculatorOverride, setCurrency, setMeasurementSystem } = useUnitsPreferences();
  const preferences = forCalculator(slug);
  const [distanceUnit, setDistanceUnit] = useState<keyof typeof distanceUnits>('miles');
  const [efficiencyUnit, setEfficiencyUnit] = useState<keyof typeof efficiencyUnits>('mpg');
  const [liquidUnit, setLiquidUnit] = useState<keyof typeof liquidUnits>('usGallons');
  const [energyUnit, setEnergyUnit] = useState<keyof typeof energyUnits>('kwh');
  const [powerUnit, setPowerUnit] = useState<keyof typeof powerUnits>('kw');
  const canonicalValues = useRef(content.fields.map(field => Number(field.value)));
  const converterCanonicalValue = useRef(converter ? efficiencyToUsMpg(Number(converter.value), converter.from as EfficiencyUnit) : 0);
  const appliedMeasurementSystem = useRef<MeasurementSystem>('imperial');
  const units = converterUnits['fuel-economy'];
  const normalizedValues = useMemo(() => {
    if (slug === 'fuel-cost') {
      return values.map((value, index) => value.trim() ? String(canonicalValues.current[index]) : value);
    }
    if (slug === 'ev-charging-cost') {
      return values.map((value, index) => value.trim() ? String(canonicalValues.current[index]) : value);
    }
    if (slug === 'ev-charging-time') {
      return values.map((value, index) => value.trim() ? String(canonicalValues.current[index]) : value);
    }
    return values;
  }, [distanceUnit, efficiencyUnit, energyUnit, liquidUnit, powerUnit, slug, values]);
  const engineResult = converter
    ? convertCore('fuel-economy', converterValue, fromUnit, toUnit)
    : calculateCore(slug, normalizedValues, 'default', { currency: preferences.currency });
  const result = useMemo(() => {
    if (converter || engineResult.error) return engineResult;
    const [a, b, c] = normalizedValues.map(Number);
    if (slug === 'fuel-cost') {
      const gallons = a / b;
      const liquid = gallons * liquidUnits.usGallons.litres / liquidUnits[liquidUnit].litres;
      return { primary: formatCurrency(gallons * c, preferences.currency), details: [
        { label: 'Fuel used', value: `${decimal.format(liquid)} ${liquidUnits[liquidUnit].short}` },
        { label: `Fuel cost per ${distanceUnits[distanceUnit].label.slice(0, -1).toLowerCase()}`, value: formatCurrency((c / b) / distanceUnits[distanceUnit].miles, preferences.currency) },
      ] };
    }
    if (slug === 'ev-charging-cost') {
      const energy = a * b / 100;
      const shownEnergy = energy / energyUnits[energyUnit].kwh;
      return { primary: formatCurrency(energy * c, preferences.currency), details: [
        { label: 'Battery energy added', value: `${decimal.format(shownEnergy)} ${energyUnits[energyUnit].short}` },
        { label: 'Full-battery energy cost', value: formatCurrency(a * c, preferences.currency) },
      ] };
    }
    if (slug === 'ev-charging-time') {
      const hours = a / b;
      const minutes = Math.round(hours * 60);
      return { primary: `${decimal.format(hours)} hours`, details: [
        { label: 'Approximate duration', value: `${Math.floor(minutes / 60)} hr ${minutes % 60} min` },
        { label: 'Charger power used', value: `${decimal.format(b / powerUnits[powerUnit].kw)} ${powerUnits[powerUnit].short}` },
      ] };
    }
    return engineResult;
  }, [converter, distanceUnit, energyUnit, engineResult, liquidUnit, normalizedValues, powerUnit, preferences.currency, slug]);
  const a11y = calculatorFieldA11y(`automotive-${slug}`, result.error);
  const resultText = `${content.title}: ${result.primary}. ${content.resultSummary}`;
  const relatedTools = content.relatedTools
    .map((related) => ({ ...related, tool: localTools.find((tool) => tool.slug === related.slug) }))
    .filter((related): related is typeof related & { tool: NonNullable<typeof related.tool> } => Boolean(related.tool));

  const clearCopied = () => setCopied(false);
  const update = (index: number, value: string) => {
    const number = Number(value);
    if (value.trim() && Number.isFinite(number)) {
      if (slug === 'fuel-cost') {
        canonicalValues.current[index] = index === 0 ? number * distanceUnits[distanceUnit].miles
          : index === 1 ? efficiencyToUsMpg(number, efficiencyUnit)
            : number * liquidUnits.usGallons.litres / liquidUnits[liquidUnit].litres;
      } else if (slug === 'ev-charging-cost') {
        canonicalValues.current[index] = index === 0 ? number * energyUnits[energyUnit].kwh
          : index === 2 ? number / energyUnits[energyUnit].kwh : number;
      } else if (slug === 'ev-charging-time') {
        canonicalValues.current[index] = index === 0 ? number * energyUnits[energyUnit].kwh
          : number * powerUnits[powerUnit].kw;
      } else {
        canonicalValues.current[index] = number;
      }
    }
    setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
    clearCopied();
  };
  const changeDistanceUnit = (next: keyof typeof distanceUnits) => {
    if (next === distanceUnit) return;
    setValues(current => current.map((value, index) => index === 0 && value.trim()
      ? formatConvertedInput(canonicalValues.current[0] / distanceUnits[next].miles) : value));
    setDistanceUnit(next);
    clearCopied();
    trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'automotive', action: 'distance_unit' });
  };
  const changeEfficiencyUnit = (next: EfficiencyUnit) => {
    if (next === efficiencyUnit) return;
    setValues(current => current.map((value, index) => index === 1 && value.trim()
      ? formatConvertedInput(efficiencyFromUsMpg(canonicalValues.current[1], next)) : value));
    setEfficiencyUnit(next);
    clearCopied();
    trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'automotive', action: 'efficiency_unit' });
  };
  const changeLiquidUnit = (next: keyof typeof liquidUnits) => {
    if (next === liquidUnit) return;
    setValues(current => current.map((value, index) => index === 2 && value.trim()
      ? formatConvertedInput(canonicalValues.current[2] * liquidUnits[next].litres / liquidUnits.usGallons.litres) : value));
    setLiquidUnit(next);
    clearCopied();
    trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'automotive', action: 'liquid_unit' });
  };
  const changeEnergyUnit = (next: keyof typeof energyUnits) => {
    if (next === energyUnit) return;
    setValues(current => current.map((value, index) => {
      if (!value.trim()) return value;
      if (index === 0) return formatConvertedInput(canonicalValues.current[0] / energyUnits[next].kwh);
      if (slug === 'ev-charging-cost' && index === 2) return formatConvertedInput(canonicalValues.current[2] * energyUnits[next].kwh);
      return value;
    }));
    setEnergyUnit(next);
    clearCopied();
    trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'automotive', action: 'energy_unit' });
  };
  const changePowerUnit = (next: keyof typeof powerUnits) => {
    if (next === powerUnit) return;
    setValues(current => current.map((value, index) => index === 1 && value.trim()
      ? formatConvertedInput(canonicalValues.current[1] / powerUnits[next].kw) : value));
    setPowerUnit(next);
    clearCopied();
    trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'automotive', action: 'power_unit' });
  };
  const applyMeasurementSystem = (measurementSystem: MeasurementSystem) => {
    if (measurementSystem === appliedMeasurementSystem.current) return;
    if (slug === 'fuel-cost') {
      const nextDistance = measurementSystem === 'metric' ? 'kilometres' : 'miles';
      const nextEfficiency: EfficiencyUnit = measurementSystem === 'metric' ? 'l100km' : 'mpg';
      const nextLiquid = measurementSystem === 'metric' ? 'litres' : 'usGallons';
      setValues(current => current.map((value, index) => {
        if (!value.trim()) return value;
        if (index === 0) return formatConvertedInput(canonicalValues.current[0] / distanceUnits[nextDistance].miles);
        if (index === 1) return formatConvertedInput(efficiencyFromUsMpg(canonicalValues.current[1], nextEfficiency));
        return formatConvertedInput(
          canonicalValues.current[2] * liquidUnits[nextLiquid].litres / liquidUnits.usGallons.litres,
          { significantDigits: 7, maximumFractionDigits: 6 },
        );
      }));
      setDistanceUnit(nextDistance);
      setEfficiencyUnit(nextEfficiency);
      setLiquidUnit(nextLiquid);
    } else if (converter) {
      const nextFrom: EfficiencyUnit = measurementSystem === 'metric' ? 'l100km' : 'mpg';
      const nextTo: EfficiencyUnit = measurementSystem === 'metric' ? 'mpg' : 'l100km';
      setConverterValue(formatConvertedInput(efficiencyFromUsMpg(converterCanonicalValue.current, nextFrom)));
      setFromUnit(nextFrom);
      setToUnit(nextTo);
    }
    appliedMeasurementSystem.current = measurementSystem;
    clearCopied();
  };
  useLayoutEffect(() => {
    if (appliedMeasurementSystem.current !== preferences.measurementSystem) {
      applyMeasurementSystem(preferences.measurementSystem);
    }
  }, [preferences.measurementSystem, slug]);

  const trackSuccessfulCalculation = () => {
    if (!result.error) trackEvent('calculation_completed', {
      calculator_slug: slug,
      calculator_group: slug === 'fuel-economy' ? 'converter' : 'automotive',
    });
  };

  const writeResultToClipboard = async () => {
    try {
      if (!navigator.clipboard?.writeText || result.error) return false;
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
    if (await writeResultToClipboard()) trackEvent('copy_result', { calculator_slug: slug });
  };

  const shareResult = async () => {
    if (result.error) return;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: content.title, text: resultText, url: toCanonicalUrl(path) });
        trackEvent('share_result', { calculator_slug: slug, share_method: 'native' });
      } else if (await writeResultToClipboard()) {
        trackEvent('share_result', { calculator_slug: slug, share_method: 'copy_fallback' });
      }
    } catch {
      // Closing the operating-system share sheet is not an application error.
    }
  };

  const reset = () => {
    const defaults = content.fields.map((field) => field.value);
    canonicalValues.current = defaults.map(Number);
    setValues(defaults);
    if (converter) {
      setConverterValue(converter.value);
      setFromUnit(converter.from);
      setToUnit(converter.to);
      converterCanonicalValue.current = efficiencyToUsMpg(Number(converter.value), converter.from as EfficiencyUnit);
    }
    setCopied(false);
    trackEvent('calculator_used', { calculator_slug: slug, action: 'reset' });
  };

  return (
    <Shell>
      <Seo path={path} />
      <div className="advanced-calc-page automotive-page">

        <div className="advanced-calc-layout">
          <header className="advanced-calc-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> AUTOMOTIVE &amp; ENERGY</div>
            <h1>{content.titleLines[0]}<br />{content.titleLines[1]}<span>.</span></h1>
            <p>{content.description}</p>
            {capability && <p className="calc-capability-note">{capability.visibleNote}</p>}
            <div className="calc-updated mono"><Clock3 size={14} /> UPDATED <time dateTime="2026-08">AUGUST 2026</time> · {content.updatedNote}</div>
          </header>

          <section className="advanced-calculator-card" aria-labelledby={a11y.regionLabelId}>
            <div className="advanced-calc-head">
              <span id={a11y.regionLabelId} className="mono">{content.title.toUpperCase()} — {converter ? 'CONVERT' : 'CALCULATE'}</span>
              <div className="live-dot"><i /> LIVE RESULT</div>
            </div>

            <div className="advanced-fields">
              {converter ? (
                <>
                  <label className="advanced-field" htmlFor={a11y.field('from-unit').id}>
                    <span>Measurement system</span>
                    <MeasurementSystemSelector id={`measurement-system-${slug}`} value={preferences.measurementSystem} onChange={(measurementSystem) => {
                      if (measurementSystem === preferences.measurementSystem) return;
                      applyMeasurementSystem(measurementSystem);
                      setMeasurementSystem(measurementSystem);
                      setCalculatorOverride(slug, { ...preferences, measurementSystem });
                      trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'converter', action: 'measurement_system' });
                    }} />
                  </label>
                  <label className="advanced-field" htmlFor={`measurement-system-${slug}`}>
                    <span>From unit</span>
                    <select {...a11y.field('from-unit')} value={fromUnit} onChange={(event) => {
                      const next = event.target.value as EfficiencyUnit;
                      if (next === fromUnit) return;
                      const number = Number(converterValue);
                      if (converterValue.trim() && Number.isFinite(number)) converterCanonicalValue.current = efficiencyToUsMpg(number, next);
                      setFromUnit(next);
                      clearCopied();
                      trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'converter', action: 'from_unit' });
                    }} data-testid="select-automotive-from">
                      {Object.entries(units).map(([key, unit]) => <option key={key} value={key}>{unit.label}</option>)}
                    </select>
                  </label>
                  <label className="advanced-field" htmlFor={a11y.field('to-unit').id}>
                    <span>To unit</span>
                    <select {...a11y.field('to-unit')} value={toUnit} onChange={(event) => { const next = event.target.value; if (next === toUnit) return; setToUnit(next); clearCopied(); trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'converter', action: 'to_unit' }); }} data-testid="select-automotive-to">
                      {Object.entries(units).map(([key, unit]) => <option key={key} value={key}>{unit.label}</option>)}
                    </select>
                  </label>
                  <label className="advanced-field" htmlFor={a11y.field('fuel-economy').id}>
                    <span>Fuel economy value</span>
                    <input
                      {...a11y.field('fuel-economy')}
                      type="number"
                      min="0"
                      step="any"
                      value={converterValue}
                      onChange={(event) => {
                        const next = event.target.value;
                        const number = Number(next);
                        if (next.trim() && Number.isFinite(number)) converterCanonicalValue.current = efficiencyToUsMpg(number, fromUnit as EfficiencyUnit);
                        setConverterValue(next);
                        clearCopied();
                      }}
                      onBlur={trackSuccessfulCalculation}
                      data-testid="input-automotive-fuel-economy"
                    />
                  </label>
                </>
              ) : <>
                <label className="advanced-field" htmlFor={`measurement-system-${slug}`}>
                  <span>Measurement system</span>
                  <MeasurementSystemSelector
                    id={`measurement-system-${slug}`}
                    value={preferences.measurementSystem}
                    onChange={(measurementSystem) => {
                      if (measurementSystem === preferences.measurementSystem) return;
                      applyMeasurementSystem(measurementSystem);
                      setMeasurementSystem(measurementSystem);
                      setCalculatorOverride(slug, { ...preferences, measurementSystem });
                      trackEvent('unit_changed', { calculator_slug: slug, calculator_group: 'automotive', action: 'measurement_system' });
                    }}
                  />
                </label>
                {(slug === 'fuel-cost' || slug === 'ev-charging-cost') && (
                  <label className="advanced-field" htmlFor={`currency-${slug}`}>
                    <span>Currency</span>
                    <CurrencySelector
                      id={`currency-${slug}`}
                      value={preferences.currency}
                      onChange={(currency: CurrencyCode) => {
                        if (currency === preferences.currency) return;
                        setCurrency(currency);
                        setCalculatorOverride(slug, { ...preferences, currency });
                        clearCopied();
                        trackEvent('currency_changed', { calculator_slug: slug, calculator_group: 'automotive', action: 'currency_change' });
                      }}
                    />
                  </label>
                )}
                {slug === 'fuel-cost' && <>
                   <label className="advanced-field" htmlFor={`automotive-${slug}-distance-unit`}><span>Distance unit</span><select id={`automotive-${slug}-distance-unit`} value={distanceUnit} onChange={(event) => changeDistanceUnit(event.target.value as keyof typeof distanceUnits)} data-testid="select-automotive-distance-unit">{Object.entries(distanceUnits).map(([key, unit]) => <option key={key} value={key}>{unit.label}</option>)}</select></label>
                   <label className="advanced-field" htmlFor={`automotive-${slug}-efficiency-unit`}><span>Efficiency unit</span><select id={`automotive-${slug}-efficiency-unit`} value={efficiencyUnit} onChange={(event) => changeEfficiencyUnit(event.target.value as EfficiencyUnit)} data-testid="select-automotive-efficiency-unit">{Object.entries(efficiencyUnits).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                   <label className="advanced-field" htmlFor={`automotive-${slug}-liquid-unit`}><span>Fuel liquid unit</span><select id={`automotive-${slug}-liquid-unit`} value={liquidUnit} onChange={(event) => changeLiquidUnit(event.target.value as keyof typeof liquidUnits)} data-testid="select-automotive-liquid-unit">{Object.entries(liquidUnits).map(([key, unit]) => <option key={key} value={key}>{unit.label}</option>)}</select></label>
                </>}
                {(slug === 'ev-charging-cost' || slug === 'ev-charging-time') && <label className="advanced-field" htmlFor={`automotive-${slug}-energy-unit`}><span>Energy unit</span><select id={`automotive-${slug}-energy-unit`} value={energyUnit} onChange={(event) => changeEnergyUnit(event.target.value as keyof typeof energyUnits)} data-testid="select-automotive-energy-unit">{Object.entries(energyUnits).map(([key, unit]) => <option key={key} value={key}>{unit.label}</option>)}</select></label>}
                {slug === 'ev-charging-time' && <label className="advanced-field" htmlFor={`automotive-${slug}-power-unit`}><span>Power unit</span><select id={`automotive-${slug}-power-unit`} value={powerUnit} onChange={(event) => changePowerUnit(event.target.value as keyof typeof powerUnits)} data-testid="select-automotive-power-unit">{Object.entries(powerUnits).map(([key, unit]) => <option key={key} value={key}>{unit.label}</option>)}</select></label>}
                {content.fields.map((field, index) => (
                <label className="advanced-field" key={field.key} htmlFor={a11y.field(field.key).id}>
                  <span>{field.label}</span>
                  <div>
                    {field.prefix && <b>{(slug === 'fuel-cost' || slug === 'ev-charging-cost') ? formatCurrency(0, preferences.currency).replace(/[\d.,\s]/g, '') : field.prefix}</b>}
                    <input
                      {...a11y.field(field.key)}
                      type="number"
                      min="0"
                      step="any"
                      value={values[index]}
                      onChange={(event) => update(index, event.target.value)}
                      onBlur={trackSuccessfulCalculation}
                      data-testid={`input-automotive-${field.key}`}
                    />
                    {field.suffix && <small>{field.key === 'distance' && slug === 'fuel-cost' ? distanceUnits[distanceUnit].label.toLowerCase() : field.key === 'mpg' && slug === 'fuel-cost' ? efficiencyUnits[efficiencyUnit] : field.key === 'price' && slug === 'fuel-cost' ? `/${liquidUnits[liquidUnit].short}` : field.key === 'capacity' && slug === 'ev-charging-cost' ? energyUnits[energyUnit].short : field.key === 'price' && slug === 'ev-charging-cost' ? `/${energyUnits[energyUnit].short}` : field.key === 'energy' ? energyUnits[energyUnit].short : field.key === 'power' ? powerUnits[powerUnit].short : field.suffix}</small>}
                  </div>
                </label>
                ))}
              </>}
            </div>

            <CalculatorResultAnnouncement error={result.error} result={result.primary} />
            <div className={`advanced-result${result.error ? ' has-error' : ''}`}>
              <span className="mono">{result.error ? 'CHECK THE VALUES' : content.resultLabel}</span>
              <strong data-testid="automotive-calculator-result">{result.primary}</strong>
              <p id={result.error ? a11y.errorId : undefined}>{result.error ?? content.resultSummary}</p>
              <div className="advanced-result-actions">
                <button type="button" onClick={() => void copyResult()} className="copy-button" disabled={Boolean(result.error)} data-testid="button-copy-automotive-result">
                  {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy result'}
                </button>
                <button type="button" onClick={() => void shareResult()} className="copy-button" disabled={Boolean(result.error)} data-testid="button-share-automotive-result">
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>

            {result.details?.length ? (
              <div className="advanced-breakdown">
                <span className="mono">BREAKDOWN</span>
                {result.details.map((detail) => <div key={detail.label}><span>{detail.label}</span><strong>{detail.value}</strong></div>)}
              </div>
            ) : null}

            <button type="button" className="reset-button mt-6" onClick={reset} data-testid="button-reset-automotive-calculator">Reset values</button>
          </section>
        </div>

        <div className="advanced-content-grid">
          <article className="advanced-content">
            <section>
              <div className="eyebrow">WHEN THIS TOOL HELPS</div>
              <h2>{content.purposeTitle}.</h2>
              {content.purpose.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
            <section>
              <div className="eyebrow">CHOOSING THE RIGHT AUTOMOTIVE TOOL</div>
              <h2>Cost, efficiency, energy, and power answer different questions.</h2>
              <p>{content.distinction}</p>
            </section>
            <section>
              <div className="eyebrow">HOW IT WORKS</div>
              <h2>Formula and calculation method.</h2>
              <div className="advanced-formula-list"><div><strong>Formula</strong><code>{content.formula}</code></div></div>
              <p>{content.formulaExplanation}</p>
            </section>
            <section>
              <div className="eyebrow">WORKED EXAMPLES</div>
              <h2>See the transport decision, not just the math.</h2>
              <div className="advanced-example-list finance-example-list">
                {content.examples.map((example) => (
                  <article key={example.title}>
                    <span className="mono">{example.title.toUpperCase()}</span>
                    <h3>{example.inputs}</h3>
                    <p><strong>Working:</strong> {example.working}</p>
                    <p><strong>Result:</strong> {example.result}</p>
                    <p><strong>Interpretation:</strong> {example.interpretation}</p>
                  </article>
                ))}
              </div>
            </section>
            <section>
              <div className="eyebrow">INTERPRETING THE RESULT</div>
              <h2>Put the estimate in context.</h2>
              {content.interpretation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
            <section>
              <div className="eyebrow">USE IT CAREFULLY</div>
              <h2>Assumptions and common mistakes.</h2>
              <div className="finance-guidance-grid">
                <div><h3>What the calculation assumes</h3><ul>{content.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><h3>Mistakes to avoid</h3><ul>{content.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
            </section>
            <section>
              <div className="eyebrow">EDGE CASES</div>
              <h2>What unusual inputs mean.</h2>
              <div className="finance-edge-list">
                {content.edgeCases.map((item) => <div key={item.title}><strong>{item.title}</strong><p>{item.explanation}</p></div>)}
              </div>
            </section>
            <section>
              <div className="eyebrow">LIMITATIONS</div>
              <h2>What this tool leaves out.</h2>
              <p>{content.limitations}</p>
            </section>
            <section className="advanced-faq">
              <div className="eyebrow">FAQ</div>
              <h2>Automotive and energy questions.</h2>
              {content.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
            </section>
          </article>

          <aside>
            <div className="related-tools">
              <div className="eyebrow">CONNECTED TRANSPORT DECISIONS</div>
              <div className="related-tool-list">
                {relatedTools.map(({ tool, label, context }) => (
                  <Link href={tool.href} className="related-tool finance-related-tool" key={tool.slug} onClick={() => trackEvent('related_tool_clicked', { source_slug: slug, destination_slug: tool.slug })}>
                    <ToolIcon category={tool.category} />
                    <span><strong>{label}</strong><small>{context}</small></span>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/category/automotive" className="advanced-aside-link"><span>Browse Automotive &amp; EV Tools</span><ArrowRight size={15} /></Link>
          </aside>
        </div>
      </div>
    </Shell>
  );
}