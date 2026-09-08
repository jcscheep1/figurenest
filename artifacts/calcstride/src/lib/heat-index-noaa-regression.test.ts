import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhaseThreeA } from './phase-three-a';

test('Heat Index preserves the normal NOAA Rothfusz example', () => {
  const result = calculatePhaseThreeA('heat-index', ['90', 'F', '70']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '105.9 °F');
  assert.match(result.summary, /Rothfusz/i);
});

test('Heat Index accepts hot dry air and reaches the NOAA low-humidity adjustment', () => {
  const result = calculatePhaseThreeA('heat-index', ['95', 'F', '10']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '89.4 °F');
  assert.match(result.summary, /Rothfusz/i);
});

test('Heat Index uses the NOAA simple approximation when the initial heat index is below 80 F', () => {
  const result = calculatePhaseThreeA('heat-index', ['80', 'F', '10']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '79.1 °F');
  assert.match(result.summary, /Steadman/i);
});

test('Heat Index keeps humidity bounds and warm-temperature applicability explicit', () => {
  assert.match(calculatePhaseThreeA('heat-index', ['90', 'F', '101']).error ?? '', /0% to 100%/i);
  assert.match(calculatePhaseThreeA('heat-index', ['79', 'F', '70']).error ?? '', /at least 80 °F/i);
});
