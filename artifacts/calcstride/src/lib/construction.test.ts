import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateConstruction, constructionDefaults, constructionTools, convertConstructionFieldValue, formatConstructionConvertedInput, type ConstructionField } from './construction';

const assertDisplaySafe = (primary: string, summary: string) => {
  assert.doesNotMatch(`${primary} ${summary}`, /NaN|Infinity/i);
};

const convertImperialValue = (field: ConstructionField, value: number) => {
  if (field.imperialUnit === field.metricUnit || field.imperialUnit === '%' || field.imperialUnit === 'pieces' || field.imperialUnit === 'areas' || field.imperialUnit === 'rooms' || field.imperialUnit === 'coats' || field.imperialUnit === 'boards' || field.imperialUnit === 'rails' || field.imperialUnit === 'gates') return value;
  if (field.imperialUnit === 'ft' && field.metricUnit === 'm') return value * 0.3048;
  if (field.imperialUnit === 'in' && field.metricUnit === 'cm') return value * 2.54;
  if (field.imperialUnit === 'in' && field.metricUnit === 'mm') return value * 25.4;
  if (field.imperialUnit === 'ft²' && field.metricUnit === 'm²') return value * 0.092903;
  if (field.imperialUnit === 'ft³' && field.metricUnit === 'L') return value * 28.3168466;
  if (field.imperialUnit === '$ / yd³') return value * 1.30795062;
  if (field.imperialUnit === 'ft² / gal') return value * 0.0245424;
  if (field.imperialUnit === 'tons / yd³') return value * 1186.55284;
  if (field.imperialUnit === '$ / ton') return value * 1.10231131;
  throw new Error(`Missing test conversion for ${field.imperialUnit} to ${field.metricUnit}`);
};

for (const tool of constructionTools) {
  test(`${tool.name}: normal imperial inputs`, () => {
    const result = calculateConstruction(tool.slug, constructionDefaults(tool.slug, 'imperial'), 'imperial');
    assert.equal(result.error, undefined);
    assert.ok(Number.isFinite(result.raw));
    assert.ok(result.breakdown.length >= 2);
    assertDisplaySafe(result.primary, result.summary);
  });

  test(`${tool.name}: decimal inputs`, () => {
    const values = constructionDefaults(tool.slug, 'imperial');
    const first = tool.fields[0];
    values[first.key] = String(Number(values[first.key]) + 0.375);
    const result = calculateConstruction(tool.slug, values, 'imperial');
    assert.equal(result.error, undefined);
    assert.ok(Number.isFinite(result.raw));
    assertDisplaySafe(result.primary, result.summary);
  });

  test(`${tool.name}: zero required input`, () => {
    const values = constructionDefaults(tool.slug, 'imperial');
    const required = tool.fields.find((field) => !field.allowZero);
    assert.ok(required);
    values[required.key] = '0';
    const result = calculateConstruction(tool.slug, values, 'imperial');
    assert.ok(result.error);
    assertDisplaySafe(result.primary, result.summary);
  });

  test(`${tool.name}: invalid input`, () => {
    const values = constructionDefaults(tool.slug, 'imperial');
    values[tool.fields[0].key] = 'not-a-number';
    const result = calculateConstruction(tool.slug, values, 'imperial');
    assert.ok(result.error);
    assertDisplaySafe(result.primary, result.summary);
  });

  test(`${tool.name}: extreme input remains display-safe`, () => {
    const values = constructionDefaults(tool.slug, 'imperial');
    values[tool.fields[0].key] = '1e15';
    const result = calculateConstruction(tool.slug, values, 'imperial');
    assertDisplaySafe(result.primary, result.summary);
    if (!result.error) assert.ok(Number.isFinite(result.raw));
  });

  test(`${tool.name}: metric conversion inputs`, () => {
    const imperial = constructionDefaults(tool.slug, 'imperial');
    const metric = Object.fromEntries(tool.fields.map((field) => [field.key, String(convertImperialValue(field, Number(imperial[field.key])))]));
    const result = calculateConstruction(tool.slug, metric, 'metric');
    assert.equal(result.error, undefined);
    assert.ok(Number.isFinite(result.raw));
    assertDisplaySafe(result.primary, result.summary);
  });
}

test('Concrete Calculator: known 10 ft × 10 ft × 4 in calculation', () => {
  const result = calculateConstruction('concrete', { length: 10, width: 10, depth: 4, waste: 0 }, 'imperial');
  assert.equal(result.error, undefined);
  assert.ok(Math.abs(result.raw * 1.30795062 - 1.2345679) < 0.0001);
});

test('Roof Pitch Calculator: 6:12 pitch', () => {
  const result = calculateConstruction('roof-pitch', { rise: 6, run: 12 }, 'imperial');
  assert.equal(result.primary, '6:12');
  assert.match(result.summary, /26\.6°/);
});

