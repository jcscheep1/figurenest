import { describe, expect, it } from 'vitest';
import { calculateCore, coreFields } from './core-calculators';

const numericCoreCalculators = Object.entries(coreFields).filter(([, fields]) =>
  fields.every((field) => field.type !== 'date'),
);

describe('core calculator blank input regression', () => {
  it.each(numericCoreCalculators)('rejects every cleared required field for %s', (slug, fields) => {
    const defaults = fields.map((field) => field.value);

    fields.forEach((_, index) => {
      const blank = [...defaults];
      blank[index] = '';
      expect(calculateCore(slug, blank).error, `${slug} field ${index + 1} blank`).toBeTruthy();

      const whitespace = [...defaults];
      whitespace[index] = '   ';
      expect(calculateCore(slug, whitespace).error, `${slug} field ${index + 1} whitespace`).toBeTruthy();
    });
  });

  it('keeps explicit numeric zero distinct from a cleared field where zero is valid', () => {
    expect(calculateCore('percentage', ['0', '240']).error).toBeUndefined();
    expect(calculateCore('vat', ['0', '21']).error).toBeUndefined();
    expect(calculateCore('area', ['0', '8']).error).toBeUndefined();
    expect(calculateCore('volume', ['0', '3', '2.5']).error).toBeUndefined();
  });

  it('rejects non-finite numeric text rather than returning a plausible result', () => {
    expect(calculateCore('percentage', ['NaN', '240']).error).toBeTruthy();
    expect(calculateCore('vat', ['100', 'Infinity']).error).toBeTruthy();
    expect(calculateCore('area', ['-Infinity', '8']).error).toBeTruthy();
  });
});
