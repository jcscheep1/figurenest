import { coreFields, type CoreField } from './core-calculators';
import {
  businessGrowthContent,
  businessGrowthSlugs,
  type BusinessGrowthSlug,
} from './business-growth-calculators';
import { syncRegistrySeoCapabilities } from './seo-capabilities';

export const businessCalculatorSlugs = [
  'roi',
  'profit-margin',
  'markup',
  'break-even',
  ...businessGrowthSlugs,
] as const;
export type BusinessCalculatorSlug = typeof businessCalculatorSlugs[number];

type BusinessExample = {
  title: string;
  inputs: string;
  working: string;
  result: string;
  interpretation: string;
};

type BusinessFaq = {
  question: string;
  answer: string;
};

type BusinessLink = {
  slug: BusinessCalculatorSlug;
  label: string;
  context: string;
};

export type BusinessCalculatorContent = {
  slug: BusinessCalculatorSlug;
  title: string;
  titleLines: readonly [string, string];
  description: string;
  seoTitle: string;
  seoDescription: string;
  fields: readonly CoreField[];
  resultLabel: string;
  resultSummary: string;
  updatedNote: string;
  decisionTitle: string;
  whenUseful: string[];
  distinction: string;
  formula: string;
  formulaExplanation: string;
  examples: BusinessExample[];
  interpretation: string[];
  assumptions: string[];
  commonMistakes: string[];
  edgeCases: { title: string; explanation: string }[];
  limitations: string;
  faqs: BusinessFaq[];
  relatedTools: BusinessLink[];
};

