import type { PhaseTwoSlug } from '@/lib/phase-two-expansion';
import { PhaseTwoCalculatorPage as LegacyPhaseTwoCalculatorPage } from '@/pages/LegacyPhaseTwoCalculatorPage';
import { TimeCardCalculatorPage } from '@/pages/TimeCardCalculatorPage';
import { WorkTimeExpansionPage } from '@/pages/WorkTimeExpansionPage';

export function PhaseTwoCalculatorPage({ slug }: { slug: PhaseTwoSlug }) {
  if (slug === 'time-card') return <TimeCardCalculatorPage />;
  if (slug === 'hours' || slug === 'time-duration') return <WorkTimeExpansionPage slug={slug} />;
  return <LegacyPhaseTwoCalculatorPage slug={slug} />;
}