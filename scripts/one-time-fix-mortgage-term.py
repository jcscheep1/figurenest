from pathlib import Path

core = Path('artifacts/calcstride/src/lib/core-calculators.ts')
text = core.read_text()
old = """  if (slug === 'mortgage') {
    if (d === 0 || b > a) return invalid('Enter a valid loan term and down payment');
    const boundsError = financeBoundsError([a, b, e, f], c, d, currency);
    if (boundsError) return invalid(boundsError);
    const principal = a - b;
    const months = d * 12;
    const loanPayment = payment(principal, c, months);"""
new = """  if (slug === 'mortgage') {
    if (d === 0 || b > a) return invalid('Enter a valid loan term and down payment');
    const boundsError = financeBoundsError([a, b, e, f], c, d, currency);
    if (boundsError) return invalid(boundsError);
    const rawMonths = d * 12;
    const months = Math.round(rawMonths);
    if (Math.abs(rawMonths - months) > 1e-9) return invalid('Mortgage term must resolve to a whole number of months');
    const principal = a - b;
    const loanPayment = payment(principal, c, months);"""
if old not in text:
    raise SystemExit('Mortgage month-validation target not found; refusing unsafe edit')
core.write_text(text.replace(old, new, 1))

page = Path('artifacts/calcstride/src/pages/FinanceCalculatorPage.tsx')
ptext = page.read_text()
old_step = """step={slug === 'loan' && field.key === 'years' ? '0.08333333333333333' : 'any'}"""
new_step = """step={['loan', 'mortgage'].includes(slug) && field.key === 'years' ? '0.08333333333333333' : 'any'}"""
if old_step not in ptext:
    raise SystemExit('Finance month-step target not found; refusing unsafe edit')
page.write_text(ptext.replace(old_step, new_step, 1))

Path('artifacts/calcstride/src/lib/mortgage-term-regression.test.ts').write_text("""import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';
import { mortgageDecision } from './decision-calculators';

test('Mortgage term must resolve to whole monthly payment periods', () => {
  const valid = calculateCore('mortgage', ['360000', '72000', '6.5', '30.5', '4500', '1800']);
  assert.equal(valid.error, undefined);
  const invalid = calculateCore('mortgage', ['360000', '72000', '6.5', '30.01', '4500', '1800']);
  assert.match(invalid.error ?? '', /whole number of months/i);
  assert.equal(invalid.details, undefined);
});

test('Mortgage advanced scenario follows the same whole-month term contract', () => {
  assert.ok(mortgageDecision(360000, 72000, 6.5, 30.5, 4500, 1800, 0, 0, 0));
  assert.equal(mortgageDecision(360000, 72000, 6.5, 30.01, 4500, 1800, 0, 0, 0), undefined);
});
""")
