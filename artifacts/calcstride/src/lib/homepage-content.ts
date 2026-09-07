export type HomepageFaqItem = {
  question: string;
  answer: string;
  linkText?: string;
  linkHref?: string;
};

export const homepageFaqData: readonly HomepageFaqItem[] = [
  {
    question: 'Are FigureNest calculators free to use?',
    answer: 'Yes. FigureNest calculators and converters are free to use without creating an account or crossing a paywall.',
  },
  {
    question: 'How do I calculate a loan payment with interest?',
    answer: 'A fixed loan payment uses the amount borrowed, periodic interest rate, and number of payments. The result repays principal and interest over the chosen term, assuming a fixed rate and regular payments.',
    linkText: 'Use the loan payment estimator',
    linkHref: '/calculators/finance/loan',
  },
  {
    question: 'How does compound interest work?',
    answer: 'Compound interest applies growth to the starting principal and to interest already earned. The rate, compounding frequency, time, and any contributions can all change the projected balance.',
    linkText: 'Try the compound interest calculator',
    linkHref: '/calculators/finance/compound-interest',
  },
  {
    question: 'What should a mortgage payment estimate include?',
    answer: 'Principal and interest come from the loan formula. A fuller housing estimate may also include property taxes, homeowners insurance, mortgage insurance, association dues, and maintenance when they apply.',
    linkText: 'Estimate a mortgage payment',
    linkHref: '/calculators/finance/mortgage',
  },
  {
    question: 'How do I find a percentage of a number?',
    answer: 'Convert the percentage to a decimal and multiply it by the number: 20% of 80 is 0.20 × 80, or 16. Separate tools can compare percentage change or reverse a percentage.',
    linkText: 'Open the percentage calculator',
    linkHref: '/calculators/finance/percentage',
  },
  {
    question: 'How does FigureNest check calculator results?',
    answer: 'We compare displayed formulas with representative calculations, exercise ordinary and boundary inputs, check unit conversions and rounding, and explain important assumptions and limitations. These checks reduce avoidable errors but do not guarantee every result.',
    linkText: 'Read the calculator methodology',
    linkHref: '/methodology',
  },
  {
    question: 'Does FigureNest save the numbers I enter?',
    answer: 'Public calculator inputs are processed in the browser and do not require an account. FigureNest may collect consent-controlled usage events, but those events do not include the values entered into calculator fields. Do not enter sensitive information.',
    linkText: 'Read the privacy policy',
    linkHref: '/privacy',
  },
];

export const homepageArticlePreviews = [
  {
    title: 'Mortgage payment basics',
    description: 'Separate principal and interest from taxes, insurance, and the other costs that shape a housing budget.',
    href: '/articles/mortgage-payment-basics',
  },
  {
    title: 'Refinancing considerations',
    description: 'Compare costs, payment changes, term resets, and a simple break-even estimate before weighing an offer.',
    href: '/articles/refinancing-considerations',
  },
  {
    title: 'Loan payment calculations',
    description: 'See how principal, rate, and term combine in a fixed-payment loan and why total interest matters.',
    href: '/articles/loan-payment-calculations',
  },
  {
    title: 'Compound interest guide',
    description: 'Understand compounding frequency, contributions, time, and the assumptions behind a growth projection.',
    href: '/articles/compound-interest-guide',
  },
  {
    title: 'Construction materials estimating',
    description: 'Turn area and volume measurements into practical material orders while accounting for waste and project limits.',
    href: '/articles/construction-materials-estimating',
  },
  {
    title: 'Salary and overtime basics',
    description: 'Compare annualized salary and overtime estimates while keeping gross pay separate from take-home pay and local rules.',
    href: '/articles/salary-and-overtime-basics',
  },
  {
    title: 'EV charging and fuel costs',
    description: 'Compare trip fuel costs with EV charging costs using consistent distance, efficiency, and energy-price assumptions.',
    href: '/articles/ev-charging-and-fuel-costs',
  },
  {
    title: 'Business pricing and profit',
    description: 'See how markup, margin, break-even volume, and return on investment answer different business questions.',
    href: '/articles/business-pricing-profit-basics',
  },
  {
    title: 'Unit conversion basics',
    description: 'Choose reliable conversion factors and understand why temperature, area, and volume need special treatment.',
    href: '/articles/unit-conversion-basics',
  },
] as const;