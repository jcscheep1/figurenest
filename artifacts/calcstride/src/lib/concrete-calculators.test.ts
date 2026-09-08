import assert from 'node:assert/strict';
import test from 'node:test';
import { publishedTools } from './catalog';
import { concreteCalculatorContent, concreteCalculatorSlugs } from './concrete-calculators';
import { calculateConstruction, constructionDefaults, getConstructionTool } from './construction';
import { getSeoForPath, publicRouteKeys } from './seo';

test('dedicated concrete records are complete, distinct, and metadata-safe', () => {
  const records = Object.values(concreteCalculatorContent);
  assert.deepEqual(records.map((record) => record.slug), [...concreteCalculatorSlugs]);
  assert.equal(new Set(records.map((record) => record.seoTitle)).size, records.length);
  assert.equal(new Set(records.map((record) => record.seoDescription)).size, records.length);
  assert.equal(new Set(records.map((record) => record.distinction)).size, records.length);
  for (const record of records) {
    assert.ok(record.seoTitle.length <= 60);
    assert.ok(record.seoDescription.length >= 100 && record.seoDescription.length <= 160);
    assert.ok(record.title && record.description && record.purposeTitle && record.formulaExplanation);
    assert.ok(record.purpose.length >= 2);
    assert.ok(record.examples.length >= 2);
    assert.ok(record.interpretation.length >= 2);
    assert.ok(record.assumptions.length >= 3);
    assert.ok(record.commonMistakes.length >= 3);
    assert.ok(record.edgeCases.length >= 3);
    assert.ok(record.limitations.length > 50);
    assert.ok(record.faqs.length >= 5);
    assert.ok(record.relatedTools.length >= 3);
  }
});

test('worked examples align with the production calculation', () => {
  for (const record of Object.values(concreteCalculatorContent)) {
    for (const example of record.examples) {
      const result = calculateConstruction(record.slug, example.inputValues, example.unit);
      assert.equal(result.error, undefined, `${record.slug}: ${example.title}`);
      const comparableRaw = example.unit === 'imperial' && record.slug !== 'concrete-bag' && record.slug !== 'concrete-cost'
        ? result.raw * 1.30795062
        : result.raw;
      assert.ok(Math.abs(comparableRaw - example.expectedRaw) < 0.00001, `${record.slug}: ${example.title}`);
    }
  }
});

test('contextual concrete links resolve to published tools with descriptive copy', () => {
  const published = new Set(publishedTools.map((tool) => tool.slug));
  for (const record of Object.values(concreteCalculatorContent)) {
    for (const link of record.relatedTools) {
      const tool = getConstructionTool(link.slug);
      assert.ok(tool);
      assert.ok(published.has(link.slug));
      assert.ok(publicRouteKeys.includes(tool.href));
      assert.ok(link.label.length > 15);
      assert.ok(link.context.length > 25);
    }
  }
});

test('general concrete and slab intentionally share math but explain different intents', () => {
  const values = { length: 18, width: 11, depth: 5, waste: 7 };
  assert.equal(calculateConstruction('concrete', values, 'imperial').raw, calculateConstruction('concrete-slab', values, 'imperial').raw);
  assert.notEqual(concreteCalculatorContent.concrete.description, concreteCalculatorContent['concrete-slab'].description);
  assert.match(concreteCalculatorContent.concrete.distinction, /broad|without assuming/i);
  assert.match(concreteCalculatorContent['concrete-slab'].distinction, /footprint|slab/i);
});

test('bag rounding, footing count, cost units, and metric parity are preserved', () => {
  assert.equal(calculateConstruction('concrete-bag', { length: 1, width: 1, depth: 1, bagYield: 1, waste: 0 }, 'imperial').raw, 1);
  const one = calculateConstruction('concrete-footing', { length: 10, width: 12, depth: 8, count: 1, waste: 0 }, 'imperial');
  const four = calculateConstruction('concrete-footing', { length: 10, width: 12, depth: 8, count: 4, waste: 0 }, 'imperial');
  assert.ok(Math.abs(four.raw - one.raw * 4) < 1e-10);
  const imperial = calculateConstruction('concrete', { length: 10, width: 8, depth: 4, waste: 10 }, 'imperial');
  const metric = calculateConstruction('concrete', { length: 3.048, width: 2.4384, depth: 10.16, waste: 10 }, 'metric');
  assert.ok(Math.abs(imperial.raw - metric.raw) < 1e-9);
  assert.ok(Math.abs(calculateConstruction('concrete-cost', { length: 3, width: 2, depth: 10, price: 200, waste: 0 }, 'metric').raw - 120) < 1e-9);
});

