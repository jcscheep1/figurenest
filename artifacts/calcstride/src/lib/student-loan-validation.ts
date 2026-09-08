const WHOLE_MONTH_TOLERANCE = 1e-9;

export const STUDENT_LOAN_MONTHS_PER_YEAR = 12;
export const STUDENT_LOAN_MIN_YEARS = 1 / STUDENT_LOAN_MONTHS_PER_YEAR;
export const STUDENT_LOAN_YEAR_STEP = String(STUDENT_LOAN_MIN_YEARS);

export function studentLoanTermMonths(rawYears: string): number | null {
  if (!rawYears.trim()) return null;
  const years = Number(rawYears);
  if (!Number.isFinite(years) || years <= 0) return null;

  const months = years * STUDENT_LOAN_MONTHS_PER_YEAR;
  const roundedMonths = Math.round(months);
  if (roundedMonths < 1 || Math.abs(months - roundedMonths) > WHOLE_MONTH_TOLERANCE) return null;
  return roundedMonths;
}

export const STUDENT_LOAN_TERM_ERROR = 'Enter a loan term of at least one month that resolves to a whole number of monthly payments.';
