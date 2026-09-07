import type { UnitSystem } from './construction';
import { syncRegistrySeoCapabilities } from './seo-capabilities';

export const concreteCalculatorSlugs = ['concrete', 'concrete-slab', 'concrete-bag', 'concrete-footing', 'concrete-cost'] as const;
export type ConcreteCalculatorSlug = typeof concreteCalculatorSlugs[number];

export type ConcreteExample = {
  title: string;
  inputs: string;
  inputValues: Record<string, number>;
  unit: UnitSystem;
  expectedRaw: number;
  working: string;
  result: string;
  interpretation: string;
};

export type ConcreteCalculatorContent = {
  slug: ConcreteCalculatorSlug;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  resultLabel: string;
  resultSummary: string;
  purposeTitle: string;
  purpose: string[];
  distinction: string;
  formula: string;
  formulaExplanation: string;
  examples: ConcreteExample[];
  interpretation: string[];
  assumptions: string[];
  commonMistakes: string[];
  edgeCases: { title: string; explanation: string }[];
  limitations: string;
  faqs: { question: string; answer: string }[];
  relatedTools: { slug: string; label: string; context: string }[];
};

const concrete: ConcreteCalculatorContent = {
  slug: 'concrete',
  title: 'Concrete Calculator',
  description: 'Estimate the ready-mix order volume for a rectangular pour, with an allowance for spills, uneven grade, and measurement variation.',
  seoTitle: 'Concrete Calculator — Ready-Mix Volume | FigureNest',
  seoDescription: 'Estimate ready-mix concrete in cubic yards or cubic metres from pour dimensions and waste, with formulas, examples, and ordering guidance.',
  resultLabel: 'READY-MIX ORDER VOLUME',
  resultSummary: 'This is the rectangular ready-mix volume after the entered waste allowance; confirm the supplier’s order increment and minimum load.',
  purposeTitle: 'Estimate a broad ready-mix quantity before requesting a quote',
  purpose: [
    'Use this general estimator for rectangular pads, paths, walls, trenches, or other pours when the immediate question is how much ready-mix volume to order.',
    'Measure each differently sized section separately, then add the adjusted quantities. Keeping sections separate makes depth changes and irregular areas easier to review.',
  ],
  distinction: 'This broad calculator answers a volume question without assuming a slab use. Concrete Slab frames the same rectangular volume math around floor area and thickness; Concrete Bag converts volume to retail premix bags; Concrete Cost applies a supplier unit price.',
  formula: 'Order volume = length × width × depth × (1 + waste percentage ÷ 100)',
  formulaExplanation: 'Depth is converted from inches to feet for imperial calculations or centimetres to metres for metric calculations. The rectangular volume is converted to cubic yards or retained as cubic metres, then the waste percentage is applied.',
  examples: [
    { title: 'Small equipment pad', inputs: 'Length 12 ft; width 10 ft; depth 4 in; waste 10%', inputValues: { length: 12, width: 10, depth: 4, waste: 10 }, unit: 'imperial', expectedRaw: 1.245941, working: '12 × 10 × (4 ÷ 12) ÷ 27 × 1.10', result: '1.63 yd³ to order (1.48 yd³ before waste)', interpretation: 'The extra 0.15 yd³ provides a modest field allowance, but the supplier may require rounding to its delivery increment.' },
    { title: 'Metric garden path section', inputs: 'Length 5 m; width 3 m; depth 12 cm; waste 5%', inputValues: { length: 5, width: 3, depth: 12, waste: 5 }, unit: 'metric', expectedRaw: 1.89, working: '5 × 3 × 0.12 × 1.05', result: '1.89 m³ to order', interpretation: 'This covers one constant-depth rectangle; curves or changing depths should be split into measured sections.' },
  ],
  interpretation: [
    'The headline quantity is volume, not truck count or weight. Ask the ready-mix supplier how it rounds orders and whether a short-load minimum applies.',
    'Waste is a planning allowance, not a substitute for measurement. Compare base and adjusted volume and investigate large allowances before ordering.',
  ],
  assumptions: ['The measured shape is rectangular.', 'Length and width use feet or metres while depth uses inches or centimetres as labeled.', 'Waste is applied once to the base volume.', 'Concrete density does not affect a volume-based ready-mix order.'],
  commonMistakes: ['Entering depth in feet when the field expects inches.', 'Measuring the excavation instead of the finished concrete shape.', 'Combining sections with different depths into one average without checking it.', 'Rounding each dimension before multiplying.'],
  edgeCases: [
    { title: 'No waste allowance', explanation: 'A 0% allowance returns the exact modeled rectangular volume.' },
    { title: 'Irregular footprint', explanation: 'Divide it into rectangles and calculate each section; this tool does not infer curves or triangles.' },
    { title: 'Sloping or uneven base', explanation: 'The entered depth is treated as constant, so use surveyed sections or a defensible average depth.' },
  ],
  limitations: 'This estimate excludes form deflection, over-excavation, embedded objects, pump-line waste, supplier minimums, truck access, mix specification, reinforcement, labor, and structural design.',
  faqs: [
    { question: 'How do I calculate concrete volume?', answer: 'Multiply finished length by width by depth using consistent units, convert to cubic yards or cubic metres, and then add the selected waste allowance.' },
    { question: 'How many cubic feet are in a cubic yard?', answer: 'One cubic yard contains 27 cubic feet.' },
    { question: 'Should concrete depth be entered in inches?', answer: 'In imperial mode, yes. In metric mode, enter depth in centimetres; the calculator converts it before multiplying.' },
    { question: 'How much extra ready-mix should I order?', answer: 'Simple measured pours often use 5–10%, but forms, grade, access, and supplier increments can change the appropriate allowance.' },
    { question: 'Does the result include reinforcement?', answer: 'No. Rebar, mesh, fibers, forms, and base material are separate planning items.' },
  ],
  relatedTools: [
    { slug: 'concrete-slab', label: 'Plan concrete for a slab footprint and thickness', context: 'Use the slab-focused guide for patios, floors, and foundation slabs.' },
    { slug: 'concrete-bag', label: 'Convert a small pour into whole premix bags', context: 'Use the actual retail bag yield to create a purchase count.' },
    { slug: 'concrete-cost', label: 'Apply a ready-mix price to the order volume', context: 'Build a material-only budget from a supplier price per cubic unit.' },
  ],
};

