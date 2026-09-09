import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCableFuseSize, type CableFuseInput } from './cable-fuse-size';

const base: CableFuseInput = {
  loadMode: 'amps',
  load: 20,
  voltage: 230,
  phase: 'single',
  powerFactor: 1,
  length: 20,
  lengthUnit: 'm',
  material: 'copper',
  installation: 'clipped-direct',
  insulation: 'pvc70',
  ambientC: 30,
  voltageDropLimitPct: 5,
};

function ok(input: CableFuseInput) {
  const result = calculateCableFuseSize(input);
  assert.ok(!('error' in result), 'expected a valid cable/fuse result');
  return result;
}

test('sizes a basic 230 V single-phase copper circuit', () => {
  const result = ok(base);
  assert.equal(result.cableSizeMm2, 2.5);
  assert.equal(result.breakerA, 20);
  assert.equal(result.designCurrentA, 20);
});

test('calculates three-phase current from kW, voltage and power factor', () => {
  const result = ok({ ...base, loadMode: 'kw', load: 11, voltage: 400, phase: 'three', powerFactor: 0.9 });
  assert.ok(Math.abs(result.designCurrentA - 17.64) < 0.05);
});

test('lower supply voltage increases current for the same single-phase power load', () => {
  const at230 = ok({ ...base, loadMode: 'kw', load: 2.3, voltage: 230 });
  const at115 = ok({ ...base, loadMode: 'kw', load: 2.3, voltage: 115 });
  assert.ok(at115.designCurrentA > at230.designCurrentA * 1.99);
});

test('feet and metres give equivalent voltage drop', () => {
  const metres = ok({ ...base, length: 30.48, lengthUnit: 'm' });
  const feet = ok({ ...base, length: 100, lengthUnit: 'ft' });
  assert.ok(Math.abs(metres.voltageDropV - feet.voltageDropV) < 1e-10);
});

test('protective device never exceeds corrected cable ampacity', () => {
  const result = ok({ ...base, load: 31, installation: 'clipped-direct' });
  assert.ok(result.breakerA === null || result.breakerA <= result.correctedAmpacityA);
  assert.ok(result.correctedAmpacityA >= result.designCurrentA);
});

test('flags a voltage drop above the selected limit', () => {
  const result = ok({ ...base, length: 150, voltageDropLimitPct: 3 });
  assert.equal(result.voltageDropPass, false);
  assert.ok(result.warnings.some((warning) => /voltage drop exceeds/i.test(warning)));
});

test('rejects invalid electrical inputs', () => {
  assert.deepEqual(calculateCableFuseSize({ ...base, load: 0 }), { error: 'Load must be greater than zero.' });
  assert.deepEqual(calculateCableFuseSize({ ...base, voltage: 0 }), { error: 'Supply voltage must be between 1 V and 1000 V.' });
  assert.deepEqual(calculateCableFuseSize({ ...base, powerFactor: 1.2 }), { error: 'Power factor must be greater than 0 and no more than 1.' });
  assert.deepEqual(calculateCableFuseSize({ ...base, length: 0 }), { error: 'Cable length must be greater than zero.' });
});
