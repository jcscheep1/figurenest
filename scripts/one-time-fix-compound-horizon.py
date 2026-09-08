from pathlib import Path

core = Path('artifacts/calcstride/src/lib/core-calculators.ts')
text = core.read_text()
old = """  if (slug === 'compound-interest') {
    const boundsError = financeBoundsError([a, b], c, d, currency);
    if (boundsError) return invalid(boundsError);
    const months = d * 12;
    const deposited = a + b * months;
    const balance = compoundBalance(a, b, c, months);"""
new = """  if (slug === 'compound-interest') {
    if (d <= 0) return invalid('Investment horizon must be greater than zero');
    const boundsError = financeBoundsError([a, b], c, d, currency);
    if (boundsError) return invalid(boundsError);
    const rawMonths = d * 12;
    const months = Math.round(rawMonths);
    if (Math.abs(rawMonths - months) > 1e-9) return invalid('Investment horizon must resolve to a whole number of months');
    const deposited = a + b * months;
    const balance = compoundBalance(a, b, c, months);"""
if old not in text:
    raise SystemExit('Compound Interest horizon target not found; refusing unsafe edit')
core.write_text(text.replace(old, new, 1))

decision = Path('artifacts/calcstride/src/lib/decision-calculators.ts')
dtext = decision.read_text()
old_growth = """  let balance = start, contribution = monthly, deposited = start;
  const months = Math.round(years * 12);
  for (let month = 0; month < months; month += 1) {"""
new_growth = """  const rawMonths = years * 12;
  const months = Math.round(rawMonths);
  if (Math.abs(rawMonths - months) > 1e-9) return undefined;
  let balance = start, contribution = monthly, deposited = start;
  for (let month = 0; month < months; month += 1) {"""
if old_growth not in dtext:
    raise SystemExit('Monthly growth horizon target not found; refusing unsafe edit')
decision.write_text(dtext.replace(old_growth, new_growth, 1))

page = Path('artifacts/calcstride/src/pages/FinanceCalculatorPage.tsx')
ptext = page.read_text()
old_step = """step={['loan', 'mortgage'].includes(slug) && field.key === 'years' ? '0.08333333333333333' : 'any'}"""
new_step = """step={['loan', 'mortgage', 'compound-interest'].includes(slug) && field.key === 'years' ? '0.08333333333333333' : 'any'}"""
if old_step not in ptext:
    raise SystemExit('Finance monthly horizon step target not found; refusing unsafe edit')
page.write_text(ptext.replace(old_step, new_step, 1))

Path('artifacts/calcstride/src/lib/compound-interest-horizon-regression.test.ts').write_text("""import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';
import { growthDecision } from './decision-calculators';

test('Compound Interest requires a positive horizon made of whole monthly periods', () => {
  const zero = calculateCore('compound-interest', ['5000', '250', '6', '0']);
  assert.match(zero.error ?? '', /greater than zero/i);

  const fractional = calculateCore('compound-interest', ['5000', '250', '6', '10.01']);
  assert.match(fractional.error ?? '', /whole number of months/i);

  const valid = calculateCore('compound-interest', ['5000', '250', '6', '10.5']);
  assert.equal(valid.error, undefined);
});

test('Compound Interest normal and zero-rate calculations remain unchanged', () => {
  const normal = calculateCore('compound-interest', ['5000', '250', '6', '10']);
  assert.equal(normal.primary, '$50,066.82');
  assert.equal(normal.details?.[0].value, '$35,000.00');
  assert.equal(normal.details?.[1].value, '$15,066.82');

  const zeroRate = calculateCore('compound-interest', ['1000', '100', '0', '1']);
  assert.equal(zeroRate.primary, '$2,200.00');
  assert.equal(zeroRate.details?.[1].value, '$0.00');
});

test('Advanced monthly growth engine follows the same monthly horizon contract', () => {
  assert.equal(growthDecision(5000, 250, 6, 0, 0, 0, 2.5, false), undefined);
  assert.equal(growthDecision(5000, 250, 6, 10.01, 0, 0, 2.5, false), undefined);
  const valid = growthDecision(5000, 250, 6, 10.5, 0, 0, 2.5, false);
  assert.ok(valid);
});
""")
