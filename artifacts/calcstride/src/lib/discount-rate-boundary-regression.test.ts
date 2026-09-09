import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityOneWithInputContracts, priorityOneFieldMax } from './priority-one-input-contracts';

test('Discount Calculator accepts 0–100% and rejects rates above 100%', () => {
  const normal = calculatePriorityOneWithInputContracts('discount', ['100', '25']);
  assert.equal(normal.error, undefined);
  assert.equal(normal.primary, '$75.00');
  assert.equal(normal.details.find((detail) => detail.label === 'Savings')?.value, '$25.00');

  const fullDiscount = calculatePriorityOneWithInputContracts('discount', ['100', '100']);
  assert.equal(fullDiscount.error, undefined);
  assert.equal(fullDiscount.primary, '$0.00');

  const overDiscount = calculatePriorityOneWithInputContracts('discount', ['100', '100.01']);
  assert.match(overDiscount.error ?? '', /100% or less/i);
});

test('Discount Calculator rate input exposes a 100% maximum', () => {
  assert.equal(priorityOneFieldMax('discount', 'rate'), 100);
  assert.equal(priorityOneFieldMax('discount', 'price'), undefined);
});
