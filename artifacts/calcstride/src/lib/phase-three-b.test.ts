import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogTools } from '../../../api-server/src/routes/catalog';
import { CATALOG_LAST_UPDATED } from './catalog-metadata';
import { publishedTools } from './catalog';
import {
  calculatePhaseThreeB,
  phaseThreeBDefinitions,
  phaseThreeBMetadataSentence,
  phaseThreeBProbabilityDefaults,
  phaseThreeBSlugs,
} from './phase-three-b';
import { getSeoForPath, publicRouteKeys, renderSeoHead } from './seo';

test('Phase 3B catalog metadata stays synchronized from the canonical source', () => {
  const phaseThreeBSet = new Set(phaseThreeBSlugs);
  for (const localTool of publishedTools.filter((tool) => phaseThreeBSet.has(tool.slug as never))) {
    const apiTool = catalogTools.find((tool) => tool.slug === localTool.slug);
    assert.ok(apiTool, localTool.slug);
    assert.equal(localTool.lastUpdated, CATALOG_LAST_UPDATED);
    assert.equal(apiTool.lastUpdated, CATALOG_LAST_UPDATED);
    assert.equal(apiTool.lastUpdated, localTool.lastUpdated);
  }
});

test('all Phase 3B routes have unique registry, substantive content, metadata, and schema', () => {
  assert.equal(phaseThreeBSlugs.length, 16);
  assert.equal(new Set(phaseThreeBSlugs.map((slug) => phaseThreeBDefinitions[slug].href)).size, 16);
  for (const slug of phaseThreeBSlugs) {
    const definition = phaseThreeBDefinitions[slug];
    assert.ok(definition.seoDescription.length >= 100 && definition.seoDescription.length <= 160, slug);
    assert.match(definition.seoDescription, /[.!?]$/, slug);
    const seo = getSeoForPath(definition.href);
    const head = renderSeoHead(seo);
    assert.ok(publishedTools.some((tool) => tool.slug === slug && tool.href === definition.href), slug);
    assert.ok(publicRouteKeys.includes(definition.href), slug);
    assert.ok(definition.educationalSections.length >= 3, slug);
    assert.ok(definition.educationalSections.every((section) => section.heading && section.body), slug);
    assert.equal(seo.canonical, `https://figurenest.com${definition.href}/`);
    assert.match(head, /application\/ld\+json/);
    assert.match(head, /FAQPage/);
    assert.match(head, /BreadcrumbList/);
    assert.match(head, /WebApplication/);
  }
  const descriptions = phaseThreeBSlugs.map((slug) => phaseThreeBDefinitions[slug].seoDescription);
  assert.equal(new Set(descriptions).size, descriptions.length);
  assert.equal(phaseThreeBMetadataSentence('Calculate a mathematical result from the selected values using a route-specific formula and stated input rules.','x'.repeat(200)).includes('x'), false);
});

test('binary and hexadecimal conversions validate signed width and exact integer representations', () => {
  assert.equal(calculatePhaseThreeB('binary', ['decimal-to-binary', '-1', 'signed', '8']).primary, '11111111');
  assert.equal(calculatePhaseThreeB('binary', ['binary-to-decimal', '11111111', 'signed', '8']).primary, '-1');
  assert.equal(calculatePhaseThreeB('hex', ['decimal-to-hex', '-128', 'signed', '8']).primary, '0x80');
  assert.equal(calculatePhaseThreeB('hex', ['hex-to-decimal', 'FF', 'signed', '8']).primary, '-1');
  assert.ok(calculatePhaseThreeB('binary', ['decimal-to-binary', '256', 'unsigned', '8']).error);
  assert.ok(calculatePhaseThreeB('hex', ['hex-to-decimal', 'GG', 'unsigned', '8']).error);
});

test('circle, factors, GCF, LCM, and prime factorization cover their formulas and domain errors', () => {
  assert.equal(calculatePhaseThreeB('circle', ['radius', '5']).details.find((detail) => detail.label === 'Area')?.value, '78.539816');
  assert.ok(calculatePhaseThreeB('circle', ['area', '-1']).error);
  assert.equal(calculatePhaseThreeB('greatest-common-factor', ['gcf', '84, 126']).primary, '42');
  assert.equal(calculatePhaseThreeB('greatest-common-factor', ['common-factors', '12, 18']).primary, '1, 2, 3, 6');
  assert.equal(calculatePhaseThreeB('least-common-multiple', ['12, 18']).primary, '36');
  assert.equal(calculatePhaseThreeB('prime-factorization', ['both', '360']).primary, '2^3 × 3^2 × 5');
  assert.ok(calculatePhaseThreeB('prime-factorization', ['prime', '0']).error);
});

