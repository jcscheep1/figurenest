from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)

phase_path = Path('artifacts/calcstride/src/lib/phase-three-b.ts')
phase = phase_path.read_text()
if "'big-number'" in phase or "slug: 'distance'" in phase:
    raise RuntimeError('Math mini-cluster slugs already exist; refusing duplicate integration')

phase = replace_once(
    phase,
    "  | 'probability';",
    "  | 'probability' | 'big-number' | 'distance';",
    'PhaseThreeBSlug union',
)

facts_anchor = "  probability: {\n    method: 'Simple probability is favorable outcomes divided by total outcomes; complements are 1−P(A), and independent conjunctions multiply P(A) by P(B).',"
facts_insert = """  'big-number': {
    method: 'Arbitrary-precision integer arithmetic keeps every decimal digit exact instead of converting large operands to floating-point numbers.',
    example: 'Adding 9,007,199,254,740,993 and 1 gives exactly 9,007,199,254,740,994, even though the first value is beyond JavaScript Number safe-integer precision.',
    interpretation: 'Addition, subtraction, and multiplication return the exact integer result. Division returns an integer quotient that truncates toward zero together with the signed remainder.',
    edge: 'Each operand must be a signed whole integer containing at most 1,000 digits. Blank values, decimals, exponent notation, malformed signs, and division by zero are rejected.',
    limits: 'The calculator handles integer arithmetic only. It does not evaluate decimal fractions, rational expressions, roots, powers, symbolic algebra, or cryptographic big-number operations.',
  },
  distance: {
    method: 'The Euclidean distance between two 2D points is the square root of the squared horizontal difference plus the squared vertical difference.',
    example: 'From (0, 0) to (3, 4), the differences are 3 and 4, so the distance is √(3² + 4²) = 5 coordinate units.',
    interpretation: 'The result is the straight-line distance in the same generic coordinate units used by both axes, with Δx and Δy shown as supporting details.',
    edge: 'All four coordinates must be finite values within the supported ±10¹⁵ numeric range. Signed values, decimals, identical points, and zero differences are valid.',
    limits: 'This is flat 2D Euclidean geometry. It does not calculate road distance, geographic great-circle distance, 3D distance, map projections, or mixed physical units.',
  },
""" + facts_anchor
phase = replace_once(phase, facts_anchor, facts_insert, 'Phase 3B facts')

spec_anchor = "  probability: { slug: 'probability',"
spec_insert = """  'big-number': { slug: 'big-number', name: 'Big Number Calculator', description: 'Perform exact arbitrary-precision integer addition, subtraction, multiplication, and division with quotient and remainder.', category: 'Math', categorySlug: 'math', tags: ['big number calculator', 'large integer calculator', 'arbitrary precision', 'BigInt', 'integer arithmetic'], fields: [select('operation','Operation','add',[['add','Add (+)'],['subtract','Subtract (−)'],['multiply','Multiply (×)'],['divide','Integer divide (quotient + remainder)']]),text('a','Integer A','9007199254740993'),text('b','Integer B','1')], formula: 'addition: A + B; subtraction: A − B; multiplication: A × B; division: A = Bq + r', variables: 'A and B are signed whole integers containing at most 1,000 digits; q is the integer quotient truncated toward zero and r is the remainder.', sourceLinks: [{ label: 'NIST Mathematics and Statistics', href: 'https://www.nist.gov/pml/mathematics-statistics' }], relatedRoutes: ['/calculators/math/long-division','/calculators/math/prime-factorization','/calculators/math/exponent'], ...facts['big-number'] },
  distance: { slug: 'distance', name: 'Distance Calculator', description: 'Calculate straight-line Euclidean distance between two 2D coordinate points and review the horizontal and vertical differences.', category: 'Math', categorySlug: 'math', tags: ['distance calculator', 'distance between two points', 'coordinate distance', 'Euclidean distance', '2D geometry'], fields: [n('x1','Point 1 x','0',-1e15,1e15),n('y1','Point 1 y','0',-1e15,1e15),n('x2','Point 2 x','3',-1e15,1e15),n('y2','Point 2 y','4',-1e15,1e15)], formula: 'd = √((x₂ − x₁)² + (y₂ − y₁)²)', variables: 'x₁ and y₁ locate the first point; x₂ and y₂ locate the second point. The result uses generic coordinate units shared by both axes.', sourceLinks: [{ label: 'NIST Mathematics and Statistics', href: 'https://www.nist.gov/pml/mathematics-statistics' }], relatedRoutes: ['/calculators/math/circle','/calculators/math/area','/calculators/math/exponent'], ...facts.distance },
""" + spec_anchor
phase = replace_once(phase, spec_anchor, spec_insert, 'Phase 3B specs')

