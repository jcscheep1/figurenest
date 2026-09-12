import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';
import { formatCurrency, type CurrencyCode } from './units-preferences';

test('fuel cost keeps the reference calculation and localizes monetary outputs', () => {
  const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'ZAR'];

  for (const currency of currencies) {
    const result = calculateCore('fuel-cost', ['320', '28', '3.65'], 'default', { currency });
    assert.equal(result.error, undefined);
    assert.equal(result.primary, formatCurrency(320 / 28 * 3.65, currency));
    assert.equal(result.details?.[0].value, '11.43 gallons');
    assert.equal(result.details?.[1].value, formatCurrency(3.65 / 28, currency));
  }
});

test('fuel cost rejects missing or unusable efficiency without turning it into a plausible result', () => {
  assert.ok(calculateCore('fuel-cost', ['320', '', '3.65']).error);
  assert.ok(calculateCore('fuel-cost', ['320', '   ', '3.65']).error);
  assert.ok(calculateCore('fuel-cost', ['320', '0', '3.65']).error);
});

test('fuel cost preserves valid zero distance and zero price boundaries', () => {
  const zeroDistance = calculateCore('fuel-cost', ['0', '28', '3.65'], 'default', { currency: 'EUR' });
  assert.equal(zeroDistance.error, undefined);
  assert.equal(zeroDistance.primary, formatCurrency(0, 'EUR'));
  assert.equal(zeroDistance.details?.[0].value, '0 gallons');

  const zeroPrice = calculateCore('fuel-cost', ['320', '28', '0'], 'default', { currency: 'GBP' });
  assert.equal(zeroPrice.error, undefined);
  assert.equal(zeroPrice.primary, formatCurrency(0, 'GBP'));
  assert.equal(zeroPrice.details?.[1].value, formatCurrency(0, 'GBP'));
});

test('fuel cost rejects negative and supported-range overflow inputs', () => {
  assert.ok(calculateCore('fuel-cost', ['-1', '28', '3.65']).error);
  assert.ok(calculateCore('fuel-cost', ['320', '-1', '3.65']).error);
  assert.ok(calculateCore('fuel-cost', ['320', '28', '-1']).error);
  assert.ok(calculateCore('fuel-cost', ['10000001', '28', '3.65']).error);
  assert.ok(calculateCore('fuel-cost', ['320', '1001', '3.65']).error);
  assert.ok(calculateCore('fuel-cost', ['320', '28', '1001']).error);
});
