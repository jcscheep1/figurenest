import { syncRegistrySeoCapabilities } from './seo-capabilities';

export type FinanceCalculatorSlug = 'loan' | 'mortgage' | 'compound-interest';

export type FinanceExample = {
  title: string;
  inputs: string;
  working: string;
  result: string;
  interpretation: string;
};

export type FinanceFaq = {
  question: string;
  answer: string;
};

export type FinanceRelatedTool = {
  slug: string;
  linkLabel: string;
  context: string;
};

export type FinanceCalculatorContent = {
  slug: FinanceCalculatorSlug;
  title: string;
  titleLines: readonly [string, string];
  description: string;
  seoTitle: string;
  seoDescription: string;
  resultLabel: string;
  resultSummary: string;
  updatedNote: string;
  whenUseful: string;
  usefulFor: readonly string[];
  formula: string;
  formulaExplanation: string;
  zeroRateNote: string;
  instructions: readonly string[];
  examples: readonly FinanceExample[];
  assumptions: readonly string[];
  commonMistakes: readonly string[];
  edgeCases: readonly { title: string; explanation: string }[];
  limitations: string;
  faqs: readonly FinanceFaq[];
  relatedTools: readonly FinanceRelatedTool[];
};

const loan: FinanceCalculatorContent = {
  slug: 'loan',
  title: 'Loan Calculator',
  titleLines: ['Loan Payment', 'Calculator'],
  description: 'Estimate the monthly payment, total interest, and total repayment for a fixed-rate installment loan.',
  seoTitle: 'Loan Payment Calculator | FigureNest',
  seoDescription: 'Estimate monthly loan payments, total interest, and total repayment with a fixed-rate amortization formula. Compare loan amounts, rates, and terms.',
  resultLabel: 'ESTIMATED MONTHLY PAYMENT',
  resultSummary: 'This is the principal-and-interest payment for a fixed-rate loan with equal monthly payments.',
  updatedNote: 'FIXED-RATE AMORTIZATION',
  whenUseful: 'Use this calculator when you know the amount borrowed, annual interest rate, and repayment term for a personal loan, auto loan, or other fixed installment loan. It helps compare offers on a consistent monthly-payment and total-cost basis.',
  usefulFor: [
    'Checking whether a proposed monthly payment fits your budget.',
    'Comparing a longer term with a lower payment but higher lifetime interest.',
    'Estimating the effect of a different loan amount or quoted annual rate.',
  ],
  formula: 'M = P × [i(1 + i)ⁿ] ÷ [(1 + i)ⁿ − 1]',
  formulaExplanation: 'M is the monthly payment, P is the amount borrowed, i is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the number of monthly payments. The total paid is M × n, and total interest is total paid minus P.',
  zeroRateNote: 'For a true 0% loan, no interest factor is needed: monthly payment = amount borrowed ÷ number of months.',
  instructions: [
    'Enter the amount you expect to borrow, excluding any down payment paid directly.',
    'Enter the quoted annual interest rate. Use 0 only for a genuinely interest-free loan.',
    'Enter the repayment term in years, then review both the monthly payment and lifetime interest.',
    'Change one input at a time to compare offers—for example, keep the amount and rate fixed while testing a shorter term.',
  ],
  examples: [
    {
      title: 'Five-year auto loan',
      inputs: '$24,000 borrowed at 7.2% for 5 years',
      working: '60 monthly payments using a 0.6% monthly rate',
      result: '$477.50 per month; $28,649.80 total paid; $4,649.80 interest',
      interpretation: 'The payment is below $500, but interest adds almost 19.4% of the original amount over five years.',
    },
    {
      title: 'Shorter personal loan',
      inputs: '$35,000 borrowed at 5.5% for 4 years',
      working: '48 fixed monthly payments using the amortization formula',
      result: '$813.98 per month; $39,070.88 total paid; $4,070.88 interest',
      interpretation: 'The shorter term raises the monthly commitment while limiting the time over which interest accrues.',
    },
    {
      title: 'Zero-interest financing',
      inputs: '$18,000 borrowed at 0% for 3 years',
      working: '$18,000 ÷ 36 months',
      result: '$500 per month; $18,000 total paid; $0 interest',
      interpretation: 'At 0%, the payment simply spreads the principal evenly, assuming there are no fees or deferred-interest conditions.',
    },
  ],
  assumptions: [
    'The interest rate is fixed and payments are made monthly for the full term.',
    'Every scheduled payment is made on time and no extra principal payments are added.',
    'The quoted rate is treated as a nominal annual rate divided into 12 monthly periods.',
    'The calculator assumes a standard fully amortizing loan with no balloon payment.',
  ],
  commonMistakes: [
    'Entering the purchase price instead of the amount actually financed.',
    'Comparing monthly payments without comparing total interest and total repayment.',
    'Treating an advertised payment as complete when origination fees or add-ons are financed separately.',
    'Using an introductory or variable rate as though it were fixed for the full term.',
  ],
  edgeCases: [
    { title: 'A 0% rate', explanation: 'The result divides the principal evenly across the monthly payments and reports zero interest.' },
    { title: 'A $0 amount', explanation: 'The mathematical payment is zero. Real lenders may still charge minimum fees, so confirm the offer terms.' },
    { title: 'Very short terms', explanation: 'Short terms can produce a high monthly payment even when they reduce total interest.' },
  ],
  limitations: 'This is a planning estimate, not a lender disclosure. It excludes origination fees, late fees, optional products, changing rates, irregular first-payment periods, prepayments, and lender-specific rounding. Review the APR and official repayment schedule before accepting a loan.',
  faqs: [
    { question: 'How is a loan payment calculated?', answer: 'A standard fixed-rate payment amortizes the amount borrowed over equal monthly payments. Each payment covers that month’s interest and reduces principal; the interest share generally falls as the balance declines.' },
    { question: 'What is the difference between interest rate and APR?', answer: 'The interest rate drives the interest portion of the payment. APR can also reflect certain lender fees and is designed for comparing borrowing costs. This calculator uses the entered interest rate, not a fee-adjusted APR calculation.' },
    { question: 'Does a longer loan term lower the payment?', answer: 'Usually yes, because repayment is spread across more months. A longer term commonly increases total interest even though the monthly payment is lower.' },
    { question: 'Can I use this for an auto or personal loan?', answer: 'Yes, when the loan has a fixed rate, fixed term, and equal monthly payments. Enter the financed amount rather than the item’s full purchase price if you are making a down payment.' },
    { question: 'Are loan fees included?', answer: 'No. Add any financed fee to the loan amount if you want a rough payment estimate, but use the lender’s disclosure for the exact APR and total of payments.' },
    { question: 'What happens if I make extra payments?', answer: 'Extra principal payments can shorten the payoff time and reduce interest, but this calculator models only the scheduled payment. Check whether your lender applies extra amounts to principal and whether any prepayment penalty applies.' },
    { question: 'Why might a lender quote a slightly different payment?', answer: 'Differences can come from payment dates, compounding conventions, financed fees, lender rounding, or an APR that is not the same as the note rate entered here.' },
  ],
  relatedTools: [
    { slug: 'mortgage', linkLabel: 'Estimate a mortgage payment including tax and insurance', context: 'Use the mortgage calculator when the loan is tied to a home purchase and you need a broader monthly housing estimate.' },
    { slug: 'compound-interest', linkLabel: 'Compare borrowing costs with compound growth', context: 'See how regular contributions and compounding can build savings over the same period.' },
    { slug: 'savings', linkLabel: 'Plan a savings target before borrowing', context: 'Estimate how a starting balance and monthly deposits could grow toward a future purchase.' },
  ],
};

