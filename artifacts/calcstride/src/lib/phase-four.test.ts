import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogTools } from '../../../api-server/src/routes/catalog';
import { publishedTools } from './catalog';
import { calculatePhaseFour, phaseFourDefinitions, phaseFourSlugs, phaseFourUsefulWordCount } from './phase-four';
import { phaseFourRoutes } from './phase-four-routes';
import { getSeoForPath, publicRouteKeys, renderSeoHead } from './seo';

test('phase four publishes 15 canonical definition-driven tools with API parity', () => {
  assert.equal(publishedTools.length, 163);
  assert.equal(phaseFourSlugs.length, 15);
  assert.deepEqual(phaseFourRoutes.map(({ slug }) => slug), phaseFourSlugs);
  assert.equal(new Set(publishedTools.map((tool) => tool.href)).size, publishedTools.length);
  for (const slug of phaseFourSlugs) {
    const definition = phaseFourDefinitions[slug];
    const route = phaseFourRoutes.find((entry) => entry.slug === slug);
    const output = calculatePhaseFour(slug, definition.fields.map((field) => field.value));
    const seo = getSeoForPath(definition.href);
    assert.equal(output.error, undefined, slug);
    assert.ok(definition.educationalSections.length >= 1, slug);
    assert.ok(definition.educationalSections.every((section) => section.heading && section.body), slug);
    assert.ok(route, slug);
    assert.equal(route.name, definition.name);
    assert.equal(route.href, definition.href);
    assert.equal(route.description, definition.description);
    assert.equal(route.category, definition.category);
    assert.equal(route.categorySlug, definition.categorySlug);
    assert.ok(definition.seoDescription.length >= 70 && definition.seoDescription.length <= 160, slug);
    assert.ok(definition.safetyNotice.trim().length > 40, `${slug} safety notice`);
    for (const source of definition.sourceLinks) {
      const url = new URL(source.href);
      assert.equal(url.protocol, 'https:', `${slug} source protocol`);
      assert.ok(url.hostname.length > 0, `${slug} source host`);
      assert.ok(source.label.trim().length > 0, `${slug} source label`);
    }
    assert.equal(new Set(definition.relatedRoutes).size, definition.relatedRoutes.length, slug);
    assert.ok(definition.relatedRoutes.length > 0, slug);
    for (const relatedRoute of definition.relatedRoutes) {
      assert.ok(publishedTools.some((tool) => tool.href === relatedRoute), `${slug}: ${relatedRoute}`);
    }
    assert.ok(publicRouteKeys.includes(definition.href), slug);
    assert.equal(seo.canonical, `https://figurenest.com${definition.href}/`);
    assert.ok(seo.title.length <= 60, slug);
    assert.equal(seo.description, definition.seoDescription);
    const head = renderSeoHead(seo);
    assert.match(head, /FAQPage/);
    assert.match(head, /BreadcrumbList/);
    assert.match(head, /WebApplication/);
    assert.equal(catalogTools.find((tool) => tool.slug === slug)?.href, definition.href);
  }
  assert.match(phaseFourDefinitions['401k'].safetyNotice, /\$24,500.*2026 planning assumption.*Verify the current IRS limit/i);
});
test('requested Phase Four priority pages have substantial unique and safe registry prose', () => {
  const requested = ['mileage', 'shoe-size', 'take-home-pay', 'commission'] as const;
  const prose = requested.map((slug) => JSON.stringify(phaseFourDefinitions[slug].educationalSections).toLowerCase());
  assert.equal(new Set(prose).size, prose.length, 'priority educational copy must be page-specific');
  for (const slug of requested) {
    const definition = phaseFourDefinitions[slug];
    assert.ok(phaseFourUsefulWordCount(definition) >= 500, `${slug} needs at least 500 meaningful registry words`);
  }
  assert.match(prose[1], /brand.*last|last.*brand/i, 'shoe conversion must disclose last variation');
  for (const proseEntry of [prose[2], prose[3]]) assert.match(proseEntry, /planning estimates only/i);
});

