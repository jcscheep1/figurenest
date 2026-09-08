export const WHOLE_MINUTE_DURATION_ERROR = 'Enter a duration that resolves to whole minutes; seconds are not supported.';

export function validateWholeMinuteDuration(hoursRaw: string, minutesRaw: string): string | undefined {
  if (!hoursRaw.trim() || !minutesRaw.trim()) return undefined;

  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return undefined;

  const totalMinutes = hours * 60 + minutes;
  return Number.isInteger(totalMinutes) ? undefined : WHOLE_MINUTE_DURATION_ERROR;
}
