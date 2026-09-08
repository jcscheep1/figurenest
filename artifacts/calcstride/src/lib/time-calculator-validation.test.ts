import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWholeMinuteDuration, WHOLE_MINUTE_DURATION_ERROR } from './time-calculator-validation';

test('Time Calculator accepts durations that resolve to whole minutes', () => {
  assert.equal(validateWholeMinuteDuration('2', '45'), undefined);
  assert.equal(validateWholeMinuteDuration('1.5', '0'), undefined);
  assert.equal(validateWholeMinuteDuration('0.1', '0'), undefined);
});

test('Time Calculator rejects sub-minute precision its HH:MM result cannot represent', () => {
  assert.equal(validateWholeMinuteDuration('0', '2.5'), WHOLE_MINUTE_DURATION_ERROR);
  assert.equal(validateWholeMinuteDuration('0.01', '0'), WHOLE_MINUTE_DURATION_ERROR);
});

test('blank or non-numeric values remain the core calculator validation responsibility', () => {
  assert.equal(validateWholeMinuteDuration('', '2.5'), undefined);
  assert.equal(validateWholeMinuteDuration('abc', '2.5'), undefined);
});
