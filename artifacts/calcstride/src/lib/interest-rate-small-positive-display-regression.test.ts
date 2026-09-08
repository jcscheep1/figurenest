import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePriorityFinance } from './priority-finance-calculators';

test('Interest Rate preserves a small positive solved rate instead of displaying 0%', () => {
  const result = calculatePriorityFinance('interest-rate', ['10000', '833.35', '12']);

  assert.equal(result.error, undefined);
  assert.equal(result.primary, '0.0037%');
});

test('Interest Rate still displays an exact zero-rate case as 0%', () => {
  const result = calculatePriorityFinance('interest-rate', ['12000', '1000', '12']);

  assert.equal(result.error, undefined);
  assert.equal(result.primary, '0%');
});
