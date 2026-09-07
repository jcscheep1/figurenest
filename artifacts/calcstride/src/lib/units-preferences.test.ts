import assert from 'node:assert/strict';
import test from 'node:test';
import { publishedTools } from './catalog';
import { calculateCore } from './core-calculators';
import {
  converterUnitPairs,
  convertFromCanonical,
  convertToCanonical,
  convertUnitValue,
  formatConvertedInput,
  formatCurrency,
  isTemperatureBelowAbsoluteZero,
  toolApplicability,
  unitRegistry,
  validateUnitsPreferences,
  type UnitKey,
} from './units-preferences';

const closeTo = (actual: number, expected: number, relative = 1e-11) =>
  assert.ok(Math.abs(actual - expected) <= relative * Math.max(1, Math.abs(expected)), `${actual} should be close to ${expected}`);

test('unit registry round-trips every published unit via its canonical value', () => {
  for (const key of Object.keys(unitRegistry) as UnitKey[]) {
    const value = unitRegistry[key].dimension === 'temperature' ? 25 : 12.345;
    const canonical = unitRegistry[key].toCanonical(value);
    closeTo(unitRegistry[key].fromCanonical(canonical), value);
  }
});

test('conversions distinguish US and imperial liquid and fuel-economy units', () => {
  closeTo(convertUnitValue(1, 'usGal', 'l'), 3.785411784);
  closeTo(convertUnitValue(1, 'impGal', 'l'), 4.54609);
  closeTo(convertUnitValue(25, 'usMpg', 'l100km'), 9.40858332);
  closeTo(convertUnitValue(25, 'imperialMpg', 'l100km'), 11.29923744);
  closeTo(convertUnitValue(1, 'tonne', 'usTon'), 1.102311310924388);
});

test('cross-unit conversions are bidirectional without material drift', () => {
  const pairs: [UnitKey, UnitKey][] = [
    ['mm', 'mi'], ['mm2', 'ft2'], ['cm3', 'yd3'], ['ml', 'impFloz'],
    ['g', 'lb'], ['celsius', 'fahrenheit'], ['kph', 'mps'], ['wh', 'mj'],
    ['w', 'hp'], ['usMpg', 'imperialMpg'],
  ];
  for (const [from, to] of pairs) {
    const value = from === 'celsius' ? 37.5 : 12.345;
    closeTo(convertUnitValue(convertUnitValue(value, from, to), to, from), value, 1e-10);
  }
});

test('absolute-zero validation covers below, exact, and above boundaries on every temperature scale', () => {
  const boundaries: Array<{ unit: UnitKey; below: number; exact: number; above: number }> = [
    { unit: 'celsius', below: -273.16, exact: -273.15, above: -273.14 },
    { unit: 'fahrenheit', below: -459.68, exact: -459.67, above: -459.66 },
    { unit: 'kelvin', below: -0.01, exact: 0, above: 0.01 },
  ];

  for (const { unit, below, exact, above } of boundaries) {
    assert.equal(isTemperatureBelowAbsoluteZero(below, unit), true, `${below} ${unit} should be rejected`);
    assert.equal(isTemperatureBelowAbsoluteZero(exact, unit), false, `${exact} ${unit} should be accepted`);
    assert.equal(isTemperatureBelowAbsoluteZero(above, unit), false, `${above} ${unit} should be accepted`);
  }

  closeTo(convertUnitValue(-273.15, 'celsius', 'kelvin'), 0);
  closeTo(convertUnitValue(-459.67, 'fahrenheit', 'celsius'), -273.15);
  closeTo(convertUnitValue(0, 'kelvin', 'fahrenheit'), -459.67);
});

test('measurement systems provide useful cross-system converter pairs without changing represented values', () => {
  for (const [dimension, systems] of Object.entries(converterUnitPairs)) {
    for (const pair of Object.values(systems)) {
      assert.notEqual(pair.from, pair.to, `${dimension} should not use identical units`);
      assert.equal(unitRegistry[pair.from].dimension, dimension);
      assert.equal(unitRegistry[pair.to].dimension, dimension);
    }
    const canonical = convertToCanonical(12.345, systems.metric.from);
    const imperialDisplay = convertFromCanonical(canonical, systems.imperial.from);
    closeTo(convertToCanonical(imperialDisplay, systems.imperial.from), canonical);
  }
});

test('converted input display removes binary artifacts without changing canonical precision', () => {
  assert.equal(formatConvertedInput(4.000000000000001), '4');
  assert.equal(formatConvertedInput(365.76000000000005), '365.76');
  assert.equal(formatConvertedInput(3.6576000000000004), '3.6576');
  assert.equal(formatConvertedInput(349.99999999999994), '350');
  assert.equal(formatConvertedInput(0.3048), '0.3048');
  assert.equal(formatConvertedInput(0.964227991107), '0.964228');
  assert.equal(formatConvertedInput(215.8118523, { maximumFractionDigits: 2 }), '215.81');
  assert.doesNotMatch(formatConvertedInput(123456.7890123), /e[+-]/i);
});

test('currency formatting uses the selected denomination without scaling', () => {
  assert.equal(formatCurrency(1234.5, 'USD'), '$1,234.50');
  assert.match(formatCurrency(1234.5, 'EUR'), /€|EUR/);
  assert.match(formatCurrency(1234.5, 'GBP'), /£|GBP/);
  assert.match(formatCurrency(1234.5, 'ZAR'), /R|ZAR/);
  const usd = calculateCore('vat', ['100', '20']);
  const gbp = calculateCore('vat', ['100', '20'], 'default', { currency: 'GBP' });
  assert.equal(usd.primary, '$120.00');
  assert.match(gbp.primary, /£|GBP/);
});

test('applicability classifies every published tool and validates stored preferences', () => {
  for (const tool of publishedTools) assert.ok(toolApplicability[tool.slug], `missing ${tool.slug}`);
  assert.deepEqual(validateUnitsPreferences({ currency: 'GBP', measurementSystem: 'imperial', calculatorOverrides: { loan: { currency: 'EUR' } } }), {
    currency: 'GBP', measurementSystem: 'imperial', calculatorOverrides: { loan: { currency: 'EUR' } },
  });
  assert.deepEqual(validateUnitsPreferences({ currency: 'CAD', measurementSystem: 'custom', calculatorOverrides: { loan: { currency: 'wat' } } }), {
    currency: 'USD', measurementSystem: 'metric', calculatorOverrides: {},
  });
});