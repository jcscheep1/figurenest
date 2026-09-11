type ZipEntry = {
  name: string;
  bytes: Uint8Array;
};

export type DocxPublicationFixture = {
  id: '1' | '2' | '3' | '4' | '5' | '6' | '8';
  name: string;
  expectedText: readonly string[];
  expectedHtml: readonly RegExp[];
  bytes: Uint8Array;
};

const encoder = new TextEncoder();

function text(value: string): Uint8Array {
  return encoder.encode(value);
}

function u16(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function u32(value: number): Uint8Array {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]);
}

function concat(parts: readonly Uint8Array[]): Uint8Array {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.byteLength;
  }
  return output;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function storedZip(entries: readonly ZipEntry[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const name = text(entry.name);
    const checksum = crc32(entry.bytes);
    const local = concat([
      u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(checksum),
      u32(entry.bytes.byteLength), u32(entry.bytes.byteLength), u16(name.byteLength), u16(0), name,
    ]);
    localParts.push(local, entry.bytes);
    centralParts.push(concat([
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(checksum),
      u32(entry.bytes.byteLength), u32(entry.bytes.byteLength), u16(name.byteLength), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(localOffset), name,
    ]));
    localOffset += local.byteLength + entry.bytes.byteLength;
  }

  const local = concat(localParts);
  const central = concat(centralParts);
  const end = concat([
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(central.byteLength), u32(local.byteLength), u16(0),
  ]);
  return concat([local, central, end]);
}

const rootRelationships = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const emptyDocumentRelationships = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

const numbering = `<?xml version="1.0" encoding="UTF-8"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/></w:lvl>
    <w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="lowerLetter"/><w:lvlText w:val="%2."/></w:lvl>
  </w:abstractNum>
  <w:abstractNum w:abstractNumId="1">
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/></w:lvl>
    <w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="◦"/></w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
  <w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>`;

const onePixelPng = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
  0, 0, 0, 1, 0, 0, 0, 1, 8, 4, 0, 0, 0, 181, 28, 12, 2,
  0, 0, 0, 11, 73, 68, 65, 84, 120, 218, 99, 252, 255, 31, 0, 3,
  3, 2, 0, 239, 191, 105, 185, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
]);

function documentXml(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>${body}<w:sectPr/></w:body>
</w:document>`;
}

function paragraph(value: string): string {
  return `<w:p><w:r><w:t>${value}</w:t></w:r></w:p>`;
}

function listItem(value: string, numId: 1 | 2, level = 0): string {
  return `<w:p><w:pPr><w:numPr><w:ilvl w:val="${level}"/><w:numId w:val="${numId}"/></w:numPr></w:pPr><w:r><w:t>${value}</w:t></w:r></w:p>`;
}

function packageBytes(body: string, options: { numbering?: boolean; image?: boolean } = {}): Uint8Array {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${options.image ? '<Default Extension="png" ContentType="image/png"/>' : ''}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  ${options.numbering ? '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>' : ''}
</Types>`;
  const documentRelationships = options.image
    ? `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdImage1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/></Relationships>`
    : options.numbering
      ? `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdNumbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>`
      : emptyDocumentRelationships;

  const entries: ZipEntry[] = [
    { name: '[Content_Types].xml', bytes: text(contentTypes) },
    { name: '_rels/.rels', bytes: text(rootRelationships) },
    { name: 'word/document.xml', bytes: text(documentXml(body)) },
    { name: 'word/_rels/document.xml.rels', bytes: text(documentRelationships) },
  ];
  if (options.numbering) entries.push({ name: 'word/numbering.xml', bytes: text(numbering) });
  if (options.image) entries.push({ name: 'word/media/image1.png', bytes: onePixelPng });
  return storedZip(entries);
}

const imageDrawing = `<w:p><w:r><w:drawing><wp:inline>
  <wp:extent cx="952500" cy="952500"/><wp:docPr id="1" name="Fixture image" descr="Embedded fixture image"/>
  <a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
    <pic:pic><pic:nvPicPr><pic:cNvPr id="1" name="fixture.png"/><pic:cNvPicPr/></pic:nvPicPr>
      <pic:blipFill><a:blip r:embed="rIdImage1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
      <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="952500" cy="952500"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
    </pic:pic>
  </a:graphicData></a:graphic>
</wp:inline></w:drawing></w:r></w:p>`;

export const DOCX_PUBLICATION_FIXTURES: readonly DocxPublicationFixture[] = [
  {
    id: '1',
    name: 'plain paragraphs and Unicode',
    expectedText: ['Plain paragraph', 'Café — Καλημέρα — 你好'],
    expectedHtml: [/<p>Plain paragraph<\/p>/, /Café — Καλημέρα — 你好/],
    bytes: packageBytes(paragraph('Plain paragraph') + paragraph('Café — Καλημέρα — 你好')),
  },
  {
    id: '2',
    name: 'heading hierarchy',
    expectedText: ['Primary heading', 'Secondary heading'],
    expectedHtml: [/<h1>Primary heading<\/h1>/, /<h2>Secondary heading<\/h2>/],
    bytes: packageBytes('<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Primary heading</w:t></w:r></w:p><w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>Secondary heading</w:t></w:r></w:p>'),
  },
  {
    id: '3',
    name: 'ordered and unordered lists',
    expectedText: ['First ordered', 'First bullet'],
    expectedHtml: [/<ol>/, /<ul>/],
    bytes: packageBytes(listItem('First ordered', 1) + listItem('Second ordered', 1) + listItem('First bullet', 2), { numbering: true }),
  },
  {
    id: '4',
    name: 'nested lists',
    expectedText: ['Parent item', 'Nested item'],
    expectedHtml: [/<ol>[\s\S]*<ol>/],
    bytes: packageBytes(listItem('Parent item', 1) + listItem('Nested item', 1, 1), { numbering: true }),
  },
  {
    id: '5',
    name: 'basic inline emphasis',
    expectedText: ['Bold text', 'Italic text', 'Underlined text'],
    expectedHtml: [/<strong>Bold text<\/strong>/, /<em>Italic text<\/em>/, /<u>Underlined text<\/u>/],
    bytes: packageBytes('<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Bold text</w:t></w:r><w:r><w:t xml:space="preserve"> </w:t></w:r><w:r><w:rPr><w:i/></w:rPr><w:t>Italic text</w:t></w:r><w:r><w:t xml:space="preserve"> </w:t></w:r><w:r><w:rPr><w:u w:val="single"/></w:rPr><w:t>Underlined text</w:t></w:r></w:p>'),
  },
  {
    id: '6',
    name: 'simple tables',
    expectedText: ['Header A', 'Cell B'],
    expectedHtml: [/<table>/, /<td>[\s\S]*Header A[\s\S]*<\/td>/],
    bytes: packageBytes('<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Header A</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Header B</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:p><w:r><w:t>Cell A</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Cell B</w:t></w:r></w:p></w:tc></w:tr></w:tbl>'),
  },
  {
    id: '8',
    name: 'inline embedded PNG image',
    expectedText: [],
    expectedHtml: [/<img[^>]+src="data:image\/png;base64,/],
    bytes: packageBytes(imageDrawing, { image: true }),
  },
] as const;
