import { formatCurrency, type CurrencyCode } from './units-preferences';

export type CoreField = { key: string; label: string; value: string; prefix?: string; suffix?: string; type?: 'number' | 'date' };
export type CalculationResult = { primary: string; details?: { label: string; value: string }[]; error?: string };
export type CalculationOptions = { currency?: CurrencyCode };

const decimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const today = new Date().toISOString().slice(0, 10);
const monthStart = `${today.slice(0, 8)}01`;

export const coreFields: Record<string, CoreField[]> = {
  percentage: [{ key: 'percent', label: 'Percentage', value: '18', suffix: '%' }, { key: 'base', label: 'Of value', value: '240' }],
  'compound-interest': [{ key: 'principal', label: 'Starting balance', value: '5000', prefix: '$' }, { key: 'contribution', label: 'Monthly contribution', value: '250', prefix: '$' }, { key: 'rate', label: 'Annual interest rate', value: '6', suffix: '%' }, { key: 'years', label: 'Time invested', value: '10', suffix: 'years' }],
  loan: [{ key: 'principal', label: 'Loan amount', value: '24000', prefix: '$' }, { key: 'rate', label: 'Annual interest rate', value: '7.2', suffix: '%' }, { key: 'years', label: 'Loan term', value: '5', suffix: 'years' }],
  mortgage: [{ key: 'price', label: 'Home price', value: '360000', prefix: '$' }, { key: 'down', label: 'Down payment', value: '72000', prefix: '$' }, { key: 'rate', label: 'Interest rate', value: '6.5', suffix: '%' }, { key: 'years', label: 'Loan term', value: '30', suffix: 'years' }, { key: 'tax', label: 'Annual property tax', value: '4500', prefix: '$' }, { key: 'insurance', label: 'Annual home insurance', value: '1800', prefix: '$' }],
  savings: [{ key: 'start', label: 'Starting balance', value: '1200', prefix: '$' }, { key: 'contribution', label: 'Monthly contribution', value: '300', prefix: '$' }, { key: 'rate', label: 'Annual interest rate', value: '4.5', suffix: '%' }, { key: 'years', label: 'Time saved', value: '3', suffix: 'years' }],
  roi: [{ key: 'initial', label: 'Initial investment', value: '5000', prefix: '$' }, { key: 'final', label: 'Final value', value: '6800', prefix: '$' }],
  'profit-margin': [{ key: 'cost', label: 'Cost', value: '48', prefix: '$' }, { key: 'price', label: 'Selling price', value: '80', prefix: '$' }],
  markup: [{ key: 'cost', label: 'Cost', value: '48', prefix: '$' }, { key: 'markup', label: 'Markup', value: '40', suffix: '%' }],
  'break-even': [{ key: 'fixed', label: 'Fixed costs', value: '12000', prefix: '$' }, { key: 'price', label: 'Price per unit', value: '80', prefix: '$' }, { key: 'variable', label: 'Variable cost per unit', value: '32', prefix: '$' }],
  vat: [{ key: 'price', label: 'Price', value: '100', prefix: '$' }, { key: 'rate', label: 'VAT rate', value: '21', suffix: '%' }],
  salary: [{ key: 'annual', label: 'Annual salary', value: '60000', prefix: '$' }, { key: 'hours', label: 'Hours per week', value: '40' }, { key: 'weeks', label: 'Weeks per year', value: '52' }],
  overtime: [{ key: 'rate', label: 'Hourly rate', value: '24', prefix: '$' }, { key: 'hours', label: 'Overtime hours', value: '8' }, { key: 'multiplier', label: 'Overtime multiplier', value: '1.5', suffix: '×' }],
  'fuel-cost': [{ key: 'distance', label: 'Distance', value: '320', suffix: 'miles' }, { key: 'mpg', label: 'Vehicle efficiency', value: '28', suffix: 'mpg' }, { key: 'price', label: 'Fuel price', value: '3.65', prefix: '$' }],
  'ev-charging-cost': [{ key: 'capacity', label: 'Battery capacity', value: '75', suffix: 'kWh' }, { key: 'charge', label: 'Charge added', value: '80', suffix: '%' }, { key: 'price', label: 'Electricity price', value: '0.32', prefix: '$/kWh' }],
  'ev-charging-time': [{ key: 'energy', label: 'Energy needed', value: '52', suffix: 'kWh' }, { key: 'power', label: 'Charger power', value: '11', suffix: 'kW' }],
  area: [{ key: 'length', label: 'Length', value: '12', suffix: 'm' }, { key: 'width', label: 'Width', value: '8', suffix: 'm' }],
  volume: [{ key: 'length', label: 'Length', value: '4', suffix: 'm' }, { key: 'width', label: 'Width', value: '3', suffix: 'm' }, { key: 'height', label: 'Height', value: '2.5', suffix: 'm' }],
  age: [{ key: 'birth', label: 'Date of birth', value: '1990-06-14', type: 'date' }, { key: 'asOf', label: 'As of', value: today, type: 'date' }],
  'working-days': [{ key: 'start', label: 'Start date', value: monthStart, type: 'date' }, { key: 'end', label: 'End date', value: today, type: 'date' }],
  'dpi-ppi': [{ key: 'pixels', label: 'Pixel width', value: '2400', suffix: 'px' }, { key: 'inches', label: 'Print width', value: '8', suffix: 'in' }],
  'pixels-to-cm': [{ key: 'pixels', label: 'Pixels', value: '1200', suffix: 'px' }, { key: 'ppi', label: 'Resolution', value: '300', suffix: 'PPI' }],
  'image-scaling': [{ key: 'width', label: 'Original width', value: '2400', suffix: 'px' }, { key: 'height', label: 'Original height', value: '1600', suffix: 'px' }, { key: 'newWidth', label: 'New width', value: '1200', suffix: 'px' }],
};

