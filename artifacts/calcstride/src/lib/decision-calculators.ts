export type MoneyScenario = { label: string; value: number };

const MAX_FINANCE_AMOUNT = 1_000_000_000_000;
const MAX_FINANCE_RATE = 100;
const MAX_FINANCE_YEARS = 100;

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

export const autoLoanDecision = (price: number, down: number, trade: number, annualRate: number, months: number, taxRate: number, fees: number, rebate: number, balloon: number, extraMonthly: number, ownershipMonthly: number) => {
  const financed = price * (1 + taxRate / 100) + fees - down - trade - rebate;
  const years = months / 12;
  const base = amortizationScenario(financed, annualRate, years, 0, 0, balloon);
  const accelerated = amortizationScenario(financed, annualRate, years, extraMonthly, 0, balloon);
  if (!base || !accelerated || [rebate, balloon, extraMonthly, ownershipMonthly].some((value) => !Number.isFinite(value) || value < 0) || financed <= 0 || balloon > financed) return undefined;
  return { financed, payment: accelerated.paymentWithExtra, ownershipMonthly: accelerated.paymentWithExtra + ownershipMonthly, payoffMonths: accelerated.months, interest: accelerated.interest, interestSaved: Math.max(0, base.interest - accelerated.interest), balloon: accelerated.balloon };
};

const payoffSchedule = (balance: number, annualRate: number, paymentAmount: number, extraMonthly: number, lumpSum: number, extraStartMonth: number) => {
  if (
    ![balance, annualRate, paymentAmount, extraMonthly, lumpSum, extraStartMonth].every(Number.isFinite)
    || balance <= 0
    || annualRate < 0
    || paymentAmount <= 0
    || extraMonthly < 0
    || lumpSum < 0
    || lumpSum > balance
    || !Number.isInteger(extraStartMonth)
    || extraStartMonth < 1
  ) return undefined;
  let remaining = balance - lumpSum;
  let interest = 0;
  if (remaining <= 0.005) return { months: 0, interest: 0, totalPaid: lumpSum };
  for (let month = 1; month <= 1200; month += 1) {
    const charge = remaining * annualRate / 1200;
    const paid = paymentAmount + (month >= extraStartMonth ? extraMonthly : 0);
    if (paid <= charge) return undefined;
    interest += charge;
    remaining += charge;
    if (paid >= remaining) return { months: month, interest, totalPaid: balance - lumpSum + interest + lumpSum };
    remaining -= paid;
  }
  return undefined;
};

export const mortgagePayoffDecision = (balance: number, annualRate: number, paymentAmount: number, currentExtra: number, lumpSum: number, addedExtra: number, extraStartMonth: number) => {
  const base = payoffSchedule(balance, annualRate, paymentAmount, currentExtra, 0, 1);
  const advanced = payoffSchedule(balance, annualRate, paymentAmount, currentExtra + addedExtra, lumpSum, extraStartMonth);
  if (!base || !advanced) return undefined;
  return { ...advanced, monthsSaved: Math.max(0, base.months - advanced.months), interestSaved: Math.max(0, base.interest - advanced.interest) };
};

export const growthDecision = (start: number, monthly: number, annualRate: number, years: number, annualIncrease: number, annualFee: number, inflation: number, beginningOfMonth: boolean) => {
  if ([start, monthly, annualRate, years, annualIncrease, annualFee, inflation].some((value) => !Number.isFinite(value) || value < 0) || years <= 0) return undefined;
  let balance = start, contribution = monthly, deposited = start;
  const months = Math.round(years * 12);
  for (let month = 0; month < months; month += 1) {
    if (beginningOfMonth) balance += contribution;
    balance *= 1 + (annualRate - annualFee) / 1200;
    if (!beginningOfMonth) balance += contribution;
    deposited += contribution;
    if ((month + 1) % 12 === 0) contribution *= 1 + annualIncrease / 100;
  }
  return { balance, deposited, growth: balance - deposited, todayValue: balance / ((1 + inflation / 100) ** years) };
};

export const savingsTargetDecision = (start: number, monthly: number, annualRate: number, years: number, target: number, annualIncrease: number, beginningOfMonth: boolean) => {
  if (
    ![start, monthly, annualRate, years, target, annualIncrease].every(Number.isFinite)
    || start < 0
    || monthly < 0
    || annualRate < 0
    || years <= 0
    || target < 0
    || annualIncrease < 0
    || start > MAX_FINANCE_AMOUNT
    || monthly > MAX_FINANCE_AMOUNT
    || target > MAX_FINANCE_AMOUNT
    || annualRate > MAX_FINANCE_RATE
    || years > MAX_FINANCE_YEARS
  ) return undefined;
  const scenario = growthDecision(start, monthly, annualRate, years, annualIncrease, 0, 0, beginningOfMonth);
  if (!scenario) return undefined;
  const months = Math.round(years * 12);
  const rate = annualRate / 1200;
  const startFuture = start * (1 + rate) ** months;
  const factor = rate === 0 ? months : ((1 + rate) ** months - 1) / rate * (beginningOfMonth ? 1 + rate : 1);
  const requiredMonthly = target > startFuture && annualIncrease === 0 ? (target - startFuture) / factor : undefined;
  return { ...scenario, targetGap: target - scenario.balance, requiredMonthly };
};

export const aprDecision = (received: number, paymentAmount: number, months: number, withheldFees: number, upfrontFees: number, finalFee: number, advertisedRate: number) => {
  if (![received, paymentAmount, months, withheldFees, upfrontFees, finalFee, advertisedRate].every(Number.isFinite) || received <= upfrontFees || paymentAmount <= 0 || months < 1 || withheldFees < 0 || upfrontFees < 0 || finalFee < 0 || advertisedRate < 0) return undefined;
  const netReceived = received - upfrontFees;
  const presentValue = (monthlyRate: number) => paymentAmount * (1 - (1 + monthlyRate) ** -months) / monthlyRate + finalFee / (1 + monthlyRate) ** months;
  let low = 0, high = 1;
  if (paymentAmount * months + finalFee <= netReceived) return undefined;
  for (let i = 0; i < 100; i += 1) {
    const mid = (low + high) / 2;
    if (presentValue(mid) > netReceived) low = mid; else high = mid;
  }
  const effectiveApr = (low + high) / 2 * 1200;
  return { effectiveApr, totalBorrowingCost: paymentAmount * months + upfrontFees + finalFee - received, totalFees: withheldFees + upfrontFees + finalFee, advertisedDifference: effectiveApr - advertisedRate };
};