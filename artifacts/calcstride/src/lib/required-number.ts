export const parseRequiredNumber = (value: string): number => {
  if (value.trim() === '') return Number.NaN;
  return Number(value);
};
