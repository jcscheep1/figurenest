export type Mode = 'change' | 'difference' | 'reverse';
export type PercentageChangeMode = Mode;
export type ChangeDirection = 'increase' | 'decrease' | 'no-change';
export type ReverseDirection = 'increase' | 'decrease';

export type PercentageChangeInput =
  | { mode: 'change'; original: number; newValue: number }
  | { mode: 'difference'; firstValue: number; secondValue: number }
  | { mode: 'reverse'; finalValue: number; rate: number; direction: ReverseDirection };

export type ResultDetail = { label: string; value: string };

export type PercentageChangeResult =
  | {
      ok: true;
      mode: Mode;
      primary: string;
      summary: string;
      breakdown: ResultDetail[];
      explanation: string;
      error: null;
      direction?: ChangeDirection | ReverseDirection;
      value: number;
    }
  | {
      ok: false;
      mode: Mode;
      primary: 'Unable to calculate';
      summary: string;
      breakdown: [];
      explanation: string;
      error: string;
    };

export type PercentageChangeFaq = { question: string; answer: string };
export type PercentageChangeExample = {
  mode: Mode;
  title: string;
  inputs: string;
  working: string;
  result: string;
};
export type ModeContent = {
  formula: string;
  example: string;
  whenToUse: string;
  instructions: readonly string[];
};

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });
const percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const scientificFormatter = new Intl.NumberFormat('en-US', { notation: 'scientific', maximumFractionDigits: 6 });
const normalizeZero = (value: number) => Object.is(value, -0) ? 0 : value;
const displayNumber = (value: number) => {
  const normalized = normalizeZero(value);
  const magnitude = Math.abs(normalized);
  return magnitude >= 1e15 || (magnitude > 0 && magnitude < 1e-6)
    ? scientificFormatter.format(normalized)
    : numberFormatter.format(normalized);
};
const displayPercent = (value: number) => {
  const normalized = normalizeZero(value);
  return `${Math.abs(normalized) >= 1e15 ? scientificFormatter.format(normalized) : percentFormatter.format(normalized)}%`;
};
const finite = (...values: number[]) => values.every(Number.isFinite);
const parseUiNumber = (value?: string) => value?.trim() ? Number(value) : Number.NaN;

const failure = (mode: Mode, error: string): PercentageChangeResult => ({
  ok: false,
  mode,
  primary: 'Unable to calculate',
  summary: error,
  breakdown: [],
  explanation: error,
  error,
});

export const percentageChangeDefaults = (mode: Mode): Record<string, string> => {
  if (mode === 'change') return { original: '120', new: '156' };
  if (mode === 'difference') return { a: '50', b: '40' };
  return { final: '156', percent: '30', type: 'increase' };
};

const parseUiInput = (mode: Mode, values: Record<string, string>): PercentageChangeInput => {
  if (mode === 'change') {
    return { mode, original: parseUiNumber(values.original), newValue: parseUiNumber(values.new) };
  }
  if (mode === 'difference') {
    return { mode, firstValue: parseUiNumber(values.a), secondValue: parseUiNumber(values.b) };
  }
  return {
    mode,
    finalValue: parseUiNumber(values.final),
    rate: values.type === 'increase' || values.type === 'decrease'
      ? parseUiNumber(values.percent)
      : Number.NaN,
    direction: values.type === 'decrease' ? 'decrease' : 'increase',
  };
};