helper_anchor = "const integer = (value: string) => /^[-+]?\\d+$/.test(value.trim()) ? BigInt(value.trim()) : null;"
helper_insert = helper_anchor + "\nconst BIG_NUMBER_DIGIT_LIMIT = 1000;\nconst bigIntegerOperand = (value: string): bigint | null => {\n  const trimmed = value.trim();\n  if (!/^[-+]?\\d+$/.test(trimmed)) return null;\n  const digits = trimmed.replace(/^[-+]/, '');\n  if (digits.length > BIG_NUMBER_DIGIT_LIMIT) return null;\n  return BigInt(trimmed.startsWith('+') ? trimmed.slice(1) : trimmed);\n};"
phase = replace_once(phase, helper_anchor, helper_insert, 'Big integer helper')

calc_anchor = "  try {\n    if (slug === 'binary' || slug === 'hex') {"
calc_insert = """  try {
    if (slug === 'big-number') {
      const a = bigIntegerOperand(values[1]);
      const b = bigIntegerOperand(values[2]);
      if (a === null || b === null) return bad(`Enter signed whole integers containing no more than ${BIG_NUMBER_DIGIT_LIMIT.toLocaleString('en-US')} digits each.`);
      if (values[0] === 'add') return result((a + b).toString(), 'Exact arbitrary-precision integer sum.', [{ label: 'Operation', value: 'Addition' }]);
      if (values[0] === 'subtract') return result((a - b).toString(), 'Exact arbitrary-precision integer difference.', [{ label: 'Operation', value: 'Subtraction' }]);
      if (values[0] === 'multiply') return result((a * b).toString(), 'Exact arbitrary-precision integer product.', [{ label: 'Operation', value: 'Multiplication' }]);
      if (values[0] === 'divide') {
        if (b === 0n) return bad('The divisor must be a nonzero integer.');
        const quotient = a / b;
        const remainder = a % b;
        return result(quotient.toString(), 'Exact integer quotient with division truncated toward zero.', [{ label: 'Remainder', value: remainder.toString() }, { label: 'Identity check', value: 'A = B × quotient + remainder' }]);
      }
      return bad('Choose a valid arithmetic operation.');
    }
    if (slug === 'distance') {
      const x1 = at(0), y1 = at(1), x2 = at(2), y2 = at(3);
      if (x1 === null || y1 === null || x2 === null || y2 === null) return bad('Enter four finite coordinates between -1,000,000,000,000,000 and 1,000,000,000,000,000.');
      const deltaX = x2 - x1;
      const deltaY = y2 - y1;
      const distance = Math.hypot(deltaX, deltaY);
      if (!Number.isFinite(distance)) return bad('The coordinate distance is outside the supported numeric range.');
      const clean = (value: number) => Object.is(value, -0) ? 0 : value;
      return result(format(clean(distance)), 'Straight-line Euclidean distance in coordinate units.', [{ label: 'Δx', value: format(clean(deltaX)) }, { label: 'Δy', value: format(clean(deltaY)) }]);
    }
    if (slug === 'binary' || slug === 'hex') {"""
phase = replace_once(phase, calc_anchor, calc_insert, 'Phase 3B calculation dispatch')
phase_path.write_text(phase)

meta_path = Path('artifacts/calcstride/src/lib/expansion-metadata.ts')
meta = meta_path.read_text()
if '"slug": "big-number"' in meta or '"slug": "distance"' in meta:
    raise RuntimeError('Expansion metadata already contains proposed Math slugs')
meta_marker = "  }\n] as const satisfies readonly CatalogEntry[];\n\nexport const phaseThreeCCatalog"
meta_entries = """  },
  {
    "slug": "big-number",
    "name": "Big Number Calculator",
    "description": "Perform exact arbitrary-precision integer addition, subtraction, multiplication, and division with quotient and remainder.",
    "category": "Math",
    "categorySlug": "math",
    "tags": ["big number calculator", "large integer calculator", "arbitrary precision", "BigInt", "integer arithmetic"],
    "href": "/calculators/math/big-number"
  },
  {
    "slug": "distance",
    "name": "Distance Calculator",
    "description": "Calculate straight-line Euclidean distance between two 2D coordinate points and review the horizontal and vertical differences.",
    "category": "Math",
    "categorySlug": "math",
    "tags": ["distance calculator", "distance between two points", "coordinate distance", "Euclidean distance", "2D geometry"],
    "href": "/calculators/math/distance"
  }
] as const satisfies readonly CatalogEntry[];

export const phaseThreeCCatalog"""
meta = replace_once(meta, meta_marker, meta_entries, 'Phase 3B expansion metadata')
meta_path.write_text(meta)

units_path = Path('artifacts/calcstride/src/lib/units-preferences.ts')
units = units_path.read_text()
units = replace_once(
    units,
    "'permutation-combination': unitless(), probability: unitless(),",
    "'permutation-combination': unitless(), probability: unitless(), 'big-number': unitless(), distance: unitless(),",
    'Math tool applicability',
)
units_path.write_text(units)

