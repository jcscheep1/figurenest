import {
  calculatePhaseThreeC as calculatePhaseThreeCBase,
  type PhaseThreeCResult,
  type PhaseThreeCSlug,
} from './phase-three-c-implementation';

export * from './phase-three-c-implementation';

const isStrictCalendarDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
};

export function calculatePhaseThreeC(slug: PhaseThreeCSlug, values: readonly string[]): PhaseThreeCResult {
  if (slug === 'pregnancy-conception' && !isStrictCalendarDate(values[0] ?? '')) {
    const message = 'Use a valid last-period date, cycle length of 21–45 days, and period length of 1–10 days.';
    return { primary: message, summary: message, details: [], error: message };
  }

  return calculatePhaseThreeCBase(slug, values);
}
