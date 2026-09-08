import { describe, expect, it } from 'vitest';
import { localTools } from './catalog';
import { getRequestRedirect, legacyRedirectPaths } from './redirects';

const canonicalInterestPath = '/calculators/finance/simple-interest/';

describe('simple-interest intent consolidation', () => {
  it('publishes only the canonical Simple Interest calculator', () => {
    expect(localTools.some((tool) => tool.slug === 'interest')).toBe(false);
    expect(localTools.some((tool) =>
      tool.slug === 'simple-interest' && tool.href === '/calculators/finance/simple-interest'
    )).toBe(true);
  });

  it('permanently routes both legacy Interest URL shapes to Simple Interest', () => {
    for (const pathname of ['/calculators/finance/interest', '/calculators/finance/interest/']) {
      expect(legacyRedirectPaths).toContain(pathname);
      expect(getRequestRedirect({
        hostname: 'figurenest.com',
        protocol: 'https:',
        pathname,
        search: '?principal=1000&rate=5',
      })).toBe(`https://figurenest.com${canonicalInterestPath}?principal=1000&rate=5`);
    }
  });
});
