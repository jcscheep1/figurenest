from pathlib import Path

source = Path('artifacts/calcstride/src/lib/phase-three-a.ts')
text = source.read_text()

old_edge = "edge: 'The regression is intended for temperatures of at least 80 °F and humidity of at least 40%; inputs outside that range receive an explicit applicability error.',"
new_edge = "edge: 'For temperatures of at least 80 °F, NOAA first screens conditions with a simpler Steadman approximation; when that heat-index estimate reaches 80 °F, the Rothfusz regression and its low- or high-humidity adjustments apply. Relative humidity may range from 0% through 100%.',"

old_block = """      const t = toFahrenheit(temperature, values[1]);
      if (t < 80 || humidity < 40) return bad('The NOAA regression applies at 80 °F or warmer and at least 40% relative humidity.');
      let heat = -42.379 + 2.04901523*t + 10.14333127*humidity - 0.22475541*t*humidity - 0.00683783*t*t - 0.05481717*humidity*humidity + 0.00122874*t*t*humidity + 0.00085282*t*humidity*humidity - 0.00000199*t*t*humidity*humidity;
      if (humidity < 13 && t >= 80 && t <= 112) heat -= ((13-humidity)/4)*Math.sqrt((17-Math.abs(t-95))/17);
      if (humidity > 85 && t >= 80 && t <= 87) heat += ((humidity-85)/10)*((87-t)/5);
      return result(`${format(heat, 1)} °F`, 'NOAA Rothfusz-regression heat index.', [{ label: 'Heat index Celsius', value: `${format((heat - 32) * 5 / 9, 1)} °C` }]);"""
new_block = """      const t = toFahrenheit(temperature, values[1]);
      if (t < 80) return bad('Use an air temperature of at least 80 °F for this heat-index estimate.');
      const simple = 0.5 * (t + 61 + (t - 68) * 1.2 + humidity * 0.094);
      let heat = (simple + t) / 2;
      let method = 'NOAA Steadman-approximation heat index.';
      if (heat >= 80) {
        heat = -42.379 + 2.04901523*t + 10.14333127*humidity - 0.22475541*t*humidity - 0.00683783*t*t - 0.05481717*humidity*humidity + 0.00122874*t*t*humidity + 0.00085282*t*humidity*humidity - 0.00000199*t*t*humidity*humidity;
        if (humidity < 13 && t >= 80 && t <= 112) heat -= ((13-humidity)/4)*Math.sqrt((17-Math.abs(t-95))/17);
        if (humidity > 85 && t >= 80 && t <= 87) heat += ((humidity-85)/10)*((87-t)/5);
        method = 'NOAA Rothfusz-regression heat index.';
      }
      return result(`${format(heat, 1)} °F`, method, [{ label: 'Heat index Celsius', value: `${format((heat - 32) * 5 / 9, 1)} °C` }]);"""

if old_edge in text:
    text = text.replace(old_edge, new_edge, 1)
elif new_edge not in text:
    raise SystemExit('Heat Index edge-content target not found')

if old_block in text:
    text = text.replace(old_block, new_block, 1)
elif new_block not in text:
    raise SystemExit('Heat Index calculation target not found')

source.write_text(text)

test = Path('artifacts/calcstride/src/lib/heat-index-noaa-regression.test.ts')
test.write_text("""import test from 'node:test';
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
""")
