import { calculatePriorityOneExpansion, type PriorityOneCurrencyCode, type PriorityOneExpansionSlug, type PriorityOneResult } from './priority-one-expansion';

export const DISCOUNT_RATE_MAX = 100;
export const DISCOUNT_RATE_ERROR = 'Discount rate must be 100% or less.';

export const priorityOneFieldMax = (slug: PriorityOneExpansionSlug, fieldKey: string, configuredMax?: number) =>
  slug === 'discount' && fieldKey === 'rate' ? DISCOUNT_RATE_MAX : configuredMax;

export function calculatePriorityOneWithInputContracts(
  slug: PriorityOneExpansionSlug,
  values: string[],
  currency: PriorityOneCurrencyCode = 'USD',
): PriorityOneResult {
  if (slug === 'discount') {
    const rate = Number(values[1]);
    if (values[1]?.trim() && Number.isFinite(rate) && rate > DISCOUNT_RATE_MAX) {
      return { primary: DISCOUNT_RATE_ERROR, summary: DISCOUNT_RATE_ERROR, details: [], error: DISCOUNT_RATE_ERROR };
    }
  }

  return calculatePriorityOneExpansion(slug, values, currency);
}
