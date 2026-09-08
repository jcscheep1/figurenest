import { formatCurrency, type CurrencyCode } from './units-preferences';

export type PriorityFinanceSlug =
  | 'auto-loan'
  | 'interest-rate'
  | 'mortgage-amortization'
  | 'mortgage-payoff'
  | 'simple-interest';

export type PriorityFinanceField = {
  key: string;
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: string;
};

export type PriorityFinanceResult = {
  primary: string;
  summary: string;
  details: { label: string; value: string }[];
  error?: string;
};

type Example = {
  title: string;
  inputs: string;
  working: string;
  result: string;
  interpretation: string;
};

export type PriorityFinanceContent = {
  slug: PriorityFinanceSlug;
  title: string;
  titleLines: readonly [string, string];
  description: string;
  seoTitle: string;
  seoDescription: string;
  resultLabel: string;
  formula: string;
  formulaExplanation: string;
  fields: readonly PriorityFinanceField[];
  whenUseful: readonly string[];
  examples: readonly Example[];
  interpretation: readonly string[];
  assumptions: readonly string[];
  limitations: string;
  edgeCases: readonly { title: string; explanation: string }[];
  faqs: readonly { question: string; answer: string }[];
  relatedSlugs: readonly string[];
  sources: readonly { label: string; href: string }[];
};