const slab: ConcreteCalculatorContent = {
  slug: 'concrete-slab',
  title: 'Concrete Slab Calculator',
  description: 'Plan concrete volume for a rectangular patio, floor, walkway, or foundation slab from its footprint, specified thickness, and waste.',
  seoTitle: 'Concrete Slab Calculator — Volume & Thickness',
  seoDescription: 'Calculate concrete slab volume from length, width, thickness, and waste for patios, floors, and foundations in imperial or metric units.',
  resultLabel: 'SLAB ORDER VOLUME',
  resultSummary: 'The result converts the slab footprint and entered thickness into an adjusted concrete order volume.',
  purposeTitle: 'Turn a slab plan into a ready-mix quantity',
  purpose: ['Use this page when the project starts with a patio, floor, walkway, or foundation slab footprint and a specified uniform thickness.', 'Check the planned thickness before estimating. Loads, soil, frost, reinforcement, joints, and local code determine slab design—not this volume calculation.'],
  distinction: 'Concrete Slab intentionally uses the same rectangular volume formula as the broad Concrete Calculator, but its workflow emphasizes area and slab thickness. It does not size a slab structurally, count bags, or estimate the full installed cost.',
  formula: 'Slab order volume = length × width × thickness × (1 + waste percentage ÷ 100)',
  formulaExplanation: 'The footprint area is length multiplied by width. Multiplying that area by slab thickness produces base volume; unit conversion and the waste allowance produce the order volume.',
  examples: [
    { title: 'Garage floor slab', inputs: 'Length 20 ft; width 12 ft; thickness 4 in; waste 10%', inputValues: { length: 20, width: 12, depth: 4, waste: 10 }, unit: 'imperial', expectedRaw: 2.491882, working: '20 × 12 × (4 ÷ 12) ÷ 27 × 1.10', result: '3.26 yd³ to order (2.96 yd³ base)', interpretation: 'The estimate models one uniform 4-inch slab and does not include thickened edges or footings.' },
    { title: 'Metric patio slab', inputs: 'Length 6 m; width 4 m; thickness 10 cm; waste 8%', inputValues: { length: 6, width: 4, depth: 10, waste: 8 }, unit: 'metric', expectedRaw: 2.592, working: '6 × 4 × 0.10 × 1.08', result: '2.59 m³ to order', interpretation: 'Any steps, beams, edge thickenings, or openings should be calculated separately.' },
  ],
  interpretation: ['Small thickness changes affect the entire footprint, so verify thickness rather than using an informal guess.', 'Round only after combining slab sections, then follow the ready-mix supplier’s order increment.'],
  assumptions: ['The slab has a rectangular footprint.', 'Thickness is uniform across the modeled area.', 'Dimensions describe finished concrete.', 'The allowance covers volume variation only.'],
  commonMistakes: ['Using excavation depth as slab thickness.', 'Omitting thickened edges or grade beams.', 'Entering inches in a feet field.', 'Assuming the calculator recommends a safe slab thickness.'],
  edgeCases: [
    { title: 'L-shaped slab', explanation: 'Split the plan into non-overlapping rectangles and add their volumes.' },
    { title: 'Opening in the slab', explanation: 'Calculate the opening separately and subtract its base volume before deciding on waste.' },
    { title: 'Thickened perimeter', explanation: 'Model the extra perimeter volume separately so the main slab is not double-counted.' },
  ],
  limitations: 'This is a volume takeoff, not structural advice. It excludes reinforcement, joints, sub-base, vapor barrier, finishing, pumping, labor, drainage, bearing capacity, and code requirements.',
  faqs: [
    { question: 'What slab thickness should I use?', answer: 'Use the thickness on an approved project plan or confirmed for the site and loads. The calculator does not design thickness.' },
    { question: 'Why does slab thickness matter so much?', answer: 'Thickness multiplies the full footprint, so a 25% thickness increase creates a 25% base-volume increase.' },
    { question: 'Can I calculate an L-shaped patio?', answer: 'Yes. Divide it into non-overlapping rectangles, calculate each slab section, and add the quantities.' },
    { question: 'Does this include a thickened slab edge?', answer: 'Not automatically. Calculate additional edge or beam volume separately.' },
    { question: 'Is slab volume different from general concrete volume?', answer: 'The rectangular math is identical; this page provides slab-specific planning context around footprint and thickness.' },
  ],
  relatedTools: [
    { slug: 'square-footage', label: 'Check the patio or floor footprint area', context: 'Verify area before applying the slab thickness.' },
    { slug: 'concrete-cost', label: 'Budget ready-mix for the planned slab', context: 'Apply a local per-yard or per-metre quote to adjusted volume.' },
    { slug: 'concrete-footing', label: 'Estimate separate rectangular footing runs', context: 'Keep structural footing volume separate from the slab field.' },
  ],
};

