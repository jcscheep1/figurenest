import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour } from './phase-four';

test('Roman numeral converter accepts only whole numbers from 1 through 3999', () => {
  assert.equal(calculatePhaseFour('roman-numeral', ['1']).primary, 'I');
  assert.equal(calculatePhaseFour('roman-numeral', ['3999']).primary, 'MMMCMXCIX');
  assert.equal(calculatePhaseFour('roman-numeral', ['2026']).primary, 'MMXXVI');
  for (const value of ['1.5', '2026.25', '3998.9']) assert.ok(calculatePhaseFour('roman-numeral', [value]).error);
  for (const value of ['0', '4000', '', 'NaN', 'Infinity']) assert.ok(calculatePhaseFour('roman-numeral', [value]).error);
});
