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

test('basic overtime preserves zero and decimal-hour boundary values', () => {
  const zero = calculateOvertimePay({ ...base, overtimeHours: 0, advanced: false });
  assert.equal(zero?.overtimeHours, 0);
  assert.equal(zero?.overtimePay, 0);
  assert.equal(zero?.totalPay, 0);

  const decimal = calculateOvertimePay({ ...base, overtimeHours: 0.5, advanced: false });
  assert.equal(decimal?.overtimeHours, 0.5);
  assert.equal(decimal?.overtimePay, 18);
  assert.equal(decimal?.totalPay, 18);
});

test('advanced overtime handles threshold equality, zero threshold, and fractional hours', () => {
  const atThreshold = calculateOvertimePay({ ...base, totalHours: 40, threshold: 40, advanced: true });
  assert.equal(atThreshold?.regularHours, 40);
  assert.equal(atThreshold?.overtimeHours, 0);
  assert.equal(atThreshold?.regularPay, 960);
  assert.equal(atThreshold?.overtimePay, 0);
  assert.equal(atThreshold?.totalPay, 960);

  const zeroThreshold = calculateOvertimePay({ ...base, totalHours: 8, threshold: 0, advanced: true });
  assert.equal(zeroThreshold?.regularHours, 0);
  assert.equal(zeroThreshold?.overtimeHours, 8);
  assert.equal(zeroThreshold?.totalPay, 288);

  const fractional = calculateOvertimePay({ ...base, totalHours: 40.5, threshold: 40, advanced: true });
  assert.equal(fractional?.regularHours, 40);
  assert.equal(fractional?.overtimeHours, 0.5);
  assert.equal(fractional?.regularPay, 960);
  assert.equal(fractional?.overtimePay, 18);
  assert.equal(fractional?.totalPay, 978);
});

test('zero hourly rate remains a valid explicit boundary', () => {
  const result = calculateOvertimePay({ ...base, hourlyRate: 0, advanced: true });
  assert.equal(result?.regularPay, 0);
  assert.equal(result?.overtimePay, 0);
  assert.equal(result?.totalPay, 0);
});

test('each overtime mode rejects invalid values that are active in that mode', () => {
  assert.equal(calculateOvertimePay({ ...base, overtimeHours: 169, advanced: false }), undefined);
  assert.equal(calculateOvertimePay({ ...base, overtimeHours: -0.5, advanced: false }), undefined);
  assert.equal(calculateOvertimePay({ ...base, overtimeHours: Number.NaN, advanced: false }), undefined);
  assert.equal(calculateOvertimePay({ ...base, totalHours: 169, advanced: true }), undefined);
  assert.equal(calculateOvertimePay({ ...base, totalHours: Number.POSITIVE_INFINITY, advanced: true }), undefined);
  assert.equal(calculateOvertimePay({ ...base, threshold: 169, advanced: true }), undefined);
  assert.equal(calculateOvertimePay({ ...base, threshold: -1, advanced: true }), undefined);
  assert.equal(calculateOvertimePay({ ...base, multiplier: 0, advanced: false }), undefined);
  assert.equal(calculateOvertimePay({ ...base, multiplier: Number.NaN, advanced: true }), undefined);
  assert.equal(calculateOvertimePay({ ...base, hourlyRate: -1, advanced: false }), undefined);
});
