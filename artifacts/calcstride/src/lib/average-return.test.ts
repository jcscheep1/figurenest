import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAverageReturn } from './average-return';

test('Average Return keeps established normal-period behavior', () => {
  const result = calculateAverageReturn(['8', '-4', '12']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '5.3333%');
  assert.equal(result.details[0]?.label, 'Compound annual return');
  assert.equal(result.details[0]?.value, '5.1085%');
});

test('Average Return accepts an exact 100% loss as a zero growth factor', () => {
  const result = calculateAverageReturn(['10', '-100', '25']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '-21.6667%');
  assert.equal(result.details[0]?.value, '-100%');
});

test('Average Return still rejects impossible losses below 100%', () => {
  const result = calculateAverageReturn(['10', '-100.01', '25']);
  assert.match(result.error ?? '', /cannot be less than -100%/i);
});

test('Average Return rejects blank and non-finite return inputs', () => {
  assert.ok(calculateAverageReturn(['', '2', '3']).error);
  assert.ok(calculateAverageReturn(['Infinity', '2', '3']).error);
});