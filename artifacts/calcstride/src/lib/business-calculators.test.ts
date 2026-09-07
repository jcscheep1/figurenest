import assert from 'node:assert/strict';
import test from 'node:test';
import { businessCalculatorContent, businessCalculatorSlugs } from './business-calculators';
import { calculateCore } from './core-calculators';

test('business calculator content is substantial, distinct, and internally connected', () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const slug of businessCalculatorSlugs) {
    const content = businessCalculatorContent[slug];
    assert.equal(content.slug, slug);
    assert.ok(content.fields.length >= 2);
    assert.ok(content.whenUseful.join(' ').length >= 250);
    assert.ok(content.distinction.length >= 180);
    assert.ok(content.formula.length >= 25);
    assert.ok(content.formulaExplanation.length >= 150);
    assert.ok(content.examples.length >= 3);
    assert.ok(content.interpretation.length >= 2);
    assert.ok(content.assumptions.length >= 4);
    assert.ok(content.commonMistakes.length >= 4);
    assert.ok(content.edgeCases.length >= 3);
    assert.ok(content.limitations.length >= 180);
    assert.ok(content.faqs.length >= 5);
    assert.equal(content.relatedTools.length, 3);
    assert.ok(content.relatedTools.every((related) => related.slug !== slug));
    assert.equal(new Set(content.relatedTools.map((related) => related.slug)).size, 3);
    assert.ok(content.seoTitle.length <= 60);
    assert.ok(content.seoDescription.length >= 100 && content.seoDescription.length <= 160);
    titles.add(content.seoTitle);
    descriptions.add(content.seoDescription);
  }
  assert.equal(titles.size, businessCalculatorSlugs.length);
  assert.equal(descriptions.size, businessCalculatorSlugs.length);
});

test('worked business examples remain aligned with calculator outputs', () => {
  const cases = [
    ['roi', ['5000', '6800'], '36%'],
    ['roi', ['12000', '9000'], '-25%'],
    ['profit-margin', ['48', '80'], '40%'],
    ['profit-margin', ['60', '50'], '-20%'],
    ['markup', ['48', '40'], '$67.20'],
    ['markup', ['25', '100'], '$50.00'],
    ['break-even', ['12000', '80', '32'], '250 units'],
    ['break-even', ['4500', '150', '30'], '38 units'],
  ] as const;
  for (const [slug, values, expected] of cases) {
    assert.equal(calculateCore(slug, [...values]).primary, expected);
  }
});

test('business tools explain different denominators and decision types', () => {
  assert.match(businessCalculatorContent.roi.distinction, /initial investment/i);
  assert.match(businessCalculatorContent['profit-margin'].distinction, /selling price/i);
  assert.match(businessCalculatorContent.markup.distinction, /cost/i);
  assert.match(businessCalculatorContent['break-even'].distinction, /unit volume/i);
  const markupConversion = businessCalculatorContent.markup.faqs.find(
    (faq) => faq.question === 'How do I convert markup to margin?',
  );
  assert.match(markupConversion?.answer ?? '', /100 \+ Markup/);
  assert.match(markupConversion?.answer ?? '', /50% markup converts to a 33\.33% margin/);
});