const invalid = (message: string): CalculationResult => ({ primary: message, error: message });
const numbers = (values: string[]) => values.map((v) => Number(v));
const validNumbers = (values: number[]) => values.every(Number.isFinite) && values.every((v) => v >= 0);
const MAX_FINANCE_AMOUNT = 1_000_000_000_000;
const MAX_FINANCE_RATE = 100;
const MAX_FINANCE_YEARS = 100;
const MAX_PAY_AMOUNT = 1_000_000_000_000;
const MAX_HOURS_PER_WEEK = 168;
const MAX_PAID_WEEKS = 53;
const MAX_OVERTIME_HOURS = 168;
const MAX_OVERTIME_MULTIPLIER = 100;
const BUSINESS_SLUGS = ['roi', 'profit-margin', 'markup', 'break-even'];
const MAX_BUSINESS_AMOUNT = 1_000_000_000_000;
const MAX_BUSINESS_PERCENT = 100_000;
const AUTOMOTIVE_CALCULATOR_SLUGS = ['fuel-cost', 'ev-charging-cost', 'ev-charging-time'];
const MAX_TRIP_DISTANCE_MILES = 10_000_000;
const MAX_VEHICLE_MPG = 1_000;
const MAX_ENERGY_KWH = 10_000;
const MAX_CHARGER_POWER_KW = 10_000;
const MAX_ENERGY_PRICE = 1_000;
const MAX_AUTOMOTIVE_COST = 1_000_000_000;
const trillionLabel = (currency: CurrencyCode) => currency === 'USD'
  ? '$1 trillion'
  : formatCurrency(1_000_000_000_000, currency, { maximumFractionDigits: 0 });
