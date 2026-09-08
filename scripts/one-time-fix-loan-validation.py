from pathlib import Path

core = Path('artifacts/calcstride/src/lib/core-calculators.ts')
text = core.read_text()

old_constants = """const BUSINESS_SLUGS = ['roi', 'profit-margin', 'markup', 'break-even'];
const MAX_BUSINESS_AMOUNT = 1_000_000_000_000;"""
new_constants = """const FINANCE_SLUGS = ['compound-interest', 'loan', 'mortgage', 'savings'];
const BUSINESS_SLUGS = ['roi', 'profit-margin', 'markup', 'break-even'];
const MAX_BUSINESS_AMOUNT = 1_000_000_000_000;"""
if old_constants not in text:
    raise SystemExit('Finance slug insertion target not found; refusing unsafe edit')
text = text.replace(old_constants, new_constants, 1)

old_guard = """  if (slug === 'percentage' && inputs.some((value) => !value.trim())) return invalid('Complete every field with a valid non-negative value');
  if ([...BUSINESS_SLUGS, ...AUTOMOTIVE_CALCULATOR_SLUGS].includes(slug) && inputs.some((value) => !value.trim())) {
    return invalid('Complete every field with a valid non-negative value');
  }"""
new_guard = """  if (slug === 'percentage' && inputs.some((value) => !value.trim())) return invalid('Complete every field with a valid non-negative value');
  if (FINANCE_SLUGS.includes(slug) && inputs.some((value) => !value.trim())) {
    return invalid('Complete every field with a valid non-negative value');
  }
  if ([...BUSINESS_SLUGS, ...AUTOMOTIVE_CALCULATOR_SLUGS].includes(slug) && inputs.some((value) => !value.trim())) {
    return invalid('Complete every field with a valid non-negative value');
  }"""
if old_guard not in text:
    raise SystemExit('Finance blank-input guard target not found; refusing unsafe edit')
text = text.replace(old_guard, new_guard, 1)

old_loan = """  if (slug === 'loan') {
    if (c === 0) return invalid('Loan term must be greater than zero');
    const boundsError = financeBoundsError([a], b, c, currency);
    if (boundsError) return invalid(boundsError);
    const months = c * 12;
    const monthly = payment(a, b, months);"""
new_loan = """  if (slug === 'loan') {
    if (c === 0) return invalid('Loan term must be greater than zero');
    const boundsError = financeBoundsError([a], b, c, currency);
    if (boundsError) return invalid(boundsError);
    const rawMonths = c * 12;
    const months = Math.round(rawMonths);
    if (Math.abs(rawMonths - months) > 1e-9) return invalid('Loan term must resolve to a whole number of months');
    const monthly = payment(a, b, months);"""
if old_loan not in text:
    raise SystemExit('Loan month validation target not found; refusing unsafe edit')
text = text.replace(old_loan, new_loan, 1)
core.write_text(text)

decision = Path('artifacts/calcstride/src/lib/decision-calculators.ts')
dtext = decision.read_text()
old_decision = """export const amortizationScenario = (principal: number, annualRate: number, years: number, extraMonthly = 0, fees = 0, balloon = 0) => {
  const financed = principal + fees;
  const months = Math.round(years * 12);
  const scheduled = payment(financed, annualRate, months, balloon);"""
new_decision = """export const amortizationScenario = (principal: number, annualRate: number, years: number, extraMonthly = 0, fees = 0, balloon = 0) => {
  const financed = principal + fees;
  const rawMonths = years * 12;
  const months = Math.round(rawMonths);
  if (!Number.isFinite(rawMonths) || Math.abs(rawMonths - months) > 1e-9) return undefined;
  const scheduled = payment(financed, annualRate, months, balloon);"""
if old_decision not in dtext:
    raise SystemExit('Advanced amortization month validation target not found; refusing unsafe edit')
decision.write_text(dtext.replace(old_decision, new_decision, 1))

page = Path('artifacts/calcstride/src/pages/FinanceCalculatorPage.tsx')
ptext = page.read_text()
old_step = """                      min=\"0\"
                      step=\"any\"
                      value={values[index]}"""
new_step = """                      min=\"0\"
                      step={slug === 'loan' && field.key === 'years' ? '0.08333333333333333' : 'any'}
                      value={values[index]}"""
if old_step not in ptext:
    raise SystemExit('Finance input step target not found; refusing unsafe edit')
page.write_text(ptext.replace(old_step, new_step, 1))

Path('artifacts/calcstride/src/lib/loan-validation-regression.test.ts').write_text("""import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';
import { amortizationScenario } from './decision-calculators';

test('Loan required fields reject blanks instead of coercing them to zero', () => {
  for (const inputs of [
    ['', '7.2', '5'],
    ['24000', '', '5'],
    ['24000', '7.2', ''],
  ]) {
    const result = calculateCore('loan', inputs);
    assert.ok(result.error, `expected error for ${JSON.stringify(inputs)}`);
    assert.equal(result.details, undefined);
  }
});

test('other core finance calculators also reject blank required fields', () => {
  for (const [slug, inputs] of [
    ['compound-interest', ['5000', '', '6', '10']],
    ['savings', ['1200', '300', '', '3']],
    ['mortgage', ['360000', '72000', '6.5', '', '4500', '1800']],
  ] as const) {
    const result = calculateCore(slug, [...inputs]);
    assert.ok(result.error, `${slug} must reject blank required input`);
  }
});

test('Loan term must map to a whole number of monthly payment periods', () => {
  const valid = calculateCore('loan', ['24000', '7.2', '5.5']);
  assert.equal(valid.error, undefined);
  const invalid = calculateCore('loan', ['24000', '7.2', '5.01']);
  assert.match(invalid.error ?? '', /whole number of months/i);
  assert.equal(invalid.details, undefined);
});

test('advanced amortization follows the same whole-month contract', () => {
  assert.ok(amortizationScenario(24000, 7.2, 5.5));
  assert.equal(amortizationScenario(24000, 7.2, 5.01), undefined);
});
""")
