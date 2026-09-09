import type { PriorityOneExpansionSlug } from './priority-one-expansion';
import type { MeasurementSystem } from './units-preferences';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export const priorityOneMeasurementSlugs = new Set<PriorityOneExpansionSlug>([
  'bmr',
  'anorexic-bmi',
  'army-body-fat',
  'bmi',
  'body-fat',
  'calorie',
  'calories-burned',
  'pregnancy-weight-gain',
]);

export const supportsPriorityOneMeasurementSystem = (slug: PriorityOneExpansionSlug) => priorityOneMeasurementSlugs.has(slug);

const metricWeightHeightSlugs = new Set<PriorityOneExpansionSlug>([
  'bmr', 'anorexic-bmi', 'bmi', 'body-fat', 'calorie', 'pregnancy-weight-gain',
]);

export function priorityOneFieldLabel(slug: PriorityOneExpansionSlug, index: number, original: string, system: MeasurementSystem): string {
  if (metricWeightHeightSlugs.has(slug)) {
    if (index === 0) return original.replace(/\(kg\)/, system === 'metric' ? '(kg)' : '(lb)');
    if (index === 1) return original.replace(/\(cm\)/, system === 'metric' ? '(cm)' : '(in)');
  }
  if (slug === 'calories-burned' && index === 1) return original.replace(/\(kg\)/, system === 'metric' ? '(kg)' : '(lb)');
  if (slug === 'army-body-fat' && index <= 3) return original.replace(/\(in\)/, system === 'metric' ? '(cm)' : '(in)');
  return original;
}

export function convertPriorityOneValues(
  slug: PriorityOneExpansionSlug,
  values: string[],
  from: MeasurementSystem,
  to: MeasurementSystem,
): string[] {
  if (from === to || !supportsPriorityOneMeasurementSystem(slug)) return values;
  const next = [...values];
  const convert = (index: number, factor: number) => {
    const raw = values[index];
    if (!raw?.trim()) return;
    const number = Number(raw);
    if (!Number.isFinite(number)) return;
    next[index] = String(Number((number * factor).toFixed(6)));
  };

  if (metricWeightHeightSlugs.has(slug)) {
    convert(0, to === 'imperial' ? 1 / KG_PER_LB : KG_PER_LB);
    convert(1, to === 'imperial' ? 1 / CM_PER_IN : CM_PER_IN);
  } else if (slug === 'calories-burned') {
    convert(1, to === 'imperial' ? 1 / KG_PER_LB : KG_PER_LB);
  } else if (slug === 'army-body-fat') {
    for (let index = 0; index <= 3; index += 1) convert(index, to === 'metric' ? CM_PER_IN : 1 / CM_PER_IN);
  }
  return next;
}

export function normalizePriorityOneValues(slug: PriorityOneExpansionSlug, values: string[], system: MeasurementSystem): string[] {
  if (system === 'metric' || !supportsPriorityOneMeasurementSystem(slug)) {
    if (slug !== 'army-body-fat') return values;
  }
  const next = [...values];
  const convert = (index: number, factor: number) => {
    const raw = values[index];
    if (!raw?.trim()) return;
    const number = Number(raw);
    if (!Number.isFinite(number)) return;
    next[index] = String(number * factor);
  };

  if (system === 'imperial' && metricWeightHeightSlugs.has(slug)) {
    convert(0, KG_PER_LB);
    convert(1, CM_PER_IN);
  } else if (system === 'imperial' && slug === 'calories-burned') {
    convert(1, KG_PER_LB);
  } else if (system === 'metric' && slug === 'army-body-fat') {
    for (let index = 0; index <= 3; index += 1) convert(index, 1 / CM_PER_IN);
  }
  return next;
}

export function localizePriorityOneResult(slug: PriorityOneExpansionSlug, primary: string, system: MeasurementSystem): string {
  if (slug !== 'pregnancy-weight-gain' || system !== 'imperial') return primary;
  return primary.replace(/([0-9]+(?:\.[0-9]+)?)–([0-9]+(?:\.[0-9]+)?) kg/, (_, low: string, high: string) => {
    const lowLb = Number(low) / KG_PER_LB;
    const highLb = Number(high) / KG_PER_LB;
    return `${lowLb.toFixed(1)}–${highLb.toFixed(1)} lb`;
  });
}
