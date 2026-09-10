import { formatCurrency, type CurrencyCode } from './units-preferences';
import type { CalculationResult, CoreField } from './core-calculators';

export const businessGrowthSlugs = [
  'roas',
  'conversion-rate',
  'cpc',
  'cpm',
  'customer-acquisition-cost',
] as const;

export type BusinessGrowthSlug = typeof businessGrowthSlugs[number];

export type BusinessGrowthContent = {
  slug: BusinessGrowthSlug;
  title: string;
  titleLines: readonly [string, string];
  description: string;
  seoTitle: string;
  seoDescription: string;
  fields: readonly CoreField[];
  resultLabel: string;
  resultSummary: string;
  formula: string;
  formulaExplanation: string;
  decisionTitle: string;
  guidance: readonly string[];
  assumptions: readonly string[];
  commonMistakes: readonly string[];
  faqs: readonly { question: string; answer: string }[];
  relatedSlugs: readonly BusinessGrowthSlug[];
};

const money = (value: number, currency: CurrencyCode) => formatCurrency(value, currency);
const decimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const ratio = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MAX_AMOUNT = 1_000_000_000_000;
const MAX_COUNT = 1_000_000_000_000;

const invalid = (message: string): CalculationResult => ({ primary: message, error: message });
const parse = (inputs: string[]) => inputs.map((value) => value.trim() === '' ? Number.NaN : Number(value));