export function calculatePercentageChange(input: PercentageChangeInput): PercentageChangeResult;
export function calculatePercentageChange(mode: Mode, values: Record<string, string>): PercentageChangeResult;
export function calculatePercentageChange(
  inputOrMode: PercentageChangeInput | Mode,
  values?: Record<string, string>,
): PercentageChangeResult {
  const input = typeof inputOrMode === 'string'
    ? parseUiInput(inputOrMode, values ?? {})
    : inputOrMode;

  if (input.mode === 'change') {
    if (!finite(input.original, input.newValue)) {
      return failure(input.mode, 'Enter finite numbers for the original and new values.');
    }
    if (input.original === 0) {
      return failure(input.mode, 'Percentage change is undefined when the original value is zero because there is no non-zero baseline.');
    }

    const direction: ChangeDirection = input.newValue > input.original
      ? 'increase'
      : input.newValue < input.original
        ? 'decrease'
        : 'no-change';
    const baseline = Math.abs(input.original);
    const relativeNewValue = input.newValue / baseline;
    const percentageChange = (relativeNewValue - Math.sign(input.original)) * 100;
    if (!finite(relativeNewValue, percentageChange)) {
      return failure(input.mode, 'These values produce a percentage change beyond the supported numeric range.');
    }

    const signedChange = input.newValue - input.original;
    const absoluteChange = Math.abs(signedChange);
    const changeIsDisplayable = finite(signedChange, absoluteChange);
    const signedChangeDisplay = changeIsDisplayable
      ? displayNumber(signedChange)
      : `${direction === 'increase' ? 'More than' : 'Less than'} ${displayNumber(direction === 'increase' ? Number.MAX_VALUE : -Number.MAX_VALUE)}`;
    const absoluteChangeDisplay = changeIsDisplayable
      ? displayNumber(absoluteChange)
      : `More than ${displayNumber(Number.MAX_VALUE)}`;
    const magnitude = Math.abs(percentageChange);
    const primary = direction === 'no-change' ? 'No change (0%)' : `${displayPercent(magnitude)} ${direction}`;
    const explanation = direction === 'no-change'
      ? 'The new value equals the original value, so the absolute and percentage changes are both zero.'
      : `The value ${direction === 'increase' ? 'rose' : 'fell'} by ${absoluteChangeDisplay}, which is ${displayPercent(magnitude)} of the original baseline.`;

    return {
      ok: true,
      mode: input.mode,
      primary,
      summary: explanation,
      breakdown: [
        { label: 'Original value', value: displayNumber(input.original) },
        { label: 'New value', value: displayNumber(input.newValue) },
        { label: 'Absolute change', value: absoluteChangeDisplay },
        { label: 'Signed change', value: signedChangeDisplay },
      ],
      explanation,
      error: null,
      direction,
      value: percentageChange,
    };
  }

  if (input.mode === 'difference') {
    if (!finite(input.firstValue, input.secondValue)) {
      return failure(input.mode, 'Enter finite numbers for both comparison values.');
    }
    if (input.firstValue < 0 || input.secondValue < 0) {
      return failure(input.mode, 'Percentage difference requires two non-negative comparison values.');
    }
    if (input.firstValue === 0 && input.secondValue === 0) {
      return failure(input.mode, 'Percentage difference is undefined when both values are zero because their average is zero.');
    }

    const absoluteDifference = Math.abs(input.firstValue - input.secondValue);
    const average = input.firstValue / 2 + input.secondValue / 2;
    const percentageDifference = absoluteDifference / average * 100;
    if (!finite(absoluteDifference, average, percentageDifference)) {
      return failure(input.mode, 'These values produce a percentage difference beyond the supported numeric range.');
    }
    const explanation = `The absolute difference, ${displayNumber(absoluteDifference)}, is ${displayPercent(percentageDifference)} of the two values' average, ${displayNumber(average)}.`;
    return {
      ok: true,
      mode: input.mode,
      primary: displayPercent(percentageDifference),
      summary: explanation,
      breakdown: [
        { label: 'Absolute difference', value: displayNumber(absoluteDifference) },
        { label: 'Average', value: displayNumber(average) },
        { label: 'Percentage difference', value: displayPercent(percentageDifference) },
      ],
      explanation,
      error: null,
      value: percentageDifference,
    };
  }

  if (!finite(input.finalValue, input.rate)) {
    return failure(input.mode, 'Enter a finite final value and percentage rate.');
  }
  if (input.rate < 0) {
    return failure(input.mode, 'The percentage rate must be non-negative.');
  }
  if (input.direction === 'decrease' && input.rate >= 100) {
    return failure(input.mode, 'A reverse decrease requires a rate below 100% so the original value is defined.');
  }

  const factor = input.direction === 'increase' ? 1 + input.rate / 100 : 1 - input.rate / 100;
  const originalValue = input.finalValue / factor;
  if (!finite(factor, originalValue)) {
    return failure(input.mode, 'These values produce an original value beyond the supported numeric range.');
  }
  const explanation = `Before a ${displayPercent(input.rate)} ${input.direction}, the original value was ${displayNumber(originalValue)}.`;
  return {
    ok: true,
    mode: input.mode,
    primary: displayNumber(originalValue),
    summary: explanation,
    breakdown: [
      { label: 'Final value', value: displayNumber(input.finalValue) },
      { label: `${input.direction === 'increase' ? 'Increase' : 'Decrease'} rate`, value: displayPercent(input.rate) },
      { label: 'Reverse factor', value: displayNumber(factor) },
      { label: 'Original value', value: displayNumber(originalValue) },
    ],
    explanation,
    error: null,
    direction: input.direction,
    value: originalValue,
  };
}

