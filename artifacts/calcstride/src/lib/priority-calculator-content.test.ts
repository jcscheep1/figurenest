import assert from 'node:assert/strict';
import test from 'node:test';
import { phaseFourDefinitions, phaseFourUsefulWordCount } from './phase-four';
import { phaseTwoDefinitions, phaseTwoUsefulWordCount } from './phase-two-expansion';
import { priorityOneExpansionDefinitions, priorityOneUsefulWordCount } from './priority-one-expansion';

const requestedPriorityPages = {
  phaseTwo: ['average-return', 'percent-off', 'btu', 'average', 'fraction', 'percent-error', 'scientific', 'scientific-notation', 'time-duration', 'voltage-drop', 'day-of-week', 'hours', 'time', 'time-card', 'time-zone'] as const,
  priorityOne: ['discount', 'estate-tax', 'interest', 'investment', 'sales-tax', 'student-loan', 'tax', 'tip', 'uk-mortgage', 'va-mortgage', 'gas-mileage', 'bmr', 'body-fat', 'calorie', 'calories-burned', 'due-date', 'pace', 'pregnancy', 'gpa', 'grade', 'currency'] as const,
  phaseFour: ['mileage', 'take-home-pay', 'commission', 'shoe-size'] as const,
};

test('every named priority calculator has substantial, distinct, appropriately safe registry prose', () => {
  const pages = [
    ...requestedPriorityPages.phaseTwo.map((slug) => ({ slug, family: 'phaseTwo', words: phaseTwoUsefulWordCount(phaseTwoDefinitions[slug]), copy: JSON.stringify(phaseTwoDefinitions[slug]) })),
    ...requestedPriorityPages.priorityOne.map((slug) => ({ slug, family: 'priorityOne', words: priorityOneUsefulWordCount(priorityOneExpansionDefinitions[slug]), copy: JSON.stringify(priorityOneExpansionDefinitions[slug]) })),
    ...requestedPriorityPages.phaseFour.map((slug) => ({ slug, family: 'phaseFour', words: phaseFourUsefulWordCount(phaseFourDefinitions[slug]), copy: JSON.stringify(phaseFourDefinitions[slug]) })),
  ];
  assert.equal(pages.length, 40, 'the named priority list must not silently shrink');
  for (const page of pages) assert.ok(page.words >= 500, `${page.family}:${page.slug} has ${page.words} registry words`);
  assert.equal(new Set(pages.map((page) => page.copy.toLowerCase().replace(/[^a-z0-9]+/g, ' '))).size, pages.length, 'priority pages must not duplicate whole registry content');

  for (const slug of ['discount', 'estate-tax', 'interest', 'investment', 'sales-tax', 'student-loan', 'tax', 'tip', 'uk-mortgage', 'va-mortgage'] as const) {
    assert.match(JSON.stringify(priorityOneExpansionDefinitions[slug]), /planning only/i, slug);
  }
  for (const slug of ['bmr', 'body-fat', 'calorie', 'calories-burned', 'due-date', 'pace', 'pregnancy'] as const) {
    assert.match(JSON.stringify(priorityOneExpansionDefinitions[slug]), /not a diagnosis/i, slug);
  }
  assert.match(JSON.stringify(priorityOneExpansionDefinitions.currency), /does not retrieve a live foreign-exchange rate/i);
  assert.match(JSON.stringify(phaseFourDefinitions['shoe-size']), /brand.*last|last.*brand/i);
});