const financeBoundsError = (amounts: number[], annualRate: number, years: number, currency: CurrencyCode) => {
  if (amounts.some((amount) => amount > MAX_FINANCE_AMOUNT)) return `Enter amounts no greater than ${trillionLabel(currency)}`;
  if (annualRate > MAX_FINANCE_RATE) return 'Enter an annual interest rate of 100% or less';
  if (years > MAX_FINANCE_YEARS) return 'Enter a time period of 100 years or less';
  return undefined;
};
const payment = (principal: number, annualRate: number, months: number) => {
  if (annualRate === 0) return principal / months;
  const monthlyRate = annualRate / 1200;
  const denominator = -Math.expm1(-months * Math.log1p(monthlyRate));
  return principal * monthlyRate / denominator;
};
const compoundBalance = (principal: number, contribution: number, annualRate: number, months: number) => {
  if (annualRate === 0) return principal + contribution * months;
  const monthlyRate = annualRate / 1200;
  const growthMinusOne = Math.expm1(months * Math.log1p(monthlyRate));
  return principal * (growthMinusOne + 1) + contribution * growthMinusOne / monthlyRate;
};
const financeResult = (primary: number, details: { label: string; value: number }[], currency: CurrencyCode): CalculationResult => {
  if (![primary, ...details.map((detail) => detail.value)].every(Number.isFinite)) {
    return invalid('These inputs produce a result too large to calculate. Reduce the amounts, rate, or time period');
  }
  return {
    primary: formatCurrency(primary, currency),
    details: details.map((detail) => ({ label: detail.label, value: formatCurrency(detail.value, currency) })),
  };
};
const payResult = (primary: number, details: { label: string; value: number }[] = [], currency: CurrencyCode): CalculationResult => {
  if (![primary, ...details.map((detail) => detail.value)].every(Number.isFinite)) {
    return invalid('These inputs produce a result too large to calculate. Reduce the entered values');
  }
  return {
    primary: formatCurrency(primary, currency),
    details: details.length ? details.map((detail) => ({ label: detail.label, value: formatCurrency(detail.value, currency) })) : undefined,
  };
};
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
const daysInMonth = (year: number, month: number) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};
const parseDate = (value: string) => {
  const match = DATE_PATTERN.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return undefined;
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
};

