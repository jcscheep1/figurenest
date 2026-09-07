import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';
import { financeCalculatorContent, type FinanceCalculatorSlug } from './finance-calculators';

const slugs = Object.keys(financeCalculatorContent) as FinanceCalculatorSlug[];

test('finance calculator content is substantial, distinct, and tool-specific', () => {
  assert.deepEqual([...slugs].sort(), ['compound-interest', 'loan', 'mortgage']);
  assert.equal(new Set(slugs.map((slug) => financeCalculatorContent[slug].seoTitle)).size, slugs.length);
  assert.equal(new Set(slugs.map((slug) => financeCalculatorContent[slug].seoDescription)).size, slugs.length);

  for (const slug of slugs) {
    const content = financeCalculatorContent[slug];
    assert.equal(content.slug, slug);
    assert.ok(content.seoDescription.length >= 100 && content.seoDescription.length <= 160);
    assert.ok(content.examples.length >= 3);
    assert.ok(content.faqs.length >= 7);
    assert.ok(content.assumptions.length >= 4);
    assert.ok(content.commonMistakes.length >= 4);
    assert.ok(content.edgeCases.length >= 3);
    assert.ok(content.instructions.length >= 4);
    assert.ok(content.relatedTools.length >= 3);
    assert.equal(new Set(content.faqs.map((faq) => faq.question)).size, content.faqs.length);
    assert.ok(content.relatedTools.every((related) => related.slug !== slug));
  }
  assert.match(financeCalculatorContent.loan.usefulFor.join(' '), /longer term with a lower payment but higher lifetime interest/i);
});

test('worked finance examples stay aligned with calculator outputs', () => {
  const loan = calculateCore('loan', ['24000', '7.2', '5']);
  assert.equal(loan.primary, '$477.50');
  assert.equal(loan.details?.[0].value, '$28,649.80');
  assert.equal(loan.details?.[1].value, '$4,649.80');

  const mortgage = calculateCore('mortgage', ['360000', '72000', '6.5', '30', '4500', '1800']);
  assert.equal(mortgage.primary, '$2,345.36');
  assert.equal(mortgage.details?.[0].value, '$1,820.36');

  const compound = calculateCore('compound-interest', ['5000', '250', '6', '10']);
  assert.equal(compound.primary, '$50,066.82');
  assert.equal(compound.details?.[0].value, '$35,000.00');
  assert.equal(compound.details?.[1].value, '$15,066.82');
});

test('finance edge cases fail clearly or produce finite results', () => {
  assert.match(calculateCore('loan', ['24000', '7.2', '0']).primary, /greater than zero/i);
  assert.match(calculateCore('mortgage', ['300000', '310000', '6', '30', '0', '0']).primary, /valid loan term and down payment/i);
  assert.equal(calculateCore('compound-interest', ['0', '500', '0', '5']).primary, '$30,000.00');
  for (const slug of ['loan', 'mortgage', 'compound-interest']) {
    const result = slug === 'loan'
      ? calculateCore(slug, ['24000', '101', '5'])
      : slug === 'mortgage'
        ? calculateCore(slug, ['360000', '72000', '101', '30', '4500', '1800'])
        : calculateCore(slug, ['5000', '250', '101', '10']);
    assert.match(result.error ?? '', /100% or less/);
    assert.doesNotMatch(JSON.stringify(result), /NaN|∞|Infinity/);
  }
});