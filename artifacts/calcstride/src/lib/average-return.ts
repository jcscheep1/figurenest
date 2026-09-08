import type { PhaseTwoResult } from './phase-two-expansion';

const bad = (error: string): PhaseTwoResult => ({ primary: error, summary: error, details: [], error });
const fmt = (value: number, digits = 4) => value.toLocaleString('en-US', { maximumFractionDigits: digits });

const parseReturn = (value: string): number | null => {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= 1e12 ? parsed : null;
};

export function calculateAverageReturn(values: string[]): PhaseTwoResult {
  if (values.length !== 3) return bad('Complete every field; blank values cannot be calculated.');
  const returns = values.map(parseReturn);
  if (returns.some((value) => value === null)) return bad('Use finite return percentages within one trillion.');

  const [first, second, third] = returns as number[];
  if ([first, second, third].some((value) => value < -100)) {
    return bad('A period return cannot be less than -100%.');
  }

  const arithmetic = (first + second + third) / 3;
  const growthFactor = (1 + first / 100) * (1 + second / 100) * (1 + third / 100);
  const compound = (Math.cbrt(growthFactor) - 1) * 100;
  if (!Number.isFinite(arithmetic) || !Number.isFinite(compound)) return bad('The calculation exceeds safe numeric bounds.');

  return {
    primary: `${fmt(arithmetic)}%`,
    summary: 'Arithmetic average return.',
    details: [{ label: 'Compound annual return', value: `${fmt(compound)}%` }],
  };
}
