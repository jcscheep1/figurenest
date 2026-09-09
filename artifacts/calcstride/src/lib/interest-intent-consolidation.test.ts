import test from 'node:test';
import assert from 'node:assert/strict';
import { localTools } from './catalog';
import { getRequestRedirect, legacyRedirectPaths } from './redirects';

const canonicalInterestPath = '/calculators/finance/simple-interest/';

test('publishes only the canonical Simple Interest calculator', () => {
  assert.equal(localTools.some((tool) => tool.slug === 'interest'), false);
  assert.equal(localTools.some((tool) =>
    tool.slug === 'simple-interest' && tool.href === '/calculators/finance/simple-interest'
  ), true);
});

test('permanently routes both legacy Interest URL shapes to Simple Interest', () => {
  for (const pathname of ['/calculators/finance/interest', '/calculators/finance/interest/']) {
    assert.ok(legacyRedirectPaths.includes(pathname));
    assert.equal(getRequestRedirect({
      hostname: 'figurenest.com',
      protocol: 'https:',
      pathname,
      search: '?principal=1000&rate=5',
    }), `https://figurenest.com${canonicalInterestPath}?principal=1000&rate=5`);
  }
});
