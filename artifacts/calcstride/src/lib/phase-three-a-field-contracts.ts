import type { PhaseThreeASlug } from './phase-three-a';

/**
 * Returns public HTML input-step contracts that are stricter than the shared
 * numeric-field default. Calculation validation remains the source of truth;
 * this helper prevents the UI from inviting values that validation rejects.
 */
export function phaseThreeAFieldStep(
  slug: PhaseThreeASlug,
  fieldKey: string,
  fallback: string | undefined,
): string | undefined {
  if (slug === 'electricity' && fieldKey === 'days') return '1';
  return fallback;
}
