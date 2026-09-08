import assert from 'node:assert/strict';
import test from 'node:test';
import { retirementDecision } from './decision-calculators';

test('retirement advanced scenario preserves ordinary projections', () => {
  const result = retirementDecision(50_000, 500, 6, 25, 200, 2, 2.5);
  assert.ok(result);
  assert.ok(result.balance > result.contributions);
  assert.ok(result.todayValue < result.balance);
  assert.ok(result.growth > 0);
  assert.ok(result.monthlyIncome4Percent > 0);
});

test('retirement advanced scenario rejects unsupported finance boundaries', () => {
  assert.equal(retirementDecision(1_000_000_000_001, 500, 6, 25, 200, 2, 2.5), undefined);
  assert.equal(retirementDecision(50_000, 1_000_000_000_001, 6, 25, 200, 2, 2.5), undefined);
  assert.equal(retirementDecision(50_000, 500, 6, 25, 1_000_000_000_001, 2, 2.5), undefined);
  assert.equal(retirementDecision(50_000, 500, 100.01, 25, 200, 2, 2.5), undefined);
  assert.equal(retirementDecision(50_000, 500, 6, 100.01, 200, 2, 2.5), undefined);
  assert.equal(retirementDecision(50_000, 500, 6, 25, 200, 100.01, 2.5), undefined);
  assert.equal(retirementDecision(50_000, 500, 6, 25, 200, 2, 100.01), undefined);
  assert.equal(retirementDecision(50_000, 500, 6, 1.1, 200, 2, 2.5), undefined);
  assert.equal(retirementDecision(50_000, 500, Number.POSITIVE_INFINITY, 25, 200, 2, 2.5), undefined);
});

test('retirement advanced scenario keeps exact supported limits valid', () => {
  const result = retirementDecision(1_000_000_000_000, 0, 100, 100, 0, 100, 100);
  assert.ok(result);
  assert.ok(Number.isFinite(result.balance));
  assert.ok(Number.isFinite(result.todayValue));
  assert.ok(Number.isFinite(result.contributions));
  assert.ok(Number.isFinite(result.growth));
  assert.ok(Number.isFinite(result.monthlyIncome4Percent));
});
