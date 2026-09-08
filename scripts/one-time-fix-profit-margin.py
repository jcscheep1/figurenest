from pathlib import Path

source = Path('artifacts/calcstride/src/lib/core-calculators.ts')
text = source.read_text()
old = """    if (!Number.isFinite(margin) || Math.abs(margin) > MAX_BUSINESS_PERCENT || (markup !== undefined && !Number.isFinite(markup))) {
      return invalid('These values produce a percentage too large to use. Check the cost and selling price');
    }"""
new = """    if (!Number.isFinite(margin) || (markup !== undefined && !Number.isFinite(markup))) {
      return invalid('These values produce a percentage outside the finite numeric range. Check the cost and selling price');
    }"""
if old not in text:
    raise SystemExit('Profit Margin target not found; refusing unsafe edit')
source.write_text(text.replace(old, new, 1))

tests = Path('artifacts/calcstride/src/lib/core-calculators.test.ts')
test_text = tests.read_text()
stale = "    calculateCore('profit-margin', ['1000000000000', '0.000001']),"
replacement = "    calculateCore('profit-margin', ['1000000000000', '5e-324']),"
if stale not in test_text:
    raise SystemExit('Stale Profit Margin unsafe-boundary test not found; refusing unsafe edit')
tests.write_text(test_text.replace(stale, replacement, 1))

Path('artifacts/calcstride/src/lib/profit-margin-high-loss-regression.test.ts').write_text("""import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('Profit Margin accepts valid finite negative margins below -100,000 percent', () => {
  const result = calculateCore('profit-margin', ['2000', '1']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '-199,900%');
  assert.equal(result.details?.[0].label, 'Gross loss');
  assert.equal(result.details?.[0].value, '$1,999.00');
  assert.equal(result.details?.[1].value, '-99.95%');
});

test('Profit Margin still rejects non-finite results', () => {
  const result = calculateCore('profit-margin', ['1000000000000', '5e-324']);
  assert.ok(result.error);
  assert.equal(result.details, undefined);
  assert.doesNotMatch(result.primary, /NaN|Infinity/i);
});
""")
