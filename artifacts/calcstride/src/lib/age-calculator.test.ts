import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateAge } from './age-calculator';

test('clamps a leap-day anniversary to February 28 in a non-leap year', () => {
  const result = calculateAge('2020-02-29', '2021-02-28');
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.primary, '1 year, 0 months, 0 days');
  assert.equal(result.nextBirthday, '2021-02-28');
  assert.equal(result.daysUntilNextBirthday, 0);
});

test('uses February 29 again when the next birthday year is a leap year', () => {
  const result = calculateAge('2020-02-29', '2024-02-28');
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.primary, '3 years, 11 months, 30 days');
  assert.equal(result.nextBirthday, '2024-02-29');
  assert.equal(result.daysUntilNextBirthday, 1);
});

test('keeps ordinary birthdays and completed age totals stable', () => {
  const result = calculateAge('1990-06-14', '2026-09-08');
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.primary, '36 years, 2 months, 25 days');
  assert.equal(result.totalMonths, 434);
  assert.equal(result.nextBirthday, '2027-06-14');
});

test('normalizes month-end borrowing across a shorter February', () => {
  const leapYear = calculateAge('2024-01-31', '2024-03-01');
  assert.equal(leapYear.ok, true);
  if (!leapYear.ok) return;
  assert.equal(leapYear.primary, '0 years, 0 months, 30 days');
  assert.equal(leapYear.days, 30);
  assert.equal(leapYear.totalDays, 30);

  const commonYear = calculateAge('2023-01-31', '2023-03-01');
  assert.equal(commonYear.ok, true);
  if (!commonYear.ok) return;
  assert.equal(commonYear.primary, '0 years, 0 months, 29 days');
  assert.equal(commonYear.days, 29);
  assert.equal(commonYear.totalDays, 29);
});

test('handles the zero-age boundary without rolling the birthday forward', () => {
  const result = calculateAge('2026-09-09', '2026-09-09');
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.primary, '0 years, 0 months, 0 days');
  assert.equal(result.totalMonths, 0);
  assert.equal(result.totalWeeks, 0);
  assert.equal(result.totalDays, 0);
  assert.equal(result.nextBirthday, '2026-09-09');
  assert.equal(result.daysUntilNextBirthday, 0);
});

test('honors Gregorian century leap-year rules', () => {
  const leapCentury = calculateAge('2000-02-29', '2001-02-28');
  assert.equal(leapCentury.ok, true);
  if (!leapCentury.ok) return;
  assert.equal(leapCentury.primary, '1 year, 0 months, 0 days');

  assert.equal(calculateAge('1900-02-29', '1901-02-28').ok, false);
  assert.equal(calculateAge('2100-02-29', '2101-02-28').ok, false);
});

test('rejects blank, malformed, impossible, and future dates', () => {
  assert.equal(calculateAge('', '2026-09-09').ok, false);
  assert.equal(calculateAge('2026-09-09', '').ok, false);
  assert.equal(calculateAge(' 2026-09-09 ', '2026-09-09').ok, false);
  assert.equal(calculateAge('09/09/2026', '2026-09-09').ok, false);
  assert.equal(calculateAge('2026-02-30', '2026-09-08').ok, false);
  assert.equal(calculateAge('2027-01-01', '2026-09-08').ok, false);
});
