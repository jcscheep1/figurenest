import { useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { ArrowLeft, ArrowRight, Check, Copy, Share2 } from 'lucide-react';
import { Seo } from '@/pages/AppPages';
import { Shell, ToolIcon } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { trackEvent } from '@/lib/analytics';
import { toCanonicalUrl } from '@/lib/public-url';
import { 
  type Mode, 
  calculatePercentageChange, 
  percentageChangeDefaults, 
  percentageChangeContent 
} from '@/lib/percentage-change';
import { localTools } from '@/lib/catalog';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';

export function PercentageChangePage() {
  const toolName = 'Percentage Change Calculator';
  const toolDescription = 'Calculate percentage increase or decrease, compare values by percentage difference, or reverse a percentage change.';
  const toolHref = '/calculators/math/percentage-increase-decrease';
  
  const [mode, setMode] = useState<Mode>('change');
  const [values, setValues] = useState<Record<string, string>>(() => percentageChangeDefaults('change'));
  const [copied, setCopied] = useState(false);

  const result = calculatePercentageChange(mode, values);
  const a11y = calculatorFieldA11y(`percentage-change-${mode}`, result.error ?? undefined);
  const activeContent = percentageChangeContent[mode];

  const updateMode = (next: Mode) => {
    setMode(next);
    setValues(percentageChangeDefaults(next));
    trackEvent('calculator_used', { calculator_slug: 'percentage-increase-decrease', action: `mode_switch_${next}` });
  };

  const update = (key: string, value: string) => {
    setValues({ ...values, [key]: value });
  };

  const trackSuccessfulCalculation = () => {
    if (!result.error) {
      trackEvent('calculation_completed', { 
        calculator_slug: 'percentage-increase-decrease', 
        calculator_group: 'math' 
      });
    }
  };

  const resultText = `${toolName}: ${result.primary}. ${result.summary}`;

  const writeResultToClipboard = async () => {
    try {
      if (!navigator.clipboard?.writeText) return false;
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
      trackEvent('copy_result', { calculator_slug: 'percentage-increase-decrease' });
    }
  };

  const shareResult = async () => {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: toolName, text: resultText, url: toCanonicalUrl(toolHref) });
        trackEvent('share_result', { calculator_slug: 'percentage-increase-decrease', share_method: 'native' });
      } else if (await writeResultToClipboard()) {
        trackEvent('share_result', { calculator_slug: 'percentage-increase-decrease', share_method: 'copy_fallback' });
      }
    } catch {
      // Dismissing the native share sheet should not surface an application error.
    }
  };

  const resetValues = () => {
    setValues(percentageChangeDefaults(mode));
    trackEvent('calculator_used', { calculator_slug: 'percentage-increase-decrease', action: 'reset' });
  };

  const relatedTools = percentageChangeContent.relatedToolSlugs
    .map((slug) => localTools.find((tool) => tool.slug === slug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  return (
    <Shell>
      <Seo path={toolHref} />
      <div className="advanced-calc-page">
        
        <div className="advanced-calc-layout">
          <div className="advanced-calc-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> MATH</div>
            <h1>Percentage Change<br />Calculator<span>.</span></h1>
            <p>{toolDescription}</p>
            <div className="calc-updated mono">UPDATED <time dateTime="2026-08">AUGUST 2026</time> · 3 CALCULATION MODES</div>
          </div>
          
          <section className="advanced-calculator-card" aria-labelledby={a11y.regionLabelId}>
            <div className="advanced-calc-head">
              <span id={a11y.regionLabelId} className="mono">PERCENTAGE CHANGE — CALCULATE</span>
              <div className="live-dot"><i /> LIVE RESULT</div>
            </div>
            
            <fieldset className="mode-selector" aria-label="Calculation Mode">
              <legend className="sr-only">Choose calculation mode</legend>
              <label className={mode === 'change' ? 'is-active' : ''} htmlFor="percentage-mode-change">
                <input 
                  id="percentage-mode-change"
                  type="radio" 
                  name="mode" 
                  value="change" 
                  checked={mode === 'change'} 
                  onChange={() => updateMode('change')} 
                  className="sr-only"
                   data-testid="mode-percentage-change"
                />
                Change
              </label>
              <label className={mode === 'difference' ? 'is-active' : ''} htmlFor="percentage-mode-difference">
                <input 
                  id="percentage-mode-difference"
                  type="radio" 
                  name="mode" 
                  value="difference" 
                  checked={mode === 'difference'} 
                  onChange={() => updateMode('difference')} 
                  className="sr-only"
                   data-testid="mode-percentage-difference"
                />
                Difference
              </label>
              <label className={mode === 'reverse' ? 'is-active' : ''} htmlFor="percentage-mode-reverse">
                <input 
                  id="percentage-mode-reverse"
                  type="radio" 
                  name="mode" 
                  value="reverse" 
                  checked={mode === 'reverse'} 
                  onChange={() => updateMode('reverse')} 
                  className="sr-only"
                   data-testid="mode-reverse-percentage"
                />
                Reverse
              </label>
            </fieldset>

            <div className="advanced-fields">
              {mode === 'change' && (
                <>
                  <label className="advanced-field">
                    <span>Original Value</span>
                    <div>
                      <input 
                        {...a11y.field('original')}
                        type="number" 
                        step="any" 
                        value={values.original ?? ''} 
                        onChange={(e) => update('original', e.target.value)} 
                        onBlur={trackSuccessfulCalculation}
                        aria-label="Original value"
                        data-testid="input-original-value"
                      />
                    </div>
                  </label>
                  <label className="advanced-field">
                    <span>New Value</span>
                    <div>
                      <input 
                        {...a11y.field('new')}
                        type="number" 
                        step="any" 
                        value={values.new ?? ''} 
                        onChange={(e) => update('new', e.target.value)} 
                        onBlur={trackSuccessfulCalculation}
                        aria-label="New value"
                        data-testid="input-new-value"
                      />
                    </div>
                  </label>
                </>
              )}
              
              {mode === 'difference' && (
                <>
                  <label className="advanced-field">
                    <span>Value A</span>
                    <div>
                      <input 
                        {...a11y.field('a')}
                        type="number" 
                        min="0"
                        step="any" 
                        value={values.a ?? ''} 
                        onChange={(e) => update('a', e.target.value)} 
                        onBlur={trackSuccessfulCalculation}
                        aria-label="First value"
                        data-testid="input-first-value"
                      />
                    </div>
                  </label>
                  <label className="advanced-field">
                    <span>Value B</span>
                    <div>
                      <input 
                        {...a11y.field('b')}
                        type="number" 
                        min="0"
                        step="any" 
                        value={values.b ?? ''} 
                        onChange={(e) => update('b', e.target.value)} 
                        onBlur={trackSuccessfulCalculation}
                        aria-label="Second value"
                        data-testid="input-second-value"
                      />
                    </div>
                  </label>
                </>
              )}

              {mode === 'reverse' && (
                <>
                  <label className="advanced-field">
                    <span>Final Value</span>
                    <div>
                      <input 
                        {...a11y.field('final')}
                        type="number" 
                        step="any" 
                        value={values.final ?? ''} 
                        onChange={(e) => update('final', e.target.value)} 
                        onBlur={trackSuccessfulCalculation}
                        aria-label="Final value"
                        data-testid="input-final-value"
                      />
                    </div>
                  </label>
                  <label className="advanced-field">
                    <span>Percentage Change</span>
                    <div>
                      <input 
                        {...a11y.field('percent')}
                        type="number" 
                        min="0"
                        step="any" 
                        value={values.percent ?? ''} 
                        onChange={(e) => update('percent', e.target.value)} 
                        onBlur={trackSuccessfulCalculation}
                        aria-label="Percentage change"
                        data-testid="input-percentage-rate"
                      />
                      <small>%</small>
                    </div>
                  </label>
                  <label className="advanced-field">
                    <span>Type of Change</span>
                    <div className="select-wrapper">
                      <select 
                        {...a11y.field('type')}
                        value={values.type ?? 'increase'} 
                        onChange={(e) => {
                          update('type', e.target.value);
                          trackSuccessfulCalculation();
                        }}
                        aria-label="Type of change"
                        data-testid="select-change-direction"
                      >
                        <option value="increase">Increase (+)</option>
                        <option value="decrease">Decrease (-)</option>
                      </select>
                    </div>
                  </label>
                </>
              )}
            </div>

            <CalculatorResultAnnouncement error={result.error ?? undefined} result={result.primary} />
            <div 
              className={`advanced-result ${result.error ? 'has-error' : ''}`} 
            >
              <span className="mono">YOUR RESULT</span>
              <strong data-testid="percentage-change-result">{result.primary}</strong>
              <p id={result.error ? a11y.errorId : undefined}>{result.summary}</p>
              <div className="advanced-result-actions">
                <button 
                  onClick={copyResult} 
                  className="copy-button" 
                  disabled={Boolean(result.error)}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />} 
                  {copied ? 'Copied' : 'Copy result'}
                </button>
                <button 
                  onClick={() => void shareResult()} 
                  className="copy-button" 
                  disabled={Boolean(result.error)}
                >
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>
            
            {result.breakdown.length > 0 && (
              <div className="advanced-breakdown">
                <span className="mono">BREAKDOWN</span>
                {result.breakdown.map((line) => (
                  <div key={line.label}>
                    <span>{line.label}</span>
                    <strong>{line.value}</strong>
                  </div>
                ))}
              </div>
            )}
            
            <button className="reset-button mt-6" onClick={resetValues}>
              Reset values
            </button>
          </section>
        </div>

        <div className="advanced-content-grid">
          <article className="advanced-content">
            <section>
              <div className="eyebrow">WHEN TO USE THIS MODE</div>
              <h2>Understanding {mode}</h2>
              <p>{activeContent.whenToUse}</p>
            </section>
            <section>
              <div className="eyebrow">HOW IT WORKS</div>
              <h2>Formula & methodology</h2>
              <p><strong>Formula:</strong> {activeContent.formula}</p>
              <p><strong>Example:</strong> {activeContent.example}</p>
            </section>
            <section>
              <div className="eyebrow">FORMULA REFERENCE</div>
              <h2>Three related calculations.</h2>
              <p>Choose the formula that matches the relationship between your values. Percentage change needs a clear starting point; percentage difference treats both values equally; reverse percentage recovers the starting value.</p>
              <div className="advanced-formula-list">
                {percentageChangeContent.formulas.map((item) => (
                  <div key={item.mode}>
                    <strong>{item.label}</strong>
                    <code>{item.formula}</code>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <div className="eyebrow">WORKED EXAMPLES</div>
              <h2>Follow the numbers.</h2>
              <div className="advanced-example-list">
                {percentageChangeContent.examples.map((example) => (
                  <article key={example.mode}>
                    <span className="mono">{example.title.toUpperCase()}</span>
                    <h3>{example.inputs}</h3>
                    <p><strong>Working:</strong> {example.working}</p>
                    <p><strong>Result:</strong> {example.result}</p>
                  </article>
                ))}
              </div>
            </section>
            <section>
              <div className="eyebrow">USEFUL INSTRUCTIONS</div>
              <h2>Step-by-step guidance.</h2>
              <ol>
                {activeContent.instructions.map((instruction, i) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ol>
            </section>
            <section className="advanced-faq">
              <div className="eyebrow">FAQ</div>
              <h2>Questions people ask.</h2>
              {percentageChangeContent.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>
          </article>
          
          <aside>
            <div className="related-tools">
              <div className="eyebrow">MORE MATH TOOLS</div>
              <div className="related-tool-list">
                {relatedTools.map((tool) => (
                  <Link 
                    href={tool.href} 
                    className="related-tool" 
                    key={tool.slug}
                    onClick={() => trackEvent('related_tool_clicked', { source_slug: 'percentage-increase-decrease', destination_slug: tool.slug })}
                  >
                    <ToolIcon category={tool.category} />
                    <span>
                      <strong>{tool.name}</strong>
                      <small>{tool.description}</small>
                    </span>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/category/math" className="advanced-aside-link">
              <span>Back to Math</span>
              <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
