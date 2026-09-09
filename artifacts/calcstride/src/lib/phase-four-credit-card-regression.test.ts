import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour } from './phase-four';

test('credit-card payoff reports payoff cost without overstating the final payment', () => {
  const result = calculatePhaseFour('credit-card', ['5000', '20', '200', 'payoff']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '33 months');
  assert.deepEqual(result.details, [
    { label: 'Total interest', value: '$1,522.10' },
    { label: 'Total paid', value: '$6,522.10' },
    { label: 'Final payment', value: '$122.10' },
  ]);
});

test('credit-card zero-APR payoff does not invent interest', () => {
  const result = calculatePhaseFour('credit-card', ['5000', '0', '200', 'payoff']);
  assert.equal(result.primary, '25 months');
  assert.deepEqual(result.details, [
    { label: 'Total interest', value: '$0.00' },
    { label: 'Total paid', value: '$5,000.00' },
    { label: 'Final payment', value: '$200.00' },
  ]);
});

test('credit-card payoff never reports the 1200-month safety cap as a completed payoff', () => {
  const result = calculatePhaseFour('credit-card', ['5000', '20', '83.33333334', 'payoff']);
  assert.equal(result.primary, 'Check the values');
  assert.match(result.error ?? '', /exceeds.*1,200-month.*100-year.*limit/i);
});

test('credit-card still rejects payments that do not exceed first-month interest', () => {
  const result = calculatePhaseFour('credit-card', ['5000', '20', '83.33333333', 'payoff']);
  assert.match(result.error ?? '', /must exceed first-month interest/i);
});
