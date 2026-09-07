export const articleSlugs = [
  'mortgage-payment-basics',
  'refinancing-considerations',
  'loan-payment-calculations',
  'compound-interest-guide',
  'construction-materials-estimating',
  'salary-and-overtime-basics',
  'ev-charging-and-fuel-costs',
  'business-pricing-profit-basics',
  'unit-conversion-basics',
] as const;

export type ArticleSlug = (typeof articleSlugs)[number];

export type ArticleLink = {
  href: string;
  label: string;
  description: string;
};

export type Formula = {
  expression: string;
  explanation: string;
  variables: readonly string[];
};

export type WorkedExample = {
  title: string;
  scenario: string;
  steps: readonly string[];
  result: string;
};

export type ArticleSection = {
  id: string;
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  formula?: Formula;
  example?: WorkedExample;
};

export type ArticleFaq = {
  question: string;
  answer: string;
};

export type Article = {
  slug: ArticleSlug;
  title: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  published: string;
  modified: string;
  readingTimeMinutes: number;
  sections: readonly ArticleSection[];
  assumptions: readonly string[];
  limitations: readonly string[];
  nextSteps: readonly string[];
  faqs: readonly ArticleFaq[];
  relatedCalculators: readonly ArticleLink[];
  relatedArticles: readonly ArticleSlug[];
};

