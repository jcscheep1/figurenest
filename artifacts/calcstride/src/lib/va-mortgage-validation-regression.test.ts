import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityOneExpansion } from './priority-one-expansion';

test('VA Mortgage keeps a normal financed-loan scenario valid', () => {
  const result = calculatePriorityOneExpansion('va-mortgage', ['350000', '0', '6.5', '30', '2.15']);
  assert.equal(result.error, undefined);
  assert.match(result.primary, /^\$/);
  assert.equal(result.details[0]?.label, 'Financed funding fee');
  assert.equal(result.details[0]?.value, '$7,525.00');
});

test('VA Mortgage rejects a down payment greater than the home price', () => {
  const result = calculatePriorityOneExpansion('va-mortgage', ['300000', '300001', '6.5', '30', '2.15']);
  assert.match(result.error ?? '', /down payment cannot exceed home price/i);
  assert.equal(result.details.length, 0);
});

test('VA Mortgage allows a fully paid purchase without inventing negative financing', () => {
  const result = calculatePriorityOneExpansion('va-mortgage', ['300000', '300000', '6.5', '30', '2.15']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$0.00');
  assert.equal(result.details[0]?.value, '$0.00');
});