const roi: BusinessCalculatorContent = {
  slug: 'roi',
  title: 'ROI Calculator',
  titleLines: ['Return on Investment', 'Calculator'],
  description: 'Measure an investment’s gain or loss against its original cost and express the result as a return on investment percentage.',
  seoTitle: 'ROI Calculator — Return on Investment | FigureNest',
  seoDescription: 'Calculate return on investment from initial cost and final value. See the gain or loss, ROI percentage, formula, examples, and limitations.',
  fields: coreFields.roi,
  resultLabel: 'RETURN ON INVESTMENT',
  resultSummary: 'ROI compares the net gain or loss with the initial investment, not with sales revenue or the final value.',
  updatedNote: 'COST-BASED INVESTMENT RETURN',
  decisionTitle: 'Use ROI to compare an outcome with what you invested',
  whenUseful: [
    'ROI is useful when a project, campaign, asset, or purchase has a clear initial cost and a measurable final value or return. It answers: “How large was the gain or loss relative to the amount put at risk?”',
    'Because ROI turns differently sized investments into percentages, it can help compare alternatives. A higher percentage is not automatically the better decision, however: timing, risk, cash flow, effort, and the absolute monetary gain can all matter.',
  ],
  distinction: 'ROI uses initial investment as its denominator. Profit margin instead divides profit by selling price or revenue. Markup divides profit by cost. Break-even calculates the sales volume needed for contribution margin to cover fixed costs.',
  formula: 'ROI (%) = (Final value − Initial investment) ÷ Initial investment × 100',
  formulaExplanation: 'Final value minus initial investment is the net gain or loss. Dividing by the initial investment scales that change to the amount originally committed. A positive result is a gain, 0% means no change, and a negative result is a loss.',
  examples: [
    {
      title: 'Marketing campaign',
      inputs: '$5,000 campaign cost and $6,800 attributable value',
      working: '($6,800 − $5,000) ÷ $5,000 × 100',
      result: '36% ROI and a $1,800 gain',
      interpretation: 'The modeled value exceeded campaign cost by 36% of the original spend. Attribution quality still determines whether the comparison is meaningful.',
    },
    {
      title: 'Equipment purchase',
      inputs: '$20,000 total investment and $25,000 value after the period',
      working: '($25,000 − $20,000) ÷ $20,000 × 100',
      result: '25% ROI and a $5,000 gain',
      interpretation: 'The gain equals one quarter of the initial cost. This simple ROI does not show how many years were required.',
    },
    {
      title: 'Investment loss',
      inputs: '$12,000 initial investment and $9,000 final value',
      working: '($9,000 − $12,000) ÷ $12,000 × 100',
      result: '−25% ROI and a $3,000 loss',
      interpretation: 'The investment lost one quarter of its original value. A loss can be valid output and should not be confused with an input error.',
    },
  ],
  interpretation: [
    'Compare ROI only when the cost and return boundaries are consistent. If one option includes labor, fees, maintenance, and taxes while another excludes them, the percentages do not describe equivalent economics.',
    'Simple ROI has no time component. A 20% return earned in one year and the same 20% earned in five years have different annualized performance. Use cash-flow or annualized-return analysis for time-sensitive investment decisions.',
  ],
  assumptions: [
    'The initial investment includes all costs you intend the return to cover.',
    'The final value and initial cost use the same selected denomination and valuation date; the selector does not apply an exchange rate.',
    'Any intermediate income or expense is already included in the final value.',
    'No adjustment is made for time, inflation, financing, taxes, or risk.',
  ],
  commonMistakes: [
    'Using revenue as the final value without subtracting costs that belong to the investment.',
    'Comparing ROI percentages measured over different time periods as though they were annual rates.',
    'Ignoring a negative ROI because the final value is still a positive dollar amount.',
    'Calling profit margin or markup “ROI” even though those calculations use different denominators.',
  ],
  edgeCases: [
    { title: 'Final value equals initial cost', explanation: 'The gain is zero and ROI is 0%.' },
    { title: 'Final value is zero', explanation: 'The investment has lost its full initial value, producing −100% ROI.' },
    { title: 'Initial investment is zero', explanation: 'ROI is undefined because the formula would divide by zero, so the calculator returns an error.' },
  ],
  limitations: 'This is a simple, single-period ROI. It does not annualize the return, discount future cash flows, model irregular deposits or withdrawals, or measure risk. For major capital decisions, use complete cash-flow forecasts and appropriate measures such as payback period, NPV, or IRR.',
  faqs: [
    { question: 'How is ROI calculated?', answer: 'Subtract the initial investment from the final value, divide that gain or loss by the initial investment, and multiply by 100.' },
    { question: 'What does a negative ROI mean?', answer: 'A negative ROI means the final value is below the initial investment. For example, −25% means the loss equals 25% of the original cost.' },
    { question: 'Is ROI the same as profit margin?', answer: 'No. ROI divides gain by the initial investment. Profit margin divides profit by selling price or revenue.' },
    { question: 'Does ROI account for time?', answer: 'Not in this calculator. Simple ROI treats a return the same whether it took months or years, so compare time periods carefully.' },
    { question: 'Can ROI be more than 100%?', answer: 'Yes. ROI exceeds 100% when the net gain is larger than the full initial investment.' },
    { question: 'Why can’t ROI be calculated from a zero initial investment?', answer: 'The formula divides by initial investment. Division by zero is undefined, so a meaningful ROI percentage cannot be produced.' },
  ],
  relatedTools: [
    { slug: 'profit-margin', label: 'Measure profit as a share of selling price', context: 'Use Profit Margin when the question is how much of each sales dollar remains after item cost.' },
    { slug: 'markup', label: 'Set a selling price from cost and target markup', context: 'Use Markup before a sale when pricing from a cost base.' },
    { slug: 'break-even', label: 'Find the sales volume needed to cover costs', context: 'Use Break-Even to connect unit economics with fixed-cost recovery.' },
  ],
};

