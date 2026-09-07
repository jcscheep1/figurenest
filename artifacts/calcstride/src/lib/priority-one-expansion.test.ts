import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedTools } from './catalog';
import { calculatePriorityOneExpansion, priorityOneExpansionDefinitions, priorityOneExpansionSlugs, priorityOneUsefulWordCount } from './priority-one-expansion';

test('Priority One expansion has unique routes and working defaults', () => {
  assert.equal(priorityOneExpansionSlugs.length, 36);
  assert.equal(new Set(priorityOneExpansionSlugs).size, 36);
  const routes = new Set<string>();
  for (const slug of priorityOneExpansionSlugs) {
    const definition = priorityOneExpansionDefinitions[slug];
    assert(!routes.has(definition.href)); routes.add(definition.href);
    assert.ok(definition.educationalSections.length >= 1, `${slug} needs calculator-specific guidance`);
    assert.ok(definition.educationalSections.every((section) => section.heading && section.body), slug);
    if (['discount', 'estate-tax', 'interest', 'investment', 'sales-tax', 'student-loan', 'tax', 'tip', 'uk-mortgage', 'va-mortgage', 'gas-mileage', 'bmr', 'body-fat', 'calorie', 'calories-burned', 'due-date', 'pace', 'pregnancy', 'gpa', 'grade', 'currency'].includes(slug)) assert.ok(priorityOneUsefulWordCount(definition) >= 500, `${slug} needs at least 500 meaningful registry words`);
    assert.ok(definition.safetyNotice.trim().length > 40, `${slug} needs a page-specific safety notice`);
    assert(definition.faqs.length >= 4);
    assert(definition.relatedRoutes.length >= 2);
    assert.equal(new Set(definition.relatedRoutes).size, definition.relatedRoutes.length);
    assert.equal(definition.relatedRoutes.includes(definition.href), false);
    assert.equal(
      definition.relatedRoutes.every((href) => publishedTools.some((tool) => tool.href === href)),
      true,
      `${slug} has an unpublished related tool`,
    );
    const result = calculatePriorityOneExpansion(slug, definition.fields.map(f => f.value));
    assert.equal(Boolean(result.error), false, slug);
  }
});
test('Priority One safety content is specific to finance, health, and manual currency assumptions', () => {
  for (const slug of ['discount', 'estate-tax', 'interest', 'investment', 'sales-tax', 'student-loan', 'tax', 'tip', 'uk-mortgage', 'va-mortgage'] as const) {
    assert.match(priorityOneExpansionDefinitions[slug].educationalSections.map((section) => section.body).join(' '), /planning only/i, slug);
  }
  for (const slug of ['bmr', 'body-fat', 'calorie', 'calories-burned', 'due-date', 'pace', 'pregnancy'] as const) {
    assert.match(priorityOneExpansionDefinitions[slug].educationalSections.map((section) => section.body).join(' '), /not a diagnosis/i, slug);
  }
  assert.match(priorityOneExpansionDefinitions.currency.educationalSections.map((section) => section.body).join(' '), /manual assumptions only/i);
});
test('Priority One consequential calculators provide valid official-context sources', () => {
  const consequential = priorityOneExpansionSlugs.filter((slug) => {
    const category = priorityOneExpansionDefinitions[slug].category;
    return category === 'health' || category === 'education' || category === 'finance';
  });
  for (const slug of consequential) {
    const definition = priorityOneExpansionDefinitions[slug];
    assert.ok(definition.sourceLinks.length > 0, `${slug} needs a source`);
    for (const source of definition.sourceLinks) {
      const url = new URL(source.href);
      assert.equal(url.protocol, 'https:', `${slug} source must use HTTPS`);
      assert.ok(url.hostname.length > 0, `${slug} source must have a host`);
      assert.ok(source.label.trim().length > 0, `${slug} source needs a label`);
    }
  }
});
test('Priority One validation and known formula cases', () => {
  assert(calculatePriorityOneExpansion('bmi', ['70', '175']).primary.startsWith('22.9'));
  const grade = calculatePriorityOneExpansion('grade', ['50', '100']);
  assert.equal(grade.primary, '50');
  assert.equal(grade.summary, 'Course percentage from points earned and points possible.');
  assert.match(priorityOneExpansionDefinitions.grade.description, /points earned and points possible/i);
  assert.doesNotMatch(priorityOneExpansionDefinitions.grade.description, /weighted/i);
  assert.equal(calculatePriorityOneExpansion('currency', ['100', '2', 'USD', 'EUR']).primary, '200.00 EUR');
  assert(calculatePriorityOneExpansion('tip', ['100', '20', '1']).primary.includes('120'));
  const gpa = calculatePriorityOneExpansion('gpa', ['4', '3', '3', '4', '3', '3']);
  assert.equal(gpa.primary, '3.30');
  assert.equal(gpa.details.find(detail => detail.label === 'Total credits')?.value, '10');
  assert(calculatePriorityOneExpansion('gpa', ['4.1', '3', '3', '4', '2', '3']).error);
  const sleep = calculatePriorityOneExpansion('sleep', ['23:00']);
  assert.equal(sleep.primary, '06:30');
  assert.equal(sleep.details[0].value, '05:00');
  assert(calculatePriorityOneExpansion('sleep', ['24:00']).error);
  for (const slug of priorityOneExpansionSlugs) {
    const defaults = priorityOneExpansionDefinitions[slug].fields.map(f => f.value);
    const blank = [...defaults]; blank[0] = '';
    assert(calculatePriorityOneExpansion(slug, blank).error);
    const numeric = priorityOneExpansionDefinitions[slug].fields.findIndex(f => f.type !== 'date' && f.type !== 'time' && f.type !== 'select');
    if (numeric >= 0) { const negative = [...defaults]; negative[numeric] = '-1'; assert(calculatePriorityOneExpansion(slug, negative).error); }
  }
});