const changeContent: ModeContent = {
  formula: '((New value − original value) ÷ |original value|) × 100',
  example: 'From 80 to 100: ((100 − 80) ÷ 80) × 100 = 25% increase; the absolute change is 20.',
  whenToUse: 'Use percentage change when one value is the original baseline and another is the later or updated value.',
  instructions: ['Enter the original value.', 'Enter the new value.', 'Read the direction, percentage magnitude, and absolute change.'],
};
const differenceContent: ModeContent = {
  formula: '(|First value − second value| ÷ ((first value + second value) ÷ 2)) × 100',
  example: 'Comparing 40 and 60: |40 − 60| ÷ 50 × 100 = 40% difference.',
  whenToUse: 'Use percentage difference to compare two non-negative values when neither one is an original baseline.',
  instructions: ['Enter the first non-negative value.', 'Enter the second non-negative value.', 'Read the difference relative to their average.'],
};
const reverseContent: ModeContent = {
  formula: 'Final ÷ (1 + rate ÷ 100) for an increase; final ÷ (1 − rate ÷ 100) for a decrease',
  example: 'After a 20% decrease the final value is 80: 80 ÷ (1 − 0.20) = 100.',
  whenToUse: 'Use reverse percentage when you know a final value and rate but need the value before the increase or decrease.',
  instructions: ['Enter the final value.', 'Enter a non-negative rate.', 'Choose increase or decrease to recover the original value.'],
};

const examples: PercentageChangeExample[] = [
  { mode: 'change', title: 'Price increase', inputs: 'Original 80; new 100', working: '((100 − 80) ÷ 80) × 100', result: '25% increase; absolute change 20' },
  { mode: 'difference', title: 'Compare measurements', inputs: 'First 40; second 60', working: '|40 − 60| ÷ 50 × 100', result: '40% difference' },
  { mode: 'reverse', title: 'Before a decrease', inputs: 'Final 80; decrease 20%', working: '80 ÷ (1 − 0.20)', result: 'Original value 100' },
];

const faqs: PercentageChangeFaq[] = [
  { question: 'How do I calculate percentage change?', answer: 'Subtract the original value from the new value, divide by the absolute original value, and multiply by 100. The change sign identifies an increase or decrease.' },
  { question: 'What is the difference between percentage change and percentage difference?', answer: 'Percentage change uses an original baseline and answers how far the later value moved relative to that starting point. Percentage difference treats two non-negative values equally and compares their absolute difference with their average. Use change for before-and-after data; use difference when neither measurement is the baseline.' },
  { question: 'Why is percentage change undefined when the original value is zero?', answer: 'The formula divides by the original value. A zero baseline requires division by zero, so no finite percentage change exists.' },
  { question: 'Can percentage difference be more than 100%?', answer: 'Yes. For non-negative values it can reach 200%, such as when one value is zero and the other is positive.' },
  { question: 'How do I reverse a percentage increase?', answer: 'Divide the final value by one plus the rate as a decimal. To reverse a 25% increase, divide by 1.25.' },
  { question: 'How do I reverse a percentage decrease?', answer: 'Divide the final value by one minus the rate as a decimal. The decrease rate must be below 100%.' },
  { question: 'Does a 20% decrease undo a 20% increase?', answer: 'No. They use different baselines. Increasing 100 by 20% gives 120, but decreasing 120 by 20% gives 96 because the decrease is calculated from 120. To return from 120 to 100 requires a 16.67% decrease. This baseline effect is important when reading price changes, investment losses, test scores, and repeated growth rates.' },
  { question: 'What is absolute change?', answer: 'Absolute change is the distance between the original and new values without regard to direction. Signed change separately shows whether the value rose or fell. Report the absolute change with its original unit—for example, euros, kilograms, points, or people—while the percentage describes that movement relative to a selected denominator.' },
];

export const percentageChangeContent = {
  change: changeContent,
  difference: differenceContent,
  reverse: reverseContent,
  formulas: [
    { mode: 'change' as const, label: 'Percentage change', formula: changeContent.formula },
    { mode: 'difference' as const, label: 'Percentage difference', formula: differenceContent.formula },
    { mode: 'reverse' as const, label: 'Reverse percentage', formula: reverseContent.formula },
  ],
  instructions: [
    'Choose percentage change, percentage difference, or reverse percentage.',
    'Enter the values requested for that mode and choose a direction when reversing a percentage.',
    'Use the primary result, breakdown, and explanation to verify the calculation.',
  ],
  examples,
  faqs,
  relatedToolSlugs: ['percentage', 'roi', 'profit-margin', 'markup'],
} as const;