import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';
import { workDateCalculatorContent, type WorkDateCalculatorSlug } from './work-date-calculators';

const slugs = Object.keys(workDateCalculatorContent) as WorkDateCalculatorSlug[];

test('work and date content is substantial, distinct, and internally connected', () => {
  assert.deepEqual([...slugs].sort(), ['age', 'overtime', 'salary', 'working-days']);
  assert.equal(new Set(slugs.map((slug) => workDateCalculatorContent[slug].seoTitle)).size, slugs.length);
  assert.equal(new Set(slugs.map((slug) => workDateCalculatorContent[slug].seoDescription)).size, slugs.length);

  for (const slug of slugs) {
    const content = workDateCalculatorContent[slug];
    const serialized = JSON.stringify(content);
    assert.equal(content.slug, slug);
    assert.ok(serialized.split(/\s+/).length >= 500);
    assert.ok(content.seoDescription.length >= 100 && content.seoDescription.length <= 160);
    assert.ok(content.examples.length >= 3);
    assert.ok(content.faqs.length >= 7);
    assert.ok(content.assumptions.length >= 4);
    assert.ok(content.commonMistakes.length >= 4);
    assert.ok(content.edgeCases.length >= 4);
    assert.ok(content.relatedTools.length >= 3);
    assert.equal(new Set(content.faqs.map((faq) => faq.question)).size, content.faqs.length);
    assert.ok(content.relatedTools.every((related) => related.slug !== slug));
  }

  assert.ok(workDateCalculatorContent.age.relatedTools.some((tool) => tool.slug === 'date-difference'));
  assert.ok(workDateCalculatorContent['working-days'].relatedTools.some((tool) => tool.slug === 'date-difference'));
  assert.ok(workDateCalculatorContent.salary.relatedTools.some((tool) => tool.slug === 'overtime'));
  assert.ok(workDateCalculatorContent.overtime.relatedTools.some((tool) => tool.slug === 'salary'));
});

test('age and working-days examples match the existing calendar engines', () => {
  assert.equal(calculateCore('age', ['2000-02-29', '2024-02-29']).primary, '24 years, 0 months, 0 days');
  assert.equal(calculateCore('age', ['1985-11-20', '2026-03-05']).primary, '40 years, 3 months, 13 days');
  assert.equal(calculateCore('age', ['2024-01-31', '2024-02-29']).primary, '0 years, 0 months, 29 days');

  assert.equal(calculateCore('working-days', ['2026-08-03', '2026-08-14']).primary, '10 weekdays');
  assert.equal(calculateCore('working-days', ['2026-08-08', '2026-08-09']).primary, '0 weekdays');
  assert.equal(calculateCore('working-days', ['2026-09-01', '2026-09-30']).primary, '22 weekdays');
  assert.equal(calculateCore('working-days', ['2026-09-30', '2026-09-01']).primary, '22 weekdays');
});

test('salary and overtime examples match the existing pay engines', () => {
  const salary = calculateCore('salary', ['60000', '40', '52']);
  assert.equal(salary.primary, '$28.85');
  assert.equal(salary.details?.[0].value, '$5,000.00');
  assert.equal(salary.details?.[1].value, '$1,153.85');
  assert.equal(calculateCore('salary', ['75000', '37.5', '50']).primary, '$40.00');
  assert.equal(calculateCore('salary', ['52000', '20', '52']).primary, '$50.00');

  assert.equal(calculateCore('overtime', ['24', '8', '1.5']).primary, '$288.00');
  assert.equal(calculateCore('overtime', ['32.5', '6', '2']).primary, '$390.00');
  assert.equal(calculateCore('overtime', ['18', '12', '1.5']).primary, '$324.00');
});

test('work and date invalid and edge inputs fail explicitly', () => {
  assert.match(calculateCore('age', ['2026-01-01', '2025-12-31']).primary, /on or before/i);
  assert.match(calculateCore('age', ['2023-02-29', '2024-02-29']).primary, /valid dates/i);
  assert.match(calculateCore('age', ['0000-01-01', '2024-01-01']).primary, /valid dates/i);
  assert.match(calculateCore('working-days', ['2024-04-31', '2024-05-01']).primary, /valid dates/i);
  assert.equal(calculateCore('working-days', ['2026-08-08', '2026-08-08']).primary, '0 weekdays');
  assert.match(calculateCore('salary', ['60000', '0', '52']).primary, /greater than zero/i);
  assert.equal(calculateCore('overtime', ['24', '0', '1.5']).primary, '$0.00');
});

test('salary and overtime reject unreasonable or overflowing finite inputs', () => {
  const excessiveSalary = calculateCore('salary', ['1e308', '1', '1']);
  assert.match(excessiveSalary.error ?? '', /no greater than \$1 trillion/i);
  assert.doesNotMatch(excessiveSalary.primary, /∞|Infinity|NaN/);

  assert.match(calculateCore('salary', ['60000', '169', '52']).error ?? '', /168 or less/i);
  assert.match(calculateCore('salary', ['60000', '40', '54']).error ?? '', /53 or less/i);

  const overflowingOvertime = calculateCore('overtime', ['1e308', '1e308', '2']);
  assert.match(overflowingOvertime.error ?? '', /no greater than \$1 trillion/i);
  assert.doesNotMatch(overflowingOvertime.primary, /∞|Infinity|NaN/);

  assert.match(calculateCore('overtime', ['24', '169', '1.5']).error ?? '', /168 or less/i);
  assert.match(calculateCore('overtime', ['24', '8', '101']).error ?? '', /100 or less/i);
});
