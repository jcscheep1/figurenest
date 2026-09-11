const FORMULA_PREFIX = /^[=+@]/;
const SIGNED_NUMBER = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

/**
 * Neutralize spreadsheet-formula-leading text before CSV/XLSX export without
 * corrupting genuine negative numeric values. Leading whitespace is preserved
 * after the neutralizing apostrophe so the exported display value remains
 * inspectable and deterministic.
 */
export function spreadsheetSafeCell(value: unknown): string {
  const text = value == null ? '' : String(value);
  const trimmedStart = text.trimStart();

  if (!trimmedStart) return text;

  if (FORMULA_PREFIX.test(trimmedStart)) {
    return `'${text}`;
  }

  if (trimmedStart.startsWith('-') && !SIGNED_NUMBER.test(trimmedStart)) {
    return `'${text}`;
  }

  return text;
}

export function quoteCsvCell(value: unknown): string {
  const safe = spreadsheetSafeCell(value);
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