export function calculateCore(slug: string, inputs: string[], mode = 'default', options: CalculationOptions = {}): CalculationResult {
  const currency = options.currency ?? 'USD';
  const formatMoney = (value: number) => formatCurrency(value, currency);
  if (['age', 'working-days'].includes(slug)) return calculateDates(slug, inputs);
  if ([...BUSINESS_SLUGS, ...AUTOMOTIVE_CALCULATOR_SLUGS].includes(slug) && inputs.some((value) => !value.trim())) {
    return invalid('Complete every field with a valid non-negative value');
  }
  const n = numbers(inputs);
  if (!validNumbers(n)) return invalid('Enter valid non-negative values');
  const [a, b, c, d, e, f] = n;
  if (BUSINESS_SLUGS.includes(slug) && n.some((value) => value > MAX_BUSINESS_AMOUNT)) {
    return invalid(`Enter business amounts no greater than ${trillionLabel(currency)}`);
  }
  if (slug === 'percentage') return { primary: decimal.format(a * b / 100) };
  if (slug === 'roi' && a === 0) return invalid('Initial investment must be greater than zero');
  if (slug === 'roi') {
    const gain = b - a;
    const roi = gain / a * 100;
    if (!Number.isFinite(roi) || Math.abs(roi) > MAX_BUSINESS_PERCENT) {
      return invalid('These values produce an ROI too large to use. Check the initial investment');
    }
    return {
      primary: `${decimal.format(roi)}%`,
      details: [
        { label: gain >= 0 ? 'Net gain' : 'Net loss', value: formatMoney(Math.abs(gain)) },
        { label: 'Final value', value: formatMoney(b) },
      ],
    };
  }
  if (slug === 'compound-interest') {
    const boundsError = financeBoundsError([a, b], c, d, currency);
    if (boundsError) return invalid(boundsError);
    const months = d * 12;
    const deposited = a + b * months;
    const balance = compoundBalance(a, b, c, months);
    const interest = balance - deposited;
    if (interest < -Math.max(0.01, deposited * 1e-12)) return invalid('These inputs could not produce a reliable non-negative interest result');
    return financeResult(balance, [
      { label: 'Deposited principal', value: deposited },
      { label: 'Interest earned', value: Math.max(0, interest) },
    ], currency);
  }
  if (slug === 'savings') {
    const boundsError = financeBoundsError([a, b], c, d, currency);
    if (boundsError) return invalid(boundsError);
    const months = d * 12;
    const deposited = a + b * months;
    const balance = compoundBalance(a, b, c, months);
    const interest = balance - deposited;
    if (interest < -Math.max(0.01, deposited * 1e-12)) return invalid('These inputs could not produce a reliable non-negative interest result');
    return financeResult(balance, [
      { label: 'Deposited principal', value: deposited },
      { label: 'Interest earned', value: Math.max(0, interest) },
    ], currency);
  }
  if (slug === 'loan') {
    if (c === 0) return invalid('Loan term must be greater than zero');
    const boundsError = financeBoundsError([a], b, c, currency);
    if (boundsError) return invalid(boundsError);
    const months = c * 12;
    const monthly = payment(a, b, months);
    const total = monthly * months;
    const interest = total - a;
    if (interest < -Math.max(0.01, a * 1e-12)) return invalid('These inputs could not produce a reliable non-negative interest result');
    return financeResult(monthly, [
      { label: 'Total paid', value: total },
      { label: 'Total interest', value: Math.max(0, interest) },
    ], currency);
  }
  if (slug === 'mortgage') {
    if (d === 0 || b > a) return invalid('Enter a valid loan term and down payment');
    const boundsError = financeBoundsError([a, b, e, f], c, d, currency);
    if (boundsError) return invalid(boundsError);
    const principal = a - b;
    const months = d * 12;
    const loanPayment = payment(principal, c, months);
    const loanTotal = loanPayment * months;
    const interest = loanTotal - principal;
    const monthly = loanPayment + e / 12 + f / 12;
    if (interest < -Math.max(0.01, principal * 1e-12)) return invalid('These inputs could not produce a reliable non-negative interest result');
    return financeResult(monthly, [
      { label: 'Principal & interest', value: loanPayment },
      { label: 'Loan total paid', value: loanTotal },
      { label: 'Total loan interest', value: Math.max(0, interest) },
    ], currency);
  }
  if (slug === 'profit-margin') {
    if (b === 0) return invalid('Selling price must be greater than zero');
    const profit = b - a;
    const margin = profit / b * 100;
    const markup = a === 0 ? undefined : profit / a * 100;
    if (!Number.isFinite(margin) || Math.abs(margin) > MAX_BUSINESS_PERCENT || (markup !== undefined && !Number.isFinite(markup))) {
      return invalid('These values produce a percentage too large to use. Check the cost and selling price');
    }
    return {
      primary: `${decimal.format(margin)}%`,
      details: [
        { label: profit >= 0 ? 'Gross profit' : 'Gross loss', value: formatMoney(Math.abs(profit)) },
        { label: 'Markup on cost', value: markup === undefined ? 'Not defined' : `${decimal.format(markup)}%` },
      ],
    };
  }
  if (slug === 'markup') {
    if (b > MAX_BUSINESS_PERCENT) return invalid('Enter a markup of 100,000% or less');
    const markupAmount = a * b / 100;
    const price = a + markupAmount;
    if (!Number.isFinite(price) || price > MAX_BUSINESS_AMOUNT) {
      return invalid(`These values produce a selling price above ${trillionLabel(currency)}. Reduce the cost or markup`);
    }
    const margin = price === 0 ? 0 : markupAmount / price * 100;
    return {
      primary: formatMoney(price),
      details: [
        { label: 'Markup amount', value: formatMoney(markupAmount) },
        { label: 'Equivalent margin', value: `${decimal.format(margin)}%` },
      ],
    };
  }
  if (slug === 'break-even') {
    if (b <= c) return invalid('Selling price per unit must exceed variable cost per unit');
    const contribution = b - c;
    const exactUnits = a / contribution;
    const nearestWholeUnit = Math.round(exactUnits);
    const isEffectivelyWhole = Math.abs(exactUnits - nearestWholeUnit)
      <= Number.EPSILON * Math.max(1, Math.abs(exactUnits)) * 8;
    const units = isEffectivelyWhole ? nearestWholeUnit : Math.ceil(exactUnits);
    const exactRevenue = exactUnits * b;
    const wholeUnitRevenue = units * b;
    if (
      ![exactUnits, units, exactRevenue, wholeUnitRevenue].every(Number.isFinite)
      || units > MAX_BUSINESS_AMOUNT
      || wholeUnitRevenue > MAX_BUSINESS_AMOUNT
    ) {
      return invalid('These values produce a break-even result above the supported range');
    }
    return {
      primary: `${whole.format(units)} units`,
      details: [
        { label: 'Contribution per unit', value: formatMoney(contribution) },
        { label: 'Exact break-even revenue', value: formatMoney(exactRevenue) },
        { label: 'Revenue at minimum whole units', value: formatMoney(wholeUnitRevenue) },
      ],
    };
  }
  if (slug === 'vat') { const gross = mode === 'remove' ? a : a * (1 + b / 100); const net = mode === 'remove' ? a / (1 + b / 100) : a; return { primary: formatMoney(mode === 'remove' ? net : gross), details: [{ label: mode === 'remove' ? 'VAT removed' : 'VAT amount', value: formatMoney(gross - net) }, { label: mode === 'remove' ? 'Price before VAT' : 'Price including VAT', value: formatMoney(mode === 'remove' ? net : gross) }] }; }
  if (slug === 'salary') {
    if (!b || !c) return invalid('Hours and weeks must be greater than zero');
    if (a > MAX_PAY_AMOUNT) return invalid(`Enter an annual salary no greater than ${trillionLabel(currency)}`);
    if (b > MAX_HOURS_PER_WEEK) return invalid('Enter hours per week of 168 or less');
    if (c > MAX_PAID_WEEKS) return invalid('Enter weeks per year of 53 or less');
    const hourly = a / (b * c);
    return payResult(hourly, [
      { label: 'Monthly pay', value: a / 12 },
      { label: 'Weekly pay', value: a / c },
      { label: 'Hourly pay', value: hourly },
    ], currency);
  }
  if (slug === 'overtime') {
    if (a > MAX_PAY_AMOUNT) return invalid(`Enter an hourly rate no greater than ${trillionLabel(currency)}`);
    if (b > MAX_OVERTIME_HOURS) return invalid('Enter overtime hours of 168 or less');
    if (c > MAX_OVERTIME_MULTIPLIER) return invalid('Enter an overtime multiplier of 100 or less');
    return payResult(a * b * c, [], currency);
  }
  if (slug === 'fuel-cost') {
    if (!b) return invalid('Vehicle efficiency must be greater than zero');
    if (a > MAX_TRIP_DISTANCE_MILES) return invalid('Enter a trip distance of 10 million miles or less');
    if (b > MAX_VEHICLE_MPG) return invalid('Enter vehicle efficiency of 1,000 MPG or less');
    if (c > MAX_ENERGY_PRICE) return invalid(`Enter a fuel price of ${formatCurrency(1_000, currency)} per gallon or less`);
    const gallons = a / b;
    const cost = gallons * c;
    const costPerMile = c / b;
    if (![gallons, cost, costPerMile].every(Number.isFinite) || cost > MAX_AUTOMOTIVE_COST) {
      return invalid('These values produce a trip cost above the supported range');
    }
    return {
      primary: formatMoney(cost),
      details: [
        { label: 'Fuel used', value: `${decimal.format(gallons)} gallons` },
        { label: 'Fuel cost per mile', value: formatMoney(costPerMile) },
      ],
    };
  }
  if (slug === 'ev-charging-cost') {
    if (a > MAX_ENERGY_KWH) return invalid('Enter a battery capacity of 10,000 kWh or less');
    if (b > 100) return invalid('Charge added cannot exceed 100%');
    if (c > MAX_ENERGY_PRICE) return invalid(`Enter an electricity price of ${formatCurrency(1_000, currency)} per kWh or less`);
    const energy = a * b / 100;
    const cost = energy * c;
    const fullBatteryCost = a * c;
    if (![energy, cost, fullBatteryCost].every(Number.isFinite) || cost > MAX_AUTOMOTIVE_COST) {
      return invalid('These values produce a charging cost above the supported range');
    }
    return {
      primary: formatMoney(cost),
      details: [
        { label: 'Battery energy added', value: `${decimal.format(energy)} kWh` },
        { label: 'Full-battery energy cost', value: formatMoney(fullBatteryCost) },
      ],
    };
  }
  if (slug === 'ev-charging-time') {
    if (!b) return invalid('Charger power must be greater than zero');
    if (a > MAX_ENERGY_KWH) return invalid('Enter energy needed of 10,000 kWh or less');
    if (b > MAX_CHARGER_POWER_KW) return invalid('Enter charger power of 10,000 kW or less');
    const hours = a / b;
    const totalMinutes = Math.round(hours * 60);
    if (!Number.isFinite(hours) || !Number.isFinite(totalMinutes) || hours > 100_000) {
      return invalid('These values produce a charging time above the supported range');
    }
    return {
      primary: `${decimal.format(hours)} hours`,
      details: [
        { label: 'Approximate duration', value: `${whole.format(Math.floor(totalMinutes / 60))} hr ${whole.format(totalMinutes % 60)} min` },
        { label: 'Charger power used', value: `${decimal.format(b)} kW` },
      ],
    };
  }
  if (slug === 'area') return { primary: `${decimal.format(a * b)} m²` };
  if (slug === 'volume') return { primary: `${decimal.format(a * b * c)} m³` };
  if (slug === 'dpi-ppi') return b ? { primary: `${decimal.format(a / b)} PPI` } : invalid('Print width must be greater than zero');
  if (slug === 'pixels-to-cm') return b ? { primary: `${decimal.format(a / b * 2.54)} cm`, details: [{ label: 'Inches', value: `${decimal.format(a / b)} in` }] } : invalid('Resolution must be greater than zero');
  if (slug === 'image-scaling') return a ? { primary: `${decimal.format(b / a * c)} px tall` } : invalid('Original width must be greater than zero');
  return invalid('This calculator is not configured');
}

