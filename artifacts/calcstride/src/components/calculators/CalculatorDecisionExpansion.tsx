import { useEffect, useState } from 'react';
import { amortizationScenario, budgetDecision, creditCardDecision, mortgageDecision, retirementDecision } from '@/lib/decision-calculators';
import { formatCurrency, type CurrencyCode } from '@/lib/units-preferences';

type ExpansionSlug = 'loan' | 'mortgage' | 'retirement' | 'budget' | 'credit-card';
type Props = { slug: ExpansionSlug; values: string[]; currency?: CurrencyCode; open: boolean };
type ExtraField = { key: string; label: string; value: string; suffix?: string };

const fields: Record<ExpansionSlug, ExtraField[]> = {
  loan: [{ key: 'fees', label: 'Fees added to loan', value: '0' }, { key: 'extra', label: 'Extra monthly payment', value: '0' }, { key: 'balloon', label: 'Final balloon payment', value: '0' }],
  mortgage: [{ key: 'hoa', label: 'Monthly HOA / service charge', value: '0' }, { key: 'pmi', label: 'Monthly mortgage insurance', value: '0' }, { key: 'extra', label: 'Extra monthly principal', value: '0' }],
  retirement: [{ key: 'employer', label: 'Monthly employer contribution', value: '0' }, { key: 'increase', label: 'Annual contribution increase', value: '2', suffix: '%' }, { key: 'inflation', label: 'Annual inflation assumption', value: '2.5', suffix: '%' }],
  budget: [{ key: 'housing', label: 'Housing and utilities', value: '1500' }, { key: 'transport', label: 'Transport', value: '600' }, { key: 'food', label: 'Food and household', value: '700' }, { key: 'debt', label: 'Debt payments', value: '400' }, { key: 'saving', label: 'Savings contributions', value: '300' }, { key: 'other', label: 'Other spending', value: '300' }, { key: 'emergency', label: 'Emergency-fund months', value: '6', suffix: 'months' }],
  'credit-card': [{ key: 'extra', label: 'Extra monthly payment', value: '100' }, { key: 'purchases', label: 'New monthly purchases', value: '0' }],
};
const labels: Record<ExpansionSlug, string> = { loan: 'Add fees, extra payments and a balloon amount', mortgage: 'Add ownership costs and early-payoff planning', retirement: 'Add employer contributions, increases and inflation', budget: 'Build a category budget and emergency-fund target', 'credit-card': 'Compare extra payments and continued card spending' };
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
  } else if (open) {
    const s = creditCardDecision(n[0], n[1], n[2], x[0], x[1]);
    if (s) results = [{ label: 'Estimated payoff time', value: duration(s.months) }, { label: 'Estimated interest', value: money(s.interest) }, { label: 'Months saved by extra payment', value: String(s.monthsSaved) }, { label: 'Interest saved by extra payment', value: money(s.interestSaved) }]; else error = 'The payment must be greater than monthly interest plus new purchases.';
  }
  if (!open) return null;
  return <div className="decision-expansion"><div className="decision-expansion-heading"><strong>Advanced calculation</strong><small>{labels[slug]}</small></div><div className="decision-expansion-body"><div className="advanced-fields">{fields[slug].map((field, index) => <label className="advanced-field" key={field.key}><span>{field.label}</span><div><input type="number" min="0" step="any" value={extras[index]} onChange={(event) => setExtras((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} />{field.suffix && <small>{field.suffix}</small>}</div></label>)}</div>{error ? <p className="decision-expansion-error" role="alert">{error}</p> : <div className="advanced-breakdown decision-expansion-results">{results.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>}<p className="decision-expansion-note">Advanced results are planning scenarios. Confirm lender, provider, tax, benefit and account rules before making a financial decision.</p></div></div>;
}
