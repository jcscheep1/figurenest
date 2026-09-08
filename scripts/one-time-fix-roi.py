from pathlib import Path

path = Path('artifacts/calcstride/src/lib/core-calculators.ts')
text = path.read_text()
old = """    if (!Number.isFinite(roi) || Math.abs(roi) > MAX_BUSINESS_PERCENT) {
      return invalid('These values produce an ROI too large to use. Check the initial investment');
    }"""
new = """    if (!Number.isFinite(roi)) {
      return invalid('These values produce an ROI outside the finite numeric range. Check the initial investment');
    }"""
if old not in text:
    raise SystemExit('ROI target not found; refusing unsafe edit')
path.write_text(text.replace(old, new, 1))

Path('artifacts/calcstride/src/lib/roi-high-return-regression.test.ts').write_text("""import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('ROI accepts mathematically valid finite returns above 100,000 percent', () => {
  const result = calculateCore('roi', ['1', '2000']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '199,900%');
  assert.equal(result.details?.[0].value, '$1,999.00');
});

test('ROI still rejects non-finite calculations instead of displaying Infinity', () => {
  const result = calculateCore('roi', ['5e-324', '1000000000000']);
  assert.ok(result.error);
  assert.equal(result.details, undefined);
  assert.doesNotMatch(result.primary, /NaN|Infinity/i);
});
""")
