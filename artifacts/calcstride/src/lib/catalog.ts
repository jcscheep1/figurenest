import type { Category, Tool } from '@workspace/api-client-react';
import { constructionTools } from '@/lib/construction';
import {
  phaseThreeACatalog,
  phaseThreeBCatalog,
  phaseThreeCCatalog,
  phaseThreeCExpandedSlugs,
  phaseThreeCNewSlugs,
  phaseTwoCatalog,
  priorityOneCatalog,
  type CatalogEntry,
} from '@/lib/expansion-metadata';
import { phaseFourRoutes } from '@/lib/phase-four-routes';
import { CATALOG_LAST_UPDATED } from '@/lib/catalog-metadata';

const tool = (
  slug: string,
  name: string,
  description: string,
  category: string,
  categorySlug: string,
  tags: string[],
  featured = false,
  href = `/calculators/${categorySlug}/${slug}`,
): Tool => ({
  slug,
  name,
  description,
  category,
  categorySlug,
  tags,
  featured,
  href,
  lastUpdated: CATALOG_LAST_UPDATED,
});

const coreTools: Tool[] = [
  tool('percentage', 'Percentage Calculator', 'Find a percentage of any value in seconds.', 'Money & Finance', 'finance', ['percent', 'percentage', 'math'], true),
  tool('percentage-increase-decrease', 'Percentage Change Calculator', 'Calculate percentage increase or decrease, compare values by percentage difference, or reverse a percentage change.', 'Math', 'math', ['percentage change', 'percent increase', 'percent decrease', 'percentage difference', 'reverse percentage'], true),
  tool('compound-interest', 'Compound Interest Calculator', 'See how contributions and compounding can grow your money over time.', 'Money & Finance', 'finance', ['interest', 'investment', 'savings'], true),
  tool('loan', 'Loan Calculator', 'Estimate monthly payments, total interest, and the full cost of a loan.', 'Money & Finance', 'finance', ['loan', 'payment', 'interest'], true),
  tool('mortgage', 'Mortgage Calculator', 'Estimate mortgage payments with taxes, insurance, and down payment.', 'Money & Finance', 'finance', ['mortgage', 'home', 'payment'], true),
  tool('auto-loan', 'Auto Loan Calculator', 'Estimate a vehicle loan payment, amount financed, total interest, and loan cost.', 'Money & Finance', 'finance', ['auto loan', 'car payment', 'vehicle financing']),
  tool('interest-rate', 'Interest Rate Calculator', 'Estimate the annual rate implied by a fixed principal, payment, and term.', 'Money & Finance', 'finance', ['interest rate', 'loan rate', 'payment']),
  tool('mortgage-amortization', 'Mortgage Amortization Calculator', 'Inspect principal, interest, and remaining balance at a selected mortgage payment.', 'Money & Finance', 'finance', ['mortgage amortization', 'amortization schedule', 'remaining balance']),
  tool('mortgage-payoff', 'Mortgage Payoff Calculator', 'Estimate how recurring extra principal payments may shorten a mortgage.', 'Money & Finance', 'finance', ['mortgage payoff', 'extra payment', 'interest savings']),
  tool('simple-interest', 'Simple Interest Calculator', 'Calculate simple interest and ending amount from principal, annual rate, and time.', 'Money & Finance', 'finance', ['simple interest', 'interest formula', 'principal rate time']),
  tool('savings', 'Savings Calculator', 'Project how regular deposits and interest can build your savings.', 'Money & Finance', 'finance', ['savings', 'interest', 'goals'], true),
  tool('roi', 'ROI Calculator', 'Measure return on investment and compare the gain against your original cost.', 'Business', 'business', ['roi', 'return', 'investment'], true),
  tool('profit-margin', 'Profit Margin Calculator', 'Calculate gross profit, margin, and markup from your cost and selling price.', 'Business', 'business', ['profit', 'margin', 'business'], true),
  tool('markup', 'Markup Calculator', 'Set a selling price from cost and your target markup percentage.', 'Business', 'business', ['markup', 'pricing', 'business']),
  tool('break-even', 'Break-Even Calculator', 'Find the sales volume and revenue needed to cover your costs.', 'Business', 'business', ['break even', 'costs', 'sales']),
  tool('vat', 'VAT Calculator', 'Add or remove VAT from a price with a rate you choose.', 'Money & Finance', 'finance', ['vat', 'tax', 'sales tax']),
  tool('salary', 'Salary Converter', 'Convert annual, monthly, weekly, and hourly pay into comparable figures.', 'Salary & Work', 'salary-work', ['salary', 'hourly', 'pay'], true),
  tool('overtime', 'Overtime Calculator', 'Work out overtime pay from your hourly rate and extra hours.', 'Salary & Work', 'salary-work', ['overtime', 'pay', 'hours']),
  tool('fuel-cost', 'Fuel Cost Calculator', 'Estimate the fuel cost of a trip from distance, efficiency, and fuel price.', 'Automotive & EV', 'automotive', ['fuel', 'gas', 'trip', 'car'], true),
  tool('fuel-economy', 'Fuel Economy Converter', 'Convert between MPG, L/100 km, and km/L.', 'Automotive & EV', 'automotive', ['fuel', 'mpg', 'l/100km']),
  tool('ev-charging-cost', 'EV Charging Cost Calculator', 'Estimate the cost to charge an electric vehicle at home or away.', 'Automotive & EV', 'automotive', ['ev', 'electric car', 'charging'], true),
  tool('ev-charging-time', 'EV Charging Time Calculator', 'Estimate how long an EV charge will take from battery size and power.', 'Automotive & EV', 'automotive', ['ev', 'charging', 'battery']),
  tool('area', 'Area Calculator', 'Find the area of a rectangle from its length and width.', 'Math', 'math', ['area', 'geometry', 'math']),
  tool('volume', 'Volume Calculator', 'Calculate rectangular volume from length, width, and height.', 'Math', 'math', ['volume', 'geometry', 'math']),
  tool('age', 'Age Calculator', 'Calculate your exact age in years, months, and days.', 'Date & Time', 'date-time', ['age', 'birthday', 'date'], true),
  tool('date-difference', 'Date Calculator & Day Counter', 'Count days between dates or add and subtract calendar years, months, weeks, and days.', 'Date & Time', 'date-time', ['date duration', 'days between dates', 'date calculator', 'day counter calculator', 'date add subtract', 'time between dates', 'date difference', 'calendar duration', 'weeks between dates'], true),
  tool('working-days', 'Working Days Calculator', 'Count weekdays between two dates, excluding weekends.', 'Date & Time', 'date-time', ['working days', 'weekdays', 'date']),
  tool('unit', 'Unit Converter', 'Switch among common length, weight, temperature, and speed units in one multi-category hub.', 'Converters', 'converters', ['units', 'convert', 'measurement', 'metric', 'imperial'], true, '/converters/unit'),
  tool('length', 'Length Converter', 'Convert linear dimensions and distances across metric and imperial length units.', 'Converters', 'converters', ['length', 'distance', 'mm', 'cm', 'meters', 'inches', 'feet', 'miles'], true, '/converters/length'),
  tool('weight', 'Weight Converter', 'Compare everyday mass and scale readings in grams, kilograms, ounces, pounds, and stones.', 'Converters', 'converters', ['weight', 'mass', 'grams', 'kg', 'ounces', 'lbs', 'stones'], true, '/converters/weight'),
  tool('temperature', 'Temperature Converter', 'Translate weather, cooking, and scientific readings among Celsius, Fahrenheit, and Kelvin.', 'Converters', 'converters', ['temperature', 'weather', 'celsius', 'fahrenheit', 'kelvin'], false, '/converters/temperature'),
  tool('speed', 'Speed Converter', 'Compare road, marine, sport, wind, and technical speeds in km/h, mph, knots, and m/s.', 'Converters', 'converters', ['speed', 'travel', 'mph', 'km/h', 'knots', 'm/s'], false, '/converters/speed'),
  tool('power', 'Power HP / kW Converter', 'Convert engine power between horsepower and kilowatts.', 'Automotive & EV', 'automotive', ['horsepower', 'hp', 'kw', 'engine'], false, '/converters/power'),
  tool('dpi-ppi', 'DPI / PPI Calculator', 'Calculate print resolution from pixel width and physical print width.', 'Printing & Design', 'printing-design', ['dpi', 'ppi', 'print', 'resolution']),
  tool('pixels-to-cm', 'Pixels to cm / inches', 'Convert digital pixel dimensions into print-ready physical sizes.', 'Printing & Design', 'printing-design', ['pixels', 'cm', 'inches', 'print']),
  tool('image-scaling', 'Image Scaling Calculator', 'Resize an image while preserving its aspect ratio.', 'Printing & Design', 'printing-design', ['image', 'resize', 'aspect ratio']),
  tool('cable-fuse-size', 'Cable & Fuse Size Calculator', 'Estimate cable size, protective-device rating, design current, and voltage drop for common low-voltage circuits.', 'Electrical', 'electrical', ['cable size', 'wire size', 'fuse size', 'breaker size', 'electrical cable', 'voltage drop', '230v', '400v'], true),
];

