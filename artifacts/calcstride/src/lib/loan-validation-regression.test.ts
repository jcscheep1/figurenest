import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';
import { amortizationScenario } from './decision-calculators';

test('Loan required fields reject blanks instead of coercing them to zero', () => {
  for (const inputs of [
    ['', '7.2', '5'],
    ['24000', '', '5'],
    ['24000', '7.2', ''],
  ]) {
    const result = calculateCore('loan', inputs);
    assert.ok(result.error, `expected error for ${JSON.stringify(inputs)}`);
    assert.equal(result.details, undefined);
  }
});

test('other core finance calculators also reject blank required fields', () => {
  for (const [slug, inputs] of [
    ['compound-interest', ['5000', '', '6', '10']],
    ['savings', ['1200', '300', '', '3']],
    ['mortgage', ['360000', '72000', '6.5', '', '4500', '1800']],
  ] as const) {
    const result = calculateCore(slug, [...inputs]);
    assert.ok(result.error, `${slug} must reject blank required input`);
  }
});

test('Loan term must map to a whole number of monthly payment periods', () => {
  const valid = calculateCore('loan', ['24000', '7.2', '5.5']);
  assert.equal(valid.error, undefined);
  const invalid = calculateCore('loan', ['24000', '7.2', '5.01']);
  assert.match(invalid.error ?? '', /whole number of months/i);
  assert.equal(invalid.details, undefined);
});

test('advanced amortization follows the same whole-month contract', () => {
  assert.ok(amortizationScenario(24000, 7.2, 5.5));
  assert.equal(amortizationScenario(24000, 7.2, 5.01), undefined);
});
