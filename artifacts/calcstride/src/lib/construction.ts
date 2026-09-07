import { convertUnitValue, formatConvertedInput, formatCurrency, unitRegistry, type CurrencyCode, type UnitKey } from './units-preferences';

export type UnitSystem = 'imperial' | 'metric';

export type ConstructionField = {
  key: string;
  label: string;
  imperialUnit: string;
  metricUnit: string;
  imperialDefault: string;
  metricDefault: string;
  allowZero?: boolean;
  step?: string;
};

/** Unit choices intentionally exclude counts, percentages, coats, rails and gates. */
const lengthUnits = ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'] as const;
const areaUnits = ['mm2', 'cm2', 'm2', 'km2', 'in2', 'ft2', 'yd2', 'mi2'] as const;
const volumeUnits = ['mm3', 'cm3', 'm3', 'in3', 'ft3', 'yd3'] as const;
const liquidUnits = ['ml', 'l', 'usGal', 'impGal'] as const;
const massUnits = ['g', 'kg', 'tonne', 'oz', 'lb', 'usTon'] as const;
export type ConstructionUnit = UnitKey | 'ft2PerGal' | 'm2PerL' | 'tonsPerYd3' | 'kgPerM3' | 'perYd3' | 'perM3' | 'perTon' | 'perTonne';

export function constructionUnitsForField(item: ConstructionField): readonly ConstructionUnit[] {
  const unit = `${item.imperialUnit} ${item.metricUnit}`;
  if (item.key === 'coverage') return ['ft2PerGal', 'm2PerL'];
  if (item.key === 'density') return ['tonsPerYd3', 'kgPerM3'];
  if (item.key === 'price') return item.imperialUnit.includes('ton') ? ['perTon', 'perTonne'] : ['perYd3', 'perM3'];
  if (/ft²|m²/.test(unit)) return areaUnits;
  if (/ft³|L/.test(unit)) return [...volumeUnits, ...liquidUnits];
  if (/%|pieces|areas|rooms|coats|boards|rails|gates|count/.test(unit)) return [];
  return lengthUnits;
}
export function defaultConstructionFieldUnit(item: ConstructionField, system: UnitSystem): ConstructionUnit | undefined {
  const raw = system === 'imperial' ? item.imperialUnit : item.metricUnit;
  const choices = constructionUnitsForField(item);
  const match: Record<string, ConstructionUnit> = {
    ft: 'ft', m: 'm', in: 'in', cm: 'cm', mm: 'mm', 'ft²': 'ft2', 'm²': 'm2',
    'ft³': 'ft3', L: 'l', 'ft² / gal': 'ft2PerGal', 'm² / L': 'm2PerL',
    'tons / yd³': 'tonsPerYd3', 'kg / m³': 'kgPerM3', '$ / yd³': 'perYd3', '$ / m³': 'perM3', '$ / ton': 'perTon', '$ / tonne': 'perTonne',
  };
  const selected = match[raw];
  return selected && choices.includes(selected) ? selected : choices[0];
}
const constructionSpecificLabels: Record<string, string> = {
  ft2PerGal: 'ft² / gal', m2PerL: 'm² / L', tonsPerYd3: 'tons / yd³', kgPerM3: 'kg / m³', perYd3: '/ yd³', perM3: '/ m³', perTon: '/ ton', perTonne: '/ tonne',
};
const constructionRegistryLabels: Record<string, string> = {
  mm: 'mm', cm: 'cm', m: 'm', km: 'km', in: 'in', ft: 'ft', yd: 'yd', mi: 'mi', mm2: 'mm²', cm2: 'cm²', m2: 'm²', km2: 'km²', in2: 'in²', ft2: 'ft²', yd2: 'yd²', mi2: 'mi²', mm3: 'mm³', cm3: 'cm³', m3: 'm³', in3: 'in³', ft3: 'ft³', yd3: 'yd³', ml: 'mL', l: 'L', usGal: 'US gal', impGal: 'imp gal', g: 'g', kg: 'kg', tonne: 't', oz: 'oz', lb: 'lb', usTon: 'US ton',
};
export const constructionUnitLabel = (unit: ConstructionUnit) =>
  constructionSpecificLabels[unit] ?? constructionRegistryLabels[unit] ?? unitRegistry[unit as UnitKey]?.symbol ?? unit;

export function formatConstructionConvertedInput(value: number, unit: ConstructionUnit | undefined): string {
  if (!unit) return formatConvertedInput(value);
  if (['perYd3', 'perM3', 'perTon', 'perTonne', 'tonsPerYd3', 'kgPerM3', 'ft2PerGal', 'm2PerL'].includes(unit)) {
    return formatConvertedInput(value, { significantDigits: 8, maximumFractionDigits: 2 });
  }
  const dimension = unitRegistry[unit as UnitKey]?.dimension;
  if (dimension === 'area') return formatConvertedInput(value, { significantDigits: 8, maximumFractionDigits: 2 });
  if (dimension === 'volume' || dimension === 'liquid') return formatConvertedInput(value, { significantDigits: 8, maximumFractionDigits: 4 });
  return formatConvertedInput(value, { significantDigits: 8, maximumFractionDigits: 4 });
}

const volumeCanonical = (value: number, unit: ConstructionUnit) =>
  unit === 'ml' ? value / 1e6 : unit === 'l' ? value / 1000 : unit === 'usGal' ? value * 0.003785411784 : unit === 'impGal' ? value * 0.00454609 : convertUnitValue(value, unit as UnitKey, 'm3');
const fromVolumeCanonical = (value: number, unit: ConstructionUnit) =>
  unit === 'ml' ? value * 1e6 : unit === 'l' ? value * 1000 : unit === 'usGal' ? value / 0.003785411784 : unit === 'impGal' ? value / 0.00454609 : convertUnitValue(value, 'm3', unit as UnitKey);
/** Converts displayed field values without rounding. It is also used by the page when the system changes. */
export function convertConstructionFieldValue(value: number, from: ConstructionUnit, to: ConstructionUnit): number {
  if (from === to) return value;
  if (from === 'ft2PerGal' && to === 'm2PerL') return value * 0.0245424;
  if (from === 'm2PerL' && to === 'ft2PerGal') return value / 0.0245424;
  if (from === 'tonsPerYd3' && to === 'kgPerM3') return value * 1186.55284;
  if (from === 'kgPerM3' && to === 'tonsPerYd3') return value / 1186.55284;
  if (from === 'perYd3' && to === 'perM3') return value * 1.30795062;
  if (from === 'perM3' && to === 'perYd3') return value / 1.30795062;
  if (from === 'perTon' && to === 'perTonne') return value * 1.10231131;
  if (from === 'perTonne' && to === 'perTon') return value / 1.10231131;
  if (constructionUnitLabel(from).match(/³|gal|L|mL/) && constructionUnitLabel(to).match(/³|gal|L|mL/)) return fromVolumeCanonical(volumeCanonical(value, from), to);
  return convertUnitValue(value, from as UnitKey, to as UnitKey);
}
/** Adapts arbitrary per-field units to the legacy formula's selected-system contract. */
export function adaptConstructionValues(raw: Record<string, string>, tool: ConstructionToolConfig, units: Record<string, ConstructionUnit | undefined>, system: UnitSystem): Record<string, string> {
  return Object.fromEntries(tool.fields.map(item => {
    const source = units[item.key];
    const target = defaultConstructionFieldUnit(item, system);
    const value = Number(raw[item.key]);
    return [item.key, source && target && Number.isFinite(value) ? String(convertConstructionFieldValue(value, source, target)) : raw[item.key]];
  }));
}

