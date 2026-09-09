import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('VAT add mode reports gross price and VAT amount consistently', () => {
  const result = calculateCore('vat', ['100', '20']);
  assert.equal(result.primary, '$120.00');
  assert.deepEqual(result.details, [
    { label: 'VAT amount', value: '$20.00' },
    { label: 'Price including VAT', value: '$120.00' },
  ]);
});

test('VAT remove mode reports the pre-VAT net price in the breakdown', () => {
  const result = calculateCore('vat', ['120', '20'], 'remove');
  assert.equal(result.primary, '$100.00');
  assert.deepEqual(result.details, [
    { label: 'VAT removed', value: '$20.00' },
    { label: 'Price before VAT', value: '$100.00' },
  ]);
});

test('VAT rejects blank required inputs instead of silently coercing them to zero', () => {
  const blankAmount = calculateCore('vat', ['', '20']);
  const blankRate = calculateCore('vat', ['100', '']);

  assert.ok(blankAmount.error, 'blank VAT amount should be rejected');
  assert.ok(blankRate.error, 'blank VAT rate should be rejected');
});

test('VAT still accepts explicit zero values at supported boundaries', () => {
  const zeroAmount = calculateCore('vat', ['0', '20']);
  const zeroRate = calculateCore('vat', ['100', '0']);

  assert.equal(zeroAmount.error, undefined);
  assert.equal(zeroAmount.primary, '$0.00');
  assert.equal(zeroRate.error, undefined);
  assert.equal(zeroRate.primary, '$100.00');
});
