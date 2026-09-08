import assert from 'node:assert/strict';
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
