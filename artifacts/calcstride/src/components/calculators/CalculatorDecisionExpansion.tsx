import { useEffect, useState } from 'react';
import '@/styles/advanced-calculator-pages.css';
import '@/styles/decision-expansion-results.css';
import { amortizationScenario, aprDecision, autoLoanDecision, budgetDecision, creditCardDecision, growthDecision, mortgageDecision, mortgagePayoffDecision, retirementDecision, savingsTargetDecision } from '@/lib/decision-calculators';
import { formatCurrency, type CurrencyCode } from '@/lib/units-preferences';

type ExpansionSlug = 'loan' | 'mortgage' | 'retirement' | 'budget' | 'credit-card' | 'auto-loan' | 'mortgage-payoff' | 'compound-interest' | 'savings' | 'apr';
type Props = { slug: ExpansionSlug; values: string[]; currency?: CurrencyCode; open: boolean };
type ExtraField = { key: string; label: string; value: string; suffix?: string; type?: 'select'; options?: readonly { label: string; value: string }[] };

const fields: Record<ExpansionSlug, ExtraField[]> = {
  loan: [{ key: 'fees', label: 'Fees added to loan', value: '0' }, { key: 'extra', label: 'Extra monthly payment', value: '0' }, { key: 'balloon', label: 'Final balloon payment', value: '0' }],
  mortgage: [{ key: 'hoa', label: 'Monthly HOA / service charge', value: '0' }, { key: 'pmi', label: 'Monthly mortgage insurance', value: '0' }, { key: 'extra', label: 'Extra monthly principal', value: '0' }],
  retirement: [{ key: 'employer', label: 'Monthly employer contribution', value: '0' }, { key: 'increase', label: 'Annual contribution increase', value: '2', suffix: '%' }, { key: 'inflation', label: 'Annual inflation assumption', value: '2.5', suffix: '%' }],
  budget: [{ key: 'housing', label: 'Housing and utilities', value: '1500' }, { key: 'transport', label: 'Transport', value: '600' }, { key: 'food', label: 'Food and household', value: '700' }, { key: 'debt', label: 'Debt payments', value: '400' }, { key: 'saving', label: 'Savings contributions', value: '300' }, { key: 'other', label: 'Other spending', value: '300' }, { key: 'emergency', label: 'Emergency-fund months', value: '6', suffix: 'months' }],
  'credit-card': [{ key: 'extra', label: 'Extra monthly payment', value: '100' }, { key: 'purchases', label: 'New monthly purchases', value: '0' }],
  'auto-loan': [{ key: 'rebate', label: 'Cash rebate', value: '0' }, { key: 'balloon', label: 'Final balloon payment', value: '0' }, { key: 'extra', label: 'Extra monthly payment', value: '0' }, { key: 'ownership', label: 'Monthly insurance, fuel and upkeep', value: '0' }],
  'mortgage-payoff': [{ key: 'lump', label: 'One-time principal payment now', value: '0' }, { key: 'extra', label: 'Additional monthly principal', value: '0' }, { key: 'start', label: 'Start additional payments in month', value: '1', suffix: 'month' }],
  'compound-interest': [{ key: 'increase', label: 'Annual contribution increase', value: '0', suffix: '%' }, { key: 'fee', label: 'Annual account fee', value: '0', suffix: '%' }, { key: 'inflation', label: 'Annual inflation assumption', value: '2.5', suffix: '%' }, { key: 'timing', label: 'Contribution timing', value: 'end', type: 'select', options: [{ label: 'End of month', value: 'end' }, { label: 'Beginning of month', value: 'beginning' }] }],
  savings: [{ key: 'target', label: 'Savings target', value: '15000' }, { key: 'increase', label: 'Annual contribution increase', value: '0', suffix: '%' }, { key: 'timing', label: 'Contribution timing', value: 'end', type: 'select', options: [{ label: 'End of month', value: 'end' }, { label: 'Beginning of month', value: 'beginning' }] }],
  apr: [{ key: 'upfront', label: 'Fees paid upfront', value: '0' }, { key: 'final', label: 'Final payment or balloon fee', value: '0' }, { key: 'advertised', label: 'Advertised interest rate for comparison', value: '10', suffix: '%' }],
};
const labels: Record<ExpansionSlug, string> = { loan: 'Add fees, extra payments and a balloon amount', mortgage: 'Add ownership costs and early-payoff planning', retirement: 'Add employer contributions, increases and inflation', budget: 'Build a category budget and emergency-fund target', 'credit-card': 'Compare extra payments and continued card spending', 'auto-loan': 'Add rebates, a balloon, extra payments and ownership costs', 'mortgage-payoff': 'Model a lump sum and delayed additional principal payments', 'compound-interest': 'Add contribution growth, fees, inflation and deposit timing', savings: 'Set a savings target and refine the contribution schedule', apr: 'Include upfront and final charges and compare the advertised rate' };
const duration = (months: number) => `${Math.floor(months / 12)} yr ${months % 12} mo`;

