export type SavingsMathInput = {
  startingBalance: number;
  monthlyContribution: number;
  annualRatePercent: number;
  years: number;
};

export type SavingsMathResult = {
  balance: number;
  deposited: number;
  interest: number;
};

export type SavingsValidationResult =
  | { ok: true; value: SavingsMathResult }
  | { ok: false; error: string };

const MAX_FINANCE_AMOUNT = 1_000_000_000_000;
const MAX_FINANCE_RATE = 100;
const MAX_FINANCE_YEARS = 100;

const compoundBalance = (
  principal: number,
  contribution: number,
  annualRatePercent: number,
  months: number,
) => {
  if (annualRatePercent === 0) return principal + contribution * months;
  const monthlyRate = annualRatePercent / 1200;
  const growthMinusOne = Math.expm1(months * Math.log1p(monthlyRate));
  return principal * (growthMinusOne + 1) + contribution * growthMinusOne / monthlyRate;
};

export function calculateSavingsMath(input: SavingsMathInput): SavingsValidationResult {
  const { startingBalance, monthlyContribution, annualRatePercent, years } = input;
  const values = [startingBalance, monthlyContribution, annualRatePercent, years];

  if (!values.every(Number.isFinite) || values.some((value) => value < 0)) {
    return { ok: false, error: 'Enter valid non-negative values' };
  }
  if (startingBalance > MAX_FINANCE_AMOUNT || monthlyContribution > MAX_FINANCE_AMOUNT) {
    return { ok: false, error: 'Enter amounts no greater than 1 trillion' };
  }
  if (annualRatePercent > MAX_FINANCE_RATE) {
    return { ok: false, error: 'Enter an annual interest rate of 100% or less' };
  }
  if (years > MAX_FINANCE_YEARS) {
    return { ok: false, error: 'Enter a time period of 100 years or less' };
  }

  const months = years * 12;
  const deposited = startingBalance + monthlyContribution * months;
  const balance = compoundBalance(startingBalance, monthlyContribution, annualRatePercent, months);
  const interest = balance - deposited;

  if (![balance, deposited, interest].every(Number.isFinite)) {
    return { ok: false, error: 'These inputs produce a result too large to calculate' };
  }
  if (interest < -Math.max(0.01, deposited * 1e-12)) {
    return { ok: false, error: 'These inputs could not produce a reliable non-negative interest result' };
  }

  return {
    ok: true,
    value: {
      balance,
      deposited,
      interest: Math.max(0, interest),
    },
  };
}
