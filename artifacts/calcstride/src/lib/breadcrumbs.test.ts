import assert from 'node:assert/strict';
import test from 'node:test';
import { breadcrumbListSchema, getBreadcrumbItems } from './breadcrumbs';
import { publicRouteKeys } from './seo';
import { normalizeRoutePath, SITE_ORIGIN, toCanonicalUrl } from './public-url';

test('every public route except the homepage has a complete breadcrumb trail', () => {
  for (const route of publicRouteKeys) {
    const items = getBreadcrumbItems(route);
    if (normalizeRoutePath(route) === '/') {
      assert.deepEqual(items, []);
      continue;
    }
    assert.ok(items.length >= 2, `${route} should have at least Home and current page`);
    assert.deepEqual(items[0], { label: 'Home', path: '/' });
    assert.equal(normalizeRoutePath(items.at(-1)!.path), normalizeRoutePath(route));
    assert.ok(items.every((item) => item.label.trim().length > 0));
  }
});

test('every breadcrumb ancestor resolves to a public route', () => {
  const publicPaths = new Set(publicRouteKeys.map(normalizeRoutePath));
  for (const route of publicRouteKeys.filter((item) => item !== '/')) {
    const ancestors = getBreadcrumbItems(route).slice(0, -1);
    for (const item of ancestors) {
      assert.ok(publicPaths.has(normalizeRoutePath(item.path)), `${route} has broken breadcrumb ancestor ${item.path}`);
    }
  }
});

test('BreadcrumbList schema exactly matches visible breadcrumb metadata', () => {
  for (const route of publicRouteKeys.filter((item) => item !== '/')) {
    const items = getBreadcrumbItems(route);
    const schema = breadcrumbListSchema(items);
    assert.equal(schema.itemListElement.length, items.length);
    schema.itemListElement.forEach((entry, index) => {
      assert.equal(entry.position, index + 1);
      assert.equal(entry.name, items[index].label);
      assert.equal(entry.item, toCanonicalUrl(items[index].path));
      assert.ok(entry.item.startsWith(`${SITE_ORIGIN}/`));
    });
  }
});

test('representative hierarchies use meaningful section labels', () => {
  assert.deepEqual(
    getBreadcrumbItems('/calculators/finance/mortgage').map((item) => item.label),
    ['Home', 'Money & Finance', 'Mortgage Calculator'],
  );
  assert.deepEqual(
    getBreadcrumbItems('/calculators/construction/deck-material').map((item) => item.label),
    ['Home', 'Home & Construction', 'Deck Material Calculator'],
  );
  assert.deepEqual(
    getBreadcrumbItems('/articles/construction-materials-estimating').map((item) => item.label),
    ['Home', 'Articles', 'Construction materials estimating'],
  );
});