test('selected concrete validation rejects blanks, bounds, nonfinite, and fractional count', () => {
  const assertSafeError = (result: ReturnType<typeof calculateConstruction>) => {
    assert.ok(result.error);
    assert.doesNotMatch(`${result.primary} ${result.summary}`, /NaN|Infinity/i);
    assert.equal(result.breakdown.length, 0);
  };
  for (const slug of concreteCalculatorSlugs) {
    const blank = constructionDefaults(slug, 'imperial');
    blank.length = ' ';
    const blankResult = calculateConstruction(slug, blank, 'imperial');
    assert.match(blankResult.error ?? '', /required/i);
    assertSafeError(blankResult);
    const excessive = constructionDefaults(slug, 'imperial');
    excessive.length = slug === 'concrete-footing' ? '10001' : '2001';
    assertSafeError(calculateConstruction(slug, excessive, 'imperial'));
    const nonfinite = constructionDefaults(slug, 'imperial');
    nonfinite.length = 'Infinity';
    assertSafeError(calculateConstruction(slug, nonfinite, 'imperial'));
  }
  assertSafeError(calculateConstruction('concrete', { length: 1, width: 1, depth: 1, waste: 101 }, 'imperial'));
  assert.match(calculateConstruction('concrete', { length: -1, width: 1, depth: 1, waste: 0 }, 'imperial').error ?? '', /negative/i);
  assertSafeError(calculateConstruction('concrete', { length: 1, width: 2001, depth: 1, waste: 0 }, 'imperial'));
  assertSafeError(calculateConstruction('concrete', { length: 1, width: 1, depth: 121, waste: 0 }, 'imperial'));
  assertSafeError(calculateConstruction('concrete-bag', { length: 1, width: 1, depth: 1, bagYield: 11, waste: 0 }, 'imperial'));
  assertSafeError(calculateConstruction('concrete-footing', { length: 1, width: 1, depth: 1, count: 1.5, waste: 0 }, 'imperial'));
  assertSafeError(calculateConstruction('concrete-footing', { length: 1, width: 241, depth: 1, count: 1, waste: 0 }, 'imperial'));
  assertSafeError(calculateConstruction('concrete-footing', { length: 1, width: 1, depth: 1, count: 1001, waste: 0 }, 'imperial'));
  const largestValidFooting = calculateConstruction('concrete-footing', { length: 10000, width: 240, depth: 120, count: 1000, waste: 100 }, 'imperial');
  assert.ok(Number.isFinite(largestValidFooting.raw));
  assert.doesNotMatch(`${largestValidFooting.primary} ${largestValidFooting.summary}`, /NaN|Infinity/i);
  assertSafeError(calculateConstruction('concrete-cost', { length: 1, width: 1, depth: 1, price: 10001, waste: 0 }, 'imperial'));
});

test('footing input contract matches the repeated-run calculation', () => {
  const footing = getConstructionTool('concrete-footing');
  assert.equal(footing?.fields.find((item) => item.key === 'length')?.label, 'Length of one footing run');
  assert.match(footing?.formula ?? '', /one run/i);
  assert.match(concreteCalculatorContent['concrete-footing'].distinction, /one identical rectangular footing run/i);
});

test('concrete SEO uses content H1, canonical, index status, and exactly one matching FAQ node', () => {
  for (const record of Object.values(concreteCalculatorContent)) {
    const path = `/calculators/construction/${record.slug}`;
    const seo = getSeoForPath(path);
    assert.equal(seo.title, record.seoTitle);
    assert.equal(seo.description, record.seoDescription);
    assert.equal(seo.h1, record.title);
    assert.equal(seo.robots, 'index, follow');
    assert.equal(seo.canonical, `https://figurenest.com${path}/`);
    assert.ok(publicRouteKeys.includes(path));
    const graph = (seo.schema as { '@graph': { '@type': string; mainEntity?: { name: string }[] }[] })['@graph'];
    const faqs = graph.filter((node) => node['@type'] === 'FAQPage');
    assert.equal(faqs.length, 1);
    assert.deepEqual(faqs[0].mainEntity?.map((item) => item.name), record.faqs.map((faq) => faq.question));
    const serializedSchema = JSON.stringify(seo.schema);
    for (const faq of record.faqs) assert.ok(serializedSchema.includes(faq.answer));
  }
});