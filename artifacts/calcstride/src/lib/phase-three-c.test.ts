import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogTools } from '../../../api-server/src/routes/catalog';
import { publishedTools } from './catalog';
import {
  calculatePhaseThreeC,
  phaseThreeCDefinitions,
  phaseThreeCExpandedSlugs,
  phaseThreeCNewSlugs,
  phaseThreeCSlugs,
} from './phase-three-c';
import { getSeoForPath, publicRouteKeys, renderSeoHead } from './seo';

const defaults = (slug: typeof phaseThreeCSlugs[number]) => phaseThreeCDefinitions[slug].fields.map((field) => field.value);

test('Phase 3C reconciles approved, expanded, existing, and rejected intents without duplicate pages', () => {
  assert.equal(publishedTools.length, 163);
  assert.equal(phaseThreeCNewSlugs.length, 9);
  assert.deepEqual(phaseThreeCExpandedSlugs, ['bmi', 'pregnancy-conception']);
  assert.equal(new Set(publishedTools.map((tool) => tool.href)).size, publishedTools.length);
  assert.equal(publishedTools.filter((tool) => tool.slug === 'pregnancy-conception').length, 1);
  assert.equal(publishedTools.filter((tool) => tool.slug === 'bmi').length, 1);
  assert.equal(publishedTools.find((tool) => tool.slug === 'molecular-weight')?.categorySlug, 'science-engineering');
  assert.equal(publishedTools.find((tool) => tool.slug === 'weight')?.href, '/converters/weight');
  assert.equal(publishedTools.some((tool) => tool.slug === 'body-type'), false);
  assert.equal(publishedTools.some((tool) => tool.slug.includes('points')), false);
  assert.equal(publicRouteKeys.some((route) => route.includes('/body-type')), false);
  assert.equal(publicRouteKeys.some((route) => route.includes('/points')), false);
});

test('all approved Phase 3C pages have useful content, sources, safety guidance, canonical metadata, and synchronized schemas', () => {
  assert.equal(phaseThreeCSlugs.length, 11);
  for (const slug of phaseThreeCSlugs) {
    const definition = phaseThreeCDefinitions[slug];
    const seo = getSeoForPath(definition.href);
    const head = renderSeoHead(seo);
    assert.ok(definition.educationalSections.length >= 3, slug);
    assert.ok(definition.educationalSections.every((section) => section.heading && section.body), slug);
    assert.ok(definition.sourceLinks.length >= 1, slug);
    assert.ok(definition.safetyNotice.length >= 80, slug);
    assert.ok(publicRouteKeys.includes(definition.href), slug);
    assert.equal(seo.canonical, `https://figurenest.com${definition.href}/`);
    assert.ok(seo.title.length <= 60, `${slug} title: ${seo.title.length}`);
    assert.ok(seo.description.length >= 120 && seo.description.length <= 160, `${slug} description: ${seo.description.length}`);
    assert.equal((head.match(/FAQPage/g) ?? []).length, 1, slug);
    assert.equal((head.match(/BreadcrumbList/g) ?? []).length, 1, slug);
    assert.match(head, /WebApplication/, slug);
    const api = catalogTools.find((tool) => tool.slug === slug);
    const local = publishedTools.find((tool) => tool.slug === slug);
    assert.ok(api && local, slug);
    assert.equal(api.href, local.href);
    assert.equal(api.name, local.name);
  }
});

test('BAC and body surface area equations match known examples and reject unsafe ranges', () => {
  assert.equal(calculatePhaseThreeC('bac', ['80', '2', '2', '0.68']).primary, '0.021%');
  assert.equal(calculatePhaseThreeC('bac', ['80', '0', '12', '0.68']).primary, '0.000%');
  assert.match(calculatePhaseThreeC('bac', defaults('bac')).summary, /never use it to decide whether to drive/i);
  assert.ok(calculatePhaseThreeC('bac', ['20', '2', '2', '0.68']).error);
  assert.equal(calculatePhaseThreeC('body-surface-area', ['70', '175']).primary, '1.84 m²');
  assert.ok(calculatePhaseThreeC('body-surface-area', ['0', '175']).error);
});

test('BMI, reference weight, historical height formulas, and lean mass remain respectful and bounded', () => {
  const bmi = calculatePhaseThreeC('bmi', ['70', '175', '30']);
  assert.equal(bmi.primary, '22.9');
  assert.equal(bmi.details[1]?.value, '56.7–76.3 kg');
  assert.match(bmi.summary, /not a diagnosis/i);
  assert.ok(calculatePhaseThreeC('bmi', ['70', '175', '19']).error);
  assert.equal(calculatePhaseThreeC('ideal-weight', ['175', 'female']).primary, '64.1–66 kg');
  assert.ok(calculatePhaseThreeC('ideal-weight', ['150', 'female']).error);
  assert.equal(calculatePhaseThreeC('lean-body-mass', ['70', '175', 'female']).primary, '52.1 kg');
  assert.ok(calculatePhaseThreeC('lean-body-mass', ['30', '230', 'male']).error);
});

