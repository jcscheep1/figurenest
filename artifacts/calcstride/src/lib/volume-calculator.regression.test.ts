import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore, convertCore } from './core-calculators';

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

test('volume unit conversion matches known cubic reference values', () => {
  assert.equal(convertCore('volume', '1', 'cubicMeters', 'cubicFeet').primary, '35.31 Cubic feet');
  assert.equal(convertCore('volume', '1', 'cubicFeet', 'cubicInches').primary, '1,728 Cubic inches');
  assert.equal(convertCore('volume', '0', 'cubicMeters', 'cubicFeet').primary, '0 Cubic feet');
});

test('volume unit conversion rejects blank, negative, non-finite, and invalid-unit input', () => {
  for (const result of [
    convertCore('volume', '', 'cubicMeters', 'cubicFeet'),
    convertCore('volume', '   ', 'cubicMeters', 'cubicFeet'),
    convertCore('volume', '-1', 'cubicMeters', 'cubicFeet'),
    convertCore('volume', 'Infinity', 'cubicMeters', 'cubicFeet'),
    convertCore('volume', 'NaN', 'cubicMeters', 'cubicFeet'),
    convertCore('volume', '1', 'not-a-unit', 'cubicFeet'),
    convertCore('volume', '1', 'cubicMeters', 'not-a-unit'),
  ]) {
    assert.ok(result.error);
    assert.doesNotMatch(result.primary, /NaN|∞|Infinity/i);
  }
});
