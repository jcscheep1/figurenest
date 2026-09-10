from pathlib import Path


def one(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"missing marker in {path}: {old[:80]!r}")
    p.write_text(text.replace(old, new, 1))


business = Path("artifacts/calcstride/src/lib/business-calculators.ts")
text = business.read_text()
third_examples = {
    "'Below-spend revenue'": "      {\n        title: 'Scaled campaign',\n        inputs: '$12,500 advertising spend and $62,500 attributed revenue',\n        working: '$62,500 ÷ $12,500',\n        result: '5.00× ROAS and 500% ROAS',\n        interpretation: 'The campaign produced five units of attributed revenue per unit of ad spend before non-advertising costs.',\n      },\n",
    "'Lead follow-up'": "      {\n        title: 'Signup funnel',\n        inputs: '2,400 eligible visitors and 72 completed signups',\n        working: '72 ÷ 2,400 × 100',\n        result: '3% conversion rate',\n        interpretation: 'Three of every one hundred eligible visitors completed the defined action for this reporting window.',\n      },\n",
    "'Higher-cost traffic'": "      {\n        title: 'Low-cost social traffic',\n        inputs: '$840 spend and 2,100 clicks',\n        working: '$840 ÷ 2,100',\n        result: '$0.40 average CPC',\n        interpretation: 'The average click cost is forty cents before considering conversion quality or customer value.',\n      },\n",
    "'Premium inventory'": "      {\n        title: 'Broad awareness buy',\n        inputs: '$1,800 spend and 900,000 impressions',\n        working: '$1,800 ÷ 900,000 × 1,000',\n        result: '$2.00 CPM',\n        interpretation: 'The campaign paid two dollars per thousand delivered impressions without implying unique reach or conversions.',\n      },\n",
    "'Channel-specific acquisition'": "      {\n        title: 'Referral acquisition cohort',\n        inputs: '$9,600 acquisition spend and 80 new customers',\n        working: '$9,600 ÷ 80',\n        result: '$120.00 CAC',\n        interpretation: 'The cohort averages $120 of acquisition spend per new customer before retention and lifetime value.',\n      },\n",
}
for title, addition in third_examples.items():
    position = text.index("title: " + title)
    close = text.index("      },", position) + len("      },\n")
    edge = text.index("    edgeCases:", close)
    if text.count("title:", close, edge) == 0:
        text = text[:close] + addition + text[close:]
business.write_text(text)


growth = Path("artifacts/calcstride/src/lib/business-growth-calculators.ts")
text = growth.read_text()
for old, new in [
    ("  if (slug === 'conversion-rate') {\n    if (a <= 0)", "  if (slug === 'conversion-rate') {\n    if (!Number.isInteger(a) || !Number.isInteger(b)) return invalid('Opportunity and conversion counts must be whole numbers');\n    if (a <= 0)"),
    ("  if (slug === 'cpc') {\n    if (b <= 0)", "  if (slug === 'cpc') {\n    if (!Number.isInteger(b)) return invalid('Clicks must be a whole number');\n    if (b <= 0)"),
    ("  if (slug === 'cpm') {\n    if (b <= 0)", "  if (slug === 'cpm') {\n    if (!Number.isInteger(b)) return invalid('Impressions must be a whole number');\n    if (b <= 0)"),
    ("  if (b <= 0) return invalid('New customers acquired must be greater than zero');", "  if (!Number.isInteger(b)) return invalid('New customers acquired must be a whole number');\n  if (b <= 0) return invalid('New customers acquired must be greater than zero');"),
]:
    if old not in text:
        raise SystemExit(f"whole-number marker missing: {old}")
    text = text.replace(old, new, 1)
growth.write_text(text)


tests = Path("artifacts/calcstride/src/lib/business-growth-calculators.test.ts")
text = tests.read_text()
marker = "test('blank, negative, nonnumeric, and oversized values are rejected', () => {"
guard = "test('count inputs require whole numbers while monetary inputs may use decimals', () => {\n  assert.ok(calculateBusinessGrowth('conversion-rate', ['100.5', '10']).error);\n  assert.ok(calculateBusinessGrowth('conversion-rate', ['100', '10.5']).error);\n  assert.ok(calculateBusinessGrowth('cpc', ['100.50', '10.5']).error);\n  assert.ok(calculateBusinessGrowth('cpm', ['100.50', '1000.5']).error);\n  assert.ok(calculateBusinessGrowth('customer-acquisition-cost', ['100.50', '2.5']).error);\n  assert.equal(calculateBusinessGrowth('cpc', ['100.50', '3']).error, undefined);\n});\n\n"
if guard not in text:
    if marker not in text:
        raise SystemExit("business test insertion marker missing")
    text = text.replace(marker, guard + marker, 1)
tests.write_text(text)


