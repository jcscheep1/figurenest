type FieldA11yProps = {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
};

const safeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-');

/**
 * Provides deterministic ids and shared ARIA relationships for calculator
 * controls. A calculation-level error is associated with each contributing
 * field because the calculation engines do not identify a single culprit.
 */
export function calculatorFieldA11y(calculator: string, error?: string) {
  const base = `calculator-${safeId(calculator)}`;
  const errorId = `${base}-error`;

  return {
    regionLabelId: `${base}-label`,
    errorId,
    field: (key: string): FieldA11yProps => ({
      id: `${base}-${safeId(key)}`,
      ...(error ? { 'aria-describedby': errorId, 'aria-invalid': true as const } : {}),
    }),
  };
}

export function CalculatorResultAnnouncement({
  error,
  result,
}: {
  error?: string;
  result: string;
}) {
  return (
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {error ? `Calculation error: ${error}` : `Calculated result: ${result}`}
    </span>
  );
}