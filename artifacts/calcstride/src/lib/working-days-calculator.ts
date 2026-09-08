const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const STANDARD_WORKDAYS = '1,2,3,4,5';

const parseIsoDate = (value: string) => {
  if (!ISO_DATE.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return null;
  return parsed;
};

export type WorkingDaysResult =
  | { ok: true; workingDays: number; calendarDays: number; nonWorkingScheduleDays: number; excludedDates: number }
  | { ok: false; error: string };

export function calculateWorkingDays({
  start,
  end,
  advanced,
  holidays,
  workdays,
}: {
  start: string;
  end: string;
  advanced: boolean;
  holidays: string;
  workdays: string;
}): WorkingDaysResult {
  const firstInput = parseIsoDate(start);
  const secondInput = parseIsoDate(end);
  if (!firstInput || !secondInput) return { ok: false, error: 'Enter valid dates' };

  const schedule = advanced ? workdays : STANDARD_WORKDAYS;
  const scheduleTokens = schedule.split(',').map((value) => value.trim());
  if (!scheduleTokens.length || scheduleTokens.some((value) => value === '')) {
    return { ok: false, error: 'Choose a valid working-week schedule' };
  }
  const activeDays = scheduleTokens.map((value) => Number(value));
  if (activeDays.some((value) => !Number.isInteger(value) || value < 0 || value > 6)) {
    return { ok: false, error: 'Choose a valid working-week schedule' };
  }
  const active = new Set(activeDays);

  const first = firstInput <= secondInput ? firstInput : secondInput;
  const last = firstInput <= secondInput ? secondInput : firstInput;
  const calendarDays = Math.floor((last.getTime() - first.getTime()) / DAY_MS) + 1;

  const fullWeeks = Math.floor(calendarDays / 7);
  const remainder = calendarDays % 7;
  let workingDays = fullWeeks * active.size;
  for (let offset = 0; offset < remainder; offset += 1) {
    const weekday = (first.getUTCDay() + offset) % 7;
    if (active.has(weekday)) workingDays += 1;
  }

  let excludedDates = 0;
  if (advanced) {
    const tokens = holidays.split(/[,\s]+/).filter(Boolean);
    const unique = new Set(tokens);
    for (const token of unique) {
      const excluded = parseIsoDate(token);
      if (!excluded) return { ok: false, error: `Invalid excluded date: ${token}. Use YYYY-MM-DD.` };
      if (excluded < first || excluded > last || !active.has(excluded.getUTCDay())) continue;
      excludedDates += 1;
    }
    workingDays -= excludedDates;
  }

  return {
    ok: true,
    workingDays,
    calendarDays,
    nonWorkingScheduleDays: calendarDays - (workingDays + excludedDates),
    excludedDates,
  };
}
