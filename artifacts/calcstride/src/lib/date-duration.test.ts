import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateDateArithmetic, calculateDateDuration, dateDurationContent } from './date-duration';

const success = (startDate: string, endDate: string, includeEndDate = false) => {
  const result = calculateDateDuration({ startDate, endDate, includeEndDate });
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error(result.error);
  return result;
};

test('forward and reverse dates have equal magnitudes and explicit order', () => {
  const forward = success('2023-05-10', '2025-08-15');
  const reverse = success('2025-08-15', '2023-05-10');
  assert.deepEqual(reverse.calendar, forward.calendar);
  assert.deepEqual(reverse.totals, forward.totals);
  assert.equal(forward.order, 'forward');
  assert.equal(reverse.order, 'reverse');
  assert.match(reverse.summary, /reverse order/i);
});

test('same date supports exclusive and inclusive counting', () => {
  const exclusive = success('2026-08-15', '2026-08-15');
  assert.equal(exclusive.order, 'same');
  assert.deepEqual(exclusive.calendar, { years: 0, months: 0, days: 0 });
  assert.equal(exclusive.totals.days, 0);
  assert.deepEqual(exclusive.totals, {
    days: 0,
    wholeWeeks: 0,
    remainingWeekDays: 0,
    totalCalendarMonths: 0,
    remainingMonthDays: 0,
  });
  assert.match(exclusive.summary, /start date but not the end date/i);

  const inclusive = success('2026-08-15', '2026-08-15', true);
  assert.deepEqual(inclusive.calendar, { years: 0, months: 0, days: 1 });
  assert.equal(inclusive.totals.days, 1);
  assert.equal(inclusive.totals.remainingMonthDays, 1);
  assert.match(inclusive.summary, /both selected dates/i);
});

test('inclusive counting adds exactly one calendar day', () => {
  const exclusive = success('2024-01-01', '2024-01-08');
  const inclusive = success('2024-01-01', '2024-01-08', true);
  assert.equal(exclusive.totals.days, 7);
  assert.equal(inclusive.totals.days, 8);
  assert.equal(inclusive.totals.wholeWeeks, 1);
  assert.equal(inclusive.totals.remainingWeekDays, 1);
});

test('leap years and February 29 anniversaries use clamped arithmetic', () => {
  assert.equal(success('2024-02-28', '2024-03-01').totals.days, 2);
  assert.equal(success('2023-02-28', '2023-03-01').totals.days, 1);
  const anniversary = success('2020-02-29', '2021-02-28');
  assert.deepEqual(anniversary.calendar, { years: 1, months: 0, days: 0 });
  assert.equal(anniversary.totals.days, 365);
});

test('month ends clamp before remaining days are counted', () => {
  assert.deepEqual(success('2024-01-31', '2024-02-29').calendar, { years: 0, months: 1, days: 0 });
  assert.deepEqual(success('2023-01-31', '2023-02-28').calendar, { years: 0, months: 1, days: 0 });
  const leapMonthEnd = success('2024-01-31', '2024-03-30');
  assert.deepEqual(leapMonthEnd.calendar, { years: 0, months: 1, days: 30 });
  assert.equal(leapMonthEnd.totals.days, 59);
  assert.equal(leapMonthEnd.totals.totalCalendarMonths, 1);
  assert.equal(leapMonthEnd.totals.remainingMonthDays, 30);

  const commonMonthEnd = success('2023-01-31', '2023-03-30');
  assert.deepEqual(commonMonthEnd.calendar, { years: 0, months: 1, days: 30 });
  assert.equal(commonMonthEnd.totals.days, 58);
  assert.equal(commonMonthEnd.totals.totalCalendarMonths, 1);
  assert.equal(commonMonthEnd.totals.remainingMonthDays, 30);
});

test('whole-month view is independently consistent when year-first leap-day clamping differs', () => {
  const result = success('2020-02-29', '2021-03-29');
  assert.deepEqual(result.calendar, { years: 1, months: 1, days: 1 });
  assert.equal(result.totals.days, 394);
  assert.equal(result.totals.totalCalendarMonths, 13);
  assert.equal(result.totals.remainingMonthDays, 0);
  assert.deepEqual(
    result.breakdown.find((line) => line.label === 'Whole months and days'),
    { label: 'Whole months and days', value: '13 months, 0 days' },
  );
});

test('inclusive counting carries consistently across month and year boundaries', () => {
  const monthEnd = success('2024-01-31', '2024-02-29', true);
  assert.deepEqual(monthEnd.calendar, { years: 0, months: 1, days: 1 });
  assert.equal(monthEnd.totals.days, 30);
  assert.equal(monthEnd.totals.totalCalendarMonths, 1);
  assert.equal(monthEnd.totals.remainingMonthDays, 1);

  const yearEnd = success('2023-12-31', '2024-01-01', true);
  assert.deepEqual(yearEnd.calendar, { years: 0, months: 0, days: 2 });
  assert.equal(yearEnd.totals.days, 2);
  assert.equal(yearEnd.totals.remainingMonthDays, 2);
});

