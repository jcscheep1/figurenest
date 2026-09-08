import { useMemo, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import { Shell } from '@/components/FigureNestShell';
import { Seo } from '@/pages/AppPages';
import { estimateSocialSecurityBenefit, formatRetirementAge, parseRequiredSocialSecurityNumber } from '@/lib/social-security';

const money = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function SocialSecurityEstimator() {
  const [pia, setPia] = useState('2000');
  const [birthYear, setBirthYear] = useState('1960');
  const [claimingAge, setClaimingAge] = useState('67');
  const result = useMemo(
    () => estimateSocialSecurityBenefit(
      parseRequiredSocialSecurityNumber(pia),
      parseRequiredSocialSecurityNumber(birthYear),
      parseRequiredSocialSecurityNumber(claimingAge),
    ),
    [pia, birthYear, claimingAge],
  );
  const factor = result ? `${(result.factor * 100).toFixed(1)}%` : '—';

  return <Shell><Seo path="/calculators/finance/social-security" /><div className="advanced-calc-page" data-testid="page-social-security">
    <div className="advanced-calc-layout">
      <header className="advanced-calc-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> FIGURENEST MONEY &amp; FINANCE</div>
        <h1>Social Security Benefit Estimator<span>.</span></h1>
        <p>Estimate a US retirement benefit from your primary insurance amount (PIA), birth year, and whole claiming age using Social Security full-retirement-age reductions and delayed credits.</p>
        <div className="date-method-notes" role="note"><p><strong>Important:</strong> This is a planning estimate, not an SSA benefit determination. Your PIA should come from your Social Security record. If you were born on January 1, SSA generally uses the previous birth year when determining full retirement age.</p></div>
        <p className="advanced-local-note mt-6">This calculator runs locally in your browser. Entered values are not sent to a calculation service.</p>
      </header>
      <section className="advanced-calculator-card" aria-label="Social Security benefit estimator">
        <div className="advanced-calc-head"><span className="mono">SOCIAL SECURITY — ESTIMATE</span><div className="live-dot"><i /> LOCAL RESULT</div></div>
        <div className="advanced-fields">
          <label className="advanced-field" htmlFor="social-security-pia"><span>Primary insurance amount (PIA), monthly USD</span><div><input id="social-security-pia" type="number" min="0" max="20000" step="0.01" value={pia} onChange={(e)=>setPia(e.target.value)} /></div></label>
          <label className="advanced-field" htmlFor="social-security-birth-year"><span>Birth year</span><div><input id="social-security-birth-year" type="number" min="1943" max="2100" step="1" value={birthYear} onChange={(e)=>setBirthYear(e.target.value)} /></div><small>Supported cohorts are 1943 or later, where delayed retirement credits are 8% per year.</small></label>
          <label className="advanced-field" htmlFor="social-security-claim-age"><span>Claiming age (whole years)</span><div><input id="social-security-claim-age" type="number" min="62" max="70" step="1" value={claimingAge} onChange={(e)=>setClaimingAge(e.target.value)} /></div></label>
        </div>
        <div className={`advanced-result${!result ? ' has-error' : ''}`} role="status" aria-live="polite">
          <span className="mono">{result ? 'ESTIMATED MONTHLY BENEFIT' : 'CHECK THE VALUES'}</span>
          <strong className="advanced-result-output">{result ? `${money(result.monthlyBenefit)}/month` : 'Enter valid values'}</strong>
          <p>{result ? 'Approximate retirement benefit relative to the entered PIA at the selected whole claiming age.' : 'Use a PIA from 0 to 20,000, a birth year from 1943 onward, and a whole claiming age from 62 through 70.'}</p>
        </div>
        {result && <div className="advanced-breakdown">
          <div><span>Benefit factor</span><strong>{factor} of PIA</strong></div>
          <div><span>Full retirement age</span><strong>{formatRetirementAge(result.fullRetirementAgeMonths)}</strong></div>
          <div><span>Timing vs full retirement age</span><strong>{result.monthsFromFullRetirementAge === 0 ? 'At FRA' : result.monthsFromFullRetirementAge > 0 ? `${result.monthsFromFullRetirementAge} months later` : `${Math.abs(result.monthsFromFullRetirementAge)} months earlier`}</strong></div>
        </div>}
        <button type="button" className="reset-button mt-6" onClick={()=>{setPia('2000');setBirthYear('1960');setClaimingAge('67');}}>Reset values</button>
      </section>
    </div>
    <div className="advanced-content-grid"><article className="advanced-content">
      <section><div className="eyebrow">METHOD</div><h2>Birth year changes full retirement age.</h2><p>For birth years 1943 through 1954, full retirement age is 66. It rises by two months for each birth year from 1955 through 1959, then reaches 67 for people born in 1960 or later. That cohort difference matters when comparing the same claiming age.</p></section>
      <section><div className="eyebrow">EARLY CLAIMING</div><h2>Benefits before full retirement age are reduced by months.</h2><p>The estimate applies the standard retirement reduction of 5/9 of 1% for each of the first 36 months before full retirement age and 5/12 of 1% for each additional earlier month. This is why an FRA-67 worker claiming at 62 receives about 70% of PIA.</p></section>
      <section><div className="eyebrow">DELAYED CLAIMING</div><h2>Delayed credits depend on months after full retirement age.</h2><p>For the supported 1943-and-later cohorts, delayed retirement credits are 8% per year, or 2/3 of 1% per month, through age 70. A person born in 1956 has a full retirement age of 66 years 4 months, so claiming at 70 is about 129.3% of PIA rather than 124%.</p></section>
      <section><div className="eyebrow">LIMITATIONS</div><h2>Use your SSA record for the decision.</h2><p>This estimator does not calculate PIA from earnings, decide eligibility, model spousal or survivor benefits, apply work deductions, taxation, COLAs, Medicare premiums, disability rules, or the exact effective month of a claim. Month-of-birth details can change the exact factor; use SSA tools and your current record before filing.</p></section>
      <section><div className="eyebrow">SOURCE</div><h2>Official retirement-age rules.</h2><p><a href="https://www.ssa.gov/benefits/retirement/planner/ageincrease.html" target="_blank" rel="noreferrer">Social Security Administration — Full retirement age</a></p><p><a href="https://www.ssa.gov/benefits/retirement/planner/delayret.html" target="_blank" rel="noreferrer">Social Security Administration — Delayed retirement credits</a></p></section>
      <section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Common questions.</h2><details><summary>Why does birth year matter?</summary><p>Full retirement age is not 67 for every cohort. It is 66 for 1943–1954, increases gradually for 1955–1959, and is 67 for 1960 and later.</p></details><details><summary>Can I claim at 70 and get more than 124%?</summary><p>Yes for some cohorts. For example, SSA shows about 129.3% of the full-retirement benefit at age 70 for someone born in 1956 because that person’s full retirement age is 66 years 4 months.</p></details><details><summary>Does this replace an SSA estimate?</summary><p>No. Use it to understand the claiming-age adjustment to a PIA you already have, then verify the filing decision with your Social Security record and official SSA tools.</p></details></section>
    </article></div>
  </div></Shell>;
}
