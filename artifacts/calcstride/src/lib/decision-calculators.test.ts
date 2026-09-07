import assert from 'node:assert/strict';
import test from 'node:test';
import { amortizationScenario, budgetDecision, creditCardDecision, mortgageDecision, retirementDecision } from './decision-calculators';

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
