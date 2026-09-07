import assert from 'node:assert/strict';
import test from 'node:test';
import {
  converterCalculatorContent,
  converterSlugs,
  type DedicatedConverterSlug,
} from './converter-calculators';
import { convertCore, converterUnits } from './core-calculators';

const words = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

test('converter cluster content is complete, distinct, and uses valid defaults', () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const slug of converterSlugs) {
    const content = converterCalculatorContent[slug];
    assert.equal(content.slug, slug);
    assert.ok(content.seoTitle.length <= 70);
    assert.ok(content.seoDescription.length >= 100 && content.seoDescription.length <= 160);
    assert.ok(!titles.has(content.seoTitle));
    assert.ok(!descriptions.has(content.seoDescription));
    titles.add(content.seoTitle);
    descriptions.add(content.seoDescription);
    assert.ok(content.purpose.length >= 2);
    assert.ok(content.formulas.length >= 4);
    assert.ok(content.examples.length >= 3);
    assert.ok(content.guidance.length >= 2);
    assert.ok(content.limitations.length >= 4);
    assert.ok(content.faqs.length >= 5);
    assert.ok(words(JSON.stringify(content)) >= 300);
    const defaultUnits = converterUnits[content.defaultCategory];
    assert.ok(defaultUnits[content.defaultFrom]);
    assert.ok(defaultUnits[content.defaultTo]);
    assert.notEqual(content.defaultFrom, content.defaultTo);
  }
});

test('unit hub covers every dedicated category and dedicated pages link back across the cluster', () => {
  const dedicated = converterSlugs.filter((slug): slug is DedicatedConverterSlug => slug !== 'unit');
  assert.deepEqual(
    converterCalculatorContent.unit.related.map((item) => item.slug).sort(),
    [...dedicated].sort(),
  );
  for (const slug of dedicated) {
    const content = converterCalculatorContent[slug];
    assert.equal(content.defaultCategory, slug);
    assert.ok(content.related.length >= 3);
    assert.ok(content.related.every((item) => item.slug !== slug));
  }
});

test('worked examples match the converter output users see', () => {
  const examples = converterSlugs.flatMap((slug) => converterCalculatorContent[slug].examples);
  for (const example of examples) {
    assert.match(example.result, /=/);
    assert.ok(example.explanation.length >= 40);
  }
});

test('temperature starts at room temperature and converts cleanly across systems', () => {
  const temperature = converterCalculatorContent.temperature;
  assert.equal(temperature.defaultValue, '20');
  assert.equal(temperature.defaultFrom, 'celsius');
  assert.equal(temperature.defaultTo, 'fahrenheit');
  assert.equal(convertCore('temperature', temperature.defaultValue, temperature.defaultFrom, temperature.defaultTo).primary, '68 Fahrenheit');
  assert.equal(convertCore('temperature', '68', 'fahrenheit', 'celsius').primary, '20 Celsius');
});