const constructionDescriptions: Record<string, string> = {
  concrete: 'Estimate ready-mix volume and order size for general rectangular concrete pours.',
  paint: 'Estimate how much paint you need for walls, ceilings, and trim.',
  tile: 'Calculate tile quantities, coverage, and waste for your project.',
  flooring: 'Estimate flooring area and materials with an allowance for waste.',
  'concrete-slab': 'Calculate concrete volume for patios, garage floors, walkways, and foundation slabs.',
  'concrete-bag': 'Find how many bags of premixed concrete a small pour requires.',
  'concrete-footing': 'Estimate concrete for continuous strip footings and repeated rectangular footings.',
  'concrete-cost': 'Estimate ready-mix material cost from pour dimensions, waste, and supplier price.',
  'cubic-yard': 'Convert project dimensions into cubic yards for concrete, soil, gravel, mulch, or fill.',
  'square-footage': 'Find floor, wall, patio, or garden area with a material allowance.',
  gravel: 'Estimate gravel volume, weight, and material cost for driveways and paths.',
  mulch: 'Calculate bulk mulch volume and standard bag quantities for garden beds.',
  'roof-pitch': 'Convert roof rise and run into pitch, angle, and slope multiplier.',
  'roofing-material': 'Estimate roof area, roofing squares, and asphalt-shingle bundles.',
  stair: 'Estimate riser count, actual riser height, tread count, and stair run.',
  'board-foot': 'Calculate lumber volume in board feet and cubic metres.',
  'deck-material': 'Estimate deck boards and coverage from deck dimensions and board spacing.',
  'fence-material': 'Estimate fence posts, pickets, rails, and sections from a fence layout.',
  drywall: 'Estimate drywall sheets for room walls and ceiling with cutting waste.',
  brick: 'Estimate bricks for a wall from brick face size, mortar joint, openings, and waste.',
};

