import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour } from './phase-four';

test('APR accepts a valid positive-cost schedule when total payments exceed net proceeds but not gross loan amount', () => {
  const result = calculatePhaseFour('apr', ['10000', '200', '9800', '165', '60']);
  assert.equal(result.error, undefined);
  assert.match(result.primary, /^0\.40% APR$/);
  assert.equal(result.details.find((item) => item.label === 'Cash received')?.value, '$9,800.00');
});

test('APR still rejects a schedule that does not repay more than the net cash received', () => {
  const result = calculatePhaseFour('apr', ['10000', '200', '9800', '163.33', '60']);
  assert.ok(result.error);
});
