export type DateDurationOrder = 'forward' | 'reverse' | 'same';

export type DateDurationResult =
  | { ok: false; error: string }
  | {
      ok: true;
      order: DateDurationOrder;
      primary: string;
      summary: string;
      calendar: { years: number; months: number; days: number };
      totals: {
        days: number;
        wholeWeeks: number;
        remainingWeekDays: number;
        totalCalendarMonths: number;
        remainingMonthDays: number;
      };
      breakdown: { label: string; value: string }[];
    };

export type DateArithmeticDirection = 'add' | 'subtract';

export type DateArithmeticResult =
  | { ok: false; error: string }
  | {
      ok: true;
      direction: DateArithmeticDirection;
      startDate: string;
      resultDate: string;
      summary: string;
      breakdown: { label: string; value: string }[];
    };

type CalendarDate = { year: number; month: number; day: number };

const DAY_MS = 86_400_000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const daysInMonth = (year: number, month: number) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};

const parseCalendarDate = (value: string): CalendarDate | undefined => {
  const match = DATE_PATTERN.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return undefined;
  return { year, month, day };
};

const formatCalendarDate = ({ year, month, day }: CalendarDate) =>
  `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const utcDaySerial = ({ year, month, day }: CalendarDate) => {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getTime() / DAY_MS;
};

const compareDates = (a: CalendarDate, b: CalendarDate) => utcDaySerial(a) - utcDaySerial(b);

const addYearsClamped = (date: CalendarDate, years: number, enforceBounds = true): CalendarDate => {
  const year = date.year + years;
  if (enforceBounds && (year < 1 || year > 9999)) throw new RangeError('Date is outside the supported calendar range.');
  return { year, month: date.month, day: Math.min(date.day, daysInMonth(year, date.month)) };
};

const addMonthsClamped = (date: CalendarDate, months: number, enforceBounds = true): CalendarDate => {
  const monthIndex = date.year * 12 + date.month - 1 + months;
  const year = Math.floor(monthIndex / 12);
  if (enforceBounds && (year < 1 || year > 9999)) throw new RangeError('Date is outside the supported calendar range.');
  const month = monthIndex - year * 12 + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
};

const addCalendarDays = (date: CalendarDate, days: number, enforceBounds = true): CalendarDate => {
  const value = new Date(0);
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCFullYear(date.year, date.month - 1, date.day + days);
  if (!Number.isFinite(value.getTime())) throw new RangeError('Date is outside the supported calendar range.');
  const result = { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() };
  if (enforceBounds && (result.year < 1 || result.year > 9999)) throw new RangeError('Date is outside the supported calendar range.');
  return result;
};

const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'}`;

const calendarLabel = ({ years, months, days }: { years: number; months: number; days: number }) =>
  [plural(years, 'year'), plural(months, 'month'), plural(days, 'day')].join(', ');

const validAmount = (value: number) => Number.isSafeInteger(value) && value >= 0;

export function calculateDateArithmetic({
  startDate,
  direction,
  years,
  months,
  weeks,
  days,
}: {
  startDate: string;
  direction: DateArithmeticDirection;
  years: number;
  months: number;
  weeks: number;
  days: number;
}): DateArithmeticResult {
  const start = parseCalendarDate(startDate);
  if (!start) return { ok: false, error: 'Enter a real start date in YYYY-MM-DD format.' };
  if (direction !== 'add' && direction !== 'subtract') return { ok: false, error: 'Choose whether to add or subtract time.' };
  if (![years, months, weeks, days].every(validAmount)) {
    return { ok: false, error: 'Enter whole numbers of 0 or greater for years, months, weeks, and days.' };
  }

  const sign = direction === 'add' ? 1 : -1;
  const dayOffset = weeks * 7 + days;
  if (!Number.isSafeInteger(dayOffset)) return { ok: false, error: 'The requested date is outside the supported calendar range.' };

  try {
    // Calendar units are applied first, one unit at a time, then exact seven-day weeks and days.
    const afterYears = addYearsClamped(start, sign * years);
    const afterMonths = addMonthsClamped(afterYears, sign * months);
    const result = addCalendarDays(afterMonths, sign * dayOffset);
    const resultDate = formatCalendarDate(result);
    const action = direction === 'add' ? 'Adding' : 'Subtracting';
    const interval = [plural(years, 'year'), plural(months, 'month'), plural(weeks, 'week'), plural(days, 'day')].join(', ');
    return {
      ok: true,
      direction,
      startDate: formatCalendarDate(start),
      resultDate,
      summary: `${action} ${interval} ${direction === 'add' ? 'to' : 'from'} ${formatCalendarDate(start)} gives ${resultDate}.`,
      breakdown: [
        { label: 'Start date', value: formatCalendarDate(start) },
        { label: 'Direction', value: direction === 'add' ? 'Add time' : 'Subtract time' },
        { label: 'Calendar adjustment', value: `${plural(years, 'year')}, ${plural(months, 'month')}` },
        { label: 'Day adjustment', value: `${plural(weeks, 'week')}, ${plural(days, 'day')}` },
        { label: 'Result date', value: resultDate },
      ],
    };
  } catch (error) {
    return { ok: false, error: error instanceof RangeError ? error.message : 'The requested date is outside the supported calendar range.' };
  }
}

