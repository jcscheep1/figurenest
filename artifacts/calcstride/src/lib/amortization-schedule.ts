export type AmortizationInput = {
  principal: number;
  annualRatePercent: number;
  months: number;
  extraMonthlyPrincipal?: number;
};

export type AmortizationRow = {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  extraPrincipal: number;
  balance: number;
};

export type AmortizationResult = {
  scheduledMonthlyPayment: number;
  payoffMonths: number;
  totalInterest: number;
  totalPaid: number;
  schedule: AmortizationRow[];
};

const cents = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateAmortizationSchedule(input: AmortizationInput): AmortizationResult {
  const { principal, annualRatePercent, months } = input;
  const extraMonthlyPrincipal = input.extraMonthlyPrincipal ?? 0;

  if (![principal, annualRatePercent, months, extraMonthlyPrincipal].every(Number.isFinite)) {
    throw new Error('All amortization inputs must be finite numbers.');
  }
  if (principal <= 0) throw new Error('Principal must be greater than zero.');
  if (annualRatePercent < 0) throw new Error('Annual interest rate cannot be negative.');
  if (!Number.isInteger(months) || months <= 0) throw new Error('Loan term must be a positive whole number of months.');
  if (extraMonthlyPrincipal < 0) throw new Error('Extra monthly principal cannot be negative.');

  const monthlyRate = annualRatePercent / 1200;
  const rawScheduledPayment = monthlyRate === 0
    ? principal / months
    : principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
  const scheduledMonthlyPayment = cents(rawScheduledPayment);

  let balance = cents(principal);
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule: AmortizationRow[] = [];

  // The contractual payment should amortize by `months`. Extra principal can only shorten that horizon.
  for (let period = 1; period <= months && balance > 0; period += 1) {
    const interest = cents(balance * monthlyRate);
    const scheduledPrincipal = Math.max(0, cents(scheduledMonthlyPayment - interest));
    const principalBeforeExtra = Math.min(balance, scheduledPrincipal);
    const remainingAfterScheduled = cents(balance - principalBeforeExtra);
    const extraPrincipal = Math.min(remainingAfterScheduled, cents(extraMonthlyPrincipal));
    const principalPaid = cents(principalBeforeExtra + extraPrincipal);
    const payment = cents(interest + principalPaid);
    balance = Math.max(0, cents(balance - principalPaid));

    totalInterest = cents(totalInterest + interest);
    totalPaid = cents(totalPaid + payment);
    schedule.push({
      period,
      payment,
      principal: principalPaid,
      interest,
      extraPrincipal,
      balance,
    });
  }

  // Currency rounding can leave a residual after the contractual term (for example a few cents).
  // Close it in the final row rather than reporting a negative or phantom balance.
  if (balance > 0 && schedule.length === months) {
    const final = schedule[schedule.length - 1];
    final.principal = cents(final.principal + balance);
    final.payment = cents(final.payment + balance);
    totalPaid = cents(totalPaid + balance);
    balance = 0;
    final.balance = 0;
  }

  if (balance > 0) throw new Error('The loan did not amortize within the requested term.');

  return {
    scheduledMonthlyPayment,
    payoffMonths: schedule.length,
    totalInterest,
    totalPaid,
    schedule,
  };
}