const commonSources = [
  { label: 'Consumer Financial Protection Bureau — loan disclosures and costs', href: 'https://www.consumerfinance.gov/consumer-tools/auto-loans/' },
  { label: 'Investor.gov — understanding interest and compound growth', href: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
] as const;

export const priorityFinanceContent: Record<PriorityFinanceSlug, PriorityFinanceContent> = {
  'auto-loan': {
    slug: 'auto-loan',
    title: 'Auto Loan Calculator',
    titleLines: ['Auto Loan', 'Calculator'],
    description: 'Estimate a vehicle loan payment from the purchase price, cash down, trade-in credit, tax, fees, rate, and term.',
    seoTitle: 'Auto Loan Calculator — Payment & Total Cost | FigureNest',
    seoDescription: 'Estimate an auto loan payment, financed amount, total interest, and total loan cost using price, down payment, trade-in, tax, fees, rate, and term.',
    resultLabel: 'ESTIMATED MONTHLY PAYMENT',
    formula: 'Financed amount = price + tax + fees − down payment − trade-in; M = P × i ÷ [1 − (1 + i)⁻ⁿ]',
    formulaExplanation: 'The calculator first estimates the amount financed. It then applies the standard fixed-rate amortization formula, where P is financed principal, i is the monthly rate, and n is the number of monthly payments.',
    fields: [
      { key: 'price', label: 'Vehicle price', value: '32000', prefix: '$', min: 0 },
      { key: 'down', label: 'Cash down payment', value: '4000', prefix: '$', min: 0 },
      { key: 'trade', label: 'Trade-in credit', value: '3000', prefix: '$', min: 0 },
      { key: 'rate', label: 'Annual interest rate', value: '6.5', suffix: '%', min: 0, max: 100 },
      { key: 'months', label: 'Loan term', value: '60', suffix: 'months', min: 1, max: 120, step: '1' },
      { key: 'tax', label: 'Sales tax rate', value: '6', suffix: '%', min: 0, max: 100 },
      { key: 'fees', label: 'Financed fees', value: '500', prefix: '$', min: 0 },
    ],
    whenUseful: [
      'Compare vehicles using the amount financed and total borrowing cost, not only the advertised monthly payment.',
      'Test how a larger down payment or shorter term changes both the payment and lifetime interest.',
      'Separate the loan estimate from recurring ownership costs such as insurance, fuel, servicing, registration renewals, and parking.',
    ],
    examples: [{
      title: 'Five-year vehicle loan',
      inputs: '$32,000 price, $4,000 down, $3,000 trade-in, 6% tax, $500 fees, 6.5% for 60 months',
      working: '$27,420 is financed and amortized over 60 equal monthly payments.',
      result: 'About $536.50 per month, with approximately $4,770 in total interest.',
      interpretation: 'The down payment and trade-in reduce principal, while financed tax and fees increase it. Dealer or lender figures can differ because tax treatment and fee timing vary.',
    }],
    interpretation: [
      'The monthly result is the scheduled principal-and-interest payment for the estimated financed amount. It is not the complete monthly cost of owning the vehicle.',
      'A longer term usually lowers the monthly payment but keeps the balance outstanding longer, which can increase total interest and the risk of owing more than the vehicle is worth.',
    ],
    assumptions: ['Fixed nominal annual rate divided into 12 monthly periods.', 'Equal monthly payments with no balloon amount.', 'Sales tax is applied to the entered vehicle price before credits.', 'All entered fees are financed.'],
    limitations: 'Taxable price, trade-in treatment, registration charges, dealer fees, rebates, and lender compounding vary by country and jurisdiction. This planning estimate is not a credit offer or finance disclosure; compare the lender’s APR, amount financed, total of payments, and contract terms.',
    edgeCases: [
      { title: 'Zero interest', explanation: 'The financed amount is divided evenly by the number of months.' },
      { title: 'Credits exceed purchase cost', explanation: 'The calculator stops rather than displaying a negative loan.' },
      { title: 'Very long term', explanation: 'Terms above 120 months are rejected because they are outside the supported planning range.' },
    ],
    faqs: [
      { question: 'Does the auto loan payment include insurance?', answer: 'No. The result covers the modeled loan payment only. Insurance, fuel, maintenance, and recurring registration costs are separate.' },
      { question: 'Should I enter the interest rate or APR?', answer: 'Enter the note rate used for the scheduled payment. APR may include certain finance charges and is useful for comparing offers, but it may not reproduce the payment when entered as the note rate.' },
      { question: 'How does a trade-in affect the estimate?', answer: 'The entered trade-in credit reduces the amount financed. Actual tax treatment and any existing trade-in loan balance depend on the transaction and jurisdiction.' },
      { question: 'Why is the dealer payment different?', answer: 'A quote may use different taxable amounts, fees, rebates, payment timing, add-ons, or lender rounding. Use the signed disclosure for the binding figures.' },
    ],
    relatedSlugs: ['loan', 'fuel-cost', 'mortgage-amortization'],
    sources: commonSources,
  },
  'interest-rate': {
    slug: 'interest-rate',
    title: 'Interest Rate Calculator',
    titleLines: ['Interest Rate', 'Calculator'],
    description: 'Estimate the nominal annual rate implied by a fixed loan amount, monthly payment, and number of payments.',
    seoTitle: 'Interest Rate Calculator — Estimate Loan Rate | FigureNest',
    seoDescription: 'Estimate the annual interest rate implied by a loan principal, fixed monthly payment, and term using a numerical amortization-rate solution.',
    resultLabel: 'ESTIMATED NOMINAL ANNUAL RATE',
    formula: 'Find i where payment = P × i ÷ [1 − (1 + i)⁻ⁿ]; annual nominal rate = 12i',
    formulaExplanation: 'Because the rate appears more than once in the payment equation, it is solved numerically. FigureNest brackets the monthly rate and repeatedly narrows the interval until the calculated payment matches the entered payment.',
    fields: [
      { key: 'principal', label: 'Loan principal', value: '24000', prefix: '$', min: 0 },
      { key: 'payment', label: 'Monthly payment', value: '477.50', prefix: '$', min: 0 },
      { key: 'months', label: 'Number of payments', value: '60', suffix: 'months', min: 1, max: 1200, step: '1' },
    ],
    whenUseful: ['Check the approximate rate implied by a fixed payment quote.', 'Compare payment-based offers on a common term.', 'Identify when a payment is too low to repay the entered principal within the stated term.'],
    examples: [{
      title: 'Rate implied by a payment',
      inputs: '$24,000 principal, $477.50 monthly, 60 payments',
      working: 'The solver tests monthly rates until the amortized payment matches $477.50.',
      result: 'Approximately 7.20% nominal annual interest.',
      interpretation: 'The result estimates a note rate under standard monthly amortization. It is not an APR and does not infer fees.',
    }],
    interpretation: [
      'The estimated rate is nominal annual interest based on monthly periods. It should be compared with the contract note rate, not assumed to be a fee-inclusive APR.',
      'Small differences in rounded payment amounts can shift the solved rate, especially for short terms.',
      'Use the solved rate as a consistency check rather than proof of a lender’s disclosure. If loan proceeds are lower than the stated principal because a fee is withheld, or if the final payment differs from the regular payment, the three entered values no longer describe the complete cash flow. Compare offers using the same principal definition, payment frequency, term, and fee treatment.',
    ],
    assumptions: ['The full principal is outstanding at the start.', 'Payments are equal and monthly.', 'No fees are deducted from proceeds or financed separately.', 'The loan fully amortizes after the final payment.'],
    limitations: 'The result does not calculate APR, effective annual yield, irregular payment dates, daily interest, introductory rates, balloon payments, or lender fees. A payment quote alone may not contain enough information to reconstruct a regulated disclosure. The solver assumes the quoted payment begins one month after borrowing and remains unchanged through the final month; weekly, biweekly, deferred, interest-only, or graduated-payment loans require their own cash-flow schedule.',
    edgeCases: [
      { title: 'Payment equals principal divided by months', explanation: 'The implied rate is 0%.' },
      { title: 'Payment is too low', explanation: 'If total scheduled payments do not cover principal, no non-negative amortizing rate exists.' },
      { title: 'Rounded payment', explanation: 'The inferred rate is approximate because quoted payments are commonly rounded to cents.' },
    ],
    faqs: [
      { question: 'Is the result an APR?', answer: 'No. It is the nominal annual rate implied by the entered principal, payment, and term. APR can include certain fees and uses jurisdiction-specific disclosure rules.' },
      { question: 'Why does this calculator use an iterative method?', answer: 'The unknown rate appears inside a power and elsewhere in the amortization formula, so it is more reliable to solve numerically than to rearrange it with ordinary arithmetic.' },
      { question: 'Can a payment be too low to solve?', answer: 'Yes. If the payment is below principal divided by the number of payments, even a 0% loan would not be repaid in time.' },
    ],
    relatedSlugs: ['loan', 'simple-interest', 'mortgage-amortization'],
    sources: commonSources,
  },
  'mortgage-amortization': {
    slug: 'mortgage-amortization',
    title: 'Mortgage Amortization Calculator',
    titleLines: ['Mortgage Amortization', 'Calculator'],
    description: 'Estimate the scheduled payment and inspect principal, interest, and remaining balance at a selected payment number.',
    seoTitle: 'Mortgage Amortization Calculator — Balance Snapshot | FigureNest',
    seoDescription: 'Calculate a fixed mortgage payment and see principal, interest, cumulative principal, cumulative interest, and balance at any scheduled payment.',
    resultLabel: 'SCHEDULED MONTHLY PAYMENT',
    formula: 'M = P × i ÷ [1 − (1 + i)⁻ⁿ]; balance after k payments = P(1+i)ᵏ − M[(1+i)ᵏ−1]÷i',
    formulaExplanation: 'The fixed payment is calculated first. The selected payment’s opening balance determines that month’s interest; the remainder of the payment reduces principal. The balance formula summarizes all scheduled payments through month k.',
    fields: [
      { key: 'principal', label: 'Mortgage principal', value: '300000', prefix: '$', min: 0 },
      { key: 'rate', label: 'Annual interest rate', value: '6', suffix: '%', min: 0, max: 100 },
      { key: 'years', label: 'Amortization term', value: '30', suffix: 'years', min: 1, max: 50 },
      { key: 'paymentNumber', label: 'Inspect payment number', value: '12', min: 1, max: 600, step: '1' },
    ],
    whenUseful: ['See how a level payment is divided between interest and principal.', 'Estimate the remaining scheduled balance after a chosen number of payments.', 'Compare the early and later stages of a fixed-rate mortgage.'],
    examples: [{
      title: 'End of the first year',
      inputs: '$300,000 mortgage at 6% for 30 years; inspect payment 12',
      working: 'The fixed payment is calculated over 360 months, then the first 12 payment periods are summarized.',
      result: 'About $1,798.65 monthly; roughly $296,316 remains after payment 12.',
      interpretation: 'Early payments contain more interest because the outstanding balance is still close to the original principal.',
    }],
    interpretation: [
      'Amortization is the gradual repayment of principal through scheduled payments. With a conventional fixed payment, the interest share normally declines as the balance falls.',
      'The displayed snapshot excludes taxes, insurance, mortgage insurance, fees, and any unscheduled payment activity.',
      'A balance snapshot is especially useful when checking a statement or estimating equity, but it is not a property-value estimate. Equity also depends on the home’s current value and any other secured borrowing. When comparing two mortgages, inspect both the payment and how quickly principal falls; a lower payment can accompany a much longer repayment period.',
    ],
    assumptions: ['Fixed rate and equal monthly principal-and-interest payments.', 'Payments occur exactly once per month.', 'No extra payments, skipped payments, fees, or rate resets.', 'The selected payment is within the contractual term.'],
    limitations: 'This is a mathematical schedule, not a lender statement. Mortgage conventions can differ by country, including compounding frequency, day-count rules, payment frequency, and terminology. Confirm the official amortization schedule supplied by the lender. The model is a generic monthly fixed-rate calculation current as of September 2026; it does not claim to reproduce Canadian semi-annual compounding, UK daily-interest servicing, adjustable-rate resets, or another jurisdiction-specific convention.',
    edgeCases: [
      { title: 'Zero-rate mortgage', explanation: 'Every payment reduces principal by an equal amount.' },
      { title: 'Final payment', explanation: 'The remaining balance is constrained to zero after the last scheduled payment.' },
      { title: 'Payment outside the term', explanation: 'The calculator asks for a whole-number payment no greater than the total number of scheduled monthly payments.' },
    ],
    faqs: [
      { question: 'Why is so much of an early mortgage payment interest?', answer: 'Monthly interest is calculated on the outstanding balance. The balance is largest near the beginning, so the interest amount is also largest then.' },
      { question: 'Does this include property tax or insurance?', answer: 'No. The schedule covers principal and interest only. Use the main Mortgage Calculator for a broader monthly estimate that includes entered tax and insurance.' },
      { question: 'Is this schedule valid for every country?', answer: 'No. The formula models monthly compounding and monthly payments. Canadian, UK, and other mortgage conventions may use different rate or payment rules.' },
    ],
    relatedSlugs: ['mortgage', 'mortgage-payoff', 'interest-rate'],
    sources: [
      { label: 'Consumer Financial Protection Bureau — how mortgage payments work', href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-mortgage-en-99/' },
      ...commonSources,
    ],
  },
  'mortgage-payoff': {
    slug: 'mortgage-payoff',
    title: 'Mortgage Payoff Calculator',
    titleLines: ['Mortgage Payoff', 'Calculator'],
    description: 'Estimate how an additional monthly principal payment may change payoff time and remaining interest.',
    seoTitle: 'Mortgage Payoff Calculator — Extra Payment | FigureNest',
    seoDescription: 'Estimate mortgage payoff time, interest, and months saved when adding a recurring extra principal payment to the current monthly payment.',
    resultLabel: 'ESTIMATED PAYOFF TIME',
    formula: 'Each month: interest = balance × annual rate ÷ 12; principal paid = regular payment + extra payment − interest',
    formulaExplanation: 'The calculator advances one month at a time. Interest is charged on the opening balance, then the entered regular and extra amounts reduce the balance. It compares that result with the same loan using no extra payment.',
    fields: [
      { key: 'balance', label: 'Current principal balance', value: '240000', prefix: '$', min: 0 },
      { key: 'rate', label: 'Annual interest rate', value: '5.5', suffix: '%', min: 0, max: 100 },
      { key: 'payment', label: 'Current monthly principal & interest', value: '1600', prefix: '$', min: 0 },
      { key: 'extra', label: 'Extra monthly principal', value: '200', prefix: '$', min: 0 },
    ],
    whenUseful: ['Estimate the effect of a recurring extra payment before changing a household budget.', 'Compare months saved with the interest that remains under each scenario.', 'Check whether the current payment is large enough to reduce principal.'],
    examples: [{
      title: 'Recurring extra principal',
      inputs: '$240,000 balance at 5.5%, $1,600 current payment, plus $200 monthly',
      working: 'Monthly interest is charged to the declining balance and both payment amounts are applied until the balance reaches zero.',
      result: 'The extra payment shortens the modeled payoff and reduces remaining interest compared with paying $1,600 alone.',
      interpretation: 'Savings depend on the lender applying the extra amount promptly to principal without a prepayment charge.',
    }],
    interpretation: [
      'A shorter modeled payoff does not automatically mean extra mortgage payments are the best use of cash. Compare liquidity needs, emergency reserves, other debt rates, taxes, and alternative uses of the money.',
      'The result models one consistent extra amount; occasional or changing payments will produce a different schedule.',
      'Before sending more than the scheduled amount, verify how the servicer labels and applies it. An amount held for a future installment does not reduce principal at the same time as an immediate principal-only payment. Retain the confirmation and compare the next statement’s principal balance with the expected direction of change.',
    ],
    assumptions: ['Interest accrues monthly on the opening balance.', 'The regular and extra payments are made every month.', 'Extra amounts are applied directly to principal.', 'The interest rate remains fixed.'],
    limitations: 'The estimate excludes escrow, late charges, prepayment penalties, daily-interest timing, rate changes, payment recasting, and lender-specific allocation rules. Ask the servicer how to designate extra principal and request an official payoff statement before closing a loan. It models a generic fixed-rate monthly mortgage as of September 2026, not the prepayment rules, tax consequences, or consumer protections of a particular country.',
    edgeCases: [
      { title: 'Payment does not cover interest', explanation: 'The calculator stops because the balance would not amortize.' },
      { title: 'Zero balance', explanation: 'A zero current balance is already paid off.' },
      { title: 'Very slow payoff', explanation: 'Scenarios requiring more than 100 years are outside the supported range.' },
    ],
    faqs: [
      { question: 'Does an extra mortgage payment always reduce interest?', answer: 'It generally does when the lender applies it immediately to principal and no offsetting fee applies. The exact effect depends on timing and servicing rules.' },
      { question: 'Is this the same as an official payoff quote?', answer: 'No. An official quote can include daily interest, fees, and a date through which the amount is valid.' },
      { question: 'Should I pay extra monthly or as a lump sum?', answer: 'Earlier principal reduction generally avoids more future interest, but the right choice depends on cash availability and lender rules. This page models a recurring monthly amount.' },
    ],
    relatedSlugs: ['mortgage', 'mortgage-amortization', 'compound-interest'],
    sources: [
      { label: 'Consumer Financial Protection Bureau — mortgage servicing and extra payments', href: 'https://www.consumerfinance.gov/ask-cfpb/can-i-make-additional-payments-on-my-mortgage-en-2077/' },
      ...commonSources,
    ],
  },
  'simple-interest': {
    slug: 'simple-interest',
    title: 'Simple Interest Calculator',
    titleLines: ['Simple Interest', 'Calculator'],
    description: 'Calculate interest on an unchanged principal using a stated annual rate and time period.',
    seoTitle: 'Simple Interest Calculator — Formula & Example | FigureNest',
    seoDescription: 'Calculate simple interest and ending amount from principal, annual rate, and time using I = P × r × t, with a worked example and limitations.',
    resultLabel: 'SIMPLE INTEREST',
    formula: 'I = P × r × t; ending amount = P + I',
    formulaExplanation: 'P is the original principal, r is the annual rate written as a decimal, and t is time in years. Unlike compound interest, previously earned interest is never added to the base used for later periods.',
    fields: [
      { key: 'principal', label: 'Principal', value: '5000', prefix: '$', min: 0 },
      { key: 'rate', label: 'Annual interest rate', value: '6', suffix: '%', min: 0, max: 100 },
      { key: 'years', label: 'Time', value: '3', suffix: 'years', min: 0, max: 100 },
    ],
    whenUseful: ['Check classroom examples and contracts that explicitly state simple interest.', 'Separate original principal from interest earned or charged.', 'Compare a non-compounding result with a compound-interest projection.'],
    examples: [{
      title: 'Three-year simple interest',
      inputs: '$5,000 principal at 6% per year for 3 years',
      working: '$5,000 × 0.06 × 3',
      result: '$900 interest and a $5,900 ending amount.',
      interpretation: 'Each year adds the same $300 because the interest base remains $5,000.',
    }],
    interpretation: [
      'Simple interest grows in a straight line when principal, rate, and time remain fixed. Doubling the time doubles the interest.',
      'Many real savings products and amortizing loans do not use this exact model, so verify the contract before relying on it.',
      'The formula is most informative when the agreement explicitly applies one annual rate to an unchanged principal. If principal is repaid during the period, interest should normally be calculated against each outstanding balance instead. If earned interest is credited back to an account, later interest may compound and the simple-interest answer will understate growth.',
      'Keep the time unit aligned with the quoted rate. Six months is 0.5 years for an annual rate, while 45 days requires the day-count convention stated by the agreement. Dividing by 365 is common in examples, but some financial contracts use 360 days or count actual days differently.',
    ],
    assumptions: ['The principal does not change.', 'The annual rate remains fixed.', 'Time is entered in years and proportional years are allowed.', 'No interest is reinvested or added to principal.'],
    limitations: 'The calculator does not model compounding, periodic repayments, changing balances, fees, taxes, day-count conventions, or leap-year adjustments. It is an educational arithmetic tool, not an account quote or lending disclosure. Rates advertised for deposits or credit may be effective annual rates, nominal rates, or regulated APR figures; those labels are not interchangeable with the simple annual percentage entered here.',
    edgeCases: [
      { title: 'Zero rate or time', explanation: 'Interest is zero and the ending amount equals principal.' },
      { title: 'Fractional years', explanation: 'Decimals such as 0.5 model a proportional half-year under the simple formula.' },
      { title: 'Compound products', explanation: 'Use the Compound Interest Calculator when interest is periodically added to the balance.' },
    ],
    faqs: [
      { question: 'What is simple interest?', answer: 'Simple interest is calculated only on the original principal: principal multiplied by annual rate and time.' },
      { question: 'How is simple interest different from compound interest?', answer: 'Compound interest adds accumulated interest to the balance used for later growth. Simple interest keeps the original principal as the calculation base.' },
      { question: 'Can I enter months?', answer: 'Convert months to years by dividing by 12. For example, 6 months is 0.5 years.' },
    ],
    relatedSlugs: ['compound-interest', 'interest-rate', 'loan'],
    sources: [
      { label: 'Consumer Financial Protection Bureau — interest and loan cost basics', href: 'https://www.consumerfinance.gov/consumer-tools/educator-tools/youth-financial-education/teach/activities/learning-about-loans/' },
      ...commonSources,
    ],
  },
};

const maximumAmount = 1_000_000_000_000;
const decimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const smallPositiveRate = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 2 });

