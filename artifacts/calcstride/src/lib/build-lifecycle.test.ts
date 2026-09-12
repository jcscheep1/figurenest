import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as { scripts: Record<string, string> };

test('deployment build keeps the static audit explicit instead of running it as postbuild', () => {
  assert.equal(packageJson.scripts.postbuild, undefined);
  assert.equal(packageJson.scripts['audit:static'], 'tsx scripts/audit-built-site.ts');
  assert.equal(packageJson.scripts['build:static'], 'pnpm run build && pnpm run audit:static');
  assert.ok(!packageJson.scripts.build.includes('audit:static'));
  assert.ok(!packageJson.scripts.build.includes('audit-built-site'));
});
