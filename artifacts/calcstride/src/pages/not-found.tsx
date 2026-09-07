import { useMemo, useState, type CSSProperties } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Shell } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { localCategories, localTools } from '@/lib/catalog';
import { Seo, ToolCard } from '@/pages/AppPages';

export default function NotFound() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? localTools.filter((tool) => `${tool.name} ${tool.description} ${tool.tags.join(' ')}`.toLowerCase().includes(term)).slice(0, 4)
      : [];
  }, [query]);
  const popular = localTools.filter((tool) => tool.featured).slice(0, 3);

  return (
    <Shell>
      <Seo path="/404-not-found" />
      <section className="page-intro">
        <div className="eyebrow">FIGURENEST / 404</div>
        <h1>That page is<br /><em>off the grid.</em></h1>
        <p>The link may be old or mistyped. Search the toolkit, explore a category, or head back to the calculators that are ready to help.</p>
        <Link href="/" className="primary-button" data-testid="link-404-home">Go to the homepage <ArrowRight size={16} /></Link>
      </section>
      <section className="section-block">
        <div className="section-heading"><div><div className="eyebrow">FIND A TOOL</div><h2>Search the toolkit.</h2></div></div>
        <div className="search-wrap">
          <Search className="search-glyph" aria-hidden="true" size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “loan”, “paint”, or “length”" aria-label="Search the toolkit" data-testid="input-404-search" />
        </div>
        {query && <div className="tool-list-grid" style={{ marginTop: 24 }}>{results.length ? results.map((tool) => <ToolCard tool={tool} key={tool.slug} />) : <p className="muted-copy">No matching tool yet. Try a broader search or browse a category below.</p>}</div>}
      </section>
      <section className="category-band"><div className="section-heading"><div><div className="eyebrow">EXPLORE</div><h2>Choose a category.</h2></div></div><div className="category-grid">{localCategories.slice(0, 6).map((category, index) => <Link href={category.slug === 'construction' ? '/home-construction' : `/category/${category.slug}`} className="category-tile" key={category.slug} style={{ '--tile-accent': category.accent } as CSSProperties}><span className="tile-index mono">{String(index + 1).padStart(2, '0')}</span><h3>{category.name}</h3><p>{category.description}</p><span className="category-count mono">{category.toolCount} tools <ArrowRight size={15} /></span></Link>)}</div></section>
      <section className="section-block"><div className="section-heading"><div><div className="eyebrow">START HERE</div><h2>Popular tools.</h2></div></div><div className="featured-grid">{popular.map((tool) => <ToolCard tool={tool} key={tool.slug} />)}</div></section>
    </Shell>
  );
}
