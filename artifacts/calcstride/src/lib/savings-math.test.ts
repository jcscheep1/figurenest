import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateSavingsMath } from './savings-math';

test('savings math handles zero interest exactly', () => {
  const result = calculateSavingsMath({
    startingBalance: 1200,
    monthlyContribution: 300,
    annualRatePercent: 0,
    years: 3,
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.balance, 12000);
  assert.equal(result.value.deposited, 12000);
  assert.equal(result.value.interest, 0);
});

test('savings math compounds monthly contributions at month end', () => {
  const result = calculateSavingsMath({
    startingBalance: 1200,
    monthlyContribution: 300,
    annualRatePercent: 4.5,
    years: 3,
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(Math.abs(result.value.balance - 12912.923975037324) < 1e-9);
  assert.equal(result.value.deposited, 12000);
  assert.ok(Math.abs(result.value.interest - 912.9239750373235) < 1e-9);
});

test('savings math rejects unsupported finance ranges', () => {
  const amount = calculateSavingsMath({
    startingBalance: 1_000_000_000_001,
    monthlyContribution: 0,
    annualRatePercent: 4,
    years: 10,
  });
  const rate = calculateSavingsMath({
    startingBalance: 1000,
    monthlyContribution: 100,
    annualRatePercent: 100.01,
    years: 10,
  });
  const years = calculateSavingsMath({
    startingBalance: 1000,
    monthlyContribution: 100,
    annualRatePercent: 4,
    years: 100.01,
  });

  assert.equal(amount.ok, false);
  assert.equal(rate.ok, false);
  assert.equal(years.ok, false);
});

test('savings math remains stable at extremely small nonzero rates', () => {
  const result = calculateSavingsMath({
    startingBalance: 5000,
    monthlyContribution: 250,
    annualRatePercent: 0.000000000001,
    years: 10,
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(Number.isFinite(result.value.balance));
  assert.ok(Number.isFinite(result.value.interest));
  assert.ok(result.value.interest >= 0);
});
