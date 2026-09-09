import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateProbability, probabilityFieldContract } from './probability-calculator';

test('simple probability preserves valid whole outcome counts and known boundaries', () => {
  const reference = calculateProbability(['simple', '4', '10']);
  const impossible = calculateProbability(['simple', '0', '10']);
  const certain = calculateProbability(['simple', '10', '10']);
  const upperBound = calculateProbability(['simple', '1000000000000', '1000000000000']);

  assert.equal(reference.error, undefined);
  assert.equal(reference.primary, '40%');
  assert.equal(impossible.error, undefined);
  assert.equal(impossible.primary, '0%');
  assert.equal(certain.error, undefined);
  assert.equal(certain.primary, '100%');
  assert.equal(upperBound.error, undefined);
  assert.equal(upperBound.primary, '100%');
});

test('simple probability rejects fractional, blank, non-finite, negative, and impossible counts', () => {
  assert.match(calculateProbability(['simple', '0.5', '10']).error ?? '', /whole-number outcome counts/i);
  assert.match(calculateProbability(['simple', '4', '10.5']).error ?? '', /whole-number outcome counts/i);
  assert.ok(calculateProbability(['simple', '', '10']).error, 'blank favorable outcomes should be rejected');
  assert.ok(calculateProbability(['simple', '4', '   ']).error, 'blank total outcomes should be rejected');
  assert.ok(calculateProbability(['simple', 'NaN', '10']).error, 'NaN should be rejected');
  assert.ok(calculateProbability(['simple', '4', 'Infinity']).error, 'Infinity should be rejected');
  assert.ok(calculateProbability(['simple', '-1', '10']).error, 'negative favorable outcomes should be rejected');
  assert.ok(calculateProbability(['simple', '4', '0']).error, 'zero total outcomes should be rejected');
  assert.ok(calculateProbability(['simple', '11', '10']).error, 'favorable outcomes cannot exceed total outcomes');
  assert.ok(calculateProbability(['simple', '1000000000001', '1000000000001']).error, 'counts above the supported maximum should be rejected');
});

test('probability-valued modes preserve decimals and known boundary results', () => {
  const complement = calculateProbability(['complement', '0.4', '0.5']);
  const complementImpossible = calculateProbability(['complement', '0', '0']);
  const complementCertain = calculateProbability(['complement', '1', '0']);
  const independent = calculateProbability(['independent', '0.4', '0.5']);
  const independentZero = calculateProbability(['independent', '0', '1']);
  const independentCertain = calculateProbability(['independent', '1', '1']);

  assert.equal(complement.error, undefined);
  assert.equal(complement.primary, '60%');
  assert.equal(complementImpossible.primary, '100%');
  assert.equal(complementCertain.primary, '0%');
  assert.equal(independent.error, undefined);
  assert.equal(independent.primary, '20%');
  assert.equal(independentZero.primary, '0%');
  assert.equal(independentCertain.primary, '100%');
});

test('probability-valued modes reject blank, non-finite, and out-of-range probabilities', () => {
  for (const value of ['', '   ', 'NaN', 'Infinity', '-0.01', '1.01']) {
    assert.ok(calculateProbability(['complement', value, '0']).error, `complement should reject ${JSON.stringify(value)}`);
    assert.ok(calculateProbability(['independent', value, '0.5']).error, `independent P(A) should reject ${JSON.stringify(value)}`);
    assert.ok(calculateProbability(['independent', '0.5', value]).error, `independent P(B) should reject ${JSON.stringify(value)}`);
  }
});

test('probability input contracts match the selected model', () => {
  assert.deepEqual(probabilityFieldContract('simple', 1), { label: 'Favorable outcomes', min: 0, max: 1e12, step: '1' });
  assert.deepEqual(probabilityFieldContract('simple', 2), { label: 'Total outcomes', min: 1, max: 1e12, step: '1' });
  assert.deepEqual(probabilityFieldContract('complement', 1), { label: 'P(A)', min: 0, max: 1, step: 'any' });
  assert.equal(probabilityFieldContract('complement', 2)?.hidden, true);
  assert.deepEqual(probabilityFieldContract('independent', 2), { label: 'P(B)', min: 0, max: 1, step: 'any' });
});
