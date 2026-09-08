import assert from 'node:assert/strict';
import test from 'node:test';
import { fuelCostPerDisplayedDistance } from './fuel-cost-distance';

test('Fuel Cost keeps cost per mile unchanged for imperial distance', () => {
  assert.equal(fuelCostPerDisplayedDistance(0.25, 1), 0.25);
});

test('Fuel Cost converts cost per mile to the lower cost per kilometre', () => {
  const milesPerKilometre = 1 / 1.609344;
  const actual = fuelCostPerDisplayedDistance(0.25, milesPerKilometre);
  assert.ok(Math.abs(actual - 0.1553427980593335) < 1e-12);
});
