export type CompoundFrequency = 'daily' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';

export const compoundPeriods: Record<CompoundFrequency, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  'semi-annually': 2,
  annually: 1,
};

export const compoundFrequencyLabels: Record<CompoundFrequency, string> = {
  daily: 'Daily (365/year)',
  monthly: 'Monthly (12/year)',
  quarterly: 'Quarterly (4/year)',
  'semi-annually': 'Semi-annually (2/year)',
  annually: 'Annually (1/year)',
};

/**
 * Converts a nominal annual rate compounded at the selected frequency into
 * the nominal annual rate that produces the same growth over equal monthly
 * intervals. FigureNest uses monthly contribution periods, so this lets the
 * Basic and Advanced calculators share one rate without changing deposit
 * timing or silently reverting Advanced mode to monthly compounding.
 */
export function equivalentMonthlyNominalRate(
  annualRatePercent: number,
  frequency: CompoundFrequency,
): number {
  if (!Number.isFinite(annualRatePercent) || annualRatePercent === 0) return annualRatePercent;

  const periods = compoundPeriods[frequency];
  const periodicRate = annualRatePercent / 100 / periods;
  const effectiveMonthlyRate = Math.pow(1 + periodicRate, periods / 12) - 1;
  return effectiveMonthlyRate * 1200;
}
