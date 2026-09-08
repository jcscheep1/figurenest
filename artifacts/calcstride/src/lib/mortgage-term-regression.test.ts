import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';
import { mortgageDecision } from './decision-calculators';

test('Mortgage term must resolve to whole monthly payment periods', () => {
  const valid = calculateCore('mortgage', ['360000', '72000', '6.5', '30.5', '4500', '1800']);
  assert.equal(valid.error, undefined);
  const invalid = calculateCore('mortgage', ['360000', '72000', '6.5', '30.01', '4500', '1800']);
  assert.match(invalid.error ?? '', /whole number of months/i);
  assert.equal(invalid.details, undefined);
});

test('Mortgage advanced scenario follows the same whole-month term contract', () => {
  assert.ok(mortgageDecision(360000, 72000, 6.5, 30.5, 4500, 1800, 0, 0, 0));
  assert.equal(mortgageDecision(360000, 72000, 6.5, 30.01, 4500, 1800, 0, 0, 0), undefined);
});
