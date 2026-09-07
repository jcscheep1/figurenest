import { ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { Link } from '@/components/PublicLink';
import { publishedTools } from '@/lib/catalog';
import { categoryContent } from '@/lib/category-content';
import { expandedCalculatorContent, type ExpandedCalculatorContent } from '@/lib/expanded-calculator-content';
import { focusedConstructionContent } from '@/lib/focused-construction-content';
import { normalizeRoutePath } from '@/lib/public-url';
import '@/styles/seo-educational-content.css';

const calculatorContent = { ...expandedCalculatorContent, ...focusedConstructionContent };
const calculatorSlugs = new Set(Object.keys(calculatorContent));
const categorySlugs = new Set(Object.keys(categoryContent));
const publishedToolNames = new Map(publishedTools.map((tool) => [tool.slug, tool.name]));

function Paragraphs({ items }: { items: string[] }) {
  return <>{items.map((item) => <p key={item}>{item}</p>)}</>;
}

function CalculatorGuide({ content, showFaq = true }: { content: ExpandedCalculatorContent; showFaq?: boolean }) {
  return <article className="seo-education advanced-content" aria-label={`${content.title} educational guide`}>
    <section><div className="eyebrow">PRACTICAL GUIDE</div><h2>{content.title}</h2><Paragraphs items={content.introduction} /></section>
    <section><div className="eyebrow">FORMULA AND VARIABLES</div><h2>How the calculation works.</h2><div className="advanced-formula-list"><div><strong>Formula</strong><code>{content.formula.equation}</code></div></div><ul>{content.formula.variables.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section><div className="eyebrow">WORKED EXAMPLE</div><h2>Follow the numbers in context.</h2><div className="advanced-example-list finance-example-list">{content.examples.map((example) => <article key={example.heading}><h3>{example.heading}</h3><p>{example.body}</p></article>)}</div></section>
    {content.usage.length > 0 && <section><div className="eyebrow">HOW TO USE IT</div><h2>Build a dependable estimate.</h2><ol>{content.usage.map((item) => <li key={item}>{item}</li>)}</ol></section>}
    {content.unitGuidance.length > 0 && <section><div className="eyebrow">UNITS AND INPUTS</div><h2>Keep measurements compatible.</h2><Paragraphs items={content.unitGuidance} /></section>}
    {(content.assumptions.length > 0 || content.limitations.length > 0) && <section><div className="eyebrow">ASSUMPTIONS AND LIMITATIONS</div><h2>Know what the result includes.</h2><div className="finance-guidance-grid">{content.assumptions.length > 0 && <div><h3>Assumptions</h3><ul>{content.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></div>}{content.limitations.length > 0 && <div><h3>Limitations</h3><ul>{content.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>}</div></section>}
    {content.mistakes.length > 0 && <section><div className="eyebrow">COMMON MISTAKES</div><h2>Avoid preventable errors.</h2><ul>{content.mistakes.map((item) => <li key={item}>{item}</li>)}</ul></section>}
    {content.edgeCases.length > 0 && <section><div className="eyebrow">EDGE CASES</div><h2>Check unusual inputs carefully.</h2><div className="finance-edge-list">{content.edgeCases.map((item) => <div key={item}><p>{item}</p></div>)}</div></section>}
    {content.interpretation.length > 0 && <section><div className="eyebrow">INTERPRETING THE RESULT</div><h2>Turn the answer into a decision.</h2><Paragraphs items={content.interpretation} /></section>}
    {showFaq && <section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Questions about this calculation.</h2>{content.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>}
    <section><div className="eyebrow">RELATED TOOLS AND GUIDES</div><h2>Continue the calculation.</h2><div className="seo-related-links">{content.relatedLinks.map((item) => <Link href={item.href} key={`${item.href}-${item.label}`}><span><strong>{item.label}</strong><small>{item.description}</small></span><ArrowRight size={16} aria-hidden="true" /></Link>)}</div></section>
  </article>;
}

function CategoryGuide({ slug }: { slug: keyof typeof categoryContent }) {
  const content = categoryContent[slug];
  return <article className="seo-education category-education" aria-label={`${slug} calculator category guide`}>
    <section><div className="eyebrow">CATEGORY GUIDE</div><h2>What these calculators help you answer.</h2><Paragraphs items={content.introduction} /><ul>{content.questionsAnswered.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section><div className="eyebrow">CHOOSING A TOOL</div><h2>Match the calculator to the question.</h2><Paragraphs items={content.choosingTools} /><div className="seo-tool-descriptions">{content.toolDescriptions.map((item) => <div key={item.slug}><h3>{publishedToolNames.get(item.slug) ?? 'Calculator'}</h3><p>{item.description}</p></div>)}</div></section>
    <section><div className="eyebrow">UNITS AND CURRENCY</div><h2>Compare like with like.</h2><Paragraphs items={content.unitCurrencyGuidance} /></section>
    <section className="advanced-faq"><div className="eyebrow">FAQ</div><h2>Questions about this category.</h2>{content.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
    <section><div className="eyebrow">RELATED GUIDES</div><h2>Learn the method behind the result.</h2><div className="seo-related-links">{content.relatedGuides.map((item) => <Link href={item.href} key={item.href}><span><strong>{item.label}</strong><small>{item.description}</small></span><ArrowRight size={16} aria-hidden="true" /></Link>)}</div></section>
  </article>;
}

export function SeoEducationalContent() {
  const [location] = useLocation();
  const parts = normalizeRoutePath(location).split('/').filter(Boolean);
  if (parts[0] === 'calculators' && parts[1] === 'date-time' && parts[2] === 'time-duration') {
    return null;
  }
  if (parts[0] === 'category' && categorySlugs.has(parts[1])) {
    return <CategoryGuide slug={parts[1] as keyof typeof categoryContent} />;
  }
  const slug = parts.at(-1) ?? '';
  if ((parts[0] === 'calculators' || parts[0] === 'converters') && calculatorSlugs.has(slug)) {
    return <CalculatorGuide content={calculatorContent[slug as keyof typeof calculatorContent]} />;
  }
  return null;
}