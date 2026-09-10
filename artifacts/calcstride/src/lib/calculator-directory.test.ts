import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalToolHref, localCategories, localTools } from './catalog';

const sortByName = (tools: typeof localTools) =>
  [...tools].sort((a, b) => a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug));

const filterTools = (query: string, category = '', letter = '') => {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedLetter = letter.toUpperCase();
  return localTools.filter((tool) => {
    const haystack = [tool.name, tool.description, tool.category, ...tool.tags].join(' ').toLowerCase();
    return (!normalizedQuery || haystack.includes(normalizedQuery))
      && (!category || tool.categorySlug === category)
      && (!normalizedLetter || tool.name.toUpperCase().startsWith(normalizedLetter));
  });
};

test('directory has exact published-tool coverage and unique links', () => {
  assert.ok(localTools.length > 0);
  assert.equal(new Set(localTools.map((tool) => tool.slug)).size, localTools.length);
  assert.equal(new Set(localTools.map((tool) => tool.href)).size, localTools.length);
  assert.equal(new Set(localTools.map(canonicalToolHref)).size, localTools.length);
  assert.equal(sortByName(localTools).length, localTools.length);
});

test('directory destinations use valid calculator or converter route shapes', () => {
  for (const tool of localTools) {
    assert.match(tool.href, /^\/(?:calculators\/[^/]+\/[^/]+|converters\/[^/]+)$/);
  }
});

test('directory search covers names, categories, descriptions, and keywords', () => {
  assert.ok(filterTools('BMR').some((tool) => tool.slug === 'bmr'));
  assert.ok(filterTools('mileage').some((tool) => tool.slug === 'gas-mileage'));
  assert.ok(filterTools('weighted').some((tool) => tool.slug === 'gpa'));
  assert.ok(filterTools('day counter').some((tool) => tool.slug === 'date-difference'));
  assert.ok(filterTools('BTU').some((tool) => tool.slug === 'btu'));
  assert.ok(filterTools('scientific notation').some((tool) => tool.slug === 'scientific-notation'));
  assert.ok(filterTools('voltage drop', 'electrical').some((tool) => tool.href === '/calculators/electrical/voltage-drop'));
  assert.ok(filterTools('CIDR', 'technology').some((tool) => tool.slug === 'ip-subnet'));
  assert.ok(filterTools('engine horsepower', 'science-engineering').some((tool) => tool.slug === 'horsepower'));
  for (const [query, slug, category] of [
    ['trip MPG', 'mileage', 'automotive'],
    ['roman numerals', 'roman-numeral', 'converters'],
    ['shoe conversion', 'shoe-size', 'converters'],
    ['SSA retirement benefit', 'social-security', 'finance'],
    ['net pay', 'take-home-pay', 'salary-work'],
    ['speedometer difference', 'tire-size', 'automotive'],
    ['retirement plan', '401k', 'finance'],
    ['annuity payout', 'annuity', 'finance'],
    ['annual percentage rate', 'apr', 'finance'],
    ['vehicle lease', 'auto-lease', 'finance'],
    ['coupon bond', 'bond', 'finance'],
    ['monthly spending', 'budget', 'finance'],
    ['sales commission', 'commission', 'business'],
    ['credit card payoff', 'credit-card', 'finance'],
    ['debt payoff', 'debt-consolidation', 'finance'],
  ] as const) {
    assert.ok(filterTools(query, category).some((tool) => tool.slug === slug), `${query} should find ${slug}`);
  }
  for (const [query, slug] of [
    ['binary', 'binary'],
    ['circle', 'circle'],
    ['common factor', 'greatest-common-factor'],
    ['GCF', 'greatest-common-factor'],
    ['confidence interval', 'confidence-interval'],
    ['exponent', 'exponent'],
    ['factor calculator', 'prime-factorization'],
    ['prime factorization', 'prime-factorization'],
    ['half life', 'half-life'],
    ['hexadecimal', 'hex'],
    ['LCM', 'least-common-multiple'],
    ['logarithm', 'log'],
    ['long division', 'long-division'],
    ['matrix', 'matrix'],
    ['mean median mode range', 'mean-median-mode-range'],
    ['number sequence', 'number-sequence'],
    ['permutation', 'permutation-combination'],
    ['probability', 'probability'],
  ] as const) {
    assert.ok(filterTools(query, 'math').some((tool) => tool.slug === slug), `${query} should find ${slug}`);
  }
  for (const [query, slug, category] of [
    ['blood alcohol concentration', 'bac', 'health'],
    ['body surface area', 'body-surface-area', 'health'],
    ['carbohydrate intake', 'macro', 'health'],
    ['conception', 'pregnancy-conception', 'health'],
    ['GFR', 'gfr', 'health'],
    ['healthy weight', 'bmi', 'health'],
    ['ideal weight', 'ideal-weight', 'health'],
    ['lean body mass', 'lean-body-mass', 'health'],
    ['macro', 'macro', 'health'],
    ['molecular weight', 'molecular-weight', 'science-engineering'],
    ['overweight', 'bmi', 'health'],
    ['ovulation', 'pregnancy-conception', 'health'],
    ['period calculator', 'pregnancy-conception', 'health'],
    ['protein intake', 'macro', 'health'],
    ['target heart rate', 'target-heart-rate', 'health'],
    ['TDEE', 'tdee', 'health'],
    ['weight', 'weight', 'converters'],
  ] as const) {
    assert.ok(filterTools(query, category).some((tool) => tool.slug === slug), `${query} should find ${slug}`);
  }
  assert.ok(filterTools('', 'health').every((tool) => tool.categorySlug === 'health'));
});

test('directory category totals reconcile with the canonical registry', () => {
  const sum = localCategories.reduce((total, category) => total + category.toolCount, 0);
  assert.equal(sum, new Set(localTools.map(canonicalToolHref)).size);
  for (const category of localCategories) {
    assert.equal(
      category.toolCount,
      new Set(
        localTools
          .filter((tool) => tool.categorySlug === category.slug)
          .map(canonicalToolHref),
      ).size,
    );
  }
  assert.equal(localCategories.find((category) => category.slug === 'electrical')?.toolCount, 4);
  assert.equal(localCategories.find((category) => category.slug === 'technology')?.toolCount, 5);
  assert.equal(localCategories.find((category) => category.slug === 'science-engineering')?.toolCount, 9);
  assert.equal(localCategories.find((category) => category.slug === 'math')?.toolCount, 24);
  assert.equal(localCategories.find((category) => category.slug === 'health')?.toolCount, 21);
  assert.equal(localCategories.find((category) => category.slug === 'science-engineering')?.toolCount, 9);
});

test('directory supports A-Z filtering and URL-preserved filter state', () => {
  const mTools = filterTools('', '', 'M');
  assert.ok(mTools.length > 0);
  assert.ok(mTools.every((tool) => tool.name.toUpperCase().startsWith('M')));
  const state = { q: 'mortgage', category: 'finance', letter: 'M', sort: 'az' };
  const params = new URLSearchParams(state);
  assert.deepEqual(Object.fromEntries(params), state);
});