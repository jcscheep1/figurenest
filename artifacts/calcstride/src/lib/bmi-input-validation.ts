import type { PriorityOneExpansionSlug } from './priority-one-expansion';

export const BMI_POSITIVE_DIMENSIONS_ERROR = 'Weight and height must both be greater than zero.';

export function priorityOneBmiInputError(slug: PriorityOneExpansionSlug, values: readonly string[]): string | null {
  if (slug !== 'bmi') return null;
  const weight = Number(values[0]);
  const height = Number(values[1]);
  if (!Number.isFinite(weight) || !Number.isFinite(height) || weight <= 0 || height <= 0) {
    return BMI_POSITIVE_DIMENSIONS_ERROR;
  }
  return null;
}
