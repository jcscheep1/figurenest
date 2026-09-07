import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import '@/styles/advanced-calculator-pages.css';
import { Seo } from '@/pages/AppPages';
import { Shell } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { publishedTools } from '@/lib/catalog';
import {
  calculatePhaseThreeC,
  phaseThreeCDefinitions,
  type PhaseThreeCSlug,
} from '@/lib/phase-three-c';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';

export function PhaseThreeCCalculatorPage({ slug }: { slug: PhaseThreeCSlug }) {
  const definition = phaseThreeCDefinitions[slug];
  const defaults = () => definition.fields.map((field) => field.value);
  const [values, setValues] = useState(defaults);
  const [copied, setCopied] = useState(false);
  const result = calculatePhaseThreeC(slug, values);
  const a11y = calculatorFieldA11y(slug, result.error);
  const categoryHref = `/category/${definition.categorySlug}`;
  const relatedTools = definition.relatedRoutes.flatMap((href) => {
    const tool = publishedTools.find((candidate) => candidate.href === href);
    return tool ? [tool] : [];
  });

  const update = (index: number, value: string) => {
    setValues((current) => current.map((oldValue, itemIndex) => itemIndex === index ? value : oldValue));
    setCopied(false);
  };

  const copy = async () => {
    if (result.error || !navigator.clipboard) return;
    await navigator.clipboard.writeText(result.primary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const reset = () => {
    setValues(defaults());
    setCopied(false);
  };

  return <Shell>
    <Seo path={definition.href} />
    <div className="advanced-calc-page" data-testid={`page-${slug}`}>
      <div className="advanced-calc-layout">
        <header className="advanced-calc-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> FIGURENEST {definition.category.toUpperCase()}</div>
          <h1>{definition.h1}<span>.</span></h1>
          <p>{definition.description}</p>
          
          <div className="date-method-notes" role="note" aria-label="Important safety context">
            <p><strong>Important context:</strong> {definition.safetyNotice}</p>
          </div>

          <p className="advanced-local-note mt-6">This calculator runs locally in your browser. Entered values are not sent to a calculation service.</p>
        </header>
        <section className="advanced-calculator-card" aria-labelledby={a11y.regionLabelId}>
          <div className="advanced-calc-head"><span id={a11y.regionLabelId} className="mono">{definition.name.toUpperCase()} — CALCULATE</span><div className="live-dot"><i /> LOCAL RESULT</div></div>
          <div className="advanced-fields">
            {definition.fields.map((field, index) => <label className="advanced-field" key={field.key} htmlFor={a11y.field(field.key).id}>
              <span>{field.label}</span>
              <div>{field.type === 'select'
                ? <select {...a11y.field(field.key)} value={values[index]} onChange={(event) => update(index, event.target.value)} data-testid={`input-${slug}-${field.key}`}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                : <input {...a11y.field(field.key)} type={field.type} min={field.min} max={field.max} step={field.step} value={values[index]} onChange={(event) => update(index, event.target.value)} data-testid={`input-${slug}-${field.key}`} />}
              </div>
            </label>)}
          </div>
          <CalculatorResultAnnouncement error={result.error} result={result.primary} />
          <div className={`advanced-result${result.error ? ' has-error' : ''}`} data-testid={`status-${slug}`}>
            <span className="mono">{result.error ? 'CHECK THE VALUES' : definition.resultLabel}</span>
            <strong className="advanced-result-output">{result.primary}</strong>
            <p id={result.error ? a11y.errorId : undefined}>{result.summary}</p>
            <div className="advanced-result-actions">
              <button type="button" className="copy-button" disabled={Boolean(result.error)} onClick={() => void copy()} data-testid={`button-copy-${slug}`}>{copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />} {copied ? 'Copied' : 'Copy result'}</button>
            </div>
          </div>
          {result.details && result.details.length > 0 && (
            <div className="advanced-breakdown">
              {result.details.map((detail) => (
                <div key={detail.label}>
                  <span>{detail.label}</span>
                  <strong>{detail.value}</strong>
                </div>
              ))}
            </div>
          )}
          <button type="button" className="reset-button mt-6" onClick={reset} data-testid={`button-reset-${slug}`}>Reset values</button>
        </section>
      </div>
      <div className="advanced-content-grid">
        <article className="advanced-content">
          <section><div className="eyebrow">METHOD</div><h2>Formula or algorithm and variables.</h2><div className="advanced-formula-list"><div><strong>Calculation notation</strong><code aria-label={`Formula: ${definition.formula}`}>{definition.formula}</code><p>{definition.variables}</p></div></div></section>
          {definition.educationalSections.map((section) => <section key={section.heading}><div className="eyebrow">GUIDANCE</div><h2>{section.heading}</h2><p>{section.body}</p></section>)}
          <section><div className="eyebrow">LIMITATIONS</div><h2>Check assumptions and sources.</h2><p>{definition.limitations}</p>{definition.sourceLinks.map((source) => <p key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></p>)}</section>
          <section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Common questions.</h2>{definition.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
        </article>
        <aside><div className="related-tools"><div className="eyebrow">RELATED TOOLS</div>{relatedTools.map((tool) => <Link href={tool.href} key={tool.href} className="advanced-aside-link">{tool.name}</Link>)}<Link href={categoryHref} className="advanced-aside-link">All {definition.category} tools</Link></div></aside>
      </div>
    </div>
  </Shell>;
}
