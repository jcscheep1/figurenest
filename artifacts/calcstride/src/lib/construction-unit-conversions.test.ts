import assert from 'node:assert/strict';
import test from 'node:test';
import { convertConstructionFieldValue } from './construction';

const closeTo = (actual: number, expected: number, tolerance = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
};

test('paint coverage converts between ft²/US gal and m²/L', () => {
  const metric = convertConstructionFieldValue(300, 'ft2PerGal', 'm2PerL');
  closeTo(metric, 7.36272, 1e-5);
  closeTo(convertConstructionFieldValue(metric, 'm2PerL', 'ft2PerGal'), 300, 1e-8);
});

test('paint container volume converts between US gallons and litres', () => {
  closeTo(convertConstructionFieldValue(1, 'usGal', 'l'), 3.785411784, 1e-9);
  closeTo(convertConstructionFieldValue(3.785411784, 'l', 'usGal'), 1, 1e-9);
});

test('flooring pack coverage converts between square feet and square metres', () => {
  closeTo(convertConstructionFieldValue(20, 'ft2', 'm2'), 1.8580608, 1e-9);
  closeTo(convertConstructionFieldValue(1.8580608, 'm2', 'ft2'), 20, 1e-9);
});

test('mass and bulk-volume advanced construction conversions preserve quantity', () => {
  closeTo(convertConstructionFieldValue(1, 'usTon', 'tonne'), 0.90718474, 1e-9);
  closeTo(convertConstructionFieldValue(1, 'yd3', 'm3'), 0.764554857984, 1e-12);
});
