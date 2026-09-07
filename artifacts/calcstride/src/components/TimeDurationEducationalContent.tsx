import type { PhaseTwoDefinition } from '@/lib/phase-two-expansion';

export function TimeDurationEducationalContent({ definition }: { definition: PhaseTwoDefinition }) {
  const [purpose, workedExample, interpretation, edgeCases] = definition.educationalSections;
  const additionalSections = definition.educationalSections.slice(4);
  return <>
    <section>
      <div className="eyebrow">PURPOSE</div>
      <h2>{purpose.heading}</h2>
      <p>{purpose.body}</p>
    </section>
    <section>
      <div className="eyebrow">WORKED EXAMPLE</div>
      <h2>{workedExample.heading}</h2>
      <p>{workedExample.body}</p>
    </section>
    <section>
      <div className="eyebrow">INTERPRETATION</div>
      <h2>{interpretation.heading}</h2>
      <p>{interpretation.body}</p>
    </section>
    <section>
      <div className="eyebrow">EDGE CASES</div>
      <h2>{edgeCases.heading}</h2>
      <p>{edgeCases.body}</p>
    </section>
    {additionalSections.map((section) => (
      <section key={section.heading}>
        <div className="eyebrow">PRACTICAL NOTES</div>
        <h2>{section.heading}</h2>
        <p>{section.body}</p>
      </section>
    ))}
  </>;
}