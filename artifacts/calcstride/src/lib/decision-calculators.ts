export type MoneyScenario = { label: string; value: number };

const payment = (principal: number, annualRate: number, months: number, balloon = 0) => {
  if (months <= 0 || principal < 0 || annualRate < 0 || balloon < 0 || balloon > principal) return NaN;
  if (annualRate === 0) return (principal - balloon) / months;
  const rate = annualRate / 1200;
  const discount = (1 + rate) ** months;
  return (principal - balloon / discount) * rate / (1 - 1 / discount);
};

export const amortizationScenario = (principal: number, annualRate: number, years: number, extraMonthly = 0, fees = 0, balloon = 0) => {
  const financed = principal + fees;
  const months = Math.round(years * 12);
  const scheduled = payment(financed, annualRate, months, balloon);
  if (![financed, annualRate, years, extraMonthly, fees, balloon, scheduled].every(Number.isFinite) || scheduled < 0 || extraMonthly < 0) return undefined;
  const rate = annualRate / 1200;
  let balance = financed;
  let interest = 0;
  let elapsed = 0;
  while (balance > Math.max(balloon, 0.005) && elapsed < months) {
    const monthInterest = balance * rate;
    const principalPaid = Math.max(0, scheduled + extraMonthly - monthInterest);
    if (principalPaid <= 0) return undefined;
    interest += monthInterest;
    balance = Math.max(balloon, balance - principalPaid);
    elapsed += 1;
  }
  const totalPaid = (scheduled + extraMonthly) * elapsed + balance;
  return { financed, scheduled, paymentWithExtra: scheduled + extraMonthly, months: elapsed, interest, totalPaid, balloon: balance };
};

export const mortgageDecision = (price: number, down: number, annualRate: number, years: number, tax: number, insurance: number, hoaMonthly: number, pmiMonthly: number, extraMonthly: number) => {
  const principal = price - down;
  const base = amortizationScenario(principal, annualRate, years);
  const accelerated = amortizationScenario(principal, annualRate, years, extraMonthly);
  if (!base || !accelerated || principal < 0) return undefined;
  return {
    principal,
    housingPayment: accelerated.paymentWithExtra + tax / 12 + insurance / 12 + hoaMonthly + pmiMonthly,
    payoffMonths: accelerated.months,
    interestSaved: Math.max(0, base.interest - accelerated.interest),
    totalInterest: accelerated.interest,
  };
};

export const retirementDecision = (start: number, monthly: number, annualReturn: number, years: number, employerMonthly: number, annualIncrease: number, inflation: number) => {
  if ([start, monthly, annualReturn, years, employerMonthly, annualIncrease, inflation].some((value) => !Number.isFinite(value) || value < 0) || years <= 0) return undefined;
  let balance = start;
  let employee = monthly;
  let contributions = start;
  const months = Math.round(years * 12);
  for (let month = 0; month < months; month += 1) {
    balance *= 1 + annualReturn / 1200;
    balance += employee + employerMonthly;
    contributions += employee + employerMonthly;
    if ((month + 1) % 12 === 0) employee *= 1 + annualIncrease / 100;
  }
  const todayValue = balance / ((1 + inflation / 100) ** years);
  return { balance, todayValue, contributions, growth: balance - contributions, monthlyIncome4Percent: balance * 0.04 / 12 };
};

export const budgetDecision = (income: number, categories: readonly number[], emergencyMonths: number) => {
  if (![income, emergencyMonths, ...categories].every((value) => Number.isFinite(value) && value >= 0)) return undefined;
  const expenses = categories.reduce((sum, value) => sum + value, 0);
  const surplus = income - expenses;
  return { expenses, surplus, savingsRate: income ? surplus / income * 100 : 0, emergencyTarget: expenses * emergencyMonths };
};

export const creditCardDecision = (balance: number, annualRate: number, basePayment: number, extraPayment: number, monthlyPurchases: number) => {
  const solve = (paymentAmount: number) => {
    if (![balance, annualRate, paymentAmount, monthlyPurchases].every(Number.isFinite) || balance <= 0 || annualRate < 0 || paymentAmount <= 0 || monthlyPurchases < 0) return undefined;
    let remaining = balance;
    let interest = 0;
    for (let month = 1; month <= 1200; month += 1) {
      const charge = remaining * annualRate / 1200;
      interest += charge;
      remaining += charge + monthlyPurchases;
      if (paymentAmount >= remaining) return { months: month, interest, totalPaid: balance + interest + monthlyPurchases * month };
      remaining -= paymentAmount;
      if (paymentAmount <= charge + monthlyPurchases) return undefined;
    }
    return undefined;
  };
  const base = solve(basePayment);
  const accelerated = solve(basePayment + extraPayment);
  if (!base || !accelerated) return undefined;
  return { ...accelerated, interestSaved: Math.max(0, base.interest - accelerated.interest), monthsSaved: Math.max(0, base.months - accelerated.months) };
};
