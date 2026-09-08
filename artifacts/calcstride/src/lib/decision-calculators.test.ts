import assert from 'node:assert/strict';
import test from 'node:test';
import { amortizationScenario, aprDecision, autoLoanDecision, budgetDecision, creditCardDecision, growthDecision, mortgageDecision, mortgagePayoffDecision, retirementDecision, savingsTargetDecision } from './decision-calculators';

test('loan scenarios include fees, balloon, and faster payoff from extra payments', () => {
  const base = amortizationScenario(24000, 7.2, 5);
  const expanded = amortizationScenario(24000, 7.2, 5, 100, 500, 2000);
  assert.ok(base && expanded);
  assert.ok(expanded.financed > base.financed);
  assert.ok(expanded.months < 60);
  assert.equal(expanded.balloon, 2000);
});

test('mortgage decision adds ownership costs and reports interest savings', () => {
  const result = mortgageDecision(360000, 72000, 6.5, 30, 4500, 1800, 100, 75, 250);
  assert.ok(result);
  assert.ok(result.housingPayment > 2000);
  assert.ok(result.payoffMonths < 360);
  assert.ok(result.interestSaved > 0);
});

test('retirement decision separates contributions, growth, and inflation-adjusted value', () => {
  const result = retirementDecision(50000, 500, 6, 25, 200, 2, 2.5);
  assert.ok(result);
  assert.ok(result.balance > result.contributions);
  assert.ok(result.todayValue < result.balance);
  assert.ok(result.monthlyIncome4Percent > 0);
});

test('budget decision totals categories and builds an emergency target', () => {
  const result = budgetDecision(5000, [1500, 600, 700, 400, 300, 300], 6);
  assert.deepEqual(result, { expenses: 3800, surplus: 1200, savingsRate: 24, emergencyTarget: 22800 });
});

test('credit card extra payments reduce payoff time and interest', () => {
  const result = creditCardDecision(5000, 20, 200, 100, 0);
  assert.ok(result);
  assert.ok(result.monthsSaved > 0);
  assert.ok(result.interestSaved > 0);
});

test('auto loan advanced scenario includes rebate, balloon and ownership costs', () => {
  const result = autoLoanDecision(32000, 4000, 3000, 6.5, 60, 6, 500, 1000, 2500, 100, 350);
  assert.ok(result);
  assert.equal(result.financed, 26420);
  assert.ok(result.ownershipMonthly > result.payment);
  assert.ok(result.interestSaved > 0);
});

test('mortgage payoff scenario applies a lump sum and delayed extra payments', () => {
  const result = mortgagePayoffDecision(240000, 5.5, 1600, 200, 10000, 150, 7);
  assert.ok(result);
  assert.ok(result.monthsSaved > 0);
  assert.ok(result.interestSaved > 0);
});

test('mortgage payoff advanced mode validates start month and lump-sum boundaries', () => {
  assert.equal(mortgagePayoffDecision(240000, 5.5, 1600, 200, 10000, 150, 7.5), undefined);
  assert.equal(mortgagePayoffDecision(240000, 5.5, 1600, 200, 240001, 150, 1), undefined);

  const paidNow = mortgagePayoffDecision(240000, 5.5, 1600, 200, 240000, 150, 1);
  assert.ok(paidNow);
  assert.equal(paidNow.months, 0);
  assert.equal(paidNow.interest, 0);
});

test('compound growth accounts for fees, inflation and increasing contributions', () => {
  const result = growthDecision(5000, 250, 6, 10, 3, 0.5, 2.5, true);
  assert.ok(result);
  assert.ok(result.balance > result.deposited);
  assert.ok(result.todayValue < result.balance);
});

test('savings target reports the target gap and required monthly deposit', () => {
  const result = savingsTargetDecision(1200, 300, 4.5, 3, 15000, 0, false);
  assert.ok(result);
  assert.ok(result.targetGap > 0);
  assert.ok(result.requiredMonthly && result.requiredMonthly > 300);
});

test('APR advanced scenario includes upfront and final charges', () => {
  const result = aprDecision(9800, 220, 60, 200, 100, 250, 10);
  assert.ok(result);
  assert.ok(result.effectiveApr > 10);
  assert.equal(result.totalFees, 550);
});