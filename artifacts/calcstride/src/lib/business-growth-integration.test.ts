import assert from 'node:assert/strict';
import test from 'node:test';
import { localTools } from './catalog';
import { calculateCore, coreFields, coreMethodology } from './core-calculators';
import { businessGrowthSlugs } from './business-growth-calculators';
import { businessCalculatorContent, businessCalculatorSlugs } from './business-calculators';
import { formatCurrency } from './units-preferences';

const expectedRoutes = new Map([
  ['roas', '/calculators/business/roas'],
  ['conversion-rate', '/calculators/business/conversion-rate'],
  ['cpc', '/calculators/business/cpc'],
  ['cpm', '/calculators/business/cpm'],
  ['customer-acquisition-cost', '/calculators/business/customer-acquisition-cost'],
]);

test('Batch 1 business growth tools are published through the shared catalog', () => {
  for (const slug of businessGrowthSlugs) {
    const tool = localTools.find((candidate) => candidate.slug === slug);
    assert.ok(tool, `${slug} should be present in the published catalog`);
    assert.equal(tool.category, 'Business');
    assert.equal(tool.categorySlug, 'business');
    assert.equal(tool.href, expectedRoutes.get(slug));
    assert.ok(tool.tags.length >= 3);
  }
});

test('Batch 1 business growth tools use the existing Business calculator page/content registry', () => {
  const registeredBusinessSlugs = new Set<string>(businessCalculatorSlugs);
  const registeredBusinessContent = businessCalculatorContent as Record<string, unknown>;

  for (const slug of businessGrowthSlugs) {
    assert.ok(registeredBusinessSlugs.has(slug), `${slug} must be routed through BusinessCalculatorPage's existing slug registry`);
    assert.ok(registeredBusinessContent[slug], `${slug} must use the existing businessCalculatorContent architecture`);
  }
});

test('Batch 1 business growth tools expose their real two-field forms through coreFields', () => {
  for (const slug of businessGrowthSlugs) {
    assert.equal(coreFields[slug]?.length, 2, `${slug} should expose two configured fields`);
    assert.ok(coreMethodology[slug], `${slug} should inherit shared methodology content`);
  }
});

test('shared calculateCore delegates to the Batch 1 business growth formulas', () => {
  assert.equal(calculateCore('roas', ['2500', '10000']).primary, '4.00×');
  assert.equal(calculateCore('conversion-rate', ['5000', '175']).primary, '3.5%');
  assert.equal(calculateCore('cpc', ['1250', '2500']).primary, '$0.50');
  assert.equal(calculateCore('cpm', ['3000', '600000']).primary, '$5.00');
  assert.equal(calculateCore('customer-acquisition-cost', ['20000', '125']).primary, '$160.00');
});

test('shared calculateCore preserves currency formatting for monetary growth tools', () => {
  assert.equal(
    calculateCore('cpc', ['100', '4'], 'default', { currency: 'EUR' }).primary,
    formatCurrency(25, 'EUR'),
  );
  assert.equal(
    calculateCore('customer-acquisition-cost', ['400', '8'], 'default', { currency: 'GBP' }).primary,
    formatCurrency(50, 'GBP'),
  );
});

test('shared calculateCore surfaces growth validation errors instead of generic configuration errors', () => {
  for (const slug of businessGrowthSlugs) {
    const result = calculateCore(slug, ['', '10']);
    assert.ok(result.error);
    assert.doesNotMatch(result.error, /not configured/i);
  }
});
