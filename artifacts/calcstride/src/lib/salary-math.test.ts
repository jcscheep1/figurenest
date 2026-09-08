import assert from 'node:assert/strict';
import test from 'node:test';
import { annualizeSalary, calculateSalary, MAX_SALARY_AMOUNT } from './salary-math';

test('salary calculation preserves the standard full-time example', () => {
  const result = calculateSalary({ annual: 60000, hoursPerWeek: 40, weeksPerYear: 52, bonus: 0, unpaidWeeks: 0 });
  assert.equal(result?.total, 60000);
  assert.equal(result?.monthly, 5000);
  assert.ok(Math.abs((result?.weekly ?? 0) - 1153.8461538461538) < 1e-9);
  assert.ok(Math.abs((result?.hourly ?? 0) - 28.846153846153847) < 1e-9);
});

test('salary converter annualizes common source pay periods', () => {
  assert.equal(annualizeSalary(60000, 'annual', 40, 52), 60000);
  assert.equal(annualizeSalary(5000, 'monthly', 40, 52), 60000);
  assert.equal(annualizeSalary(1000, 'weekly', 40, 52), 52000);
  assert.equal(annualizeSalary(25, 'hourly', 40, 52), 52000);
});

test('salary converter rejects annualized totals above the supported boundary', () => {
  assert.equal(annualizeSalary(MAX_SALARY_AMOUNT, 'monthly', 40, 52), undefined);
  assert.equal(annualizeSalary(MAX_SALARY_AMOUNT, 'weekly', 40, 52), undefined);
  assert.equal(annualizeSalary(MAX_SALARY_AMOUNT, 'hourly', 40, 52), undefined);
});

test('advanced salary prorates unpaid weeks and then adds bonus', () => {
  const result = calculateSalary({ annual: 52000, hoursPerWeek: 40, weeksPerYear: 52, bonus: 2000, unpaidWeeks: 2 });
  assert.equal(result?.paidWeeks, 50);
  assert.equal(result?.total, 52000);
  assert.equal(result?.weekly, 1040);
  assert.equal(result?.hourly, 26);
});

test('salary calculation rejects impossible work schedules', () => {
  assert.equal(calculateSalary({ annual: 60000, hoursPerWeek: 0, weeksPerYear: 52, bonus: 0, unpaidWeeks: 0 }), undefined);
  assert.equal(calculateSalary({ annual: 60000, hoursPerWeek: 169, weeksPerYear: 52, bonus: 0, unpaidWeeks: 0 }), undefined);
  assert.equal(calculateSalary({ annual: 60000, hoursPerWeek: 40, weeksPerYear: 54, bonus: 0, unpaidWeeks: 0 }), undefined);
  assert.equal(calculateSalary({ annual: 60000, hoursPerWeek: 40, weeksPerYear: 52, bonus: 0, unpaidWeeks: 52 }), undefined);
});

test('salary calculation rejects unsupported amounts and computed totals', () => {
  assert.equal(calculateSalary({ annual: MAX_SALARY_AMOUNT + 1, hoursPerWeek: 40, weeksPerYear: 52, bonus: 0, unpaidWeeks: 0 }), undefined);
  assert.equal(calculateSalary({ annual: 1, hoursPerWeek: 40, weeksPerYear: 52, bonus: MAX_SALARY_AMOUNT + 1, unpaidWeeks: 0 }), undefined);
  assert.equal(calculateSalary({ annual: MAX_SALARY_AMOUNT, hoursPerWeek: 40, weeksPerYear: 52, bonus: 1, unpaidWeeks: 0 }), undefined);
});

test('salary calculation accepts the exact supported amount boundary', () => {
  const result = calculateSalary({ annual: MAX_SALARY_AMOUNT, hoursPerWeek: 168, weeksPerYear: 53, bonus: 0, unpaidWeeks: 0 });
  assert.equal(result?.total, MAX_SALARY_AMOUNT);
  assert.ok(Number.isFinite(result?.hourly));
});
