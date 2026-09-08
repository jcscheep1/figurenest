import assert from 'node:assert/strict';
import test from 'node:test';
import { growthDecision } from './decision-calculators';

test('compound interest advanced mode preserves ordinary growth behavior', () => {
  const result = growthDecision(5000, 250, 6, 10, 3, 0.5, 2.5, true);
  assert.ok(result);
  assert.ok(result.balance > result.deposited);
  assert.ok(result.todayValue < result.balance);
});

test('compound interest advanced mode accepts exact supported finance boundaries', () => {
  const result = growthDecision(1_000_000_000_000, 0, 100, 100, 0, 100, 100, false);
  assert.ok(result);
  assert.ok(Number.isFinite(result.balance));
  assert.ok(Number.isFinite(result.todayValue));
});

test('compound interest advanced mode rejects amounts beyond the supported ceiling', () => {
  assert.equal(growthDecision(1_000_000_000_001, 250, 6, 10, 0, 0, 2.5, false), undefined);
  assert.equal(growthDecision(5000, 1_000_000_000_001, 6, 10, 0, 0, 2.5, false), undefined);
});

test('compound interest advanced mode rejects unsupported percentage assumptions', () => {
  assert.equal(growthDecision(5000, 250, 100.01, 10, 0, 0, 2.5, false), undefined);
  assert.equal(growthDecision(5000, 250, 6, 10, 100.01, 0, 2.5, false), undefined);
  assert.equal(growthDecision(5000, 250, 6, 10, 0, 100.01, 2.5, false), undefined);
  assert.equal(growthDecision(5000, 250, 6, 10, 0, 0, 100.01, false), undefined);
});

test('compound interest advanced mode rejects horizons beyond 100 years and non-finite inputs', () => {
  assert.equal(growthDecision(5000, 250, 6, 100.01, 0, 0, 2.5, false), undefined);
  assert.equal(growthDecision(5000, 250, 6, 10, Number.POSITIVE_INFINITY, 0, 2.5, false), undefined);
});
