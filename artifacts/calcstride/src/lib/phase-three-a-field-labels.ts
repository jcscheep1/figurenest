import type { PhaseThreeASlug } from './phase-three-a';

const ohmsLawKnownValueLabels: Record<string, readonly [string, string]> = {
  voltage: ['Current (A)', 'Resistance (Ω)'],
  current: ['Voltage (V)', 'Resistance (Ω)'],
  resistance: ['Voltage (V)', 'Current (A)'],
  power: ['Voltage (V)', 'Current (A)'],
};

export function phaseThreeAFieldLabel(
  slug: PhaseThreeASlug,
  fieldKey: string,
  fallbackLabel: string,
  values: readonly string[],
): string {
  if (slug !== 'ohms-law') return fallbackLabel;
  const labels = ohmsLawKnownValueLabels[values[0] ?? ''];
  if (!labels) return fallbackLabel;
  if (fieldKey === 'first') return labels[0];
  if (fieldKey === 'second') return labels[1];
  return fallbackLabel;
}
