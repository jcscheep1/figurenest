import assert from 'node:assert/strict';
import test from 'node:test';
import { estimateSocialSecurityBenefit, formatRetirementAge, fullRetirementAgeMonths } from './social-security';

test('Social Security full retirement age follows SSA birth-year cohorts', () => {
  assert.equal(fullRetirementAgeMonths(1954), 66 * 12);
  assert.equal(fullRetirementAgeMonths(1956), 66 * 12 + 4);
  assert.equal(fullRetirementAgeMonths(1959), 66 * 12 + 10);
  assert.equal(fullRetirementAgeMonths(1960), 67 * 12);
});

test('Social Security delayed credits are cohort-aware instead of assuming FRA 67 for everyone', () => {
  const born1956At70 = estimateSocialSecurityBenefit(2000, 1956, 70);
  assert.ok(born1956At70);
  assert.ok(Math.abs(born1956At70.factor - 1.2933333333333334) < 1e-12);
  assert.ok(Math.abs(born1956At70.monthlyBenefit - 2586.666666666667) < 1e-9);

  const born1959At67 = estimateSocialSecurityBenefit(2000, 1959, 67);
  assert.ok(born1959At67);
  assert.ok(Math.abs(born1959At67.factor - 1.0133333333333334) < 1e-12);
});

test('Social Security early-retirement reduction matches the FRA-67 cohort at age 62', () => {
  const result = estimateSocialSecurityBenefit(2000, 1964, 62);
  assert.ok(result);
  assert.ok(Math.abs(result.factor - 0.7) < 1e-12);
  assert.ok(Math.abs(result.monthlyBenefit - 1400) < 1e-9);
});

test('Social Security keeps the FRA-67 default deterministic and rejects unsupported input', () => {
  assert.equal(estimateSocialSecurityBenefit(2000, 1960, 67)?.monthlyBenefit, 2000);
  assert.equal(estimateSocialSecurityBenefit(2000, 1960, 62.5), undefined);
  assert.equal(estimateSocialSecurityBenefit(2000, 1942, 67), undefined);
  assert.equal(formatRetirementAge(66 * 12 + 4), '66 years 4 months');
  assert.equal(formatRetirementAge(67 * 12), '67');
});