const bag: ConcreteCalculatorContent = {
  slug: 'concrete-bag',
  title: 'Concrete Bag Calculator',
  description: 'Convert a small rectangular pour into a whole-bag purchase quantity using the premixed concrete yield printed on the product label.',
  seoTitle: 'Concrete Bag Calculator — Premix Bags | FigureNest',
  seoDescription: 'Calculate whole premix concrete bags from pour dimensions, label yield, and waste. Compare imperial or metric inputs with realistic examples.',
  resultLabel: 'WHOLE PREMIX BAGS TO BUY',
  resultSummary: 'The required mix volume is divided by label yield and always rounded up to a whole retail bag.',
  purposeTitle: 'Plan a retail premix purchase from actual bag yield',
  purpose: ['Use this calculator for repairs, posts, steps, and other pours where packaged dry premix is more practical than delivered ready-mix.', 'Find cured or mixed yield on the exact product label or technical sheet. Bag weight alone does not establish volume because products and formulations differ.'],
  distinction: 'Unlike ready-mix volume tools, this calculator divides adjusted pour volume by a retail product’s stated yield and rounds up. It does not convert bag weight into yield or compare labor against truck delivery.',
  formula: 'Whole bags = ceiling(adjusted pour volume ÷ stated yield per bag)',
  formulaExplanation: 'First calculate rectangular volume and add waste. Convert the entered bag yield from cubic feet or litres to the same volume basis, divide, then use the ceiling so a fractional requirement becomes the next whole bag.',
  examples: [
    { title: 'Small repair with half-cubic-foot bags', inputs: 'Length 4 ft; width 4 ft; depth 4 in; yield 0.5 ft³; waste 10%', inputValues: { length: 4, width: 4, depth: 4, bagYield: 0.5, waste: 10 }, unit: 'imperial', expectedRaw: 12, working: '5.87 ft³ adjusted ÷ 0.5 ft³ = 11.73; round up', result: '12 bags', interpretation: 'Buying 11 bags would leave the modeled pour short even though the unrounded value is below 12.' },
    { title: 'Metric step base with 20-litre yield', inputs: 'Length 2 m; width 1.5 m; depth 10 cm; yield 20 L; waste 5%', inputValues: { length: 2, width: 1.5, depth: 10, bagYield: 20, waste: 5 }, unit: 'metric', expectedRaw: 16, working: '315 L adjusted ÷ 20 L = 15.75; round up', result: '16 bags', interpretation: 'The count depends on the 20-litre label yield, not merely the package weight.' },
  ],
  interpretation: ['Treat the result as a purchase count for one specific product yield. Recalculate when changing product or bag size.', 'A large bag count may make ready-mix delivery more practical; compare access, minimum-load charges, mixing capacity, and placement time.'],
  assumptions: ['Every bag has the stated volumetric yield.', 'All bags are the same product and size.', 'The pour is rectangular and constant-depth.', 'Unused partial dry mix is not credited against another project.'],
  commonMistakes: ['Entering bag weight instead of yield.', 'Rounding the bag count down.', 'Mixing litres and cubic feet.', 'Ignoring placement time for many hand-mixed batches.'],
  edgeCases: [
    { title: 'Exact whole-bag quotient', explanation: 'No extra mathematical rounding occurs, though the selected waste is already included.' },
    { title: 'Very small pour', explanation: 'Any positive fraction of one bag still requires one whole bag.' },
    { title: 'Missing yield', explanation: 'A bag count cannot be calculated from package weight alone; obtain the manufacturer’s yield.' },
  ],
  limitations: 'The estimate does not account for partial-bag storage, batching loss beyond entered waste, water demand, mixing capacity, cure conditions, product suitability, strength specification, or the economics of ready-mix delivery.',
  faqs: [
    { question: 'Where do I find concrete bag yield?', answer: 'Look for yield in cubic feet or litres on the bag label or manufacturer technical data sheet.' },
    { question: 'Why are concrete bags rounded up?', answer: 'Retail bags are purchased whole, and rounding down would provide less than the modeled required volume.' },
    { question: 'Can I enter the bag weight?', answer: 'No. Enter volumetric yield; equal-weight products can have different yields.' },
    { question: 'Does waste get added before bag rounding?', answer: 'Yes. Waste increases required mix volume first, and the resulting quotient is then rounded up.' },
    { question: 'When should I consider ready-mix instead?', answer: 'For a large count, compare delivery minimums, access, placement time, crew capacity, and total product cost with a supplier.' },
  ],
  relatedTools: [
    { slug: 'concrete', label: 'Compare the pour as a ready-mix volume', context: 'See cubic yards or metres before deciding between bags and delivery.' },
    { slug: 'concrete-cost', label: 'Estimate supplier-priced ready-mix material', context: 'Compare a local bulk quote with the retail bag purchase.' },
    { slug: 'cubic-yard', label: 'Review volume in cubic yards', context: 'Use a general volume conversion for other bulk project materials.' },
  ],
};

