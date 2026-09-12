import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const EXPECTED_SOURCE = 'https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz';
const EXPECTED_VERSION = '0.20.3';
const EXPECTED_LICENSE = 'Apache-2.0';

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

test('FT-09 pins SheetJS CE to the reviewed authoritative source and metadata', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const appPackage = readJson(join(here, '..', '..', 'package.json'));
  const dependencies = appPackage.dependencies as Record<string, string>;

  assert.equal(
    dependencies.xlsx,
    EXPECTED_SOURCE,
    'FT-09 must not drift to npm xlsx@0.18.5, latest, or another unreviewed source',
  );

  const require = createRequire(import.meta.url);
  const installedEntry = require.resolve('xlsx');
  const installedPackage = readJson(join(dirname(installedEntry), 'package.json'));

  assert.equal(installedPackage.version, EXPECTED_VERSION);
  assert.equal(installedPackage.license, EXPECTED_LICENSE);
});

test('FT-09 lockfile keeps the exact reviewed tarball URL', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const lockfile = readFileSync(join(here, '..', '..', '..', '..', 'pnpm-lock.yaml'), 'utf8');

  assert.match(lockfile, /xlsx:\n\s+specifier: https:\/\/cdn\.sheetjs\.com\/xlsx-0\.20\.3\/xlsx-0\.20\.3\.tgz\n\s+version: https:\/\/cdn\.sheetjs\.com\/xlsx-0\.20\.3\/xlsx-0\.20\.3\.tgz/);
  assert.doesNotMatch(lockfile, /xlsx:\n\s+specifier: (?:\^|~|>=|latest|0\.18\.5)/);
});
