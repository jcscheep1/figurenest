from pathlib import Path

path = Path('artifacts/calcstride/src/lib/phase-three-c-implementation.ts')
text = path.read_text()

replacements = [
    (
        "    fields: [text('lastPeriod', 'First day of last period', '2026-08-01', 'date'), n('cycleLength', 'Average cycle length (days)', '28', 21, 45, '1'), n('periodLength', 'Typical period length (days)', '5', 1, 10, '1')],",
        "    fields: [text('lastPeriod', 'First day of last period', '2026-08-01', 'date'), n('cycleLength', 'Average cycle length (days)', '28', 21, 45, '1')],",
    ),
    (
        "    validation: 'Cycle length must be 21–45 days, period length 1–10 days, and the date must be valid. The period length is displayed for planning but does not change the ovulation estimate.',",
        "    validation: 'Cycle length must be a whole number from 21–45 days and the last-period date must be valid.',",
    ),
    (
        "    const cycleLength = at(1), periodLength = at(2);\n    if (!validDate(values[0]) || cycleLength === null || periodLength === null || !Number.isInteger(cycleLength) || cycleLength < 21 || cycleLength > 45 || !Number.isInteger(periodLength) || periodLength < 1 || periodLength > 10) return error('Use a valid last-period date, cycle length of 21–45 days, and period length of 1–10 days.');",
        "    const cycleLength = at(1);\n    if (!validDate(values[0]) || cycleLength === null || !Number.isInteger(cycleLength) || cycleLength < 21 || cycleLength > 45) return error('Use a valid last-period date and a whole-number cycle length of 21–45 days.');",
    ),
]

for old, new in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'Guard failed: expected exactly one match, found {count}: {old[:80]!r}')
    text = text.replace(old, new)

path.write_text(text)

test_path = Path('artifacts/calcstride/src/lib/pregnancy-conception-input-contract-regression.test.ts')
test_path.write_text("""import { describe, expect, it } from 'vitest';
import { calculatePhaseThreeC, phaseThreeCDefinitions } from './phase-three-c-implementation';

describe('Pregnancy Conception input contract regression', () => {
  it('does not expose an unused period-length field', () => {
    expect(phaseThreeCDefinitions['pregnancy-conception'].fields.map((field) => field.key)).toEqual([
      'lastPeriod',
      'cycleLength',
    ]);
  });

  it('preserves the regular-cycle date estimate with the two inputs that actually drive it', () => {
    const result = calculatePhaseThreeC('pregnancy-conception', ['2026-08-01', '28']);
    expect(result.error).toBeUndefined();
    expect(result.primary).toBe('2026-08-29');
    expect(result.details).toEqual(expect.arrayContaining([
      { label: 'Estimated ovulation', value: '2026-08-15' },
      { label: 'Estimated fertile window', value: '2026-08-10 to 2026-08-16' },
    ]));
  });

  it('still rejects invalid cycle-length boundaries', () => {
    expect(calculatePhaseThreeC('pregnancy-conception', ['2026-08-01', '20']).error).toBeTruthy();
    expect(calculatePhaseThreeC('pregnancy-conception', ['2026-08-01', '28.5']).error).toBeTruthy();
    expect(calculatePhaseThreeC('pregnancy-conception', ['2026-08-01', '46']).error).toBeTruthy();
  });
});
""")