export type BreakdownLine = { label: string; value: string };

export type ConstructionResult = {
  primary: string;
  summary: string;
  breakdown: BreakdownLine[];
  raw: number;
  error?: string;
};

export type ConstructionToolConfig = {
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: 'construction';
  href: string;
  tags: string[];
  section: string;
  fields: ConstructionField[];
  formula: string;
  example: string;
  instructions: string[];
  faqs: { question: string; answer: string }[];
  related: string[];
};

const field = (key: string, label: string, imperialUnit: string, metricUnit: string, imperialDefault: string, metricDefault: string, options: Pick<ConstructionField, 'allowZero' | 'step'> = {}): ConstructionField => ({
  key, label, imperialUnit, metricUnit, imperialDefault, metricDefault, allowZero: options.allowZero ?? key === 'waste', step: options.step,
});

const commonDimensionFields = [
  field('length', 'Length', 'ft', 'm', '12', '3.66'),
  field('width', 'Width', 'ft', 'm', '10', '3.05'),
  field('depth', 'Depth', 'in', 'cm', '4', '10'),
];

export const constructionTools: ConstructionToolConfig[] = [
  {
    slug: 'concrete',
    name: 'Concrete Calculator',
    description: 'Estimate ready-mix concrete volume for rectangular slabs, pads, paths, and small pours.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/concrete',
    tags: ['concrete', 'cement', 'volume', 'slab'],
    section: 'Concrete',
    fields: [...commonDimensionFields, field('waste', 'Waste allowance', '%', '%', '10', '10', { step: '1' })],
    formula: 'Length × width × depth, converted to cubic yards or cubic metres, then increased by the waste allowance.',
    example: 'A 12 ft × 10 ft pad that is 4 in deep is 1.48 yd³ before waste. With 10% waste, order about 1.63 yd³.',
    instructions: ['Measure the finished footprint, not the excavation.', 'Use the deepest typical depth when the base is uneven.', 'Add waste for spillage, subgrade variation, and the minimum load size from your supplier.'],
    faqs: [
      { question: 'How much extra concrete should I order?', answer: 'A 5–10% allowance is common for a simple rectangular pour. Irregular forms and sloped ground may need more.' },
      { question: 'Should I order by cubic yard or cubic metre?', answer: 'Use the unit sold by your ready-mix supplier. The calculator shows both so you can compare the quote.' },
    ],
    related: ['concrete-slab', 'concrete-bag', 'concrete-cost'],
  },
  {
    slug: 'concrete-slab',
    name: 'Concrete Slab Calculator',
    description: 'Calculate concrete for a patio, garage floor, walkway, or foundation slab with a practical waste allowance.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/concrete-slab',
    tags: ['concrete slab', 'patio', 'garage floor', 'foundation'],
    section: 'Concrete',
    fields: [...commonDimensionFields, field('waste', 'Waste allowance', '%', '%', '10', '10', { step: '1' })],
    formula: 'Slab volume = length × width × thickness. Order volume = slab volume × (1 + waste ÷ 100).',
    example: 'For a 20 ft × 12 ft slab at 4 in thick, the base volume is 2.96 yd³; 10% waste brings the order quantity to 3.25 yd³.',
    instructions: ['Confirm the slab thickness with your project plan.', 'Break a non-rectangular slab into rectangles and add their results.', 'Round the final order up to the supplier’s delivery increment.'],
    faqs: [
      { question: 'Does this include reinforcement?', answer: 'No. Reinforcing mesh, rebar, vapor barriers, and sub-base are separate quantities.' },
      { question: 'What thickness should a patio slab be?', answer: 'Many residential patios use about 4 in, but local soil, frost, loads, and code can require a different design.' },
    ],
    related: ['concrete', 'concrete-cost', 'square-footage'],
  },
  {
    slug: 'concrete-bag',
    name: 'Concrete Bag Calculator',
    description: 'Find how many bags of premixed concrete you need from the pour dimensions and bag yield.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/concrete-bag',
    tags: ['concrete bags', 'premix', 'quickrete', 'cement bags'],
    section: 'Concrete',
    fields: [...commonDimensionFields, field('bagYield', 'Yield per bag', 'ft³', 'L', '0.5', '14'), field('waste', 'Waste allowance', '%', '%', '10', '10', { step: '1' })],
    formula: 'Required bags = (length × width × depth × (1 + waste ÷ 100)) ÷ yield per bag.',
    example: 'A 4 ft × 4 ft × 4 in repair needs about 5.87 ft³ of mix with 10% waste. At 0.5 ft³ per bag, buy 12 bags.',
    instructions: ['Read the actual yield on the bag label; bag weights do not always have the same yield.', 'Use the same unit system for dimensions and bag yield.', 'Always round bags up because partial bags cannot make the pour.'],
    faqs: [
      { question: 'Can I use a 60 lb bag yield from another brand?', answer: 'Yes. Replace the default yield with the value printed on your product’s technical sheet.' },
      { question: 'Why is the result rounded up?', answer: 'A short bag leaves an incomplete pour, so the purchase quantity must be a whole number.' },
    ],
    related: ['concrete', 'concrete-slab', 'concrete-cost'],
  },
  {
    slug: 'concrete-footing',
    name: 'Concrete Footing Calculator',
    description: 'Estimate concrete for continuous strip footings or repeated rectangular footings.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/concrete-footing',
    tags: ['footing', 'foundation', 'concrete', 'foundation footing'],
    section: 'Concrete',
    fields: [field('length', 'Length of one footing run', 'ft', 'm', '48', '14.63'), field('width', 'Footing width', 'in', 'cm', '16', '40'), field('depth', 'Footing depth', 'in', 'cm', '8', '20'), field('count', 'Number of footings', 'pieces', 'pieces', '1', '1', { step: '1' }), field('waste', 'Waste allowance', '%', '%', '10', '10', { step: '1' })],
    formula: 'Footing volume = one run’s length × width × depth × number of identical footings. Add the waste allowance after converting units.',
    example: 'A 48 ft strip footing, 16 in wide and 8 in deep, is 1.58 yd³ before waste; with 10%, plan for 1.74 yd³.',
    instructions: ['Enter one run’s length and use count only for identical runs.', 'If length already combines every run, leave count at 1 to avoid double-counting.', 'Do not use this estimate to size a structural footing; follow the engineered dimensions.'],
    faqs: [
      { question: 'Can this calculate pier footings?', answer: 'It is intended for rectangular continuous or repeated rectangular footings. Round piers need a cylinder-based calculation.' },
      { question: 'Does the count multiply the whole footing?', answer: 'Yes. Count duplicates the complete run described by the entered length, width, and depth.' },
    ],
    related: ['concrete', 'cubic-yard', 'concrete-cost'],
  },
  {
    slug: 'concrete-cost',
    name: 'Concrete Cost Calculator',
    description: 'Estimate the material cost of a concrete pour from dimensions, price, and waste.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/concrete-cost',
    tags: ['concrete cost', 'ready mix', 'pour price', 'construction budget'],
    section: 'Concrete',
    fields: [...commonDimensionFields, field('price', 'Concrete price', '$ / yd³', '$ / m³', '165', '215'), field('waste', 'Waste allowance', '%', '%', '10', '10', { step: '1' })],
    formula: 'Estimated material cost = adjusted concrete volume × supplier price per cubic yard or cubic metre.',
    example: 'If a 12 ft × 10 ft × 4 in pour needs 1.63 yd³ after waste and ready-mix is $165/yd³, the concrete material estimate is about $268.95.',
    instructions: ['Use the delivered price, not just the base mix price, if your quote bundles delivery.', 'Ask about short-load fees, fuel surcharges, and minimum order sizes.', 'Treat this as a materials estimate; labor, pumping, forming, and reinforcement are excluded.'],
    faqs: [
      { question: 'Does this include labor?', answer: 'No. It estimates concrete material only. Add labor, pump, forms, reinforcement, and site preparation separately.' },
      { question: 'What price should I enter?', answer: 'Use the quoted price per cubic yard or cubic metre from your supplier and keep the unit system consistent.' },
    ],
    related: ['concrete', 'concrete-slab', 'concrete-bag'],
  },
  {
    slug: 'cubic-yard',
    name: 'Cubic Yard Calculator',
    description: 'Convert rectangular project dimensions into cubic yards for concrete, soil, gravel, mulch, or fill.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/cubic-yard',
    tags: ['cubic yards', 'volume calculator', 'soil', 'aggregate'],
    section: 'Concrete',
    fields: commonDimensionFields,
    formula: 'Volume in cubic yards = length × width × depth in feet ÷ 27. Metric inputs are converted to cubic yards.',
    example: 'A 15 ft × 8 ft bed at 3 in deep is 1.11 yd³. Add a waste allowance separately if the material settles.',
    instructions: ['Use the material’s finished depth, not the loose excavation depth.', 'For multiple beds, calculate each rectangle and add the cubic yards.', 'Ask the supplier whether they sell by “yard” as a cubic yard or by weight.'],
    faqs: [
      { question: 'How many cubic feet are in a cubic yard?', answer: 'One cubic yard contains 27 cubic feet.' },
      { question: 'Does one cubic yard always weigh the same?', answer: 'No. Soil, gravel, mulch, and concrete have different densities, so weight requires a material-specific estimate.' },
    ],
    related: ['concrete', 'gravel', 'mulch'],
  },
  {
    slug: 'square-footage',
    name: 'Square Footage Calculator',
    description: 'Find floor, wall, patio, or garden area from length, width, and number of equal spaces.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/square-footage',
    tags: ['square footage', 'area', 'floor area', 'square metres'],
    section: 'Flooring & Tiles',
    fields: [field('length', 'Length', 'ft', 'm', '16', '4.88'), field('width', 'Width', 'ft', 'm', '12', '3.66'), field('count', 'Number of equal areas', 'areas', 'areas', '1', '1', { step: '1' }), field('waste', 'Waste allowance', '%', '%', '10', '10', { step: '1' })],
    formula: 'Area = length × width × number of areas. Purchase area = area × (1 + waste ÷ 100).',
    example: 'Two rooms measuring 16 ft × 12 ft have 384 ft². With 10% waste, plan materials for 422.4 ft².',
    instructions: ['Split L-shaped rooms into rectangles and add them.', 'Measure to the finished surface where possible.', 'Use the waste field for cutting loss, not for a room-size measurement error.'],
    faqs: [
      { question: 'How do I calculate an irregular room?', answer: 'Divide it into simple rectangles, calculate each area, and add the results.' },
      { question: 'Why show both ft² and m²?', answer: 'Flooring and building products are sold in both systems. Seeing both reduces unit mistakes when comparing products.' },
    ],
    related: ['tile', 'flooring', 'paint'],
  },
  {
    slug: 'paint',
    name: 'Paint Calculator',
    description: 'Estimate litres or gallons of paint for walls after subtracting doors and windows and allowing for coats.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/paint',
    tags: ['paint', 'paint coverage', 'walls', 'gallons', 'litres'],
    section: 'Painting',
    fields: [field('length', 'Room length', 'ft', 'm', '16', '4.88'), field('width', 'Room width', 'ft', 'm', '12', '3.66'), field('height', 'Wall height', 'ft', 'm', '8', '2.44'), field('openings', 'Door and window area', 'ft²', 'm²', '60', '5.57', { allowZero: true }), field('coats', 'Number of coats', 'coats', 'coats', '2', '2', { step: '1' }), field('coverage', 'Coverage per container', 'ft² / gal', 'm² / L', '350', '10', { step: '0.1' })],
    formula: 'Paint containers = ((2 × (length + width) × height − openings) × coats) ÷ coverage.',
    example: 'A 16 ft × 12 ft room with 8 ft walls, 60 ft² of openings, two coats, and 350 ft²/gal coverage needs about 2.22 gallons; buy 3 gallons.',
    instructions: ['Use the label’s coverage rate for your surface and paint type.', 'Subtract only openings that will not be painted.', 'Round up to whole containers and consider a separate trim estimate.'],
    faqs: [
      { question: 'Does this include ceilings?', answer: 'No. Add the ceiling as another rectangle or run a separate estimate with the same coverage rate.' },
      { question: 'Why can real paint use be higher than the label?', answer: 'Porous walls, dark-to-light color changes, texture, application method, and primer can reduce practical coverage.' },
    ],
    related: ['square-footage', 'drywall', 'flooring'],
  },
  {
    slug: 'tile',
    name: 'Tile Calculator',
    description: 'Calculate how many tiles to buy from room dimensions, tile size, and cutting waste.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/tile',
    tags: ['tile', 'tiles', 'backsplash', 'floor tile'],
    section: 'Flooring & Tiles',
    fields: [field('length', 'Surface length', 'ft', 'm', '12', '3.66'), field('width', 'Surface width', 'ft', 'm', '10', '3.05'), field('tileLength', 'Tile length', 'in', 'cm', '12', '30'), field('tileWidth', 'Tile width', 'in', 'cm', '12', '30'), field('waste', 'Cutting waste', '%', '%', '10', '10', { step: '1' })],
    formula: 'Tiles = ceiling((surface area × (1 + waste ÷ 100)) ÷ one tile’s area).',
    example: 'A 120 ft² floor with 12 in × 12 in tiles and 10% waste needs 132 tiles before packaging is considered.',
    instructions: ['Measure the actual tiled surface, excluding cabinets and permanent fixtures.', 'Use the same length unit for tile dimensions and choose the correct unit system.', 'Buy full boxes and keep spare tiles from the same batch for future repairs.'],
    faqs: [
      { question: 'What waste percentage should I use?', answer: '10% works for many straight layouts. Diagonal patterns, small tiles, and complex rooms commonly need 15% or more.' },
      { question: 'Does the result account for grout joints?', answer: 'It estimates tile coverage using the tile face size. Joint layout affects the cut plan, so review the final layout before ordering.' },
    ],
    related: ['flooring', 'square-footage', 'concrete-slab'],
  },
  {
    slug: 'flooring',
    name: 'Flooring Calculator',
    description: 'Estimate flooring material for one or more rooms with a realistic cutting and installation allowance.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/flooring',
    tags: ['flooring', 'laminate', 'vinyl plank', 'hardwood'],
    section: 'Flooring & Tiles',
    fields: [field('length', 'Room length', 'ft', 'm', '16', '4.88'), field('width', 'Room width', 'ft', 'm', '12', '3.66'), field('count', 'Number of equal rooms', 'rooms', 'rooms', '1', '1', { step: '1' }), field('waste', 'Waste allowance', '%', '%', '10', '10', { step: '1' })],
    formula: 'Purchase area = length × width × number of rooms × (1 + waste ÷ 100).',
    example: 'A 16 ft × 12 ft room is 192 ft². With 10% waste, purchase about 211.2 ft² of flooring.',
    instructions: ['Measure each room at its widest finished points.', 'Use the product’s box coverage to turn the area result into boxes.', 'Allow extra for angled walls, closets, transitions, and future repairs.'],
    faqs: [
      { question: 'How much flooring waste is normal?', answer: 'Around 5–10% is common for simple layouts; add more for diagonal patterns or rooms with many cuts.' },
      { question: 'Does this include underlayment?', answer: 'No. Underlayment is usually ordered by the same net floor area, with its own product instructions.' },
    ],
    related: ['square-footage', 'tile', 'board-foot'],
  },
  {
    slug: 'gravel',
    name: 'Gravel Calculator',
    description: 'Estimate gravel volume, approximate weight, and optional material cost for driveways and paths.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/gravel',
    tags: ['gravel', 'aggregate', 'driveway', 'stone'],
    section: 'Landscaping',
    fields: [...commonDimensionFields, field('density', 'Bulk density', 'tons / yd³', 'kg / m³', '1.4', '1680'), field('price', 'Price', '$ / ton', '$ / tonne', '55', '55'), field('waste', 'Waste and settlement', '%', '%', '10', '10', { step: '1' })],
    formula: 'Adjusted volume = length × width × depth × (1 + waste ÷ 100). Weight = volume × bulk density; cost = tonnes × price.',
    example: 'A 20 ft × 10 ft path at 3 in deep is 1.85 yd³ before allowance. With 10% extra it is 2.04 yd³, or about 2.85 tons at 1.4 tons/yd³.',
    instructions: ['Use compacted finished depth and add more if the base will settle.', 'Bulk density varies by stone size and moisture; use the quarry’s figure when available.', 'Order by the supplier’s sold unit and confirm whether delivery is separate.'],
    faqs: [
      { question: 'Why is gravel sold by both cubic yards and tonnes?', answer: 'Volume describes space; weight is easier for some quarries to load. Density connects the two and varies by material.' },
      { question: 'Should I include base layers?', answer: 'Run one estimate for each aggregate layer because base, bedding, and decorative gravel often have different depths and densities.' },
    ],
    related: ['cubic-yard', 'mulch', 'square-footage'],
  },
  {
    slug: 'mulch',
    name: 'Mulch Calculator',
    description: 'Calculate bulk mulch volume and the number of standard bags for garden beds.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/mulch',
    tags: ['mulch', 'garden beds', 'landscaping', 'cubic yard'],
    section: 'Landscaping',
    fields: [field('length', 'Bed length', 'ft', 'm', '20', '6.1'), field('width', 'Bed width', 'ft', 'm', '6', '1.83'), field('depth', 'Mulch depth', 'in', 'cm', '3', '7.5'), field('bagSize', 'Bag size', 'ft³', 'L', '2', '56.6'), field('waste', 'Allowance', '%', '%', '10', '10', { step: '1' })],
    formula: 'Mulch volume = bed area × depth. Bags = adjusted volume ÷ bag volume.',
    example: 'A 20 ft × 6 ft bed at 3 in needs 1.11 yd³ before allowance. With 10% extra and 2 ft³ bags, buy 17 bags.',
    instructions: ['Measure several bed widths if the shape is irregular and add the areas.', 'Use the depth recommended for the plant type; deeper is not always better.', 'Check the actual bag volume because bag sizes differ by retailer and material.'],
    faqs: [
      { question: 'How deep should mulch be?', answer: 'Many beds use roughly 2–4 in, keeping mulch away from trunks and building siding. Follow plant and local guidance.' },
      { question: 'Does mulch settle?', answer: 'Yes. The allowance helps cover settling and small measurement losses, but old mulch may need a separate top-up calculation.' },
    ],
    related: ['cubic-yard', 'gravel', 'square-footage'],
  },
  {
    slug: 'roof-pitch',
    name: 'Roof Pitch Calculator',
    description: 'Convert rise and run into roof pitch, angle, and the slope multiplier used for roof area.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/roof-pitch',
    tags: ['roof pitch', 'roof angle', 'rise over run', 'slope'],
    section: 'Roofing',
    fields: [field('rise', 'Rise', 'in', 'cm', '6', '15'), field('run', 'Run', 'in', 'cm', '12', '30')],
    formula: 'Pitch = rise ÷ run, expressed as rise per 12 units. Angle = arctangent(rise ÷ run). Slope multiplier = √(1 + pitch²).',
    example: 'A 6 in rise over a 12 in run is a 6:12 pitch, about 26.6°, with a slope multiplier of 1.118.',
    instructions: ['Measure horizontal run, not the rafter length.', 'Keep rise and run in the same unit; the ratio is unit-independent.', 'Use the multiplier when turning plan-view roof area into sloped surface area.'],
    faqs: [
      { question: 'What does a 6:12 roof pitch mean?', answer: 'The roof rises 6 units for every 12 horizontal units. In imperial work, that is 6 inches of rise per 12 inches of run.' },
      { question: 'Can I measure pitch from the roof surface?', answer: 'Yes, but use a level and a reliable rise/run measurement. Avoid climbing without appropriate safety equipment.' },
    ],
    related: ['roofing-material', 'stair', 'concrete'],
  },
  {
    slug: 'roofing-material',
    name: 'Roofing Material Calculator',
    description: 'Estimate roof surface area, roofing squares, and asphalt-shingle bundles from plan dimensions and pitch.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/roofing-material',
    tags: ['roofing', 'shingles', 'roof squares', 'bundles'],
    section: 'Roofing',
    fields: [field('length', 'Plan length', 'ft', 'm', '40', '12.19'), field('width', 'Plan width', 'ft', 'm', '28', '8.53'), field('rise', 'Roof rise', 'in', 'cm', '6', '15'), field('run', 'Roof run', 'in', 'cm', '12', '30'), field('waste', 'Waste allowance', '%', '%', '10', '10', { step: '1' })],
    formula: 'Sloped area = plan area × √(1 + (rise ÷ run)²). Add waste. One roofing square is 100 ft²; a typical shingle square uses three bundles.',
    example: 'A 40 ft × 28 ft plan roof at 6:12 is about 1,252 ft² sloped. With 10% waste, that is 13.77 squares, or 42 bundles at 3 bundles per square.',
    instructions: ['Use the roof’s plan footprint and pitch, not the finished rafter length.', 'Measure dormers, valleys, and attached roof sections separately for a precise takeoff.', 'Confirm bundle coverage with the shingle manufacturer because product coverage varies.'],
    faqs: [
      { question: 'What is a roofing square?', answer: 'A roofing square is 100 square feet of roof surface.' },
      { question: 'Does this include underlayment and ridge caps?', answer: 'No. It estimates the main shingle field. Starter strips, ridge caps, flashing, underlayment, and fasteners need separate takeoffs.' },
    ],
    related: ['roof-pitch', 'square-footage', 'concrete-cost'],
  },
  {
    slug: 'stair',
    name: 'Stair Calculator',
    description: 'Estimate riser count, actual riser height, tread count, and total stair run from floor-to-floor rise.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/stair',
    tags: ['stairs', 'staircase', 'riser', 'tread'],
    section: 'Roofing',
    fields: [field('totalRise', 'Total floor-to-floor rise', 'in', 'cm', '108', '274.32'), field('maxRiser', 'Maximum riser height', 'in', 'cm', '7.5', '19'), field('minTread', 'Minimum tread depth', 'in', 'cm', '10', '25.4')],
    formula: 'Risers = ceiling(total rise ÷ maximum riser). Actual riser = total rise ÷ risers. Total run = (risers − 1) × minimum tread.',
    example: 'For a 108 in rise with a 7.5 in maximum riser and 10 in tread, use 15 risers at 7.2 in each and 140 in of run.',
    instructions: ['Measure finished-floor to finished-floor, including flooring thickness.', 'Use local code limits for riser height, tread depth, width, landings, and headroom.', 'Treat the output as a layout starting point, not a permit-ready stair design.'],
    faqs: [
      { question: 'Why is the number of treads one less than risers?', answer: 'In a typical straight stair, the upper floor acts as the final walking surface, so there is one fewer separate tread.' },
      { question: 'Does this check building code?', answer: 'No. Code varies by jurisdiction and project type; have the final stair layout reviewed locally.' },
    ],
    related: ['roof-pitch', 'square-footage', 'board-foot'],
  },
  {
    slug: 'board-foot',
    name: 'Board Foot Calculator',
    description: 'Calculate lumber volume in board feet and cubic metres from thickness, width, length, and quantity.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/board-foot',
    tags: ['board feet', 'lumber', 'timber', 'wood volume'],
    section: 'Timber & Decking',
    fields: [field('thickness', 'Board thickness', 'in', 'mm', '2', '50'), field('width', 'Board width', 'in', 'mm', '8', '200'), field('length', 'Board length', 'ft', 'm', '8', '2.44'), field('count', 'Quantity', 'boards', 'boards', '12', '12', { step: '1' })],
    formula: 'Imperial board feet = thickness(in) × width(in) × length(ft) × quantity ÷ 12. Metric volume is converted to board feet.',
    example: 'Twelve 2 in × 8 in × 8 ft boards contain 128 board feet before trimming or grading waste.',
    instructions: ['Use actual surfaced dimensions for a purchase estimate when available.', 'For metric lumber, enter thickness and width in millimetres and length in metres.', 'Add a separate waste allowance for cuts, defects, and grade selection.'],
    faqs: [
      { question: 'What is a board foot?', answer: 'One board foot is a volume of 144 cubic inches: a 1 in × 12 in × 12 in board, or any equivalent volume.' },
      { question: 'Is a board foot the same as a linear foot?', answer: 'No. Linear feet measure length only; board feet include thickness and width.' },
    ],
    related: ['deck-material', 'fence-material', 'flooring'],
  },
  {
    slug: 'deck-material',
    name: 'Deck Material Calculator',
    description: 'Estimate deck boards, board runs, and coverage area from deck dimensions and board spacing.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/deck-material',
    tags: ['deck', 'deck boards', 'composite decking', 'lumber'],
    section: 'Timber & Decking',
    fields: [field('length', 'Deck length', 'ft', 'm', '20', '6.1'), field('width', 'Deck width', 'ft', 'm', '12', '3.66'), field('boardWidth', 'Board face width', 'in', 'mm', '5.5', '140'), field('gap', 'Board gap', 'in', 'mm', '0.125', '3'), field('boardLength', 'Stock board length', 'ft', 'm', '16', '4.88'), field('waste', 'Cutting waste', '%', '%', '10', '10', { step: '1' })],
    formula: 'Boards across = ceiling(deck width ÷ (board width + gap)). Boards per row = ceiling(deck length ÷ stock board length). Total boards = product × (1 + waste).',
    example: 'A 20 ft × 12 ft deck using 5.5 in boards with 1/8 in gaps needs 26 rows. Each row uses two 16 ft stock boards, so 10% waste gives 58 boards.',
    instructions: ['Measure the finished deck surface, excluding stairs and picture-frame borders.', 'Use the manufacturer’s actual board width, not its nominal size.', 'Add separate quantities for joists, beams, posts, fascia, stairs, and fasteners.'],
    faqs: [
      { question: 'Why does board width include the gap?', answer: 'Every installed row consumes the board face plus its spacing gap. Ignoring the gap understates the number of boards.' },
      { question: 'Does this calculate the frame?', answer: 'No. It estimates field decking boards. The supporting frame needs a separate span and load-based design.' },
    ],
    related: ['board-foot', 'fence-material', 'square-footage'],
  },
  {
    slug: 'fence-material',
    name: 'Fence Material Calculator',
    description: 'Estimate fence posts, pickets, rails, and approximate panels from fence length and layout spacing.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/fence-material',
    tags: ['fence', 'fence posts', 'pickets', 'privacy fence'],
    section: 'Timber & Decking',
    fields: [field('length', 'Fence length', 'ft', 'm', '100', '30.48'), field('height', 'Fence height', 'ft', 'm', '6', '1.83'), field('postSpacing', 'Post spacing', 'ft', 'm', '8', '2.44'), field('picketWidth', 'Picket face width', 'in', 'mm', '5.5', '140'), field('gap', 'Picket gap', 'in', 'mm', '0.125', '3'), field('rails', 'Rails per section', 'rails', 'rails', '2', '2', { step: '1' }), field('gates', 'Gate openings', 'gates', 'gates', '1', '1', { allowZero: true, step: '1' })],
    formula: 'Posts = ceiling(length ÷ spacing) + 1 + 2 × gates. Pickets = ceiling(length ÷ (picket width + gap)). Rails = sections × rails per section.',
    example: 'A 100 ft fence at 8 ft post spacing needs 14 line posts before gate adjustments. With one gate, allow about 16 posts including its two sides.',
    instructions: ['Measure the fence line, not the property boundary if the fence steps or curves.', 'Use actual post spacing and check corner, end, and gate posts separately.', 'This estimates quantity, not post embedment, wind loading, or local setback compliance.'],
    faqs: [
      { question: 'Why do gates add two posts?', answer: 'A gate normally needs a post on each side. Heavy gates may need larger or additional structural support.' },
      { question: 'Should I count pickets at the gates?', answer: 'No. Subtract gate opening lengths for a more exact picket count; this quick estimate conservatively uses the full fence length.' },
    ],
    related: ['deck-material', 'board-foot', 'square-footage'],
  },
  {
    slug: 'drywall',
    name: 'Drywall Calculator',
    description: 'Estimate drywall sheets for walls and ceiling after subtracting doors and windows and allowing for cuts.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/drywall',
    tags: ['drywall', 'sheetrock', 'gypsum board', 'wall sheets'],
    section: 'Walls & Building Materials',
    fields: [field('length', 'Room length', 'ft', 'm', '16', '4.88'), field('width', 'Room width', 'ft', 'm', '12', '3.66'), field('height', 'Wall height', 'ft', 'm', '8', '2.44'), field('openings', 'Opening area', 'ft²', 'm²', '60', '5.57', { allowZero: true }), field('sheetLength', 'Sheet length', 'ft', 'm', '8', '2.44'), field('sheetWidth', 'Sheet width', 'ft', 'm', '4', '1.22'), field('waste', 'Cutting waste', '%', '%', '10', '10', { step: '1' })],
    formula: 'Drywall area = wall perimeter × height + ceiling area − openings. Sheets = drywall area × (1 + waste ÷ 100) ÷ sheet area.',
    example: 'A 16 ft × 12 ft room with 8 ft walls and 60 ft² of openings has 580 ft² to cover including the ceiling; 4 ft × 8 ft sheets with 10% waste require 20 sheets.',
    instructions: ['Include both walls and ceiling only if you plan to board both.', 'Subtract doors and windows by their rough opening area.', 'Check sheet orientation, fire-rated areas, moisture zones, and local fastening requirements.'],
    faqs: [
      { question: 'Does this include both sides of interior walls?', answer: 'No. Enter each room or wall surface you will actually board; a partition’s other side is a separate surface.' },
      { question: 'What sheet size should I use?', answer: 'Use the exact sheet dimensions you plan to buy. Longer sheets may reduce seams but can be harder to handle.' },
    ],
    related: ['square-footage', 'paint', 'brick'],
  },
  {
    slug: 'brick',
    name: 'Brick Calculator',
    description: 'Estimate bricks for a wall using brick face size, mortar joint, openings, and waste.',
    category: 'Home & Construction',
    categorySlug: 'construction',
    href: '/calculators/construction/brick',
    tags: ['brick', 'masonry', 'brick wall', 'mortar joint'],
    section: 'Walls & Building Materials',
    fields: [field('length', 'Wall length', 'ft', 'm', '30', '9.14'), field('height', 'Wall height', 'ft', 'm', '6', '1.83'), field('brickLength', 'Brick length', 'in', 'cm', '8', '20'), field('brickHeight', 'Brick height', 'in', 'cm', '2.25', '6'), field('joint', 'Mortar joint', 'in', 'cm', '0.375', '1'), field('openings', 'Opening area', 'ft²', 'm²', '24', '2.23', { allowZero: true }), field('waste', 'Breakage allowance', '%', '%', '10', '10', { step: '1' })],
    formula: 'Brick module area = (brick length + joint) × (brick height + joint). Bricks = wall area minus openings, divided by module area, then increased for waste.',
    example: 'A 30 ft × 6 ft wall with 24 ft² of openings and 8 in × 2.25 in bricks with a 3/8 in joint needs roughly 1,124 bricks with 10% waste.',
    instructions: ['Use the brick face dimensions, not the brick depth.', 'Measure openings as their actual wall area and include lintel or special courses separately.', 'Confirm the manufacturer’s coverage because brick formats and joint sizes vary.'],
    faqs: [
      { question: 'Why include the mortar joint?', answer: 'Each brick occupies its own face plus the joint space in the repeating wall pattern. Ignoring it overstates brick count.' },
      { question: 'Does this calculate mortar volume?', answer: 'No. Mortar quantity depends on joint depth, wall thickness, tooling, and mix; order it separately from the brick count.' },
    ],
    related: ['drywall', 'square-footage', 'board-foot'],
  },
];

