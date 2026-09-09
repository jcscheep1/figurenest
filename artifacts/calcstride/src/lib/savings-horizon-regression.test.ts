import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('Savings rejects horizons that imply a fractional monthly contribution period', () => {
  const result = calculateCore('savings', ['1200', '300', '4.5', '0.1']);
  assert.match(result.error ?? '', /whole number of months/i);
  assert.equal(result.details, undefined);
});

test('Savings accepts year fractions that resolve exactly to whole months', () => {
  const result = calculateCore('savings', ['1200', '300', '0', '0.25']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$2,100.00');
  assert.equal(result.details?.[0].value, '$2,100.00');
  assert.equal(result.details?.[1].value, '$0.00');
});
