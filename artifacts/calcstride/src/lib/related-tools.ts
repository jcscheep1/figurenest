import type { Tool } from '@workspace/api-client-react';
import { publishedTools } from './catalog';

export type RelatedTool = Pick<Tool, 'slug' | 'name' | 'href' | 'category' | 'categorySlug'>;

/*
 * Cross-category edges are deliberately curated. Everything else is selected
 * inside a tool's semantic category using its published name, tags, and
 * description. Keeping these exceptions explicit prevents a catalogue-order
 * fallback from producing arbitrary "related" links.
 */
export const crossCategoryToolComplements = [
  ['area', 'square-footage'],
  ['volume', 'cubic-yard'],
  ['percentage', 'profit-margin'],
  ['percentage-increase-decrease', 'roi'],
  ['salary', 'take-home-pay'],
  ['overtime', 'time-card'],
  ['speed', 'pace'],
  ['power', 'horsepower'],
  ['weight', 'bmi'],
  ['temperature', 'wind-chill'],
  ['length', 'shoe-size'],
  ['fuel-economy', 'mileage'],
  ['auto-loan', 'auto-lease'],
  ['compound-interest', 'investment'],
  ['dpi-ppi', 'image-scaling'],
  ['pixels-to-cm', 'length'],
  ['gpa', 'average'],
  ['grade', 'percentage'],
  ['voltage-drop', 'power'],
  ['voltage-drop', 'ohms-law'],
] as const satisfies readonly (readonly [string, string])[];

const stopWords = new Set([
  'a', 'an', 'and', 'any', 'as', 'at', 'by', 'calculator', 'calculators',
  'convert', 'converter', 'estimate', 'estimator', 'for', 'from', 'in', 'into',
  'of', 'or', 'the', 'to', 'tool', 'using', 'with', 'your',
]);

const semanticTokens = (tool: Tool) => new Set(
  `${tool.name} ${tool.description} ${tool.tags.join(' ')}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((token) => token.length > 2 && !stopWords.has(token)),
);

const pairKey = (left: string, right: string) => [left, right].sort().join(':');
const explicitPairs = new Set(crossCategoryToolComplements.map(([left, right]) => pairKey(left, right)));
const tokensBySlug = new Map(publishedTools.map((tool) => [tool.slug, semanticTokens(tool)]));

const relevanceScore = (source: Tool, candidate: Tool) => {
  if (source.slug === candidate.slug) return Number.NEGATIVE_INFINITY;
  let score = source.categorySlug === candidate.categorySlug ? 100 : 0;
  if (explicitPairs.has(pairKey(source.slug, candidate.slug))) score += 1_000;
  const sourceTokens = tokensBySlug.get(source.slug) ?? new Set<string>();
  const candidateTokens = tokensBySlug.get(candidate.slug) ?? new Set<string>();
  for (const token of sourceTokens) {
    if (candidateTokens.has(token)) score += token.length >= 7 ? 12 : 7;
  }
  return score;
};

const candidatesFor = (source: Tool) => publishedTools
  .filter((candidate) => (
    candidate.slug !== source.slug
    && (
      candidate.categorySlug === source.categorySlug
      || explicitPairs.has(pairKey(source.slug, candidate.slug))
    )
  ))
  .sort((left, right) => (
    relevanceScore(source, right) - relevanceScore(source, left)
    || left.name.localeCompare(right.name)
  ));

const adjacency = new Map(publishedTools.map((tool) => [tool.slug, new Set<string>()]));
const connect = (left: string, right: string) => {
  adjacency.get(left)?.add(right);
  adjacency.get(right)?.add(left);
};

// Undirected edges guarantee that every outbound recommendation also gives its
// destination inbound discovery. Three edges leave room for a useful cluster
// even when one recommendation is a cross-category complement.
for (const tool of [...publishedTools].sort((left, right) => left.slug.localeCompare(right.slug))) {
  for (const candidate of candidatesFor(tool)) {
    if ((adjacency.get(tool.slug)?.size ?? 0) >= 3) break;
    connect(tool.slug, candidate.slug);
  }
}

const publishedBySlug = new Map(publishedTools.map((tool) => [tool.slug, tool]));

export const relatedToolGraph: ReadonlyMap<string, readonly string[]> = new Map(
  publishedTools.map((tool) => [
    tool.slug,
    [...(adjacency.get(tool.slug) ?? [])].sort((left, right) => {
      const leftTool = publishedBySlug.get(left);
      const rightTool = publishedBySlug.get(right);
      if (!leftTool || !rightTool) return left.localeCompare(right);
      return relevanceScore(tool, rightTool) - relevanceScore(tool, leftTool)
        || leftTool.name.localeCompare(rightTool.name);
    }),
  ]),
);

/**
 * Resolves canonical published Tool records for contextual page links.
 * Unknown/unpublished slugs intentionally return an empty list.
 */
export function getRelatedTools(slug: string, limit?: number): readonly RelatedTool[] {
  const related = (relatedToolGraph.get(slug) ?? [])
    .map((relatedSlug) => publishedBySlug.get(relatedSlug))
    .filter((tool): tool is Tool => Boolean(tool));
  return typeof limit === 'number' ? related.slice(0, Math.max(0, limit)) : related;
}