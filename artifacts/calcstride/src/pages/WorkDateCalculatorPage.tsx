import { WorkPayCalculator } from '@/components/calculators/WorkPayCalculator';
import { AdvancedWorkDateCalculatorPage } from '@/pages/AdvancedWorkDateCalculatorPage';
import type { WorkDateCalculatorSlug } from '@/lib/work-date-calculators';

export function WorkDateCalculatorPage({ slug }: { slug: WorkDateCalculatorSlug }) {
  if (slug === 'salary' || slug === 'overtime') return <WorkPayCalculator slug={slug} />;
  return <AdvancedWorkDateCalculatorPage slug={slug} />;
}
