import { describe, expect, it } from 'vitest';
import { parseTimeCardNumber } from './time-card-input';

describe('parseTimeCardNumber', () => {
  it('rejects an empty field instead of silently treating it as zero', () => {
    expect(Number.isNaN(parseTimeCardNumber(''))).toBe(true);
    expect(Number.isNaN(parseTimeCardNumber('   '))).toBe(true);
  });

  it('preserves explicit zero and normal decimal values', () => {
    expect(parseTimeCardNumber('0')).toBe(0);
    expect(parseTimeCardNumber('20')).toBe(20);
    expect(parseTimeCardNumber('1.5')).toBe(1.5);
  });
});