const profitMargin: BusinessCalculatorContent = {
  slug: 'profit-margin',
  title: 'Profit Margin Calculator',
  titleLines: ['Profit Margin', 'Calculator'],
  description: 'Calculate gross profit and gross margin from item cost and selling price, with the equivalent cost-based markup shown for comparison.',
  seoTitle: 'Profit Margin Calculator — Gross Margin | FigureNest',
  seoDescription: 'Calculate gross profit margin from cost and selling price. Compare margin with markup using formulas, examples, interpretation, and common mistakes.',
  fields: coreFields['profit-margin'],
  resultLabel: 'GROSS PROFIT MARGIN',
  resultSummary: 'Margin shows gross profit as a percentage of selling price. The same profit produces a larger markup percentage because markup uses cost as its base.',
  updatedNote: 'SELLING-PRICE-BASED PROFITABILITY',
  decisionTitle: 'Use profit margin to understand each sales dollar',
  whenUseful: [
    'Gross profit margin answers: “What percentage of the selling price remains after the direct item cost?” It is useful for reviewing product economics, comparing prices, and checking whether gross profit can contribute enough toward overhead and operating profit.',
    'This calculator starts with cost and selling price. It reports the dollar gross profit, gross margin, and equivalent markup so you can see how the two percentage conventions describe the same transaction differently.',
  ],
  distinction: 'Profit margin uses selling price as the denominator. Markup uses cost as the denominator, so a 40% margin is not a 40% markup. ROI compares an investment outcome with initial investment, while break-even uses unit contribution to calculate required sales volume.',
  formula: 'Gross margin (%) = (Selling price − Cost) ÷ Selling price × 100',
  formulaExplanation: 'Selling price minus cost is gross profit per item. Dividing that profit by selling price shows the share of revenue left after the entered direct cost. Equivalent markup divides the same profit by cost instead.',
  examples: [
    {
      title: 'Retail product',
      inputs: '$48 item cost and $80 selling price',
      working: '($80 − $48) ÷ $80 × 100',
      result: '40% margin, $32 gross profit, 66.67% markup',
      interpretation: 'Forty cents of each sales dollar remains after the entered item cost, before overhead, payment fees, taxes, and other expenses.',
    },
    {
      title: 'Lower-margin order',
      inputs: '$75 cost and $100 selling price',
      working: '($100 − $75) ÷ $100 × 100',
      result: '25% margin, $25 gross profit, 33.33% markup',
      interpretation: 'The markup is higher than the margin because $25 is divided by the smaller $75 cost base.',
    },
    {
      title: 'Sale below cost',
      inputs: '$60 cost and $50 selling price',
      working: '($50 − $60) ÷ $50 × 100',
      result: '−20% margin and a $10 gross loss',
      interpretation: 'A negative margin is a valid warning that the selling price does not recover the entered direct cost.',
    },
  ],
  interpretation: [
    'Gross margin is not the same as net profit margin. This calculator uses one direct cost and does not subtract payroll, rent, advertising, payment processing, returns, taxes, or other operating expenses.',
    'A target margin can guide pricing, but customer demand and competitive conditions still matter. Use the Markup Calculator when your pricing rule starts with cost; use Break-Even when fixed costs and sales volume also matter.',
  ],
  assumptions: [
    'Cost and selling price refer to the same single unit and use the same selected denomination without exchange-rate conversion.',
    'The cost entered is the direct cost you want included in gross profit.',
    'No sales tax collected on behalf of a government is included in selling price.',
    'The calculation represents one price and cost point without quantity tiers or returns.',
  ],
  commonMistakes: [
    'Using markup and margin percentages interchangeably.',
    'Leaving freight, packaging, platform fees, or direct labor out of cost when they belong in product economics.',
    'Treating gross margin as net business profit.',
    'Using a tax-inclusive customer price when tax is passed through rather than retained as revenue.',
  ],
  edgeCases: [
    { title: 'Selling price equals cost', explanation: 'Gross profit and margin are both zero.' },
    { title: 'Selling price below cost', explanation: 'The result is a negative margin and gross loss, which is valid output.' },
    { title: 'Selling price is zero', explanation: 'Margin is undefined because the formula divides by selling price, so the calculator returns an error.' },
    { title: 'Cost is zero', explanation: 'Margin is 100%, while markup is undefined because markup would divide by zero cost.' },
  ],
  limitations: 'This is a per-unit gross margin calculation. It does not calculate net margin, blended product mix, discounts, sales tax, inventory write-offs, returns, overhead, or income tax. Use consistent accounting definitions when comparing margins across products or reporting periods.',
  faqs: [
    { question: 'How do I calculate profit margin?', answer: 'Subtract cost from selling price, divide the gross profit by selling price, and multiply by 100.' },
    { question: 'What is the difference between margin and markup?', answer: 'Margin divides profit by selling price. Markup divides the same profit by cost, so the percentages are different unless profit is zero.' },
    { question: 'Can profit margin be negative?', answer: 'Yes. If cost exceeds selling price, gross profit and gross margin are negative.' },
    { question: 'Is gross margin the same as net margin?', answer: 'No. Gross margin subtracts the entered direct cost. Net margin also reflects operating expenses, interest, taxes, and other gains or losses.' },
    { question: 'What does a 40% margin mean?', answer: 'It means gross profit equals 40% of selling price. On an $80 sale, a 40% margin is $32 of gross profit.' },
    { question: 'Why is markup higher than margin for the same sale?', answer: 'Markup divides profit by cost, while margin divides by the higher selling price. Dividing by the smaller base produces the larger percentage.' },
  ],
  relatedTools: [
    { slug: 'markup', label: 'Turn a cost and markup target into a price', context: 'Use Markup when you know cost and want to set the selling price.' },
    { slug: 'break-even', label: 'See how many sales cover fixed costs', context: 'Use Break-Even after estimating the contribution earned by each unit.' },
    { slug: 'roi', label: 'Compare a project gain with its investment', context: 'Use ROI for an investment outcome rather than per-sale profitability.' },
  ],
};

