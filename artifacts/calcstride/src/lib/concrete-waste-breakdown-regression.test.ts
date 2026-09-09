import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateConstruction } from './construction';

const wasteLine = (slug: 'concrete' | 'concrete-slab', values: Record<string, number>, unit: 'imperial' | 'metric') => {
  const result = calculateConstruction(slug, values, unit);
  assert.equal(result.error, undefined);
  return result.breakdown.find((line) => line.label === 'Waste allowance')?.value;
};

test('concrete waste breakdown uses the same displayed volume unit as base and order quantity', () => {
  for (const slug of ['concrete', 'concrete-slab'] as const) {
    assert.equal(
      wasteLine(slug, { length: 12, width: 10, depth: 4, waste: 10 }, 'imperial'),
      '0.15 yd³',
    );
    assert.equal(
      wasteLine(slug, { length: 5, width: 3, depth: 12, waste: 5 }, 'metric'),
      '0.09 m³',
    );
  }
});