const articleRegistry = {
  'mortgage-payment-basics': {
    slug: 'mortgage-payment-basics',
    title: 'Mortgage payment basics',
    seoTitle: 'Mortgage Payment Basics: A Practical Guide',
    metaDescription: 'Learn what makes up a mortgage payment, how principal and interest are calculated, and which housing costs a basic estimate may leave out.',
    h1: 'Mortgage payment basics',
    intro: 'A mortgage payment is easier to understand when you separate the loan calculation from the other costs of owning a home. This guide explains the standard principal-and-interest formula, shows a worked example, and identifies the inputs that can change the amount due.',
    published: '2026-08-12',
    modified: '2026-08-30',
    readingTimeMinutes: 8,
    sections: [
      {
        id: 'parts-of-a-payment',
        heading: 'What can be included in a mortgage payment',
        paragraphs: [
          'The loan portion of a typical repayment mortgage consists of principal and interest. Principal reduces the amount borrowed. Interest is the lender’s charge for the outstanding balance. Early scheduled payments generally contain more interest because the balance is larger; the principal share grows as the balance falls.',
          'A lender or servicer may also collect property taxes, homeowners insurance, mortgage insurance, or other amounts through an escrow account. Association dues, maintenance, utilities, and repairs are normally separate. For useful planning, compare the calculated loan payment with the broader monthly housing outflow rather than treating them as the same number.',
        ],
        bullets: [
          'Principal: the portion that reduces the loan balance.',
          'Interest: the cost calculated from the remaining balance and loan rate.',
          'Escrow items: taxes or insurance collected for later payment, when applicable.',
          'Separate ownership costs: dues, upkeep, utilities, and unexpected repairs.',
        ],
      },
      {
        id: 'payment-formula',
        heading: 'The fixed-payment mortgage formula',
        paragraphs: [
          'A standard fixed-rate, fully amortizing loan uses one scheduled principal-and-interest payment throughout its term. Convert the annual percentage rate used for the calculation to a monthly decimal rate, and convert the term to a number of monthly payments.',
          'The formula determines a level payment that brings the balance to zero after the final scheduled payment, subject to rounding and the loan’s actual terms. It does not add taxes, insurance, fees, or optional extra payments.',
        ],
        formula: {
          expression: 'M = P × [r(1 + r)ⁿ] ÷ [(1 + r)ⁿ − 1]',
          explanation: 'The periodic rate and number of payments spread repayment of principal and interest across equal monthly installments.',
          variables: [
            'M = monthly principal-and-interest payment',
            'P = original loan principal',
            'r = monthly interest rate (annual rate ÷ 12)',
            'n = total number of monthly payments',
          ],
        },
      },
      {
        id: 'worked-example',
        heading: 'Worked example: a fixed-rate home loan',
        paragraphs: [
          'Consider a home purchase financed with a $320,000, 30-year fixed loan at an illustrative 6% annual rate. This rate is used only to demonstrate the arithmetic; it is not a current-rate quote.',
        ],
        example: {
          title: '$320,000 over 30 years',
          scenario: 'Loan principal of $320,000, annual rate of 6%, monthly payments, and no extra principal payments.',
          steps: [
            'Monthly rate: 0.06 ÷ 12 = 0.005.',
            'Number of payments: 30 × 12 = 360.',
            'Substitute P = 320,000, r = 0.005, and n = 360 in the payment formula.',
            'The calculated principal-and-interest payment is about $1,918.56 per month.',
          ],
          result: 'Using the displayed monthly amount, 360 scheduled payments total about $690,681.60, including roughly $370,681.60 of interest. The total from the unrounded payment is about $690,682.20, which shows why a final schedule can differ slightly. Taxes, insurance, fees, and other housing costs are not included.',
        },
      },
      {
        id: 'inputs-that-matter',
        heading: 'How the main inputs affect the estimate',
        paragraphs: [
          'A larger down payment reduces principal and therefore the scheduled payment and total interest, all else equal. A higher rate raises the payment because interest accrues faster. A longer term can lower the monthly amount while increasing the time interest accrues, so monthly affordability and total borrowing cost answer different questions.',
          'For an adjustable-rate mortgage, an initial payment is not a permanent payment. Index changes, margins, adjustment dates, and caps can alter later amounts. Read the loan documents instead of applying the fixed-rate formula to every future period.',
        ],
      },
      {
        id: 'reviewing-an-estimate',
        heading: 'Turn the estimate into a housing budget',
        paragraphs: [
          'Start with the expected purchase price and down payment, then confirm that the resulting principal matches the amount to be financed. Add realistic property-specific costs separately. Reviewing both the monthly total and a range of possible expenses is more informative than focusing on a single calculator output.',
          'Keep the estimate educational: a lender determines qualification and provides binding disclosures. Before committing, compare the calculator inputs with the loan estimate, insurance quote, tax information, and any association documents.',
        ],
      },
    ],
    assumptions: [
      'Payments are monthly and made at the end of each payment period.',
      'The rate is fixed, the loan is fully amortizing, and no extra principal is paid.',
      'The example uses the stated annual rate divided by 12 and rounds displayed amounts to cents.',
    ],
    limitations: [
      'The formula does not model taxes, insurance, mortgage insurance, escrow adjustments, fees, points, or closing costs.',
      'Actual payment schedules can differ because of daily interest conventions, rounding, payment timing, or loan-specific terms.',
      'The guide does not determine affordability, eligibility, or an appropriate loan for an individual.',
    ],
    nextSteps: [
      'Estimate principal by subtracting the planned down payment from the purchase price.',
      'Calculate principal and interest, then list taxes, insurance, dues, and maintenance separately.',
      'Compare the result with lender documents and current property-specific figures before making a material decision.',
    ],
    faqs: [
      { question: 'Does a mortgage calculator payment include property taxes?', answer: 'Only if the calculator explicitly asks for and adds them. A basic amortization formula returns principal and interest, so taxes and insurance need separate inputs or a separate budget line.' },
      { question: 'Why does more of an early payment go to interest?', answer: 'Periodic interest is calculated on the outstanding balance. The balance is highest near the beginning, so the interest portion is generally larger then.' },
      { question: 'Does a longer mortgage term always cost less?', answer: 'It commonly lowers the scheduled monthly payment for the same principal and rate, but interest accrues over more periods. Compare both monthly payment and total interest.' },
      { question: 'Can I use this formula for an adjustable-rate mortgage?', answer: 'It can illustrate a payment for one assumed rate and remaining term, but it cannot predict future rate adjustments. The note, index, margin, and caps govern those changes.' },
    ],
    relatedCalculators: [
      { href: '/calculators/finance/mortgage', label: 'Mortgage payment calculator', description: 'Estimate principal, interest, taxes, insurance, and down-payment effects.' },
      { href: '/calculators/finance/loan', label: 'Loan payment calculator', description: 'Compare payment and total interest for a general installment loan.' },
    ],
    relatedArticles: ['refinancing-considerations', 'loan-payment-calculations'],
  },
  'refinancing-considerations': {
    slug: 'refinancing-considerations',
    title: 'Refinancing considerations',
    seoTitle: 'Refinancing Considerations and Break-Even Math',
    metaDescription: 'Understand refinancing costs, payment changes, break-even estimates, term resets, and the questions to check before comparing loan offers.',
    h1: 'Refinancing considerations',
    intro: 'Refinancing replaces an existing loan with a new one. A lower payment can be useful, but it does not by itself show whether the change lowers total cost. A careful comparison includes upfront costs, the new term, the expected time keeping the loan, and differences in principal.',
    published: '2026-08-14',
    modified: '2026-08-30',
    readingTimeMinutes: 9,
    sections: [
      {
        id: 'what-changes',
        heading: 'What changes when a loan is refinanced',
        paragraphs: [
          'The new loan may have a different rate, term, balance, payment structure, and set of fees. The balance can rise when closing costs are financed. A cash-out refinance raises principal further because part of the new loan is paid to the borrower rather than used to retire the old balance.',
          'A payment can decline because the rate is lower, because repayment is stretched across more years, or both. Those causes have different effects on total interest. Compare the existing loan’s remaining schedule with the complete proposed schedule—not with the original loan amount or payment.',
        ],
      },
      {
        id: 'break-even',
        heading: 'A simple break-even estimate',
        paragraphs: [
          'A basic break-even period asks how many months of payment reduction are needed to recover upfront refinancing costs. It is a screening measure, not a complete return calculation. Costs financed into the new balance still have an economic cost even if little cash is due at closing.',
          'Use the change in comparable payments. If one figure includes taxes or insurance and the other does not, the result is misleading. Escrow deposits and refunds may affect cash timing but are not always permanent loan costs.',
        ],
        formula: {
          expression: 'Break-even months = net refinancing costs ÷ monthly payment reduction',
          explanation: 'This simplified ratio estimates when cumulative monthly reductions equal the costs attributed to obtaining the new loan.',
          variables: [
            'Net refinancing costs = lender and third-party costs being evaluated, less genuine credits',
            'Monthly payment reduction = old comparable payment minus new comparable payment',
          ],
        },
      },
      {
        id: 'worked-example',
        heading: 'Worked example: cost versus monthly reduction',
        paragraphs: [
          'Suppose an existing loan has a $1,850 monthly principal-and-interest payment. A proposed refinance would reduce that comparable payment to $1,690 and has $4,800 of net costs. The figures are illustrative and do not represent available terms.',
        ],
        example: {
          title: 'A $160 monthly payment reduction',
          scenario: 'Old payment of $1,850, new payment of $1,690, and $4,800 in net refinancing costs.',
          steps: [
            'Monthly reduction: $1,850 − $1,690 = $160.',
            'Simple break-even: $4,800 ÷ $160 = 30 months.',
            'At 24 months, gross payment reductions total $3,840, less than the stated costs.',
            'At 36 months, gross payment reductions total $5,760, or $960 more than the stated costs before other differences.',
          ],
          result: 'The simplified break-even point is 30 months. A full comparison must still account for balance differences, term length, interest, taxes, and what happens if the loan ends earlier.',
        },
      },
      {
        id: 'term-and-total-cost',
        heading: 'Term resets and total borrowing cost',
        paragraphs: [
          'Replacing a partly repaid loan with a fresh long-term loan can lower the payment while extending the payoff date. To isolate the rate effect, compare a new term close to the old loan’s remaining term as well as the lender’s standard longer option.',
          'Review total scheduled payments and interest over the period you reasonably expect to hold the loan. If sale, payoff, or another refinance happens sooner, the relevant window is shorter. No estimate can know that future date, so compare more than one holding period.',
        ],
      },
      {
        id: 'offer-comparison',
        heading: 'Compare offers on consistent terms',
        paragraphs: [
          'Place each offer in the same table: new principal, rate type, term, principal-and-interest payment, lender credits, points, third-party fees, cash required, and projected balance at selected future dates. Note whether a quoted rate depends on paying points or accepting particular conditions.',
          'Loan estimates and closing disclosures provide the transaction-specific figures that a general article cannot. Ask the provider to explain unfamiliar fees and differences, and use qualified financial, tax, or legal help when appropriate to the decision.',
        ],
      },
    ],
    assumptions: [
      'The break-even example compares principal-and-interest payments with the same scope.',
      'The monthly reduction remains constant during the illustrated period.',
      'The stated net costs include the refinance costs the user intends to recover.',
    ],
    limitations: [
      'Simple break-even math omits the time value of money, tax effects, balance differences, and opportunity cost.',
      'Prepayment penalties, variable rates, financed costs, escrow movements, and cash-out proceeds require separate treatment.',
      'Future rates, property value, approval, and the date a borrower sells or repays cannot be predicted.',
    ],
    nextSteps: [
      'Collect the current payoff balance, remaining term, rate type, and recent loan statement.',
      'Request itemized written offers and compare them with the same holding periods and payment scope.',
      'Calculate break-even and projected balances, then verify material figures in the applicable disclosures.',
    ],
    faqs: [
      { question: 'Is a lower monthly payment enough reason to refinance?', answer: 'Not on its own. The reduction may come from extending repayment, and fees can outweigh short-term savings. Compare costs, balances, term, and the likely holding period.' },
      { question: 'What does no-closing-cost refinancing mean?', answer: 'It often means costs are offset by a lender credit associated with the loan terms or added to the balance, rather than eliminated. Review the itemized offer to see how costs are handled.' },
      { question: 'Should financed closing costs count in break-even math?', answer: 'Yes, they still affect principal and may accrue interest. A simple cash-at-closing figure can understate the economic cost if financed amounts are omitted.' },
      { question: 'Why compare future loan balances?', answer: 'Two options with similar payments may reduce principal at different speeds. A projected balance helps reveal the effect of different terms, rates, and financed costs.' },
    ],
    relatedCalculators: [
      { href: '/calculators/finance/mortgage', label: 'Mortgage calculator for scenario comparisons', description: 'Compare payment estimates using different balances, rates, and terms.' },
      { href: '/calculators/finance/loan', label: 'General loan calculator', description: 'Estimate total interest and scheduled payments for a proposed refinance.' },
    ],
    relatedArticles: ['mortgage-payment-basics', 'loan-payment-calculations'],
  },
  'loan-payment-calculations': {
    slug: 'loan-payment-calculations',
    title: 'Loan payment calculations',
    seoTitle: 'How Loan Payment Calculations Work',
    metaDescription: 'See how amortized loan payments are calculated, how rate and term affect total interest, and what a loan estimate does not include.',
    h1: 'How loan payment calculations work',
    intro: 'Installment-loan math connects four core inputs: amount borrowed, periodic interest rate, number of payments, and payment amount. Understanding that relationship helps you check calculator results and compare scenarios without mistaking an estimate for a loan offer.',
    published: '2026-08-16',
    modified: '2026-08-29',
    readingTimeMinutes: 8,
    sections: [
      {
        id: 'amortization',
        heading: 'How an amortized payment works',
        paragraphs: [
          'With a fully amortizing fixed-rate loan, each scheduled payment covers interest due for the period and pays down some principal. The payment is designed to reduce the balance to zero at the end of the stated term when every payment is made as assumed.',
          'Interest for a period is based on the outstanding principal under the loan’s stated convention. Because that balance generally declines, the interest share falls and the principal share rises over time even when the scheduled payment stays level.',
        ],
      },
      {
        id: 'formula',
        heading: 'The installment-loan payment formula',
        paragraphs: [
          'The common annuity formula applies when payments and compounding periods align and the periodic rate is constant. For monthly payments, the number of periods is usually years multiplied by 12, while the monthly rate is the stated annual rate divided by 12 for this simplified model.',
          'If the periodic rate is zero, divide principal by the number of payments instead. Loans with irregular payments, fees included in principal, variable rates, or different day-count methods need loan-specific calculations.',
        ],
        formula: {
          expression: 'Payment = Principal × r ÷ [1 − (1 + r)⁻ⁿ]',
          explanation: 'The denominator adjusts equal payments for interest across the full repayment schedule.',
          variables: [
            'Principal = amount financed at the start of the calculation',
            'r = interest rate per payment period',
            'n = total number of scheduled payments',
          ],
        },
      },
      {
        id: 'worked-example',
        heading: 'Worked example: a four-year installment loan',
        paragraphs: [
          'Take an illustrative $18,000 loan repaid monthly over four years at a fixed 7.2% annual rate. The example excludes origination fees, late charges, optional products, and taxes.',
        ],
        example: {
          title: '$18,000 repaid over 48 months',
          scenario: 'Principal of $18,000, annual rate of 7.2%, 48 end-of-month payments, and no extra payments.',
          steps: [
            'Monthly rate: 0.072 ÷ 12 = 0.006.',
            'Payment count: 4 × 12 = 48.',
            'Payment: 18,000 × 0.006 ÷ [1 − (1.006)⁻⁴⁸] ≈ $432.70.',
            'Rounded scheduled total: $432.70 × 48 ≈ $20,769.60.',
          ],
          result: 'The estimated payment is $432.70 and estimated interest is about $2,769.60 when the displayed payment is multiplied by 48. The unrounded-payment total is about $20,769.82, so a lender schedule may differ slightly because unrounded amounts and contractual conventions control.',
        },
      },
      {
        id: 'rate-term-fees',
        heading: 'Rate, term, and fees answer different questions',
        paragraphs: [
          'Holding principal constant, a higher rate increases both the periodic payment and total interest. Extending the term usually lowers the payment but creates more interest-bearing periods. A shorter term usually does the reverse. Compare the payment and total cost together.',
          'The note rate drives basic interest math, while annual percentage rate may reflect certain finance charges under applicable disclosure rules. Fees can be paid upfront or included in the amount financed. Do not substitute APR for the contractual rate in a payment formula unless the calculation specifically calls for it.',
        ],
      },
      {
        id: 'schedule-check',
        heading: 'Check an estimate against an amortization schedule',
        paragraphs: [
          'For any period, start with the opening balance, calculate that period’s interest, subtract interest from the payment to find principal paid, and reduce the balance. Repeating the process produces an amortization schedule and makes rounding differences visible.',
          'Extra payments generally reduce principal and may reduce later interest, but their treatment depends on the agreement and servicer instructions. Confirm whether extra money is applied to principal and whether prepayment terms or fees apply.',
        ],
      },
    ],
    assumptions: [
      'The example has a fixed rate, equal monthly payments, and monthly rate periods.',
      'Payments arrive on schedule and no payment is skipped, deferred, or added.',
      'Displayed totals multiply a rounded payment, so they are approximate.',
    ],
    limitations: [
      'The simplified model omits origination fees, insurance, optional products, taxes, penalties, and variable rates.',
      'Some contracts use daily simple interest or other conventions that change timing and totals.',
      'A calculation does not indicate approval, credit terms, suitability, or the ability to repay.',
    ],
    nextSteps: [
      'Identify the amount financed rather than relying only on the purchase price or cash received.',
      'Run the same principal through several rate and term scenarios and compare payment plus total interest.',
      'Check the chosen scenario against the agreement, disclosure, or lender amortization schedule.',
    ],
    faqs: [
      { question: 'Why is my lender payment different from a calculator result?', answer: 'The calculator may omit fees or insurance, use different rounding, or assume a different first-payment date or interest convention. Compare every input with the loan documents.' },
      { question: 'Does a longer loan term lower the payment?', answer: 'For the same principal and fixed rate, more payment periods generally lower each scheduled payment. Total interest will generally be higher because the balance remains outstanding longer.' },
      { question: 'Is APR the same as the interest rate?', answer: 'No. The note rate is used to calculate contractual interest, while APR is a disclosure measure that can incorporate certain finance charges. Read the definitions on the applicable offer.' },
      { question: 'What happens when I pay extra principal?', answer: 'If properly applied, the balance falls sooner and less interest may accrue later. Whether the payment date or scheduled amount changes depends on the loan terms and servicing process.' },
    ],
    relatedCalculators: [
      { href: '/calculators/finance/loan', label: 'Loan payment and interest calculator', description: 'Estimate a level payment, scheduled total, and total interest.' },
      { href: '/calculators/finance/mortgage', label: 'Mortgage calculator with housing costs', description: 'Extend loan math to a home-financing estimate.' },
    ],
    relatedArticles: ['mortgage-payment-basics', 'refinancing-considerations', 'compound-interest-guide'],
  },
  'compound-interest-guide': {
    slug: 'compound-interest-guide',
    title: 'Compound interest explained',
    seoTitle: 'Compound Interest Explained With an Example',
    metaDescription: 'Learn how compound interest works, use the core formula, follow a realistic savings example, and understand the assumptions behind projections.',
    h1: 'Compound interest explained',
    intro: 'Compound interest means that previously credited interest can itself earn interest in later periods. The effect depends on principal, rate, compounding frequency, time, and cash flows. A projection can clarify the math, but it cannot promise a future savings or investment result.',
    published: '2026-08-18',
    modified: '2026-08-30',
    readingTimeMinutes: 8,
    sections: [
      {
        id: 'how-compounding-works',
        heading: 'Interest on principal and prior interest',
        paragraphs: [
          'Simple interest applies a rate only to the starting principal. Compound interest updates the balance after interest is credited, so later calculations can include earlier interest. The difference may be small over a short period and more noticeable over many periods.',
          'Compounding frequency describes how often interest is added under the model. A quoted annual rate and an annual percentage yield are not interchangeable: APY reflects compounding under its stated assumptions, while a nominal annual rate may not. Use the measure and frequency specified by the account or projection.',
        ],
      },
      {
        id: 'formula',
        heading: 'The compound interest formula',
        paragraphs: [
          'For a single initial deposit with a constant nominal annual rate, no withdrawals, and regular compounding, the standard formula calculates the future balance. Interest earned is the future balance minus the original principal.',
          'Regular contributions require an additional future-value calculation, and timing matters: deposits at the beginning of each period have one more period to compound than deposits at the end.',
        ],
        formula: {
          expression: 'A = P(1 + r ÷ m)ᵐᵗ',
          explanation: 'Each compounding period multiplies the current modeled balance by one plus the periodic rate.',
          variables: [
            'A = projected ending balance',
            'P = initial principal',
            'r = nominal annual rate as a decimal',
            'm = compounding periods per year',
            't = time in years',
          ],
        },
      },
      {
        id: 'worked-example',
        heading: 'Worked example: a five-year savings projection',
        paragraphs: [
          'Assume $10,000 remains in an account for five years at an illustrative 4% nominal annual rate, compounded monthly. This constant rate is chosen only to show the calculation and is not a current account offer.',
        ],
        example: {
          title: '$10,000 compounded monthly',
          scenario: 'Starting principal of $10,000, 4% nominal annual rate, monthly compounding, five years, and no deposits or withdrawals.',
          steps: [
            'Periodic rate: 0.04 ÷ 12 = 0.003333… per month.',
            'Number of periods: 12 × 5 = 60.',
            'Future balance: $10,000 × (1 + 0.04 ÷ 12)⁶⁰.',
            'Projected ending balance is approximately $12,209.97.',
          ],
          result: 'Projected interest is about $2,209.97 before tax, fees, inflation, and any rate changes. Those omitted factors can materially change the real outcome.',
        },
      },
      {
        id: 'contributions-and-time',
        heading: 'Contributions, withdrawals, and time',
        paragraphs: [
          'Regular contributions can become a major part of an ending balance. Keep contributed principal separate from growth so a projection shows what was deposited and what the assumed return generated. Apply withdrawals on their actual modeled dates because removing funds also removes their potential future compounding.',
          'Time increases the number of compounding periods, but it does not remove uncertainty. For variable-rate accounts or investments, a smooth constant rate is a simplifying assumption. Comparing several rates can show sensitivity without implying that any one path will occur.',
        ],
      },
      {
        id: 'reading-results',
        heading: 'Read a projection in today’s context',
        paragraphs: [
          'A nominal ending balance is not the same as purchasing power. Inflation can reduce what that amount buys. Fees and taxes may reduce the balance or return, while deposit or withdrawal timing can move the result in either direction.',
          'Use projections to understand relationships and test inputs. For a real account, review its rate definition, compounding and crediting rules, fees, restrictions, tax treatment, and protections rather than relying on a generic formula alone.',
        ],
      },
    ],
    assumptions: [
      'The example rate stays constant and interest compounds monthly.',
      'There are no deposits, withdrawals, fees, taxes, or interrupted compounding.',
      'The rate is a nominal annual rate divided evenly across 12 monthly periods.',
    ],
    limitations: [
      'Actual account rates and investment returns can change and may be negative in some products.',
      'The basic lump-sum formula does not model irregular cash flows, tiers, fees, taxes, or account-specific crediting rules.',
      'Nominal projections do not show inflation-adjusted purchasing power or guarantee an outcome.',
    ],
    nextSteps: [
      'Confirm whether the available rate is nominal, effective, or APY and note its compounding rules.',
      'Separate starting principal and contributions from projected interest or growth.',
      'Run more than one rate and time horizon, then compare the model with the account’s actual terms.',
    ],
    faqs: [
      { question: 'How is compound interest different from simple interest?', answer: 'Simple interest is calculated only on the original principal. Compound interest can be calculated on principal plus interest credited in earlier periods.' },
      { question: 'Does more frequent compounding always create a higher balance?', answer: 'With the same nominal annual rate and otherwise identical assumptions, more frequent compounding produces a slightly higher modeled balance. Offers may quote rates differently, so compare effective yields rather than frequency alone.' },
      { question: 'Can the formula include monthly contributions?', answer: 'The displayed formula covers one lump sum. Contributions need a future-value-of-a-series formula, with an adjustment based on whether each contribution occurs at the beginning or end of a period.' },
      { question: 'Why might an actual balance differ from the projection?', answer: 'Rates can change, deposits and withdrawals may occur on different dates, and fees, taxes, rounding, or account rules may alter credited interest.' },
    ],
    relatedCalculators: [
      { href: '/calculators/finance/compound-interest', label: 'Compound interest calculator', description: 'Project a balance with contributions and a chosen compounding schedule.' },
      { href: '/calculators/finance/savings', label: 'Savings growth calculator', description: 'Explore how regular deposits may build toward a savings goal.' },
      { href: '/calculators/finance/percentage', label: 'Percentage calculator', description: 'Convert a stated percentage into a value for quick checks.' },
    ],
    relatedArticles: ['loan-payment-calculations', 'mortgage-payment-basics'],
  },
  'construction-materials-estimating': {
    slug: 'construction-materials-estimating',
    title: 'Construction materials estimating',
    seoTitle: 'Construction Materials Estimating Basics',
    metaDescription: 'Estimate construction materials from measured area or volume, add a reasoned waste allowance, and turn coverage into practical order quantities.',
    h1: 'Construction materials estimating',
    intro: 'A useful material estimate connects field measurements to the units in which a product is sold. The arithmetic is usually simple; the important work is defining the project shape, keeping units consistent, subtracting genuine openings, and allowing for cuts or losses without treating a rough estimate as a final order.',
    published: '2026-09-01',
    modified: '2026-09-01',
    readingTimeMinutes: 9,
    sections: [
      {
        id: 'measure-the-project',
        heading: 'Start with the installed dimensions',
        paragraphs: [
          'Measure each simple section separately rather than forcing an irregular project into one rectangle. Floors and walls generally begin with area; slabs, footings, gravel, and mulch need volume. Record every dimension with its unit, and convert dimensions before multiplying so square feet are not accidentally combined with inches or metres.',
          'Subtract openings only when the product will not cover them and the deduction is meaningful. Small openings may consume almost as much material through offcuts as an uninterrupted section. For concrete and bulk fill, check depth in several places because an uneven base can make a nominal depth optimistic.',
        ],
      },
      {
        id: 'coverage-formula',
        heading: 'Convert net quantity into an order quantity',
        paragraphs: [
          'After finding gross area or volume, subtract excluded sections and apply a waste allowance suited to the layout, material, and installer’s plan. Then divide by usable coverage per package and round up to a whole purchasable unit. Apply the allowance once; adding it to both dimensions and the final area compounds it unintentionally.',
          'Published package coverage is more useful than a generic assumption because board width, tile size, coat count, bag yield, and installation pattern can change effective coverage.',
        ],
        formula: {
          expression: 'Packages = ceil[((gross quantity − exclusions) × (1 + waste rate)) ÷ coverage per package]',
          explanation: 'The estimate adds a decimal waste allowance to net installed quantity, converts that quantity to packages, and rounds up because partial packages may not be purchasable.',
          variables: [
            'gross quantity = measured area or volume before deductions',
            'exclusions = openings or sections that require no material',
            'waste rate = planned allowance as a decimal',
            'coverage per package = usable area or volume stated for one package',
          ],
        },
      },
      {
        id: 'worked-example',
        heading: 'Worked example: sheet material for one wall',
        paragraphs: [
          'Suppose a rectangular wall is 12 feet long and 8 feet high, with one 3-by-4-foot opening. The chosen sheet covers 32 square feet, and the planning allowance is 10%. This simplified example does not optimize seams or sheet orientation.',
        ],
        example: {
          title: 'Wall coverage with an opening and waste',
          scenario: 'A 12 ft × 8 ft wall, a 3 ft × 4 ft opening, 10% waste, and 32 sq ft of nominal coverage per sheet.',
          steps: [
            'Gross wall area: 12 × 8 = 96 sq ft.',
            'Opening area: 3 × 4 = 12 sq ft; net area is 96 − 12 = 84 sq ft.',
            'Quantity with allowance: 84 × 1.10 = 92.4 sq ft.',
            'Sheets: 92.4 ÷ 32 = 2.8875, rounded up to 3 whole sheets.',
          ],
          result: 'The arithmetic estimate is 3 sheets. Before ordering, confirm the actual sheet dimensions, seam layout, damaged-edge allowance, and whether offcuts can be reused.',
        },
      },
      {
        id: 'refine-the-order',
        heading: 'Check layout, yield, and purchasing constraints',
        paragraphs: [
          'Two projects with the same area may need different quantities. Diagonal flooring, patterned tile, short board lengths, repeated cuts, multiple paint coats, and fixed sheet orientation can increase waste. A sketch or cut list can reveal whether the percentage allowance is reasonable.',
          'Keep the calculated quantity and purchase quantity visible as separate figures. Supplier package sizes, minimum orders, batch matching, delivery limits, and return policies affect what is practical. For structural or safety-critical work, have dimensions and specifications checked by an appropriately qualified person.',
        ],
      },
    ],
    assumptions: [
      'Dimensions describe the surfaces or spaces that will actually receive material.',
      'All inputs are converted to compatible units before area or volume is calculated.',
      'Package coverage is accurate for the selected product and the waste allowance is applied once.',
    ],
    limitations: [
      'A percentage allowance cannot model every seam, cut pattern, breakage risk, or reusable offcut.',
      'The method does not determine structural design, code compliance, mix design, or installation suitability.',
      'Site variation, product tolerances, package sizes, and supplier availability can change the final order.',
    ],
    nextSteps: [
      'Make a dimensioned sketch and calculate each regular section separately.',
      'Confirm product coverage, required coats or depth, and package size from current product information.',
      'Review the layout and round to purchasable quantities only after applying exclusions and one justified allowance.',
    ],
    faqs: [
      { question: 'How much waste should I add to a material estimate?', answer: 'There is no universal percentage. Use the layout, material fragility, cut complexity, installer experience, and ability to reuse offcuts to choose an allowance, then compare it with the actual plan.' },
      { question: 'Should I subtract every door and window opening?', answer: 'Subtract an opening when it genuinely reduces material use. Very small openings may not save a full sheet, tile, or coat because surrounding cuts and offcuts still consume material.' },
      { question: 'Why must packages be rounded up?', answer: 'Materials are often sold only as whole bags, sheets, boxes, or lengths. Keep the unrounded requirement for comparison, but use the next whole package when partial packages cannot be bought.' },
      { question: 'Is estimated coverage the same as a purchase specification?', answer: 'No. An estimate supports planning. Actual product yield, installation instructions, site measurements, and any structural or local requirements still control the work.' },
    ],
    relatedCalculators: [
      { href: '/calculators/construction/square-footage', label: 'Square footage calculator', description: 'Measure rectangular project area and include a material allowance.' },
      { href: '/calculators/construction/cubic-yard', label: 'Cubic yard calculator', description: 'Convert length, width, and depth into bulk material volume.' },
      { href: '/calculators/construction/concrete-cost', label: 'Concrete cost calculator', description: 'Estimate concrete quantity and material cost for a rectangular pour.' },
    ],
    relatedArticles: ['unit-conversion-basics'],
  },
  'salary-and-overtime-basics': {
    slug: 'salary-and-overtime-basics',
    title: 'Salary and overtime basics',
    seoTitle: 'Salary and Overtime Pay Calculation Basics',
    metaDescription: 'Convert salary to an hourly planning rate, estimate overtime pay with a chosen multiplier, and understand which payroll details the basic math omits.',
    h1: 'Salary and overtime basics',
    intro: 'Pay comparisons become clearer when every figure uses the same time basis. An annual salary can be translated into a planning hourly rate, while overtime can be modeled from eligible hours and a selected multiplier. These calculations explain arithmetic, not whether a worker is legally entitled to overtime.',
    published: '2026-09-01',
    modified: '2026-09-01',
    readingTimeMinutes: 8,
    sections: [
      {
        id: 'comparable-pay',
        heading: 'Put salary and hourly pay on a common basis',
        paragraphs: [
          'To compare annual and hourly amounts, state paid weeks and normal hours per week. Dividing salary by 52 and then by 40 is common for an illustration, but it is not valid for every schedule. Unpaid weeks, compressed schedules, variable hours, bonuses, and paid leave can change the interpretation.',
          'A converted hourly figure is a planning equivalent, not necessarily the employee’s payroll regular rate. Payroll definitions may include or exclude particular compensation under the rules that apply to the worker and jurisdiction.',
        ],
        formula: {
          expression: 'Equivalent hourly rate = annual salary ÷ (paid weeks per year × regular hours per week)',
          explanation: 'The formula spreads annual base salary across the regular hours assumed for the year.',
          variables: [
            'annual salary = base pay for the modeled year',
            'paid weeks per year = weeks represented by the salary',
            'regular hours per week = non-overtime hours in the assumed schedule',
          ],
        },
      },
      {
        id: 'overtime-model',
        heading: 'Model overtime separately',
        paragraphs: [
          'A basic overtime estimate multiplies an eligible hourly base by overtime hours and a multiplier. If the chosen multiplier is 1.5, each overtime hour is modeled at one and one-half times the base. Some arrangements instead pay only an overtime premium on top of straight-time pay already recorded, so avoid adding straight time twice.',
          'Eligibility, the work period, the regular-rate definition, thresholds, exclusions, and required multiplier depend on applicable law, agreements, and worker classification. Use actual payroll rules rather than assuming that a familiar multiplier applies.',
        ],
      },
      {
        id: 'worked-example',
        heading: 'Worked example: salary equivalent plus extra hours',
        paragraphs: [
          'Consider an illustrative $62,400 annual salary modeled across 52 paid weeks and 40 regular hours each week. For planning only, assume six additional hours in one week are paid at 1.5 times the equivalent hourly rate.',
        ],
        example: {
          title: 'A $62,400 salary with six modeled overtime hours',
          scenario: 'Annual base salary of $62,400, 52 paid weeks, 40 regular weekly hours, six extra hours, and a selected 1.5 multiplier.',
          steps: [
            'Annual regular hours: 52 × 40 = 2,080.',
            'Equivalent hourly rate: $62,400 ÷ 2,080 = $30.',
            'Modeled overtime pay: $30 × 1.5 × 6 = $270.',
            'Weekly salary equivalent is $62,400 ÷ 52 = $1,200; adding modeled overtime gives $1,470 gross.',
          ],
          result: 'The modeled week totals $1,470 gross before deductions and other pay. This does not establish overtime eligibility or the payroll rate required in any jurisdiction.',
        },
      },
      {
        id: 'gross-versus-net',
        heading: 'Separate gross pay from take-home pay',
        paragraphs: [
          'Salary and overtime calculations normally produce gross pay. Take-home pay can differ because of taxes, social contributions, benefit deductions, retirement contributions, garnishments, reimbursements, and payroll timing. Those items should not be inferred from a gross-pay conversion.',
          'When checking a pay statement, compare the pay period dates, regular hours, overtime hours, base or regular rate, multiplier, bonuses, and deductions. Raise unexplained differences with the employer or payroll provider, and seek qualified local guidance for rights or tax questions.',
        ],
      },
    ],
    assumptions: [
      'The example salary covers 52 paid weeks and 40 regular hours per week.',
      'The example uses a constant $30 equivalent base and a user-selected 1.5 multiplier.',
      'All results are gross amounts before deductions, taxes, or other compensation.',
    ],
    limitations: [
      'The calculation does not determine worker classification, overtime eligibility, or a legally required rate.',
      'Bonuses, commissions, shift premiums, tips, leave, and irregular work periods may require different treatment.',
      'Tax and deduction rules vary by person, payroll arrangement, and jurisdiction and are not modeled.',
    ],
    nextSteps: [
      'Confirm the pay period, covered weeks, normal schedule, and all components of compensation.',
      'Use the overtime threshold, rate basis, and multiplier that actually apply to the worker.',
      'Compare the estimate with the pay statement and obtain local payroll or legal guidance for material discrepancies.',
    ],
    faqs: [
      { question: 'How do I convert annual salary to an hourly amount?', answer: 'Divide salary by the number of paid weeks and regular hours represented. State those assumptions because using 52 weeks and 40 hours is not appropriate for every role.' },
      { question: 'Does a salaried worker automatically receive overtime?', answer: 'Not necessarily. Eligibility depends on applicable law, duties, compensation arrangements, classification, and sometimes agreements. A calculator cannot make that determination.' },
      { question: 'Is time-and-a-half the same as a 50% premium?', answer: 'A total rate of 1.5 times base includes straight time plus a 0.5 premium. If straight time for those hours has already been paid, only the additional premium may remain; payroll context matters.' },
      { question: 'Why is estimated gross pay different from take-home pay?', answer: 'Gross pay precedes taxes and other deductions. Benefits, withholding, contributions, reimbursements, and payroll adjustments can all change the amount deposited.' },
    ],
    relatedCalculators: [
      { href: '/calculators/salary-work/salary', label: 'Salary converter', description: 'Compare annual, monthly, weekly, and hourly gross pay.' },
      { href: '/calculators/salary-work/overtime', label: 'Overtime calculator', description: 'Estimate extra pay from a base rate, hours, and selected multiplier.' },
    ],
    relatedArticles: ['business-pricing-profit-basics'],
  },
  'ev-charging-and-fuel-costs': {
    slug: 'ev-charging-and-fuel-costs',
    title: 'EV charging and fuel costs',
    seoTitle: 'EV Charging and Fuel Cost Comparison Guide',
    metaDescription: 'Compare EV charging and gasoline trip costs using efficiency, energy price, and charging losses, with a worked example and practical limits.',
    h1: 'EV charging and fuel costs',
    intro: 'Energy cost per trip depends on distance, vehicle efficiency, and the price paid for electricity or fuel. A fair comparison uses the same trip distance and clearly stated units, then keeps charging losses, public charging fees, and real-world driving variation visible.',
    published: '2026-09-01',
    modified: '2026-09-01',
    readingTimeMinutes: 9,
    sections: [
      {
        id: 'same-distance',
        heading: 'Compare both vehicles over the same distance',
        paragraphs: [
          'For an EV rated in miles per kilowatt-hour, divide miles by that efficiency to estimate energy delivered to the battery. For a combustion vehicle rated in miles per gallon, divide the same miles by MPG to estimate gallons. Other unit systems work too, but distance and efficiency units must match.',
          'Cost per mile is useful for recurring comparisons: divide total energy cost by distance. It does not capture purchase price, finance, maintenance, insurance, taxes, depreciation, or travel time, so label it as energy cost rather than total ownership cost.',
        ],
        formula: {
          expression: 'EV cost = [distance ÷ EV efficiency ÷ charging efficiency] × electricity price',
          explanation: 'Battery energy is adjusted upward for modeled charging losses to estimate energy drawn from the charger, then multiplied by the price per kilowatt-hour.',
          variables: [
            'distance = trip length in units matching the efficiency rating',
            'EV efficiency = distance traveled per kWh delivered to the battery',
            'charging efficiency = decimal share of charger energy stored in the battery',
            'electricity price = applicable cost per kWh drawn',
          ],
        },
      },
      {
        id: 'fuel-comparison',
        heading: 'Calculate fuel cost on a matching basis',
        paragraphs: [
          'For a vehicle expressed in miles per gallon, gasoline cost equals distance divided by MPG, multiplied by price per gallon. If consumption is expressed as litres per 100 kilometres, multiply kilometres by L/100 km and divide by 100 before applying price per litre.',
          'Use the marginal price likely to apply to the trip. Electricity tariffs may vary by time, usage tier, location, session, or subscription; fuel prices vary by station and date. Averaging a bill can be useful, but fixed household charges may not rise with one additional charging session.',
        ],
      },
      {
        id: 'worked-example',
        heading: 'Worked example: a 180-mile trip',
        paragraphs: [
          'Compare an EV achieving 3.6 miles per battery kWh with a gasoline vehicle achieving 30 MPG over 180 miles. Assume 90% charging efficiency, electricity at $0.18 per kWh drawn, and gasoline at $3.50 per gallon. These are illustrative inputs, not price forecasts.',
        ],
        example: {
          title: 'Electricity and gasoline for the same trip',
          scenario: 'A 180-mile trip; EV at 3.6 mi/kWh and 90% charging efficiency; gasoline vehicle at 30 MPG; electricity at $0.18/kWh and fuel at $3.50/gal.',
          steps: [
            'EV battery energy: 180 ÷ 3.6 = 50 kWh.',
            'Energy drawn: 50 ÷ 0.90 = 55.56 kWh; charging cost is about 55.56 × $0.18 = $10.',
            'Gasoline used: 180 ÷ 30 = 6 gallons.',
            'Gasoline cost: 6 × $3.50 = $21.',
          ],
          result: 'Under these assumptions, trip energy costs are about $10 for the EV and $21 for gasoline, a difference of $11. Different prices, weather, speeds, losses, or efficiency can reverse or narrow the comparison.',
        },
      },
      {
        id: 'real-world-inputs',
        heading: 'Build a realistic range rather than one forecast',
        paragraphs: [
          'Temperature, speed, elevation, traffic, payload, tires, cabin heating or cooling, and short-trip behavior can move efficiency away from a rating. For charging, preconditioning, battery temperature, charger power, tapering, and accessory use can affect energy drawn and time connected.',
          'Run low, middle, and high price or efficiency cases. Separate home and public charging, and include session or parking fees when they apply. Actual trip data and receipts provide better personal inputs than a generic vehicle rating.',
        ],
      },
    ],
    assumptions: [
      'Both vehicles travel the same 180-mile route under the modeled comparison.',
      'The stated efficiencies and prices remain constant for the entire trip.',
      'EV charging efficiency is 90%, so charger energy exceeds battery energy.',
    ],
    limitations: [
      'The comparison covers propulsion energy only, not total vehicle ownership or travel costs.',
      'Efficiency and charging losses vary with conditions, vehicle, charger, driving style, and measurement method.',
      'Tariffs, taxes, fees, subscriptions, and fuel prices differ by location and can change over time.',
    ],
    nextSteps: [
      'Collect recent vehicle efficiency and local energy-price figures in matching units.',
      'Add charging losses and any session, parking, or subscription costs that apply.',
      'Compare several efficiency and price cases, then check the estimate against actual trip records.',
    ],
    faqs: [
      { question: 'Why is energy drawn from a charger higher than energy added to the battery?', answer: 'Some energy is used by conversion, thermal management, electronics, and other charging processes. The difference varies, so a charging-efficiency assumption should be visible.' },
      { question: 'Should I use my full electricity bill rate?', answer: 'Use the price that best represents additional charging, including time or tier effects and applicable variable charges. Treat fixed charges separately if they would exist without the session.' },
      { question: 'Can I compare mi/kWh directly with MPG?', answer: 'No. They use different energy units. Convert each vehicle’s efficiency into energy cost for the same distance, then compare cost per trip or per mile.' },
      { question: 'Does lower trip energy cost mean lower total ownership cost?', answer: 'Not necessarily. Purchase, finance, depreciation, insurance, maintenance, taxes, and charging equipment are outside a trip-energy comparison.' },
    ],
    relatedCalculators: [
      { href: '/calculators/automotive/ev-charging-cost', label: 'EV charging cost calculator', description: 'Estimate charging energy and cost using battery and electricity inputs.' },
      { href: '/calculators/automotive/fuel-cost', label: 'Fuel cost calculator', description: 'Estimate trip fuel use and cost from distance, economy, and price.' },
      { href: '/calculators/automotive/fuel-economy', label: 'Fuel economy converter', description: 'Translate MPG, L/100 km, and km/L before comparing vehicles.' },
    ],
    relatedArticles: ['unit-conversion-basics'],
  },
  'business-pricing-profit-basics': {
    slug: 'business-pricing-profit-basics',
    title: 'Business pricing and profit basics',
    seoTitle: 'Business Pricing, Margin, and Profit Basics',
    metaDescription: 'Understand unit profit, gross margin, markup, and break-even volume with formulas, a worked pricing example, and practical cost limitations.',
    h1: 'Business pricing and profit basics',
    intro: 'A selling price has to be interpreted alongside the cost assigned to each sale and the fixed costs of operating. Unit profit, margin, markup, and break-even volume answer different questions; keeping their denominators visible prevents common pricing mistakes.',
    published: '2026-09-01',
    modified: '2026-09-01',
    readingTimeMinutes: 9,
    sections: [
      {
        id: 'cost-and-price',
        heading: 'Define the cost behind the price',
        paragraphs: [
          'Unit variable cost should include costs that change with a sale, such as product input, packaging, transaction charges, or directly attributable fulfillment where relevant. Fixed costs such as rent or baseline software usually do not change with one extra unit, but they still must be covered by total contribution.',
          'Be explicit about whether prices and costs include taxes collected for a government, discounts, returns, shipping, and channel fees. A gross profit calculation is only as useful as its cost scope; it is not the same as net business profit.',
        ],
      },
      {
        id: 'margin-and-markup',
        heading: 'Margin and markup use different denominators',
        paragraphs: [
          'Unit gross profit is selling price minus unit cost. Gross margin divides that profit by selling price, while markup divides it by cost. The percentages differ even when the same price and cost are used, so a 50% markup is not a 50% margin.',
          'When working backward from a target margin below 100%, divide cost by one minus the target margin. This is different from multiplying cost by one plus a markup.',
        ],
        formula: {
          expression: 'Margin % = (price − cost) ÷ price × 100; Markup % = (price − cost) ÷ cost × 100',
          explanation: 'Margin measures unit profit as a share of revenue, while markup measures the same unit profit relative to cost.',
          variables: [
            'price = net selling price assigned to one unit',
            'cost = defined unit cost on the same tax and fee basis',
            'price − cost = unit gross profit or contribution under that cost definition',
          ],
        },
      },
      {
        id: 'worked-example',
        heading: 'Worked example: price, margin, and break-even',
        paragraphs: [
          'Suppose a product has an $18 variable unit cost, sells for $30, and the business assigns $6,000 of fixed costs to the planning period. Assume every modeled unit sells at the full price with no returns or extra per-sale costs.',
        ],
        example: {
          title: 'An $18 unit cost and $30 selling price',
          scenario: 'Unit cost of $18, net selling price of $30, and fixed costs of $6,000 for the period.',
          steps: [
            'Unit profit or contribution: $30 − $18 = $12.',
            'Gross margin: $12 ÷ $30 × 100 = 40%.',
            'Markup: $12 ÷ $18 × 100 ≈ 66.67%.',
            'Break-even units: $6,000 ÷ $12 = 500 units.',
          ],
          result: 'The model produces a 40% margin, about 66.67% markup, and 500-unit break-even volume. Selling 500 units covers the stated fixed and variable costs but produces no modeled operating profit.',
        },
      },
      {
        id: 'test-the-plan',
        heading: 'Stress-test volume, discounts, and costs',
        paragraphs: [
          'Break-even volume depends on contribution per unit. Discounts or higher variable costs reduce contribution and raise the volume required; a price increase does the opposite only if demand and sales mix support it. For multiple products, a weighted average contribution requires an assumed sales mix that may change.',
          'Compare several cases for price, cost, volume, returns, and fees. Then check whether capacity, demand, cash timing, competitor behavior, and customer value support the modeled result. A calculator organizes assumptions; it does not choose a commercially or legally appropriate price.',
        ],
      },
    ],
    assumptions: [
      'The example uses one product with a constant $30 net price and $18 variable unit cost.',
      'All 500 modeled units sell with no discounts, returns, spoilage, or additional fees.',
      'The stated $6,000 includes all fixed costs assigned to the planning period.',
    ],
    limitations: [
      'Gross margin does not include every operating cost, financing item, tax, or owner compensation.',
      'Break-even analysis assumes stable price, variable cost, fixed cost, and sales mix within the modeled range.',
      'The method does not forecast demand or determine tax, accounting, competition, or pricing-law obligations.',
    ],
    nextSteps: [
      'Define net selling price and unit cost consistently, including relevant discounts and channel fees.',
      'Calculate margin, markup, and contribution separately, then estimate break-even volume.',
      'Run downside cases and review accounting, tax, or legal treatment with qualified local advisers where needed.',
    ],
    faqs: [
      { question: 'What is the difference between margin and markup?', answer: 'Both begin with price minus cost. Margin divides that amount by price; markup divides it by cost. Because the denominators differ, the percentages are not interchangeable.' },
      { question: 'How do I calculate a price for a target margin?', answer: 'For a target margin expressed as a decimal below 1, divide defined unit cost by 1 minus that margin. Then verify that fees, discounts, taxes, and fixed-cost needs use the intended scope.' },
      { question: 'Does break-even mean the business is profitable?', answer: 'At the modeled break-even point, contribution covers the fixed costs included in the model, leaving zero modeled operating profit. Omitted costs would make the true result lower.' },
      { question: 'Should sales tax be included in selling price?', answer: 'Use a consistent basis. Taxes collected on behalf of an authority are often separated from revenue for analysis, but exact accounting and tax treatment depends on the jurisdiction.' },
    ],
    relatedCalculators: [
      { href: '/calculators/business/profit-margin', label: 'Profit margin calculator', description: 'Calculate unit profit, gross margin, and markup from cost and price.' },
      { href: '/calculators/business/markup', label: 'Markup calculator', description: 'Set an indicative selling price from cost and target markup.' },
      { href: '/calculators/business/break-even', label: 'Break-even calculator', description: 'Estimate units and revenue required to cover modeled costs.' },
    ],
    relatedArticles: ['salary-and-overtime-basics'],
  },
  'unit-conversion-basics': {
    slug: 'unit-conversion-basics',
    title: 'Unit conversion basics',
    seoTitle: 'Unit Conversion Basics and Worked Examples',
    metaDescription: 'Learn dimensional unit conversion with conversion factors, avoid area and volume mistakes, and follow worked length and temperature examples.',
    h1: 'Unit conversion basics',
    intro: 'A unit conversion changes how a quantity is expressed without changing the quantity itself. Reliable conversions carry unit labels through every step, use the right factor and direction, and round only as precisely as the original measurement and task justify.',
    published: '2026-09-01',
    modified: '2026-09-01',
    readingTimeMinutes: 8,
    sections: [
      {
        id: 'factor-label',
        heading: 'Use a factor that cancels the starting unit',
        paragraphs: [
          'Write the starting number with its unit, then multiply by a ratio equal to one. Place the unwanted unit opposite the starting unit so it cancels, leaving the desired unit. This dimensional-analysis approach makes a reversed factor easier to spot.',
          'Some stated factors are exact definitions, while measured inputs are not exact. Keep extra digits during the calculation and round the final result according to the precision needed for the decision.',
        ],
        formula: {
          expression: 'Converted value = starting value × (target-unit quantity ÷ source-unit quantity)',
          explanation: 'The conversion ratio represents equal quantities in different units, with its orientation chosen so the source unit cancels.',
          variables: [
            'starting value = measured or stated quantity in the source unit',
            'target-unit quantity = equivalent amount in the desired unit',
            'source-unit quantity = matching amount in the original unit',
          ],
        },
      },
      {
        id: 'worked-example',
        heading: 'Worked example: feet to metres',
        paragraphs: [
          'Convert a measured length of 14 feet to metres using the exact relationship 1 foot = 0.3048 metre. The measurement itself is shown only to the nearest foot, so displaying many final decimal places would imply more measurement precision than provided.',
        ],
        example: {
          title: 'Convert 14 feet to metres',
          scenario: 'A length of 14 ft and the factor 0.3048 m per ft.',
          steps: [
            'Write the quantity and factor: 14 ft × (0.3048 m ÷ 1 ft).',
            'The foot units cancel, leaving metres.',
            'Multiply: 14 × 0.3048 = 4.2672 m.',
            'For an everyday estimate, report about 4.27 m; retain 4.2672 m if the context supports that precision.',
          ],
          result: 'Fourteen feet is exactly 4.2672 metres under the unit definition, but the useful reported precision depends on how accurately the original 14-foot length was known.',
        },
      },
      {
        id: 'powers-and-temperature',
        heading: 'Area, volume, and temperature need special care',
        paragraphs: [
          'When converting area, square the linear factor; when converting volume, cube it. Since 1 foot equals 0.3048 metre, 1 square foot equals 0.3048², or 0.09290304 square metre. Applying the linear factor once to an area is a common and substantial error.',
          'Temperature scales use an offset as well as a multiplier, so they are not converted by a simple ratio around their zero points. For example, °F = °C × 9 ÷ 5 + 32, while °C = (°F − 32) × 5 ÷ 9. Apply operations in the written order.',
        ],
      },
      {
        id: 'check-the-result',
        heading: 'Check direction, magnitude, and rounding',
        paragraphs: [
          'Before accepting a result, ask whether the number should become larger or smaller. Converting metres to centimetres produces a larger numerical value; converting centimetres to metres produces a smaller one. A rough mental estimate can expose a factor used backward or a misplaced decimal.',
          'Do not mix mass and force, or weight and volume, without additional information. Converting a volume of an ingredient or construction material to mass requires its density, which can vary with composition, packing, moisture, or temperature.',
        ],
      },
    ],
    assumptions: [
      'The source and target units describe the same kind of quantity.',
      'The selected conversion factor is applicable and is oriented so source units cancel.',
      'Intermediate calculations retain sufficient precision before final rounding.',
    ],
    limitations: [
      'A unit conversion cannot supply missing density, concentration, exchange-rate, or material-property information.',
      'Rounded or measured inputs limit meaningful precision even when a conversion factor is exact.',
      'Specialized technical work may require specified constants, reference conditions, tolerances, or domain conventions.',
    ],
    nextSteps: [
      'Label every value and identify the desired output unit before calculating.',
      'Arrange factors so unwanted units cancel, raising linear factors to the correct power for area or volume.',
      'Check the result’s direction and magnitude, then round to precision appropriate for the input and use.',
    ],
    faqs: [
      { question: 'How do I know whether to multiply or divide?', answer: 'Write the factor as a fraction and orient it so the starting unit cancels. Multiplication by that labeled fraction handles the direction without relying on memory.' },
      { question: 'Why can’t I use a length factor directly for square units?', answer: 'Area has two dimensions, so both are converted. The linear factor must be squared; for volume, it must be cubed.' },
      { question: 'Why do temperature conversions add or subtract a number?', answer: 'Common temperature scales have different interval sizes and different zero points. The offset aligns the zero points, while the multiplier converts the interval size.' },
      { question: 'How many decimal places should a conversion show?', answer: 'Keep guard digits during the calculation, then round for the accuracy of the source measurement and the decision. Extra displayed digits do not make an imprecise measurement more accurate.' },
    ],
    relatedCalculators: [
      { href: '/converters/unit', label: 'Unit converter', description: 'Switch among common measurement categories from one converter.' },
      { href: '/converters/length', label: 'Length converter', description: 'Convert metric and imperial lengths and distances.' },
      { href: '/converters/temperature', label: 'Temperature converter', description: 'Convert Celsius, Fahrenheit, and Kelvin with scale offsets handled.' },
    ],
    relatedArticles: ['construction-materials-estimating', 'ev-charging-and-fuel-costs'],
  },
} as const satisfies Record<ArticleSlug, Article>;

export const articles: readonly Article[] = articleSlugs.map((slug) => articleRegistry[slug]);

export function isArticleSlug(value: string): value is ArticleSlug {
  return Object.prototype.hasOwnProperty.call(articleRegistry, value);
}

export function getArticle(slug: string | undefined): Article | undefined {
  return slug && isArticleSlug(slug) ? articleRegistry[slug] : undefined;
}