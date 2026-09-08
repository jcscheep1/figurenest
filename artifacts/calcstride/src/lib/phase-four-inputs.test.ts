import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePhaseFourInputs } from './phase-four-inputs';

test('Commission treats a blank optional base-pay field as zero', () => {
  assert.deepEqual(normalizePhaseFourInputs('commission', ['10000', '8', '']), ['10000', '8', '0']);
  assert.deepEqual(normalizePhaseFourInputs('commission', ['10000', '8', '   ']), ['10000', '8', '0']);
});

test('Commission preserves explicit base pay and required fields', () => {
  assert.deepEqual(normalizePhaseFourInputs('commission', ['10000', '8', '500']), ['10000', '8', '500']);
  assert.deepEqual(normalizePhaseFourInputs('commission', ['', '8', '']), ['', '8', '0']);
});

test('Other Phase Four calculators keep blank values untouched', () => {
  assert.deepEqual(normalizePhaseFourInputs('budget', ['5000', '']), ['5000', '']);
});
