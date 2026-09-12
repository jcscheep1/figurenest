import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PPTX_PACKAGE_LIMITS,
  inspectPptxRelationshipXml,
  preflightPptxPackage,
  type PptxPackageLimits,
} from './pptx-package-preflight';

type ZipEntry = { name: string; data?: string; flags?: number };

const encoder = new TextEncoder();

function u16(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function u32(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function makeStoredZip(entries: ZipEntry[]): Uint8Array {
  const locals: number[] = [];
  const centrals: number[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const name = [...encoder.encode(entry.name)];
    const data = [...encoder.encode(entry.data ?? 'x')];
    const flags = entry.flags ?? 0;

    const local = [
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(flags),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...name,
      ...data,
    ];
    locals.push(...local);

    centrals.push(
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(flags),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(localOffset),
      ...name,
    );
    localOffset += local.length;
  }

  const centralOffset = locals.length;
  const centralSize = centrals.length;
  const eocd = [
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(entries.length),
    ...u16(entries.length),
    ...u32(centralSize),
    ...u32(centralOffset),
    ...u16(0),
  ];
  return Uint8Array.from([...locals, ...centrals, ...eocd]);
}

function minimalPptx(extra: ZipEntry[] = []): Uint8Array {
  return makeStoredZip([
    { name: '[Content_Types].xml', data: '<Types />' },
    { name: 'ppt/presentation.xml', data: '<p:presentation />' },
    { name: 'ppt/slides/slide1.xml', data: '<p:sld><a:t>FT11 SENTINEL</a:t></p:sld>' },
    { name: 'ppt/_rels/presentation.xml.rels', data: '<Relationships />' },
    ...extra,
  ]);
}

function limits(overrides: Partial<PptxPackageLimits>): PptxPackageLimits {
  return { ...DEFAULT_PPTX_PACKAGE_LIMITS, ...overrides };
}

describe('FT-11 hostile PPTX package preflight', () => {
  it('accepts a bounded ordinary PPTX inventory without inflating content', () => {
    const result = preflightPptxPackage(minimalPptx([
      { name: 'ppt/slides/slide2.xml', data: '<p:sld />' },
      { name: 'ppt/media/image1.png', data: 'safe-placeholder' },
    ]));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.inventory.slides).toBe(2);
      expect(result.inventory.mediaParts).toBe(1);
      expect(result.inventory.relationshipParts).toBe(1);
    }
  });

  it('requires genuine PPTX package markers and at least one slide', () => {
    expect(preflightPptxPackage(makeStoredZip([{ name: 'word/document.xml' }]))).toEqual({
      ok: false,
      reason: 'not-pptx-package',
    });
    expect(preflightPptxPackage(makeStoredZip([
      { name: '[Content_Types].xml' },
      { name: 'ppt/presentation.xml' },
    ]))).toEqual({ ok: false, reason: 'presentation-has-no-slides' });
  });

  it('fails closed on macro, OLE/embedded and ActiveX package parts', () => {
    for (const name of ['ppt/vbaProject.bin', 'ppt/embeddings/oleObject1.bin', 'ppt/activeX/activeX1.bin']) {
      expect(preflightPptxPackage(minimalPptx([{ name }]))).toEqual({
        ok: false,
        reason: 'active-or-embedded-content-unsupported',
      });
    }
  });

  it('rejects unsafe paths, duplicate case-folded entries and encrypted entries', () => {
    expect(preflightPptxPackage(minimalPptx([{ name: '../escape.xml' }]))).toEqual({
      ok: false,
      reason: 'unsafe-entry-path',
    });
    expect(preflightPptxPackage(minimalPptx([{ name: 'PPT/SLIDES/SLIDE1.XML' }]))).toEqual({
      ok: false,
      reason: 'duplicate-entry-name',
    });
    expect(preflightPptxPackage(minimalPptx([{ name: 'ppt/theme/theme1.xml', flags: 1 }]))).toEqual({
      ok: false,
      reason: 'encrypted-entry-unsupported',
    });
  });

  it('locks the provisional slide and media boundaries', () => {
    const exactFifty = minimalPptx(Array.from({ length: 49 }, (_, index) => ({
      name: `ppt/slides/slide${index + 2}.xml`,
      data: '<p:sld />',
    })));
    const fiftyOne = minimalPptx(Array.from({ length: 50 }, (_, index) => ({
      name: `ppt/slides/slide${index + 2}.xml`,
      data: '<p:sld />',
    })));
    expect(preflightPptxPackage(exactFifty).ok).toBe(true);
    expect(preflightPptxPackage(fiftyOne)).toEqual({ ok: false, reason: 'slide-count-limit' });

    const threeMedia = minimalPptx([
      { name: 'ppt/media/a.png' },
      { name: 'ppt/media/b.jpg' },
      { name: 'ppt/media/c.webp' },
    ]);
    expect(preflightPptxPackage(threeMedia, limits({ maxMediaParts: 2 }))).toEqual({
      ok: false,
      reason: 'media-count-limit',
    });
  });

  it('bounds XML parts independently before a parser receives them', () => {
    const oversized = minimalPptx([{ name: 'ppt/theme/theme1.xml', data: '12345' }]);
    expect(preflightPptxPackage(oversized, limits({ maxXmlPartBytes: 4 }))).toEqual({
      ok: false,
      reason: 'xml-part-size-limit',
    });
  });
});

describe('FT-11 relationship inspection', () => {
  it('allows internal relationships as inert XML data', () => {
    expect(inspectPptxRelationshipXml([
      '<Relationship Type="image" Target="../media/image1.png" />',
    ])).toEqual({ ok: true });
  });

  it('rejects every explicit external relationship before rendering', () => {
    expect(inspectPptxRelationshipXml([
      '<Relationship TargetMode="External" Target="https://example.test/track" />',
    ])).toEqual({ ok: false, reason: 'external-relationship-unsupported' });
  });

  it('rejects active target schemes and active relationship types', () => {
    expect(inspectPptxRelationshipXml([
      '<Relationship Target="javascript:alert(1)" />',
    ])).toEqual({ ok: false, reason: 'active-relationship-target-unsupported' });
    expect(inspectPptxRelationshipXml([
      '<Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject" Target="object.bin" />',
    ])).toEqual({ ok: false, reason: 'active-relationship-type-unsupported' });
  });
});
