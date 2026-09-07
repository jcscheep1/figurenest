import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { localCategories, localTools } from '@/lib/catalog';
import { Shell } from '@/components/FigureNestShell';
import { Seo } from '@/pages/AppPages';
import { Link } from '@/components/PublicLink';
import '@/styles/calculator-directory.css';

type DirectoryTool = (typeof localTools)[number];
type DirectoryCategory = (typeof localCategories)[number];

export type DirectorySort = 'category' | 'az';

export interface DirectoryFilters {
  q: string;
  category: string;
  letter: string;
  sort: DirectorySort;
}

export interface DirectoryGroup {
  category: DirectoryCategory;
  tools: DirectoryTool[];
}

const defaultFilters: DirectoryFilters = { q: '', category: '', letter: '', sort: 'category' };
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

/** Returns only published tools matching all active directory filters. */
export function filterDirectoryTools(
  tools: readonly DirectoryTool[],
  { q, category, letter }: Pick<DirectoryFilters, 'q' | 'category' | 'letter'>,
): DirectoryTool[] {
  const query = q.trim().toLocaleLowerCase();
  const normalizedLetter = letter.toLocaleUpperCase();
  return tools.filter((tool) => {
    const searchable = [tool.name, tool.description, tool.category, ...tool.tags].join(' ').toLocaleLowerCase();
    return (!query || searchable.includes(query))
      && (!category || tool.categorySlug === category)
      && (!normalizedLetter || tool.name.toLocaleUpperCase().startsWith(normalizedLetter));
  });
}

/** Produces a stable alphabetical listing, without mutating the catalog collection. */
export function sortDirectoryTools(tools: readonly DirectoryTool[]): DirectoryTool[] {
  return [...tools].sort((first, second) => collator.compare(first.name, second.name) || collator.compare(first.slug, second.slug));
}

/** Groups tools by the catalog's category order. Each tool is assigned at most once. */
export function groupDirectoryTools(
  tools: readonly DirectoryTool[],
  categories: readonly DirectoryCategory[],
): DirectoryGroup[] {
  const sorted = sortDirectoryTools(tools);
  return categories.map((category) => ({
    category,
    tools: sorted.filter((tool) => tool.categorySlug === category.slug),
  })).filter((group) => group.tools.length > 0);
}

export function readDirectoryFilters(search: string): DirectoryFilters {
  const params = new URLSearchParams(search);
  const sort = params.get('sort') === 'az' ? 'az' : 'category';
  const letter = (params.get('letter') ?? '').slice(0, 1).toLocaleUpperCase();
  return {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    letter: /^[A-Z]$/.test(letter) ? letter : '',
    sort,
  };
}

export function directorySearchParams(filters: DirectoryFilters): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.category) params.set('category', filters.category);
  if (filters.letter) params.set('letter', filters.letter);
  if (filters.sort !== 'category') params.set('sort', filters.sort);
  const result = params.toString();
  return result ? `?${result}` : '';
}

function DirectoryCard({ tool }: { tool: DirectoryTool }) {
  return <article className="calculator-directory-card" data-testid={`card-directory-tool-${tool.slug}`}>
    <p className="calculator-directory-card-category">{tool.category}</p>
    <h3>{tool.name}</h3>
    <p className="calculator-directory-card-description">{tool.description}</p>
    <Link className="calculator-directory-open" href={tool.href} data-testid={`link-open-directory-tool-${tool.slug}`}>
      Open {tool.name}<ArrowRight size={18} aria-hidden="true" />
    </Link>
  </article>;
}