const mortgage: FinanceCalculatorContent = {
  slug: 'mortgage',
  title: 'Mortgage Calculator',
  titleLines: ['Mortgage Payment', 'Calculator'],
  description: 'Estimate a monthly home payment with principal, interest, property tax, and homeowners insurance.',
  seoTitle: 'Mortgage Payment Calculator | FigureNest',
  seoDescription: 'Estimate a monthly mortgage payment including principal, interest, property tax, and home insurance, plus total loan interest over the term.',
  resultLabel: 'ESTIMATED MONTHLY HOUSING PAYMENT',
  resultSummary: 'This estimate combines monthly principal and interest with the property tax and home insurance amounts entered.',
  updatedNote: 'PAYMENT + ESCROW ESTIMATE',
  whenUseful: 'Use this calculator while comparing home prices, down payments, interest rates, and loan terms. Unlike a basic loan payment, the headline estimate also includes the property tax and homeowners insurance amounts you enter.',
  usefulFor: [
    'Testing a home-price range before speaking with a lender.',
    'Comparing the monthly and lifetime effects of different down payments or terms.',
    'Separating principal and interest from estimated tax and insurance costs.',
  ],
  formula: 'Monthly estimate = amortized principal-and-interest payment + annual property tax ÷ 12 + annual home insurance ÷ 12',
  formulaExplanation: 'The financed principal is home price minus down payment. Principal and interest use the fixed-payment formula M = P × [i(1 + i)ⁿ] ÷ [(1 + i)ⁿ − 1], where i is the monthly rate and n is the number of monthly payments.',
  zeroRateNote: 'At 0% interest, principal and interest equal the financed amount divided by the number of months; entered tax and insurance are still added monthly.',
  instructions: [
    'Enter the expected purchase price and the cash down payment. The difference is the financed principal.',
    'Enter the annual note rate and loan term. Use the lender’s quoted fixed rate rather than an APR that includes fees.',
    'Enter annual property tax and homeowners insurance estimates for the property and location.',
    'Review the combined monthly estimate, then check the principal-and-interest amount and lifetime loan interest separately.',
  ],
  examples: [
    {
      title: 'Twenty-percent down',
      inputs: '$360,000 home; $72,000 down; 6.5% for 30 years; $4,500 tax; $1,800 insurance',
      working: '$288,000 financed, plus $375 monthly tax and $150 monthly insurance',
      result: '$2,345.36 monthly estimate; $1,820.36 principal and interest',
      interpretation: 'About $525 of the displayed monthly estimate comes from the entered tax and insurance, not loan repayment.',
    },
    {
      title: 'Higher-priced home',
      inputs: '$500,000 home; $100,000 down; 6% for 30 years; $6,000 tax; $2,400 insurance',
      working: '$400,000 financed, plus $700 per month for tax and insurance',
      result: '$3,098.20 monthly estimate; $2,398.20 principal and interest',
      interpretation: 'The loan itself accounts for most of the payment, while location-specific ownership costs add $700 monthly.',
    },
    {
      title: 'Zero-rate comparison',
      inputs: '$300,000 home; $60,000 down; 0% for 15 years; $3,600 tax; $1,200 insurance',
      working: '$240,000 ÷ 180 months, plus $400 monthly tax and insurance',
      result: '$1,733.33 monthly estimate; $0 loan interest',
      interpretation: 'This edge case shows that taxes and insurance remain even when financing has no interest.',
    },
  ],
  assumptions: [
    'The mortgage rate is fixed and principal-and-interest payments are monthly.',
    'Property tax and insurance are divided evenly across 12 months and remain constant.',
    'The down payment is paid upfront and is not part of the financed principal.',
    'The loan is fully amortizing with no interest-only period or balloon balance.',
  ],
  commonMistakes: [
    'Comparing only principal and interest while overlooking tax, insurance, HOA dues, or mortgage insurance.',
    'Entering an APR as the interest rate even though APR may include lender fees.',
    'Assuming property taxes and insurance will stay unchanged for 15 or 30 years.',
    'Treating preapproval as proof that the resulting payment is comfortable for the household budget.',
  ],
  edgeCases: [
    { title: 'Down payment equals price', explanation: 'The financed principal is zero, so the estimate contains only the entered monthly tax and insurance.' },
    { title: 'Down payment exceeds price', explanation: 'The calculator rejects this because it would create a negative mortgage principal.' },
    { title: 'No tax or insurance entered', explanation: 'The result becomes a principal-and-interest estimate only; it is not a complete cost of homeownership.' },
  ],
  limitations: 'The estimate excludes private mortgage insurance, HOA dues, flood insurance, closing costs, points, maintenance, utilities, rate changes, adjustable-rate resets, and jurisdiction-specific escrow rules. “Loan total paid” covers principal and interest only; it does not add decades of tax or insurance.',
  faqs: [
    { question: 'What does the monthly mortgage estimate include?', answer: 'It includes the calculated principal-and-interest payment plus one-twelfth of the annual property tax and home insurance amounts entered. It does not automatically include mortgage insurance, HOA dues, or maintenance.' },
    { question: 'How does the down payment affect the mortgage?', answer: 'A larger down payment reduces the financed principal, which generally lowers the principal-and-interest payment and lifetime interest. It may also affect mortgage-insurance requirements, which are not calculated here.' },
    { question: 'Are property taxes and insurance part of total loan interest?', answer: 'No. The total loan interest and loan total paid figures refer only to the mortgage principal and interest. Tax and insurance appear in the monthly estimate but are not projected across the full term.' },
    { question: 'Does this calculator include PMI?', answer: 'No. Private mortgage insurance depends on the loan program, down payment, lender, and later loan-to-value changes. Add a lender-provided PMI estimate separately when building a complete budget.' },
    { question: 'Should I enter the mortgage rate or APR?', answer: 'Enter the note interest rate used to calculate scheduled payments. APR may include points and certain fees, so it can be useful for comparing offers but does not directly replace the note rate in this payment formula.' },
    { question: 'Why can the actual escrow payment change?', answer: 'Property assessments, tax rates, insurance premiums, and escrow analyses can change after closing. The calculator holds your entered annual amounts constant for a present-day estimate.' },
    { question: 'Does a 15-year mortgage always cost less than a 30-year mortgage?', answer: 'A shorter term usually reduces lifetime interest but requires a larger monthly principal-and-interest payment. Compare affordability, rate differences, and other financial priorities before choosing.' },
  ],
  relatedTools: [
    { slug: 'loan', linkLabel: 'Compare the mortgage with a basic fixed-rate loan payment', context: 'Use the loan calculator to isolate principal, interest, term, and total borrowing cost without property expenses.' },
    { slug: 'compound-interest', linkLabel: 'Project how a down-payment fund could grow', context: 'Estimate future value when saving or investing a starting balance plus monthly contributions.' },
    { slug: 'percentage', linkLabel: 'Calculate a down payment as a percentage of price', context: 'Convert a target percentage into a dollar amount before entering the down payment.' },
  ],
};

