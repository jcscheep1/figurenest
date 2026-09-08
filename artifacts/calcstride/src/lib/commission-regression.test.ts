import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour } from './phase-four';
import { normalizePhaseFourInputs } from './phase-four-inputs';

test('Commission calculates standard pay and optional base pay correctly', () => {
  assert.equal(calculatePhaseFour('commission', ['10000', '8', '0']).primary, '$800.00');
  assert.equal(calculatePhaseFour('commission', ['10000', '8', '500']).primary, '$1,300.00');
  assert.equal(calculatePhaseFour('commission', normalizePhaseFourInputs('commission', ['10000', '8', ''])).primary, '$800.00');
});

test('Commission preserves valid zero and maximum-rate boundaries', () => {
  assert.equal(calculatePhaseFour('commission', ['0', '0', '0']).primary, '$0.00');
  assert.equal(calculatePhaseFour('commission', ['100', '100', '0']).primary, '$100.00');
});

test('Commission rejects blank required fields and out-of-range rates', () => {
  assert.ok(calculatePhaseFour('commission', normalizePhaseFourInputs('commission', ['', '8', ''])).error);
  assert.ok(calculatePhaseFour('commission', ['10000', '', '0']).error);
  assert.ok(calculatePhaseFour('commission', ['10000', '100.01', '0']).error);
  assert.ok(calculatePhaseFour('commission', ['10000', '-0.01', '0']).error);
});
