import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateConstruction, getConstructionTool } from './construction';

test('Paint Calculator keeps the documented whole-coat contract', () => {
  const normal = calculateConstruction('paint', {
    length: 16,
    width: 12,
    height: 8,
    openings: 60,
    coats: 2,
    coverage: 350,
  }, 'imperial');

  assert.equal(normal.error, undefined);
  assert.equal(normal.primary, '3 gallons');
  assert.equal(normal.breakdown.find((line) => line.label === 'Unrounded quantity')?.value, '2.22');
  assert.match(normal.summary, /across 2 coats/);

  const fractional = calculateConstruction('paint', {
    length: 16,
    width: 12,
    height: 8,
    openings: 60,
    coats: 2.5,
    coverage: 350,
  }, 'imperial');
  assert.match(fractional.error ?? '', /whole number/i);
  assert.equal(fractional.breakdown.length, 0);

  const zero = calculateConstruction('paint', {
    length: 16,
    width: 12,
    height: 8,
    openings: 60,
    coats: 0,
    coverage: 350,
  }, 'imperial');
  assert.ok(zero.error);

  const coatsField = getConstructionTool('paint')?.fields.find((field) => field.key === 'coats');
  assert.ok(coatsField);
  assert.equal(coatsField.step, '1');
});