const constructionCatalogTools: Tool[] = constructionTools.map((item) => tool(
  item.slug,
  item.name,
  constructionDescriptions[item.slug] ?? item.description,
  item.category,
  item.categorySlug,
  item.tags,
  ['concrete', 'paint'].includes(item.slug),
  item.href,
));

const expansionTools = (entries: readonly CatalogEntry[]): Tool[] => entries.map((entry) =>
  tool(entry.slug, entry.name, entry.description, entry.category, entry.categorySlug, [...entry.tags], false, entry.href),
);
// The legacy /calculators/finance/interest route duplicates the core Simple Interest
// calculator's formula and intent. Keep it out of the public catalogue so search,
// counts, internal navigation, SEO routes, and the sitemap expose one canonical tool.
const priorityOneExpansionTools = expansionTools(
  priorityOneCatalog.filter((entry) => entry.slug !== 'interest'),
);
const phaseTwoExpansionTools = expansionTools(phaseTwoCatalog);
const phaseThreeAExpansionTools = expansionTools(phaseThreeACatalog);
const phaseThreeBExpansionTools = expansionTools(phaseThreeBCatalog);
const phaseThreeCExpansionTools = expansionTools(
  phaseThreeCCatalog.filter((entry) => (phaseThreeCNewSlugs as readonly string[]).includes(entry.slug)),
);
const phaseFourExpansionTools: Tool[] = phaseFourRoutes.map((entry) =>
  tool(entry.slug, entry.name, entry.description, entry.category, entry.categorySlug, [...entry.tags], false, entry.href),
);