const bySlug = new Map(constructionTools.map((tool) => [tool.slug, tool]));
const hardenedConcreteSlugs = new Set(['concrete', 'concrete-slab', 'concrete-bag', 'concrete-footing', 'concrete-cost']);

const finite = (value: number) => Number.isFinite(value) && Math.abs(value) <= 1e15;
const format = (value: number, digits = 2) => value.toLocaleString('en-US', { maximumFractionDigits: digits });
const toM = (value: number, unit: UnitSystem) => unit === 'imperial' ? value * 0.3048 : value;
const depthToM = (value: number, unit: UnitSystem) => unit === 'imperial' ? value * 0.0254 : value / 100;
const areaToM2 = (value: number, unit: UnitSystem) => unit === 'imperial' ? value * 0.092903 : value;
const smallToM = (value: number, unit: UnitSystem) => unit === 'imperial' ? value * 0.0254 : value / 100;
const volumeM3 = (values: Record<string, number>, unit: UnitSystem) => toM(values.length, unit) * toM(values.width, unit) * depthToM(values.depth, unit);
const yd3FromM3 = (value: number) => value * 1.30795062;
const ft2FromM2 = (value: number) => value * 10.7639104;
const safeResult = (primary: string, summary: string, breakdown: BreakdownLine[], raw: number): ConstructionResult => finite(raw) ? { primary, summary, breakdown, raw } : { primary: 'Check your inputs', summary: 'The result is outside a safe numeric range.', breakdown: [], raw: Number.NaN, error: 'Result is not finite' };
const errorResult = (message: string): ConstructionResult => ({ primary: 'Enter valid values', summary: message, breakdown: [], raw: Number.NaN, error: message });

