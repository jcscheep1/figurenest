import assert from 'node:assert/strict';
import test from 'node:test';
import {
  businessGrowthContent,
  businessGrowthSlugs,
  calculateBusinessGrowth,
} from './business-growth-calculators';

test('Batch 1 business growth calculators have unique SEO and connected content', () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const slug of businessGrowthSlugs) {
    const content = businessGrowthContent[slug];
    assert.equal(content.slug, slug);
    assert.equal(content.fields.length, 2);
    assert.ok(content.description.length >= 90);
    assert.ok(content.formula.length >= 25);
    assert.ok(content.formulaExplanation.length >= 120);
    assert.ok(content.guidance.length >= 2);
    assert.ok(content.assumptions.length >= 4);
    assert.ok(content.commonMistakes.length >= 4);
    assert.ok(content.faqs.length >= 5);
    assert.equal(content.relatedSlugs.length, 3);
    assert.ok(content.relatedSlugs.every((related) => related !== slug));
    assert.equal(new Set(content.relatedSlugs).size, 3);
    assert.ok(content.seoTitle.length <= 60);
    assert.ok(content.seoDescription.length >= 100 && content.seoDescription.length <= 160);
    titles.add(content.seoTitle);
    descriptions.add(content.seoDescription);
  }

  assert.equal(titles.size, businessGrowthSlugs.length);
  assert.equal(descriptions.size, businessGrowthSlugs.length);
});

test('ROAS returns a revenue multiple and percentage', () => {
  const result = calculateBusinessGrowth('roas', ['2500', '10000']);
  assert.equal(result.primary, '4.00×');
  assert.deepEqual(result.details?.[0], { label: 'ROAS percentage', value: '400%' });
});

test('conversion rate calculates completed conversions over opportunities', () => {
  assert.equal(calculateBusinessGrowth('conversion-rate', ['5000', '175']).primary, '3.5%');
  assert.equal(calculateBusinessGrowth('conversion-rate', ['100', '0']).primary, '0%');
});

test('CPC calculates spend per click', () => {
  assert.equal(calculateBusinessGrowth('cpc', ['1250', '2500']).primary, '$0.50');
  assert.equal(calculateBusinessGrowth('cpc', ['100', '4'], 'EUR').primary, '€25.00');
});

test('CPM calculates spend per thousand impressions', () => {
  assert.equal(calculateBusinessGrowth('cpm', ['3000', '600000']).primary, '$5.00');
});

test('CAC calculates acquisition spend per new customer', () => {
  assert.equal(calculateBusinessGrowth('customer-acquisition-cost', ['20000', '125']).primary, '$160.00');
});

test('denominator guards reject zero where the formula would divide by zero', () => {
  assert.ok(calculateBusinessGrowth('roas', ['0', '100']).error);
  assert.ok(calculateBusinessGrowth('conversion-rate', ['0', '10']).error);
  assert.ok(calculateBusinessGrowth('cpc', ['100', '0']).error);
  assert.ok(calculateBusinessGrowth('cpm', ['100', '0']).error);
  assert.ok(calculateBusinessGrowth('customer-acquisition-cost', ['100', '0']).error);
});

test('blank, negative, nonnumeric, and oversized values are rejected', () => {
  assert.ok(calculateBusinessGrowth('roas', ['', '100']).error);
  assert.ok(calculateBusinessGrowth('cpc', ['-1', '10']).error);
  assert.ok(calculateBusinessGrowth('cpm', ['abc', '1000']).error);
  assert.ok(calculateBusinessGrowth('customer-acquisition-cost', ['1000000000001', '10']).error);
});
