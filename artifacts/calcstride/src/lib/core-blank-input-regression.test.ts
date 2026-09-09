import { describe, expect, it } from 'vitest';
import { calculateCore } from './core-calculators';

describe('core calculator blank input regression', () => {
  it('rejects a blank salary field instead of coercing it to zero', () => {
    const result = calculateCore('salary', ['60000', '', '52']);
    expect(result.error).toBeTruthy();
  });

  it('rejects a blank overtime field instead of coercing it to zero', () => {
    const result = calculateCore('overtime', ['24', '8', '']);
    expect(result.error).toBeTruthy();
  });

  it('rejects blanks in other numeric core calculators too', () => {
    expect(calculateCore('vat', ['100', '']).error).toBeTruthy();
    expect(calculateCore('area', ['12', '']).error).toBeTruthy();
    expect(calculateCore('volume', ['4', '3', '']).error).toBeTruthy();
  });
});