const footing: ConcreteCalculatorContent = {
  slug: 'concrete-footing',
  title: 'Concrete Footing Calculator',
  description: 'Estimate concrete volume for repeated identical rectangular footing runs using one run’s length, width, depth, count, and waste allowance.',
  seoTitle: 'Concrete Footing Calculator — Run Volume',
  seoDescription: 'Estimate concrete for repeated identical rectangular footing runs from dimensions, count, and waste. This volume tool does not design footings.',
  resultLabel: 'FOOTING CONCRETE VOLUME',
  resultSummary: 'The entered dimensions describe one rectangular run; count multiplies that entire run before waste is added.',
  purposeTitle: 'Total repeated rectangular footing runs',
  purpose: ['Use this takeoff after footing dimensions have been specified by an appropriate plan or professional. Enter the length of one run and use count only for identical runs.', 'Group footings by dimensions and calculate each group separately. This avoids applying one width or depth to unlike strips, pads, or grade beams.'],
  distinction: 'This calculator multiplies one identical rectangular footing run by a whole-number count. It estimates concrete only and must not be used to choose footing width, depth, reinforcement, bearing area, or foundation design.',
  formula: 'Order volume = one-run length × width × depth × whole-number count × (1 + waste ÷ 100)',
  formulaExplanation: 'Width and depth are converted from inches or centimetres, then multiplied by one run’s length. Count duplicates the entire run, and waste is applied to the combined volume.',
  examples: [
    { title: 'Continuous strip footing', inputs: 'Run length 48 ft; width 16 in; depth 8 in; count 1; waste 10%', inputValues: { length: 48, width: 16, depth: 8, count: 1, waste: 10 }, unit: 'imperial', expectedRaw: 1.329004, working: '48 × (16 ÷ 12) × (8 ÷ 12) ÷ 27 × 1 × 1.10', result: '1.74 yd³ to order', interpretation: 'Count stays at one because 48 ft is already the complete length of this modeled run.' },
    { title: 'Six identical short runs', inputs: 'Run length 8 ft; width 12 in; depth 8 in; count 6; waste 5%', inputValues: { length: 8, width: 12, depth: 8, count: 6, waste: 5 }, unit: 'imperial', expectedRaw: 0.951446, working: '8 × 1 × (8 ÷ 12) × 6 ÷ 27 × 1.05', result: '1.24 yd³ to order', interpretation: 'Count six means six separate runs, each 8 ft long with exactly the entered cross-section.' },
  ],
  interpretation: ['Confirm whether length means one repeated run or a total combined length; do not multiply both a combined length and its count.', 'Use separate calculations when any footing has a different width, depth, or shape.'],
  assumptions: ['Every counted run is identical.', 'Each footing has a rectangular cross-section.', 'Dimensions come from a valid project specification.', 'Waste applies uniformly to the combined volume.'],
  commonMistakes: ['Using total combined length and also entering multiple runs.', 'Entering a fractional footing count.', 'Using this volume result to select structural dimensions.', 'Including round piers as rectangular footings.'],
  edgeCases: [
    { title: 'One continuous run', explanation: 'Enter its total run length and a count of 1.' },
    { title: 'Different footing sizes', explanation: 'Calculate each identical group separately and add the order volumes.' },
    { title: 'Round piers', explanation: 'They require cylinder volume and are outside this rectangular-run model.' },
  ],
  limitations: 'This is not structural or geotechnical design. It excludes soil bearing, frost depth, loads, settlement, reinforcement, code, excavation, keyways, piers, stepped geometry, forms, and inspection requirements.',
  faqs: [
    { question: 'What does footing count multiply?', answer: 'It multiplies the complete rectangular run described by the entered length, width, and depth.' },
    { question: 'Can I use a combined length with count?', answer: 'Use count 1 if length already combines all identical runs; otherwise you would double-count volume.' },
    { question: 'Does this calculator size a safe footing?', answer: 'No. It only estimates volume from dimensions supplied by a valid plan or qualified professional.' },
    { question: 'Can it calculate round pier footings?', answer: 'No. Round piers need a cylinder-volume calculation.' },
    { question: 'How should I handle stepped footings?', answer: 'Divide them into rectangular segments, avoid overlaps, and calculate each segment group separately.' },
  ],
  relatedTools: [
    { slug: 'concrete', label: 'Add other rectangular concrete sections', context: 'Estimate walls, pads, or trenches separately from footing groups.' },
    { slug: 'concrete-slab', label: 'Calculate the slab above the foundation', context: 'Keep slab field volume separate from footing volume.' },
    { slug: 'concrete-cost', label: 'Price the combined concrete order', context: 'Apply a supplier unit price after totaling required volumes.' },
  ],
};