test('reverse month-end dates preserve every forward breakdown and counting convention', () => {
  for (const includeEndDate of [false, true]) {
    const forward = success('2020-02-29', '2021-03-29', includeEndDate);
    const reverse = success('2021-03-29', '2020-02-29', includeEndDate);
    assert.deepEqual(reverse.calendar, forward.calendar);
    assert.deepEqual(reverse.totals, forward.totals);
    assert.equal(reverse.order, 'reverse');
    assert.match(reverse.summary, /reverse order/i);
  }
});

test('year boundaries and DST-adjacent calendar dates retain exact day totals', () => {
  assert.deepEqual(success('2023-12-31', '2024-01-01').calendar, { years: 0, months: 0, days: 1 });
  assert.equal(success('2023-12-31', '2024-12-31').totals.days, 366);
  assert.equal(success('2024-12-31', '2025-12-31').totals.days, 365);
  assert.equal(success('2024-03-09', '2024-03-11').totals.days, 2);
  assert.equal(success('2024-11-02', '2024-11-04').totals.days, 2);
});

test('invalid formats and impossible dates return errors without numeric leakage', () => {
  for (const [startDate, endDate] of [
    ['2024-2-01', '2024-03-01'],
    ['not-a-date', '2024-03-01'],
    ['2023-02-29', '2024-03-01'],
    ['2024-02-30', '2024-03-01'],
    ['2024-13-01', '2024-03-01'],
    ['10000-01-01', '2024-03-01'],
  ]) {
    const result = calculateDateDuration({ startDate, endDate, includeEndDate: false });
    assert.equal(result.ok, false);
    assert.doesNotMatch(JSON.stringify(result), /NaN|Infinity/);
  }
});

test('the conventional four-digit calendar year range is supported', () => {
  const result = success('0001-01-01', '9999-12-31', true);
  assert.equal(result.calendar.years, 9999);
  assert.equal(result.calendar.months, 0);
  assert.equal(result.calendar.days, 0);
  assert.ok(Number.isFinite(result.totals.days));
  assert.equal(calculateDateDuration({ startDate: '0000-01-01', endDate: '2024-01-01', includeEndDate: false }).ok, false);
});

test('date calculator adds calendar units with Gregorian month-end and leap-day clamping', () => {
  const result = calculateDateArithmetic({
    startDate: '2024-01-31', direction: 'add', years: 1, months: 1, weeks: 1, days: 2,
  });
  assert.deepEqual(result, {
    ok: true,
    direction: 'add',
    startDate: '2024-01-31',
    resultDate: '2025-03-09',
    summary: 'Adding 1 year, 1 month, 1 week, 2 days to 2024-01-31 gives 2025-03-09.',
    breakdown: [
      { label: 'Start date', value: '2024-01-31' },
      { label: 'Direction', value: 'Add time' },
      { label: 'Calendar adjustment', value: '1 year, 1 month' },
      { label: 'Day adjustment', value: '1 week, 2 days' },
      { label: 'Result date', value: '2025-03-09' },
    ],
  });
  const anniversary = calculateDateArithmetic({
    startDate: '2020-02-29', direction: 'add', years: 1, months: 0, weeks: 0, days: 0,
  });
  assert.equal(anniversary.ok, true);
  if (!anniversary.ok) throw new Error(anniversary.error);
  assert.equal(anniversary.resultDate, '2021-02-28');
});

test('date calculator subtracts exactly across boundaries and rejects invalid or out-of-range requests', () => {
  const result = calculateDateArithmetic({
    startDate: '2024-03-01', direction: 'subtract', years: 0, months: 1, weeks: 0, days: 1,
  });
  assert.equal(result.ok && result.resultDate, '2024-01-31');
  assert.equal(calculateDateArithmetic({
    startDate: '0001-01-01', direction: 'subtract', years: 0, months: 0, weeks: 0, days: 1,
  }).ok, false);
  assert.equal(calculateDateArithmetic({
    startDate: '9999-12-31', direction: 'add', years: 1, months: 0, weeks: 0, days: 0,
  }).ok, false);
  assert.equal(calculateDateArithmetic({
    startDate: '2024-01-01', direction: 'add', years: -1, months: 0, weeks: 0, days: 0,
  }).ok, false);
});

test('shared content is substantial and links only the relevant date tools', () => {
  assert.ok(dateDurationContent.examples.length >= 3);
  assert.ok(dateDurationContent.faqs.length >= 8);
  assert.deepEqual(dateDurationContent.relatedToolSlugs, ['age', 'working-days']);
  assert.match(dateDurationContent.methodology.assumptions, /vary in length/i);
  assert.match(dateDurationContent.methodology.limitation, /not elapsed clock hours/i);
});