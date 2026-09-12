import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseTwo } from './phase-two-expansion';

const calculate = (coefficient: string, exponent: string) =>
  calculatePhaseTwo('scientific-notation', [coefficient, exponent]);

test('Scientific Notation converts a representative positive exponent', () => {
  const result = calculate('6.02', '3');
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '6,020');
});

test('Scientific Notation supports negative exponents', () => {
  const result = calculate('1.25', '-2');
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '0.0125');
});

test('Scientific Notation preserves a negative coefficient', () => {
  const result = calculate('-4.5', '2');
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '-450');
});

test('Scientific Notation rejects blank required inputs', () => {
  assert.match(calculate('', '3').error ?? '', /blank values/i);
  assert.match(calculate('6.02', '   ').error ?? '', /blank values/i);
});

test('Scientific Notation rejects fractional exponents', () => {
  assert.match(calculate('6.02', '2.5').error ?? '', /whole number between -308 and 308/i);
});

test('Scientific Notation enforces the supported exponent boundary', () => {
  assert.equal(calculate('1', '308').error, undefined);
  assert.equal(calculate('1', '-308').error, undefined);
  assert.match(calculate('1', '309').error ?? '', /whole number between -308 and 308/i);
  assert.match(calculate('1', '-309').error ?? '', /whole number between -308 and 308/i);
});
