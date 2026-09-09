import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateOvertimePay } from './work-pay-math';

const base = {
  hourlyRate: 24,
  overtimeHours: 8,
  multiplier: 1.5,
  totalHours: 48,
  threshold: 40,
};

test('basic overtime ignores hidden advanced-only values', () => {
  const result = calculateOvertimePay({
    ...base,
    totalHours: 999,
    threshold: Number.NaN,
    advanced: false,
  });

  assert.equal(result?.overtimeRate, 36);
  assert.equal(result?.overtimeHours, 8);
  assert.equal(result?.overtimePay, 288);
  assert.equal(result?.totalPay, 288);
});

test('advanced overtime ignores hidden basic-only overtime hours', () => {
  const result = calculateOvertimePay({
    ...base,
    overtimeHours: 999,
    advanced: true,
  });

  assert.equal(result?.regularHours, 40);
  assert.equal(result?.overtimeHours, 8);
  assert.equal(result?.regularPay, 960);
  assert.equal(result?.overtimePay, 288);
  assert.equal(result?.totalPay, 1248);
});

test('each overtime mode still rejects invalid values that are active in that mode', () => {
  assert.equal(calculateOvertimePay({ ...base, overtimeHours: 169, advanced: false }), undefined);
  assert.equal(calculateOvertimePay({ ...base, totalHours: 169, advanced: true }), undefined);
  assert.equal(calculateOvertimePay({ ...base, threshold: 169, advanced: true }), undefined);
  assert.equal(calculateOvertimePay({ ...base, multiplier: 0, advanced: false }), undefined);
});
