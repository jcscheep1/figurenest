import assert from 'node:assert/strict';
import test from 'node:test';
import { publishedTools } from './catalog';
import { financeCalculatorContent } from './finance-calculators';
import { converterCalculatorContent } from './converter-calculators';
import { getCalculatorSeoCapability } from './seo-capabilities';
import { getSeoForPath } from './seo';
import { toolApplicability } from './units-preferences';

test('every measured or monetary tool has specific capability copy', () => {
  for (const tool of publishedTools) {
    const applicability = toolApplicability[tool.slug];
    assert.ok(applicability, `${tool.slug} is missing an applicability classification`);
    if (applicability.monetary || applicability.dimensions.length > 0) {
      assert.ok(getCalculatorSeoCapability(tool.slug), `${tool.slug} is missing unit or currency SEO copy`);
    }
  }
});

test('currency language is limited to monetary tools and explains the no-FX boundary', () => {
  for (const tool of publishedTools) {
    const applicability = toolApplicability[tool.slug];
    const capability = getCalculatorSeoCapability(tool.slug);
    const copy = `${capability?.seoDescription ?? ''} ${capability?.visibleNote ?? ''}`;
    if (applicability.monetary) {
      assert.match(copy, /EUR.*USD.*GBP.*ZAR/s, `${tool.slug} does not name every supported denomination`);
      assert.match(copy, /(not live|no live|does not fetch live|not an exchange-rate)/i, `${tool.slug} does not explain the no-FX boundary`);
    } else {
      assert.doesNotMatch(copy, /\b(?:EUR|USD|GBP|ZAR)\b/, `${tool.slug} has irrelevant currency wording`);
    }
  }
});

test('capability metadata is unique, useful in search, and applied to canonical calculator records', () => {
  const descriptions = new Set<string>();
  const titles = new Set<string>();
  const canonicals = new Set<string>();
  for (const tool of publishedTools) {
    const seo = getSeoForPath(tool.href);
    assert.ok(seo.description.length >= 70 && seo.description.length <= 160, `${tool.slug} description is ${seo.description.length} characters`);
    assert.ok(!descriptions.has(seo.description), `${tool.slug} has a duplicate description`);
    assert.ok(!titles.has(seo.title), `${tool.slug} has a duplicate title`);
    assert.ok(!canonicals.has(seo.canonical), `${tool.slug} has a duplicate canonical`);
    descriptions.add(seo.description);
    titles.add(seo.title);
    canonicals.add(seo.canonical);

    const capability = getCalculatorSeoCapability(tool.slug);
    if (capability) {
      assert.equal(seo.title, capability.seoTitle);
      assert.equal(seo.description, capability.seoDescription);
    }
  }
});

type FaqSource = ReadonlyArray<{ question: string; answer: string }>;
type SchemaNode = {
  '@type'?: string;
  mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }>;
};

const assertFaqSchemaMatches = (path: string, faqs: FaqSource) => {
  const graph = getSeoForPath(path).schema['@graph'] as SchemaNode[];
  const faqPage = graph.find((node) => node['@type'] === 'FAQPage');
  assert.ok(faqPage?.mainEntity, `${path} has no FAQ schema`);
  assert.deepEqual(
    faqPage.mainEntity.map((item) => ({ question: item.name, answer: item.acceptedAnswer.text })),
    faqs,
  );
};

test('visible finance and converter FAQs remain synchronized with FAQ schema', () => {
  assertFaqSchemaMatches('/calculators/finance/loan', financeCalculatorContent.loan.faqs);
  assertFaqSchemaMatches('/converters/unit', converterCalculatorContent.unit.faqs);
});

test('representative converter links use descriptive labels and canonical tool routes', () => {
  for (const related of converterCalculatorContent.unit.related) {
    assert.match(`/converters/${related.slug}`, /^\/converters\/[a-z-]+$/);
    assert.ok(related.label.length >= 8);
    assert.ok(related.description.length >= 24);
    assert.doesNotMatch(related.label, /^(click|here|read more)$/i);
  }
});