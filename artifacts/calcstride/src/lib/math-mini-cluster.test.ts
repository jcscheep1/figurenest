import assert from 'node:assert/strict';
import test from 'node:test';
import { publishedTools } from './catalog';
import { categoryContent } from './category-content';
import { calculatePhaseThreeB, phaseThreeBDefinitions } from './phase-three-b';
import { toolApplicability } from './units-preferences';

test('Big Number Calculator preserves exact arbitrary-precision integer arithmetic', () => {
  assert.equal(calculatePhaseThreeB('big-number', ['add', '9007199254740993', '1']).primary, '9007199254740994');
  assert.equal(calculatePhaseThreeB('big-number', ['subtract', '-9007199254740993', '2']).primary, '-9007199254740995');
  assert.equal(calculatePhaseThreeB('big-number', ['multiply', '12345678901234567890', '-3']).primary, '-37037036703703703670');
  assert.equal(calculatePhaseThreeB('big-number', ['add', '+42', '-2']).primary, '40');
  const division = calculatePhaseThreeB('big-number', ['divide', '-17', '5']);
  assert.equal(division.primary, '-3');
  assert.equal(division.details.find((item) => item.label === 'Remainder')?.value, '-2');
  assert.equal(calculatePhaseThreeB('big-number', ['add', '0', '0']).primary, '0');
});

test('Big Number Calculator rejects malformed, blank, over-limit, decimal, exponent and zero-divisor input', () => {
  const invalid = [
    ['add', '', '1'], ['add', '   ', '1'], ['add', '1.5', '2'], ['add', '1e3', '2'],
    ['add', '--1', '2'], ['add', 'NaN', '2'], ['add', 'Infinity', '2'], ['divide', '4', '0'],
    ['add', '1'.repeat(1001), '2'],
  ] as const;
  for (const values of invalid) assert.ok(calculatePhaseThreeB('big-number', values).error, values.join('|'));
  assert.equal(calculatePhaseThreeB('big-number', ['add', '9'.repeat(1000), '1']).error, undefined);
});

test('Distance Calculator covers reference, signed, decimal, zero-distance and axis-aligned cases', () => {
  assert.equal(calculatePhaseThreeB('distance', ['0', '0', '3', '4']).primary, '5');
  assert.equal(calculatePhaseThreeB('distance', ['2', '-3', '2', '-3']).primary, '0');
  assert.equal(calculatePhaseThreeB('distance', ['-1', '-1', '2', '3']).primary, '5');
  assert.equal(calculatePhaseThreeB('distance', ['0.5', '1.5', '3.5', '5.5']).primary, '5');
  const vertical = calculatePhaseThreeB('distance', ['2', '-3', '2', '7']);
  assert.equal(vertical.primary, '10');
  assert.equal(vertical.details.find((item) => item.label === 'Δx')?.value, '0');
  const signedZero = calculatePhaseThreeB('distance', ['-0', '-0', '0', '0']);
  assert.equal(signedZero.primary, '0');
  assert.ok(signedZero.details.every((item) => item.value !== '-0'));
});

test('Distance Calculator rejects blank, non-finite and out-of-bound coordinates', () => {
  for (const values of [
    ['', '0', '3', '4'], [' ', '0', '3', '4'], ['NaN', '0', '3', '4'],
    ['Infinity', '0', '3', '4'], ['1000000000000001', '0', '3', '4'],
  ]) assert.ok(calculatePhaseThreeB('distance', values).error, values.join('|'));
});

test('Math mini-cluster is published through the existing registries and remains unitless', () => {
  for (const slug of ['big-number', 'distance'] as const) {
    const definition = phaseThreeBDefinitions[slug];
    assert.ok(publishedTools.some((tool) => tool.slug === slug && tool.href === definition.href), slug);
    assert.deepEqual(toolApplicability[slug], { monetary: false, dimensions: [], unitless: true });
    assert.ok(categoryContent.math.toolDescriptions.some((item) => item.slug === slug), slug);
  }
});