function calculateDates(slug: string, values: string[]): CalculationResult {
  const start = parseDate(values[0]); const end = parseDate(values[1]);
  if (!start || !end) return invalid('Enter valid dates');
  if (slug === 'age') { if (start > end) return invalid('Date of birth must be on or before the as-of date'); let years = end.getUTCFullYear() - start.getUTCFullYear(); let months = end.getUTCMonth() - start.getUTCMonth(); let days = end.getUTCDate() - start.getUTCDate(); if (days < 0) { months--; days += new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0)).getUTCDate(); } if (months < 0) { years--; months += 12; } return { primary: `${years} years, ${months} months, ${days} days` }; }
  const low = start < end ? start : end; const high = start < end ? end : start;
  if (slug === 'working-days') { let count = 0; const cursor = new Date(low); while (cursor <= high) { if (cursor.getUTCDay() !== 0 && cursor.getUTCDay() !== 6) count++; cursor.setUTCDate(cursor.getUTCDate() + 1); } return { primary: `${whole.format(count)} weekdays` }; }
  return invalid('This date calculator is not configured');
}

type Unit = { label: string; toBase: (n: number) => number; fromBase: (n: number) => number };
const linear = (label: string, factor: number): Unit => ({ label, toBase: n => n * factor, fromBase: n => n / factor });
export const converterUnits: Record<string, Record<string, Unit>> = {
  unit: { meters: linear('Meters', 1), feet: linear('Feet', .3048), kilometers: linear('Kilometers', 1000), miles: linear('Miles', 1609.344) },
  length: { millimeters: linear('Millimeters', .001), centimeters: linear('Centimeters', .01), meters: linear('Meters', 1), kilometers: linear('Kilometers', 1000), inches: linear('Inches', .0254), feet: linear('Feet', .3048), yards: linear('Yards', .9144), miles: linear('Miles', 1609.344) },
  area: { squareMillimeters: linear('Square millimeters', 1e-6), squareCentimeters: linear('Square centimeters', 1e-4), squareMeters: linear('Square meters', 1), squareKilometers: linear('Square kilometers', 1e6), squareInches: linear('Square inches', .00064516), squareFeet: linear('Square feet', .09290304), squareYards: linear('Square yards', .83612736), squareMiles: linear('Square miles', 2589988.110336) },
  volume: { cubicMillimeters: linear('Cubic millimeters', 1e-9), cubicCentimeters: linear('Cubic centimeters', 1e-6), cubicMeters: linear('Cubic meters', 1), cubicKilometers: linear('Cubic kilometers', 1e9), cubicInches: linear('Cubic inches', .000016387064), cubicFeet: linear('Cubic feet', .028316846592), cubicYards: linear('Cubic yards', .764554857984), cubicMiles: linear('Cubic miles', 4168181825.44058) },
  liquid: { milliliters: linear('Milliliters', .001), liters: linear('Liters', 1), usFluidOunces: linear('US fluid ounces', .0295735295625), usGallons: linear('US gallons', 3.785411784), imperialFluidOunces: linear('Imperial fluid ounces', .0284130625), imperialGallons: linear('Imperial gallons', 4.54609), pints: linear('US pints', .473176473), quarts: linear('US quarts', .946352946) },
  weight: { grams: linear('Grams', 1), kilograms: linear('Kilograms', 1000), tonnes: linear('Tonnes', 1_000_000), ounces: linear('Ounces', 28.349523125), pounds: linear('Pounds', 453.59237), usTons: linear('US Tons', 907184.74), stones: linear('Stones', 6350.29318) },
  speed: { kph: linear('km/h', 1), mph: linear('mph', 1.609344), knots: linear('knots', 1.852), mps: linear('m/s', 3.6) },
  energy: { wattHours: linear('Wh', 1), kilowattHours: linear('kWh', 1000), megajoules: linear('MJ', 277.77777777777777), joules: linear('J', 1 / 3600) },
  power: { watts: linear('W', .001), kw: linear('kW', 1), megawatts: linear('MW', 1000), hp: linear('Horsepower', .745699872) },
  temperature: { celsius: { label: 'Celsius', toBase: n => n, fromBase: n => n }, fahrenheit: { label: 'Fahrenheit', toBase: n => (n - 32) * 5 / 9, fromBase: n => n * 9 / 5 + 32 }, kelvin: { label: 'Kelvin', toBase: n => n - 273.15, fromBase: n => n + 273.15 } },
  'fuel-economy': { mpg: { label: 'US MPG', toBase: n => 235.214583 / n, fromBase: n => 235.214583 / n }, imperialMpg: { label: 'Imperial MPG', toBase: n => 282.480936 / n, fromBase: n => 282.480936 / n }, l100km: { label: 'L/100 km', toBase: n => n, fromBase: n => n }, kml: { label: 'km/L', toBase: n => 100 / n, fromBase: n => 100 / n } },
};
export function convertCore(slug: string, value: string, from: string, to: string): CalculationResult {
  const units = converterUnits[slug];
  if (!units || !value.trim()) return invalid('Enter a valid value');
  const n = Number(value);
  if (!Number.isFinite(n)) return invalid('Enter a valid value');
  if (slug !== 'temperature' && n < 0) return invalid('Value cannot be negative');
  if (slug === 'fuel-economy' && n <= 0) return invalid('Fuel economy must be greater than zero');
  if (slug === 'fuel-economy' && (n < 0.0001 || n > 1_000_000)) return invalid('Enter fuel economy between 0.0001 and 1,000,000');
  const source = units[from]; const target = units[to]; if (!source || !target) return invalid('Choose valid units');
  const baseValue = source.toBase(n);
  if (slug === 'temperature' && baseValue < -273.15 - Number.EPSILON) return invalid('Temperature cannot be below absolute zero');
  const converted = target.fromBase(baseValue);
  if (!Number.isFinite(baseValue) || !Number.isFinite(converted) || (slug === 'fuel-economy' && converted > 1_000_000)) return invalid('This value produces a result too large to convert');
  return { primary: `${decimal.format(converted)} ${target.label}` };
}

