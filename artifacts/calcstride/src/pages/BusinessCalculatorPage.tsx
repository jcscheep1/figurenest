import { useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { ArrowLeft, ArrowRight, Check, Copy, Share2 } from 'lucide-react';
import { Seo } from '@/pages/AppPages';
import { Shell, ToolIcon } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { trackEvent } from '@/lib/analytics';
import { toCanonicalUrl } from '@/lib/public-url';
import { calculateCore } from '@/lib/core-calculators';
import { businessCalculatorContent, type BusinessCalculatorSlug } from '@/lib/business-calculators';
import { localTools } from '@/lib/catalog';
import { CurrencySelector } from '@/components/UnitsPreferencesSelectors';
import { currencyPrefix, localizeCurrencyText, useUnitsPreferences } from '@/lib/units-preferences';
import { getCalculatorSeoCapability } from '@/lib/seo-capabilities';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';

export function BusinessCalculatorPage({ slug }: { slug: BusinessCalculatorSlug }) {
  const content = businessCalculatorContent[slug];
  const capability = getCalculatorSeoCapability(slug);
  const toolHref = `/calculators/business/${slug}`;
  const fields = content.fields;
  const [values, setValues] = useState(() => fields.map((field) => field.value));
  const [copied, setCopied] = useState(false);
  const { forCalculator, setCalculatorOverride, setCurrency } = useUnitsPreferences();
  const currency = forCalculator(slug).currency;
  const result = calculateCore(slug, values, 'default', { currency });
  const a11y = calculatorFieldA11y(slug, result.error);
  const resultText = localizeCurrencyText(`${content.title}: ${result.primary}. ${content.resultSummary}`, currency);
  const setSelectedCurrency = (nextCurrency: typeof currency) => {
    if (nextCurrency === currency) return;
    setCurrency(nextCurrency);
    setCalculatorOverride(slug, { ...forCalculator(slug).calculatorOverrides[slug], currency: nextCurrency });
    trackEvent('currency_changed', { calculator_slug: slug, calculator_group: 'business', action: 'currency_change' });
  };
  const relatedTools = content.relatedTools
    .map((related) => ({ ...related, tool: localTools.find((tool) => tool.slug === related.slug) }))
    .filter((related): related is typeof related & { tool: NonNullable<typeof related.tool> } => Boolean(related.tool));

  const update = (index: number, value: string) => {
    setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
    setCopied(false);
  };

  const trackSuccessfulCalculation = () => {
    if (!result.error) trackEvent('calculation_completed', { calculator_slug: slug, calculator_group: 'business' });
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
        await navigator.share({ title: content.title, text: resultText, url: toCanonicalUrl(toolHref) });
        trackEvent('share_result', { calculator_slug: slug, share_method: 'native' });
      } else if (await writeResultToClipboard()) {
        trackEvent('share_result', { calculator_slug: slug, share_method: 'copy_fallback' });
      }
    } catch {
      // Dismissing the share sheet is not an application error.
    }
  };

  const resetValues = () => {
    setValues(fields.map((field) => field.value));
    setCopied(false);
    trackEvent('calculator_used', { calculator_slug: slug, action: 'reset' });
  };

  return (
    <Shell>
      <Seo path={toolHref} />
      <div className="advanced-calc-page">

        <div className="advanced-calc-layout">
          <div className="advanced-calc-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> BUSINESS</div>
            <h1>{content.titleLines[0]}<br />{content.titleLines[1]}<span>.</span></h1>
            <p>{content.description}</p>
             {capability && <p className="calc-capability-note">{capability.visibleNote}</p>}
            <div className="calc-updated mono">UPDATED <time dateTime="2026-08">AUGUST 2026</time> · {content.updatedNote}</div>
          </div>

          <section className="advanced-calculator-card" aria-labelledby={a11y.regionLabelId}>
            <div className="advanced-calc-head">
              <span id={a11y.regionLabelId} className="mono">{content.title.toUpperCase()} — CALCULATE</span>
              <div className="live-dot"><i /> LIVE RESULT</div>
            </div>
            <label className="advanced-field" htmlFor={`${slug}-currency`}>
              <span>Currency</span>
              <CurrencySelector value={currency} onChange={setSelectedCurrency} id={`${slug}-currency`} />
            </label>

            <div className="advanced-fields">
              {fields.map((field, index) => (
                <label className="advanced-field" key={field.key} htmlFor={a11y.field(field.key).id}>
                  <span>{field.label}</span>
                  <div>
                    {field.prefix && <b>{field.prefix.replace('$', currencyPrefix(currency))}</b>}
                    <input
                      {...a11y.field(field.key)}
                      type="number"
                      min="0"
                      step="any"
                      value={values[index]}
                      onChange={(event) => update(index, event.target.value)}
                      onBlur={trackSuccessfulCalculation}
                      data-testid={`input-business-${field.key}`}
                    />
                    {field.suffix && <small>{field.suffix.replace('$', currencyPrefix(currency))}</small>}
                  </div>
                </label>
              ))}
            </div>

            <CalculatorResultAnnouncement error={result.error} result={result.primary} />
            <div className={`advanced-result ${result.error ? 'has-error' : ''}`}>
              <span className="mono">{content.resultLabel}</span>
              <strong data-testid="business-calculator-result">{result.primary}</strong>
              <p id={result.error ? a11y.errorId : undefined}>{result.error ?? localizeCurrencyText(content.resultSummary, currency)}</p>
              <div className="advanced-result-actions">
                <button type="button" onClick={() => void copyResult()} className="copy-button" disabled={Boolean(result.error)} data-testid="button-copy-business-result">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Copied' : 'Copy result'}
                </button>
                <button type="button" onClick={() => void shareResult()} className="copy-button" disabled={Boolean(result.error)} data-testid="button-share-business-result">
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>

            {result.details?.length ? (
              <div className="advanced-breakdown">
                <span className="mono">BREAKDOWN</span>
                {result.details.map((detail) => (
                  <div key={detail.label}><span>{detail.label}</span><strong>{localizeCurrencyText(detail.value, currency)}</strong></div>
                ))}
              </div>
            ) : null}

            <button type="button" className="reset-button mt-6" onClick={resetValues} data-testid="button-reset-business-calculator">Reset values</button>
          </section>
        </div>

        <div className="advanced-content-grid">
          <article className="advanced-content">
            <section>
              <div className="eyebrow">WHEN THIS CALCULATION HELPS</div>
              <h2>{content.decisionTitle}.</h2>
              {content.whenUseful.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>

            <section>
              <div className="eyebrow">CHOOSING THE RIGHT BUSINESS TOOL</div>
              <h2>Different questions need different denominators.</h2>
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
              <h2>See the business meaning, not just the math.</h2>
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
              <h2>Put the number in context.</h2>
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
              <h2>What this calculation leaves out.</h2>
              <p>{content.limitations}</p>
            </section>

            <section className="advanced-faq">
              <div className="eyebrow">FAQ</div>
              <h2>Questions people ask.</h2>
              {content.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
            </section>
          </article>

          <aside>
            <div className="related-tools">
              <div className="eyebrow">CONNECTED BUSINESS DECISIONS</div>
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
            <Link href="/category/business" className="advanced-aside-link"><span>Browse Business Calculators</span><ArrowRight size={15} /></Link>
          </aside>
        </div>
      </div>
    </Shell>
  );
}