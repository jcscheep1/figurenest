import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import '@/styles/advanced-calculator-pages.css';
import { Seo } from '@/pages/AppPages';
import { Shell } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { CurrencySelector } from '@/components/UnitsPreferencesSelectors';
import { publishedTools } from '@/lib/catalog';
import { calculatePhaseFour, phaseFourDefinitions, type PhaseFourSlug } from '@/lib/phase-four';
import { normalizePhaseFourInputs, phaseFourFieldMin, phaseFourFieldStep } from '@/lib/phase-four-inputs';
import { localizeCurrencyText, useUnitsPreferences } from '@/lib/units-preferences';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';
import { CalculatorDecisionExpansion, CalculatorModeSwitch, useCalculatorMode } from '@/components/calculators/CalculatorDecisionExpansion';
import { ShoeSizeConverter } from '@/components/calculators/ShoeSizeConverter';
import { SocialSecurityEstimator } from '@/components/calculators/SocialSecurityEstimator';

export function PhaseFourCalculatorPage({ slug }: { slug: PhaseFourSlug }) {
  if (slug === 'shoe-size') return <ShoeSizeConverter />;
  if (slug === 'social-security') return <SocialSecurityEstimator />;
  return <StandardPhaseFourCalculatorPage slug={slug} />;
}

/** Typed Phase Four renderer. It deliberately does not share Phase Three's family contract. */
function StandardPhaseFourCalculatorPage({ slug }: { slug: PhaseFourSlug }) {
  const definition = phaseFourDefinitions[slug];
  const defaults = () => definition.fields.map((field) => field.value);
  const [values, setValues] = useState(defaults);
  const [copied, setCopied] = useState(false);
  const supportsAdvancedMode = slug === 'budget' || slug === 'credit-card' || slug === 'apr';
  const supportsCurrency = (definition.category === 'Money & Finance' || definition.category === 'Salary & Work' || definition.category === 'Business') && slug !== '401k';
  const [advancedMode, setAdvancedMode] = useCalculatorMode(supportsAdvancedMode);
  const { forCalculator, setCurrency, setCalculatorOverride } = useUnitsPreferences();
  const currency = forCalculator(slug).currency;
  const relatedTools = definition.relatedRoutes.flatMap((href) => {
    const tool = publishedTools.find((candidate) => candidate.href === href);
    return tool ? [tool] : [];
  });
  const rawResult = calculatePhaseFour(slug, normalizePhaseFourInputs(slug, values));
  const result = supportsCurrency ? {
    ...rawResult,
    primary: localizeCurrencyText(rawResult.primary, currency),
    summary: localizeCurrencyText(rawResult.summary, currency),
    details: rawResult.details.map((item) => ({ ...item, value: localizeCurrencyText(item.value, currency) })),
  } : rawResult;
  const a11y = calculatorFieldA11y(slug, result.error);
  const update = (index: number, value: string) => { setValues((old) => old.map((item, i) => i === index ? value : item)); setCopied(false); };
  const copy = async () => { if (!result.error && navigator.clipboard) { await navigator.clipboard.writeText(result.primary); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } };
  return <Shell><Seo path={definition.href} /><div className="advanced-calc-page" data-testid={`page-${slug}`}>
    <div className="advanced-calc-layout"><header className="advanced-calc-copy"><div className="eyebrow"><span className="eyebrow-dot" /> FIGURENEST {definition.category.toUpperCase()}</div><h1>{definition.h1}<span>.</span></h1><p>{definition.description}</p><div className="date-method-notes" role="note"><p><strong>Important context:</strong> {supportsCurrency ? localizeCurrencyText(definition.safetyNotice, currency) : definition.safetyNotice}</p></div><p className="advanced-local-note mt-6">This calculator runs locally in your browser. Entered values are not sent to a calculation service.</p></header>
    <section className="advanced-calculator-card" aria-labelledby={a11y.regionLabelId}><div className="advanced-calc-head"><span id={a11y.regionLabelId} className="mono">{definition.name.toUpperCase()} — CALCULATE</span><div className="live-dot"><i /> LOCAL RESULT</div></div>{supportsAdvancedMode&&<CalculatorModeSwitch advanced={advancedMode} onChange={setAdvancedMode}/>} {supportsCurrency&&<label className="advanced-field" htmlFor={`${slug}-currency`}><span>Display currency</span><CurrencySelector id={`${slug}-currency`} value={currency} onChange={(next)=>{setCurrency(next);setCalculatorOverride(slug,{...forCalculator(slug).calculatorOverrides[slug],currency:next});}}/></label>}<div className="advanced-fields">{definition.fields.map((field,index)=><label className="advanced-field" key={field.key} htmlFor={a11y.field(field.key).id}><span>{supportsCurrency ? localizeCurrencyText(field.label, currency) : field.label}</span><div>{field.type==='select'?<select {...a11y.field(field.key)} value={values[index]} onChange={(e)=>update(index,e.target.value)}>{field.options?.map((o)=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:<input {...a11y.field(field.key)} type={field.type} min={phaseFourFieldMin(slug,index,field.min)} max={field.max} step={phaseFourFieldStep(slug,index,field.step)} value={values[index]} onChange={(e)=>update(index,e.target.value)} />}</div></label>)}</div>{supportsAdvancedMode&&<CalculatorDecisionExpansion slug={slug} values={values} open={advancedMode}/>}
    <CalculatorResultAnnouncement error={result.error} result={result.primary} /><div className={`advanced-result${result.error?' has-error':''}`}><span className="mono">{result.error?'CHECK THE VALUES':definition.resultLabel}</span><strong className="advanced-result-output">{result.primary}</strong><p id={result.error ? a11y.errorId : undefined}>{result.summary}</p><div className="advanced-result-actions"><button type="button" className="copy-button" disabled={Boolean(result.error)} onClick={()=>void copy()}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy result'}</button></div></div>
    {result.details.length>0&&<div className="advanced-breakdown">{result.details.map((item)=><div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>}<button type="button" className="reset-button mt-6" onClick={()=>{setValues(defaults());setCopied(false);}}>Reset values</button></section></div>
    <div className="advanced-content-grid"><article className="advanced-content"><section><div className="eyebrow">METHOD</div><h2>Formula and variables.</h2><div className="advanced-formula-list"><div><code>{definition.formula}</code><p>{definition.variables}</p></div></div></section>{definition.educationalSections.map((section)=><section key={section.heading}><div className="eyebrow">GUIDANCE</div><h2>{section.heading}</h2><p>{section.body}</p></section>)}<section><div className="eyebrow">LIMITATIONS</div><h2>Check the assumptions.</h2><p>{definition.limitations}</p></section>{definition.sourceLinks.length > 0 && <section><div className="eyebrow">SOURCES</div><h2>Official context and sources.</h2>{definition.sourceLinks.map((source)=><p key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></p>)}</section>}<section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Common questions.</h2>{definition.faqs.map((faq)=><details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section></article><aside><div className="related-tools"><div className="eyebrow">RELATED TOOLS</div>{relatedTools.map((tool)=><Link href={tool.href} key={tool.href} className="advanced-aside-link">{tool.name}</Link>)}<Link href={`/category/${definition.categorySlug}`} className="advanced-aside-link">All {definition.category} tools</Link></div></aside></div>
  </div></Shell>;
}