category_path = Path('artifacts/calcstride/src/lib/category-content.ts')
category = category_path.read_text()
category_anchor = "      { slug: 'volume', description: 'Find rectangular volume by multiplying length, width, and height, with a result expressed in cubic units.' },"
category_insert = category_anchor + "\n      { slug: 'big-number', description: 'Perform exact signed-integer arithmetic on values far beyond ordinary floating-point safe-integer precision.' },\n      { slug: 'distance', description: 'Find straight-line Euclidean distance between two points from their x and y coordinates.' },"
category = replace_once(category, category_anchor, category_insert, 'Math category descriptions')
category_path.write_text(category)

test_path = Path('artifacts/calcstride/src/lib/phase-three-b.test.ts')
tests = test_path.read_text()
tests = replace_once(tests, 'assert.equal(phaseThreeBSlugs.length, 16);', 'assert.equal(phaseThreeBSlugs.length, 18);', 'Phase 3B slug count')
tests = replace_once(tests, ')).size, 16);', ')).size, 18);', 'Phase 3B route count')
test_path.write_text(tests)

focused_path = Path('artifacts/calcstride/src/lib/math-mini-cluster.test.ts')
focused_path.write_text("""import assert from 'node:assert/strict';
import test from 'node:test';
import { publishedTools } from './catalog';
import { categoryContent } from './category-content';
import { calculatePhaseThreeB, phaseThreeBDefinitions } from './phase-three-b';
import { toolApplicability } from './units-preferences';

test('Big Number Calculator preserves exact arbitrary-precision integer arithmetic', () => {
  assert.equal(calculatePhaseThreeB('big-number', ['add', '9007199254740993', '1']).primary, '9007199254740994');
  assert.equal(calculatePhaseThreeB('big-number', ['subtract', '-9007199254740993', '2']).primary, '-9007199254740995');
  assert.equal(calculatePhaseThreeB('big-number', ['multiply', '12345678901234567890', '-3']).primary, '-37037036703703703670');
  const division = calculatePhaseThreeB('big-number', ['divide', '-17', '5']);
  assert.equal(division.primary, '-3');
  assert.equal(division.details.find((item) => item.label === 'Remainder')?.value, '-2');
  assert.equal(calculatePhaseThreeB('big-number', ['add', '0', '0']).primary, '0');
});

test('Big Number Calculator rejects malformed, blank, over-limit, decimal, exponent and zero-divisor input', () => {
  const invalid = [
    ['add', '', '1'], ['add', '   ', '1'], ['add', '1.5', '2'], ['add', '1e3', '2'],
    ['add', '--1', '2'], ['add', 'NaN', '2'], ['add', 'Infinity', '2'], ['divide', '4', '0'],
    ['add', '1'.repeat(1001), '2'],
  ] as const;
  for (const values of invalid) assert.ok(calculatePhaseThreeB('big-number', values).error, values.join('|'));
  assert.equal(calculatePhaseThreeB('big-number', ['add', '9'.repeat(1000), '1']).error, undefined);
});

test('Distance Calculator covers reference, signed, decimal, zero-distance and axis-aligned cases', () => {
  assert.equal(calculatePhaseThreeB('distance', ['0', '0', '3', '4']).primary, '5');
  assert.equal(calculatePhaseThreeB('distance', ['2', '-3', '2', '-3']).primary, '0');
  assert.equal(calculatePhaseThreeB('distance', ['-1', '-1', '2', '3']).primary, '5');
  assert.equal(calculatePhaseThreeB('distance', ['0.5', '1.5', '3.5', '5.5']).primary, '5');
  const vertical = calculatePhaseThreeB('distance', ['2', '-3', '2', '7']);
  assert.equal(vertical.primary, '10');
  assert.equal(vertical.details.find((item) => item.label === 'Δx')?.value, '0');
});

test('Distance Calculator rejects blank, non-finite and out-of-bound coordinates', () => {
  for (const values of [
    ['', '0', '3', '4'], [' ', '0', '3', '4'], ['NaN', '0', '3', '4'],
    ['Infinity', '0', '3', '4'], ['1000000000000001', '0', '3', '4'],
  ]) assert.ok(calculatePhaseThreeB('distance', values).error, values.join('|'));
});

test('Math mini-cluster is published through the existing registries and remains unitless', () => {
  for (const slug of ['big-number', 'distance'] as const) {
    const definition = phaseThreeBDefinitions[slug];
    assert.ok(publishedTools.some((tool) => tool.slug === slug && tool.href === definition.href), slug);
    assert.deepEqual(toolApplicability[slug], { monetary: false, dimensions: [], unitless: true });
    assert.ok(categoryContent.math.toolDescriptions.some((item) => item.slug === slug), slug);
  }
});
""")

print('Applied guarded Big Number + Distance Math mini-cluster integration')
