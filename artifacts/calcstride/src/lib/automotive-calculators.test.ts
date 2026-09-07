import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore, convertCore } from './core-calculators';
import { automotiveCalculatorContent, automotiveCalculatorSlugs } from './automotive-calculators';
import { localTools } from './catalog';

test('automotive content is complete, distinct, and internally connected', () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const slug of automotiveCalculatorSlugs) {
    const content = automotiveCalculatorContent[slug];
    titles.add(content.seoTitle);
    descriptions.add(content.seoDescription);
    assert.ok(content.purpose.join(' ').length > 200);
    assert.ok(content.formula.length > 25);
    assert.ok(content.examples.length >= 2);
    assert.ok(content.interpretation.length >= 2);
    assert.ok(content.assumptions.length >= 4);
    assert.ok(content.commonMistakes.length >= 4);
    assert.ok(content.edgeCases.length >= 3);
    assert.ok(content.limitations.length > 180);
    assert.ok(content.faqs.length >= 5);
    assert.ok(content.relatedTools.length >= 3);
    assert.ok(content.seoTitle.length <= 60);
    assert.ok(content.seoDescription.length >= 100 && content.seoDescription.length <= 160);
    for (const related of content.relatedTools) {
      assert.notEqual(related.slug, slug);
      assert.ok(localTools.some((tool) => tool.slug === related.slug), `${slug} links to missing ${related.slug}`);
      assert.ok(related.label.length > 20);
      assert.ok(related.context.length > 35);
    }
  }
  assert.equal(titles.size, automotiveCalculatorSlugs.length);
  assert.equal(descriptions.size, automotiveCalculatorSlugs.length);
});

test('automotive examples align with the calculator engines', () => {
  const fuel = calculateCore('fuel-cost', ['320', '28', '3.65']);
  assert.equal(fuel.primary, '$41.71');
  assert.equal(fuel.details?.[0].value, '11.43 gallons');
  assert.equal(fuel.details?.[1].value, '$0.13');

  assert.equal(convertCore('fuel-economy', '25', 'mpg', 'l100km').primary, '9.41 L/100 km');
  assert.equal(convertCore('fuel-economy', '7.5', 'l100km', 'mpg').primary, '31.36 US MPG');
  assert.equal(convertCore('fuel-economy', '20', 'kml', 'l100km').primary, '5 L/100 km');

  const cost = calculateCore('ev-charging-cost', ['75', '80', '0.32']);
  assert.equal(cost.primary, '$19.20');
  assert.equal(cost.details?.[0].value, '60 kWh');
  assert.equal(cost.details?.[1].value, '$24.00');

  const time = calculateCore('ev-charging-time', ['52', '11']);
  assert.equal(time.primary, '4.73 hours');
  assert.equal(time.details?.[0].value, '4 hr 44 min');
});

test('the four tools explain separate cost, conversion, and time decisions', () => {
  assert.match(automotiveCalculatorContent['fuel-cost'].distinction, /distance.*price/i);
  assert.match(automotiveCalculatorContent['fuel-economy'].distinction, /converts/i);
  assert.match(automotiveCalculatorContent['ev-charging-cost'].distinction, /multiplies/i);
  assert.match(automotiveCalculatorContent['ev-charging-time'].distinction, /divides/i);
});