import { useState } from 'react';
import { ArrowRight, Check, Copy, Share2 } from 'lucide-react';
import '@/styles/advanced-calculator-pages.css';
import { Seo } from '@/pages/AppPages';
import { Shell, ToolIcon } from '@/components/FigureNestShell';
import { CurrencySelector } from '@/components/UnitsPreferencesSelectors';
import { Link } from '@/components/PublicLink';
import { trackEvent } from '@/lib/analytics';
import { localTools } from '@/lib/catalog';
import {
  calculatePriorityFinance,
  priorityFinanceContent,
  type PriorityFinanceSlug,
} from '@/lib/priority-finance-calculators';
import { toCanonicalUrl } from '@/lib/public-url';
import {
  currencyPrefix,
  useUnitsPreferences,
} from '@/lib/units-preferences';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';
import { CalculatorDecisionExpansion, CalculatorModeSwitch, useCalculatorMode } from '@/components/calculators/CalculatorDecisionExpansion';

export function PriorityFinanceCalculatorPage({ slug }: { slug: PriorityFinanceSlug }) {
  const content = priorityFinanceContent[slug];
  const path = `/calculators/finance/${slug}`;
  const [values, setValues] = useState(() => content.fields.map((field) => field.value));
  const [copied, setCopied] = useState(false);
  const supportsAdvancedMode = slug === 'auto-loan' || slug === 'mortgage-payoff';
  const [advancedMode, setAdvancedMode] = useCalculatorMode(supportsAdvancedMode);
  const { forCalculator, setCalculatorOverride, setCurrency } = useUnitsPreferences();
  const currency = forCalculator(slug).currency;
  const result = calculatePriorityFinance(slug, values, currency);
  const a11y = calculatorFieldA11y(slug, result.error);
  const related = content.relatedSlugs
    .map((relatedSlug) => localTools.find((tool) => tool.slug === relatedSlug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));
  const resultText = `${content.title}: ${result.primary}. ${result.details.map((detail) => `${detail.label}: ${detail.value}`).join('. ')}`;

  const update = (index: number, value: string) => {
    setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
    setCopied(false);
  };

  const selectCurrency = (next: typeof currency) => {
    if (next === currency) return;
    setCurrency(next);
    setCalculatorOverride(slug, { ...forCalculator(slug).calculatorOverrides[slug], currency: next });
    trackEvent('currency_changed', { calculator_slug: slug, calculator_group: 'finance', action: 'currency_change' });
  };

  const writeResult = async () => {
    try {
      if (result.error || !navigator.clipboard?.writeText) return false;
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      return true;
    } catch {
      return false;
    }
  };

  const share = async () => {
    if (result.error) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: content.title, text: resultText, url: toCanonicalUrl(path) });
        trackEvent('share_result', { calculator_slug: slug, share_method: 'native' });
      } else if (await writeResult()) {
        trackEvent('share_result', { calculator_slug: slug, share_method: 'copy_fallback' });
      }
    } catch {
      // Closing the operating-system share sheet is not an application error.
    }
  };

  return (
    <Shell>
      <Seo path={path} />
      <div className="advanced-calc-page">
        <div className="advanced-calc-layout">
          <header className="advanced-calc-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> MONEY &amp; FINANCE</div>
            <h1>{content.titleLines[0]}<br />{content.titleLines[1]}<span>.</span></h1>
            <p>{content.description}</p>
            <p className="calc-capability-note">Choose EUR, USD, GBP, or ZAR for display. The currency selector changes formatting only; it does not perform a live exchange-rate conversion.</p>
            <div className="calc-updated mono">UPDATED <time dateTime="2026-09">SEPTEMBER 2026</time> · INDEPENDENTLY TESTED FORMULA</div>
          </header>

          <section className="advanced-calculator-card" aria-labelledby={a11y.regionLabelId}>
            <div className="advanced-calc-head">
              <span id={a11y.regionLabelId} className="mono">{content.title.toUpperCase()} — CALCULATE</span>
              <div className="live-dot"><i /> LIVE RESULT</div>
            </div>
            {supportsAdvancedMode && <CalculatorModeSwitch advanced={advancedMode} onChange={setAdvancedMode} />}
            <label className="advanced-field" htmlFor={`${slug}-currency`}>
              <span>Currency</span>
              <CurrencySelector id={`${slug}-currency`} value={currency} onChange={selectCurrency} />
            </label>
            <div className="advanced-fields">
              {content.fields.map((field, index) => (
                <label className="advanced-field" key={field.key} htmlFor={a11y.field(field.key).id}>
                  <span>{field.label}</span>
                  <div>
                    {field.prefix && <b>{field.prefix.replace('$', currencyPrefix(currency))}</b>}
                    <input
                      {...a11y.field(field.key)}
                      type="number"
                      min={field.min ?? 0}
                      max={field.max}
                      step={field.step ?? 'any'}
                      value={values[index]}
                      onChange={(event) => update(index, event.target.value)}
                      onBlur={() => {
                        if (!result.error) trackEvent('calculation_completed', { calculator_slug: slug, calculator_group: 'finance' });
                      }}
                      data-testid={`input-${slug}-${field.key}`}
                    />
                    {field.suffix && <small>{field.suffix}</small>}
                  </div>
                </label>
              ))}
            </div>
            {supportsAdvancedMode && <CalculatorDecisionExpansion slug={slug} values={values} currency={currency} open={advancedMode} />}
            <CalculatorResultAnnouncement error={result.error} result={result.primary} />
            <div className={`advanced-result${result.error ? ' has-error' : ''}`}>
              <span className="mono">{result.error ? 'CHECK THE VALUES' : content.resultLabel}</span>
              <strong data-testid="priority-finance-result">{result.primary}</strong>
              <p id={result.error ? a11y.errorId : undefined}>{result.summary}</p>
              <div className="advanced-result-actions">
                <button type="button" className="copy-button" disabled={Boolean(result.error)} onClick={() => void writeResult()} data-testid="button-copy-priority-finance-result">
                  {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy result'}
                </button>
                <button type="button" className="copy-button" disabled={Boolean(result.error)} onClick={() => void share()} data-testid="button-share-priority-finance-result">
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>
            {result.details.length > 0 && (
              <div className="advanced-breakdown">
                <span className="mono">BREAKDOWN</span>
                {result.details.map((detail) => <div key={detail.label}><span>{detail.label}</span><strong>{detail.value}</strong></div>)}
              </div>
            )}
            <button type="button" className="reset-button mt-6" onClick={() => {
              setValues(content.fields.map((field) => field.value));
              setCopied(false);
              trackEvent('calculator_used', { calculator_slug: slug, action: 'reset' });
            }}>Reset values</button>
          </section>
        </div>

        <div className="advanced-content-grid">
          <article className="advanced-content">
            <section>
              <div className="eyebrow">WHEN THIS CALCULATOR HELPS</div>
              <h2>Use the result for a focused comparison.</h2>
              <ul>{content.whenUseful.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section>
              <div className="eyebrow">HOW IT WORKS</div>
              <h2>Formula and calculation method.</h2>
              <div className="advanced-formula-list"><div><strong>Formula</strong><code>{content.formula}</code></div></div>
              <p>{content.formulaExplanation}</p>
            </section>
            <section>
              <div className="eyebrow">WORKED EXAMPLE</div>
              <h2>Follow the numbers in context.</h2>
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
              <h2>Read the estimate with its assumptions.</h2>
              {content.interpretation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
            <section>
              <div className="eyebrow">ASSUMPTIONS &amp; LIMITATIONS</div>
              <h2>What the model includes—and leaves out.</h2>
              <ul>{content.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
              <p>{content.limitations}</p>
            </section>
            <section>
              <div className="eyebrow">EDGE CASES</div>
              <h2>Unusual inputs need extra care.</h2>
              <div className="finance-edge-list">{content.edgeCases.map((item) => <div key={item.title}><strong>{item.title}</strong><p>{item.explanation}</p></div>)}</div>
            </section>
            <section className="advanced-faq">
              <div className="eyebrow">FAQ</div>
              <h2>Questions about this calculation.</h2>
              {content.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
            </section>
            <section>
              <div className="eyebrow">RELIABLE SOURCES</div>
              <h2>Check the rules behind the estimate.</h2>
              <ul>{content.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul>
            </section>
          </article>
          <aside>
            <div className="related-tools">
              <div className="eyebrow">RELATED CALCULATORS</div>
              <div className="related-tool-list">
                {related.map((tool) => (
                  <Link href={tool.href} className="related-tool finance-related-tool" key={tool.slug} onClick={() => trackEvent('related_tool_clicked', { source_slug: slug, destination_slug: tool.slug })}>
                    <ToolIcon category={tool.category} />
                    <span><strong>{tool.name}</strong><small>{tool.description}</small></span>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/category/finance" className="advanced-aside-link"><span>Browse Money &amp; Finance</span><ArrowRight size={15} /></Link>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
