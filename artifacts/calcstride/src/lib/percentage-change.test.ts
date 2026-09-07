import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePercentageChange, percentageChangeContent } from './percentage-change';

test('percentage change identifies increases and absolute change', () => {
  const result = calculatePercentageChange({ mode: 'change', original: 80, newValue: 100 });
  assert.equal(result.ok, true);
  assert.equal(result.primary, '25% increase');
  assert.equal(result.ok && result.direction, 'increase');
  assert.equal(result.ok && result.breakdown[2].value, '20');
});

test('percentage change identifies decreases and no change', () => {
  assert.equal(calculatePercentageChange({ mode: 'change', original: 200, newValue: 150 }).primary, '25% decrease');
  assert.equal(calculatePercentageChange({ mode: 'change', original: 12, newValue: 12 }).primary, 'No change (0%)');
});

test('percentage change rejects a zero or non-finite baseline without invalid output', () => {
  const zero = calculatePercentageChange({ mode: 'change', original: 0, newValue: 10 });
  assert.equal(zero.ok, false);
  assert.match(zero.error ?? '', /undefined.*zero/i);
  const invalid = calculatePercentageChange({ mode: 'change', original: Number.NaN, newValue: 10 });
  assert.equal(invalid.ok, false);
  assert.doesNotMatch(JSON.stringify([zero, invalid]), /NaN|Infinity/);
});

test('percentage difference uses absolute difference divided by average', () => {
  const result = calculatePercentageChange({ mode: 'difference', firstValue: 40, secondValue: 60 });
  assert.equal(result.primary, '40%');
  assert.equal(result.ok && result.breakdown[0].value, '20');
  assert.equal(result.ok && result.breakdown[1].value, '50');
  assert.equal(calculatePercentageChange({ mode: 'difference', firstValue: 0, secondValue: 10 }).primary, '200%');
});

test('percentage difference rejects negative values and a zero average', () => {
  const negative = calculatePercentageChange({ mode: 'difference', firstValue: -1, secondValue: 2 });
  assert.match(negative.error ?? '', /non-negative/i);
  const zeros = calculatePercentageChange({ mode: 'difference', firstValue: 0, secondValue: 0 });
  assert.match(zeros.error ?? '', /average is zero/i);
});

test('reverse percentage handles increase and decrease directions', () => {
  assert.equal(calculatePercentageChange({ mode: 'reverse', finalValue: 125, rate: 25, direction: 'increase' }).primary, '100');
  assert.equal(calculatePercentageChange({ mode: 'reverse', finalValue: 80, rate: 20, direction: 'decrease' }).primary, '100');
  assert.equal(calculatePercentageChange({ mode: 'reverse', finalValue: 72, rate: 0, direction: 'increase' }).primary, '72');
});

test('reverse percentage validates rates and never exposes non-finite results', () => {
  for (const result of [
    calculatePercentageChange({ mode: 'reverse', finalValue: 10, rate: -1, direction: 'increase' }),
    calculatePercentageChange({ mode: 'reverse', finalValue: 10, rate: 100, direction: 'decrease' }),
    calculatePercentageChange({ mode: 'reverse', finalValue: 10, rate: Number.POSITIVE_INFINITY, direction: 'increase' }),
  ]) {
    assert.equal(result.ok, false);
    assert.doesNotMatch(JSON.stringify(result), /NaN|Infinity/);
  }
});

test('finite boundary inputs remain accurate or fail without non-finite output', () => {
  const oppositeMax = calculatePercentageChange({
    mode: 'change',
    original: Number.MAX_VALUE,
    newValue: -Number.MAX_VALUE,
  });
  assert.equal(oppositeMax.ok, true);
  assert.equal(oppositeMax.primary, '200% decrease');
  assert.doesNotMatch(JSON.stringify(oppositeMax), /NaN|Infinity|∞/);

  const largeDifference = calculatePercentageChange({
    mode: 'difference',
    firstValue: Number.MAX_VALUE,
    secondValue: Number.MAX_VALUE / 2,
  });
  assert.equal(largeDifference.ok, true);
  assert.equal(largeDifference.primary, '66.67%');
  assert.doesNotMatch(JSON.stringify(largeDifference), /NaN|Infinity|∞/);

  const reverseOverflow = calculatePercentageChange({
    mode: 'reverse',
    finalValue: Number.MAX_VALUE,
    rate: 99.99999999999999,
    direction: 'decrease',
  });
  assert.equal(reverseOverflow.ok, false);
  assert.match(reverseOverflow.error ?? '', /numeric range/i);
  assert.doesNotMatch(JSON.stringify(reverseOverflow), /NaN|Infinity|∞/);
});

test('shared content supplies formulas, instructions, examples, FAQs, and related tools', () => {
  assert.equal(percentageChangeContent.formulas.length, 3);
  assert.ok(percentageChangeContent.instructions.length >= 3);
  assert.ok(percentageChangeContent.examples.length >= 3);
  assert.ok(percentageChangeContent.faqs.length >= 6);
  assert.ok(percentageChangeContent.relatedToolSlugs.length > 0);
});