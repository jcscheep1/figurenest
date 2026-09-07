import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react';
import { useRoute } from 'wouter';
import { Link } from '@/components/PublicLink';
import { Shell } from '@/components/FigureNestShell';
import { Seo } from '@/pages/AppPages';
import { articles, getArticle, type ArticleSlug } from '@/lib/articles';
import '@/article-pages.css';

function articleHref(slug: ArticleSlug) {
  return `/articles/${slug}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export function ArticleIndexPage() {
  return <Shell>
    <Seo path="/articles" />
    <section className="article-index">
      <div className="eyebrow">FIGURENEST / PRACTICAL GUIDES</div>
      <h1>Understand the numbers behind the tools.</h1>
      <p>Plain-language explanations, transparent formulas, and worked examples for finance, construction, work, vehicles, business, and everyday conversions.</p>
      <div className="article-index-list">
        {articles.map((article) => <article className="article-index-card" key={article.slug}>
          <div className="article-meta"><Clock3 size={14} aria-hidden="true" /> {article.readingTimeMinutes} min read</div>
          <h2><Link href={articleHref(article.slug)}>{article.title}</Link></h2>
          <p>{article.intro}</p>
          <Link className="text-link" href={articleHref(article.slug)}>Read guide <ArrowRight size={15} aria-hidden="true" /></Link>
        </article>)}
      </div>
    </section>
  </Shell>;
}

export function ArticlePage() {
  const [, params] = useRoute('/articles/:slug');
  const article = getArticle(params?.slug);

  if (!article) return <ArticleNotFound path={`/articles/${params?.slug ?? 'not-found'}`} />;

  return <Shell>
    <Seo path={articleHref(article.slug)} />
    <article className="article-page">
      <header className="article-header">
        <div className="eyebrow">PRACTICAL GUIDE</div>
        <h1>{article.h1}</h1>
        <p className="article-intro">{article.intro}</p>
        <div className="article-meta">
          <span>Published <time dateTime={article.published}>{formatDate(article.published)}</time></span>
          <span>Updated <time dateTime={article.modified}>{formatDate(article.modified)}</time></span>
          <span><Clock3 size={14} aria-hidden="true" /> {article.readingTimeMinutes} min read</span>
        </div>
      </header>

      <nav className="article-contents" aria-label="On this page">
        <strong>On this page</strong>
        <ol>{article.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>)}</ol>
      </nav>

      <div className="article-body">
        {article.sections.map((section) => <section id={section.id} className="article-section" key={section.id}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
          {section.formula && <aside className="article-formula" aria-label="Formula">
            <h3>Formula</h3>
            <p><strong>{section.formula.expression}</strong></p>
            <p>{section.formula.explanation}</p>
            <ul>{section.formula.variables.map((variable) => <li key={variable}>{variable}</li>)}</ul>
          </aside>}
          {section.example && <aside className="article-example" aria-label="Worked example">
            <h3>{section.example.title}</h3>
            <p>{section.example.scenario}</p>
            <ol>{section.example.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            <p><strong>Result:</strong> {section.example.result}</p>
          </aside>}
        </section>)}

        <section className="article-section article-assumptions">
          <h2>Assumptions and limitations</h2>
          <h3>Assumptions used in the explanations</h3>
          <ul>{article.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>What this guide cannot tell you</h3>
          <ul>{article.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
          <p>This guide provides general educational information, not financial, tax, legal, or lending advice.</p>
        </section>

        <section className="article-section article-next-steps">
          <h2>Practical next steps</h2>
          <ol>{article.nextSteps.map((item) => <li key={item}>{item}</li>)}</ol>
        </section>

        <section className="article-section article-faqs">
          <h2>Frequently asked questions</h2>
          {article.faqs.map((faq) => <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>)}
        </section>
      </div>

      <aside className="article-related" aria-label="Related resources">
        <section>
          <h2>Related calculators</h2>
          <ul>{article.relatedCalculators.map((link) => <li key={link.href}>
            <Link href={link.href}><strong>{link.label}</strong><span>{link.description}</span></Link>
          </li>)}</ul>
        </section>
        <section>
          <h2>Related reading</h2>
          <ul>{article.relatedArticles.map((slug) => {
            const related = getArticle(slug);
            return related ? <li key={slug}><Link href={articleHref(slug)}>{related.title} <ArrowRight size={15} aria-hidden="true" /></Link></li> : null;
          })}</ul>
        </section>
      </aside>
    </article>
  </Shell>;
}

export function ArticleNotFound({ path = '/articles/not-found' }: { path?: string }) {
  return <Shell>
    <Seo path={path} />
    <section className="article-not-found">
      <div className="eyebrow">ARTICLE NOT FOUND</div>
      <h1>That guide is not here.</h1>
      <p>The address may have changed, or the article may not exist. Browse the published guides or return to the calculator toolkit.</p>
      <Link href="/articles" className="text-link">Browse all articles <ArrowRight size={15} aria-hidden="true" /></Link>
      <Link href="/" className="text-link">Return home <ArrowRight size={15} aria-hidden="true" /></Link>
    </section>
  </Shell>;
}