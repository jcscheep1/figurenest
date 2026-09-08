export type PhaseFourSlug =
  | 'mileage'
  | 'roman-numeral'
  | 'shoe-size'
  | 'social-security'
  | 'take-home-pay'
  | 'tire-size'
  | '401k'
  | 'annuity'
  | 'apr'
  | 'auto-lease'
  | 'bond'
  | 'budget'
  | 'commission'
  | 'credit-card'
  | 'debt-consolidation';

export type PhaseFourCatalogEntry = {
  slug: PhaseFourSlug;
  href: string;
  name: string;
  description: string;
  category: 'Automotive & EV' | 'Converters' | 'Money & Finance' | 'Salary & Work' | 'Business';
  categorySlug: 'automotive' | 'converters' | 'finance' | 'salary-work' | 'business';
  tags: readonly string[];
};

export const phaseFourRoutes: readonly PhaseFourCatalogEntry[] = [
  { slug: 'mileage', href: '/calculators/automotive/mileage', name: 'Mileage Calculator', description: 'Calculate fuel economy from trip distance and fuel consumed in either miles + US gallons or kilometres + litres; this page does not route, map, or geocode travel.', category: 'Automotive & EV', categorySlug: 'automotive', tags: ['trip MPG', 'fuel mileage'] },
  { slug: 'roman-numeral', href: '/converters/roman-numeral', name: 'Roman Numeral Converter', description: 'Convert a whole number from 1 through 3,999 to conventional Roman-numeral notation.', category: 'Converters', categorySlug: 'converters', tags: ['roman numerals', 'arabic number conversion'] },
  { slug: 'shoe-size', href: '/converters/shoe-size', name: 'Shoe Size Converter', description: 'Compare approximate US, UK, and EU shoe sizes for babies and toddlers, children and youth, women, and men, with foot-length references and brand-fit caveats.', category: 'Converters', categorySlug: 'converters', tags: ['shoe conversion', 'baby shoe size', 'kids shoe size', 'women shoe size', 'men shoe size', 'US UK EU shoe size'] },
  { slug: 'social-security', href: '/calculators/finance/social-security', name: 'Social Security Benefit Estimator', description: 'US-only approximate estimator using your entered primary insurance amount (PIA) and published claiming-age adjustment factors; assumptions dated 2026.', category: 'Money & Finance', categorySlug: 'finance', tags: ['SSA retirement benefit', 'retirement claiming age'] },
  { slug: 'take-home-pay', href: '/calculators/salary-work/take-home-pay', name: 'Take-Home Pay Calculator', description: 'Estimate pay after only the tax rate and deductions you enter; no tax tables, filing status, or jurisdiction assumptions are used.', category: 'Salary & Work', categorySlug: 'salary-work', tags: ['net pay', 'gross to net'] },
  { slug: 'tire-size', href: '/calculators/automotive/tire-size', name: 'Tire Size Calculator', description: 'Calculate tire diameter, circumference, revolutions per mile, and speedometer delta from sidewall dimensions.', category: 'Automotive & EV', categorySlug: 'automotive', tags: ['speedometer difference', 'tire circumference'] },
  { slug: '401k', href: '/calculators/finance/401k', name: '401(k) Growth Calculator', description: 'US-only 401(k) estimate using a current balance and separate employee/employer annual amounts. The 2026 employee elective-deferral planning limit is stated as $24,500; verify IRS limits and catch-up eligibility.', category: 'Money & Finance', categorySlug: 'finance', tags: ['retirement plan', 'employer match'] },
  { slug: 'annuity', href: '/calculators/finance/annuity', name: 'Annuity Calculator', description: 'Estimate a level payout from a stated starting value, rate, term, and selected monthly or annual payout mode.', category: 'Money & Finance', categorySlug: 'finance', tags: ['annuity payout', 'income annuity'] },
  { slug: 'apr', href: '/calculators/finance/apr', name: 'APR Calculator', description: 'Estimate APR from the cash a borrower receives, fixed monthly payments, and term after fees withheld from loan proceeds.', category: 'Money & Finance', categorySlug: 'finance', tags: ['annual percentage rate', 'loan fees'] },
  { slug: 'auto-lease', href: '/calculators/finance/auto-lease', name: 'Auto Lease Calculator', description: 'Estimate a pre-tax lease payment using capitalized cost, residual value, term, and money factor; taxes, acquisition fees, and mileage charges are excluded.', category: 'Money & Finance', categorySlug: 'finance', tags: ['vehicle lease', 'money factor'] },
  { slug: 'bond', href: '/calculators/finance/bond', name: 'Bond Calculator', description: 'Estimate a plain fixed-rate bond price with annual coupons and annual compounding; it does not model accrued interest, taxes, calls, credit risk, or market liquidity.', category: 'Money & Finance', categorySlug: 'finance', tags: ['coupon bond', 'bond price'] },
  { slug: 'budget', href: '/calculators/finance/budget', name: 'Budget Calculator', description: 'Compare user-entered monthly after-tax income and expenses to show a surplus or shortfall.', category: 'Money & Finance', categorySlug: 'finance', tags: ['monthly spending', 'income and expenses'] },
  { slug: 'commission', href: '/calculators/business/commission', name: 'Commission Calculator', description: 'Calculate commission and total pay from eligible sales, a user-entered rate, and optional base pay.', category: 'Business', categorySlug: 'business', tags: ['sales commission', 'commission rate'] },
  { slug: 'credit-card', href: '/calculators/finance/credit-card', name: 'Credit Card Payoff Calculator', description: 'Estimate credit-card payoff using a constant payment and APR; this includes an explicit debt payoff mode and does not replace issuer terms.', category: 'Money & Finance', categorySlug: 'finance', tags: ['credit card payoff', 'card interest'] },
  { slug: 'debt-consolidation', href: '/calculators/finance/debt-consolidation', name: 'Debt Consolidation Calculator', description: 'Compare a current constant-payment payoff against a new fixed-rate consolidation loan including entered fees; changing balances, credit effects, and lender terms remain excluded.', category: 'Money & Finance', categorySlug: 'finance', tags: ['debt payoff', 'consolidation loan'] },
];

export const phaseFourSlugs = phaseFourRoutes.map(({ slug }) => slug);