import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePriorityFinance } from './priority-finance-calculators';

test('auto loan includes tax and fees before amortizing the financed amount', () => {
  const result = calculatePriorityFinance('auto-loan', ['32000', '4000', '3000', '6.5', '60', '6', '500']);
  assert.equal(result.primary, '$536.50');
  assert.deepEqual(result.details, [
    { label: 'Estimated amount financed', value: '$27,420.00' },
    { label: 'Total of loan payments', value: '$32,190.23' },
    { label: 'Total loan interest', value: '$4,770.23' },
  ]);
});

test('auto loan requires a whole-number monthly term', () => {
  const fractional = calculatePriorityFinance('auto-loan', ['32000', '4000', '3000', '6.5', '60.5', '6', '500']);
  assert.ok(fractional.error);
  assert.match(fractional.error, /whole-number term/);
  assert.equal(calculatePriorityFinance('auto-loan', ['32000', '4000', '3000', '6.5', '1', '6', '500']).error, undefined);
  assert.equal(calculatePriorityFinance('auto-loan', ['32000', '4000', '3000', '6.5', '120', '6', '500']).error, undefined);
});

test('simple interest follows I = P r t and supports fractional years', () => {
  const result = calculatePriorityFinance('simple-interest', ['5000', '6', '3']);
  assert.equal(result.primary, '$900.00');
  assert.equal(result.details[0].value, '$5,900.00');
  assert.equal(calculatePriorityFinance('simple-interest', ['5000', '6', '0.5']).primary, '$150.00');
});

test('interest rate solver recovers a known amortizing rate', () => {
  const result = calculatePriorityFinance('interest-rate', ['24000', '477.50', '60']);
  assert.equal(result.primary, '7.2%');
  assert.equal(result.error, undefined);
  assert.ok(calculatePriorityFinance('interest-rate', ['24000', '300', '60']).error);
});

test('interest rate requires a whole number of monthly payments', () => {
  const fractional = calculatePriorityFinance('interest-rate', ['24000', '477.50', '60.5']);
  assert.ok(fractional.error);
  assert.match(fractional.error, /whole number/);
  assert.equal(calculatePriorityFinance('interest-rate', ['24000', '24000', '1']).error, undefined);
  assert.equal(calculatePriorityFinance('interest-rate', ['24000', '20', '1200']).error, undefined);
});

test('mortgage amortization returns an independently checked payment snapshot', () => {
  const result = calculatePriorityFinance('mortgage-amortization', ['300000', '6', '30', '12']);
  assert.equal(result.primary, '$1,798.65');
  assert.deepEqual(result.details.slice(0, 3), [
    { label: 'Principal in payment 12', value: '$315.49' },
    { label: 'Interest in payment 12', value: '$1,483.16' },
    { label: 'Balance after payment 12', value: '$296,315.96' },
  ]);
});

test('mortgage payoff compares recurring extra principal with the baseline', () => {
  const result = calculatePriorityFinance('mortgage-payoff', ['240000', '5.5', '1600', '200']);
  assert.equal(result.error, undefined);
  assert.match(result.primary, /^\d+ yr \d+ mo$/);
  assert.ok(Number(result.details[1].value) > 0);
  assert.match(result.details[2].value, /^\$/);
});

test('priority finance calculators reject non-finite, negative, and unsupported values', () => {
  const cases = [
    calculatePriorityFinance('auto-loan', ['32000', '40000', '0', '6', '60', '0', '0']),
    calculatePriorityFinance('simple-interest', ['NaN', '6', '3']),
    calculatePriorityFinance('interest-rate', ['24000', '477', '1201']),
    calculatePriorityFinance('mortgage-amortization', ['300000', '6', '30', '361']),
    calculatePriorityFinance('mortgage-payoff', ['240000', '100', '100', '0']),
  ];
  for (const result of cases) {
    assert.ok(result.error);
    assert.doesNotMatch(JSON.stringify(result), /NaN|Infinity|∞/);
  }
});