const markup: BusinessCalculatorContent = {
  slug: 'markup',
  title: 'Markup Calculator',
  titleLines: ['Markup & Selling Price', 'Calculator'],
  description: 'Set a selling price by applying a cost-based markup percentage and see the markup amount added to the original item cost.',
  seoTitle: 'Markup Calculator — Cost to Selling Price | FigureNest',
  seoDescription: 'Calculate selling price and markup amount from item cost and a target markup percentage. Learn how markup differs from profit margin.',
  fields: coreFields.markup,
  resultLabel: 'CALCULATED SELLING PRICE',
  resultSummary: 'Markup applies a percentage to cost. It does not mean the final sale has the same profit margin percentage.',
  updatedNote: 'COST-BASED PRICING',
  decisionTitle: 'Use markup when pricing starts with cost',
  whenUseful: [
    'Markup is a pricing method: start with an item cost, choose a percentage of that cost to add, and calculate a selling price. It is common in retail, wholesale, contracting, and resale workflows where costs are known before the customer price is set.',
    'The result shows both the markup amount and final price. After setting a price, use Profit Margin to see what share of the selling price the gross profit represents.',
  ],
  distinction: 'Markup divides profit by cost and is used to build a selling price. Profit margin divides profit by selling price and evaluates the resulting sale. ROI compares a broader gain with investment, while break-even finds how many unit contributions cover fixed costs.',
  formula: 'Selling price = Cost × (1 + Markup percentage ÷ 100)',
  formulaExplanation: 'Markup amount equals cost × markup percentage ÷ 100. Adding that amount to cost gives selling price. The resulting margin equals markup ÷ (100 + markup), so a 50% markup produces a 33.33% margin—not 50%.',
  examples: [
    {
      title: 'Standard product markup',
      inputs: '$48 cost with a 40% markup',
      working: '$48 × (1 + 0.40)',
      result: '$67.20 selling price and $19.20 markup amount',
      interpretation: 'The equivalent gross margin is 28.57% because $19.20 is divided by the $67.20 selling price.',
    },
    {
      title: 'Doubling cost',
      inputs: '$25 cost with a 100% markup',
      working: '$25 × (1 + 1.00)',
      result: '$50 selling price and $25 markup amount',
      interpretation: 'A 100% markup doubles cost but produces a 50% gross margin.',
    },
    {
      title: 'Low-markup wholesale item',
      inputs: '$200 cost with a 15% markup',
      working: '$200 × (1 + 0.15)',
      result: '$230 selling price and $30 markup amount',
      interpretation: 'The equivalent margin is about 13.04% before other direct expenses.',
    },
  ],
  interpretation: [
    'A markup policy is only as useful as the cost base. If direct freight, packaging, commissions, or labor are omitted, the calculated price may not provide the expected profitability.',
    'Markup does not guarantee a sale or a net profit. Compare the calculated price with market conditions, then review gross margin and break-even volume before making a pricing decision.',
  ],
  assumptions: [
    'The entered cost is the complete per-unit base to which markup should apply.',
    'Markup is a non-negative percentage of cost.',
    'Cost and selling price use the same selected denomination; changing it does not rescale the values with an exchange rate.',
    'No tax, discount, commission, or quantity pricing is added after the calculation.',
  ],
  commonMistakes: [
    'Entering a target profit margin as though it were the same markup percentage.',
    'Applying markup to an incomplete cost that excludes direct fulfillment expenses.',
    'Adding 100% and assuming the result has a 100% profit margin.',
    'Ignoring discounts that reduce the realized selling price and margin.',
  ],
  edgeCases: [
    { title: 'A 0% markup', explanation: 'Selling price equals cost and the markup amount is zero.' },
    { title: 'A 100% markup', explanation: 'Selling price is twice cost, producing a 50% gross margin.' },
    { title: 'A zero cost', explanation: 'The mathematical selling price is zero for any percentage because markup is applied to the cost base.' },
  ],
  limitations: 'The calculator applies one percentage to one unit cost. It does not optimize prices, include sales tax, model discounts or demand, allocate overhead, or enforce currency-specific rounding. Confirm that the resulting price covers all relevant costs and fits the market.',
  faqs: [
    { question: 'How is markup calculated?', answer: 'Markup amount is cost multiplied by the markup percentage. Selling price is cost plus that markup amount.' },
    { question: 'Is a 50% markup the same as a 50% margin?', answer: 'No. A 50% markup produces a selling price equal to 150% of cost and an equivalent margin of 33.33%.' },
    { question: 'What markup doubles the cost?', answer: 'A 100% markup adds an amount equal to cost, so the selling price is twice the original cost.' },
    { question: 'Can markup be zero?', answer: 'Yes. At 0% markup, selling price equals cost and there is no gross profit before other expenses.' },
    { question: 'Should tax be included in the selling price?', answer: 'Usually sales tax collected for a government is handled separately, but pricing and tax rules vary. Use the pre-tax selling price for a clean margin comparison.' },
    { question: 'How do I convert markup to margin?', answer: 'Use Margin (%) = Markup (%) ÷ (100 + Markup (%)) × 100. For example, a 50% markup converts to a 33.33% margin.' },
  ],
  relatedTools: [
    { slug: 'profit-margin', label: 'Check the margin created by your selling price', context: 'Use Profit Margin to evaluate profit as a share of the resulting price.' },
    { slug: 'break-even', label: 'Estimate sales needed at the chosen price', context: 'Use Break-Even to see how unit contribution covers fixed costs.' },
    { slug: 'roi', label: 'Measure return on a broader investment', context: 'Use ROI when comparing a project or asset outcome with its initial cost.' },
  ],
};

