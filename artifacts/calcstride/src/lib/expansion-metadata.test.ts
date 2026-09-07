import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  phaseThreeACatalog,
  phaseThreeARoutes,
  phaseThreeBCatalog,
  phaseThreeBRoutes,
  phaseThreeCCatalog,
  phaseThreeCExpandedSlugs,
  phaseThreeCRoutes,
  phaseTwoCatalog,
  phaseTwoRoutes,
  priorityOneCatalog,
  priorityOneRoutes,
} from './expansion-metadata';
import { publishedTools } from './catalog';
import { priorityOneExpansionDefinitions, priorityOneExpansionSlugs } from './priority-one-expansion';
import { phaseTwoDefinitions, phaseTwoSlugs } from './phase-two-expansion';
import { phaseThreeADefinitions, phaseThreeASlugs } from './phase-three-a';
import { phaseThreeBDefinitions, phaseThreeBSlugs } from './phase-three-b';
import { phaseThreeCDefinitions, phaseThreeCSlugs } from './phase-three-c';

type Definition = {
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  tags: readonly string[];
  href: string;
};

const categoryNames: Record<string, string> = {
  automotive: 'Automotive & EV',
  construction: 'Home & Construction',
  converters: 'Converters',
  'date-time': 'Date & Time',
  education: 'Education',
  electrical: 'Electrical',
  finance: 'Money & Finance',
  health: 'Health',
  math: 'Math',
};
const comparable = (definition: Definition) => ({
  slug: definition.slug,
  name: definition.name,
  description: definition.description,
  category: categoryNames[definition.categorySlug] ?? categoryNames[definition.category] ?? definition.category,
  categorySlug: definition.categorySlug,
  tags: [...definition.tags],
  href: definition.href,
});
const definitions = <S extends string>(slugs: readonly S[], record: Record<S, Definition>) =>
  slugs.map((slug) => comparable(record[slug]));
const routeMetadata = (items: readonly Definition[]) => items.map(({ slug, href }) => ({ slug, href }));

test('lightweight catalogue metadata exactly matches every full expansion definition', () => {
  assert.deepEqual(priorityOneCatalog, definitions(priorityOneExpansionSlugs, priorityOneExpansionDefinitions));
  assert.deepEqual(phaseTwoCatalog, definitions(phaseTwoSlugs, phaseTwoDefinitions));
  assert.deepEqual(phaseThreeACatalog, definitions(phaseThreeASlugs, phaseThreeADefinitions));
  assert.deepEqual(phaseThreeBCatalog, definitions(phaseThreeBSlugs, phaseThreeBDefinitions));
  assert.deepEqual(phaseThreeCCatalog, definitions(phaseThreeCSlugs, phaseThreeCDefinitions));
});

test('lightweight route manifests match definitions and preserve Phase Three C precedence', () => {
  assert.deepEqual(phaseTwoRoutes, routeMetadata(phaseTwoCatalog));
  assert.deepEqual(phaseThreeARoutes, routeMetadata(phaseThreeACatalog));
  assert.deepEqual(phaseThreeBRoutes, routeMetadata(phaseThreeBCatalog));
  assert.deepEqual(phaseThreeCRoutes, routeMetadata(phaseThreeCCatalog));
  assert.deepEqual(
    priorityOneRoutes,
    routeMetadata(priorityOneCatalog).filter(({ slug }) => !(phaseThreeCExpandedSlugs as readonly string[]).includes(slug)),
  );
  for (const slug of phaseThreeCExpandedSlugs) {
    assert.ok(phaseThreeCRoutes.some((route) => route.slug === slug));
    assert.ok(!priorityOneRoutes.some((route) => route.slug === slug));
    assert.deepEqual(
      publishedTools.find((tool) => tool.slug === slug),
      { ...comparable(phaseThreeCDefinitions[slug]), featured: false, lastUpdated: publishedTools[0].lastUpdated },
    );
  }
});

test('homepage entry modules do not value-import full expansion definitions', () => {
  const source = (name: string) => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
  for (const file of ['catalog.ts', '../App.tsx']) {
    const text = source(file);
    assert.doesNotMatch(text, /import\s*\{[^}]*\}\s*from ['"]@?\/?(?:lib\/)?(?:priority-one-expansion|phase-two-expansion|phase-three-[abc])['"]/s);
  }
});