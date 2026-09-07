import { useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { ArrowLeft, ArrowRight, Check, Copy, Share2, ArrowDownUp } from 'lucide-react';
import { Seo } from '@/pages/AppPages';
import { Shell, ToolIcon } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { trackEvent } from '@/lib/analytics';
import { toCanonicalUrl } from '@/lib/public-url';
import { localTools } from '@/lib/catalog';
import { calculateDateArithmetic, calculateDateDuration, dateDurationContent, type DateArithmeticDirection } from '@/lib/date-duration';
import { CalculatorResultAnnouncement, calculatorFieldA11y } from '@/components/calculators/CalculatorFieldA11y';

export function DateDurationPage() {
  const toolName = 'Date Calculator & Day Counter';
  const toolDescription = 'Count exact days between two dates or add and subtract calendar years, months, weeks, and days.';
  const toolHref = '/calculators/date-time/date-difference';
  
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2025-03-15');
  const [includeEndDate, setIncludeEndDate] = useState(false);
  const [mode, setMode] = useState<'duration' | 'arithmetic'>('duration');
  const [arithmeticDirection, setArithmeticDirection] = useState<DateArithmeticDirection>('add');
  const [years, setYears] = useState('0');
  const [months, setMonths] = useState('0');
  const [weeks, setWeeks] = useState('0');
  const [days, setDays] = useState('0');
  const [copied, setCopied] = useState(false);

  const amount = (value: string) => value === '' ? Number.NaN : Number(value);
  const durationResult = calculateDateDuration({ startDate, endDate, includeEndDate });
  const arithmeticResult = calculateDateArithmetic({
    startDate,
    direction: arithmeticDirection,
    years: amount(years),
    months: amount(months),
    weeks: amount(weeks),
    days: amount(days),
  });
  const result = mode === 'duration' ? durationResult : arithmeticResult;
  const resultError = result.ok ? undefined : result.error;
  const announcedResult = mode === 'duration'
    ? durationResult.ok ? durationResult.primary : 'Unable to calculate'
    : arithmeticResult.ok ? arithmeticResult.resultDate : 'Unable to calculate';
  const a11y = calculatorFieldA11y(`date-difference-${mode}`, resultError);
  const activeContent = dateDurationContent;

  const trackSuccessfulCalculation = () => {
    if (result.ok) {
      trackEvent('calculation_completed', { 
        calculator_slug: 'date-difference', 
        calculator_group: 'date-time' 
      });
    }
  };

  const resultText = mode === 'duration'
    ? durationResult.ok ? `${toolName}: ${durationResult.primary}. ${durationResult.summary}` : ''
    : arithmeticResult.ok ? `${toolName}: ${arithmeticResult.resultDate}. ${arithmeticResult.summary}` : '';

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
      trackEvent('copy_result', { calculator_slug: 'date-difference' });
    }
  };

  const shareResult = async () => {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: toolName, text: resultText, url: toCanonicalUrl(toolHref) });
        trackEvent('share_result', { calculator_slug: 'date-difference', share_method: 'native' });
      } else if (await writeResultToClipboard()) {
        trackEvent('share_result', { calculator_slug: 'date-difference', share_method: 'copy_fallback' });
      }
    } catch {
      // Dismissing native share sheet
    }
  };

  const resetValues = () => {
    setStartDate('2024-01-01');
    setEndDate('2025-03-15');
    setIncludeEndDate(false);
    setMode('duration');
    setArithmeticDirection('add');
    setYears('0');
    setMonths('0');
    setWeeks('0');
    setDays('0');
    trackEvent('calculator_used', { calculator_slug: 'date-difference', action: 'reset' });
  };

  const swapDates = () => {
    setStartDate(endDate);
    setEndDate(startDate);
    trackEvent('calculator_used', { calculator_slug: 'date-difference', action: 'swap_dates' });
  };

  const relatedTools = activeContent.relatedToolSlugs
    .map((slug) => localTools.find((tool) => tool.slug === slug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  return (
    <Shell>
      <Seo path={toolHref} />
      <div className="advanced-calc-page">
        <nav aria-label="Breadcrumb" className="mono">
          <Link href="/">Home</Link> / <Link href="/category/date-time">Date &amp; Time</Link> / Date Duration Calculator
        </nav>
        
        <div className="advanced-calc-layout">
          <div className="advanced-calc-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> DATE & TIME</div>
            <h1>Date Calculator<br />&amp; Day Counter<span>.</span></h1>
            <p>{toolDescription}</p>
            <div className="calc-updated mono">UPDATED <time dateTime="2026-08">AUGUST 2026</time> · CALENDAR-AWARE MATH</div>
          </div>
          
          <section className="advanced-calculator-card" aria-labelledby={a11y.regionLabelId}>
            <div className="advanced-calc-head">
              <span id={a11y.regionLabelId} className="mono">DATE CALCULATOR — CALCULATE</span>
              <div className="live-dot"><i /> LIVE RESULT</div>
            </div>

            <fieldset className="mode-selector">
              <label className={mode === 'duration' ? 'is-active' : ''} htmlFor="date-mode-duration">
                <input id="date-mode-duration" type="radio" name="date-mode" value="duration" checked={mode === 'duration'} onChange={() => setMode('duration')} data-testid="radio-date-mode-duration" />
                Days between dates
              </label>
              <label className={mode === 'arithmetic' ? 'is-active' : ''} htmlFor="date-mode-arithmetic">
                <input id="date-mode-arithmetic" type="radio" name="date-mode" value="arithmetic" checked={mode === 'arithmetic'} onChange={() => setMode('arithmetic')} data-testid="radio-date-mode-arithmetic" />
                Add or subtract dates
              </label>
            </fieldset>

            <div className="advanced-fields" style={{ paddingBottom: '0' }}>
              <label className="advanced-field" htmlFor={a11y.field('start-date').id}>
                <span>Start Date</span>
                <div>
                  <input 
                    {...a11y.field('start-date')}
                    type="date" 
                     min="0001-01-01"
                     max="9999-12-31"
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    onBlur={trackSuccessfulCalculation}
                    aria-label="Start date"
                    data-testid="input-start-date"
                  />
                </div>
              </label>

              {mode === 'duration' && <div className="date-swap-row">
                <button 
                  type="button"
                  onClick={swapDates} 
                  className="date-swap-btn" 
                  aria-label="Swap dates"
                  title="Swap dates"
                  data-testid="button-swap-dates"
                >
                  <ArrowDownUp size={18} />
                </button>
              </div>}

              {mode === 'duration' && <label className="advanced-field" htmlFor={a11y.field('end-date').id}>
                <span>End Date</span>
                <div>
                  <input 
                    {...a11y.field('end-date')}
                    type="date" 
                     min="0001-01-01"
                     max="9999-12-31"
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    onBlur={trackSuccessfulCalculation}
                    aria-label="End date"
                    data-testid="input-end-date"
                  />
                </div>
              </label>}

              {mode === 'duration' && <label className="date-checkbox-label" htmlFor={a11y.field('include-end-date').id}>
                <input 
                  {...a11y.field('include-end-date')}
                  type="checkbox" 
                  checked={includeEndDate}
                  onChange={(e) => {
                    setIncludeEndDate(e.target.checked);
                    trackSuccessfulCalculation();
                  }}
                  data-testid="toggle-include-end-date"
                />
                Include the end date (+1 day)
              </label>}

              {mode === 'arithmetic' && <>
                <label className="advanced-field" htmlFor={a11y.field('direction').id}>
                  <span>Direction</span>
                  <div>
                    <select {...a11y.field('direction')} value={arithmeticDirection} onChange={(e) => setArithmeticDirection(e.target.value as DateArithmeticDirection)} aria-label="Date calculation direction" data-testid="select-date-arithmetic-direction">
                      <option value="add">Add time to start date</option>
                      <option value="subtract">Subtract time from start date</option>
                    </select>
                  </div>
                </label>
                {([
                  { label: 'Years', value: years, setter: setYears, name: 'years' },
                  { label: 'Months', value: months, setter: setMonths, name: 'months' },
                  { label: 'Weeks', value: weeks, setter: setWeeks, name: 'weeks' },
                  { label: 'Days', value: days, setter: setDays, name: 'days' },
                ] as const).map(({ label, value, setter, name }) => (
                  <label className="advanced-field" key={name} htmlFor={a11y.field(name).id}>
                    <span>{label}</span>
                    <div>
                      <input {...a11y.field(name)} type="number" inputMode="numeric" min="0" step="1" value={value} onChange={(e) => setter(e.target.value)} onBlur={trackSuccessfulCalculation} aria-label={`${label} to ${arithmeticDirection}`} data-testid={`input-date-arithmetic-${name}`} />
                    </div>
                  </label>
                ))}
              </>}
            </div>

            <CalculatorResultAnnouncement error={resultError} result={announcedResult} />
            <div 
              className={`advanced-result ${!result.ok ? 'has-error' : ''}`} 
              style={{ marginTop: '25px' }}
            >
              <span className="mono">YOUR RESULT</span>
              <strong data-testid="date-duration-result">
                {mode === 'duration'
                  ? durationResult.ok ? durationResult.primary : 'Unable to calculate'
                  : arithmeticResult.ok ? arithmeticResult.resultDate : 'Unable to calculate'}
              </strong>
              <p id={resultError ? a11y.errorId : undefined}>{result.ok ? result.summary : result.error}</p>
              <div className="advanced-result-actions">
                <button 
                  type="button"
                  onClick={copyResult} 
                  className="copy-button" 
                  disabled={!result.ok}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />} 
                  {copied ? 'Copied' : 'Copy result'}
                </button>
                <button 
                  type="button"
                  onClick={() => void shareResult()} 
                  className="copy-button" 
                  disabled={!result.ok}
                >
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>
            
            {result.ok && (
              <div className="advanced-breakdown">
                <span className="mono">{mode === 'duration' ? 'DURATION BREAKDOWN' : 'DATE CALCULATION BREAKDOWN'}</span>
                {result.breakdown.map((line) => (
                    <div key={line.label}>
                      <span>{line.label}</span>
                      <strong>{line.value}</strong>
                    </div>
                ))}
              </div>
            )}
            
            <button type="button" className="reset-button mt-6" onClick={resetValues}>
              Reset dates
            </button>
          </section>
        </div>

        <div className="advanced-content-grid">
          <article className="advanced-content">
            <section>
              <div className="eyebrow">HOW IT WORKS</div>
              <h2>Calendar-aware methodology.</h2>
              <p>{activeContent.methodology.method}</p>
              <div className="date-method-notes">
                <p><strong>Counting assumption:</strong> {activeContent.methodology.assumptions}</p>
                <p><strong>What is not included:</strong> {activeContent.methodology.limitation}</p>
              </div>
            </section>

            <section>
              <div className="eyebrow">UNDERSTANDING THE UNITS</div>
              <h2>Why the answers use two views.</h2>
              <p>The calendar result uses whole years and months first, then counts the days left over. The totals show the same span as exact calendar days and as whole seven-day weeks plus remaining days.</p>
              <p>Because months and years vary in length, a calendar month is not converted into a fixed 30-day block. This keeps anniversaries and month-end dates meaningful while still giving you an exact total-day count.</p>
            </section>

            <section>
              <div className="eyebrow">FORMULAS &amp; COUNTING RULES</div>
              <h2>Calendar formulas, not 24-hour estimates.</h2>
              <div className="advanced-formula-list">
                <div>
                  <strong>Exact day count</strong>
                  <code>days between = UTC calendar-day serial(end) − UTC calendar-day serial(start)</code>
                </div>
                <div>
                  <strong>Inclusive day count</strong>
                  <code>inclusive days = exact day count + 1; both selected endpoint dates are counted</code>
                </div>
                <div>
                  <strong>Add or subtract a date</strong>
                  <code>result = start date ± years, then ± months, then ± (weeks × 7 + days); each calendar step clamps to a real month-end</code>
                </div>
              </div>
              <p>The order is intentional: adding one month to January 31 reaches February’s last valid day before any week or day adjustment is made. Gregorian leap-year rules determine whether that day is February 28 or February 29.</p>
            </section>

            {activeContent.examples.length > 0 && (
              <section>
                <div className="eyebrow">WORKED EXAMPLES</div>
                <h2>See how the time is counted.</h2>
                <div className="advanced-example-list">
                  {activeContent.examples.map((example) => (
                    <article key={example.title}>
                      <span className="mono">{example.title.toUpperCase()}</span>
                      <h3>{example.input}</h3>
                      <p><strong>Result:</strong> {example.result}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeContent.instructions.length > 0 && (
              <section>
                <div className="eyebrow">USEFUL INSTRUCTIONS</div>
                <h2>Using the calculator.</h2>
                <ol>
                  {activeContent.instructions.map((instruction) => (
                    <li key={instruction}>{instruction}</li>
                  ))}
                </ol>
              </section>
            )}

            {activeContent.faqs.length > 0 && (
              <section className="advanced-faq">
                <div className="eyebrow">FAQ</div>
                <h2>Questions people ask.</h2>
                {activeContent.faqs.map((faq) => (
                  <details key={faq.question}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </section>
            )}
          </article>
          
          <aside>
            <div className="related-tools">
              <div className="eyebrow">MORE DATE & TIME TOOLS</div>
              <div className="related-tool-list">
                {relatedTools.map((tool) => (
                  <Link 
                    href={tool.href} 
                    className="related-tool" 
                    key={tool.slug}
                    onClick={() => trackEvent('related_tool_clicked', { source_slug: 'date-difference', destination_slug: tool.slug })}
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
            <Link href="/category/date-time" className="advanced-aside-link">
              <span>Back to Date & Time</span>
              <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
