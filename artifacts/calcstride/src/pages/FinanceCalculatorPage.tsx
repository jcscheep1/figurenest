import { useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { ArrowLeft, ArrowRight, Check, Copy, Share2 } from 'lucide-react';
import { Seo } from '@/pages/AppPages';
import { Shell, ToolIcon } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { trackEvent } from '@/lib/analytics';
import { toCanonicalUrl } from '@/lib/public-url';
import { calculateCore, coreFields } from '@/lib/core-calculators';
import { financeCalculatorContent, type FinanceCalculatorSlug } from '@/lib/finance-calculators';
import { localTools } from '@/lib/catalog';
import { CurrencySelector } from '@/components/UnitsPreferencesSelectors';
import { currencyPrefix, localizeCurrencyText, useUnitsPreferences } from '@/lib/units-preferences';
import { getCalculatorSeoCapability } from '@/lib/seo-capabilities';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';
import { CalculatorDecisionExpansion, CalculatorModeSwitch, useCalculatorMode } from '@/components/calculators/CalculatorDecisionExpansion';

const financeArticleLinks: Partial<Record<FinanceCalculatorSlug, { href: string; label: string }[]>> = {
  loan: [{ href: '/articles/loan-payment-calculations', label: 'How fixed loan payments are calculated' }],
  mortgage: [
    { href: '/articles/mortgage-payment-basics', label: 'Mortgage payment basics' },
    { href: '/articles/refinancing-considerations', label: 'Refinancing costs and break-even questions' },
  ],
  'compound-interest': [{ href: '/articles/compound-interest-guide', label: 'How compound interest works' }],
};

export function FinanceCalculatorPage({ slug }: { slug: FinanceCalculatorSlug }) {
  const content = financeCalculatorContent[slug];
  const capability = getCalculatorSeoCapability(slug);
  const toolHref = `/calculators/finance/${slug}`;
  const fields = coreFields[slug];
  const [values, setValues] = useState(() => fields.map((field) => field.value));
  const [copied, setCopied] = useState(false);
  const supportsAdvancedMode = slug === 'loan' || slug === 'mortgage' || slug === 'compound-interest';
  const [advancedMode, setAdvancedMode] = useCalculatorMode(supportsAdvancedMode);
  const { forCalculator, setCalculatorOverride, setCurrency } = useUnitsPreferences();
  const currency = forCalculator(slug).currency;
  const result = calculateCore(slug, values, 'default', { currency });
  const a11y = calculatorFieldA11y(slug, result.error);
  const resultText = localizeCurrencyText(`${content.title}: ${result.primary}. ${content.resultSummary}`, currency);
  const setSelectedCurrency = (nextCurrency: typeof currency) => {
    if (nextCurrency === currency) return;
    setCurrency(nextCurrency);
    setCalculatorOverride(slug, { ...forCalculator(slug).calculatorOverrides[slug], currency: nextCurrency });
    trackEvent('currency_changed', { calculator_slug: slug, calculator_group: 'finance', action: 'currency_change' });
  };
  const relatedTools = content.relatedTools
    .map((related) => ({
      ...related,
      tool: localTools.find((tool) => tool.slug === related.slug),
    }))
    .filter((related): related is typeof related & { tool: NonNullable<typeof related.tool> } => Boolean(related.tool));

  const update = (index: number, value: string) => {
    setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  };

  const trackSuccessfulCalculation = () => {
    if (!result.error) {
      trackEvent('calculation_completed', { calculator_slug: slug, calculator_group: 'finance' });
    }
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
    if (await writeResultToClipboard()) {
      trackEvent('copy_result', { calculator_slug: slug });
    }
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
      // Dismissing the native share sheet should not surface an application error.
    }
  };

  const resetValues = () => {
    setValues(fields.map((field) => field.value));
    trackEvent('calculator_used', { calculator_slug: slug, action: 'reset' });
  };

  return (
    <Shell>
      <Seo path={toolHref} />
      <div className="advanced-calc-page">

        <div className="advanced-calc-layout">
          <div className="advanced-calc-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> MONEY & FINANCE</div>
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
            {supportsAdvancedMode && <CalculatorModeSwitch advanced={advancedMode} onChange={setAdvancedMode} />}
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
                      step={['loan', 'mortgage'].includes(slug) && field.key === 'years' ? '0.08333333333333333' : 'any'}
                      value={values[index]}
                      onChange={(event) => update(index, event.target.value)}
                      onBlur={trackSuccessfulCalculation}
                      data-testid={`input-finance-${field.key}`}
                    />
                    {field.suffix && <small>{field.suffix.replace('$', currencyPrefix(currency))}</small>}
                  </div>
                </label>
              ))}
            </div>
            {supportsAdvancedMode && <CalculatorDecisionExpansion slug={slug} values={values} currency={currency} open={advancedMode} />}

            <CalculatorResultAnnouncement error={result.error} result={result.primary} />
            <div className={`advanced-result ${result.error ? 'has-error' : ''}`}>
              <span className="mono">{content.resultLabel}</span>
              <strong data-testid="finance-calculator-result">{result.primary}</strong>
              <p id={result.error ? a11y.errorId : undefined}>{result.error ?? localizeCurrencyText(content.resultSummary, currency)}</p>
              <div className="advanced-result-actions">
                <button onClick={() => void copyResult()} className="copy-button" disabled={Boolean(result.error)} data-testid="button-copy-finance-result">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Copied' : 'Copy result'}
                </button>
                <button onClick={() => void shareResult()} className="copy-button" disabled={Boolean(result.error)} data-testid="button-share-finance-result">
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>

            {result.details?.length ? (
              <div className="advanced-breakdown">
                <span className="mono">BREAKDOWN</span>
                {result.details.map((detail) => (
                  <div key={detail.label}>
                    <span>{detail.label}</span>
                    <strong>{localizeCurrencyText(detail.value, currency)}</strong>
                  </div>
                ))}
              </div>
            ) : null}

            <button className="reset-button mt-6" onClick={resetValues} data-testid="button-reset-finance-calculator">Reset values</button>
          </section>
        </div>

        <div className="advanced-content-grid">
          <article className="advanced-content">
            <section>
              <div className="eyebrow">WHEN THIS CALCULATION HELPS</div>
              <h2>A decision tool, not just an answer.</h2>
              <p>{content.whenUseful}</p>
              <ul>{content.usefulFor.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>

            <section>
              <div className="eyebrow">HOW IT WORKS</div>
              <h2>Formula and calculation method.</h2>
              <div className="advanced-formula-list">
                <div>
                  <strong>Formula</strong>
                  <code>{content.formula}</code>
                </div>
              </div>
              <p>{content.formulaExplanation}</p>
              <p><strong>Zero-rate case:</strong> {content.zeroRateNote}</p>
            </section>

            <section>
              <div className="eyebrow">WORKED EXAMPLES</div>
              <h2>See the result in context.</h2>
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
              <div className="eyebrow">USE IT CAREFULLY</div>
              <h2>Assumptions and common mistakes.</h2>
              <div className="finance-guidance-grid">
                <div>
                  <h3>What the estimate assumes</h3>
                  <ul>{content.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div>
                  <h3>Mistakes to avoid</h3>
                  <ul>{content.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            </section>

            <section>
              <div className="eyebrow">EDGE CASES</div>
              <h2>What unusual inputs mean.</h2>
              <div className="finance-edge-list">
                {content.edgeCases.map((item) => (
                  <div key={item.title}>
                    <strong>{item.title}</strong>
                    <p>{item.explanation}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="eyebrow">STEP BY STEP</div>
              <h2>How to use this calculator.</h2>
              <ol>{content.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol>
            </section>

            <section>
              <div className="eyebrow">LIMITATIONS</div>
              <h2>What the estimate leaves out.</h2>
              <p>{content.limitations}</p>
            </section>

            <section className="advanced-faq">
              <div className="eyebrow">FAQ</div>
              <h2>Questions people ask.</h2>
              {content.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>
          </article>

          <aside>
            <div className="related-tools">
              <div className="eyebrow">CONNECTED MONEY DECISIONS</div>
              <div className="related-tool-list">
                {relatedTools.map(({ tool, linkLabel, context }) => (
                  <Link
                    href={tool.href}
                    className="related-tool finance-related-tool"
                    key={tool.slug}
                    onClick={() => trackEvent('related_tool_clicked', { source_slug: slug, destination_slug: tool.slug })}
                  >
                    <ToolIcon category={tool.category} />
                    <span>
                      <strong>{linkLabel}</strong>
                      <small>{context}</small>
                    </span>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            </div>
            {financeArticleLinks[slug]?.length ? <div className="related-tools">
              <div className="eyebrow">UNDERSTAND THE METHOD</div>
              <div className="related-tool-list">
                {financeArticleLinks[slug]?.map((article) => <Link href={article.href} className="related-tool finance-related-tool" key={article.href}>
                  <span><strong>{article.label}</strong><small>Read a worked example, assumptions, and limitations.</small></span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>)}
              </div>
            </div> : null}
            <Link href="/category/finance" className="advanced-aside-link">
              <span>Browse Money & Finance</span>
              <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