test('2021 race-free CKD-EPI eGFR is labeled exactly and validates its adult domain', () => {
  const egfr = calculatePhaseThreeC('gfr', ['1.0', '50', 'female']);
  assert.equal(egfr.primary, '69 mL/min/1.73 m²');
  assert.equal(egfr.details[0]?.value, '2021 CKD-EPI creatinine');
  assert.match(egfr.summary, /not a diagnosis/i);
  assert.ok(calculatePhaseThreeC('gfr', ['1.0', '17', 'female']).error);
  assert.ok(calculatePhaseThreeC('gfr', ['0', '50', 'female']).error);
});

test('macro and TDEE formulas validate splits, activity factors, and pregnancy exclusions', () => {
  const macro = calculatePhaseThreeC('macro', ['2000', '70', '50', '20', '30', 'no']);
  assert.equal(macro.primary, '250 g carbohydrate');
  assert.equal(macro.details[0]?.value, '100 g');
  assert.equal(macro.details[1]?.value, '66.7 g');
  assert.ok(calculatePhaseThreeC('macro', ['2000', '70', '60', '20', '30', 'no']).error);
  assert.match(calculatePhaseThreeC('macro', ['2000', '70', '50', '20', '30', 'yes']).error ?? '', /pregnancy|breastfeeding/i);
  const tdee = calculatePhaseThreeC('tdee', ['70', '175', '30', 'female', '1.375', 'no']);
  assert.equal(tdee.primary, '2,039 kcal/day');
  assert.equal(tdee.details[0]?.value, '1,483 kcal/day');
  assert.ok(calculatePhaseThreeC('tdee', ['70', '175', '30', 'female', '1.4', 'no']).error);
  assert.match(calculatePhaseThreeC('tdee', ['70', '175', '30', 'female', '1.375', 'yes']).error ?? '', /pregnancy|breastfeeding/i);
});

test('molecular weight parser handles elements and nested groups while rejecting unsupported notation', () => {
  assert.equal(calculatePhaseThreeC('molecular-weight', ['H2O']).primary, '18.015 g/mol');
  assert.equal(calculatePhaseThreeC('molecular-weight', ['C6H12O6']).primary, '180.156 g/mol');
  assert.equal(calculatePhaseThreeC('molecular-weight', ['Ca(OH)2']).primary, '74.092 g/mol');
  assert.equal(calculatePhaseThreeC('molecular-weight', ['Al2(SO4)3']).primary, '342.132 g/mol');
  assert.ok(calculatePhaseThreeC('molecular-weight', ['CuSO4·5H2O']).error);
  assert.ok(calculatePhaseThreeC('molecular-weight', ['Xx2']).error);
});

test('cycle estimator consolidates period, ovulation, and conception dates without contraceptive claims', () => {
  const cycle = calculatePhaseThreeC('pregnancy-conception', ['2026-08-01', '28', '5']);
  assert.equal(cycle.primary, '2026-08-29');
  assert.equal(cycle.details[0]?.value, '2026-08-15');
  assert.equal(cycle.details[1]?.value, '2026-08-10 to 2026-08-16');
  assert.match(cycle.details[3]?.value ?? '', /do not use/i);
  assert.ok(calculatePhaseThreeC('pregnancy-conception', ['2026-08-01', '20', '5']).error);
  assert.ok(calculatePhaseThreeC('pregnancy-conception', ['not-a-date', '28', '5']).error);
});

test('target heart rate implements the cited simple AHA percentage method', () => {
  const heart = calculatePhaseThreeC('target-heart-rate', ['40']);
  assert.equal(heart.primary, '90–126 bpm');
  assert.equal(heart.details[0]?.value, '126–153 bpm');
  assert.equal(heart.details[1]?.value, '180 bpm');
  assert.ok(calculatePhaseThreeC('target-heart-rate', ['17']).error);
});

test('all Phase 3C defaults calculate safely without NaN, infinity, diagnosis, or endorsement claims', () => {
  for (const slug of phaseThreeCSlugs) {
    const output = calculatePhaseThreeC(slug, defaults(slug));
    assert.equal(output.error, undefined, slug);
    assert.doesNotMatch(output.primary, /NaN|Infinity|∞/i, slug);
  }
  const source = phaseThreeCSlugs.map((slug) => JSON.stringify(phaseThreeCDefinitions[slug])).join(' ');
  assert.doesNotMatch(source, /affiliated|endorsed/i);
});