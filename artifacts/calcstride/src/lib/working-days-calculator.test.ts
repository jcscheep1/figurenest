import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateWorkingDays } from './working-days-calculator';

const basic = (start: string, end: string) => calculateWorkingDays({
  start,
  end,
  advanced: false,
  holidays: '',
  workdays: '1,2,3,4,5',
});

test('counts an inclusive Monday-Friday range', () => {
  const result = basic('2026-09-01', '2026-09-30');
  assert.deepEqual(result, {
    ok: true,
    workingDays: 22,
    calendarDays: 30,
    nonWorkingScheduleDays: 8,
    excludedDates: 0,
  });
});

test('reversed endpoints produce the same result', () => {
  assert.deepEqual(basic('2026-09-30', '2026-09-01'), basic('2026-09-01', '2026-09-30'));
});

test('advanced mode excludes each valid active date once', () => {
  const result = calculateWorkingDays({
    start: '2026-09-01',
    end: '2026-09-30',
    advanced: true,
    holidays: '2026-09-21, 2026-09-21 2026-09-20',
    workdays: '1,2,3,4,5',
  });
  assert.deepEqual(result, {
    ok: true,
    workingDays: 21,
    calendarDays: 30,
    nonWorkingScheduleDays: 8,
    excludedDates: 1,
  });
});

test('invalid manually excluded dates are rejected instead of silently ignored', () => {
  const result = calculateWorkingDays({
    start: '2026-09-01',
    end: '2026-09-30',
    advanced: true,
    holidays: '2026-02-30',
    workdays: '1,2,3,4,5',
  });
  assert.deepEqual(result, { ok: false, error: 'Invalid excluded date: 2026-02-30. Use YYYY-MM-DD.' });
});

test('large ranges use bounded arithmetic and retain inclusive semantics', () => {
  const result = basic('1900-01-01', '2100-12-31');
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.calendarDays, 73414);
    assert.ok(result.workingDays > 52000 && result.workingDays < 53000);
  }
});
