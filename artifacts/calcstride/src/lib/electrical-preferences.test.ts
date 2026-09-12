import { describe, expect, it } from 'vitest';
import {
  defaultElectricalPreferences,
  ELECTRICAL_VOLTAGE_PRESETS,
  validateElectricalPreferences,
} from './electrical-preferences';

describe('electrical preference validation', () => {
  it('keeps supported voltage presets and both phase selections', () => {
    for (const voltage of ELECTRICAL_VOLTAGE_PRESETS) {
      expect(validateElectricalPreferences({ voltage, phase: 'single' })).toEqual({ voltage, phase: 'single' });
      expect(validateElectricalPreferences({ voltage, phase: 'three' })).toEqual({ voltage, phase: 'three' });
    }
  });

  it('accepts valid custom voltage values at the inclusive boundaries', () => {
    expect(validateElectricalPreferences({ voltage: 1, phase: 'single' })).toEqual({ voltage: 1, phase: 'single' });
    expect(validateElectricalPreferences({ voltage: 230.5, phase: 'three' })).toEqual({ voltage: 230.5, phase: 'three' });
    expect(validateElectricalPreferences({ voltage: 1000, phase: 'three' })).toEqual({ voltage: 1000, phase: 'three' });
  });

  it('falls back to the default voltage for blank, non-finite, zero, negative, and out-of-range values', () => {
    for (const voltage of ['', '   ', 0, -1, 1000.1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(validateElectricalPreferences({ voltage, phase: 'three' })).toEqual({
        voltage: defaultElectricalPreferences.voltage,
        phase: 'three',
      });
    }
  });

  it('normalizes missing or invalid phase values to single phase without discarding a valid voltage', () => {
    expect(validateElectricalPreferences({ voltage: 400 })).toEqual({ voltage: 400, phase: 'single' });
    expect(validateElectricalPreferences({ voltage: 400, phase: 'invalid' })).toEqual({ voltage: 400, phase: 'single' });
  });

  it('returns defaults for malformed persisted payloads', () => {
    for (const value of [null, undefined, false, 230, '230']) {
      expect(validateElectricalPreferences(value)).toEqual(defaultElectricalPreferences);
    }
  });
});