test('phase four known outputs and invalid input handling are deterministic', () => {
  const expected: Record<string, string> = {
    mileage: '30.00 MPG', 'roman-numeral': 'MMXXVI', 'shoe-size': 'Men · EU 42.5',
    'social-security': '$2,000.00/month', 'take-home-pay': '$1,850.00', 'tire-size': '24.97 in diameter',
    '401k': '$558,391.07', annuity: '$659.96 per monthly', apr: '12.40% APR',
    'auto-lease': '$503.61/month', bond: '$1,081.11', budget: '$1,200.00',
    commission: '$800.00', 'credit-card': '33 months', 'debt-consolidation': '$402.91/month',
  };
  for (const slug of phaseFourSlugs) {
    const values = phaseFourDefinitions[slug].fields.map((field) => field.value);
    assert.equal(calculatePhaseFour(slug, values).primary, expected[slug], slug);
    values[0] = '';
    assert.ok(calculatePhaseFour(slug, values).error, `${slug} blank input`);
  }
  assert.equal(calculatePhaseFour('mileage', ['imperial', '120', '4']).primary, '30.00 MPG');
  assert.equal(calculatePhaseFour('roman-numeral', ['2026']).primary, 'MMXXVI');
  assert.equal(calculatePhaseFour('tire-size', ['225', '45', '17', '225', '45', '17']).primary, '24.97 in diameter');
  assert.equal(calculatePhaseFour('take-home-pay', ['2500', '22', '100']).primary, '$1,850.00');
  assert.equal(calculatePhaseFour('budget', ['5000', '3800']).primary, '$1,200.00');
  assert.ok(calculatePhaseFour('mileage', ['imperial', '0', '4']).error);
  assert.ok(calculatePhaseFour('roman-numeral', ['4000']).error);
  assert.ok(calculatePhaseFour('social-security', ['2000', '62.5']).error);
  assert.ok(calculatePhaseFour('credit-card', ['5000', '20', '1', 'payoff']).error);
  assert.ok(calculatePhaseFour('shoe-size', ['men', 'JP', '9']).error);
  assert.ok(calculatePhaseFour('annuity', ['100000', '5', '20', 'weekly']).error);
  assert.ok(calculatePhaseFour('401k', ['25000', '24501', '3000', '6', '20']).error);
  assert.ok(calculatePhaseFour('apr', ['10000', '200', '9800', '100', '60']).error);
  assert.ok(calculatePhaseFour('apr', ['10000', '200', '9900', '220', '60']).error);
});

test('shoe size shared engine covers baby, youth, women and men without silent rounding', () => {
  const baby = calculatePhaseFour('shoe-size', ['baby', 'US', '5.5']);
  assert.equal(baby.primary, 'Baby / toddler · EU 21');
  assert.deepEqual(baby.details, [
    { label: 'US size', value: '5.5' },
    { label: 'UK size', value: '4.5' },
    { label: 'EU size', value: '21' },
    { label: 'Approx. foot length', value: '12.7 cm' },
  ]);

  assert.equal(calculatePhaseFour('shoe-size', ['kids', 'EU', '35']).primary, 'Children / youth · EU 35');
  assert.equal(calculatePhaseFour('shoe-size', ['women', 'UK', '7.5']).primary, 'Women · EU 41');
  assert.equal(calculatePhaseFour('shoe-size', ['men', 'EU', '42.5']).primary, 'Men · EU 42.5');
  assert.ok(calculatePhaseFour('shoe-size', ['men', 'EU', '42.7']).error, 'unsupported in-between sizes must not be rounded');
  assert.ok(calculatePhaseFour('shoe-size', ['baby', 'US', '15']).error, 'adult sizes must not leak into the baby table');
});

test('APR treats fees as withheld proceeds rather than financed principal', () => {
  const result = calculatePhaseFour('apr', ['10000', '200', '9800', '220', '60']);
  assert.equal(result.primary, '12.40% APR');
  assert.equal(result.summary, 'Solved from net cash received, fixed monthly payments, and term.');
  assert.deepEqual(result.details, [
    { label: 'Loan amount', value: '$10,000.00' },
    { label: 'Fees withheld', value: '$200.00' },
    { label: 'Cash received', value: '$9,800.00' },
  ]);
});