const cost: ConcreteCalculatorContent = {
  slug: 'concrete-cost',
  title: 'Concrete Cost Calculator',
  description: 'Build a material-only ready-mix budget from rectangular pour dimensions, waste allowance, and a supplier price per cubic yard or cubic metre.',
  seoTitle: 'Concrete Cost Calculator — Ready-Mix Budget',
  seoDescription: 'Estimate ready-mix material cost from pour dimensions, waste, and supplier price per cubic yard or metre. See exclusions and budgeting examples.',
  resultLabel: 'READY-MIX MATERIAL ESTIMATE',
  resultSummary: 'This multiplies adjusted ready-mix volume by the entered same-unit supplier price; project extras remain excluded.',
  purposeTitle: 'Apply a supplier unit price to ready-mix volume',
  purpose: ['Use a current quote per cubic yard in imperial mode or per cubic metre in metric mode to create a first material budget for a rectangular pour.', 'Clarify what the quote includes. Delivery, short-load, fuel, environmental, weekend, or waiting charges may be separate even when concrete is priced by volume.'],
  distinction: 'Concrete Cost prices adjusted ready-mix volume. It is not an installed-cost estimator and does not price bags, labor, forms, reinforcement, excavation, pumping, finishing, tax, or supplier surcharges unless already embedded in the entered unit price.',
  formula: 'Material estimate = adjusted order volume × supplier price per cubic yard or cubic metre',
  formulaExplanation: 'The calculator first finds rectangular volume and adds waste. In imperial mode it converts to cubic yards before multiplying by price per cubic yard; metric mode multiplies cubic metres by price per cubic metre.',
  examples: [
    { title: 'Quoted imperial ready-mix', inputs: '12 ft × 10 ft × 4 in; $165/yd³; waste 10%', inputValues: { length: 12, width: 10, depth: 4, price: 165, waste: 10 }, unit: 'imperial', expectedRaw: 268.888889, working: '1.63 yd³ adjusted × $165/yd³', result: '$268.89 material estimate', interpretation: 'The arithmetic prices exact adjusted volume; an actual invoice may use a minimum order and add delivery or short-load fees.' },
    { title: 'Quoted metric ready-mix', inputs: '5 m × 4 m × 12 cm; $220/m³; waste 5%', inputValues: { length: 5, width: 4, depth: 12, price: 220, waste: 5 }, unit: 'metric', expectedRaw: 554.4, working: '2.52 m³ adjusted × $220/m³', result: '$554.40 material estimate', interpretation: 'The example uses USD formatting; choosing EUR, GBP, or ZAR changes denomination and formatting without exchange-rate conversion.' },
  ],
  interpretation: ['Compare the calculated adjusted volume with the supplier’s billable minimum and rounding increment before relying on the amount.', 'Build a complete budget by adding quoted extras and separate scopes rather than increasing the concrete waste field to hide unrelated costs.'],
  assumptions: ['Price and volume use the displayed matching cubic unit.', 'One unit price applies to the entire quantity.', 'The entered price uses the intended EUR, USD, GBP, or ZAR denomination without live FX conversion.', 'Waste changes purchased volume, not unit price.'],
  commonMistakes: ['Entering a cubic-metre price in imperial mode.', 'Treating base mix price as delivered total.', 'Assuming material cost is installed project cost.', 'Ignoring minimum-load and waiting charges.'],
  edgeCases: [
    { title: 'Supplier minimum exceeds volume', explanation: 'The calculator prices modeled volume; manually compare that with the minimum billable quantity.' },
    { title: 'Tiered quote', explanation: 'One price cannot represent multiple quantity tiers or surcharges; model the supplier quote separately.' },
    { title: 'Tax-inclusive quote', explanation: 'Use a tax-inclusive unit price only if you intentionally want tax embedded in the material estimate.' },
  ],
  limitations: 'The result excludes all unentered fees and non-concrete work, including delivery, short-load charges, tax, pumping, labor, finishing, excavation, base, forms, reinforcement, testing, permits, overtime, and price changes.',
  faqs: [
    { question: 'What concrete price should I enter?', answer: 'Enter the supplier quote per cubic yard in imperial mode or per cubic metre in metric mode.' },
    { question: 'Does the estimate include labor?', answer: 'No. It prices only adjusted ready-mix volume at the entered unit price.' },
    { question: 'Are delivery and short-load fees included?', answer: 'Only if your supplier already included them in the per-volume price you enter; otherwise add them separately.' },
    { question: 'Why might the supplier invoice be higher?', answer: 'Minimum loads, order rounding, delivery, fuel, waiting time, tax, mix upgrades, and pumping can all change the invoice.' },
    { question: 'Can I use EUR, USD, GBP, or ZAR?', answer: 'Yes. Choose the denomination that matches the entered price. The selector changes formatting only; no exchange-rate conversion occurs.' },
  ],
  relatedTools: [
    { slug: 'concrete', label: 'Verify ready-mix quantity before pricing', context: 'Review base and adjusted cubic volume independently of cost.' },
    { slug: 'concrete-bag', label: 'Compare a retail premix purchase count', context: 'For small work, calculate whole bags using the product’s yield.' },
    { slug: 'concrete-slab', label: 'Review slab footprint and thickness volume', context: 'Confirm patio, floor, or foundation slab quantity before budgeting.' },
  ],
};

export const concreteCalculatorContent: Record<ConcreteCalculatorSlug, ConcreteCalculatorContent> = {
  concrete,
  'concrete-slab': slab,
  'concrete-bag': bag,
  'concrete-footing': footing,
  'concrete-cost': cost,
};
syncRegistrySeoCapabilities(concreteCalculatorContent);

export const isConcreteCalculatorSlug = (slug: string): slug is ConcreteCalculatorSlug =>
  slug in concreteCalculatorContent;