test('Board Foot Calculator: twelve 2 × 8 × 8 boards', () => {
  const result = calculateConstruction('board-foot', { thickness: 2, width: 8, length: 8, count: 12 }, 'imperial');
  assert.ok(Math.abs(result.raw - 128) < 0.001);
});

test('Concrete Bag Calculator: worked example requires twelve bags', () => {
  const result = calculateConstruction('concrete-bag', { length: 4, width: 4, depth: 4, bagYield: 0.5, waste: 10 }, 'imperial');
  assert.equal(result.raw, 12);
});

test('Roofing Material Calculator: worked example yields 13.77 squares', () => {
  const result = calculateConstruction('roofing-material', { length: 40, width: 28, rise: 6, run: 12, waste: 10 }, 'imperial');
  assert.ok(Math.abs(result.raw - 13.7742) < 0.001);
});

test('Drywall Calculator: worked example requires twenty sheets', () => {
  const result = calculateConstruction('drywall', { length: 16, width: 12, height: 8, openings: 60, sheetLength: 8, sheetWidth: 4, waste: 10 }, 'imperial');
  assert.equal(result.raw, 20);
});

test('Brick Calculator: worked example requires 1,124 bricks', () => {
  const result = calculateConstruction('brick', { length: 30, height: 6, brickLength: 8, brickHeight: 2.25, joint: 0.375, openings: 24, waste: 10 }, 'imperial');
  assert.equal(result.raw, 1124);
});

test('construction unit conversions preserve linked dimensions and have negligible toggle drift', () => {
  const metricLength = convertConstructionFieldValue(12, 'ft', 'm');
  const metricWidth = convertConstructionFieldValue(10, 'ft', 'm');
  const metricDepth = convertConstructionFieldValue(4, 'in', 'cm');
  const imperial = calculateConstruction('concrete', { length: 12, width: 10, depth: 4, waste: 10 }, 'imperial');
  const metric = calculateConstruction('concrete', { length: metricLength, width: metricWidth, depth: metricDepth, waste: 10 }, 'metric');
  assert.ok(Math.abs(imperial.raw - metric.raw) < 1e-10);
  let value = 17.2345;
  for (let i = 0; i < 100; i++) value = convertConstructionFieldValue(convertConstructionFieldValue(value, 'ft', 'm'), 'm', 'ft');
  assert.ok(Math.abs(value - 17.2345) < 1e-10);
});

test('construction converts area, cubic, paint liquid, and gravel mass/rates both ways', () => {
  assert.ok(Math.abs(convertConstructionFieldValue(1, 'ft2', 'm2') - 0.09290304) < 1e-10);
  assert.ok(Math.abs(convertConstructionFieldValue(1, 'yd3', 'l') - 764.554857984) < 1e-8);
  assert.ok(Math.abs(convertConstructionFieldValue(1, 'usGal', 'l') - 3.785411784) < 1e-10);
  assert.ok(Math.abs(convertConstructionFieldValue(10, 'm2PerL', 'ft2PerGal') - 407.458) < 0.01);
  assert.ok(Math.abs(convertConstructionFieldValue(1, 'lb', 'kg') - 0.45359237) < 1e-10);
  assert.ok(Math.abs(convertConstructionFieldValue(1, 'tonsPerYd3', 'kgPerM3') - 1186.55284) < 1e-8);
  assert.ok(Math.abs(convertConstructionFieldValue(55, 'perTon', 'perTonne') - 60.62712205) < 1e-8);
});

test('audited construction conversions use practical editable precision', () => {
  assert.equal(formatConstructionConvertedInput(convertConstructionFieldValue(24, 'ft2', 'm2'), 'm2'), '2.23');
  assert.equal(formatConstructionConvertedInput(convertConstructionFieldValue(0.5, 'ft3', 'l'), 'l'), '14.1584');
  assert.equal(formatConstructionConvertedInput(convertConstructionFieldValue(165, 'perYd3', 'perM3'), 'perM3'), '215.81');
  assert.equal(formatConstructionConvertedInput(convertConstructionFieldValue(60, 'ft2', 'm2'), 'm2'), '5.57');
  assert.equal(formatConstructionConvertedInput(convertConstructionFieldValue(2, 'ft3', 'l'), 'l'), '56.6337');
  assert.equal(formatConstructionConvertedInput(convertConstructionFieldValue(1.4, 'tonsPerYd3', 'kgPerM3'), 'kgPerM3'), '1661.17');
  assert.equal(formatConstructionConvertedInput(convertConstructionFieldValue(55, 'perTon', 'perTonne'), 'perTonne'), '60.63');
});