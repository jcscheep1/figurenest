import type { PhaseFourSlug } from './phase-four-routes';

/**
 * Normalizes only inputs that have special public calculator contracts.
 * Required Phase Four fields otherwise remain untouched so the calculation layer can reject blanks.
 */
export function normalizePhaseFourInputs(slug: PhaseFourSlug, values: readonly string[]): string[] {
  if (slug === 'commission') {
    return values.map((value, index) => index === 2 && value.trim() === '' ? '0' : value);
  }
  if (slug === 'auto-lease') {
    return values.map((value, index) => index === 2 && value.trim() !== '' && !Number.isInteger(Number(value)) ? '' : value);
  }
  if (slug === 'annuity') {
    const years = values[2];
    const mode = values[3];
    if (years?.trim() !== '') {
      const numericYears = Number(years);
      const payoutPeriods = mode === 'monthly' ? numericYears * 12 : numericYears;
      if (!Number.isFinite(payoutPeriods) || !Number.isInteger(payoutPeriods)) {
        return values.map((value, index) => index === 2 ? '' : value);
      }
    }
  }
  return [...values];
}

export function phaseFourFieldStep(slug: PhaseFourSlug, fieldIndex: number, fallback: string | undefined): string | undefined {
  if (slug === 'auto-lease' && fieldIndex === 2) return '1';
  if (slug === 'annuity' && fieldIndex === 2) return '0.08333333333333333';
  return fallback;
}