export function CalculatorDirectoryPage() {
  const [filters, setFilters] = useState<DirectoryFilters>(() =>
    typeof window === 'undefined' ? defaultFilters : readDirectoryFilters(window.location.search),
  );

  useEffect(() => {
    const onPopState = () => setFilters(readDirectoryFilters(window.location.search));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const nextUrl = `/calculators/${directorySearchParams(filters)}`;
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      window.history.replaceState(window.history.state, '', nextUrl);
    }
  }, [filters]);

  const visibleTools = useMemo(
    () => sortDirectoryTools(filterDirectoryTools(localTools, filters)),
    [filters],
  );
  const groupedTools = useMemo(() => groupDirectoryTools(visibleTools, localCategories), [visibleTools]);
  const activeCategory = localCategories.find((category) => category.slug === filters.category);
  const updateFilters = (next: Partial<DirectoryFilters>) => setFilters((current) => ({ ...current, ...next }));
  const clearFilters = () => setFilters(defaultFilters);
  const hasFilters = Boolean(filters.q || filters.category || filters.letter || filters.sort !== 'category');

  return <Shell><Seo path="/calculators" /><div className="calculator-directory">
    <header className="calculator-directory-heading">
      <p className="calculator-directory-kicker">FIGURENEST TOOL DIRECTORY</p>
      <h1>All calculators and converters.</h1>
      <p>Search the full published toolkit, or browse by category and name.</p>
    </header>

    <section className="calculator-directory-controls" aria-label="Calculator directory filters">
      <div className="calculator-directory-search">
        <label htmlFor="calculator-directory-search">Instant search</label>
        <div className="calculator-directory-search-field">
          <Search size={20} aria-hidden="true" />
          <input id="calculator-directory-search" type="search" value={filters.q}
            onChange={(event) => updateFilters({ q: event.target.value })}
            placeholder="Search calculators and converters" autoComplete="off"
            data-testid="input-directory-search" />
          {filters.q && <button type="button" onClick={() => updateFilters({ q: '' })} aria-label="Clear search" data-testid="button-clear-directory-search"><X size={18} aria-hidden="true" /></button>}
        </div>
      </div>

      <div className="calculator-directory-filter-row">
        <label className="calculator-directory-select-label" htmlFor="calculator-directory-category">Category
          <select id="calculator-directory-category" value={filters.category} onChange={(event) => updateFilters({ category: event.target.value })} data-testid="select-directory-category">
            <option value="">All categories</option>
            {localCategories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <label className="calculator-directory-select-label" htmlFor="calculator-directory-sort">View
          <select id="calculator-directory-sort" value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value as DirectorySort })} data-testid="select-directory-sort">
            <option value="category">Grouped by category</option>
            <option value="az">A–Z list</option>
          </select>
        </label>
        {hasFilters && <button type="button" className="calculator-directory-clear" onClick={clearFilters} data-testid="button-clear-directory-filters">Clear filters</button>}
      </div>

      <div className="calculator-directory-chips" aria-label="Category index">
        <button type="button" className={!filters.category ? 'is-active' : ''} aria-pressed={!filters.category} onClick={() => updateFilters({ category: '' })} data-testid="button-directory-category-all">All</button>
        {localCategories.map((category) => <button type="button" key={category.slug} className={filters.category === category.slug ? 'is-active' : ''} aria-pressed={filters.category === category.slug} onClick={() => updateFilters({ category: category.slug })} data-testid={`button-directory-category-${category.slug}`}>{category.name}</button>)}
      </div>

      <nav className="calculator-directory-alphabet" aria-label="Browse calculator names alphabetically">
        <button type="button" className={!filters.letter ? 'is-active' : ''} aria-pressed={!filters.letter} onClick={() => updateFilters({ letter: '' })} data-testid="button-directory-letter-all">A–Z</button>
        {alphabet.map((letter) => <button type="button" key={letter} className={filters.letter === letter ? 'is-active' : ''} aria-pressed={filters.letter === letter} onClick={() => updateFilters({ letter })} data-testid={`button-directory-letter-${letter}`}>{letter}</button>)}
      </nav>
    </section>

    <section className="calculator-directory-results">
      <div className="calculator-directory-results-heading">
        <div><p className="calculator-directory-kicker">DIRECTORY RESULTS</p><h2>{activeCategory ? activeCategory.name : 'All tools'}</h2></div>
        <p className="calculator-directory-count" role="status" aria-live="polite" aria-atomic="true" data-testid="text-directory-result-count">{visibleTools.length} {visibleTools.length === 1 ? 'result' : 'results'}</p>
      </div>
      {!visibleTools.length ? <div className="calculator-directory-empty" role="status" data-testid="status-directory-no-results"><h2>No matching tools found.</h2><p>Try a different search, category, or letter.</p><button type="button" onClick={clearFilters} data-testid="button-reset-directory-no-results">Show all tools</button></div>
        : filters.sort === 'az' ? <div className="calculator-directory-grid">{visibleTools.map((tool) => <DirectoryCard key={tool.slug} tool={tool} />)}</div>
          : <div className="calculator-directory-groups">{groupedTools.map((group) => <section key={group.category.slug} className="calculator-directory-group" aria-labelledby={`directory-category-${group.category.slug}`}><div className="calculator-directory-group-heading"><h2 id={`directory-category-${group.category.slug}`}>{group.category.name}</h2><span>{group.tools.length}</span></div><div className="calculator-directory-grid">{group.tools.map((tool) => <DirectoryCard key={tool.slug} tool={tool} />)}</div></section>)}</div>}
    </section>
  </div></Shell>;
}