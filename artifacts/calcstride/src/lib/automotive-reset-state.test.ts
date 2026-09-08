import assert from 'node:assert/strict';
import test from 'node:test';
import { getAutomotiveResetUnits } from './automotive-reset-state';

test('automotive reset units follow the metric preference', () => {
  assert.deepEqual(getAutomotiveResetUnits('metric'), {
    distanceUnit: 'kilometres',
    efficiencyUnit: 'l100km',
    liquidUnit: 'litres',
    energyUnit: 'kwh',
    powerUnit: 'kw',
    converterFromUnit: 'l100km',
    converterToUnit: 'mpg',
  });
});

test('automotive reset units follow the imperial preference', () => {
  assert.deepEqual(getAutomotiveResetUnits('imperial'), {
    distanceUnit: 'miles',
    efficiencyUnit: 'mpg',
    liquidUnit: 'usGallons',
    energyUnit: 'kwh',
    powerUnit: 'kw',
    converterFromUnit: 'mpg',
    converterToUnit: 'l100km',
  });
});