const breakEven: BusinessCalculatorContent = {
  slug: 'break-even',
  title: 'Break-Even Calculator',
  titleLines: ['Break-Even Point', 'Calculator'],
  description: 'Find the minimum whole units and sales revenue needed for unit contribution to cover fixed costs.',
  seoTitle: 'Break-Even Calculator — Units & Revenue | FigureNest',
  seoDescription: 'Calculate break-even units and revenue from fixed costs, selling price, and variable cost per unit. See contribution margin and practical examples.',
  fields: coreFields['break-even'],
  resultLabel: 'BREAK-EVEN SALES VOLUME',
  resultSummary: 'The result rounds up to a whole unit so total contribution meets or exceeds fixed costs.',
  updatedNote: 'FIXED COST RECOVERY',
  decisionTitle: 'Use break-even to connect pricing, cost, and volume',
  whenUseful: [
    'Break-even analysis answers: “How many units must be sold before total contribution covers fixed costs?” It combines fixed expenses with the amount each sale contributes after its variable cost.',
    'Use it when evaluating a launch, price change, location, campaign, or operating plan. It does not forecast whether the required sales will happen; it defines the threshold that a demand forecast can be compared with.',
  ],
  distinction: 'Break-even produces a required unit volume, not a profitability percentage. Profit margin evaluates profit as a share of selling price, markup sets price from cost, and ROI compares an investment outcome with the amount invested.',
  formula: 'Break-even units = Fixed costs ÷ (Selling price per unit − Variable cost per unit)',
  formulaExplanation: 'Selling price minus variable cost is contribution margin per unit. Each unit contributes that amount toward fixed costs. Exact break-even revenue uses the unrounded unit result. Because partial units often cannot be sold, the headline result rounds up and also shows revenue at that minimum whole-unit volume.',
  examples: [
    {
      title: 'Product launch',
      inputs: '$12,000 fixed costs, $80 selling price, and $32 variable cost per unit',
      working: '$12,000 ÷ ($80 − $32) = 250',
      result: '250 units; $20,000 exact break-even revenue and revenue at 250 units',
      interpretation: 'Each unit contributes $48. After 250 units, total contribution equals the entered fixed costs.',
    },
    {
      title: 'Workshop seats',
      inputs: '$4,500 fixed costs, $150 ticket price, and $30 variable cost per attendee',
      working: '$4,500 ÷ ($150 − $30) = 37.5, rounded up',
      result: '38 attendees; $5,625 exact break-even revenue; $5,700 revenue at 38 attendees',
      interpretation: 'Thirty-seven attendees fall short. Exact break-even is 37.5 attendees, while the first sellable whole-attendee count that covers fixed cost is 38.',
    },
    {
      title: 'Subscription onboarding',
      inputs: '$30,000 fixed costs, $25 price, and $10 variable cost per subscriber',
      working: '$30,000 ÷ ($25 − $10)',
      result: '2,000 subscribers; $50,000 exact break-even revenue and revenue at 2,000 subscribers',
      interpretation: 'The threshold depends on the assumed $15 contribution per subscriber and does not include churn or changing support costs.',
    },
  ],
  interpretation: [
    'A lower break-even point can come from lower fixed costs, a higher price, or lower variable cost. Each change may also affect demand, capacity, quality, or customer value, so treat the formula as one part of the decision.',
    'The model assumes constant unit economics. If costs or prices change by volume tier, calculate separate scenarios or use a fuller forecast rather than averaging away meaningful differences.',
  ],
  assumptions: [
    'Fixed costs do not change over the sales range being considered.',
    'Selling price and variable cost per unit remain constant.',
    'Every unit sold has the same cost and contribution.',
    'All produced units are sold and product mix does not change.',
  ],
  commonMistakes: [
    'Dividing fixed cost by selling price instead of contribution per unit.',
    'Classifying a cost as fixed even though it rises with each sale.',
    'Using gross margin percentage in place of contribution amount per unit.',
    'Treating the break-even threshold as a sales forecast or cash-flow date.',
  ],
  edgeCases: [
    { title: 'Selling price equals variable cost', explanation: 'Contribution per unit is zero, so no number of sales can recover fixed costs.' },
    { title: 'Variable cost exceeds price', explanation: 'Each sale increases the loss, so the calculator rejects the scenario.' },
    { title: 'Fixed costs are zero', explanation: 'The mathematical break-even volume is zero units.' },
    { title: 'Fractional result', explanation: 'The calculator rounds up because the lower whole-unit count would not fully cover fixed costs.' },
  ],
  limitations: 'This is a single-product, accounting break-even estimate. It excludes changing prices, tiered costs, taxes, financing, inventory timing, capacity constraints, cash collection timing, product mix, and target profit. Multi-product businesses need a weighted contribution-margin analysis.',
  faqs: [
    { question: 'How is the break-even point calculated?', answer: 'Divide fixed costs by selling price per unit minus variable cost per unit. The denominator is contribution margin per unit.' },
    { question: 'Why does the calculator round break-even units up?', answer: 'The lower whole-unit count would leave some fixed cost uncovered. Rounding up gives the first whole-unit volume that meets or exceeds break-even.' },
    { question: 'What is contribution margin per unit?', answer: 'It is selling price per unit minus variable cost per unit. That amount contributes toward fixed costs and then profit.' },
    { question: 'What happens when variable cost equals selling price?', answer: 'Contribution is zero, so selling more units never covers fixed costs. There is no finite break-even volume.' },
    { question: 'Is break-even revenue the same as profit?', answer: 'No. At the exact break-even revenue, modeled contribution covers fixed costs and modeled profit is zero. When the unit threshold is rounded up, revenue at that minimum whole-unit volume can produce a small positive modeled profit.' },
    { question: 'Can I use this for multiple products?', answer: 'Not directly. A multi-product analysis needs expected sales mix and a weighted average contribution margin.' },
  ],
  relatedTools: [
    { slug: 'profit-margin', label: 'Review margin at the current selling price', context: 'Use Profit Margin to understand per-sale gross profitability.' },
    { slug: 'markup', label: 'Set a price from cost before testing volume', context: 'Use Markup to create a candidate selling price from a cost-based rule.' },
    { slug: 'roi', label: 'Measure the return after an investment period', context: 'Use ROI once you have an investment cost and final outcome to compare.' },
  ],
};

