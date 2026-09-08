import assert from 'node:assert/strict';
import test from 'node:test';
import { findLocalTool } from './catalog';

test('Date Calculator public identity matches the page heading and search intent', () => {
  const tool = findLocalTool('date-difference');
  assert.ok(tool, 'date-difference must remain published');
  assert.equal(tool.name, 'Date Calculator & Day Counter');
  assert.match(tool.description, /count days between dates/i);
  assert.ok(tool.tags.includes('date calculator'));
  assert.ok(tool.tags.includes('day counter calculator'));
});