const modeStorageKey = 'figurenest-calculator-mode';

export function useCalculatorMode(enabled: boolean) {
  const [advanced, setAdvanced] = useState(() => enabled && typeof window !== 'undefined' && window.localStorage.getItem(modeStorageKey) === 'advanced');
  useEffect(() => {
    if (enabled) window.localStorage.setItem(modeStorageKey, advanced ? 'advanced' : 'basic');
  }, [advanced, enabled]);
  return [advanced, setAdvanced] as const;
}

export function CalculatorModeSwitch({ advanced, onChange }: { advanced: boolean; onChange: (advanced: boolean) => void }) {
  return <div className="calculator-mode" aria-label="Calculator mode"><span>Calculator mode</span><div className="calculator-mode-options"><button type="button" className={!advanced ? 'is-active' : ''} aria-pressed={!advanced} onClick={() => onChange(false)}>Basic</button><button type="button" className={advanced ? 'is-active' : ''} aria-pressed={advanced} onClick={() => onChange(true)}>Advanced</button></div></div>;
}

export function CalculatorDecisionExpansion({ slug, values, currency = 'USD', open }: Props) {
  const [extras, setExtras] = useState(() => fields[slug].map((field) => field.value));
  const n = values.map(Number), x = extras.map(Number);
  const money = (value: number) => formatCurrency(value, currency);
  let results: { label: string; value: string }[] = [];
  let error = '';
  if (open && slug === 'loan') {
    const s = amortizationScenario(n[0], n[1], n[2], x[1], x[0], x[2]);
    if (s) results = [{ label: 'Payment including extra', value: money(s.paymentWithExtra) }, { label: 'Estimated payoff time', value: duration(s.months) }, { label: 'Total interest', value: money(s.interest) }, { label: 'Total paid including balloon', value: money(s.totalPaid) }]; else error = 'Check that fees, extra payment and balloon amount are valid.';
  } else if (open && slug === 'mortgage') {
    const s = mortgageDecision(n[0], n[1], n[2], n[3], n[4], n[5], x[0], x[1], x[2]);
    if (s) results = [{ label: 'Estimated all-in monthly cost', value: money(s.housingPayment) }, { label: 'Estimated mortgage payoff', value: duration(s.payoffMonths) }, { label: 'Interest saved by extra payments', value: money(s.interestSaved) }, { label: 'Total mortgage interest', value: money(s.totalInterest) }]; else error = 'Check the mortgage and advanced values.';
  } else if (open && slug === 'retirement') {
    const s = retirementDecision(n[0], n[1], n[2], n[3], x[0], x[1], x[2]);
    if (s) results = [{ label: 'Projected nominal balance', value: money(s.balance) }, { label: 'Estimated value in today’s money', value: money(s.todayValue) }, { label: 'Total contributions', value: money(s.contributions) }, { label: 'Illustrative monthly income at 4% yearly', value: money(s.monthlyIncome4Percent) }]; else error = 'Check the retirement assumptions.';
  } else if (open && slug === 'budget') {
    const s = budgetDecision(n[0], x.slice(0, 6), x[6]);
    if (s) results = [{ label: 'Category expenses', value: money(s.expenses) }, { label: s.surplus >= 0 ? 'Monthly amount remaining' : 'Monthly shortfall', value: money(Math.abs(s.surplus)) }, { label: 'Savings margin', value: `${s.savingsRate.toFixed(1)}%` }, { label: `${x[6]}-month emergency target`, value: money(s.emergencyTarget) }]; else error = 'Use non-negative category values.';
  } else if (open && slug === 'credit-card') {
    const s = creditCardDecision(n[0], n[1], n[2], x[0], x[1]);
    if (s) results = [{ label: 'Estimated payoff time', value: duration(s.months) }, { label: 'Estimated interest', value: money(s.interest) }, { label: 'Months saved by extra payment', value: String(s.monthsSaved) }, { label: 'Interest saved by extra payment', value: money(s.interestSaved) }]; else error = 'The payment must be greater than monthly interest plus new purchases.';
  } else if (open && slug === 'auto-loan') {
    const s = autoLoanDecision(n[0], n[1], n[2], n[3], n[4], n[5], n[6], x[0], x[1], x[2], x[3]);
    if (s) results = [{ label: 'Amount financed after rebate', value: money(s.financed) }, { label: 'Loan payment including extra', value: money(s.payment) }, { label: 'Monthly cost including ownership estimate', value: money(s.ownershipMonthly) }, { label: 'Estimated payoff time', value: duration(s.payoffMonths) }, { label: 'Interest saved by extra payments', value: money(s.interestSaved) }, { label: 'Balloon remaining', value: money(s.balloon) }]; else error = 'Check the rebate, balloon, extra payment and ownership-cost values.';
  } else if (open && slug === 'mortgage-payoff') {
    const s = mortgagePayoffDecision(n[0], n[1], n[2], n[3], x[0], x[1], x[2]);
    if (s) results = [{ label: 'Advanced payoff time', value: duration(s.months) }, { label: 'Months saved', value: String(s.monthsSaved) }, { label: 'Remaining interest', value: money(s.interest) }, { label: 'Interest saved', value: money(s.interestSaved) }]; else error = 'The total payment must remain greater than monthly interest.';
  } else if (open && slug === 'compound-interest') {
    const s = growthDecision(n[0], n[1], n[2], n[3], x[0], x[1], x[2], extras[3] === 'beginning');
    if (s) results = [{ label: 'Projected balance after fees', value: money(s.balance) }, { label: 'Total contributions', value: money(s.deposited) }, { label: 'Modeled growth', value: money(s.growth) }, { label: 'Value in today’s money', value: money(s.todayValue) }]; else error = 'Check the contribution, fee and inflation assumptions.';
  } else if (open && slug === 'savings') {
    const s = savingsTargetDecision(n[0], n[1], n[2], n[3], x[0], x[1], extras[2] === 'beginning');
    if (s) results = [{ label: 'Projected savings', value: money(s.balance) }, { label: s.targetGap > 0 ? 'Amount below target' : 'Amount above target', value: money(Math.abs(s.targetGap)) }, { label: 'Total deposits', value: money(s.deposited) }, ...(s.requiredMonthly === undefined ? [] : [{ label: 'Monthly deposit needed for target', value: money(s.requiredMonthly) }])]; else error = 'Check the target and contribution assumptions.';
  } else if (open && slug === 'apr') {
    const s = aprDecision(n[2], n[3], n[4], n[1], x[0], x[1], x[2]);
    if (s) results = [{ label: 'APR including advanced charges', value: `${s.effectiveApr.toFixed(2)}%` }, { label: 'Total borrowing cost', value: money(s.totalBorrowingCost) }, { label: 'Total entered fees', value: money(s.totalFees) }, { label: 'Difference from advertised rate', value: `${s.advertisedDifference >= 0 ? '+' : ''}${s.advertisedDifference.toFixed(2)} points` }]; else error = 'Payments must repay more than the net amount received.';
  }
  if (!open) return null;
  return <div className="decision-expansion"><div className="decision-expansion-heading"><strong>Advanced calculation</strong><small>{labels[slug]}</small></div><div className="decision-expansion-body"><div className="advanced-fields">{fields[slug].map((field, index) => <label className="advanced-field" key={field.key}><span>{field.label}</span><div>{field.type === 'select' ? <select value={extras[index]} onChange={(event) => setExtras((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input type="number" min="0" step="any" value={extras[index]} onChange={(event) => setExtras((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} />}{field.suffix && <small>{field.suffix}</small>}</div></label>)}</div>{error ? <p className="decision-expansion-error" role="alert">{error}</p> : <div className="advanced-breakdown decision-expansion-results">{results.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>}<p className="decision-expansion-note">Advanced results are planning scenarios. Confirm lender, provider, tax, benefit and account rules before making a financial decision.</p></div></div>;
}
