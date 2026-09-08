import assert from 'node:assert/strict';
import test from 'node:test';
import { publishedTools } from './catalog';
import { getHomeConstructionRelatedTools } from './home-construction-hub';

test('Home & Construction exposes the published Electrical calculators as a related field', () => {
  const { btuTool, electricalTools } = getHomeConstructionRelatedTools(publishedTools);

  assert.equal(btuTool?.slug, 'btu');
  assert.deepEqual(
    electricalTools.map((tool) => tool.slug).sort(),
    ['electricity', 'ohms-law', 'resistor', 'voltage-drop'],
  );
  assert.ok(electricalTools.every((tool) => tool.categorySlug === 'electrical'));
  assert.ok(electricalTools.every((tool) => tool.href.startsWith('/calculators/electrical/')));
});