function calculateFormula(slug: string, v: Record<string, number>, unit: UnitSystem, currency: CurrencyCode): ConstructionResult {
  const outputVolume = (m3: number) => unit === 'imperial' ? `${format(yd3FromM3(m3))} yd³` : `${format(m3)} m³`;
  const area = (m2: number) => unit === 'imperial' ? `${format(ft2FromM2(m2))} ft²` : `${format(m2)} m²`;
  const baseVolume = volumeM3(v, unit);
  const wasteMultiplier = (v.waste ?? 0) / 100 + 1;

  if (['concrete', 'concrete-slab'].includes(slug)) {
    const adjusted = baseVolume * wasteMultiplier;
    if (!finite(baseVolume) || !finite(adjusted)) return errorResult('The result is outside a safe numeric range.');
    return safeResult(outputVolume(adjusted), `${outputVolume(baseVolume)} base volume plus ${format(v.waste)}% waste.`, [
      { label: 'Base volume', value: outputVolume(baseVolume) },
      { label: 'Waste allowance', value: `${format(adjusted - baseVolume)} volume` },
      { label: 'Order quantity', value: outputVolume(adjusted) },
    ], adjusted);
  }
  if (slug === 'concrete-bag') {
    const adjusted = baseVolume * wasteMultiplier;
    const bagM3 = unit === 'imperial' ? v.bagYield * 0.0283168466 : v.bagYield / 1000;
    const bags = Math.ceil(adjusted / bagM3);
    if (!finite(adjusted) || !finite(bagM3) || !finite(bags)) return errorResult('The result is outside a safe numeric range.');
    return safeResult(`${format(bags, 0)} bags`, `${outputVolume(adjusted)} of mix at ${format(v.bagYield)} ${unit === 'imperial' ? 'ft³' : 'L'} per bag.`, [
      { label: 'Adjusted mix volume', value: outputVolume(adjusted) },
      { label: 'Bag yield', value: `${format(v.bagYield)} ${unit === 'imperial' ? 'ft³' : 'L'}` },
      { label: 'Buy', value: `${format(bags, 0)} whole bags` },
    ], bags);
  }
  if (slug === 'concrete-footing') {
    const m3 = toM(v.length, unit) * smallToM(v.width, unit) * smallToM(v.depth, unit) * v.count;
    const adjusted = m3 * wasteMultiplier;
    if (!finite(m3) || !finite(adjusted)) return errorResult('The result is outside a safe numeric range.');
    return safeResult(outputVolume(adjusted), `${format(v.count, 0)} footing run${v.count === 1 ? '' : 's'} with ${format(v.waste)}% waste.`, [
      { label: 'Unadjusted volume', value: outputVolume(m3) },
      { label: 'Footing count', value: format(v.count, 0) },
      { label: 'Order quantity', value: outputVolume(adjusted) },
    ], adjusted);
  }
  if (slug === 'concrete-cost') {
    const adjusted = baseVolume * wasteMultiplier;
    const cost = adjusted * (unit === 'imperial' ? yd3FromM3(1) : 1) * v.price;
    if (!finite(adjusted) || !finite(cost)) return errorResult('The result is outside a safe numeric range.');
    const money = (value: number) => formatCurrency(value, currency);
    return safeResult(money(cost), `${outputVolume(adjusted)} at ${money(v.price)} per ${unit === 'imperial' ? 'yd³' : 'm³'}.`, [
      { label: 'Order quantity', value: outputVolume(adjusted) },
      { label: 'Unit price', value: `${money(v.price)} / ${unit === 'imperial' ? 'yd³' : 'm³'}` },
      { label: 'Material estimate', value: money(cost) },
    ], cost);
  }
  if (slug === 'cubic-yard') {
    const yd3 = yd3FromM3(baseVolume);
    return safeResult(`${format(yd3)} yd³`, `${area(baseVolume / depthToM(v.depth, unit))} footprint at the entered depth.`, [
      { label: 'Cubic metres', value: `${format(baseVolume)} m³` },
      { label: 'Cubic yards', value: `${format(yd3)} yd³` },
    ], yd3);
  }
  if (slug === 'square-footage') {
    const m2 = toM(v.length, unit) * toM(v.width, unit) * v.count;
    const adjusted = m2 * wasteMultiplier;
    return safeResult(area(adjusted), `${area(m2)} net area plus ${format(v.waste)}% material allowance.`, [
      { label: 'Net area', value: area(m2) },
      { label: 'Allowance', value: area(adjusted - m2) },
      { label: 'Purchase area', value: area(adjusted) },
    ], adjusted);
  }
  if (slug === 'paint') {
    const wallAreaM2 = 2 * (toM(v.length, unit) + toM(v.width, unit)) * toM(v.height, unit);
    const openingM2 = areaToM2(v.openings, unit);
    const paintAreaM2 = Math.max(0, wallAreaM2 - openingM2);
    const coverageM2 = unit === 'imperial' ? v.coverage * 0.092903 : v.coverage;
    const containers = (paintAreaM2 * v.coats) / coverageM2;
    const rounded = Math.ceil(containers);
    return safeResult(`${format(rounded, 0)} ${unit === 'imperial' ? 'gallons' : 'litres'}`, `${area(paintAreaM2)} of wall surface after openings, across ${format(v.coats, 0)} coats.`, [
      { label: 'Wall area', value: area(wallAreaM2) },
      { label: 'Paintable area', value: area(paintAreaM2) },
      { label: 'Unrounded quantity', value: format(containers) },
      { label: 'Buy', value: `${format(rounded, 0)} ${unit === 'imperial' ? 'gallons' : 'litres'}` },
    ], rounded);
  }
  if (slug === 'tile') {
    const surfaceM2 = toM(v.length, unit) * toM(v.width, unit);
    const tileM2 = smallToM(v.tileLength, unit) * smallToM(v.tileWidth, unit);
    const tiles = Math.ceil((surfaceM2 * wasteMultiplier) / tileM2);
    return safeResult(`${format(tiles, 0)} tiles`, `${area(surfaceM2)} of surface with ${format(v.waste)}% cutting allowance.`, [
      { label: 'Surface area', value: area(surfaceM2) },
      { label: 'One tile', value: area(tileM2) },
      { label: 'Buy', value: `${format(tiles, 0)} whole tiles` },
    ], tiles);
  }
  if (slug === 'flooring') {
    const netM2 = toM(v.length, unit) * toM(v.width, unit) * v.count;
    const purchaseM2 = netM2 * wasteMultiplier;
    return safeResult(area(purchaseM2), `${area(netM2)} net floor area across ${format(v.count, 0)} room${v.count === 1 ? '' : 's'}.`, [
      { label: 'Net floor area', value: area(netM2) },
      { label: 'Waste allowance', value: area(purchaseM2 - netM2) },
      { label: 'Purchase area', value: area(purchaseM2) },
    ], purchaseM2);
  }
  if (slug === 'gravel') {
    const m3 = baseVolume * wasteMultiplier;
    const tonnes = unit === 'imperial' ? yd3FromM3(m3) * v.density : (m3 * v.density) / 1000;
    const cost = tonnes * v.price;
    return safeResult(`${format(tonnes)} ${unit === 'imperial' ? 'tons' : 'tonnes'}`, `${outputVolume(m3)} of gravel at the supplied bulk density.`, [
      { label: 'Order volume', value: outputVolume(m3) },
      { label: 'Estimated weight', value: `${format(tonnes)} ${unit === 'imperial' ? 'tons' : 'tonnes'}` },
      { label: 'Material estimate', value: formatCurrency(cost, currency) },
    ], tonnes);
  }
  if (slug === 'mulch') {
    const m3 = baseVolume * wasteMultiplier;
    const bagM3 = unit === 'imperial' ? v.bagSize * 0.0283168466 : v.bagSize / 1000;
    const bags = Math.ceil(m3 / bagM3);
    return safeResult(`${format(bags, 0)} bags`, `${outputVolume(m3)} of mulch at the entered depth, or about ${format(bags, 0)} bags.`, [
      { label: 'Order volume', value: outputVolume(m3) },
      { label: 'Bag size', value: `${format(v.bagSize)} ${unit === 'imperial' ? 'ft³' : 'L'}` },
      { label: 'Buy', value: `${format(bags, 0)} whole bags` },
    ], bags);
  }
  if (slug === 'roof-pitch') {
    const ratio = v.rise / v.run;
    const angle = Math.atan(ratio) * 180 / Math.PI;
    const multiplier = Math.sqrt(1 + ratio ** 2);
    return safeResult(`${format(ratio * 12, 2)}:12`, `${format(angle, 1)}° roof angle with a ${format(multiplier, 3)} slope multiplier.`, [
      { label: 'Pitch', value: `${format(ratio * 12, 2)}:12` },
      { label: 'Angle', value: `${format(angle, 1)}°` },
      { label: 'Surface multiplier', value: format(multiplier, 3) },
    ], ratio);
  }
  if (slug === 'roofing-material') {
    const planM2 = toM(v.length, unit) * toM(v.width, unit);
    const ratio = v.rise / v.run;
    const slopedM2 = planM2 * Math.sqrt(1 + ratio ** 2) * wasteMultiplier;
    const roofFt2 = ft2FromM2(slopedM2);
    const squares = roofFt2 / 100;
    const bundles = Math.ceil(squares * 3);
    return safeResult(`${format(squares)} roofing squares`, `${format(roofFt2)} ft² of sloped roof area including ${format(v.waste)}% waste.`, [
      { label: 'Plan area', value: area(planM2) },
      { label: 'Sloped purchase area', value: `${format(roofFt2)} ft²` },
      { label: 'Shingle bundles', value: `${format(bundles, 0)} at three bundles per square` },
    ], squares);
  }
  if (slug === 'stair') {
    const totalRise = smallToM(v.totalRise, unit);
    const maxRiser = smallToM(v.maxRiser, unit);
    const minTread = smallToM(v.minTread, unit);
    const risers = Math.ceil(totalRise / maxRiser);
    const actualRiser = totalRise / risers;
    const treads = Math.max(1, risers - 1);
    const totalRun = treads * minTread;
    const show = (metres: number) => unit === 'imperial' ? `${format(metres / 0.0254)} in` : `${format(metres * 100)} cm`;
    return safeResult(`${format(risers, 0)} risers`, `${show(actualRiser)} actual riser and ${show(totalRun)} total run using ${format(treads, 0)} treads.`, [
      { label: 'Risers', value: format(risers, 0) },
      { label: 'Actual riser height', value: show(actualRiser) },
      { label: 'Treads', value: format(treads, 0) },
      { label: 'Total run', value: show(totalRun) },
    ], risers);
  }
  if (slug === 'board-foot') {
    const cubicMetres = unit === 'imperial'
      ? (v.thickness * v.width * v.length * v.count * 0.0254 * 0.0254 * 0.3048)
      : (v.thickness / 1000) * (v.width / 1000) * v.length * v.count;
    const boardFeet = cubicMetres * 423.776;
    return safeResult(`${format(boardFeet)} board feet`, `${format(cubicMetres, 3)} m³ of lumber across ${format(v.count, 0)} boards.`, [
      { label: 'Quantity', value: `${format(v.count, 0)} boards` },
      { label: 'Volume', value: `${format(cubicMetres, 3)} m³` },
      { label: 'Board feet', value: format(boardFeet) },
    ], boardFeet);
  }
  if (slug === 'deck-material') {
    const deckLength = toM(v.length, unit);
    const deckWidth = toM(v.width, unit);
    const boardWidth = unit === 'imperial' ? v.boardWidth * 0.0254 : v.boardWidth / 1000;
    const gap = unit === 'imperial' ? v.gap * 0.0254 : v.gap / 1000;
    const stockLength = toM(v.boardLength, unit);
    const across = Math.ceil(deckWidth / (boardWidth + gap));
    const perRow = Math.ceil(deckLength / stockLength);
    const boards = Math.ceil(across * perRow * wasteMultiplier);
    return safeResult(`${format(boards, 0)} deck boards`, `${across} boards across and ${perRow} stock board${perRow === 1 ? '' : 's'} per row, including waste.`, [
      { label: 'Deck area', value: area(deckLength * deckWidth) },
      { label: 'Boards across', value: format(across, 0) },
      { label: 'Stock boards per row', value: format(perRow, 0) },
      { label: 'Buy', value: `${format(boards, 0)} boards` },
    ], boards);
  }
  if (slug === 'fence-material') {
    const length = toM(v.length, unit);
    const spacing = toM(v.postSpacing, unit);
    const picketWidth = unit === 'imperial' ? v.picketWidth * 0.0254 : v.picketWidth / 1000;
    const gap = unit === 'imperial' ? v.gap * 0.0254 : v.gap / 1000;
    const sections = Math.ceil(length / spacing);
    const posts = sections + 1 + (2 * v.gates);
    const pickets = Math.ceil(length / (picketWidth + gap));
    const rails = sections * v.rails;
    return safeResult(`${format(posts, 0)} posts`, `${format(pickets, 0)} pickets and ${format(rails, 0)} rails for ${format(sections, 0)} fence sections.`, [
      { label: 'Sections', value: format(sections, 0) },
      { label: 'Posts', value: format(posts, 0) },
      { label: 'Pickets', value: format(pickets, 0) },
      { label: 'Rails', value: format(rails, 0) },
    ], posts);
  }
  if (slug === 'drywall') {
    const wallArea = 2 * (toM(v.length, unit) + toM(v.width, unit)) * toM(v.height, unit);
    const ceilingArea = toM(v.length, unit) * toM(v.width, unit);
    const openings = areaToM2(v.openings, unit);
    const netArea = Math.max(0, wallArea + ceilingArea - openings);
    const sheetArea = toM(v.sheetLength, unit) * toM(v.sheetWidth, unit);
    const sheets = Math.ceil((netArea * wasteMultiplier) / sheetArea);
    return safeResult(`${format(sheets, 0)} sheets`, `${area(netArea)} of wall and ceiling surface with ${format(v.waste)}% cutting waste.`, [
      { label: 'Wall area', value: area(wallArea) },
      { label: 'Ceiling area', value: area(ceilingArea) },
      { label: 'Net board area', value: area(netArea) },
      { label: 'Buy', value: `${format(sheets, 0)} sheets` },
    ], sheets);
  }
  if (slug === 'brick') {
    const wallArea = toM(v.length, unit) * toM(v.height, unit);
    const openings = areaToM2(v.openings, unit);
    const brickLength = smallToM(v.brickLength, unit);
    const brickHeight = smallToM(v.brickHeight, unit);
    const joint = smallToM(v.joint, unit);
    const moduleArea = (brickLength + joint) * (brickHeight + joint);
    const bricks = Math.ceil(Math.max(0, wallArea - openings) / moduleArea * wasteMultiplier);
    return safeResult(`${format(bricks, 0)} bricks`, `${area(Math.max(0, wallArea - openings))} of wall face using the entered brick module and waste.`, [
      { label: 'Net wall area', value: area(Math.max(0, wallArea - openings)) },
      { label: 'Brick module', value: area(moduleArea) },
      { label: 'Breakage allowance', value: `${format(v.waste)}%` },
      { label: 'Buy', value: `${format(bricks, 0)} bricks` },
    ], bricks);
  }
  return errorResult('This construction calculator is not configured yet.');
}

