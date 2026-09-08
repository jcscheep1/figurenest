import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STUDENT_LOAN_MIN_YEARS,
  STUDENT_LOAN_YEAR_STEP,
  studentLoanTermMonths,
} from './student-loan-validation';

test('Student Loan term accepts positive whole monthly payment counts', () => {
  assert.equal(studentLoanTermMonths('5'), 60);
  assert.equal(studentLoanTermMonths('5.5'), 66);
  assert.equal(studentLoanTermMonths(String(1 / 12)), 1);
  assert.equal(STUDENT_LOAN_MIN_YEARS, 1 / 12);
  assert.equal(Number(STUDENT_LOAN_YEAR_STEP), 1 / 12);
});

test('Student Loan term rejects zero, blanks, non-finite values, and fractional months', () => {
  for (const value of ['', '   ', '0', '-1', 'Infinity', 'NaN', '5.01', '0.01']) {
    assert.equal(studentLoanTermMonths(value), null, value);
  }
});
