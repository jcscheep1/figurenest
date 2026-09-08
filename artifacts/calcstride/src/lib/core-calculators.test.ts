import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore, convertCore } from './core-calculators';

test('loan handles amortization, totals, and zero interest', () => {
  const financed = calculateCore('loan', ['12000', '0', '1']);
  assert.equal(financed.primary, '$1,000.00');
  assert.equal(financed.details?.[0].value, '$12,000.00');
  const interest = calculateCore('loan', ['12000', '12', '1']);
  assert.equal(interest.primary, '$1,066.19');
  assert.equal(interest.details?.[1].value, '$794.23');
});

test('mortgage includes taxes and insurance while retaining loan totals', () => {
  const result = calculateCore('mortgage', ['120000', '20000', '0', '10', '1200', '2400']);
  assert.equal(result.primary, '$1,133.33');
  assert.equal(result.details?.[0].value, '$833.33');
  assert.equal(result.details?.[2].value, '$0.00');
});

test('finance calculations remain stable at extremely small nonzero rates', () => {
  const loan = calculateCore('loan', ['24000', '0.000000000001', '5']);
  assert.equal(loan.primary, '$400.00');
  assert.equal(loan.details?.[0].value, '$24,000.00');
  assert.equal(loan.details?.[1].value, '$0.00');

  const mortgage = calculateCore('mortgage', ['288000', '0', '0.000000000001', '30', '0', '0']);
  assert.equal(mortgage.primary, '$800.00');
  assert.equal(mortgage.details?.[1].value, '$288,000.00');
  assert.equal(mortgage.details?.[2].value, '$0.00');

  const compound = calculateCore('compound-interest', ['5000', '250', '0.000000000001', '10']);
  assert.equal(compound.primary, '$35,000.00');
  assert.equal(compound.details?.[0].value, '$35,000.00');
  assert.equal(compound.details?.[1].value, '$0.00');
});

test('finance calculations reject unreasonable and overflow-scale inputs clearly', () => {
  const cases = [
    calculateCore('loan', ['24000', '1000000000', '1000']),
    calculateCore('mortgage', ['360000', '72000', '1000000000', '1000', '4500', '1800']),
    calculateCore('compound-interest', ['5000', '250', '1000000000', '1000']),
    calculateCore('loan', ['1000000000001', '5', '5']),
    calculateCore('loan', ['NaN', '5', '5']),
    calculateCore('mortgage', ['Infinity', '0', '5', '30', '0', '0']),
    calculateCore('compound-interest', ['1e309', '250', '5', '10']),
  ];
  for (const result of cases) {
    assert.ok(result.error);
    assert.doesNotMatch(result.primary, /NaN|∞|Infinity/i);
    assert.equal(result.details, undefined);
  }
});

test('finance calculations never display non-finite or negative interest results', () => {
  const cases = [
    calculateCore('loan', ['24000', '0.000000000001', '5']),
    calculateCore('mortgage', ['288000', '0', '0.000000000001', '30', '0', '0']),
    calculateCore('compound-interest', ['5000', '250', '0.000000000001', '10']),
  ];
  for (const result of cases) {
    assert.equal(result.error, undefined);
    assert.doesNotMatch(JSON.stringify(result), /NaN|∞|Infinity|-\$/i);
  }
});

test('savings and compound interest support zero rates', () => {
  assert.equal(calculateCore('savings', ['100', '10', '0', '1']).primary, '$220.00');
  assert.equal(calculateCore('compound-interest', ['100', '10', '0', '1']).primary, '$220.00');
});

test('VAT add and remove are inverse operations', () => {
  assert.equal(calculateCore('vat', ['100', '20']).primary, '$120.00');
  assert.equal(calculateCore('vat', ['120', '20'], 'remove').primary, '$100.00');
});

test('business calculators return accurate headline and decision details', () => {
  const roi = calculateCore('roi', ['5000', '6800']);
  assert.equal(roi.primary, '36%');
  assert.equal(roi.details?.[0].value, '$1,800.00');

  const margin = calculateCore('profit-margin', ['48', '80']);
  assert.equal(margin.primary, '40%');
  assert.equal(margin.details?.[0].value, '$32.00');
  assert.equal(margin.details?.[1].value, '66.67%');

  const markup = calculateCore('markup', ['48', '40']);
  assert.equal(markup.primary, '$67.20');
  assert.equal(markup.details?.[0].value, '$19.20');
  assert.equal(markup.details?.[1].value, '28.57%');

  const breakEven = calculateCore('break-even', ['12000', '80', '32']);
  assert.equal(breakEven.primary, '250 units');
  assert.equal(breakEven.details?.[0].value, '$48.00');
  assert.equal(breakEven.details?.[1].value, '$20,000.00');
  assert.equal(breakEven.details?.[2].value, '$20,000.00');
});

