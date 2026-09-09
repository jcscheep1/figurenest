import { describe, expect, it } from 'vitest';
import { FEET_PER_METRE, normalizeVoltageDropValues } from './voltage-drop-units';

describe('Voltage Drop length units', () => {
  it('keeps feet unchanged for the legacy calculator contract', () => {
    expect(normalizeVoltageDropValues(['10', '100', 'ft', '1.24', 'single']))
      .toEqual(['10', '100', '1.24', 'single']);
  });

  it('converts metres to feet before the legacy voltage-drop formula runs', () => {
    const normalized = normalizeVoltageDropValues(['10', '30.48', 'm', '1.24', 'single']);
    expect(Number(normalized[1])).toBeCloseTo(100, 10);
    expect(normalized).toEqual(['10', String(30.48 * FEET_PER_METRE), '1.24', 'single']);
  });
});