export const businessGrowthContent: Record<BusinessGrowthSlug, BusinessGrowthContent> = {
  roas: {
    slug: 'roas',
    title: 'ROAS Calculator',
    titleLines: ['Return on Ad Spend', 'Calculator'],
    description: 'Measure attributed revenue against advertising spend and see both the ROAS multiple and percentage return on ad spend.',
    seoTitle: 'ROAS Calculator — Return on Ad Spend | FigureNest',
    seoDescription: 'Calculate ROAS from advertising spend and attributed revenue. See the revenue multiple, percentage ROAS, formula, interpretation, and limits.',
    fields: [
      { key: 'spend', label: 'Advertising spend', value: '2500', prefix: '$' },
      { key: 'revenue', label: 'Attributed revenue', value: '10000', prefix: '$' },
    ],
    resultLabel: 'RETURN ON AD SPEND',
    resultSummary: 'ROAS shows attributed revenue for each unit of advertising spend; it is not the same as profit because product costs, payroll, fees, and overhead are not deducted.',
    formula: 'ROAS = Attributed revenue ÷ Advertising spend',
    formulaExplanation: 'Divide revenue attributed to the advertising by the advertising cost. A 4.00× ROAS means the campaign generated four units of attributed revenue for every one unit spent on ads.',
    decisionTitle: 'Use ROAS to compare advertising efficiency on a revenue basis',
    guidance: [
      'Use the same attribution window and revenue definition when comparing campaigns. A platform-reported ROAS and a finance-system ROAS may differ because attribution models and refund handling can differ.',
      'A higher ROAS is not automatically more profitable. Gross margin, fulfillment costs, discounts, repeat purchases, and customer acquisition economics determine whether the campaign actually creates profit.',
    ],
    assumptions: [
      'Advertising spend and attributed revenue use the same currency.',
      'Revenue attribution is sufficiently reliable for the decision being made.',
      'Returns, cancellations, and discounts are already reflected if they matter to the analysis.',
      'The result is a revenue-efficiency measure, not a net-profit calculation.',
    ],
    commonMistakes: [
      'Calling ROAS ROI even though ROAS divides revenue by ad spend rather than profit by total investment.',
      'Comparing campaigns that use different attribution windows or attribution models.',
      'Ignoring refunds, discounts, or taxes that make reported revenue inconsistent.',
      'Using ROAS alone when product margin differs significantly between campaigns.',
    ],
    faqs: [
      { question: 'What does a 4x ROAS mean?', answer: 'It means attributed revenue equals four times the advertising spend. For example, $2,500 spend and $10,000 attributed revenue produce a 4.00× ROAS.' },
      { question: 'Is ROAS the same as ROI?', answer: 'No. ROAS compares attributed revenue with ad spend. ROI compares net gain or loss with an investment cost.' },
      { question: 'Can ROAS be below 1?', answer: 'Yes. A ROAS below 1.00× means attributed revenue is lower than the advertising spend before considering any other costs.' },
      { question: 'What is a good ROAS?', answer: 'There is no universal target. The required ROAS depends on gross margin, operating costs, repeat purchases, and business objectives.' },
      { question: 'Why is zero ad spend invalid?', answer: 'ROAS divides by advertising spend, so a zero denominator cannot produce a meaningful ratio.' },
    ],
    relatedSlugs: ['conversion-rate', 'cpc', 'cpm'],
  },
  'conversion-rate': {
    slug: 'conversion-rate',
    title: 'Conversion Rate Calculator',
    titleLines: ['Conversion Rate', 'Calculator'],
    description: 'Calculate the percentage of visitors, sessions, leads, or clicks that complete a defined conversion action.',
    seoTitle: 'Conversion Rate Calculator | FigureNest',
    seoDescription: 'Calculate conversion rate from total visitors or opportunities and completed conversions. See the formula, examples, and interpretation guidance.',
    fields: [
      { key: 'opportunities', label: 'Visitors or opportunities', value: '5000' },
      { key: 'conversions', label: 'Completed conversions', value: '175' },
    ],
    resultLabel: 'CONVERSION RATE',
    resultSummary: 'Conversion rate measures the share of counted opportunities that complete the selected action, so the denominator definition must stay consistent.',
    formula: 'Conversion rate (%) = Conversions ÷ Opportunities × 100',
    formulaExplanation: 'Divide completed conversions by the total eligible visitors, sessions, leads, clicks, or other opportunities, then multiply by 100 to express the result as a percentage.',
    decisionTitle: 'Use conversion rate to measure how efficiently opportunities become outcomes',
    guidance: [
      'Choose one denominator and keep it consistent. User conversion rate, session conversion rate, lead-to-sale rate, and click-to-purchase rate answer different questions.',
      'A rate can improve because conversion performance improved or because traffic mix changed. Segment by source, device, geography, or audience when aggregate results hide meaningful differences.',
    ],
    assumptions: [
      'Conversions are counted within the same measurement period as opportunities.',
      'The denominator contains only eligible opportunities for the defined action.',
      'Duplicate conversions are handled consistently.',
      'Conversions cannot exceed opportunities for a one-conversion-per-opportunity interpretation.',
    ],
    commonMistakes: [
      'Mixing users in one period with conversions from another period.',
      'Changing from sessions to users without noting that the denominator changed.',
      'Comparing rates from different funnel stages as though they measure the same behavior.',
      'Ignoring sample size when interpreting small changes in conversion rate.',
    ],
    faqs: [
      { question: 'How do I calculate conversion rate?', answer: 'Divide completed conversions by total opportunities and multiply by 100.' },
      { question: 'Can conversion rate exceed 100%?', answer: 'It can in event-based systems where one opportunity can generate multiple conversions, but for a one-conversion-per-opportunity definition it should not exceed 100%.' },
      { question: 'Should I use users or sessions?', answer: 'Use the denominator that matches your business question and keep that definition consistent when comparing periods or campaigns.' },
      { question: 'Why does sample size matter?', answer: 'Small samples can create large percentage swings from only a few additional conversions, so context and statistical uncertainty matter.' },
      { question: 'Is conversion rate the same as click-through rate?', answer: 'No. Conversion rate measures completed outcomes relative to an opportunity set. Click-through rate measures clicks relative to impressions or views.' },
    ],
    relatedSlugs: ['roas', 'cpc', 'customer-acquisition-cost'],
  },
  cpc: {
    slug: 'cpc',
    title: 'CPC Calculator',
    titleLines: ['Cost Per Click', 'Calculator'],
    description: 'Calculate average advertising cost per click from campaign spend and the number of recorded clicks.',
    seoTitle: 'CPC Calculator — Cost Per Click | FigureNest',
    seoDescription: 'Calculate average cost per click from advertising spend and clicks. Compare campaign traffic costs with a clear CPC formula and practical guidance.',
    fields: [
      { key: 'spend', label: 'Advertising spend', value: '1250', prefix: '$' },
      { key: 'clicks', label: 'Clicks', value: '2500' },
    ],
    resultLabel: 'AVERAGE COST PER CLICK',
    resultSummary: 'Average CPC divides total advertising spend by recorded clicks and does not by itself show traffic quality, conversions, or profitability.',
    formula: 'CPC = Advertising spend ÷ Clicks',
    formulaExplanation: 'Divide total spend by the number of recorded clicks. This produces the average amount paid per click across the included campaign, ad group, keyword, or reporting period.',
    decisionTitle: 'Use CPC to compare the price paid for traffic',
    guidance: [
      'Compare CPC together with conversion rate and customer value. A more expensive click can be economically better when it converts at a higher rate or brings more valuable customers.',
      'Make sure spend and clicks cover the same campaign scope and date range. Platform reporting delays, invalid-click adjustments, and currency conversions can otherwise distort the comparison.',
    ],
    assumptions: [
      'Spend and clicks refer to the same campaign scope and reporting period.',
      'Spend uses the selected currency and includes the advertising cost you want averaged.',
      'Clicks are non-negative and the denominator is greater than zero.',
      'The calculation is an arithmetic average and does not model bid distributions.',
    ],
    commonMistakes: [
      'Comparing CPC from different channels without considering conversion quality.',
      'Using impressions instead of clicks in the denominator.',
      'Mixing gross billed spend with net adjusted click counts from another report.',
      'Treating a low CPC as proof of profitable acquisition.',
    ],
    faqs: [
      { question: 'How is CPC calculated?', answer: 'Divide total advertising spend by total clicks.' },
      { question: 'What happens if clicks are zero?', answer: 'Average CPC is undefined because the calculation would divide by zero.' },
      { question: 'Is lower CPC always better?', answer: 'No. Traffic quality and conversion economics matter more than click price alone.' },
      { question: 'Is CPC the same as CPM?', answer: 'No. CPC measures cost per click. CPM measures cost per one thousand impressions.' },
      { question: 'Can I calculate CPC for any currency?', answer: 'Yes. Use one consistent currency for the entered spend; the arithmetic is the same.' },
    ],
    relatedSlugs: ['cpm', 'conversion-rate', 'roas'],
  },
  cpm: {
    slug: 'cpm',
    title: 'CPM Calculator',
    titleLines: ['Cost Per Thousand', 'Impressions Calculator'],
    description: 'Calculate advertising cost per one thousand impressions from total campaign spend and delivered impressions.',
    seoTitle: 'CPM Calculator — Cost Per 1,000 Impressions | FigureNest',
    seoDescription: 'Calculate CPM from advertising spend and impressions. See cost per thousand impressions, the formula, and practical media-planning guidance.',
    fields: [
      { key: 'spend', label: 'Advertising spend', value: '3000', prefix: '$' },
      { key: 'impressions', label: 'Impressions', value: '600000' },
    ],
    resultLabel: 'COST PER 1,000 IMPRESSIONS',
    resultSummary: 'CPM measures media cost for exposure volume. It does not measure whether those impressions were viewable, clicked, converted, or profitable.',
    formula: 'CPM = Advertising spend ÷ Impressions × 1,000',
    formulaExplanation: 'Divide spend by delivered impressions and multiply by one thousand. The result standardizes campaigns with different impression volumes to a common cost-per-thousand basis.',
    decisionTitle: 'Use CPM to compare the price of media exposure',
    guidance: [
      'CPM is most useful when impression delivery matters, such as awareness or reach campaigns. For traffic or acquisition goals, combine CPM with click-through rate, CPC, conversion rate, and downstream value.',
      'Not all impressions are equal. Placement quality, viewability, audience fit, frequency, geography, and fraud controls can make two campaigns with the same CPM perform very differently.',
    ],
    assumptions: [
      'Spend and impressions cover the same campaign scope and reporting period.',
      'Impressions are delivered counts from a consistent reporting source.',
      'Spend uses one consistent currency.',
      'The result does not adjust for viewability or unique reach.',
    ],
    commonMistakes: [
      'Dividing spend by impressions without multiplying by 1,000.',
      'Comparing CPMs from different inventory types without considering quality.',
      'Treating impressions as unique people reached.',
      'Using CPM alone to judge an acquisition campaign.',
    ],
    faqs: [
      { question: 'How is CPM calculated?', answer: 'Divide advertising spend by impressions and multiply by 1,000.' },
      { question: 'Why is CPM based on one thousand impressions?', answer: 'Using one thousand impressions creates a convenient standard unit for comparing media costs across campaigns and publishers.' },
      { question: 'Is CPM the same as CPC?', answer: 'No. CPM measures cost per thousand impressions, while CPC measures cost per click.' },
      { question: 'Does CPM measure reach?', answer: 'Not directly. Impressions can include repeated exposure to the same person, so unique reach is a separate metric.' },
      { question: 'Can zero impressions produce a CPM?', answer: 'No. The calculation requires a positive impression count because impressions are the denominator.' },
    ],
    relatedSlugs: ['cpc', 'roas', 'conversion-rate'],
  },
  'customer-acquisition-cost': {
    slug: 'customer-acquisition-cost',
    title: 'Customer Acquisition Cost Calculator',
    titleLines: ['Customer Acquisition Cost', 'Calculator'],
    description: 'Calculate average customer acquisition cost from total acquisition spend and the number of new customers acquired.',
    seoTitle: 'Customer Acquisition Cost Calculator — CAC | FigureNest',
    seoDescription: 'Calculate CAC from sales and marketing acquisition spend and new customers. See the customer acquisition cost formula and interpretation guidance.',
    fields: [
      { key: 'spend', label: 'Acquisition spend', value: '20000', prefix: '$' },
      { key: 'customers', label: 'New customers acquired', value: '125' },
    ],
    resultLabel: 'CUSTOMER ACQUISITION COST',
    resultSummary: 'CAC averages the entered acquisition spend across new customers acquired and should be compared with contribution margin, retention, and customer lifetime value.',
    formula: 'CAC = Acquisition spend ÷ New customers acquired',
    formulaExplanation: 'Divide the sales and marketing acquisition costs included in the analysis by the number of new customers acquired during the corresponding measurement period.',
    decisionTitle: 'Use CAC to connect acquisition spending with customer growth',
    guidance: [
      'Define acquisition spend consistently. Depending on the purpose, CAC may include media, agency fees, sales commissions, acquisition-team payroll, software, creative production, and other direct acquisition costs.',
      'Compare CAC with contribution margin and customer lifetime value rather than revenue alone. A customer can generate high revenue but still be unattractive if gross margin or retention is low.',
    ],
    assumptions: [
      'Acquisition spend and new-customer counts cover corresponding periods and channels.',
      'Only new customers are included in the customer denominator.',
      'The chosen cost definition is applied consistently across comparisons.',
      'The calculator reports an average and does not model cohort differences.',
    ],
    commonMistakes: [
      'Using total customers instead of newly acquired customers.',
      'Excluding major sales or marketing costs from one period but including them in another.',
      'Comparing blended CAC with channel-specific CAC without noting the scope difference.',
      'Judging CAC against revenue without considering margin and retention.',
    ],
    faqs: [
      { question: 'How do I calculate CAC?', answer: 'Divide the acquisition costs included in your analysis by the number of new customers acquired in the corresponding period.' },
      { question: 'Should payroll be included in CAC?', answer: 'It can be when payroll is part of the sales and marketing acquisition cost definition. The important point is to use a consistent definition.' },
      { question: 'Is CAC the same as cost per lead?', answer: 'No. Cost per lead divides acquisition spend by leads, while CAC divides acquisition spend by customers actually acquired.' },
      { question: 'What should CAC be compared with?', answer: 'Common comparisons include gross contribution, payback period, retention, and customer lifetime value.' },
      { question: 'Why are zero new customers invalid?', answer: 'CAC divides acquisition spend by new customers, so zero customers would make the average undefined.' },
    ],
    relatedSlugs: ['roas', 'conversion-rate', 'cpc'],
  },
};