const growthSupplement: Record<BusinessGrowthSlug, {
  updatedNote: string;
  distinction: string;
  examples: BusinessExample[];
  edgeCases: { title: string; explanation: string }[];
  limitations: string;
}> = {
  roas: {
    updatedNote: 'ADVERTISING REVENUE EFFICIENCY',
    distinction: 'ROAS compares attributed revenue with advertising spend. ROI compares net gain with an investment, CPC compares spend with clicks, CPM compares spend with impressions, and CAC compares acquisition spend with customers acquired.',
    examples: [
      {
        title: 'Paid search campaign',
        inputs: '$2,500 advertising spend and $10,000 attributed revenue',
        working: '$10,000 ÷ $2,500',
        result: '4.00× ROAS and 400% ROAS',
        interpretation: 'The campaign produced four dollars of attributed revenue for each dollar of advertising spend before product cost and other operating expenses.',
      },
      {
        title: 'Below-spend revenue',
        inputs: '$4,000 advertising spend and $3,000 attributed revenue',
        working: '$3,000 ÷ $4,000',
        result: '0.75× ROAS and 75% ROAS',
        interpretation: 'Attributed revenue is below advertising spend, but the full business decision still depends on attribution quality and downstream customer value.',
      },
    ],
    edgeCases: [
      { title: 'Zero advertising spend', explanation: 'ROAS is undefined because advertising spend is the denominator, so the calculator returns an error.' },
      { title: 'Zero attributed revenue', explanation: 'The result is 0.00× ROAS when advertising spend is positive.' },
      { title: 'Very large campaign values', explanation: 'Inputs are capped at the shared trillion-unit safety bound to avoid unreliable numeric output.' },
    ],
    limitations: 'ROAS is an attribution-based revenue metric, not a profit measure. It does not subtract product cost, fulfillment, payroll, platform fees, taxes, refunds outside the entered revenue figure, or the cost of retaining the customer. Attribution models can also assign different revenue to the same campaign.',
  },
  'conversion-rate': {
    updatedNote: 'FUNNEL CONVERSION EFFICIENCY',
    distinction: 'Conversion rate measures completed outcomes as a share of an opportunity count. CPC measures the price of clicks, CPM measures the price of impressions, ROAS connects ad spend with attributed revenue, and CAC connects acquisition spend with new customers.',
    examples: [
      {
        title: 'Ecommerce sessions',
        inputs: '5,000 eligible sessions and 175 purchases',
        working: '175 ÷ 5,000 × 100',
        result: '3.5% conversion rate',
        interpretation: 'About 3.5 of every 100 counted sessions completed the defined conversion action during the measured period.',
      },
      {
        title: 'Lead follow-up',
        inputs: '800 qualified leads and 96 completed sales',
        working: '96 ÷ 800 × 100',
        result: '12% conversion rate',
        interpretation: 'The result is meaningful only if the lead and sale counts use the same funnel definition and time window.',
      },
    ],
    edgeCases: [
      { title: 'Zero opportunities', explanation: 'A conversion rate cannot be calculated because the opportunity count is the denominator.' },
      { title: 'Zero conversions', explanation: 'The result is a valid 0% conversion rate when the opportunity count is positive.' },
      { title: 'Conversions above opportunities', explanation: 'The calculator can display an event-based rate above 100%, but that result should only be used when multiple conversions per opportunity are possible.' },
    ],
    limitations: 'A single conversion rate does not explain why people converted, the statistical significance of changes, customer quality, revenue, margin, or retention. Different denominators such as users, sessions, leads, or clicks produce different rates, so comparisons require a stable definition.',
  },
  cpc: {
    updatedNote: 'PAID TRAFFIC COST',
    distinction: 'CPC divides advertising spend by clicks. CPM prices impression delivery, conversion rate measures what share of opportunities complete an action, ROAS compares spend with attributed revenue, and CAC averages acquisition spend across new customers.',
    examples: [
      {
        title: 'Search ads',
        inputs: '$1,250 spend and 2,500 clicks',
        working: '$1,250 ÷ 2,500',
        result: '$0.50 average CPC',
        interpretation: 'The campaign paid an average of fifty cents per recorded click before considering whether those clicks converted.',
      },
      {
        title: 'Higher-cost traffic',
        inputs: '$3,600 spend and 1,200 clicks',
        working: '$3,600 ÷ 1,200',
        result: '$3.00 average CPC',
        interpretation: 'A higher CPC can still be economically stronger if the traffic converts better or produces higher-value customers.',
      },
    ],
    edgeCases: [
      { title: 'Zero clicks', explanation: 'Average CPC is undefined because clicks are the denominator, so the calculator returns an error.' },
      { title: 'Zero spend', explanation: 'The result is a valid zero CPC when at least one click is recorded.' },
      { title: 'Mixed reporting periods', explanation: 'Spend and click counts from different date ranges can produce a mathematically valid but operationally misleading result.' },
    ],
    limitations: 'Average CPC does not show click quality, bid distribution, impression volume, conversion rate, revenue, or profitability. Platform adjustments and attribution timing can change spend and click counts, so use consistent reporting scopes when comparing campaigns.',
  },
  cpm: {
    updatedNote: 'MEDIA EXPOSURE COST',
    distinction: 'CPM standardizes spend per one thousand impressions. CPC measures cost per click, conversion rate measures completed outcomes, ROAS compares spend with attributed revenue, and CAC measures average cost per new customer.',
    examples: [
      {
        title: 'Display campaign',
        inputs: '$3,000 spend and 600,000 impressions',
        working: '$3,000 ÷ 600,000 × 1,000',
        result: '$5.00 CPM',
        interpretation: 'The campaign paid five dollars for each one thousand delivered impressions before considering viewability or response quality.',
      },
      {
        title: 'Premium inventory',
        inputs: '$8,400 spend and 350,000 impressions',
        working: '$8,400 ÷ 350,000 × 1,000',
        result: '$24.00 CPM',
        interpretation: 'The higher exposure cost may or may not be justified by better audience fit, placement quality, reach, or downstream results.',
      },
    ],
    edgeCases: [
      { title: 'Zero impressions', explanation: 'CPM cannot be calculated because impressions are the denominator.' },
      { title: 'Zero spend', explanation: 'The result is a valid zero CPM when impressions are positive.' },
      { title: 'Repeated impressions', explanation: 'CPM counts delivered impressions rather than unique people, so repeated exposure can be included in the denominator.' },
    ],
    limitations: 'CPM measures exposure cost only. It does not measure unique reach, frequency, viewability, clicks, conversions, attribution, revenue, or profit. Inventory quality and audience relevance can differ substantially even when two campaigns report the same CPM.',
  },
  'customer-acquisition-cost': {
    updatedNote: 'CUSTOMER ACQUISITION EFFICIENCY',
    distinction: 'CAC divides acquisition spend by new customers acquired. ROAS focuses on attributed revenue from advertising, CPC focuses on clicks, CPM focuses on impressions, and conversion rate focuses on completed outcomes relative to opportunities.',
    examples: [
      {
        title: 'Blended acquisition program',
        inputs: '$20,000 acquisition spend and 125 new customers',
        working: '$20,000 ÷ 125',
        result: '$160.00 CAC',
        interpretation: 'The modeled acquisition program spent an average of $160 for each new customer before considering contribution margin and retention.',
      },
      {
        title: 'Channel-specific acquisition',
        inputs: '$7,500 channel spend and 60 new customers',
        working: '$7,500 ÷ 60',
        result: '$125.00 CAC',
        interpretation: 'Compare this channel CAC with a consistently defined benchmark and with the value created by customers from the same channel.',
      },
    ],
    edgeCases: [
      { title: 'Zero new customers', explanation: 'CAC is undefined because new customers are the denominator, so the calculator returns an error.' },
      { title: 'Zero acquisition spend', explanation: 'The result is a valid zero CAC when at least one new customer is recorded.' },
      { title: 'Inconsistent cost definitions', explanation: 'Leaving payroll or sales costs out of one period but including them in another makes the comparison unreliable even when the arithmetic is correct.' },
    ],
    limitations: 'CAC is an average based on the cost definition and customer cohort entered. It does not calculate customer lifetime value, payback period, retention, contribution margin, channel incrementality, or cohort variation. Finance and marketing teams should agree on which acquisition costs belong in the numerator before using CAC for decisions.',
  },
};

