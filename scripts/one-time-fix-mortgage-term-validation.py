from pathlib import Path

core = Path('artifacts/calcstride/src/lib/core-calculators.ts')
text = core.read_text()
old_mortgage = """  if (slug === 'mortgage') {
    if (d === 0 || b > a) return invalid('Enter a valid loan term and down payment');
    const boundsError = financeBoundsError([a, b, e, f], c, d, currency);
    if (boundsError) return invalid(boundsError);
    const principal = a - b;
    const months = d * 12;
    const loanPayment = payment(principal, c, months);"""
new_mortgage = """  if (slug === 'mortgage') {
    if (d === 0 || b > a) return invalid('Enter a valid loan term and down payment');
    const boundsError = financeBoundsError([a, b, e, f], c, d, currency);
    if (boundsError) return invalid(boundsError);
    const principal = a - b;
    const rawMonths = d * 12;
    const months = Math.round(rawMonths);
    if (Math.abs(rawMonths - months) > 1e-9) return invalid('Mortgage term must resolve to a whole number of months');
    const loanPayment = payment(principal, c, months);"""
if old_mortgage not in text:
    raise SystemExit('Mortgage month validation target not found; refusing unsafe edit')
core.write_text(text.replace(old_mortgage, new_mortgage, 1))

page = Path('artifacts/calcstride/src/pages/FinanceCalculatorPage.tsx')
ptext = page.read_text()
old_step = """                      step={slug === 'loan' && field.key === 'years' ? '0.08333333333333333' : 'any'}"""
new_step = """                      step={(slug === 'loan' || slug === 'mortgage') && field.key === 'years' ? '0.08333333333333333' : 'any'}"""
if old_step not in ptext:
    raise SystemExit('Finance term-step target not found; refusing unsafe edit')
page.write_text(ptext.replace(old_step, new_step, 1))

Path('artifacts/calcstride/src/lib/mortgage-term-validation-regression.test.ts').write_text("""import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';
import { amortizationScenario } from './decision-calculators';

test('Mortgage preserves the documented normal calculation and breakdown', () => {
  const result = calculateCore('mortgage', ['360000', '72000', '6.5', '30', '4500', '1800']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$2,345.36');
  assert.deepEqual(result.details, [
    { label: 'Principal & interest', value: '$1,820.36' },
    { label: 'Loan total paid', value: '$655,328.13' },
    { label: 'Total loan interest', value: '$367,328.13' },
  ]);
});

test('Mortgage preserves the zero-rate boundary including tax and insurance', () => {
  const result = calculateCore('mortgage', ['300000', '60000', '0', '15', '3600', '1200']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$1,733.33');
  assert.equal(result.details?.find((detail) => detail.label === 'Total loan interest')?.value, '$0.00');
});

test('Mortgage rejects down payments above the purchase price', () => {
  const result = calculateCore('mortgage', ['300000', '300001', '6', '30', '3600', '1200']);
  assert.match(result.error ?? '', /valid loan term and down payment/i);
  assert.equal(result.details, undefined);
});

test('Mortgage term must map to a whole number of monthly payment periods', () => {
  const valid = calculateCore('mortgage', ['360000', '72000', '6.5', '30.5', '4500', '1800']);
  assert.equal(valid.error, undefined);

  const invalid = calculateCore('mortgage', ['360000', '72000', '6.5', '30.01', '4500', '1800']);
  assert.match(invalid.error ?? '', /whole number of months/i);
  assert.equal(invalid.details, undefined);
});

test('Mortgage advanced amortization uses the same whole-month contract', () => {
  assert.ok(amortizationScenario(288000, 6.5, 30.5));
  assert.equal(amortizationScenario(288000, 6.5, 30.01), undefined);
});
""")
