from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"expected marker missing in {path}: {old[:80]}")
    p.write_text(text.replace(old, new, 1))


app = "artifacts/calcstride/src/App.tsx"
replace_once(
    app,
    "const csvXlsxPages = import.meta.env.SSR ? await import('@/pages/CsvXlsxPages') : null;\n",
    "const csvXlsxPages = import.meta.env.SSR ? await import('@/pages/CsvXlsxPages') : null;\nconst xlsxToPdfPages = import.meta.env.SSR ? await import('@/pages/XlsxToPdfPage') : null;\n",
)
replace_once(
    app,
    "const XlsxToCsvPage = csvXlsxPages?.XlsxToCsvPage\n  ?? lazy(() => import('@/pages/CsvXlsxPages').then(({ XlsxToCsvPage: page }) => ({ default: page })));\n",
    "const XlsxToCsvPage = csvXlsxPages?.XlsxToCsvPage\n  ?? lazy(() => import('@/pages/CsvXlsxPages').then(({ XlsxToCsvPage: page }) => ({ default: page })));\nconst XlsxToPdfPage = xlsxToPdfPages?.XlsxToPdfPage\n  ?? lazy(() => import('@/pages/XlsxToPdfPage').then(({ XlsxToPdfPage: page }) => ({ default: page })));\n",
)
replace_once(
    app,
    '        <Route path="/file-tools/xlsx-to-csv" component={XlsxToCsvPage} />\n',
    '        <Route path="/file-tools/xlsx-to-csv" component={XlsxToCsvPage} />\n        <Route path="/file-tools/xlsx-to-pdf" component={XlsxToPdfPage} />\n',
)

page = "artifacts/calcstride/src/pages/XlsxToPdfPage.tsx"
replace_once(
    page,
    "import { CheckCircle2, Download } from 'lucide-react';\n",
    "import { ArrowLeft, CheckCircle2, Download } from 'lucide-react';\nimport { Shell } from '@/components/FigureNestShell';\nimport { Link } from '@/components/PublicLink';\nimport { Seo } from '@/pages/AppPages';\n",
)
replace_once(
    page,
    "/**\n * FT-10 implementation surface. Deliberately unrouted until publication QA exists.\n * Do not add SEO/catalog/sitemap exposure merely because this component compiles.\n */\n",
    "/** Published FT-10 XLSX → PDF browser-local conversion surface. */\n",
)
replace_once(
    page,
    '  return <main className="tool-page file-tool-page" data-testid="ft10-unrouted-converter">\n    <header className="file-tool-hero">\n      <p className="eyebrow">FT-10 unpublished implementation</p>\n',
    '  return <Shell>\n    <Seo path="/file-tools/xlsx-to-pdf" />\n    <main className="tool-page file-tool-page" data-testid="page-xlsx-to-pdf">\n      <nav className="calc-breadcrumb" aria-label="Breadcrumb">\n        <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link>\n        <Link href="/category/file-tools">PDF &amp; File Tools</Link>\n        <span aria-current="page">/ XLSX TO PDF</span>\n      </nav>\n    <header className="file-tool-hero">\n      <p className="eyebrow">Private browser file tool</p>\n',
)
replace_once(page, "  </main>;\n}\n", "    </main>\n  </Shell>;\n}\n")

catalog = "artifacts/calcstride/src/lib/file-tools-catalog.ts"
p = Path(catalog)
text = p.read_text()
marker = "} as const satisfies Record<string, FileToolDefinition>;"
if "'xlsx-to-pdf': {" in text:
    raise SystemExit("xlsx-to-pdf catalog entry already exists")
entry = """  'xlsx-to-pdf': {
    slug: 'xlsx-to-pdf',
    name: 'XLSX to PDF',
    description: 'Convert a selected XLSX worksheet or bounded cell range into a searchable PDF locally in your browser.',
    category: FILE_TOOLS_CATEGORY.name,
    categorySlug: FILE_TOOLS_CATEGORY.slug,
    href: '/file-tools/xlsx-to-pdf',
    tags: ['xlsx to pdf', 'excel to pdf', 'spreadsheet to pdf', 'private spreadsheet converter', 'browser excel converter'],
    featured: false,
    h1: 'Convert XLSX to PDF',
    seoTitle: 'Free XLSX to PDF Converter | Private Browser | FigureNest',
    seoDescription: 'Convert one XLSX worksheet or cell range to a searchable PDF locally in your browser. Choose page size and orientation without uploading the spreadsheet.',
    privacySummary: 'The XLSX workbook, filename, selected cell content and generated PDF stay in this browser tab and are not uploaded to a FigureNest conversion server.',
    limitations: [
      'Conversion is best-effort table rendering, not a pixel-perfect Excel print export. Workbook styles, charts, pivots, conditional formatting and exact print settings are not preserved.',
      'Formulas and macros are never recalculated or executed. Existing displayed cell values are treated as inert spreadsheet content.',
      'Publication limits are intentionally conservative: up to 500 rows, 25 columns, 5,000 populated cells, 40 PDF pages and 2 MiB generated PDF output for the selected range.',
      'Only XLSX packages that pass local OOXML/ZIP resource checks are processed. Malformed, suspicious or oversized workbooks fail closed locally.'
    ],
    faqs: [
      { question: 'Does FigureNest upload my spreadsheet?', answer: 'No. XLSX inspection, worksheet selection, preview and PDF creation run locally in your browser. Workbook bytes, filenames, cell contents and generated PDFs are not sent to a FigureNest conversion server.' },
      { question: 'Will the PDF look exactly like Excel?', answer: 'No. This tool creates a clean searchable table PDF from a selected worksheet or range. It does not reproduce Excel charts, pivots, conditional formatting, formulas, macros or exact print-layout settings.' },
      { question: 'Can I choose a worksheet or cell range?', answer: 'Yes. Select a worksheet and optionally enter an A1-style range such as A1:F40 before creating the PDF.' },
      { question: 'Are formulas recalculated?', answer: 'No. FigureNest never executes or recalculates workbook formulas or macros. Formula-looking text remains inert.' },
      { question: 'Can I choose portrait or landscape output?', answer: 'Yes. Choose portrait or landscape orientation and A4 or Letter page size before generating the searchable PDF.' }
    ],
    relatedRoutes: ['/file-tools/xlsx-to-csv', '/file-tools/csv-to-xlsx', '/file-tools/docx-to-pdf'],
  },
"""
if marker not in text:
    raise SystemExit("catalog closing marker missing")
p.write_text(text.replace(marker, entry + marker, 1))

replace_once(
    "artifacts/calcstride/src/lib/units-preferences.ts",
    "'csv-to-xlsx': unitless(), 'xlsx-to-csv': unitless(),",
    "'csv-to-xlsx': unitless(), 'xlsx-to-csv': unitless(), 'xlsx-to-pdf': unitless(),",
)