const compoundInterest: FinanceCalculatorContent = {
  slug: 'compound-interest',
  title: 'Compound Interest Calculator',
  titleLines: ['Compound Interest', 'Calculator'],
  description: 'Project how a starting balance and regular monthly contributions could grow through monthly compounding.',
  seoTitle: 'Compound Interest Calculator | FigureNest',
  seoDescription: 'Project compound growth from a starting balance, monthly contributions, annual interest rate, and time. See deposited principal and interest earned.',
  resultLabel: 'PROJECTED FUTURE BALANCE',
  resultSummary: 'This projection compounds monthly and assumes each recurring contribution is added at the end of the month.',
  updatedNote: 'MONTHLY COMPOUNDING',
  whenUseful: 'Use this calculator to explore long-term saving and investing scenarios when you have a starting balance, a regular monthly contribution, an assumed annual return, and a time horizon. It separates money deposited from growth generated by compounding.',
  usefulFor: [
    'Comparing the effect of starting now versus waiting several years.',
    'Testing how a larger monthly contribution changes a long-term projection.',
    'Separating contributed principal from estimated interest or investment growth.',
  ],
  formula: 'FV = P(1 + i)ⁿ + C × [((1 + i)ⁿ − 1) ÷ i]',
  formulaExplanation: 'FV is future value, P is the starting balance, C is the month-end contribution, i is the monthly rate (annual rate ÷ 12 ÷ 100), and n is the number of months. The first term grows the opening balance; the second grows the contribution stream.',
  zeroRateNote: 'At 0%, no compounding occurs: future balance = starting balance + monthly contribution × number of months.',
  instructions: [
    'Enter the amount already saved or invested. Use 0 if you are starting with monthly contributions only.',
    'Enter the contribution made at the end of each month.',
    'Enter an assumed annual rate and the number of years. Treat the rate as a scenario, not a promise.',
    'Compare the projected balance with deposited principal to see how much of the result comes from compounding.',
  ],
  examples: [
    {
      title: 'Steady ten-year plan',
      inputs: '$5,000 starting balance; $250 monthly; 6% annually; 10 years',
      working: 'The opening balance and 120 month-end contributions compound monthly',
      result: '$50,066.82 projected balance; $35,000 deposited; $15,066.82 interest',
      interpretation: 'About 30% of the ending balance comes from modeled growth rather than deposited money.',
    },
    {
      title: 'Long-term lump sum',
      inputs: '$10,000 starting balance; no contributions; 5% annually; 20 years',
      working: '$10,000 × (1 + 0.05 ÷ 12)²⁴⁰',
      result: '$27,126.40 projected balance; $17,126.40 interest',
      interpretation: 'Time allows the original balance to more than double even without additional deposits, assuming the rate remains constant.',
    },
    {
      title: 'Contributions without growth',
      inputs: '$0 starting balance; $500 monthly; 0% annually; 5 years',
      working: '$500 × 60 months',
      result: '$30,000 projected balance; $0 interest',
      interpretation: 'This baseline isolates what contributions alone produce and makes the compounding contribution easier to compare.',
    },
    {
      title: 'Longer growth horizon',
      inputs: '$25,000 starting balance; $400 monthly; 7% annually; 15 years',
      working: 'The starting balance and 180 month-end contributions compound at 7% ÷ 12',
      result: '$198,008.59 projected balance; $97,000 deposited; $101,008.59 interest',
      interpretation: 'Under the constant-rate assumption, modeled growth becomes slightly larger than all deposited principal.',
    },
  ],
  assumptions: [
    'The entered annual rate is constant and compounding occurs monthly.',
    'Recurring contributions are equal and arrive at the end of every month.',
    'Interest or returns remain invested instead of being withdrawn.',
    'The time horizon is converted to 12 equal compounding periods per year.',
  ],
  commonMistakes: [
    'Treating a hypothetical annual return as guaranteed, especially for market investments.',
    'Confusing the projected balance with interest earned; part of the balance is your own deposits.',
    'Ignoring fees, taxes, inflation, and periods with negative returns.',
    'Comparing this monthly-compounding result with an account that compounds or credits interest differently.',
  ],
  edgeCases: [
    { title: 'A 0% rate', explanation: 'The result is simply the starting balance plus all monthly contributions, with no interest earned.' },
    { title: 'No starting balance', explanation: 'The calculator can project growth from monthly contributions alone.' },
    { title: 'No monthly contribution', explanation: 'The formula reduces to compound growth of the starting lump sum.' },
    { title: 'Long horizons', explanation: 'Small rate changes produce large differences over decades, so test conservative as well as optimistic scenarios.' },
  ],
  limitations: 'This is a mathematical projection, not a forecast or investment recommendation. It excludes taxes, account fees, inflation, contribution limits, changing cash flows, market volatility, and sequence-of-returns risk. Savings accounts may use a stated APY rather than the nominal annual rate convention modeled here.',
  faqs: [
    { question: 'What is compound interest?', answer: 'Compound interest means growth is calculated on both the original principal and previously accumulated interest. With contributions, earlier deposits also have more time to compound.' },
    { question: 'How often does this calculator compound?', answer: 'It uses monthly compounding and assumes recurring contributions arrive at the end of each month.' },
    { question: 'What is the difference between principal and interest earned?', answer: 'Deposited principal is the starting balance plus all monthly contributions. Interest earned is the projected ending balance minus that deposited principal.' },
    { question: 'Can I enter a zero starting balance?', answer: 'Yes. A zero starting balance models a plan funded entirely by monthly contributions.' },
    { question: 'What happens at a 0% interest rate?', answer: 'The calculator adds the starting balance and all contributions without growth. This provides a useful baseline for measuring the effect of compounding.' },
    { question: 'Is an annual return the same as APY?', answer: 'Not necessarily. This calculator treats the entered rate as a nominal annual rate divided across 12 monthly periods. APY already reflects compounding, so entering an APY can produce a slightly different result from an account’s own projection.' },
    { question: 'Does this account for inflation or investment risk?', answer: 'No. The result is a nominal, constant-rate projection. Inflation reduces future purchasing power, and real investment returns vary from month to month and can be negative.' },
    { question: 'Do beginning-of-month contributions produce the same result?', answer: 'No. Beginning-of-month deposits receive one extra month of compounding and would finish slightly higher. This calculator assumes month-end contributions.' },
  ],
  relatedTools: [
    { slug: 'savings', linkLabel: 'Build a shorter-term savings projection', context: 'Use the savings calculator for a practical deposit plan with a starting balance and recurring monthly savings.' },
    { slug: 'loan', linkLabel: 'Compare compound growth with the cost of a loan', context: 'Estimate how interest rate and term affect scheduled borrowing costs and total interest.' },
    { slug: 'mortgage', linkLabel: 'Estimate the payment on a future home purchase', context: 'Turn a home price and down payment into a monthly principal, interest, tax, and insurance estimate.' },
  ],
};

export const financeCalculatorContent: Record<FinanceCalculatorSlug, FinanceCalculatorContent> = {
  loan,
  mortgage,
  'compound-interest': compoundInterest,
};
syncRegistrySeoCapabilities(financeCalculatorContent);

export const isFinanceCalculatorSlug = (slug: string): slug is FinanceCalculatorSlug => slug in financeCalculatorContent;