export function calculateDateDuration({
  startDate,
  endDate,
  includeEndDate,
}: {
  startDate: string;
  endDate: string;
  includeEndDate: boolean;
}): DateDurationResult {
  const start = parseCalendarDate(startDate);
  const end = parseCalendarDate(endDate);
  if (!start || !end) {
    return { ok: false, error: 'Enter real calendar dates in YYYY-MM-DD format.' };
  }

  const comparison = compareDates(start, end);
  const order: DateDurationOrder = comparison < 0 ? 'forward' : comparison > 0 ? 'reverse' : 'same';
  const low = comparison <= 0 ? start : end;
  const high = comparison <= 0 ? end : start;
  const boundary = includeEndDate ? addCalendarDays(high, 1, false) : high;
  const totalDays = utcDaySerial(boundary) - utcDaySerial(low);

  let years = boundary.year - low.year;
  if (compareDates(addYearsClamped(low, years, false), boundary) > 0) years--;
  const afterYears = addYearsClamped(low, years, false);

  let months = (boundary.year - afterYears.year) * 12 + boundary.month - afterYears.month;
  if (compareDates(addMonthsClamped(afterYears, months, false), boundary) > 0) months--;
  const afterMonths = addMonthsClamped(afterYears, months, false);
  const days = utcDaySerial(boundary) - utcDaySerial(afterMonths);

  // This is a separate decomposition, not years × 12 plus the year-first remainder.
  // Clamping can make those differ (for example, when a leap-day span crosses into March).
  let totalCalendarMonths = (boundary.year - low.year) * 12 + boundary.month - low.month;
  if (compareDates(addMonthsClamped(low, totalCalendarMonths, false), boundary) > 0) totalCalendarMonths--;
  const afterTotalMonths = addMonthsClamped(low, totalCalendarMonths, false);
  const remainingMonthDays = utcDaySerial(boundary) - utcDaySerial(afterTotalMonths);

  if (
    ![totalDays, years, months, days, totalCalendarMonths, remainingMonthDays].every(Number.isFinite)
    || totalDays < 0
    || years < 0
    || months < 0
    || days < 0
    || totalCalendarMonths < 0
    || remainingMonthDays < 0
  ) {
    return { ok: false, error: 'The selected dates are outside the supported calendar range.' };
  }

  const calendar = { years, months, days };
  const wholeWeeks = Math.floor(totalDays / 7);
  const remainingWeekDays = totalDays % 7;
  const countNote = includeEndDate
    ? 'counting both selected dates'
    : 'counting the start date but not the end date';
  const orderNote = order === 'reverse'
    ? 'The dates were entered in reverse order, so the calculator sorted them and reports the positive duration.'
    : order === 'same'
      ? 'The start and end dates are the same.'
      : 'The dates are in forward order.';
  const primary = calendarLabel(calendar);
  const summary = `${primary} (${plural(totalDays, 'total day')}, ${countNote}). ${orderNote}`;

  return {
    ok: true,
    order,
    primary,
    summary,
    calendar,
    totals: {
      days: totalDays,
      wholeWeeks,
      remainingWeekDays,
      totalCalendarMonths,
      remainingMonthDays,
    },
    breakdown: [
      { label: 'Calendar duration', value: primary },
      { label: 'Total days', value: plural(totalDays, 'day') },
      { label: 'Weeks and days', value: `${plural(wholeWeeks, 'week')}, ${plural(remainingWeekDays, 'day')}` },
      { label: 'Whole months and days', value: `${plural(totalCalendarMonths, 'month')}, ${plural(remainingMonthDays, 'day')}` },
      { label: 'Date order', value: order === 'reverse' ? 'Reverse (dates sorted for calculation)' : order === 'same' ? 'Same date' : 'Forward' },
      {
        label: 'Counting method',
        value: includeEndDate
          ? 'Inclusive: both endpoint dates counted'
          : 'Exclusive end: start date counted, end date not counted',
      },
    ],
  };
}

