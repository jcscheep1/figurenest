import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

const detailValue = (result: ReturnType<typeof calculateCore>, label: string) =>
  result.details?.find((detail) => detail.label === label)?.value;

test('markup keeps ordinary selling-price and margin output unchanged', () => {
  const result = calculateCore('markup', ['48', '40']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$67.20');
  assert.equal(detailValue(result, 'Markup amount'), '$19.20');
  assert.equal(detailValue(result, 'Equivalent margin'), '28.57%');
});

test('markup reports zero-cost equivalent margin as undefined instead of 0%', () => {
  const result = calculateCore('markup', ['0', '40']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$0.00');
  assert.equal(detailValue(result, 'Markup amount'), '$0.00');
  assert.equal(detailValue(result, 'Equivalent margin'), 'Not defined');
});

test('markup still treats zero markup on a positive cost as a defined 0% margin', () => {
  const result = calculateCore('markup', ['48', '0']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$48.00');
  assert.equal(detailValue(result, 'Equivalent margin'), '0%');
});