const growthBusinessCalculatorContent = Object.fromEntries(
  businessGrowthSlugs.map((slug) => {
    const source = businessGrowthContent[slug];
    const supplement = growthSupplement[slug];
    const relatedTools: BusinessLink[] = source.relatedSlugs.map((relatedSlug) => ({
      slug: relatedSlug,
      label: businessGrowthContent[relatedSlug].title,
      context: `Use ${businessGrowthContent[relatedSlug].title.replace(' Calculator', '')} alongside ${source.title.replace(' Calculator', '')} when you need the connected marketing metric.`,
    }));
    return [slug, {
      ...source,
      fields: coreFields[slug] ?? [...source.fields],
      updatedNote: supplement.updatedNote,
      whenUseful: [...source.guidance],
      distinction: supplement.distinction,
      examples: supplement.examples,
      interpretation: [...source.guidance],
      assumptions: [...source.assumptions],
      commonMistakes: [...source.commonMistakes],
      edgeCases: supplement.edgeCases,
      limitations: supplement.limitations,
      faqs: [...source.faqs],
      relatedTools,
    } satisfies BusinessCalculatorContent];
  }),
) as Record<BusinessGrowthSlug, BusinessCalculatorContent>;

export const businessCalculatorContent: Record<BusinessCalculatorSlug, BusinessCalculatorContent> = {
  roi,
  'profit-margin': profitMargin,
  markup,
  'break-even': breakEven,
  ...growthBusinessCalculatorContent,
};
syncRegistrySeoCapabilities(businessCalculatorContent);

export const isBusinessCalculatorSlug = (slug: string): slug is BusinessCalculatorSlug =>
  slug in businessCalculatorContent;
