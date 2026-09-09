import { describe, expect, it } from 'vitest';
import { calculatePriorityOneExpansion, priorityOneExpansionDefinitions } from './priority-one-expansion';

describe('Estate Tax Calculator rate boundary', () => {
  it('calculates a representative taxable estate at 40%', () => {
    const result = calculatePriorityOneExpansion('estate-tax', ['15000000', '13610000', '40']);
    expect(result.error).toBeUndefined();
    expect(result.primary).toBe('$556,000.00');
    expect(result.details).toContainEqual({ label: 'Taxable estate', value: '$1,390,000.00' });
  });

  it('allows exactly 100% but rejects rates above 100%', () => {
    const atLimit = calculatePriorityOneExpansion('estate-tax', ['2000000', '1000000', '100']);
    const aboveLimit = calculatePriorityOneExpansion('estate-tax', ['2000000', '1000000', '100.01']);

    expect(atLimit.error).toBeUndefined();
    expect(atLimit.primary).toBe('$1,000,000.00');
    expect(aboveLimit.error).toBeTruthy();
  });

  it('publishes the same 100% maximum in the input contract', () => {
    const rate = priorityOneExpansionDefinitions['estate-tax'].fields.find((field) => field.key === 'rate');
    expect(rate?.min).toBe(0);
    expect(rate?.max).toBe(100);
  });
});
