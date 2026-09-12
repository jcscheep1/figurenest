import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { calculateCore } from './core-calculators';

const pageSource = readFileSync(new URL('../pages/AutomotiveCalculatorPage.tsx', import.meta.url), 'utf8');

test('EV Charging Cost exposes and enforces the 0-100% charge-added contract', () => {
  const normal = calculateCore('ev-charging-cost', ['75', '80', '0.32']);
  assert.equal(normal.primary, '$19.20');
  assert.equal(normal.details?.[0].value, '60 kWh');

  const full = calculateCore('ev-charging-cost', ['75', '100', '0.32']);
  assert.equal(full.primary, '$24.00');
  assert.equal(full.error, undefined);

  const zero = calculateCore('ev-charging-cost', ['75', '0', '0.32']);
  assert.equal(zero.primary, '$0.00');
  assert.equal(zero.error, undefined);

  assert.match(calculateCore('ev-charging-cost', ['75', '100.01', '0.32']).error ?? '', /cannot exceed 100%/i);
  assert.ok(calculateCore('ev-charging-cost', ['75', '-0.01', '0.32']).error);
  assert.ok(calculateCore('ev-charging-cost', ['75', '', '0.32']).error);
  assert.match(pageSource, /max=\{slug === 'ev-charging-cost' && field\.key === 'charge' \? 100 : undefined\}/);
});
