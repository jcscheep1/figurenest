import assert from 'node:assert/strict';
import test from 'node:test';
import { BMI_POSITIVE_DIMENSIONS_ERROR, priorityOneBmiInputError } from './bmi-input-validation';

test('BMI accepts positive weight and height', () => {
  assert.equal(priorityOneBmiInputError('bmi', ['70', '175']), null);
});

test('BMI rejects zero weight or height before division', () => {
  assert.equal(priorityOneBmiInputError('bmi', ['0', '175']), BMI_POSITIVE_DIMENSIONS_ERROR);
  assert.equal(priorityOneBmiInputError('bmi', ['70', '0']), BMI_POSITIVE_DIMENSIONS_ERROR);
});

test('BMI validation does not alter unrelated priority-one calculators', () => {
  assert.equal(priorityOneBmiInputError('pace', ['0', '30']), null);
});
