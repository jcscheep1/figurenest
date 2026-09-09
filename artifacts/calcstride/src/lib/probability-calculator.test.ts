import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateProbability, probabilityFieldContract } from './probability-calculator';

test('simple probability preserves valid whole outcome counts', () => {
  const result = calculateProbability(['simple', '4', '10']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '40%');
});

test('simple probability rejects fractional favorable or total counts', () => {
  assert.match(calculateProbability(['simple', '0.5', '10']).error ?? '', /whole-number outcome counts/i);
  assert.match(calculateProbability(['simple', '4', '10.5']).error ?? '', /whole-number outcome counts/i);
});

test('probability-valued modes preserve decimal probabilities', () => {
  const complement = calculateProbability(['complement', '0.4', '0.5']);
  const independent = calculateProbability(['independent', '0.4', '0.5']);
  assert.equal(complement.error, undefined);
  assert.equal(complement.primary, '60%');
  assert.equal(independent.error, undefined);
  assert.equal(independent.primary, '20%');
});

test('probability input contracts match the selected model', () => {
  assert.deepEqual(probabilityFieldContract('simple', 1), { label: 'Favorable outcomes', min: 0, max: 1e12, step: '1' });
  assert.deepEqual(probabilityFieldContract('simple', 2), { label: 'Total outcomes', min: 1, max: 1e12, step: '1' });
  assert.deepEqual(probabilityFieldContract('complement', 1), { label: 'P(A)', min: 0, max: 1, step: 'any' });
  assert.equal(probabilityFieldContract('complement', 2)?.hidden, true);
  assert.deepEqual(probabilityFieldContract('independent', 2), { label: 'P(B)', min: 0, max: 1, step: 'any' });
});