test('business calculators handle meaningful zero, loss, and rounding cases', () => {
  assert.equal(calculateCore('roi', ['5000', '0']).primary, '-100%');
  assert.equal(calculateCore('profit-margin', ['60', '50']).primary, '-20%');
  assert.equal(calculateCore('profit-margin', ['0', '80']).details?.[1].value, 'Not defined');
  assert.equal(calculateCore('markup', ['48', '0']).primary, '$48.00');
  assert.equal(calculateCore('break-even', ['0', '80', '32']).primary, '0 units');
  const roundedBreakEven = calculateCore('break-even', ['4500', '150', '30']);
  assert.equal(roundedBreakEven.primary, '38 units');
  assert.equal(roundedBreakEven.details?.[1].value, '$5,625.00');
  assert.equal(roundedBreakEven.details?.[2].value, '$5,700.00');
  assert.equal(calculateCore('break-even', ['0.07', '0.04', '0.03']).primary, '7 units');
});

test('business calculators reject incomplete, undefined, invalid, and unsafe inputs', () => {
  const cases = [
    calculateCore('roi', ['', '6800']),
    calculateCore('profit-margin', ['48', '  ']),
    calculateCore('markup', ['-1', '40']),
    calculateCore('break-even', ['12000', '32', '32']),
    calculateCore('break-even', ['12000', '20', '32']),
    calculateCore('roi', ['0', '100']),
    calculateCore('markup', ['48', '100001']),
    calculateCore('roi', ['5e-324', '1000000000000']),
    calculateCore('profit-margin', ['1000000000000', '0.000001']),
    calculateCore('break-even', ['1000000000000', '1', '0.999999999999']),
    calculateCore('markup', ['1000000000001', '1']),
    calculateCore('roi', ['NaN', '100']),
  ];
  for (const result of cases) {
    assert.ok(result.error);
    assert.equal(result.details, undefined);
    assert.doesNotMatch(result.primary, /NaN|∞|Infinity/i);
  }
});

test('age, working days, and invalid values are handled explicitly', () => {
  assert.equal(calculateCore('age', ['2000-02-29', '2024-02-29']).primary, '24 years, 0 months, 0 days');
  assert.equal(calculateCore('working-days', ['2024-01-01', '2024-01-05']).primary, '5 weekdays');
  assert.match(calculateCore('area', ['-1', '2']).primary, /valid/);
  assert.match(calculateCore('dpi-ppi', ['100', '0']).primary, /greater than zero/);
});

test('converters work in both directions and protect reciprocal inputs', () => {
  assert.equal(convertCore('length', ['1'][0], 'meters', 'feet').primary, '3.28 Feet');
  assert.equal(convertCore('length', '3.28084', 'feet', 'meters').primary, '1 Meters');
  assert.equal(convertCore('temperature', '32', 'fahrenheit', 'celsius').primary, '0 Celsius');
  assert.equal(convertCore('fuel-economy', '25', 'mpg', 'l100km').primary, '9.41 L/100 km');
  assert.match(convertCore('fuel-economy', '0', 'mpg', 'l100km').primary, /greater than zero/);
});

test('automotive calculators return accurate decision details and meaningful zero states', () => {
  const fuel = calculateCore('fuel-cost', ['320', '28', '3.65']);
  assert.equal(fuel.primary, '$41.71');
  assert.equal(fuel.details?.[0].value, '11.43 gallons');
  assert.equal(fuel.details?.[1].value, '$0.13');
  assert.equal(calculateCore('fuel-cost', ['0', '28', '3.65']).primary, '$0.00');

  const chargingCost = calculateCore('ev-charging-cost', ['75', '80', '0.32']);
  assert.equal(chargingCost.primary, '$19.20');
  assert.equal(chargingCost.details?.[0].value, '60 kWh');
  assert.equal(chargingCost.details?.[1].value, '$24.00');
  assert.equal(calculateCore('ev-charging-cost', ['75', '0', '0.32']).primary, '$0.00');

  const chargingTime = calculateCore('ev-charging-time', ['52', '11']);
  assert.equal(chargingTime.primary, '4.73 hours');
  assert.equal(chargingTime.details?.[0].value, '4 hr 44 min');
  assert.equal(calculateCore('ev-charging-time', ['0', '11']).primary, '0 hours');
});

