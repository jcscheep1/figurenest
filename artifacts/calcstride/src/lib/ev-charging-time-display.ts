const decimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function formatEvChargingTimeDisplay(hours: number) {
  const totalMinutes = Math.round(hours * 60);
  const hoursDisplay = hours > 0 && hours < 0.01 ? '<0.01' : decimal.format(hours);
  const durationDisplay = hours > 0 && totalMinutes === 0
    ? '<1 min'
    : `${Math.floor(totalMinutes / 60)} hr ${totalMinutes % 60} min`;

  return {
    primary: `${hoursDisplay} hours`,
    duration: durationDisplay,
  };
}
