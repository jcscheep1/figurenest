import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateOvertimePay } from './work-pay-math';

test('basic overtime mode uses entered overtime hours directly', () => {
  const result = calculateOvertimePay({
    hourlyRate: 24,
    overtimeHours: 8,
    multiplier: 1.5,
    totalHours: 0,
    threshold: 40,
    advanced: false,
  });
  assert.equal(result?.overtimeRate, 36);
  assert.equal(result?.overtimeHours, 8);
  assert.equal(result?.overtimePay, 288);
  assert.equal(result?.totalPay, 288);
});

test('advanced overtime mode derives regular and overtime hours from threshold', () => {
  const result = calculateOvertimePay({
    hourlyRate: 24,
    overtimeHours: 0,
    multiplier: 1.5,
    totalHours: 48,
    threshold: 40,
    advanced: true,
  });
  assert.equal(result?.regularHours, 40);
  assert.equal(result?.overtimeHours, 8);
  assert.equal(result?.regularPay, 960);
  assert.equal(result?.overtimePay, 288);
  assert.equal(result?.totalPay, 1248);
});

test('advanced overtime mode pays all hours at regular rate below the threshold', () => {
  const result = calculateOvertimePay({
    hourlyRate: 20,
    overtimeHours: 0,
    multiplier: 1.5,
    totalHours: 35,
    threshold: 40,
    advanced: true,
  });
  assert.equal(result?.regularHours, 35);
  assert.equal(result?.overtimeHours, 0);
  assert.equal(result?.totalPay, 700);
});

test('overtime math rejects impossible weekly hours and invalid multipliers', () => {
  assert.equal(calculateOvertimePay({ hourlyRate: 24, overtimeHours: 8, multiplier: 0, totalHours: 48, threshold: 40, advanced: true }), undefined);
  assert.equal(calculateOvertimePay({ hourlyRate: 24, overtimeHours: 8, multiplier: 1.5, totalHours: 169, threshold: 40, advanced: true }), undefined);
  assert.equal(calculateOvertimePay({ hourlyRate: 24, overtimeHours: 8, multiplier: 1.5, totalHours: 48, threshold: 169, advanced: true }), undefined);
});
