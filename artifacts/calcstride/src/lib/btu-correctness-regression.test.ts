import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseTwo, phaseTwoDefinitions } from './phase-two-expansion';

test('BTU preserves the documented area-times-factor reference result', () => {
  const result = calculatePhaseTwo('btu', ['500', '30']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '15,000 BTU/h');
  assert.match(result.summary, /planning load/i);
});

test('BTU accepts an explicit zero as distinct from a cleared required field', () => {
  const zero = calculatePhaseTwo('btu', ['0', '30']);
  assert.equal(zero.error, undefined);
  assert.equal(zero.primary, '0 BTU/h');

  const blank = calculatePhaseTwo('btu', ['', '30']);
  assert.match(blank.error ?? '', /blank values/i);
  assert.equal(blank.details.length, 0);
});

test('BTU rejects whitespace-only and negative required numeric inputs', () => {
  assert.match(calculatePhaseTwo('btu', ['500', '   ']).error ?? '', /blank values/i);
  assert.match(calculatePhaseTwo('btu', ['-1', '30']).error ?? '', /negative values/i);
  assert.match(calculatePhaseTwo('btu', ['500', '-30']).error ?? '', /negative values/i);
});

test('BTU input metadata keeps area and planning factor non-negative numeric fields', () => {
  const fields = phaseTwoDefinitions.btu.fields;
  assert.deepEqual(fields.map((field) => field.key), ['area', 'factor']);
  assert.deepEqual(fields.map((field) => field.min), [0, 0]);
});
