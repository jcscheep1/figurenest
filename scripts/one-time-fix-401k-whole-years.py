from pathlib import Path

source = Path('artifacts/calcstride/src/lib/phase-four.ts')
text = source.read_text()

old_field = "n('years','Years','20',1,60)"
new_field = "{...n('years','Years','20',1,60),step:'1'}"
if old_field not in text:
    raise SystemExit('401(k) years field target not found; refusing unsafe edit')
text = text.replace(old_field, new_field, 1)

old_calc = "if(slug==='401k'){const r=x[3]/100, years=x[4], deposits=x[1]+x[2];"
new_calc = "if(slug==='401k'){if(!Number.isInteger(x[4]))return err('Years must be a whole number because contributions are modeled annually.');const r=x[3]/100, years=x[4], deposits=x[1]+x[2];"
if old_calc not in text:
    raise SystemExit('401(k) calculation target not found; refusing unsafe edit')
source.write_text(text.replace(old_calc, new_calc, 1))

Path('artifacts/calcstride/src/lib/401k-whole-years-regression.test.ts').write_text("""import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour, phaseFourDefinitions } from './phase-four';

test('401(k) preserves the documented annual-compounding projection', () => {
  const result = calculatePhaseFour('401k', ['25000', '10000', '3000', '6', '20']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$558,391.07');
  assert.deepEqual(result.details, [
    { label: 'Current balance', value: '$25,000.00' },
    { label: 'Employee deposits', value: '$200,000.00' },
    { label: 'Employer deposits', value: '$60,000.00' },
  ]);
});

test('401(k) keeps zero-return annual contributions exact', () => {
  const result = calculatePhaseFour('401k', ['25000', '10000', '3000', '0', '20']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$285,000.00');
});

test('401(k) rejects fractional years because deposits are modeled annually', () => {
  const result = calculatePhaseFour('401k', ['25000', '10000', '3000', '6', '20.5']);
  assert.match(result.error ?? '', /whole number/i);
  assert.equal(result.details.length, 0);
});

test('401(k) years input advertises whole-year stepping', () => {
  const years = phaseFourDefinitions['401k'].fields.find((field) => field.key === 'years');
  assert.equal(years?.step, '1');
});
""")