export const dateDurationContent = {
  methodology: {
    method: 'For the Day Counter, the calculator sorts the two dates, counts UTC calendar-day boundaries, then adds clamped calendar years and months before counting remaining days. For the Date Calculator, it applies years, then months, then seven-day weeks and days to the chosen start date.',
    assumptions: 'The Day Counter excludes the end date by default; inclusive counting adds one calendar day. The Date Calculator has an explicit add or subtract direction. Calendar years and months vary in length, so they are not treated as fixed numbers of days.',
    limitation: 'This compares Gregorian calendar dates, not elapsed clock hours. Times of day, time zones, daylight-saving changes, holidays, business days, and working schedules are not part of the calculation. Inputs and results must stay between 0001-01-01 and 9999-12-31.',
  },
  instructions: [
    'Choose Days between dates to compare a start date and end date, or Add or subtract dates to calculate a resulting date.',
    'For the Day Counter, leave inclusive counting off to exclude the end date, or turn it on to count both endpoint dates.',
    'For the Date Calculator, choose Add time or Subtract time, enter whole numbers for each unit, and read the resulting calendar date.',
    'Read the calendar duration first, then use the total-day, week, and month breakdowns for planning. If dates are reversed, check the displayed reverse-order note.',
  ],
  examples: [
    {
      title: 'One week between dates',
      input: 'January 1, 2024 to January 8, 2024, excluding the end date',
      result: '0 years, 0 months, 7 days; 7 total days, or 1 whole week.',
    },
    {
      title: 'Leap-year month end',
      input: 'January 31, 2024 to February 29, 2024, excluding the end date',
      result: '1 calendar month and 29 total days because month addition clamps to February 29.',
    },
    {
      title: 'Leap-day anniversary',
      input: 'February 29, 2020 to February 28, 2021, excluding the end date',
      result: '1 calendar year and 365 total days because the anniversary clamps to February 28.',
    },
    {
      title: 'Inclusive same-day count',
      input: 'August 15, 2026 to August 15, 2026, including the end date',
      result: '0 years, 0 months, 1 day; the single selected calendar date is counted.',
    },
    {
      title: 'Add time from a month end',
      input: 'Add 1 month and 2 days to January 31, 2024',
      result: 'March 2, 2024. The month step clamps January 31 to February 29, then two exact calendar days are added.',
    },
    {
      title: 'Subtract across leap day',
      input: 'Subtract 1 day from March 1, 2024',
      result: 'February 29, 2024, because 2024 is a Gregorian leap year.',
    },
  ],
  faqs: [
    {
      question: 'Does the calculator include the end date?',
      answer: 'Not by default. The standard result excludes the end date. Turn on inclusive counting to add one calendar day and count both endpoint dates.',
    },
    {
      question: 'Can I add or subtract time from a date?',
      answer: 'Yes. Select Add or subtract dates, choose the direction, and enter whole years, months, weeks, and days. The result applies years first, months second, then weeks and days.',
    },
    {
      question: 'What does month-end clamping mean when adding dates?',
      answer: 'If the destination month has fewer days, the result uses that month’s last real day. For example, adding one month to January 31, 2024 produces February 29, 2024; in 2023 it produces February 28.',
    },
    {
      question: 'What happens if I enter the dates in reverse order?',
      answer: 'The calculator identifies reverse order, sorts the dates for the magnitude calculation, and clearly labels the positive result as reversed.',
    },
    {
      question: 'How are leap years handled?',
      answer: 'Gregorian leap-year rules are applied, including February 29 in divisible-by-4 years except century years that are not divisible by 400.',
    },
    {
      question: 'How is a February 29 anniversary calculated?',
      answer: 'Calendar arithmetic clamps February 29 to February 28 when the anniversary year is not a leap year, producing a predictable whole-year result.',
    },
    {
      question: 'Why can a calendar month have 28, 29, 30, or 31 days?',
      answer: 'Calendar months vary in length. The calculator adds whole calendar months with month-end clamping instead of assuming every month has a fixed day count.',
    },
    {
      question: 'Does daylight saving time change the answer?',
      answer: 'No. Total days come from UTC calendar-day serials, so a 23-hour or 25-hour local day around a daylight-saving transition does not alter the result.',
    },
    {
      question: 'Is this an elapsed-hours calculator?',
      answer: 'No. It calculates the duration between calendar dates, not elapsed clock hours. It does not use times of day or local time zones.',
    },
    {
      question: 'Why can total days differ for the same number of calendar years or months?',
      answer: 'Years and months do not have fixed lengths. Leap years and different month lengths mean equal calendar-unit durations can contain different total-day counts.',
    },
    {
      question: 'What date format and range are supported?',
      answer: 'Inputs must be real dates written as YYYY-MM-DD, with four-digit years from 0001 through 9999. Impossible dates such as February 30 are rejected.',
    },
  ],
  relatedToolSlugs: ['age', 'working-days'],
} as const;