test('automotive calculators reject incomplete, undefined, and unsafe outputs', () => {
  const cases = [
    calculateCore('fuel-cost', ['', '28', '3.65']),
    calculateCore('fuel-cost', ['320', '0', '3.65']),
    calculateCore('fuel-cost', ['10000001', '28', '3.65']),
    calculateCore('fuel-cost', ['320', '1001', '3.65']),
    calculateCore('fuel-cost', ['320', '28', '1001']),
    calculateCore('ev-charging-cost', ['75', '', '0.32']),
    calculateCore('ev-charging-cost', ['75', '101', '0.32']),
    calculateCore('ev-charging-cost', ['10001', '80', '0.32']),
    calculateCore('ev-charging-time', ['52', '0']),
    calculateCore('ev-charging-time', ['10001', '11']),
    calculateCore('ev-charging-time', ['52', '10001']),
    calculateCore('ev-charging-time', ['Infinity', '11']),
    convertCore('fuel-economy', '0', 'mpg', 'l100km'),
    convertCore('fuel-economy', '0.00001', 'mpg', 'l100km'),
    convertCore('fuel-economy', '1000001', 'l100km', 'mpg'),
    convertCore('fuel-economy', '25', 'invalid', 'mpg'),
  ];
  for (const result of cases) {
    assert.ok(result.error);
    assert.equal(result.details, undefined);
    assert.doesNotMatch(result.primary, /NaN|∞|Infinity/i);
  }
});

test('core converter cluster uses accurate linear factors in both directions', () => {
  const cases = [
    ['unit', '5', 'kilometers', 'miles', '3.11 Miles'],
    ['length', '180', 'centimeters', 'inches', '70.87 Inches'],
    ['length', '10', 'kilometers', 'miles', '6.21 Miles'],
    ['weight', '23', 'kilograms', 'pounds', '50.71 Pounds'],
    ['weight', '12', 'stones', 'pounds', '168 Pounds'],
    ['speed', '100', 'kph', 'mph', '62.14 mph'],
    ['speed', '5', 'mps', 'kph', '18 km/h'],
    ['speed', '20', 'knots', 'kph', '37.04 km/h'],
  ] as const;
  for (const [slug, value, from, to, expected] of cases) {
    assert.equal(convertCore(slug, value, from, to).primary, expected);
  }
});

test('temperature formulas handle landmarks and reject values below absolute zero', () => {
  assert.equal(convertCore('temperature', '68', 'fahrenheit', 'celsius').primary, '20 Celsius');
  assert.equal(convertCore('temperature', '180', 'celsius', 'fahrenheit').primary, '356 Fahrenheit');
  assert.equal(convertCore('temperature', '25', 'celsius', 'kelvin').primary, '298.15 Kelvin');
  assert.equal(convertCore('temperature', '-40', 'celsius', 'fahrenheit').primary, '-40 Fahrenheit');
  assert.equal(convertCore('temperature', '0', 'kelvin', 'celsius').primary, '-273.15 Celsius');
  for (const result of [
    convertCore('temperature', '-0.01', 'kelvin', 'celsius'),
    convertCore('temperature', '-273.16', 'celsius', 'fahrenheit'),
    convertCore('temperature', '-459.68', 'fahrenheit', 'kelvin'),
  ]) assert.match(result.error ?? '', /absolute zero/i);
});

test('converter cluster rejects invalid selections and non-finite or overflowing values', () => {
  const results = [
    convertCore('length', '', 'meters', 'feet'),
    convertCore('weight', '   ', 'grams', 'pounds'),
    convertCore('length', '-1', 'meters', 'feet'),
    convertCore('weight', 'Infinity', 'grams', 'pounds'),
    convertCore('speed', 'NaN', 'kph', 'mph'),
    convertCore('length', '1e308', 'miles', 'millimeters'),
    convertCore('speed', '10', 'invalid', 'mph'),
  ];
  for (const result of results) {
    assert.ok(result.error);
    assert.doesNotMatch(result.primary, /NaN|∞|Infinity/i);
  }
});