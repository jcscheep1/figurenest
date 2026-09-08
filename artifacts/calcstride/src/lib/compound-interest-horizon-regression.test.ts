import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';
import { growthDecision } from './decision-calculators';

test('Compound Interest requires a positive horizon made of whole monthly periods', () => {
  const zero = calculateCore('compound-interest', ['5000', '250', '6', '0']);
  assert.match(zero.error ?? '', /greater than zero/i);

  const fractional = calculateCore('compound-interest', ['5000', '250', '6', '10.01']);
  assert.match(fractional.error ?? '', /whole number of months/i);

  const valid = calculateCore('compound-interest', ['5000', '250', '6', '10.5']);
  assert.equal(valid.error, undefined);
});

test('Compound Interest normal and zero-rate calculations remain unchanged', () => {
  const normal = calculateCore('compound-interest', ['5000', '250', '6', '10']);
  assert.equal(normal.primary, '$50,066.82');
  assert.equal(normal.details?.[0].value, '$35,000.00');
  assert.equal(normal.details?.[1].value, '$15,066.82');

  const zeroRate = calculateCore('compound-interest', ['1000', '100', '0', '1']);
  assert.equal(zeroRate.primary, '$2,200.00');
  assert.equal(zeroRate.details?.[1].value, '$0.00');
});

test('Advanced monthly growth engine follows the same monthly horizon contract', () => {
  assert.equal(growthDecision(5000, 250, 6, 0, 0, 0, 2.5, false), undefined);
  assert.equal(growthDecision(5000, 250, 6, 10.01, 0, 0, 2.5, false), undefined);
  const valid = growthDecision(5000, 250, 6, 10.5, 0, 0, 2.5, false);
  assert.ok(valid);
});
