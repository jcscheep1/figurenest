import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

export const currencyCodes = ['EUR', 'USD', 'GBP', 'ZAR'] as const;
export type CurrencyCode = typeof currencyCodes[number];
export type MeasurementSystem = 'metric' | 'imperial';

export const currencies: Record<CurrencyCode, { label: string; symbol: string; locale: string }> = {
  EUR: { label: 'Euro', symbol: '€', locale: 'de-DE' },
  USD: { label: 'US Dollar', symbol: '$', locale: 'en-US' },
  GBP: { label: 'British Pound', symbol: '£', locale: 'en-GB' },
  ZAR: { label: 'South African Rand', symbol: 'R', locale: 'en-ZA' },
};

export const isCurrencyCode = (value: unknown): value is CurrencyCode =>
  typeof value === 'string' && (currencyCodes as readonly string[]).includes(value);
export const isMeasurementSystem = (value: unknown): value is MeasurementSystem =>
  value === 'metric' || value === 'imperial';

/** Formats the supplied denomination only; values are deliberately never exchange-rate converted. */
export function formatCurrency(value: number, currency: CurrencyCode = 'USD', options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(currencies[currency].locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}
export const currencyPrefix = (currency: CurrencyCode = 'USD') => currencies[currency].symbol;
export const currencyRateLabel = (currency: CurrencyCode = 'USD', per = '') =>
  `${currencies[currency].symbol}${per ? `/${per}` : ''}`;
export const currencySymbol = currencyPrefix;
export function localizeCurrencyText(text: string, currency: CurrencyCode = 'USD'): string {
  return text
    .replace(/\$(\d[\d,]*(?:\.\d+)?)/g, (_, amount: string) => (
      formatCurrency(Number(amount.replaceAll(',', '')), currency)
    ))
    .replaceAll('US dollars', currencies[currency].label)
    .replaceAll('USD', currency)
    .replace(/\$(?=\/)/g, currencies[currency].symbol);
}

export type UnitDimension = 'length' | 'area' | 'volume' | 'liquid' | 'mass' | 'temperature' | 'speed' | 'energy' | 'power' | 'fuel-economy';
export type UnitDefinition = {
  label: string;
  symbol: string;
  dimension: UnitDimension;
  /** Converts to the dimension's canonical unit. */
  toCanonical: (value: number) => number;
  fromCanonical: (value: number) => number;
};

const linear = (label: string, symbol: string, dimension: UnitDimension, factor: number): UnitDefinition => ({
  label, symbol, dimension, toCanonical: value => value * factor, fromCanonical: value => value / factor,
});
const reciprocal = (label: string, symbol: string, factor: number): UnitDefinition => ({
  label, symbol, dimension: 'fuel-economy', toCanonical: value => factor / value, fromCanonical: value => factor / value,
});

/** Canonical units: m, m², m³, L, g, °C, km/h, Wh, W, and L/100 km. */
export const unitRegistry = {
  mm: linear('Millimetres', 'mm', 'length', 0.001), cm: linear('Centimetres', 'cm', 'length', 0.01),
  m: linear('Metres', 'm', 'length', 1), km: linear('Kilometres', 'km', 'length', 1000),
  in: linear('Inches', 'in', 'length', 0.0254), ft: linear('Feet', 'ft', 'length', 0.3048),
  yd: linear('Yards', 'yd', 'length', 0.9144), mi: linear('Miles', 'mi', 'length', 1609.344),
  mm2: linear('Square millimetres', 'mm²', 'area', 1e-6), cm2: linear('Square centimetres', 'cm²', 'area', 1e-4),
  m2: linear('Square metres', 'm²', 'area', 1), km2: linear('Square kilometres', 'km²', 'area', 1e6),
  in2: linear('Square inches', 'in²', 'area', 0.00064516), ft2: linear('Square feet', 'ft²', 'area', 0.09290304),
  yd2: linear('Square yards', 'yd²', 'area', 0.83612736), mi2: linear('Square miles', 'mi²', 'area', 2589988.110336),
  mm3: linear('Cubic millimetres', 'mm³', 'volume', 1e-9), cm3: linear('Cubic centimetres', 'cm³', 'volume', 1e-6),
  m3: linear('Cubic metres', 'm³', 'volume', 1), km3: linear('Cubic kilometres', 'km³', 'volume', 1e9),
  in3: linear('Cubic inches', 'in³', 'volume', 0.000016387064), ft3: linear('Cubic feet', 'ft³', 'volume', 0.028316846592),
  yd3: linear('Cubic yards', 'yd³', 'volume', 0.764554857984), mi3: linear('Cubic miles', 'mi³', 'volume', 4168181825.44058),
  ml: linear('Millilitres', 'mL', 'liquid', 0.001), l: linear('Litres', 'L', 'liquid', 1),
  usFloz: linear('US fluid ounces', 'US fl oz', 'liquid', 0.0295735295625), usGal: linear('US gallons', 'US gal', 'liquid', 3.785411784),
  impFloz: linear('Imperial fluid ounces', 'imp fl oz', 'liquid', 0.0284130625), impGal: linear('Imperial gallons', 'imp gal', 'liquid', 4.54609),
  pt: linear('US pints', 'pt', 'liquid', 0.473176473), qt: linear('US quarts', 'qt', 'liquid', 0.946352946),
  g: linear('Grams', 'g', 'mass', 1), kg: linear('Kilograms', 'kg', 'mass', 1000), tonne: linear('Tonnes', 't', 'mass', 1e6),
  oz: linear('Ounces', 'oz', 'mass', 28.349523125), lb: linear('Pounds', 'lb', 'mass', 453.59237), usTon: linear('US tons', 'US ton', 'mass', 907184.74),
  celsius: { label: 'Celsius', symbol: '°C', dimension: 'temperature' as const, toCanonical: (v: number) => v, fromCanonical: (v: number) => v },
  fahrenheit: { label: 'Fahrenheit', symbol: '°F', dimension: 'temperature' as const, toCanonical: (v: number) => (v - 32) * 5 / 9, fromCanonical: (v: number) => v * 9 / 5 + 32 },
  kelvin: { label: 'Kelvin', symbol: 'K', dimension: 'temperature' as const, toCanonical: (v: number) => v - 273.15, fromCanonical: (v: number) => v + 273.15 },
  kph: linear('Kilometres per hour', 'km/h', 'speed', 1), mph: linear('Miles per hour', 'mph', 'speed', 1.609344),
  knot: linear('Knots', 'kn', 'speed', 1.852), mps: linear('Metres per second', 'm/s', 'speed', 3.6),
  wh: linear('Watt-hours', 'Wh', 'energy', 1), kwh: linear('Kilowatt-hours', 'kWh', 'energy', 1000), mj: linear('Megajoules', 'MJ', 'energy', 277.77777777777777), j: linear('Joules', 'J', 'energy', 1 / 3600),
  w: linear('Watts', 'W', 'power', 1), kw: linear('Kilowatts', 'kW', 'power', 1000), mw: linear('Megawatts', 'MW', 'power', 1e6), hp: linear('Horsepower', 'hp', 'power', 745.6998715822702),
  usMpg: reciprocal('US MPG', 'US mpg', 235.214583), imperialMpg: reciprocal('Imperial MPG', 'imp mpg', 282.480936), l100km: linear('Litres per 100 km', 'L/100 km', 'fuel-economy', 1), kml: reciprocal('Kilometres per litre', 'km/L', 100),
} satisfies Record<string, UnitDefinition>;
export type UnitKey = keyof typeof unitRegistry;

export type ConverterUnitPair = { from: UnitKey; to: UnitKey };
export const converterUnitPairs: Record<UnitDimension, Record<MeasurementSystem, ConverterUnitPair>> = {
  length: { metric: { from: 'm', to: 'ft' }, imperial: { from: 'ft', to: 'm' } },
  area: { metric: { from: 'm2', to: 'ft2' }, imperial: { from: 'ft2', to: 'm2' } },
  volume: { metric: { from: 'm3', to: 'ft3' }, imperial: { from: 'ft3', to: 'm3' } },
  liquid: { metric: { from: 'l', to: 'usGal' }, imperial: { from: 'usGal', to: 'l' } },
  mass: { metric: { from: 'kg', to: 'lb' }, imperial: { from: 'lb', to: 'kg' } },
  temperature: { metric: { from: 'celsius', to: 'fahrenheit' }, imperial: { from: 'fahrenheit', to: 'celsius' } },
  speed: { metric: { from: 'kph', to: 'mph' }, imperial: { from: 'mph', to: 'kph' } },
  energy: { metric: { from: 'kwh', to: 'mj' }, imperial: { from: 'mj', to: 'kwh' } },
  power: { metric: { from: 'kw', to: 'hp' }, imperial: { from: 'hp', to: 'kw' } },
  'fuel-economy': { metric: { from: 'l100km', to: 'usMpg' }, imperial: { from: 'usMpg', to: 'l100km' } },
};

export function convertToCanonical(value: number, unit: UnitKey): number {
  return unitRegistry[unit].toCanonical(value);
}
export function convertFromCanonical(value: number, unit: UnitKey): number {
  return unitRegistry[unit].fromCanonical(value);
}
export function isTemperatureBelowAbsoluteZero(value: number, unit: UnitKey): boolean {
  if (!Number.isFinite(value)) return false;
  if (unit === 'celsius') return value < -273.15;
  if (unit === 'fahrenheit') return value < -459.67;
  if (unit === 'kelvin') return value < 0;
  return false;
}
/** Pure conversion without display rounding; conversion is rejected across dimensions. */
export function convertUnitValue(value: number, from: UnitKey, to: UnitKey): number {
  if (!Number.isFinite(value)) return Number.NaN;
  const fromDefinition = unitRegistry[from];
  const toDefinition = unitRegistry[to];
  if (!fromDefinition || !toDefinition || fromDefinition.dimension !== toDefinition.dimension) return Number.NaN;
  const canonical = fromDefinition.toCanonical(value);
  const converted = toDefinition.fromCanonical(canonical);
  return Number.isFinite(converted) ? converted : Number.NaN;
}
/** Formats converted values for editable inputs without changing the full-precision quantity used by calculations. */
export function formatConvertedInput(
  value: number,
  options: number | { significantDigits?: number; maximumFractionDigits?: number } = {},
): string {
  if (!Number.isFinite(value)) return '';
  if (Object.is(value, -0) || value === 0) return '0';
  const significantDigits = typeof options === 'number' ? options : options.significantDigits ?? 6;
  const maximumFractionDigits = typeof options === 'number' ? 12 : options.maximumFractionDigits ?? 6;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const fractionDigits = Math.max(0, Math.min(maximumFractionDigits, significantDigits - magnitude - 1));
  const rounded = Number(value.toFixed(fractionDigits));
  return Object.is(rounded, -0) ? '0' : rounded.toLocaleString('en-US', {
    useGrouping: false,
    maximumFractionDigits,
  });
}
export const toCanonical = convertToCanonical;
export const fromCanonical = convertFromCanonical;
export const convertValue = convertUnitValue;

export type ToolApplicability = { monetary: boolean; dimensions: readonly UnitDimension[]; unitless?: boolean };
const monetary = (): ToolApplicability => ({ monetary: true, dimensions: [] });
const unitless = (): ToolApplicability => ({ monetary: false, dimensions: [], unitless: true });
const measured = (...dimensions: UnitDimension[]): ToolApplicability => ({ monetary: false, dimensions });
/** Explicit classification for every currently published calculator/converter slug. */
export const toolApplicability: Record<string, ToolApplicability> = {
  'pdf-sign-edit': unitless(), 'pdf-to-image': unitless(), 'image-to-pdf': unitless(), 'pdf-to-text': unitless(), 'docx-to-pdf': unitless(), 'pdf-to-docx': unitless(),
  percentage: unitless(), 'percentage-increase-decrease': unitless(), 'compound-interest': monetary(), loan: monetary(), mortgage: monetary(), 'auto-loan': monetary(), 'interest-rate': monetary(), 'mortgage-amortization': monetary(), 'mortgage-payoff': monetary(), 'simple-interest': monetary(), savings: monetary(), roi: monetary(), 'profit-margin': monetary(), markup: monetary(), 'break-even': monetary(), roas: monetary(), 'conversion-rate': unitless(), cpc: monetary(), cpm: monetary(), 'customer-acquisition-cost': monetary(), vat: monetary(), salary: monetary(), overtime: monetary(),
  'fuel-cost': { monetary: true, dimensions: ['length', 'fuel-economy', 'liquid'] }, 'fuel-economy': measured('fuel-economy'), 'ev-charging-cost': { monetary: true, dimensions: ['energy'] }, 'ev-charging-time': measured('energy', 'power'),
  area: measured('area'), volume: measured('volume'), age: unitless(), 'date-difference': unitless(), 'working-days': unitless(), unit: measured('length', 'mass', 'temperature', 'speed', 'area', 'volume', 'liquid', 'energy', 'power', 'fuel-economy'), length: measured('length'), weight: measured('mass'), temperature: measured('temperature'), speed: measured('speed'), power: measured('power'), 'dpi-ppi': measured('length'), 'pixels-to-cm': measured('length'), 'image-scaling': unitless(),
  concrete: measured('length', 'volume'), paint: measured('area', 'liquid'), tile: measured('area'), flooring: measured('area'), 'concrete-slab': measured('length', 'volume'), 'concrete-bag': measured('volume'), 'concrete-footing': measured('length', 'volume'), 'concrete-cost': { monetary: true, dimensions: ['length', 'volume'] }, 'cubic-yard': measured('length', 'volume'), 'square-footage': measured('area'), gravel: { monetary: true, dimensions: ['length', 'volume', 'mass'] }, mulch: measured('length', 'volume'), 'roof-pitch': measured('length'), 'roofing-material': measured('area'), stair: measured('length'), 'board-foot': measured('length', 'volume'), 'deck-material': measured('length', 'area'), 'fence-material': measured('length'), drywall: measured('length', 'area'), brick: measured('length', 'area'),
  bmr: unitless(), currency: unitless(), gpa: unitless(), grade: unitless(), 'marriage-tax': unitless(), 'gas-mileage': unitless(), tip: unitless(),
  'boat-loan': unitless(), 'business-loan': unitless(), 'canadian-mortgage': unitless(), 'cash-back-or-low-interest': unitless(), discount: unitless(), 'estate-tax': unitless(), 'fha-loan': unitless(), 'home-equity-loan': unitless(), interest: unitless(), investment: unitless(), 'uk-mortgage': unitless(), 'personal-loan': unitless(), retirement: unitless(), 'sales-tax': unitless(), 'student-loan': unitless(), tax: unitless(), 'va-mortgage': unitless(),
  'anorexic-bmi': unitless(), 'army-body-fat': unitless(), bmi: unitless(), 'body-fat': unitless(), calorie: unitless(), 'calories-burned': unitless(), 'due-date': unitless(), pace: unitless(), pregnancy: unitless(), 'pregnancy-conception': unitless(), 'pregnancy-weight-gain': unitless(), sleep: unitless(),
  btu: measured('area', 'power'), average: unitless(), 'average-return': unitless(), fraction: unitless(), 'percent-error': unitless(), 'percent-off': monetary(), scientific: unitless(), 'scientific-notation': unitless(), 'time-duration': unitless(), 'voltage-drop': measured('length', 'power'), 'day-of-week': unitless(), hours: unitless(), time: unitless(), 'time-card': monetary(), 'time-zone': unitless(),
  bandwidth: unitless(), base64: unitless(), electricity: { monetary: true, dimensions: ['energy', 'power'] }, 'ip-subnet': unitless(), 'ohms-law': measured('power'), 'cable-fuse-size': measured('length'), 'password-generator': unitless(), resistor: unitless(), 'url-encode-decode': unitless(), density: measured('mass', 'volume'), 'dew-point': measured('temperature'), horsepower: measured('power'), 'heat-index': measured('temperature'), mass: measured('mass', 'volume'), molarity: measured('liquid'), 'speed-calculator': measured('length', 'speed'), 'wind-chill': measured('temperature', 'speed'),
  binary: unitless(), circle: unitless(), 'greatest-common-factor': unitless(), 'confidence-interval': unitless(), exponent: unitless(), 'prime-factorization': unitless(), 'half-life': unitless(), hex: unitless(), 'least-common-multiple': unitless(), log: unitless(), 'long-division': unitless(), matrix: unitless(), 'mean-median-mode-range': unitless(), 'number-sequence': unitless(), 'permutation-combination': unitless(), probability: unitless(), 'big-number': unitless(), distance: unitless(),
  bac: unitless(), 'body-surface-area': unitless(), gfr: unitless(), 'ideal-weight': unitless(), 'lean-body-mass': unitless(), macro: unitless(), 'molecular-weight': unitless(), 'target-heart-rate': unitless(), tdee: unitless(),
  mileage: unitless(), 'roman-numeral': unitless(), 'shoe-size': unitless(), 'social-security': unitless(), 'take-home-pay': unitless(), 'tire-size': unitless(), '401k': unitless(), annuity: unitless(), apr: unitless(), 'auto-lease': unitless(), bond: unitless(), budget: unitless(), commission: unitless(), 'credit-card': unitless(), 'debt-consolidation': unitless(),
};

export const PREFERENCES_STORAGE_KEY = 'figurenest-units-preferences-v1';
export type UnitsPreferences = { currency: CurrencyCode; measurementSystem: MeasurementSystem; calculatorOverrides: Record<string, Partial<{ currency: CurrencyCode; measurementSystem: MeasurementSystem }>> };
export const defaultUnitsPreferences: UnitsPreferences = { currency: 'USD', measurementSystem: 'metric', calculatorOverrides: {} };
export function validateUnitsPreferences(value: unknown): UnitsPreferences {
  if (!value || typeof value !== 'object') return defaultUnitsPreferences;
  const raw = value as Partial<UnitsPreferences>;
  const overrides: UnitsPreferences['calculatorOverrides'] = {};
  if (raw.calculatorOverrides && typeof raw.calculatorOverrides === 'object') {
    for (const [slug, override] of Object.entries(raw.calculatorOverrides)) {
      if (!override || typeof override !== 'object') continue;
      const item = override as { currency?: unknown; measurementSystem?: unknown };
      const validated: UnitsPreferences['calculatorOverrides'][string] = {};
      if (isCurrencyCode(item.currency)) validated.currency = item.currency;
      if (isMeasurementSystem(item.measurementSystem)) validated.measurementSystem = item.measurementSystem;
      if (Object.keys(validated).length) overrides[slug] = validated;
    }
  }
  return { currency: isCurrencyCode(raw.currency) ? raw.currency : 'USD', measurementSystem: isMeasurementSystem(raw.measurementSystem) ? raw.measurementSystem : 'metric', calculatorOverrides: overrides };
}
export function loadUnitsPreferences(): UnitsPreferences {
  if (typeof window === 'undefined') return defaultUnitsPreferences;
  try { return validateUnitsPreferences(JSON.parse(window.localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? 'null')); } catch { return defaultUnitsPreferences; }
}
export function saveUnitsPreferences(preferences: UnitsPreferences): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(validateUnitsPreferences(preferences))); } catch { /* storage may be unavailable */ }
}
export function useUnitsPreferences() {
  const [preferences, setPreferences] = useState<UnitsPreferences>(defaultUnitsPreferences);
  const useHydrationEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
  useHydrationEffect(() => setPreferences(loadUnitsPreferences()), []);
  const update = useCallback((next: UnitsPreferences | ((previous: UnitsPreferences) => UnitsPreferences)) => {
    setPreferences(previous => { const validated = validateUnitsPreferences(typeof next === 'function' ? next(previous) : next); saveUnitsPreferences(validated); return validated; });
  }, []);
  const setCurrency = useCallback((currency: CurrencyCode) => update(previous => ({ ...previous, currency })), [update]);
  const setMeasurementSystem = useCallback((measurementSystem: MeasurementSystem) => update(previous => ({ ...previous, measurementSystem })), [update]);
  const setCalculatorOverride = useCallback((slug: string, override: UnitsPreferences['calculatorOverrides'][string]) => update(previous => ({ ...previous, calculatorOverrides: { ...previous.calculatorOverrides, [slug]: override } })), [update]);
  const forCalculator = useCallback((slug: string) => ({ ...preferences, ...preferences.calculatorOverrides[slug] }), [preferences]);
  return { preferences, setCurrency, setMeasurementSystem, setCalculatorOverride, forCalculator };
}