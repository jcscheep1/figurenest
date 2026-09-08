import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('Date Calculator public identity stays aligned with the page heading and search intent', () => {
  const catalogSource = readFileSync(new URL('./catalog.ts', import.meta.url), 'utf8');
  const dateTool = catalogSource.match(/tool\('date-difference',[\s\S]*?\),\n/)?.[0];

  assert.ok(dateTool, 'date-difference must remain published in the local catalog');
  assert.match(dateTool, /'Date Calculator & Day Counter'/);
  assert.match(dateTool, /Count days between dates/i);
  assert.match(dateTool, /'date calculator'/);
  assert.match(dateTool, /'day counter calculator'/);
});
