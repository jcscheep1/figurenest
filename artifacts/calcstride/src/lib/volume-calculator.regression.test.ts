import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('volume keeps normal, decimal, and explicit-zero dimensions valid', () => {
  assert.equal(calculateCore('volume', ['4', '3', '2.5']).primary, '30 m³');
  assert.equal(calculateCore('volume', ['1.5', '2.5', '3.2']).primary, '12 m³');
  assert.equal(calculateCore('volume', ['4', '3', '0']).primary, '0 m³');
});

test('volume rejects cleared required dimensions instead of coercing them to zero', () => {
  for (const inputs of [
    ['', '3', '2.5'],
    ['4', '   ', '2.5'],
    ['4', '3', ''],
  ]) {
    const result = calculateCore('volume', inputs);
    assert.ok(result.error);
    assert.equal(result.details, undefined);
  }
});

test('volume rejects negative and non-finite dimensions', () => {
  for (const inputs of [
    ['-1', '3', '2.5'],
    ['4', 'Infinity', '2.5'],
    ['4', '3', 'NaN'],
  ]) {
    const result = calculateCore('volume', inputs);
    assert.ok(result.error);
    assert.doesNotMatch(result.primary, /NaN|∞|Infinity/i);
  }
});
