import assert from 'node:assert/strict';
import test from 'node:test';
import { publishedTools } from './catalog';
import { phaseFourDefinitions } from './phase-four';
import { phaseFourRoutes } from './phase-four-routes';
import { getSeoForPath } from './seo';

test('shoe size catalog and SEO describe the dedicated child-capable converter', () => {
  const definition = phaseFourDefinitions['shoe-size'];
  const route = phaseFourRoutes.find((entry) => entry.slug === 'shoe-size');
  const catalogTool = publishedTools.find((tool) => tool.slug === 'shoe-size');
  const seo = getSeoForPath('/converters/shoe-size');

  assert.ok(route);
  assert.ok(catalogTool);
  assert.equal(route.description, definition.description);
  assert.equal(catalogTool.description, definition.description);
  assert.equal(seo.description, definition.seoDescription);

  for (const scope of ['bab', 'child', 'women', 'men']) {
    assert.match(definition.description.toLowerCase(), new RegExp(scope));
    assert.match(seo.description.toLowerCase(), new RegExp(scope));
  }

  assert.match(definition.description.toLowerCase(), /toddler/);
  assert.match(definition.description.toLowerCase(), /youth/);
  assert.ok(route.tags.includes('baby shoe size'));
  assert.ok(route.tags.includes('kids shoe size'));
  assert.ok(route.tags.includes('women shoe size'));
  assert.ok(route.tags.includes('men shoe size'));
  assert.doesNotMatch(seo.description.toLowerCase(), /adult shoe sizes? across/);
});
