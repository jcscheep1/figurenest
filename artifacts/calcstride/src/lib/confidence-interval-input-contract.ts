import type { PhaseThreeBSlug } from './phase-three-b';

export function phaseThreeBNumberStep(slug: PhaseThreeBSlug, fieldKey: string, configuredStep?: string): string | undefined {
  if (slug === 'confidence-interval' && fieldKey === 'sampleSize') return '1';
  return configuredStep;
}
