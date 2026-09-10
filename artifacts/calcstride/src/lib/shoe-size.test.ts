import assert from 'node:assert/strict';
import test from 'node:test';
import { findShoeSizeMatch, shoeGroupLabels, shoeSizeTables, type ShoeGroup } from './shoe-size';

test('shoe size converter exposes unambiguous child stages', () => {
  assert.deepEqual(Object.keys(shoeSizeTables), ['baby', 'toddler', 'littleKid', 'bigKid', 'women', 'men']);
  assert.equal(shoeGroupLabels.baby, 'Baby');
  assert.equal(shoeGroupLabels.toddler, 'Toddler');
  assert.equal(shoeGroupLabels.littleKid, 'Little kid');
  assert.equal(shoeGroupLabels.bigKid, 'Big kid / youth');
});

test('each stage keeps regional inputs unique and exact', () => {
  for (const group of Object.keys(shoeSizeTables) as ShoeGroup[]) {
    for (const region of ['us', 'uk', 'eu'] as const) {
      const values = shoeSizeTables[group].map((row) => row[region]);
      assert.equal(new Set(values).size, values.length, `${group} has duplicate ${region.toUpperCase()} labels`);
    }
  }
  assert.equal(findShoeSizeMatch('baby', 'EU', 19)?.cm, 11.4);
  assert.equal(findShoeSizeMatch('toddler', 'EU', 20)?.cm, 12.1);
  assert.equal(findShoeSizeMatch('littleKid', 'US', 13)?.eu, 31);
  assert.equal(findShoeSizeMatch('bigKid', 'US', 1)?.eu, 32);
  assert.equal(findShoeSizeMatch('bigKid', 'US', 1.5), undefined);
});

test('the child-stage tables remain contiguous by EU reference size', () => {
  const childRows = ['baby', 'toddler', 'littleKid', 'bigKid']
    .flatMap((group) => shoeSizeTables[group as ShoeGroup]);
  assert.deepEqual(childRows.map((row) => row.eu), Array.from({ length: 24 }, (_, index) => index + 16));
});