export function isBusinessGrowthSlug(slug: string): slug is BusinessGrowthSlug {
  return slug in businessGrowthContent;
}

export function calculateBusinessGrowth(
  slug: BusinessGrowthSlug,
  inputs: string[],
  currency: CurrencyCode = 'USD',
): CalculationResult {
  if (inputs.some((value) => !value.trim())) return invalid('Complete every field with a valid non-negative value');
  const values = parse(inputs);
  if (!values.every(Number.isFinite) || values.some((value) => value < 0)) return invalid('Enter valid non-negative values');
  if (values.some((value) => value > MAX_AMOUNT)) return invalid('Enter values no greater than 1 trillion');
  const [a, b] = values;

  if (slug === 'roas') {
    if (a <= 0) return invalid('Advertising spend must be greater than zero');
    const roas = b / a;
    if (!Number.isFinite(roas)) return invalid('These inputs produce a ROAS outside the supported range');
    return {
      primary: `${ratio.format(roas)}×`,
      details: [
        { label: 'ROAS percentage', value: `${decimal.format(roas * 100)}%` },
        { label: 'Attributed revenue', value: money(b, currency) },
        { label: 'Advertising spend', value: money(a, currency) },
      ],
    };
  }

  if (slug === 'conversion-rate') {
    if (a <= 0) return invalid('Visitors or opportunities must be greater than zero');
    if (b > MAX_COUNT) return invalid('Enter conversions no greater than 1 trillion');
    const rate = b / a * 100;
    if (!Number.isFinite(rate)) return invalid('These inputs produce a conversion rate outside the supported range');
    return {
      primary: `${decimal.format(rate)}%`,
      details: [
        { label: 'Conversions', value: decimal.format(b) },
        { label: 'Opportunities', value: decimal.format(a) },
        { label: 'Non-converting opportunities', value: decimal.format(Math.max(0, a - b)) },
      ],
    };
  }

  if (slug === 'cpc') {
    if (b <= 0) return invalid('Clicks must be greater than zero');
    const cpc = a / b;
    if (!Number.isFinite(cpc)) return invalid('These inputs produce a CPC outside the supported range');
    return {
      primary: money(cpc, currency),
      details: [
        { label: 'Advertising spend', value: money(a, currency) },
        { label: 'Clicks', value: decimal.format(b) },
      ],
    };
  }

  if (slug === 'cpm') {
    if (b <= 0) return invalid('Impressions must be greater than zero');
    const cpm = a / b * 1000;
    if (!Number.isFinite(cpm)) return invalid('These inputs produce a CPM outside the supported range');
    return {
      primary: money(cpm, currency),
      details: [
        { label: 'Advertising spend', value: money(a, currency) },
        { label: 'Impressions', value: decimal.format(b) },
      ],
    };
  }

  if (b <= 0) return invalid('New customers acquired must be greater than zero');
  const cac = a / b;
  if (!Number.isFinite(cac)) return invalid('These inputs produce a customer acquisition cost outside the supported range');
  return {
    primary: money(cac, currency),
    details: [
      { label: 'Acquisition spend', value: money(a, currency) },
      { label: 'New customers', value: decimal.format(b) },
    ],
  };
}