export function getConstructionTool(slug?: string) {
  return slug ? bySlug.get(slug) : undefined;
}

export function constructionDefaults(slug: string, unit: UnitSystem): Record<string, string> {
  const tool = getConstructionTool(slug);
  if (!tool) return {};
  return Object.fromEntries(tool.fields.map((item) => [item.key, unit === 'imperial' ? item.imperialDefault : item.metricDefault]));
}

export function calculateConstruction(slug: string, rawValues: Record<string, string | number>, unit: UnitSystem, currency: CurrencyCode = 'USD'): ConstructionResult {
  const tool = getConstructionTool(slug);
  if (!tool) return errorResult('Unknown construction calculator.');
  const values: Record<string, number> = {};
  const hardened = hardenedConcreteSlugs.has(slug);
  for (const item of tool.fields) {
    const raw = rawValues[item.key];
    if (hardened && (raw === undefined || (typeof raw === 'string' && raw.trim() === ''))) {
      return errorResult(`${item.label} is required.`);
    }
    const parsed = typeof raw === 'number' ? raw : Number(raw);
    if (hardened && !Number.isFinite(parsed)) return errorResult(`${item.label} must be a finite number.`);
    if (hardened && parsed < 0) return errorResult(`${item.label} cannot be negative.`);
    if (!Number.isFinite(parsed) || parsed < 0 || (!item.allowZero && parsed === 0)) return errorResult(`${item.label} must be greater than zero.`);
    if (hardened) {
      const footingLength = slug === 'concrete-footing';
      const lengthLimit = footingLength
        ? (unit === 'imperial' ? 10000 : 3000)
        : (unit === 'imperial' ? 2000 : 600);
      if (item.key === 'length' && parsed > lengthLimit) {
        return errorResult(`${item.label} must be ${format(lengthLimit, 0)} ${unit === 'imperial' ? 'ft' : 'm'} or less.`);
      }
      const selectedUnit = unit === 'imperial' ? item.imperialUnit : item.metricUnit;
      const isFootingWidth = slug === 'concrete-footing' && item.key === 'width';
      const dimensionLimit = item.key === 'depth'
        ? (unit === 'imperial' ? 120 : 300)
        : isFootingWidth
          ? (unit === 'imperial' ? 240 : 600)
          : (unit === 'imperial' ? 2000 : 600);
      if ((item.key === 'width' || item.key === 'depth') && parsed > dimensionLimit) {
        return errorResult(`${item.label} must be ${format(dimensionLimit, 0)} ${selectedUnit} or less.`);
      }
      if (item.key === 'waste' && parsed > 100) return errorResult('Waste allowance must be 100% or less.');
      if (item.key === 'bagYield' && parsed > (unit === 'imperial' ? 10 : 300)) {
        return errorResult(`Yield per bag must be ${unit === 'imperial' ? '10 ft³' : '300 L'} or less.`);
      }
      if (item.key === 'count' && (!Number.isInteger(parsed) || parsed > 1000)) {
        return errorResult('Number of footings must be a whole number no greater than 1,000.');
      }
      if (item.key === 'price' && parsed > 10000) return errorResult('Concrete price must be 10,000 or less.');
    }
    values[item.key] = parsed;
  }
  return calculateFormula(slug, values, unit, currency);
}