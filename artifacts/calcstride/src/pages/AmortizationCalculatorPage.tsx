import { useMemo, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { Seo } from '@/pages/AppPages';
import { Shell } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { CurrencySelector } from '@/components/UnitsPreferencesSelectors';
import { localizeCurrencyText, useUnitsPreferences } from '@/lib/units-preferences';
import { calculateAmortizationSchedule } from '@/lib/amortization-schedule';

const TOOL_PATH = '/calculators/amortization-calculator';
const TOOL_SLUG = 'amortization-calculator';

const money = (value: number, currency: string) => localizeCurrencyText(`$${value.toFixed(2)}`, currency as never);

export function AmortizationCalculatorPage() {
  const [principal, setPrincipal] = useState('100000');
  const [annualRate, setAnnualRate] = useState('6');
  const [termYears, setTermYears] = useState('30');
  const [extraMonthly, setExtraMonthly] = useState('0');
  const { forCalculator, setCurrency, setCalculatorOverride } = useUnitsPreferences();
  const preferences = forCalculator(TOOL_SLUG);
  const currency = preferences.currency;

  const calculation = useMemo(() => {
    try {
      const years = Number(termYears);
      if (!Number.isFinite(years) || years <= 0 || !Number.isInteger(years * 12)) {
        throw new Error('Loan term must convert to a whole positive number of months.');
      }
      return {
        result: calculateAmortizationSchedule({
          principal: Number(principal),
          annualRatePercent: Number(annualRate),
          months: years * 12,
          extraMonthlyPrincipal: Number(extraMonthly || 0),
        }),
        error: '',
      };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : 'Check the entered values.' };
    }
  }, [annualRate, extraMonthly, principal, termYears]);

  const result = calculation.result;
  const reset = () => {
    setPrincipal('100000');
    setAnnualRate('6');
    setTermYears('30');
    setExtraMonthly('0');
  };

  return (
    <Shell>
      <Seo path={TOOL_PATH} />
      <div className="advanced-calc-page" data-testid="page-amortization-calculator">
        <div className="advanced-calc-layout">
          <header className="advanced-calc-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> FIGURENEST MONEY &amp; FINANCE</div>
            <h1>Loan Amortization Calculator<span>.</span></h1>
            <p>Build a month-by-month loan amortization schedule from principal, annual interest rate and term, with an optional recurring extra-principal payment.</p>
            <div className="date-method-notes" role="note">
              <p><strong>Important context:</strong> This models a fixed-rate, fully amortizing loan with monthly interest and payments. It does not reproduce lender fees, daily-interest conventions, APR fee treatment, taxes, insurance, or changing rates.</p>
            </div>
            <p className="advanced-local-note mt-6">Your inputs and schedule are calculated locally in your browser.</p>
          </header>

          <section className="advanced-calculator-card" aria-labelledby="amortization-calculate-heading">
            <div className="advanced-calc-head"><span id="amortization-calculate-heading" className="mono">LOAN AMORTIZATION — CALCULATE</span><div className="live-dot"><i /> LOCAL RESULT</div></div>
            <label className="advanced-field" htmlFor="amortization-currency"><span>Display currency</span><CurrencySelector id="amortization-currency" value={currency} onChange={(next) => { setCurrency(next); setCalculatorOverride(TOOL_SLUG, { ...preferences.calculatorOverrides[TOOL_SLUG], currency: next }); }} /></label>
            <div className="advanced-fields">
              <label className="advanced-field" htmlFor="amortization-principal"><span>Loan principal</span><div><input id="amortization-principal" type="number" min="0.01" step="100" value={principal} onChange={(event) => setPrincipal(event.target.value)} /></div></label>
              <label className="advanced-field" htmlFor="amortization-rate"><span>Annual interest rate (%)</span><div><input id="amortization-rate" type="number" min="0" step="0.01" value={annualRate} onChange={(event) => setAnnualRate(event.target.value)} /></div></label>
              <label className="advanced-field" htmlFor="amortization-term"><span>Loan term (years)</span><div><input id="amortization-term" type="number" min="0.0833333333" step="0.0833333333" value={termYears} onChange={(event) => setTermYears(event.target.value)} /></div></label>
              <label className="advanced-field" htmlFor="amortization-extra"><span>Extra principal each month</span><div><input id="amortization-extra" type="number" min="0" step="10" value={extraMonthly} onChange={(event) => setExtraMonthly(event.target.value)} /></div></label>
            </div>

            <div className={`advanced-result${calculation.error ? ' has-error' : ''}`} aria-live="polite">
              <span className="mono">{calculation.error ? 'CHECK THE VALUES' : 'SCHEDULED MONTHLY PAYMENT'}</span>
              <strong className="advanced-result-output">{result ? money(result.scheduledMonthlyPayment, currency) : '—'}</strong>
              <p>{calculation.error || (result ? `Payoff in ${result.payoffMonths} month${result.payoffMonths === 1 ? '' : 's'}, with ${money(result.totalInterest, currency)} total interest.` : '')}</p>
            </div>
            {result && <div className="advanced-breakdown">
              <div><span>Total interest</span><strong>{money(result.totalInterest, currency)}</strong></div>
              <div><span>Total paid</span><strong>{money(result.totalPaid, currency)}</strong></div>
              <div><span>Payoff months</span><strong>{result.payoffMonths}</strong></div>
              <div><span>Payments shortened</span><strong>{Math.max(0, Math.round(Number(termYears) * 12) - result.payoffMonths)}</strong></div>
            </div>}
            <button type="button" className="reset-button mt-6" onClick={reset}>Reset values</button>
          </section>
        </div>

        {result && <section className="advanced-content" aria-labelledby="amortization-schedule-heading">
          <div className="eyebrow">AMORTIZATION SCHEDULE</div>
          <h2 id="amortization-schedule-heading">Monthly principal, interest and remaining balance.</h2>
          <p>Each row applies that month's interest first, then scheduled principal and any recurring extra principal. The final row is adjusted for currency rounding so the ending balance cannot become negative.</p>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
              <thead><tr><th scope="col">Month</th><th scope="col">Payment</th><th scope="col">Principal</th><th scope="col">Interest</th><th scope="col">Extra principal</th><th scope="col">Balance</th></tr></thead>
              <tbody>{result.schedule.map((row) => <tr key={row.period}><td>{row.period}</td><td>{money(row.payment, currency)}</td><td>{money(row.principal, currency)}</td><td>{money(row.interest, currency)}</td><td>{money(row.extraPrincipal, currency)}</td><td>{money(row.balance, currency)}</td></tr>)}</tbody>
            </table>
          </div>
        </section>}

        <div className="advanced-content-grid">
          <article className="advanced-content">
            <section><div className="eyebrow">METHOD</div><h2>How loan amortization works.</h2><p>For a positive fixed annual rate, the scheduled payment uses the standard level-payment annuity formula: payment = P × r / (1 − (1 + r)^−n), where P is principal, r is the monthly interest rate, and n is the number of monthly payments. At 0% interest, payment is simply principal divided by the number of months.</p></section>
            <section><div className="eyebrow">GUIDANCE</div><h2>Why principal and interest change over time.</h2><p>Interest is calculated from the remaining balance. Early payments therefore contain more interest when the balance is high. As principal falls, monthly interest falls too, so more of the same scheduled payment goes toward principal.</p></section>
            <section><div className="eyebrow">EXTRA PAYMENTS</div><h2>What recurring extra principal changes.</h2><p>An extra principal amount is applied after scheduled interest and principal. Because it lowers the balance sooner, it can reduce later interest and shorten the payoff period. Real lenders may apply extra payments differently, so check your loan agreement before acting on the estimate.</p></section>
            <section><div className="eyebrow">LIMITATIONS</div><h2>Use the schedule as an estimate.</h2><p>This tool assumes a fixed nominal annual interest rate divided into twelve monthly periods. It excludes origination fees, late fees, taxes, insurance, daily accrual, variable rates, payment holidays and lender-specific rounding rules. APR can include fees that this calculator does not model.</p></section>
            <section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Common amortization questions.</h2>
              <details><summary>What is an amortization schedule?</summary><p>It is a payment-by-payment breakdown showing how much goes to interest and principal and what balance remains after each payment.</p></details>
              <details><summary>Do extra payments reduce interest?</summary><p>In this model, yes. Extra principal reduces the balance earlier, which reduces later interest and can shorten the payoff period.</p></details>
              <details><summary>Can I calculate a 0% loan?</summary><p>Yes. At 0% interest, the scheduled payment is principal divided evenly across the selected number of months.</p></details>
              <details><summary>Is APR the same as the interest rate used here?</summary><p>Not always. APR may include lender fees and other costs. Enter the nominal annual interest rate that accrues on the balance unless your loan terms explicitly use the same APR as the note rate.</p></details>
              <details><summary>Why can my lender's final payment differ by a few cents?</summary><p>Lenders can use different accrual and rounding conventions. FigureNest rounds the monthly schedule to cents and closes any tiny contractual-term residual in the final payment.</p></details>
            </section>
          </article>
          <aside><div className="related-tools"><div className="eyebrow">RELATED TOOLS</div><Link href="/calculators/finance/loan" className="advanced-aside-link">Loan Calculator</Link><Link href="/calculators/finance/mortgage" className="advanced-aside-link">Mortgage Calculator</Link><Link href="/calculators/finance/mortgage-amortization" className="advanced-aside-link">Mortgage Amortization Calculator</Link><Link href="/calculators/finance/auto-loan" className="advanced-aside-link">Auto Loan Calculator</Link><Link href="/calculators/finance/compound-interest" className="advanced-aside-link">Compound Interest Calculator</Link><Link href="/category/finance" className="advanced-aside-link">All Money &amp; Finance tools</Link></div></aside>
        </div>
      </div>
    </Shell>
  );
}
