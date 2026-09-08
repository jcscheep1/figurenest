export const MAX_SALARY_AMOUNT = 1_000_000_000_000;
export const MAX_SALARY_HOURS_PER_WEEK = 168;
export const MAX_SALARY_WEEKS_PER_YEAR = 53;

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
