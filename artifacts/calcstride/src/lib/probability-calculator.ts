import { calculatePhaseThreeB, type PhaseThreeBResult } from './phase-three-b';

export type ProbabilityMode = 'simple' | 'complement' | 'independent';

export type ProbabilityFieldContract = {
  label: string;
  min: number;
  max: number;
  step: string;
  hidden?: boolean;
};

const MAX_OUTCOME_COUNT = 1e12;

const bad = (message: string): PhaseThreeBResult => ({
  primary: message,
  summary: message,
  details: [],
  error: message,
});

export function probabilityFieldContract(mode: ProbabilityMode, index: number): ProbabilityFieldContract | null {
  if (index === 0) return null;

  if (mode === 'simple') {
    return index === 1
      ? { label: 'Favorable outcomes', min: 0, max: MAX_OUTCOME_COUNT, step: '1' }
      : { label: 'Total outcomes', min: 1, max: MAX_OUTCOME_COUNT, step: '1' };
  }

  if (mode === 'complement') {
    return index === 1
      ? { label: 'P(A)', min: 0, max: 1, step: 'any' }
      : { label: 'Unused second probability', min: 0, max: 1, step: 'any', hidden: true };
  }

  return index === 1
    ? { label: 'P(A)', min: 0, max: 1, step: 'any' }
    : { label: 'P(B)', min: 0, max: 1, step: 'any' };
}

export function calculateProbability(values: readonly string[]): PhaseThreeBResult {
  if (values[0] === 'simple') {
    const favorable = Number(values[1]);
    const total = Number(values[2]);
    if (!Number.isInteger(favorable) || !Number.isInteger(total)) {
      return bad('Simple probability uses whole-number outcome counts.');
    }
    if (favorable > MAX_OUTCOME_COUNT || total > MAX_OUTCOME_COUNT) {
      return bad('Simple probability outcome counts cannot exceed 1,000,000,000,000.');
    }
  }

  return calculatePhaseThreeB('probability', values);
}