// This exported collection is the source of truth for every public tool page.
// Adding or removing a published tool here automatically updates site counts,
// category totals, search, internal category links, SEO routes, and the sitemap.
const allPublishedTools: Tool[] = [...coreTools, ...priorityOneExpansionTools, ...phaseTwoExpansionTools, ...phaseThreeAExpansionTools, ...phaseThreeBExpansionTools, ...phaseThreeCExpansionTools, ...phaseFourExpansionTools, ...constructionCatalogTools];
export const publishedTools: Tool[] = allPublishedTools.map((item) => {
  const expandedSlug = phaseThreeCExpandedSlugs.find((slug) => slug === item.slug);
  if (!expandedSlug) return item;
  const definition = phaseThreeCCatalog.find((entry) => entry.slug === expandedSlug);
  if (!definition) throw new Error(`Missing Phase Three C catalogue metadata for ${expandedSlug}`);
  return {
    ...item,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    categorySlug: definition.categorySlug,
    tags: [...definition.tags],
    href: definition.href,
  };
});

export const canonicalToolHref = (item: Pick<Tool, 'href'>) => item.href;

// The broad Unit Converter remains an indexable converter hub. The directory
// counts its eight focused converter destinations instead of treating the hub
// as a ninth standalone tool.
export const localTools = publishedTools.filter((item) => item.slug !== 'unit');
export const publishedToolCount = new Set(localTools.map(canonicalToolHref)).size;

const categoryDefinitions = [
  { slug: 'finance', name: 'Money & Finance', description: 'Make clearer decisions with money, interest, loans, and pricing tools.', accent: '#ef8f62' },
  { slug: 'salary-work', name: 'Salary & Work', description: 'Understand pay, hours, and the numbers behind your working life.', accent: '#4a93a8' },
  { slug: 'business', name: 'Business', description: 'Practical calculators for pricing, profitability, and planning.', accent: '#d99a45' },
  { slug: 'construction', name: 'Home & Construction', description: 'Plan materials and measurements before you start the work.', accent: '#c57745' },
  { slug: 'electrical', name: 'Electrical', description: 'Estimate circuit values and electrical performance with clear formulas, units, and safety limits.', accent: '#d8a34a' },
  { slug: 'technology', name: 'Technology', description: 'Work with networks, data encoding, transfer rates, and secure local utilities.', accent: '#4c84c6' },
  { slug: 'science-engineering', name: 'Science & Engineering', description: 'Calculate physical quantities, weather measures, chemistry concentrations, motion, and mechanical power.', accent: '#637ea8' },
  { slug: 'automotive', name: 'Automotive & EV', description: 'Compare fuel, charging, power, and the real cost of getting around.', accent: '#8d78bd' },
  { slug: 'math', name: 'Math', description: 'Straightforward answers for everyday geometry and percentages.', accent: '#45a995' },
  { slug: 'converters', name: 'Converters', description: 'Switch between the units you use every day.', accent: '#4a93a8' },
  { slug: 'date-time', name: 'Date & Time', description: 'Count, compare, and plan with confidence.', accent: '#d47a8a' },
  { slug: 'printing-design', name: 'Printing & Design', description: 'Get the right size, resolution, and output for your work.', accent: '#788bd0' },
  { slug: 'health', name: 'Health', description: 'Use transparent health, fitness, pregnancy, and wellbeing estimates with clear safety limits.', accent: '#5b9d83' },
  { slug: 'education', name: 'Education', description: 'Check grades and weighted academic averages with clear, reproducible arithmetic.', accent: '#7b83c5' },
];

export const localCategories: Category[] = categoryDefinitions.map((category) => ({
  ...category,
  toolCount: new Set(
    localTools
      .filter((item) => item.categorySlug === category.slug)
      .map(canonicalToolHref),
  ).size,
})).filter((category) => category.toolCount > 0);

export const findLocalTool = (slug?: string) => localTools.find((item) => item.slug === slug);