export const MAX_SALARY_AMOUNT = 1_000_000_000_000;
export const MAX_SALARY_HOURS_PER_WEEK = 168;
export const MAX_SALARY_WEEKS_PER_YEAR = 53;

export type SalaryPeriod = 'annual' | 'monthly' | 'weekly' | 'hourly';

export type SalaryInputs = {
  annual: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  bonus: number;
  unpaidWeeks: number;
};

export type SalaryResult = {
  total: number;
  monthly: number;
  weekly: number;
  daily: number;
  hourly: number;
  paidWeeks: number;
};

export function parseRequiredSalaryNumber(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value);
}

export function annualizeSalary(
  amount: number,
  period: SalaryPeriod,
  hoursPerWeek: number,
  weeksPerYear: number,
): number | undefined {
  const values = [amount, hoursPerWeek, weeksPerYear];
  if (!values.every((value) => Number.isFinite(value) && value >= 0)) return undefined;
  if (amount > MAX_SALARY_AMOUNT) return undefined;
  if (hoursPerWeek <= 0 || hoursPerWeek > MAX_SALARY_HOURS_PER_WEEK) return undefined;
  if (weeksPerYear <= 0 || weeksPerYear > MAX_SALARY_WEEKS_PER_YEAR) return undefined;

  const annual = period === 'annual'
    ? amount
    : period === 'monthly'
      ? amount * 12
      : period === 'weekly'
        ? amount * weeksPerYear
        : amount * hoursPerWeek * weeksPerYear;

  if (!Number.isFinite(annual) || annual > MAX_SALARY_AMOUNT) return undefined;
  return annual;
}

export function calculateSalary(inputs: SalaryInputs): SalaryResult | undefined {
  const { annual, hoursPerWeek, weeksPerYear, bonus, unpaidWeeks } = inputs;
  const values = [annual, hoursPerWeek, weeksPerYear, bonus, unpaidWeeks];
  if (!values.every((value) => Number.isFinite(value) && value >= 0)) return undefined;
  if (annual > MAX_SALARY_AMOUNT || bonus > MAX_SALARY_AMOUNT) return undefined;
  if (hoursPerWeek <= 0 || hoursPerWeek > MAX_SALARY_HOURS_PER_WEEK) return undefined;
  if (weeksPerYear <= 0 || weeksPerYear > MAX_SALARY_WEEKS_PER_YEAR || unpaidWeeks >= weeksPerYear) return undefined;

  const paidWeeks = weeksPerYear - unpaidWeeks;
  const base = annual * (paidWeeks / weeksPerYear);
  const total = base + bonus;
  if (!Number.isFinite(total) || total > MAX_SALARY_AMOUNT) return undefined;

  const monthly = total / 12;
  const weekly = total / paidWeeks;
  const daily = total / (paidWeeks * 5);
  const hourly = total / (hoursPerWeek * paidWeeks);
  if (![monthly, weekly, daily, hourly].every(Number.isFinite)) return undefined;

  return { total, monthly, weekly, daily, hourly, paidWeeks };
}