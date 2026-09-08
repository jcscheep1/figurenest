export function formatConverterResult(value: number): string {
  if (!Number.isFinite(value)) return '';
  if (Object.is(value, -0) || value === 0) return '0';

  const magnitude = Math.abs(value);
  if (magnitude < 1e-6 || magnitude >= 1e12) {
    return value.toExponential(6).replace(/\.?(?:0+)e/, 'e').replace(/(\.\d*?[1-9])0+e/, '$1e');
  }

  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 10,
    useGrouping: true,
  }).format(value);
}
