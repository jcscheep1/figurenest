export type OvertimeInputs = {
  hourlyRate: number;
  overtimeHours: number;
  multiplier: number;
  totalHours: number;
  threshold: number;
  advanced: boolean;
};

export type OvertimeResult = {
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimeRate: number;
  overtimePay: number;
  totalPay: number;
  totalHours: number;
  threshold: number;
};

export function calculateOvertimePay(inputs: OvertimeInputs): OvertimeResult | undefined {
  const { hourlyRate, overtimeHours, multiplier, totalHours, threshold, advanced } = inputs;
  const values = [hourlyRate, overtimeHours, multiplier, totalHours, threshold];
  if (!values.every((value) => Number.isFinite(value) && value >= 0)) return undefined;
  if (multiplier <= 0 || totalHours > 168 || overtimeHours > 168 || threshold > 168) return undefined;

  const regularHours = advanced ? Math.min(totalHours, threshold) : 0;
  const appliedOvertimeHours = advanced ? Math.max(totalHours - threshold, 0) : overtimeHours;
  const overtimeRate = hourlyRate * multiplier;
  const overtimePay = appliedOvertimeHours * overtimeRate;
  const regularPay = regularHours * hourlyRate;

  return {
    regularHours,
    overtimeHours: appliedOvertimeHours,
    regularPay,
    overtimeRate,
    overtimePay,
    totalPay: regularPay + overtimePay,
    totalHours: advanced ? totalHours : overtimeHours,
    threshold,
  };
}
