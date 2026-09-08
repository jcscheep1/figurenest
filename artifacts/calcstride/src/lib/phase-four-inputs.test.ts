import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour } from './phase-four';
import { normalizePhaseFourInputs, phaseFourFieldStep } from './phase-four-inputs';

test('Commission treats a blank optional base-pay field as zero', () => {
  assert.deepEqual(normalizePhaseFourInputs('commission', ['10000', '8', '']), ['10000', '8', '0']);
  assert.deepEqual(normalizePhaseFourInputs('commission', ['10000', '8', '   ']), ['10000', '8', '0']);
});

test('Commission preserves explicit base pay and required fields', () => {
  assert.deepEqual(normalizePhaseFourInputs('commission', ['10000', '8', '500']), ['10000', '8', '500']);
  assert.deepEqual(normalizePhaseFourInputs('commission', ['', '8', '']), ['', '8', '0']);
});

test('Auto Lease requires a whole-number monthly term', () => {
  const valid = normalizePhaseFourInputs('auto-lease', ['35000', '22000', '36', '0.0025']);
  const fractional = normalizePhaseFourInputs('auto-lease', ['35000', '22000', '36.5', '0.0025']);
  assert.deepEqual(valid, ['35000', '22000', '36', '0.0025']);
  assert.deepEqual(fractional, ['35000', '22000', '', '0.0025']);
  assert.equal(calculatePhaseFour('auto-lease', valid).primary, '$503.61/month');
  assert.ok(calculatePhaseFour('auto-lease', fractional).error);
  assert.equal(phaseFourFieldStep('auto-lease', 2, 'any'), '1');
});

test('Other Phase Four calculators keep blank values and field steps untouched', () => {
  assert.deepEqual(normalizePhaseFourInputs('budget', ['5000', '']), ['5000', '']);
  assert.equal(phaseFourFieldStep('budget', 1, 'any'), 'any');
});
