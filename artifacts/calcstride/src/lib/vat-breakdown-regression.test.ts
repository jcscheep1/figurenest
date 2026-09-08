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
