import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour } from './phase-four';

test('credit-card first-month interest mode does not require an irrelevant payoff payment', () => {
  const result = calculatePhaseFour('credit-card', ['5000', '20', '', 'interest']);

  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$83.33');
  assert.equal(result.summary, 'First-month interest at the entered APR.');
});

test('credit-card payoff mode still requires a valid monthly payment', () => {
  const result = calculatePhaseFour('credit-card', ['5000', '20', '', 'payoff']);

  assert.ok(result.error);
});
