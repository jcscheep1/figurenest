import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhaseThreeB } from './phase-three-b';
import { phaseThreeBNumberStep } from './confidence-interval-input-contract';

test('confidence interval sample size exposes a whole-number input step', () => {
  assert.equal(phaseThreeBNumberStep('confidence-interval', 'sampleSize', 'any'), '1');
  assert.equal(phaseThreeBNumberStep('confidence-interval', 'stddev', 'any'), 'any');
  assert.equal(phaseThreeBNumberStep('exponent', 'exponent', 'any'), 'any');
});

test('confidence interval calculation rejects fractional sample sizes and preserves a valid reference result', () => {
  const valid = calculatePhaseThreeB('confidence-interval', ['50', '10', '100', '0.95']);
  assert.equal(valid.error, undefined);
  assert.equal(valid.primary, '[48.04, 51.96]');

  const fractional = calculatePhaseThreeB('confidence-interval', ['50', '10', '2.5', '0.95']);
  assert.match(fractional.error ?? '', /sample size of at least 2/i);
});
