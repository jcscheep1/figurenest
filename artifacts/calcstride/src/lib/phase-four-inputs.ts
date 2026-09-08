import type { PhaseFourSlug } from './phase-four-routes';

/**
 * Normalizes only inputs that are explicitly optional in the public calculator contract.
 * Required Phase Four fields remain untouched so the calculation layer can reject blanks.
 */
export function normalizePhaseFourInputs(slug: PhaseFourSlug, values: readonly string[]): string[] {
  if (slug !== 'commission') return [...values];
  return values.map((value, index) => index === 2 && value.trim() === '' ? '0' : value);
}