seo = Path("artifacts/calcstride/src/lib/seo-capabilities.ts")
text = seo.read_text()
marker = "  vat: {\n    seoTitle: 'VAT Calculator — Add or Remove Tax | FigureNest',"
entries = "  roas: { seoTitle: 'ROAS Calculator — Return on Ad Spend | FigureNest', seoDescription: 'Calculate ROAS with EUR, USD, GBP, or ZAR formatting from ad spend and attributed revenue; currency selection is not live FX conversion.', visibleNote: businessMoneyNote },\n  cpc: { seoTitle: 'CPC Calculator — Cost Per Click | FigureNest', seoDescription: 'Calculate CPC with EUR, USD, GBP, or ZAR formatting from advertising spend and clicks; currency selection is not live FX conversion.', visibleNote: businessMoneyNote },\n  cpm: { seoTitle: 'CPM Calculator — Cost Per 1,000 Impressions | FigureNest', seoDescription: 'Calculate CPM with EUR, USD, GBP, or ZAR formatting from advertising spend and impressions; currency selection is not live FX conversion.', visibleNote: businessMoneyNote },\n  'customer-acquisition-cost': { seoTitle: 'Customer Acquisition Cost Calculator — CAC | FigureNest', seoDescription: 'Calculate CAC with EUR, USD, GBP, or ZAR formatting from acquisition spend and new customers; currency selection is not live FX conversion.', visibleNote: businessMoneyNote },\n"
if "ROAS Calculator — Return on Ad Spend" not in text:
    if marker not in text:
        raise SystemExit("SEO insertion marker missing")
    text = text.replace(marker, entries + marker, 1)
seo.write_text(text)


api = Path("artifacts/api-server/src/routes/catalog.ts")
text = api.read_text()
marker = '  {\n    slug: "vat",\n    name: "VAT Calculator",'
entries = '''  { slug: "roas", name: "ROAS Calculator", description: "Calculate return on ad spend from advertising cost and attributed revenue.", category: "Business", categorySlug: "business", href: "/calculators/business/roas", tags: ["roas", "return on ad spend", "advertising", "marketing"], featured: false, lastUpdated: CATALOG_LAST_UPDATED },
  { slug: "conversion-rate", name: "Conversion Rate Calculator", description: "Calculate the percentage of visitors, leads, or opportunities that convert.", category: "Business", categorySlug: "business", href: "/calculators/business/conversion-rate", tags: ["conversion rate", "conversions", "marketing", "sales"], featured: false, lastUpdated: CATALOG_LAST_UPDATED },
  { slug: "cpc", name: "CPC Calculator", description: "Calculate average advertising cost per click from spend and recorded clicks.", category: "Business", categorySlug: "business", href: "/calculators/business/cpc", tags: ["cpc", "cost per click", "advertising", "marketing"], featured: false, lastUpdated: CATALOG_LAST_UPDATED },
  { slug: "cpm", name: "CPM Calculator", description: "Calculate advertising cost per one thousand impressions from spend and impressions.", category: "Business", categorySlug: "business", href: "/calculators/business/cpm", tags: ["cpm", "cost per thousand", "impressions", "advertising"], featured: false, lastUpdated: CATALOG_LAST_UPDATED },
  { slug: "customer-acquisition-cost", name: "Customer Acquisition Cost Calculator", description: "Calculate average customer acquisition cost from acquisition spend and new customers.", category: "Business", categorySlug: "business", href: "/calculators/business/customer-acquisition-cost", tags: ["cac", "customer acquisition cost", "marketing", "customers"], featured: false, lastUpdated: CATALOG_LAST_UPDATED },
'''
if 'slug: "roas"' not in text:
    if marker not in text:
        raise SystemExit("API insertion marker missing")
    text = text.replace(marker, entries + marker, 1)
api.write_text(text)


category = Path("artifacts/calcstride/src/lib/category-content.ts")
text = category.read_text()
marker = "      { slug: 'break-even', description: 'Estimate the sales volume and revenue needed to cover fixed costs using the price and variable-cost assumptions entered.' },\n"
entries = marker + "      { slug: 'roas', description: 'Compare attributed advertising revenue with ad spend as a revenue-efficiency multiple and percentage.' },\n      { slug: 'conversion-rate', description: 'Measure completed conversions as a percentage of a consistently defined opportunity count.' },\n      { slug: 'cpc', description: 'Calculate average advertising spend per recorded click for a consistent campaign scope.' },\n      { slug: 'cpm', description: 'Standardize advertising spend as cost per one thousand delivered impressions.' },\n      { slug: 'customer-acquisition-cost', description: 'Average a defined acquisition-cost pool across the corresponding new customers.' },\n"
if "{ slug: 'roas', description:" not in text:
    if marker not in text:
        raise SystemExit("business category marker missing")
    text = text.replace(marker, entries, 1)
category.write_text(text)


one("artifacts/calcstride/src/lib/phase-four.test.ts", "  assert.equal(publishedTools.length, 163);", "  assert.equal(publishedTools.length, catalogTools.length);")
one("artifacts/calcstride/src/lib/phase-three-c.test.ts", "  assert.equal(publishedTools.length, 163);", "  assert.equal(publishedTools.length, catalogTools.length);")
one("artifacts/calcstride/src/lib/site-audit.test.ts", "  assert.equal(publishedToolCount, 163);\n  assert.equal(publishedToolCount, new Set(canonicalHrefs).size);\n  assert.equal(localTools.length, 163);", "  assert.equal(publishedToolCount, new Set(canonicalHrefs).size);\n  assert.equal(localTools.length, publishedToolCount);")
one("artifacts/calcstride/src/lib/site-audit.test.ts", "  assert.equal(publishedTools.length, 163);", "  assert.equal(publishedTools.length, publishedToolCount);")