const methodology = (method: string, assumptions: string, example: string, limitation: string) => ({ method, assumptions, example, limitation });
export const coreMethodology: Record<string, { method: string; assumptions: string; example: string; limitation: string }> = {
  percentage: methodology('Multiplies the percentage by the base value and divides by 100.', 'A percentage is expressed as a part of the entered base.', '18% of 240 is 43.2.', 'It does not calculate percentage change; use Percentage Increase / Decrease for that.'),
  loan: methodology('Uses the standard fixed-payment amortization formula over monthly payments.', 'Rate is fixed for the full term; payments are monthly.', 'A $24,000 five-year loan at 7.2% has a calculated monthly payment.', 'Fees, prepayments, and changing rates are excluded.'),
  mortgage: methodology('Calculates principal-and-interest amortization, then adds entered monthly tax and insurance.', 'Rate, tax, and insurance stay constant; payments are monthly.', 'Enter the purchase price, down payment, rate, term, annual tax, and insurance.', 'PMI, HOA dues, closing costs, and changing escrow are excluded.'),
  savings: methodology('Compounds the starting balance monthly and adds each monthly contribution at month end.', 'Rate and contribution remain constant for the entered time.', 'A $1,200 start plus $300 per month grows over the selected years.', 'Taxes, account fees, and variable returns are excluded.'),
  vat: methodology('Adds VAT by multiplying by 1 + rate, or removes it by dividing by that factor.', 'The entered price is net when adding VAT and gross when removing it.', 'At 20%, $100 net becomes $120 gross.', 'Rules and rounding requirements vary by jurisdiction.'),
  salary: methodology('Divides annual pay into monthly, weekly, and hourly equivalents using entered work time.', 'Annual salary is before deductions and hours are paid hours.', '$60,000 over 40 hours for 52 weeks is about $28.85 per hour.', 'Taxes, benefits, unpaid leave, and overtime are excluded.'),
  age: methodology('Compares calendar year, month, and day parts rather than dividing days by 365.', 'Dates are calendar dates in the selected local date fields.', 'A birth date of 2000-02-29 is 24 years old on 2024-02-29.', 'Time of birth and time-zone edge cases are not included.'),
  'working-days': methodology('Counts each Monday through Friday inclusively between the two dates.', 'Weekends are Saturday and Sunday and both endpoints are included.', 'A Monday through Friday range counts as 5 weekdays.', 'Public holidays and regional work schedules are not removed.'),
  area: methodology('Converts both rectangular dimensions to one canonical length, multiplies them, then converts the square result to the selected output unit.', 'Length and width share the selected dimension unit, from millimetres through miles.', '12 m by 8 m equals 96 m², which is about 1,033.34 ft².', 'Circles, triangles, and irregular outlines need their own formulas.'),
  volume: methodology('Converts all three rectangular dimensions to one canonical length, multiplies them, then converts the cubic result to the selected output unit.', 'Length, width, and height share the selected dimension unit, from millimetres through miles.', '4 m × 3 m × 2.5 m equals 30 m³, which is about 1,059.44 ft³.', 'It does not calculate cylinders, spheres, or irregular volumes.'),
  ...Object.fromEntries(Object.keys(coreFields).filter((slug) => !['percentage', 'loan', 'mortgage', 'savings', 'vat', 'salary', 'age', 'working-days', 'area', 'volume'].includes(slug)).map((slug) => [slug, methodology(`Calculates the result from the displayed ${coreFields[slug].map((field) => field.label.toLowerCase()).join(', ')}.`, 'Values use the displayed units and update the estimate immediately.', 'Use the starting values as a worked example.', 'Rounding and real-world conditions can affect a final decision.')])),
  ...Object.fromEntries(Object.keys(converterUnits).map((slug) => [slug, methodology('Converts the entered value through a common base unit, then into the selected destination unit.', 'Choose the source and destination units that match the value.', 'Try 1 metre to feet or 32 °F to Celsius.', 'Display rounding can make a reverse conversion differ slightly.')])),
};