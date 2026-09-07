import type { PhaseTwoSlug } from '@/lib/phase-two-expansion';
import { PhaseTwoCalculatorPage as LegacyPhaseTwoCalculatorPage } from '@/pages/LegacyPhaseTwoCalculatorPage';
import { TimeCardCalculatorPage } from '@/pages/TimeCardCalculatorPage';

export function PhaseTwoCalculatorPage({ slug }: { slug: PhaseTwoSlug }) {
  if (slug === 'time-card') return <TimeCardCalculatorPage />;
  return <LegacyPhaseTwoCalculatorPage slug={slug} />;
}
