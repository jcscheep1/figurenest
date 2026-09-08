export type SocialSecurityEstimate = {
  factor: number;
  monthlyBenefit: number;
  fullRetirementAgeMonths: number;
  monthsFromFullRetirementAge: number;
};

/**
 * Convert a required numeric form value without treating an empty field as zero.
 * A deliberately entered zero remains valid for fields whose numeric contract allows it.
 */
export function parseRequiredSocialSecurityNumber(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value);
}

/**
 * Full retirement age for workers born in 1943 or later.
 * FigureNest deliberately limits this helper to cohorts whose delayed-retirement
 * credit is 8% per year, avoiding older cohort rules with different credit rates.
 */
export function fullRetirementAgeMonths(birthYear: number): number | undefined {
  if (!Number.isInteger(birthYear) || birthYear < 1943 || birthYear > 2100) return undefined;
  if (birthYear <= 1954) return 66 * 12;
  if (birthYear <= 1959) return 66 * 12 + (birthYear - 1954) * 2;
  return 67 * 12;
}

export function estimateSocialSecurityBenefit(
  pia: number,
  birthYear: number,
  claimingAge: number,
): SocialSecurityEstimate | undefined {
  if (!Number.isFinite(pia) || pia < 0 || pia > 20000) return undefined;
  if (!Number.isInteger(claimingAge) || claimingAge < 62 || claimingAge > 70) return undefined;
  const fraMonths = fullRetirementAgeMonths(birthYear);
  if (fraMonths === undefined) return undefined;

  const claimingMonths = claimingAge * 12;
  const monthsFromFra = claimingMonths - fraMonths;
  let factor: number;

  if (monthsFromFra < 0) {
    const earlyMonths = -monthsFromFra;
    const first36 = Math.min(earlyMonths, 36);
    const additional = Math.max(0, earlyMonths - 36);
    const reduction = first36 * (5 / 900) + additional * (5 / 1200);
    factor = 1 - reduction;
  } else {
    // For birth years 1943 and later, SSA delayed retirement credits are 8% per
    // year, or 2/3 of 1% per month, and stop at age 70.
    factor = 1 + monthsFromFra * (2 / 300);
  }

  return {
    factor,
    monthlyBenefit: pia * factor,
    fullRetirementAgeMonths: fraMonths,
    monthsFromFullRetirementAge: monthsFromFra,
  };
}

export function formatRetirementAge(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return months === 0 ? `${years}` : `${years} years ${months} months`;
}
