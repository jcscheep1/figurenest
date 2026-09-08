export type AgeCalculationResult =
  | { ok: false; error: string }
  | {
      ok: true;
      primary: string;
      years: number;
      months: number;
      days: number;
      totalMonths: number;
      totalWeeks: number;
      totalDays: number;
      bornOn: string;
      nextBirthday: string;
      daysUntilNextBirthday: number;
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
  const value = new Date(0);
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCFullYear(year, month - 1, day);
  return value.getTime() / DAY_MS;
};

const compareDates = (a: CalendarDate, b: CalendarDate) => utcDaySerial(a) - utcDaySerial(b);

const addYearsClamped = (date: CalendarDate, years: number): CalendarDate => {
  const year = date.year + years;
  return { year, month: date.month, day: Math.min(date.day, daysInMonth(year, date.month)) };
};

const addMonthsClamped = (date: CalendarDate, months: number): CalendarDate => {
  const monthIndex = date.year * 12 + date.month - 1 + months;
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex - year * 12 + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
};

const weekdayName = (date: CalendarDate) => {
  const value = new Date(0);
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCFullYear(date.year, date.month - 1, date.day);
  return value.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
};

const birthdayInYear = (birth: CalendarDate, year: number): CalendarDate => ({
  year,
  month: birth.month,
  day: Math.min(birth.day, daysInMonth(year, birth.month)),
});

export function calculateAge(birthDate: string, asOfDate: string): AgeCalculationResult {
  const birth = parseCalendarDate(birthDate);
  const asOf = parseCalendarDate(asOfDate);
  if (!birth || !asOf) return { ok: false, error: 'Enter real dates in YYYY-MM-DD format.' };
  if (compareDates(birth, asOf) > 0) return { ok: false, error: 'Date of birth must not be after the age-as-of date.' };

  let years = asOf.year - birth.year;
  if (compareDates(addYearsClamped(birth, years), asOf) > 0) years--;
  const afterYears = addYearsClamped(birth, years);

  let months = (asOf.year - afterYears.year) * 12 + asOf.month - afterYears.month;
  if (compareDates(addMonthsClamped(afterYears, months), asOf) > 0) months--;
  const afterMonths = addMonthsClamped(afterYears, months);
  const days = utcDaySerial(asOf) - utcDaySerial(afterMonths);

  const totalDays = utcDaySerial(asOf) - utcDaySerial(birth);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;

  let nextBirthday = birthdayInYear(birth, asOf.year);
  if (compareDates(nextBirthday, asOf) < 0) nextBirthday = birthdayInYear(birth, asOf.year + 1);
  const daysUntilNextBirthday = utcDaySerial(nextBirthday) - utcDaySerial(asOf);

  return {
    ok: true,
    primary: `${years} years, ${months} months, ${days} days`,
    years,
    months,
    days,
    totalMonths,
    totalWeeks,
    totalDays,
    bornOn: weekdayName(birth),
    nextBirthday: formatCalendarDate(nextBirthday),
    daysUntilNextBirthday,
  };
}
