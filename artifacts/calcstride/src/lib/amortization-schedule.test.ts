import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateAmortizationSchedule } from './amortization-schedule';

test('matches a representative 30-year fixed-rate payment reference', () => {
  const result = calculateAmortizationSchedule({
    principal: 100_000,
    annualRatePercent: 6,
    months: 360,
  });

  assert.equal(result.scheduledMonthlyPayment, 599.55);
  assert.equal(result.payoffMonths, 360);
  assert.equal(result.schedule[0].interest, 500);
  assert.equal(result.schedule[0].principal, 99.55);
  assert.equal(result.schedule[0].balance, 99_900.45);
  assert.equal(result.schedule.at(-1)?.balance, 0);
  assert.equal(result.totalInterest, 115_838.45);
  assert.equal(result.totalPaid, 215_838.45);
});

test('handles a zero-rate loan without divide-by-zero', () => {
  const result = calculateAmortizationSchedule({
    principal: 12_000,
    annualRatePercent: 0,
    months: 12,
  });

  assert.equal(result.scheduledMonthlyPayment, 1_000);
  assert.equal(result.payoffMonths, 12);
  assert.equal(result.totalInterest, 0);
  assert.equal(result.totalPaid, 12_000);
  assert.equal(result.schedule.at(-1)?.balance, 0);
});

test('extra monthly principal shortens payoff and never overpays the balance', () => {
  const baseline = calculateAmortizationSchedule({
    principal: 25_000,
    annualRatePercent: 6.5,
    months: 60,
  });
  const accelerated = calculateAmortizationSchedule({
    principal: 25_000,
    annualRatePercent: 6.5,
    months: 60,
    extraMonthlyPrincipal: 100,
  });

  assert.ok(accelerated.payoffMonths < baseline.payoffMonths);
  assert.ok(accelerated.totalInterest < baseline.totalInterest);
  assert.equal(accelerated.schedule.at(-1)?.balance, 0);
  assert.ok((accelerated.schedule.at(-1)?.extraPrincipal ?? 0) <= 100);
});

test('rejects invalid and non-finite amortization inputs', () => {
  assert.throws(() => calculateAmortizationSchedule({ principal: 0, annualRatePercent: 5, months: 12 }));
  assert.throws(() => calculateAmortizationSchedule({ principal: 1_000, annualRatePercent: -1, months: 12 }));
  assert.throws(() => calculateAmortizationSchedule({ principal: 1_000, annualRatePercent: 5, months: 12.5 }));
  assert.throws(() => calculateAmortizationSchedule({ principal: 1_000, annualRatePercent: 5, months: 12, extraMonthlyPrincipal: -1 }));
  assert.throws(() => calculateAmortizationSchedule({ principal: Number.POSITIVE_INFINITY, annualRatePercent: 5, months: 12 }));
});