const payment = (principal: number, annualRate: number, months: number) => {
  if (annualRate === 0) return principal / months;
  const monthlyRate = annualRate / 1200;
  return principal * monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate));
};

const invalid = (message: string): PriorityFinanceResult => ({
  primary: message,
  summary: message,
  details: [],
  error: message,
});

function readInputs(values: string[]) {
  if (values.some((value) => !value.trim())) return undefined;
  const numbers = values.map(Number);
  return numbers.every((value) => Number.isFinite(value) && value >= 0) ? numbers : undefined;
}

function payoffMonths(balance: number, annualRate: number, monthlyPayment: number) {
  if (balance === 0) return { months: 0, interest: 0 };
  const monthlyRate = annualRate / 1200;
  if (monthlyPayment <= balance * monthlyRate) return undefined;
  let remaining = balance;
  let interest = 0;
  let months = 0;
  while (remaining > 0.005 && months < 1200) {
    const charge = remaining * monthlyRate;
    const paid = Math.min(monthlyPayment, remaining + charge);
    interest += charge;
    remaining = Math.max(0, remaining + charge - paid);
    months += 1;
  }
  return remaining <= 0.005 ? { months, interest } : undefined;
}

export function calculatePriorityFinance(
  slug: PriorityFinanceSlug,
  values: string[],
  currency: CurrencyCode = 'USD',
): PriorityFinanceResult {
  const n = readInputs(values);
  if (!n) return invalid('Complete every field with a valid non-negative value');
  if (n.some((value) => value > maximumAmount)) return invalid('Enter monetary amounts no greater than one trillion');
  const money = (value: number) => formatCurrency(value, currency);

  if (slug === 'auto-loan') {
    const [price, down, trade, rate, months, taxRate, fees] = n;
    if (!Number.isInteger(months) || months < 1 || months > 120 || rate > 100 || taxRate > 100) return invalid('Use a whole-number term of 1–120 months and percentage rates no greater than 100%');
    const financed = price * (1 + taxRate / 100) + fees - down - trade;
    if (financed < 0) return invalid('Down payment and trade-in cannot exceed the estimated purchase cost');
    const monthly = financed === 0 ? 0 : payment(financed, rate, months);
    const total = monthly * months;
    return {
      primary: money(monthly),
      summary: 'Estimated fixed principal-and-interest payment.',
      details: [
        { label: 'Estimated amount financed', value: money(financed) },
        { label: 'Total of loan payments', value: money(total) },
        { label: 'Total loan interest', value: money(Math.max(0, total - financed)) },
      ],
    };
  }

  if (slug === 'simple-interest') {
    const [principal, rate, years] = n;
    if (rate > 100 || years > 100) return invalid('Use an annual rate no greater than 100% and a time no longer than 100 years');
    const interest = principal * rate / 100 * years;
    return {
      primary: money(interest),
      summary: 'Interest calculated only on the original principal.',
      details: [{ label: 'Ending amount', value: money(principal + interest) }],
    };
  }

  if (slug === 'interest-rate') {
    const [principal, monthlyPayment, months] = n;
    if (!principal || !Number.isInteger(months) || months < 1 || months > 1200) return invalid('Principal must be greater than zero; use a whole number of 1–1,200 monthly payments');
    const zeroRatePayment = principal / months;
    if (monthlyPayment + 0.0000001 < zeroRatePayment) return invalid('The payment is too low to repay this principal within the entered term');
    if (Math.abs(monthlyPayment - zeroRatePayment) < 0.0000001) {
      return { primary: '0%', summary: 'The entered payment repays principal evenly with no interest.', details: [{ label: 'Total paid', value: money(monthlyPayment * months) }] };
    }
    let low = 0;
    let high = 100 / 12;
    if (payment(principal, high * 12, months) < monthlyPayment) return invalid('The implied rate is above the supported 100% nominal annual range');
    for (let index = 0; index < 100; index += 1) {
      const middle = (low + high) / 2;
      if (payment(principal, middle * 12, months) < monthlyPayment) low = middle;
      else high = middle;
    }
    const annualRate = ((low + high) / 2) * 12;
    const standardRate = decimal.format(annualRate);
    const displayedRate = annualRate > 0 && standardRate === '0'
      ? smallPositiveRate.format(annualRate)
      : standardRate;
    return {
      primary: `${displayedRate}%`,
      summary: 'Approximate nominal annual rate based on monthly amortization.',
      details: [
        { label: 'Total scheduled payments', value: money(monthlyPayment * months) },
        { label: 'Interest above principal', value: money(monthlyPayment * months - principal) },
      ],
    };
  }

  if (slug === 'mortgage-amortization') {
    const [principal, rate, years, selectedPayment] = n;
    const months = years * 12;
    if (
      !principal
      || years < 1
      || years > 50
      || rate > 100
      || !Number.isInteger(months)
      || !Number.isInteger(selectedPayment)
      || selectedPayment < 1
      || selectedPayment > months
    ) return invalid('Use a 1–50 year term that resolves to whole months and a whole-number payment within that term');
    const k = selectedPayment;
    const monthly = payment(principal, rate, months);
    const monthlyRate = rate / 1200;
    const remainingBefore = months - (k - 1);
    const balanceBefore = monthlyRate === 0
      ? monthly * remainingBefore
      : monthly * -Math.expm1(-remainingBefore * Math.log1p(monthlyRate)) / monthlyRate;
    const interestForPayment = balanceBefore * monthlyRate;
    const principalForPayment = Math.min(balanceBefore, monthly - interestForPayment);
    const balanceAfter = Math.max(0, balanceBefore - principalForPayment);
    const cumulativePrincipal = principal - balanceAfter;
    const cumulativeInterest = monthly * k - cumulativePrincipal;
    return {
      primary: money(monthly),
      summary: `Payment ${k} amortization snapshot.`,
      details: [
        { label: `Principal in payment ${k}`, value: money(principalForPayment) },
        { label: `Interest in payment ${k}`, value: money(interestForPayment) },
        { label: `Balance after payment ${k}`, value: money(balanceAfter) },
        { label: 'Cumulative principal', value: money(cumulativePrincipal) },
        { label: 'Cumulative interest', value: money(Math.max(0, cumulativeInterest)) },
      ],
    };
  }

  const [balance, rate, currentPayment, extraPayment] = n;
  if (rate > 100) return invalid('Use an annual rate no greater than 100%');
  if (balance === 0) return { primary: 'Already paid off', summary: 'The entered principal balance is zero.', details: [] };
  const accelerated = payoffMonths(balance, rate, currentPayment + extraPayment);
  const baseline = payoffMonths(balance, rate, currentPayment);
  if (!accelerated) return invalid('The combined payment does not repay this balance within the supported range');
  const years = Math.floor(accelerated.months / 12);
  const months = accelerated.months % 12;
  return {
    primary: `${years} yr ${months} mo`,
    summary: 'Estimated time until the principal balance reaches zero.',
    details: [
      { label: 'Estimated remaining interest', value: money(accelerated.interest) },
      { label: 'Months saved', value: baseline ? String(Math.max(0, baseline.months - accelerated.months)) : 'Not available' },
      { label: 'Estimated interest saved', value: baseline ? money(Math.max(0, baseline.interest - accelerated.interest)) : 'Not available' },
    ],
  };
}

export const isPriorityFinanceSlug = (slug: string): slug is PriorityFinanceSlug => slug in priorityFinanceContent;