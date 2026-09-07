import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculatePhaseThreeA,
  decodeBase64Utf8,
  encodeBase64Utf8,
  generateSecurePassword,
  phaseThreeADefinitions,
  phaseThreeAMetadataSentence,
  phaseThreeASlugs,
} from './phase-three-a';
import { getSeoForPath, publicRouteKeys, renderSeoHead } from './seo';

const run = (slug: typeof phaseThreeASlugs[number], values?: string[]) => {
  const definition = phaseThreeADefinitions[slug];
  return calculatePhaseThreeA(slug, values ?? definition.fields.map((field) => field.value));
};

test('phase 3A formulas and transformations produce known answers', () => {
  assert.equal(run('bandwidth').primary, '80 Mbps');
  assert.equal(run('electricity').primary, '180 kWh');
  assert.equal(run('ohms-law').primary, '12 V');
  assert.equal(run('resistor').primary, '320 Ω');
  assert.equal(run('density').primary, '2,000 kg/m³');
  assert.equal(run('dew-point').primary, '9.26 °C');
  assert.equal(run('horsepower').primary, '300 hp');
  assert.equal(run('heat-index').primary, '105.9 °F');
  assert.equal(run('mass').primary, '200 kg');
  assert.equal(run('molarity').primary, '0.25 mol/L');
  assert.equal(run('speed-calculator').primary, '50 km/h');
  assert.equal(run('wind-chill').primary, '-19.4 °F');
  assert.equal(run('url-encode-decode').primary, 'report%20name%20%26%20total');
});

test('Base64 handles UTF-8 round trips and rejects malformed input', () => {
  const original = 'FigureNest ✓ café';
  assert.equal(decodeBase64Utf8(encodeBase64Utf8(original)), original);
  assert.ok(run('base64', ['decode', '%%%']).error);
  assert.match(phaseThreeADefinitions.base64.localProcessingNote ?? '', /not encryption/i);
});

test('IP subnet calculations validate IPv4 and IPv6 accurately', () => {
  const ipv4 = run('ip-subnet', ['ipv4', '192.168.1.42', '24']);
  assert.equal(ipv4.primary, '192.168.1.0/24');
  assert.equal(ipv4.details.find((item) => item.label === 'Broadcast address')?.value, '192.168.1.255');
  assert.equal(ipv4.details.find((item) => item.label === 'Address scope')?.value, 'Private-use');
  const ipv6 = run('ip-subnet', ['ipv6', '2001:db8::1', '64']);
  assert.equal(ipv6.primary, '2001:db8::/64');
  assert.equal(ipv6.details.find((item) => item.label === 'Address scope')?.value, 'Documentation');
  assert.ok(run('ip-subnet', ['ipv4', '192.168.1.999', '24']).error);
  assert.ok(run('ip-subnet', ['ipv6', '2001::db8::1', '64']).error);
  assert.ok(run('ip-subnet', ['ipv6', '2001:db8::1', '129']).error);
});

test('secure passwords use supplied cryptographic bytes and include every enabled class', () => {
  let next = 0;
  const generated = generateSecurePassword(
    { length: 24, lower: true, upper: true, digits: true, symbols: true },
    (length) => Uint8Array.from({ length }, () => next++ % 200),
  );
  assert.equal(generated.primary.length, 24);
  assert.match(generated.primary, /[a-z]/);
  assert.match(generated.primary, /[A-Z]/);
  assert.match(generated.primary, /[0-9]/);
  assert.match(generated.primary, /[^A-Za-z0-9]/);
  assert.match(generated.summary, /cryptographically secure browser randomness/i);
  assert.match(phaseThreeADefinitions['password-generator'].localProcessingNote ?? '', /never transmitted, logged, or stored/i);
  assert.ok(generateSecurePassword({ length: 7, lower: true, upper: false, digits: false, symbols: false }, () => new Uint8Array([0])).error);
});

test('phase 3A boundary and applicability errors are explicit', () => {
  assert.ok(run('bandwidth', ['1', 'GB', '0']).error);
  assert.ok(run('electricity', ['1000', 'W', '25', '30', '0.2']).error);
  assert.ok(run('ohms-law', ['current', '12', '0']).error);
  assert.ok(run('resistor', ['parallel', '100, 0']).error);
  assert.ok(run('density', ['1', 'kg', '0', 'm3']).error);
  assert.ok(run('dew-point', ['20', 'C', '0']).error);
  assert.ok(run('heat-index', ['70', 'F', '70']).error);
  assert.ok(run('molarity', ['1', 'mol', '0', 'L']).error);
  assert.ok(run('speed-calculator', ['100', 'km', '0', 'h']).error);
  assert.ok(run('wind-chill', ['60', 'F', '15', 'mph']).error);
  assert.ok(run('url-encode-decode', ['decode', '%ZZ']).error);
});

test('phase 3A metadata is unique, substantive, local, and indexable', () => {
  assert.equal(phaseThreeASlugs.length, 16);
  assert.equal(new Set(phaseThreeASlugs.map((slug) => phaseThreeADefinitions[slug].name)).size, 16);
  assert.equal(new Set(phaseThreeASlugs.map((slug) => phaseThreeADefinitions[slug].href)).size, 16);
  for (const slug of phaseThreeASlugs) {
    const definition = phaseThreeADefinitions[slug];
    assert.ok(definition.seoTitle.length <= 60, slug);
    assert.ok(definition.seoDescription.length >= 100 && definition.seoDescription.length <= 160, slug);
    assert.match(definition.seoDescription, /[.!?]$/, slug);
    assert.ok(definition.educationalSections.length >= 3, slug);
    assert.ok(definition.educationalSections.every((section) => section.heading && section.body), slug);
    assert.ok(definition.faqs.length >= 4, slug);
    assert.ok(definition.relatedRoutes.length >= 2, slug);
    assert.ok(definition.relatedRoutes.every((route) => route.startsWith('/')), slug);
    assert.ok(definition.sourceLinks.every((source) => source.href.startsWith('https://')), slug);
    assert.ok(publicRouteKeys.includes(definition.href), slug);
    const seo = getSeoForPath(definition.href);
    assert.equal(seo.status, 200, slug);
    assert.equal(seo.canonical, `https://figurenest.com${definition.href}/`, slug);
    assert.equal(seo.h1, definition.h1, slug);
    const head = renderSeoHead(seo);
    assert.match(head, /FAQPage/, slug);
    assert.match(head, /WebApplication/, slug);
    assert.match(head, /BreadcrumbList/, slug);
  }
  const descriptions = phaseThreeASlugs.map((slug) => phaseThreeADefinitions[slug].seoDescription);
  assert.equal(new Set(descriptions).size, descriptions.length);
  assert.equal(phaseThreeAMetadataSentence('Calculate network transfer requirements from a payload size and a specified transfer duration in seconds.','x'.repeat(200)).includes('x'), false);
});

test('horsepower intent is consolidated without competing canonical pages', () => {
  const horsepower = phaseThreeADefinitions.horsepower;
  assert.equal(horsepower.href, '/calculators/science-engineering/horsepower');
  assert.ok(horsepower.tags.includes('engine horsepower calculator'));
  assert.equal(publicRouteKeys.filter((route) => route.includes('horsepower')).length, 1);
});