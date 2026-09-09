export type VoltageDropLengthUnit = 'ft' | 'm';

export const FEET_PER_METRE = 3.280839895013123;

export function normalizeVoltageDropValues(values: readonly string[]): string[] {
  if (values.length !== 5) return [...values];

  const [current, length, lengthUnit, resistance, phase] = values;
  const parsedLength = Number(length);
  const lengthInFeet = lengthUnit === 'm' && Number.isFinite(parsedLength)
    ? parsedLength * FEET_PER_METRE
    : parsedLength;

  return [current, String(lengthInFeet), resistance, phase];
}
