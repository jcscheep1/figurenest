import { describe, expect, it } from 'vitest';
import { calculateCore } from './core-calculators';

describe('percentage calculator required numeric inputs', () => {
  it('calculates an ordinary percentage correctly', () => {
    expect(calculateCore('percentage', ['25', '80'])).toEqual({ primary: '20' });
  });

  it('keeps genuine zero values valid', () => {
    expect(calculateCore('percentage', ['0', '80'])).toEqual({ primary: '0' });
    expect(calculateCore('percentage', ['25', '0'])).toEqual({ primary: '0' });
  });

  it('rejects a blank percentage instead of silently treating it as zero', () => {
    const result = calculateCore('percentage', ['', '80']);
    expect(result.error).toBeTruthy();
  });

  it('rejects a blank base value instead of silently treating it as zero', () => {
    const result = calculateCore('percentage', ['25', '']);
    expect(result.error).toBeTruthy();
  });

  it('rejects non-finite and negative inputs', () => {
    expect(calculateCore('percentage', ['Infinity', '80']).error).toBeTruthy();
    expect(calculateCore('percentage', ['25', '-1']).error).toBeTruthy();
  });
});