test('confidence, exponent, half-life, logarithm, division, statistics, sequences, and combinatorics validate known results', () => {
  assert.equal(calculatePhaseThreeB('confidence-interval', ['50', '10', '100', '0.95']).primary, '[48.040036, 51.959964]');
  assert.equal(calculatePhaseThreeB('exponent', ['2', '4']).primary, '16');
  assert.ok(calculatePhaseThreeB('exponent', ['-2', '0.5']).error);
  assert.equal(calculatePhaseThreeB('half-life', ['forward', '100', '10', '30']).primary, '12.5');
  assert.equal(calculatePhaseThreeB('half-life', ['inverse', '100', '10', '12.5']).primary, '30');
  assert.equal(calculatePhaseThreeB('log', ['1000', '10', '10']).primary, '3');
  assert.ok(calculatePhaseThreeB('log', ['0', '10', '10']).error);
  assert.equal(calculatePhaseThreeB('long-division', ['7', '4', '20']).primary, '1.75');
  assert.equal(calculatePhaseThreeB('mean-median-mode-range', ['2, 3, 3, 8, 10']).primary, '5.2');
  assert.equal(calculatePhaseThreeB('number-sequence', ['arithmetic', '4', '3', '5']).primary, '4, 7, 10, 13, 16');
  assert.equal(calculatePhaseThreeB('permutation-combination', ['ncr', '5', '2']).primary, '10');
});

test('matrix multiplication supports valid rectangular dimensions', () => {
  const output = calculatePhaseThreeB('matrix', ['multiply', '2', '3', '3', '2', '1,2,3\n4,5,6', '7,8\n9,10\n11,12']);
  assert.equal(output.error, undefined);
  assert.equal(output.primary, '[58, 64]\n[139, 154]');
  assert.equal(output.details[0]?.value, '2 × 2');
});

test('matrix multiplication rejects incompatible dimensions and malformed shapes', () => {
  assert.ok(calculatePhaseThreeB('matrix', ['multiply', '2', '3', '2', '2', '1,2,3\n4,5,6', '7,8\n9,10']).error);
  assert.ok(calculatePhaseThreeB('matrix', ['multiply', '2', '3', '3', '2', '1,2\n3,4', '7,8\n9,10\n11,12']).error);
});

test('matrix addition and subtraction require and handle equal dimensions', () => {
  assert.equal(calculatePhaseThreeB('matrix', ['add', '2', '3', '2', '3', '1,2,3\n4,5,6', '6,5,4\n3,2,1']).primary, '[7, 7, 7]\n[7, 7, 7]');
  assert.equal(calculatePhaseThreeB('matrix', ['subtract', '2', '3', '2', '3', '6,5,4\n3,2,1', '1,2,3\n4,5,6']).primary, '[5, 3, 1]\n[-1, -3, -5]');
  assert.ok(calculatePhaseThreeB('matrix', ['add', '2', '3', '3', '2', '1,2,3\n4,5,6', '1,2\n3,4\n5,6']).error);
});

test('matrix determinant and inverse enforce square A and reject singular matrices', () => {
  assert.equal(calculatePhaseThreeB('matrix', ['determinant', '2', '2', '1', '1', '1,2\n3,4', '1']).primary, '-2');
  assert.equal(calculatePhaseThreeB('matrix', ['inverse', '2', '2', '1', '1', '1,2\n3,4', '1']).primary, '[-2, 1]\n[1.5, -0.5]');
  assert.ok(calculatePhaseThreeB('matrix', ['determinant', '2', '3', '1', '1', '1,2,3\n4,5,6', '1']).error);
  assert.ok(calculatePhaseThreeB('matrix', ['inverse', '2', '2', '1', '1', '1,2\n2,4', '1']).error);
});

test('every Probability Calculator mode has valid explanatory defaults', () => {
  assert.equal(calculatePhaseThreeB('probability', phaseThreeBProbabilityDefaults.simple).primary, '40%');
  assert.equal(calculatePhaseThreeB('probability', phaseThreeBProbabilityDefaults.complement).primary, '60%');
  assert.equal(calculatePhaseThreeB('probability', phaseThreeBProbabilityDefaults.independent).primary, '20%');
  for (const values of Object.values(phaseThreeBProbabilityDefaults)) {
    assert.equal(calculatePhaseThreeB('probability', values).error, undefined);
  }
});