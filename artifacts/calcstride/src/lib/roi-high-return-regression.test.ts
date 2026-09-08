import assert from 'node:assert/strict';
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
