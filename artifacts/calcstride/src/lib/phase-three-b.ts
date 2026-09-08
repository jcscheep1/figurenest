export type PhaseThreeBSlug =
  | 'binary' | 'circle' | 'greatest-common-factor' | 'confidence-interval'
  | 'exponent' | 'prime-factorization' | 'half-life' | 'hex'
  | 'least-common-multiple' | 'log' | 'long-division' | 'matrix'
  | 'mean-median-mode-range' | 'number-sequence' | 'permutation-combination'
  | 'probability';

export type PhaseThreeBField = {
  key: string;
  label: string;
  value: string;
  type: 'number' | 'select' | 'text' | 'textarea';
  min?: number;
  max?: number;
  step?: string;
  options?: readonly { value: string; label: string }[];
};

export type PhaseThreeBResult = {
  primary: string;
  summary: string;
  details: readonly { label: string; value: string }[];
  error?: string;
};

export type PhaseThreeBDefinition = {
  slug: PhaseThreeBSlug;
  name: string;
  description: string;
  category: 'Math';
  categorySlug: 'math';
  href: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  tags: readonly string[];
  fields: readonly PhaseThreeBField[];
  resultLabel: string;
  formula: string;
  variables: string;
  workedExample: string;
  interpretation: string;
  edgeCases: string;
  limitations: string;
  sourceLinks: readonly { label: string; href: string }[];
  educationalSections: readonly { heading: string; body: string }[];
  faqs: readonly { question: string; answer: string }[];
  relatedRoutes: readonly string[];
};

const n = (key: string, label: string, value: string, min = 0, max = 1e12): PhaseThreeBField => ({
  key, label, value, type: 'number', min, max, step: 'any',
});
const text = (key: string, label: string, value: string, type: 'text' | 'textarea' = 'text'): PhaseThreeBField => ({
  key, label, value, type,
});
const select = (key: string, label: string, value: string, options: readonly [string, string][]): PhaseThreeBField => ({
  key, label, value, type: 'select', options: options.map(([optionValue, optionLabel]) => ({ value: optionValue, label: optionLabel })),
});
export const phaseThreeBMetadataSentence = (description: string, calculation: string): string => {
  const text = `${description.replace(/[.!?]+$/, '')}; ${calculation.replace(/[.!?]+$/, '')}.`;
  return text.length <= 160 ? text : `${description.replace(/[.!?]+$/, '')}.`;
};

type ContentFact = {
  method: string;
  example: string;
  interpretation: string;
  edge: string;
  limits: string;
};

const facts: Record<PhaseThreeBSlug, ContentFact> = {
  binary: {
    method: 'Binary uses base two, so each place represents a power of two and each digit is either zero or one.',
    example: 'Decimal 42 is binary 101010; reading 32 + 8 + 2 gives the same value.',
    interpretation: 'Unsigned output represents a nonnegative magnitude. Signed output uses two’s-complement representation at the selected fixed width.',
    edge: 'The input must contain only valid digits for its direction, the width must be a whole number from 1 through 128, and signed values must fit that width.',
    limits: 'This is integer conversion only. It does not interpret floating-point layouts, character encodings, CPU endianness, or an application-specific signed type.',
  },
  circle: {
    method: 'A circle is defined by radius r; diameter is 2r, circumference is 2πr, and area is πr².',
    example: 'A circle with radius 5 has diameter 10, circumference about 31.4159, and area about 78.5398 square units.',
    interpretation: 'The result reconstructs the radius from whichever one of radius, diameter, circumference, or area you know, then reports all four related quantities.',
    edge: 'The known measurement must be nonnegative; circumference and area must be greater than zero to recover a meaningful circle.',
    limits: 'The model describes an ideal flat circle. It does not estimate a sphere’s surface area, an ellipse, thickness, material, or measurement uncertainty.',
  },
  'greatest-common-factor': {
    method: 'The Euclidean algorithm repeatedly replaces the larger integer with the remainder until the remainder is zero; the last nonzero remainder is the GCF.',
    example: 'For 84 and 126, 126 mod 84 is 42 and 84 mod 42 is 0, so the greatest common factor is 42.',
    interpretation: 'The combined tool reports the GCF and can also list every positive factor shared by all entered integers.',
    edge: 'Enter 2–100 positive whole numbers. Decimals, signs, zero, blank list items, and values above the supported integer range are rejected.',
    limits: 'GCF and common-factor lists describe integer divisibility. They do not simplify algebraic expressions with symbolic variables or approximate decimal measurements.',
  },
  'confidence-interval': {
    method: 'For a mean interval with a normal approximation, margin of error is critical value × standard error, where standard error is sample standard deviation divided by √n.',
    example: 'A mean of 50, standard deviation 10, sample size 100, and 95% confidence use z = 1.96, giving an interval of 48.04 to 51.96.',
    interpretation: 'The interval estimates a range for a population mean under the selected model; it is not the probability that a fixed parameter moves after the interval is calculated.',
    edge: 'Standard deviation must be positive, sample size must be at least 2, and confidence must be 90%, 95%, or 99%.',
    limits: 'The calculator uses a z critical value and assumes an independent, representative sample with a reasonably normal sampling distribution. It does not correct bias or study design.',
  },
  exponent: {
    method: 'Exponentiation multiplies a base by itself for a positive whole exponent and extends the relationship to zero, negative, and fractional exponents where defined.',
    example: '2 raised to the fourth power is 16 because 2 × 2 × 2 × 2 equals 16.',
    interpretation: 'The result is a real-number power when JavaScript’s real arithmetic can represent it; scientific notation is included for very large or small finite values.',
    edge: 'Zero to a negative exponent, negative bases with non-integer exponents, non-finite inputs, and overflow are rejected.',
    limits: 'Floating-point output is approximate for many fractions. The tool does not perform symbolic algebra, complex-number evaluation, or arbitrary-precision decimal arithmetic.',
  },
  'prime-factorization': {
    method: 'Prime factorization divides an integer by each possible prime factor and records the multiplicity; a factor list is built from products of those prime powers.',
    example: '360 becomes 2³ × 3² × 5, and its positive factors are all products formed from those available powers.',
    interpretation: 'The combined tool can return prime factors, all positive factors, or both for one positive integer.',
    edge: 'The value must be a positive whole number from 1 through 10¹². One has no prime factors, while a prime is its own prime factor.',
    limits: 'Trial division is practical within the stated range but is not a cryptographic factorization service and does not factor negative integers, polynomials, or rational expressions.',
  },
  'half-life': {
    method: 'Remaining amount after time t is initial amount × 2 raised to −t divided by half-life; inverse time is half-life × log₂(initial divided by remaining amount).',
    example: 'After three half-lives, 100 units become 12.5 units because 100 × 2⁻³ equals 12.5.',
    interpretation: 'Forward mode predicts remaining quantity. Inverse mode finds the elapsed time needed to reach a chosen positive remaining quantity.',
    edge: 'Initial amount and half-life must be positive; time cannot be negative; inverse remaining amount must be greater than zero and no greater than the initial amount.',
    limits: 'The model assumes a constant half-life and exponential decay. It does not model replenishment, multiple decay chains, changing conditions, or measurement noise.',
  },
  hex: {
    method: 'Hexadecimal uses base sixteen, with digits 0–9 and A–F; each hex digit corresponds to four binary bits.',
    example: 'Decimal 255 is hexadecimal FF, and FF maps to binary 11111111 when represented in eight unsigned bits.',
    interpretation: 'Unsigned output is a nonnegative magnitude. Signed output interprets the selected fixed-width bit pattern as two’s-complement.',
    edge: 'Hex characters must be valid, width must be a whole number from 4 through 128 and a multiple of four, and the value must fit its signed or unsigned range.',
    limits: 'This is integer radix conversion. It does not interpret colors, memory byte order, floating-point bit fields, Unicode, or a programming language’s formatting flags.',
  },
  'least-common-multiple': {
    method: 'LCM is the smallest positive integer divisible by every input; it can be found from the product divided by the GCF, applied safely across a list.',
    example: 'The least common multiple of 12 and 18 is 36 because 36 is the first positive number divisible by both.',
    interpretation: 'The result gives the first shared cycle for positive whole-number intervals or denominators.',
    edge: 'Enter 2–100 positive whole numbers. Decimals, zeros, blank items, and values that make the result exceed the supported safe range are rejected.',
    limits: 'LCM applies to integers. It should not be used to synchronize arbitrary real-valued durations without first defining a meaningful integer unit.',
  },
  log: {
    method: 'A logarithm answers which exponent produces a value: log base b of x is the exponent y such that bʸ = x.',
    example: 'log base 10 of 1,000 is 3 because 10³ equals 1,000.',
    interpretation: 'The result reports a real logarithm for a positive value and a positive base other than one. Base 10 and natural-log modes are provided.',
    edge: 'The value must be greater than zero; the base must be greater than zero and cannot equal one.',
    limits: 'This tool returns real logs only. It does not solve logarithmic equations with unknowns, complex branches, or unit-bearing arguments without a defined dimensionless ratio.',
  },
  'long-division': {
    method: 'Integer long division finds a quotient and remainder, then brings down zeroes to produce decimal digits; repeated remainders identify a recurring cycle.',
    example: '7 divided by 4 is 1 remainder 3, followed by decimal digits .75, giving 1.75 exactly.',
    interpretation: 'The result displays the signed decimal quotient, integer quotient, remainder, and a repeating marker when the requested expansion repeats.',
    edge: 'The denominator cannot be zero, decimal places must be a whole number from 0 through 1,000, and inputs must be whole integers.',
    limits: 'The tool divides integers and displays a bounded decimal expansion. It does not infer significant figures or replace arbitrary-precision decimal libraries for financial settlement.',
  },
  matrix: {
    method: 'Matrix addition and subtraction combine matching cells; multiplication takes row-by-column dot products; determinants and inverses use elimination.',
    example: 'The determinant of [[1,2],[3,4]] is 1×4 − 2×3 = −2, so the matrix is nonsingular and invertible.',
    interpretation: 'The calculator returns a formatted matrix, determinant, or inverse and states when dimensions or singularity make the requested operation undefined.',
    edge: 'Matrices must be rectangular, contain finite numbers, have matching dimensions for addition/subtraction, and have compatible dimensions for multiplication.',
    limits: 'Floating-point elimination can accumulate rounding error. The tool is limited to matrices up to 6×6 and is not a symbolic algebra or numerical linear-algebra certification system.',
  },
  'mean-median-mode-range': {
    method: 'Mean is the sum divided by count; median is the middle ordered value; mode is the most frequent value; range is maximum minus minimum.',
    example: 'For 2, 3, 3, 8, and 10, the mean is 5.2, median is 3, mode is 3, and range is 8.',
    interpretation: 'Together these summaries show center, frequency, and spread, but no single statistic describes every distribution.',
    edge: 'Enter at least one finite number. A dataset may have no mode or several tied modes; an even-sized dataset uses the average of its two middle values.',
    limits: 'Outliers can distort the mean and range. These descriptive statistics do not establish causation, representativeness, uncertainty, or a population conclusion.',
  },
  'number-sequence': {
    method: 'Arithmetic sequences add a constant difference, geometric sequences multiply by a constant ratio, and Fibonacci mode adds the previous two terms.',
    example: 'An arithmetic sequence starting at 4 with difference 3 produces 4, 7, 10, 13, and 16.',
    interpretation: 'The calculator generates the requested finite prefix and exposes the rule used, rather than claiming that every observed dataset has one true pattern.',
    edge: 'Count must be a whole number from 1 through 100, and geometric ratios may not create non-finite values.',
    limits: 'Sequence prediction depends entirely on the selected rule. Many different formulas can fit the same first few terms, so generated terms are not a forecast by themselves.',
  },
  'permutation-combination': {
    method: 'Permutations count ordered selections: nPr = n!/(n−r)!; combinations ignore order: nCr = n!/(r!(n−r)!).',
    example: 'Selecting 2 people from 5 gives 20 ordered permutations but 10 unordered combinations.',
    interpretation: 'Choose nPr when position matters and nCr when the selected group is the outcome; both require r no greater than n.',
    edge: 'n and r must be whole numbers with 0 ≤ r ≤ n; values are limited to keep exact integer results displayable.',
    limits: 'The formulas assume distinct selectable items and no replacement. Repeated objects, replacement, restrictions, and conditional arrangements require a different model.',
  },
  probability: {
    method: 'Simple probability is favorable outcomes divided by total outcomes; complements are 1−P(A), and independent conjunctions multiply P(A) by P(B).',
    example: 'Drawing one red card from 4 red cards among 10 equally likely cards gives probability 0.4, or 40%.',
    interpretation: 'The result is a model-based proportion or chance under the stated sample-space and independence assumptions, not a promise about one trial.',
    edge: 'Probabilities must be between 0 and 1, favorable outcomes cannot exceed total outcomes, and a total outcome count must be positive.',
    limits: 'Probability depends on how outcomes are defined and whether trials are independent and equally likely. The calculator does not estimate a distribution from data or predict certainty.',
  },
};

type Spec = Omit<PhaseThreeBDefinition, 'href' | 'seoTitle' | 'seoDescription' | 'h1' | 'resultLabel' | 'workedExample' | 'interpretation' | 'edgeCases' | 'limitations' | 'educationalSections' | 'faqs'> & ContentFact;

const specs: Record<PhaseThreeBSlug, Spec> = {
  binary: { slug: 'binary', name: 'Binary Calculator', description: 'Convert integers between decimal and binary with explicit unsigned and signed two’s-complement modes.', category: 'Math', categorySlug: 'math', tags: ['binary calculator', 'binary to decimal', 'decimal to binary', 'base 2', 'two complement'], fields: [select('mode','Conversion','decimal-to-binary',[['decimal-to-binary','Decimal → binary'],['binary-to-decimal','Binary → decimal']]),text('value','Integer value','42'),select('signedness','Representation','unsigned',[['unsigned','Unsigned magnitude'],['signed','Signed two’s-complement']]),n('width','Bit width','8',1,128)], formula: 'binary place value = Σ(bit × 2ᵖᵒˢⁱᵗⁱᵒⁿ)', variables: 'The value is an integer. Signed mode uses a fixed-width two’s-complement bit pattern; unsigned mode represents a nonnegative magnitude.', sourceLinks: [{ label: 'NIST Binary Prefixes', href: 'https://www.nist.gov/pml/owm/binary-prefixes' }], relatedRoutes: ['/calculators/math/hex','/calculators/math/scientific','/calculators/math/prime-factorization'], ...facts.binary },
  circle: { slug: 'circle', name: 'Circle Calculator', description: 'Calculate a circle’s radius, diameter, circumference, and area from any one known measurement.', category: 'Math', categorySlug: 'math', tags: ['circle calculator', 'circumference calculator', 'circle area', 'diameter calculator', 'geometry'], fields: [select('known','Known measurement','radius',[['radius','Radius'],['diameter','Diameter'],['circumference','Circumference'],['area','Area']]),n('value','Measurement','5',0,1e9)], formula: 'd = 2r; C = 2πr; A = πr²', variables: 'r is radius, d is diameter, C is circumference, and A is area in the entered generic units.', sourceLinks: [{ label: 'NIST Guide to the SI', href: 'https://www.nist.gov/pml/special-publication-811' }], relatedRoutes: ['/calculators/math/area','/calculators/math/volume','/calculators/math/exponent'], ...facts.circle },
  'greatest-common-factor': { slug: 'greatest-common-factor', name: 'Greatest Common Factor / Common Factors Calculator', description: 'Find the GCF, GCD, or HCF of several integers and optionally list every factor common to them.', category: 'Math', categorySlug: 'math', tags: ['greatest common factor', 'GCF calculator', 'GCD calculator', 'HCF calculator', 'common factor calculator'], fields: [select('mode','Result','gcf',[['gcf','GCF / GCD / HCF'],['common-factors','List common factors']]),text('values','Positive whole numbers','84, 126','textarea')], formula: 'gcd(a,b) = gcd(b, a mod b)', variables: 'The comma-, space-, or line-separated inputs are positive whole numbers; GCF, GCD, and HCF are equivalent names for the same greatest divisor.', sourceLinks: [{ label: 'NIST Euclidean algorithm reference', href: 'https://dlmf.nist.gov/1.2' }], relatedRoutes: ['/calculators/math/prime-factorization','/calculators/math/least-common-multiple','/calculators/math/fraction'], ...facts['greatest-common-factor'] },
  'confidence-interval': { slug: 'confidence-interval', name: 'Confidence Interval Calculator', description: 'Estimate a normal-approximation confidence interval for a sample mean with clear assumptions and margin of error.', category: 'Math', categorySlug: 'math', tags: ['confidence interval calculator', 'margin of error', 'statistics calculator', '95 confidence interval', 'sample mean'], fields: [n('mean','Sample mean','50',-1e12,1e12),n('stddev','Sample standard deviation','10',Number.MIN_VALUE,1e12),n('sampleSize','Sample size','100',2,1e9),select('confidence','Confidence level','0.95',[['0.90','90%'],['0.95','95%'],['0.99','99%']])], formula: 'interval = x̄ ± z × (s/√n)', variables: 'x̄ is sample mean, s is sample standard deviation, n is sample size, and z is 1.645, 1.960, or 2.576 for the selected level.', sourceLinks: [{ label: 'NIST Engineering Statistics Handbook', href: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm' }], relatedRoutes: ['/calculators/math/mean-median-mode-range','/calculators/math/probability','/calculators/math/average'], ...facts['confidence-interval'] },
  exponent: { slug: 'exponent', name: 'Exponent Calculator', description: 'Calculate a base raised to an exponent with exact-looking integer output and readable scientific notation when needed.', category: 'Math', categorySlug: 'math', tags: ['exponent calculator', 'power calculator', 'indices calculator', 'exponential arithmetic'], fields: [n('base','Base','2',-1e6,1e6),n('exponent','Exponent','4',-1000,1000)], formula: 'y = bˣ', variables: 'b is the base and x is the exponent. The real-number result is evaluated with finite numeric arithmetic.', sourceLinks: [{ label: 'NIST SI prefixes and powers of ten', href: 'https://www.nist.gov/pml/owm/metric-si-prefixes' }], relatedRoutes: ['/calculators/math/log','/calculators/math/scientific','/calculators/math/number-sequence'], ...facts.exponent },
  'prime-factorization': { slug: 'prime-factorization', name: 'Prime Factorization / Factor Calculator', description: 'Find the prime factorization and positive factors of an integer with one clear multi-mode factor tool.', category: 'Math', categorySlug: 'math', tags: ['prime factorization calculator', 'factor calculator', 'prime factors', 'factors of a number', 'integer factors'], fields: [select('mode','Result','both',[['prime','Prime factorization'],['factors','List positive factors'],['both','Both results']]),text('value','Positive whole number','360')], formula: 'n = p₁ᵃ¹ × p₂ᵃ² × … × pₖᵃᵏ', variables: 'n is a positive integer up to 10¹²; p values are prime factors and a values are their multiplicities.', sourceLinks: [{ label: 'NIST Fundamental Theorem of Arithmetic context', href: 'https://www.nist.gov/pml/mathematics-statistics' }], relatedRoutes: ['/calculators/math/greatest-common-factor','/calculators/math/least-common-multiple','/calculators/math/binary'], ...facts['prime-factorization'] },
  'half-life': { slug: 'half-life', name: 'Half-Life Calculator', description: 'Calculate remaining amount after elapsed half-lives or solve backward for the time to reach a chosen amount.', category: 'Math', categorySlug: 'math', tags: ['half life calculator', 'exponential decay', 'decay calculator', 'inverse half life'], fields: [select('mode','Calculation','forward',[['forward','Remaining amount after time'],['inverse','Time to reach remaining amount']]),n('initial','Initial amount','100',Number.MIN_VALUE),n('halfLife','Half-life','10',Number.MIN_VALUE),n('timeOrAmount','Elapsed time or remaining amount','30',0,1e12)], formula: 'N(t) = N₀ × 2⁻ᵗ/ᵗ¹ᐟ²; t = t¹ᐟ² × log₂(N₀/N)', variables: 'N₀ is initial amount, N(t) is remaining amount, t is elapsed time, and t¹ᐟ² is the positive half-life.', sourceLinks: [{ label: 'NIST half-life and radioactive decay data', href: 'https://www.nist.gov/pml/radionuclide-half-life-measurements' }], relatedRoutes: ['/calculators/math/exponent','/calculators/math/log','/calculators/math/number-sequence'], ...facts['half-life'] },
  hex: { slug: 'hex', name: 'Hex Calculator', description: 'Convert integers between decimal and hexadecimal with explicit unsigned and signed fixed-width modes.', category: 'Math', categorySlug: 'math', tags: ['hex calculator', 'hexadecimal calculator', 'hex to decimal', 'decimal to hex', 'base 16'], fields: [select('mode','Conversion','decimal-to-hex',[['decimal-to-hex','Decimal → hexadecimal'],['hex-to-decimal','Hexadecimal → decimal']]),text('value','Integer value','255'),select('signedness','Representation','unsigned',[['unsigned','Unsigned magnitude'],['signed','Signed two’s-complement']]),n('width','Bit width','8',4,128)], formula: 'hex place value = Σ(digit × 16ᵖᵒˢⁱᵗⁱᵒⁿ)', variables: 'The value is an integer. Signed mode uses a fixed-width two’s-complement bit pattern whose width is a multiple of four.', sourceLinks: [{ label: 'NIST Binary Prefixes', href: 'https://www.nist.gov/pml/owm/binary-prefixes' }], relatedRoutes: ['/calculators/math/binary','/calculators/math/scientific','/calculators/printing-design/dpi-ppi'], ...facts.hex },
  'least-common-multiple': { slug: 'least-common-multiple', name: 'Least Common Multiple Calculator', description: 'Find the smallest positive multiple shared by a list of whole numbers using exact integer arithmetic.', category: 'Math', categorySlug: 'math', tags: ['least common multiple calculator', 'LCM calculator', 'common multiple', 'lowest common multiple'], fields: [text('values','Positive whole numbers','12, 18','textarea')], formula: 'lcm(a,b) = |a × b| ÷ gcd(a,b)', variables: 'The comma-, space-, or line-separated inputs are positive whole numbers; the result is the first positive integer divisible by each.', sourceLinks: [{ label: 'NIST Mathematics and Statistics', href: 'https://www.nist.gov/pml/mathematics-statistics' }], relatedRoutes: ['/calculators/math/greatest-common-factor','/calculators/math/fraction','/calculators/math/prime-factorization'], ...facts['least-common-multiple'] },
  log: { slug: 'log', name: 'Log Calculator', description: 'Calculate a real logarithm for a positive value using base 10, natural log, or a custom valid base.', category: 'Math', categorySlug: 'math', tags: ['log calculator', 'logarithm calculator', 'natural log', 'ln calculator', 'common log'], fields: [n('value','Value','1000',Number.MIN_VALUE,1e300),select('baseMode','Logarithm base','10',[['10','Base 10 (log₁₀)'],['e','Natural log (ln)'],['custom','Custom base']]),n('base','Custom base','10',Number.MIN_VALUE,1e6)], formula: 'logᵦ(x) = ln(x) ÷ ln(b)', variables: 'x must be positive; b must be positive and not one. Natural log uses Euler’s number e.', sourceLinks: [{ label: 'NIST Digital Library of Mathematical Functions', href: 'https://dlmf.nist.gov/4' }], relatedRoutes: ['/calculators/math/exponent','/calculators/math/scientific','/calculators/math/half-life'], ...facts.log },
  'long-division': { slug: 'long-division', name: 'Long Division Calculator', description: 'Divide whole integers with quotient, remainder, decimal expansion, and repeating-cycle detection.', category: 'Math', categorySlug: 'math', tags: ['long division calculator', 'quotient remainder', 'division calculator', 'repeating decimal'], fields: [text('numerator','Dividend','7'),text('denominator','Divisor','4'),n('decimalPlaces','Decimal places','20',0,1000)], formula: 'dividend = divisor × quotient + remainder', variables: 'The dividend and divisor are integers; the divisor is nonzero and the decimal expansion is generated to the requested display length.', sourceLinks: [{ label: 'NIST Mathematics and Statistics', href: 'https://www.nist.gov/pml/mathematics-statistics' }], relatedRoutes: ['/calculators/math/fraction','/calculators/math/mean-median-mode-range','/calculators/math/exponent'], ...facts['long-division'] },
  matrix: { slug: 'matrix', name: 'Matrix Calculator', description: 'Add, subtract, multiply, find determinants, or invert small matrices with dimension and singularity checks.', category: 'Math', categorySlug: 'math', tags: ['matrix calculator', 'matrix multiplication', 'matrix inverse', 'determinant calculator', 'linear algebra'], fields: [select('operation','Operation','determinant',[['add','A + B'],['subtract','A − B'],['multiply','A × B'],['determinant','determinant(A)'],['inverse','inverse(A)']]),n('rows','Matrix A rows','2',1,6),n('columns','Matrix A columns','2',1,6),n('bRows','Matrix B rows','2',1,6),n('bColumns','Matrix B columns','2',1,6),text('matrixA','Matrix A','1, 2\n3, 4','textarea'),text('matrixB','Matrix B','5, 6\n7, 8','textarea')], formula: 'det(A) uses elimination; (AB)ᵢⱼ = Σ AᵢₖBₖⱼ', variables: 'Matrix A and Matrix B each have independently selected rectangular dimensions. Multiplication requires A columns to equal B rows; addition and subtraction require equal dimensions.', sourceLinks: [{ label: 'NIST Engineering Statistics Handbook', href: 'https://www.itl.nist.gov/div898/handbook/' }], relatedRoutes: ['/calculators/math/exponent','/calculators/math/mean-median-mode-range','/calculators/math/scientific'], ...facts.matrix },
  'mean-median-mode-range': { slug: 'mean-median-mode-range', name: 'Mean, Median, Mode & Range Calculator', description: 'Calculate four descriptive statistics from a list of numbers and explain what each summary means.', category: 'Math', categorySlug: 'math', tags: ['mean median mode range calculator', 'statistics calculator', 'average median', 'mode range'], fields: [text('values','Numbers','2, 3, 3, 8, 10','textarea')], formula: 'mean = Σx ÷ n; range = max(x) − min(x)', variables: 'The dataset contains finite real numbers separated by commas, spaces, semicolons, or line breaks.', sourceLinks: [{ label: 'NIST Engineering Statistics Handbook', href: 'https://www.itl.nist.gov/div898/handbook/' }], relatedRoutes: ['/calculators/math/average','/calculators/math/confidence-interval','/calculators/math/probability'], ...facts['mean-median-mode-range'] },
  'number-sequence': { slug: 'number-sequence', name: 'Number Sequence Calculator', description: 'Generate arithmetic, geometric, or Fibonacci sequence terms from a transparent selected rule.', category: 'Math', categorySlug: 'math', tags: ['number sequence calculator', 'arithmetic sequence', 'geometric sequence', 'Fibonacci sequence'], fields: [select('mode','Sequence rule','arithmetic',[['arithmetic','Arithmetic'],['geometric','Geometric'],['fibonacci','Fibonacci']]),n('first','First term','4',-1e9,1e9),n('secondOrStep','Difference, ratio, or second term','3',-1e9,1e9),n('count','Terms to generate','6',1,100)], formula: 'arithmetic: aₙ = a₁ + (n−1)d; geometric: aₙ = a₁rⁿ⁻¹; Fibonacci: aₙ = aₙ₋₁ + aₙ₋₂', variables: 'The second input is a difference, ratio, or second starting term depending on the selected rule.', sourceLinks: [{ label: 'NIST Mathematics and Statistics', href: 'https://www.nist.gov/pml/mathematics-statistics' }], relatedRoutes: ['/calculators/math/exponent','/calculators/math/mean-median-mode-range','/calculators/math/half-life'], ...facts['number-sequence'] },
  'permutation-combination': { slug: 'permutation-combination', name: 'Permutation & Combination Calculator', description: 'Calculate nPr when order matters or nCr when it does not, using exact integer arithmetic.', category: 'Math', categorySlug: 'math', tags: ['permutation calculator', 'combination calculator', 'nPr', 'nCr', 'combinatorics'], fields: [select('mode','Counting method','npr',[['npr','Permutation nPr'],['ncr','Combination nCr']]),n('n','Total items','5',0,1000),n('r','Selected items','2',0,1000)], formula: 'nPr = n!/(n−r)!; nCr = n!/(r!(n−r)!)', variables: 'n is the total number of distinct items and r is the number selected without replacement.', sourceLinks: [{ label: 'NIST Mathematics and Statistics', href: 'https://www.nist.gov/pml/mathematics-statistics' }], relatedRoutes: ['/calculators/math/probability','/calculators/math/prime-factorization','/calculators/math/mean-median-mode-range'], ...facts['permutation-combination'] },
  probability: { slug: 'probability', name: 'Probability Calculator', description: 'Calculate simple, complementary, or independent-event probability with explicit sample-space assumptions.', category: 'Math', categorySlug: 'math', tags: ['probability calculator', 'chance calculator', 'complement probability', 'independent events', 'statistics'], fields: [select('mode','Probability model','simple',[['simple','Favorable ÷ total'],['complement','Complement of A'],['independent','Independent A and B']]),n('first','Favorable count or P(A)','4',0,1e12),n('second','Total count or P(B)','10',0,1e12)], formula: 'P(A) = favorable ÷ total; P(not A) = 1−P(A); P(A∩B) = P(A)P(B)', variables: 'Simple mode uses counts; complement and independent modes use probabilities from 0 through 1.', sourceLinks: [{ label: 'NIST Engineering Statistics Handbook', href: 'https://www.itl.nist.gov/div898/handbook/' }], relatedRoutes: ['/calculators/math/confidence-interval','/calculators/math/mean-median-mode-range','/calculators/math/permutation-combination'], ...facts.probability },
};

const seoOverrides: Partial<Record<PhaseThreeBSlug, { title?: string; description?: string }>> = {
  binary: { description: 'Convert integers between decimal and binary in unsigned or signed two’s-complement modes with selectable bit widths.' },
  circle: { description: 'Calculate circle radius, diameter, circumference, and area from any one known measurement with clear geometry formulas.' },
  'confidence-interval': { description: 'Estimate a confidence interval and margin of error for a sample mean using a normal approximation and selected confidence level.' },
  exponent: { description: 'Raise a real-number base to an exponent and view a readable finite result, including scientific notation when appropriate.' },
  'greatest-common-factor': {
    title: 'GCF & Common Factor Calculator | FigureNest',
    description: 'Find the GCF, GCD, or HCF of several positive integers and list every shared factor with FigureNest’s exact common factor calculator.',
  },
  'prime-factorization': {
    description: 'Find a positive integer’s prime factorization, list every positive factor, or show both results with exact arithmetic and clear validation.',
  },
  'half-life': { description: 'Calculate exponential decay after a given time or solve for the time needed to reach a chosen remaining amount.' },
  hex: { description: 'Convert integers between decimal and hexadecimal in unsigned or signed fixed-width modes with strict input validation.' },
  'least-common-multiple': { description: 'Find the least common multiple of two or more positive whole numbers using exact integer arithmetic.' },
  log: { description: 'Calculate a real logarithm using base 10, natural log, or a custom valid base, with clear domain validation.' },
  'long-division': { description: 'Divide whole integers to find the quotient, remainder, decimal expansion, and any repeating decimal cycle.' },
  matrix: { description: 'Add, subtract, or multiply small matrices, or calculate a determinant or inverse with dimension and singularity checks.' },
  'mean-median-mode-range': {
    description: 'Calculate mean, median, mode, and range for a number list, then review the count and limitations of each descriptive statistic.',
  },
  'permutation-combination': {
    description: 'Calculate exact nPr permutations when order matters or nCr combinations when it does not, with transparent formulas and input limits.',
  },
  'number-sequence': { description: 'Generate arithmetic, geometric, or Fibonacci sequence terms from your starting values and selected rule.' },
  probability: { description: 'Calculate simple, complementary, or independent-event probabilities with explicit sample-space assumptions.' },
};

const buildSections = (spec: Spec): PhaseThreeBDefinition['educationalSections'] => {
  const fact = facts[spec.slug];
  return [
    { heading: 'Formula or algorithm and variables', body: `${spec.formula}. ${spec.variables} ${fact.method} Start by identifying the mathematical object represented by each input rather than treating every number as interchangeable. Keep the chosen mode visible when a tool has more than one interpretation. The calculation preserves exact integer arithmetic where the model is discrete and uses controlled numeric rounding where the result is real-valued. This makes the path from the input to the displayed answer inspectable and gives you a repeatable way to check a hand calculation.` },
    { heading: 'Worked example', body: `${fact.example} Reproduce the example by writing the formula, substituting the values, and retaining units or place-value labels through each step. For a list-based tool, sort or group the values before checking the result; for a base-conversion tool, expand each digit by its place value. When the result is a large integer, compare the exact string rather than a rounded approximation. A worked example is a verification aid, not a default recommendation, and it should be replaced with the values from the problem you are actually solving.` },
    { heading: 'How to interpret the result', body: `${fact.interpretation} Read the primary result together with its supporting details and the selected mode. A mathematically correct result can still answer the wrong question if the inputs describe a different population, representation, unit, ordering rule, or sample space. Compare scenarios only when the definitions and assumptions remain the same. Use exact notation for factors, matrices, repeating decimals, and integer bases; use the displayed precision for real-number summaries and avoid implying more certainty than the inputs support.` },
    { heading: 'Validation and edge cases', body: `${fact.edge} Blank fields, malformed tokens, non-finite values, incompatible dimensions, invalid divisors, impossible probability ranges, and out-of-domain operations are rejected explicitly. Boundary values such as zero, one, a prime, a singular matrix, an empty remainder cycle, or a one-term sequence are tested according to the selected operation. If the output seems surprising, first verify the mode, the input order, the representation width, and whether a quantity was intended to be a count or a measurement.` },
    { heading: 'Limitations and responsible use', body: `${fact.limits} This page is an explanatory calculator, not a substitute for a statistical design, numerical-analysis package, software type specification, laboratory model, or professional review. Results are processed locally in the browser and no entered values are sent to a calculation service. Keep the original inputs, mode, and assumptions with any copied result. For decisions involving health, finance, safety, experiments, or production systems, verify the model with current authoritative guidance and an independent method before acting.` },
  ];
};

export const phaseThreeBDefinitions = Object.fromEntries(
  (Object.keys(specs) as PhaseThreeBSlug[]).map((slug) => {
    const spec = specs[slug];
    const fact = facts[slug];
    const href = `/calculators/math/${slug}`;
    const definition: PhaseThreeBDefinition = {
      ...spec,
      href,
      h1: spec.name,
      resultLabel: `${spec.name.toUpperCase()} RESULT`,
      seoTitle: seoOverrides[slug]?.title ?? `${spec.name} | FigureNest`,
      seoDescription: seoOverrides[slug]?.description ?? phaseThreeBMetadataSentence(spec.description, spec.formula),
      workedExample: fact.example,
      interpretation: fact.interpretation,
      edgeCases: fact.edge,
      limitations: fact.limits,
      educationalSections: buildSections(spec),
      faqs: [
        { question: `What does the ${spec.name} calculate?`, answer: spec.description },
        { question: 'Which formula or algorithm does it use?', answer: `${spec.formula}. ${spec.variables}` },
        { question: 'How should the result be interpreted?', answer: fact.interpretation },
        { question: 'What limitations or edge cases matter?', answer: `${fact.edge} ${fact.limits}` },
      ],
    };
    return [slug, definition];
  }),
) as Record<PhaseThreeBSlug, PhaseThreeBDefinition>;

export const phaseThreeBSlugs = Object.keys(phaseThreeBDefinitions) as PhaseThreeBSlug[];
export const phaseThreeBProbabilityDefaults = {
  simple: ['simple', '4', '10'],
  complement: ['complement', '0.4', '0.5'],
  independent: ['independent', '0.4', '0.5'],
} as const;
export const phaseThreeBUsefulWordCount = (definition: PhaseThreeBDefinition) => [
  definition.description, definition.formula, definition.variables, definition.workedExample,
  definition.interpretation, definition.edgeCases, definition.limitations,
  ...definition.educationalSections.map((section) => `${section.heading} ${section.body}`),
  ...definition.faqs.flatMap((faq) => [faq.question, faq.answer]),
].join(' ').trim().split(/\s+/).filter(Boolean).length;

const bad = (message: string): PhaseThreeBResult => ({ primary: message, summary: message, details: [], error: message });
const finite = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= 1e15 ? parsed : null;
};
const format = (value: number, digits = 6) => value.toLocaleString('en-US', { maximumFractionDigits: digits });
const result = (primary: string, summary: string, details: PhaseThreeBResult['details'] = []): PhaseThreeBResult => ({ primary, summary, details });
const integer = (value: string) => /^[-+]?\d+$/.test(value.trim()) ? BigInt(value.trim()) : null;
const positiveIntegerList = (value: string) => {
  const items = value.split(/[\s,;]+/).filter(Boolean).map((item) => integer(item));
  return items.length >= 2 && items.length <= 100 && items.every((item) => item !== null && item > 0n && item <= 1000000000000n) ? items as bigint[] : null;
};
const gcd = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
};
const lcm = (a: bigint, b: bigint) => (a / gcd(a, b)) * b;
const factorsOf = (value: bigint) => {
  const factors: bigint[] = [];
  for (let divisor = 1n; divisor * divisor <= value; divisor += 1n) {
    if (value % divisor !== 0n) continue;
    factors.push(divisor);
    if (divisor * divisor !== value) factors.push(value / divisor);
  }
  return factors.sort((a, b) => a < b ? -1 : 1);
};
const primeFactorsOf = (value: bigint) => {
  const factors: { prime: bigint; exponent: number }[] = [];
  let remaining = value;
  for (let divisor = 2n; divisor * divisor <= remaining; divisor = divisor === 2n ? 3n : divisor + 2n) {
    if (remaining % divisor !== 0n) continue;
    let exponent = 0;
    while (remaining % divisor === 0n) { remaining /= divisor; exponent += 1; }
    factors.push({ prime: divisor, exponent });
  }
  if (remaining > 1n) factors.push({ prime: remaining, exponent: 1 });
  return factors;
};
const formatPrimeFactors = (items: { prime: bigint; exponent: number }[]) => items.length ? items.map(({ prime, exponent }) => `${prime}${exponent > 1 ? `^${exponent}` : ''}`).join(' × ') : '1';
const formatMatrix = (matrix: number[][]) => matrix.map((row) => `[${row.map((value) => format(value)).join(', ')}]`).join('\n');
const parseMatrix = (value: string, rows: number, columns: number): number[][] | null => {
  const parsed = value.trim().split(/[;\n]+/).filter(Boolean).map((row) => row.trim().split(/[\s,]+/).filter(Boolean).map(Number));
  if (parsed.length !== rows || parsed.some((row) => row.length !== columns || row.some((cell) => !Number.isFinite(cell) || Math.abs(cell) > 1e12))) return null;
  return parsed;
};
const matrixDeterminant = (input: number[][]): number | null => {
  if (input.length !== input[0]?.length) return null;
  const matrix = input.map((row) => [...row]);
  let determinant = 1;
  for (let column = 0; column < matrix.length; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < matrix.length; row += 1) if (Math.abs(matrix[row][column]) > Math.abs(matrix[pivot][column])) pivot = row;
    if (Math.abs(matrix[pivot][column]) < 1e-12) return 0;
    if (pivot !== column) { [matrix[pivot], matrix[column]] = [matrix[column], matrix[pivot]]; determinant *= -1; }
    const pivotValue = matrix[column][column];
    determinant *= pivotValue;
    for (let row = column + 1; row < matrix.length; row += 1) {
      const ratio = matrix[row][column] / pivotValue;
      for (let cell = column + 1; cell < matrix.length; cell += 1) matrix[row][cell] -= ratio * matrix[column][cell];
    }
  }
  return determinant;
};
const matrixInverse = (input: number[][]): number[][] | null => {
  if (input.length !== input[0]?.length) return null;
  const size = input.length;
  const augmented = input.map((row, rowIndex) => [...row, ...Array.from({ length: size }, (_, column) => rowIndex === column ? 1 : 0)]);
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    if (Math.abs(augmented[pivot][column]) < 1e-12) return null;
    [augmented[pivot], augmented[column]] = [augmented[column], augmented[pivot]];
    const pivotValue = augmented[column][column];
    augmented[column] = augmented[column].map((value) => value / pivotValue);
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const ratio = augmented[row][column];
      augmented[row] = augmented[row].map((value, cell) => value - ratio * augmented[column][cell]);
    }
  }
  return augmented.map((row) => row.slice(size));
};
const parseSignedRadix = (raw: string, radix: 2 | 16, signed: boolean, width: number) => {
  const cleaned = raw.trim().replace(/^0[bB]/, '').replace(/^0[xX]/, '');
  const pattern = radix === 2 ? /^[01]+$/ : /^[0-9a-fA-F]+$/;
  if (!pattern.test(cleaned) || cleaned.length > width / (radix === 2 ? 1 : 4)) return null;
  const unsigned = BigInt(`0${radix === 2 ? 'b' : 'x'}${cleaned}`);
  if (!signed) return unsigned;
  const max = 1n << BigInt(width);
  const sign = 1n << BigInt(width - 1);
  const padded = unsigned << BigInt(width - cleaned.length * (radix === 2 ? 1 : 4));
  const normalized = padded >> BigInt(width - cleaned.length * (radix === 2 ? 1 : 4));
  return (normalized & sign) !== 0n ? normalized - max : normalized;
};
const toRadix = (value: bigint, radix: 2 | 16, signed: boolean, width: number) => {
  const max = 1n << BigInt(width);
  let normalized = value;
  if (signed) {
    const min = -(max / 2n);
    const maxSigned = max / 2n - 1n;
    if (value < min || value > maxSigned) return null;
    if (value < 0n) normalized = max + value;
  } else if (value < 0n || value >= max) return null;
  let output = normalized.toString(radix).toUpperCase();
  const digits = Math.ceil(width / (radix === 2 ? 1 : 4));
  output = output.padStart(digits, '0');
  return radix === 16 ? `0x${output}` : output;
};
const longDivision = (numerator: bigint, denominator: bigint, places: number) => {
  const negative = (numerator < 0n) !== (denominator < 0n);
  const dividend = numerator < 0n ? -numerator : numerator;
  const divisor = denominator < 0n ? -denominator : denominator;
  const whole = dividend / divisor;
  let remainder = dividend % divisor;
  let decimals = '';
  const seen = new Map<string, number>();
  let repeatAt = -1;
  while (remainder !== 0n && decimals.length < places) {
    if (seen.has(remainder.toString())) { repeatAt = seen.get(remainder.toString())!; break; }
    seen.set(remainder.toString(), decimals.length);
    remainder *= 10n;
    decimals += (remainder / divisor).toString();
    remainder %= divisor;
  }
  const prefix = negative && (whole !== 0n || decimals.length > 0) ? '-' : '';
  const decimal = decimals ? `.${decimals}${repeatAt >= 0 ? `… (repeats from digit ${repeatAt + 1})` : ''}` : '';
  return { display: `${prefix}${whole}${decimal}`, quotient: `${prefix}${whole}`, remainder: `${numerator % denominator}` };
};

export function calculatePhaseThreeB(slug: PhaseThreeBSlug, values: readonly string[]): PhaseThreeBResult {
  const definition = phaseThreeBDefinitions[slug];
  if (values.length !== definition.fields.length) return bad('Complete every field before calculating.');
  const matrixSingleInput = slug === 'matrix' && (values[0] === 'determinant' || values[0] === 'inverse');
  const requiredValues = matrixSingleInput ? [values[0], values[1], values[2], values[5]] : values;
  if (requiredValues.some((value) => !value.trim())) return bad('Complete every field before calculating.');
  const at = (index: number) => finite(values[index]);
  try {
    if (slug === 'binary' || slug === 'hex') {
      const radix = slug === 'binary' ? 2 : 16;
      const width = at(3);
      if (!Number.isInteger(width) || width! < (radix === 2 ? 1 : 4) || width! > 128 || (radix === 16 && width! % 4 !== 0)) return bad(`Use a valid ${radix === 2 ? 'bit' : 'hex'} width.`);
      const signed = values[2] === 'signed';
      if (values[0] === (radix === 2 ? 'decimal-to-binary' : 'decimal-to-hex')) {
        const decimal = integer(values[1]);
        if (decimal === null) return bad('Enter a whole decimal integer.');
        const converted = toRadix(decimal, radix, signed, width!);
        if (converted === null) return bad(`The value does not fit in ${width} ${radix === 2 ? 'bits' : 'bits'} for the selected representation.`);
        return result(converted, `${signed ? 'Signed two’s-complement' : 'Unsigned'} base-${radix} representation.`, [{ label: 'Decimal value', value: decimal.toString() }, { label: 'Width', value: `${width} bits` }]);
      }
      const parsed = parseSignedRadix(values[1], radix, signed, width!);
      if (parsed === null) return bad(`Enter valid base-${radix} digits within the selected width.`);
      return result(parsed.toString(), `${signed ? 'Signed two’s-complement' : 'Unsigned'} base-${radix} value.`, [{ label: 'Normalized input', value: values[1] }, { label: 'Width', value: `${width} bits` }]);
    }
    if (slug === 'circle') {
      const value = at(1);
      if (value === null || value < 0 || (values[0] !== 'radius' && value <= 0)) return bad('Enter a valid nonnegative circle measurement; non-radius measurements must be greater than zero.');
      const radius = values[0] === 'radius' ? value : values[0] === 'diameter' ? value / 2 : values[0] === 'circumference' ? value / (2 * Math.PI) : Math.sqrt(value / Math.PI);
      if (!Number.isFinite(radius)) return bad('That measurement is outside the supported range.');
      return result(`r = ${format(radius)}`, 'Recovered circle radius.', [{ label: 'Diameter', value: format(radius * 2) }, { label: 'Circumference', value: format(2 * Math.PI * radius) }, { label: 'Area', value: format(Math.PI * radius * radius) }]);
    }
    if (slug === 'greatest-common-factor') {
      const numbers = positiveIntegerList(values[1]);
      if (!numbers) return bad('Enter 2–100 positive whole numbers up to 1,000,000,000,000.');
      const common = numbers.reduce((current, value) => gcd(current, value));
      if (values[0] === 'gcf') return result(common.toString(), 'Greatest common factor; also called GCD or HCF.', [{ label: 'Input count', value: String(numbers.length) }]);
      const shared = factorsOf(common);
      return result(shared.join(', '), 'Positive factors shared by every entered integer.', [{ label: 'Greatest common factor', value: common.toString() }, { label: 'Common-factor count', value: String(shared.length) }]);
    }
    if (slug === 'confidence-interval') {
      const mean = at(0), stddev = at(1), sampleSize = at(2);
      if (mean === null || stddev === null || sampleSize === null || stddev <= 0 || !Number.isInteger(sampleSize) || sampleSize < 2) return bad('Use a finite mean, positive standard deviation, and sample size of at least 2.');
      const z: Record<string, number> = { '0.90': 1.6448536269, '0.95': 1.9599639845, '0.99': 2.5758293035 };
      const margin = z[values[3]] * stddev / Math.sqrt(sampleSize);
      return result(`[${format(mean - margin)}, ${format(mean + margin)}]`, `${values[3] === '0.95' ? '95' : values[3] === '0.90' ? '90' : '99'}% normal-approximation interval for the mean.`, [{ label: 'Margin of error', value: format(margin) }, { label: 'Standard error', value: format(stddev / Math.sqrt(sampleSize)) }]);
    }
    if (slug === 'exponent') {
      const base = at(0), exponent = at(1);
      if (base === null || exponent === null || (base === 0 && exponent < 0) || (base < 0 && !Number.isInteger(exponent))) return bad('Use a defined real-number power; zero cannot have a negative exponent and negative bases need whole exponents.');
      const value = Math.pow(base, exponent);
      if (!Number.isFinite(value)) return bad('The result is outside the finite numeric range.');
      return result(format(value), 'Base raised to the selected exponent.', [{ label: 'Scientific notation', value: value.toExponential(6) }]);
    }
    if (slug === 'prime-factorization') {
      const value = integer(values[1]);
      if (value === null || value < 1n || value > 1000000000000n) return bad('Enter a positive whole number from 1 through 1,000,000,000,000.');
      const prime = formatPrimeFactors(primeFactorsOf(value));
      const factors = factorsOf(value).join(', ');
      if (values[0] === 'prime') return result(prime, 'Prime factorization.', [{ label: 'Factor count', value: String(factorsOf(value).length) }]);
      if (values[0] === 'factors') return result(factors, 'Positive factors in ascending order.', [{ label: 'Factor count', value: String(factorsOf(value).length) }, { label: 'Prime factorization', value: prime }]);
      return result(prime, 'Prime factorization and positive factors.', [{ label: 'Positive factors', value: factors }, { label: 'Factor count', value: String(factorsOf(value).length) }]);
    }
    if (slug === 'half-life') {
      const initial = at(1), halfLife = at(2), timeOrAmount = at(3);
      if (initial === null || halfLife === null || timeOrAmount === null || initial <= 0 || halfLife <= 0 || timeOrAmount < 0) return bad('Initial amount and half-life must be positive; the third value cannot be negative.');
      if (values[0] === 'forward') {
        const remaining = initial * Math.pow(2, -timeOrAmount / halfLife);
        return result(format(remaining), 'Remaining amount after the entered time.', [{ label: 'Fraction remaining', value: format(remaining / initial * 100) + '%' }, { label: 'Half-lives elapsed', value: format(timeOrAmount / halfLife) }]);
      }
      if (timeOrAmount <= 0 || timeOrAmount > initial) return bad('Remaining amount must be greater than zero and no greater than the initial amount.');
      const time = halfLife * Math.log2(initial / timeOrAmount);
      return result(format(time), 'Elapsed time needed to reach the remaining amount.', [{ label: 'Fraction remaining', value: format(timeOrAmount / initial * 100) + '%' }]);
    }
    if (slug === 'least-common-multiple') {
      const numbers = positiveIntegerList(values[0]);
      if (!numbers) return bad('Enter 2–100 positive whole numbers up to 1,000,000,000,000.');
      const answer = numbers.reduce((current, value) => lcm(current, value));
      if (answer > 1000000000000000000000000000000000000n) return bad('The exact LCM is outside the supported display range.');
      return result(answer.toString(), 'Least common multiple.', [{ label: 'Input count', value: String(numbers.length) }]);
    }
    if (slug === 'log') {
      const value = at(0);
      const base = values[1] === '10' ? 10 : values[1] === 'e' ? Math.E : at(2);
      if (value === null || base === null || value <= 0 || base <= 0 || base === 1) return bad('Use a positive value and a positive logarithm base other than one.');
      const answer = Math.log(value) / Math.log(base);
      if (!Number.isFinite(answer)) return bad('The logarithm is outside the finite numeric range.');
      return result(format(answer), `Logarithm base ${values[1] === 'e' ? 'e' : format(base)}.`, [{ label: 'Inverse check', value: format(Math.pow(base, answer)) }]);
    }
    if (slug === 'long-division') {
      const numerator = integer(values[0]), denominator = integer(values[1]), places = at(2);
      if (numerator === null || denominator === null || denominator === 0n || places === null || !Number.isInteger(places) || places < 0 || places > 1000) return bad('Enter whole integers, a nonzero divisor, and 0–1,000 decimal places.');
      const divided = longDivision(numerator, denominator, places);
      return result(divided.display, 'Integer quotient, remainder, and bounded decimal expansion.', [{ label: 'Integer quotient', value: divided.quotient }, { label: 'Remainder', value: divided.remainder }]);
    }
    if (slug === 'matrix') {
      const rows = at(1), columns = at(2);
      if ([rows, columns].some((dimension) => dimension === null || !Number.isInteger(dimension) || dimension! < 1 || dimension! > 6)) return bad('Matrix A dimensions must be whole numbers from 1 through 6.');
      const matrixA = parseMatrix(values[5], rows!, columns!);
      if (!matrixA) return bad('Enter Matrix A with exactly its selected rows and columns.');
      if (values[0] === 'determinant' || values[0] === 'inverse') {
        if (rows !== columns) return bad('Determinants and inverses require a square matrix.');
        if (values[0] === 'determinant') {
          const determinant = matrixDeterminant(matrixA)!;
          return result(format(determinant), 'Determinant of Matrix A.', [{ label: 'Dimensions', value: `${rows} × ${columns}` }]);
        }
        const inverse = matrixInverse(matrixA);
        if (!inverse) return bad('Matrix A is singular and has no inverse.');
        return result(formatMatrix(inverse), 'Inverse of Matrix A.', [{ label: 'Dimensions', value: `${rows} × ${columns}` }]);
      }
      const bRows = at(3), bColumns = at(4);
      if ([bRows, bColumns].some((dimension) => dimension === null || !Number.isInteger(dimension) || dimension! < 1 || dimension! > 6)) return bad('Matrix B dimensions must be whole numbers from 1 through 6.');
      const matrixB = parseMatrix(values[6], bRows!, bColumns!);
      if (!matrixB) return bad('Enter Matrix B with exactly its selected rows and columns.');
      if (values[0] === 'add' || values[0] === 'subtract') {
        if (rows !== bRows || columns !== bColumns) return bad('Matrix addition and subtraction require equal dimensions.');
        const output = matrixA.map((row, rowIndex) => row.map((cell, columnIndex) => values[0] === 'add' ? cell + matrixB[rowIndex][columnIndex] : cell - matrixB[rowIndex][columnIndex]));
        return result(formatMatrix(output), values[0] === 'add' ? 'Element-by-element matrix sum.' : 'Element-by-element matrix difference.');
      }
      if (columns !== bRows) return bad('Matrix multiplication requires Matrix A columns to equal Matrix B rows.');
      const output = matrixA.map((row) => matrixB[0].map((_, columnIndex) => row.reduce((sum, cell, inner) => sum + cell * matrixB[inner][columnIndex], 0)));
      return result(formatMatrix(output), 'Matrix product from row-by-column dot products.', [{ label: 'Output dimensions', value: `${rows} × ${bColumns}` }]);
    }
    if (slug === 'mean-median-mode-range') {
      const valuesList = values[0].split(/[\s,;]+/).filter(Boolean).map(Number);
      if (!valuesList.length || valuesList.length > 10000 || valuesList.some((value) => !Number.isFinite(value))) return bad('Enter 1–10,000 finite numbers.');
      const sorted = [...valuesList].sort((a, b) => a - b);
      const counts = new Map<number, number>();
      valuesList.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
      const highest = Math.max(...counts.values());
      const modes = highest > 1 ? [...counts.entries()].filter(([, count]) => count === highest).map(([value]) => format(value)).join(', ') : 'No mode';
      const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
      return result(format(valuesList.reduce((sum, value) => sum + value, 0) / valuesList.length), 'Mean of the entered dataset.', [{ label: 'Median', value: format(median) }, { label: 'Mode', value: modes }, { label: 'Range', value: format(sorted.at(-1)! - sorted[0]) }, { label: 'Count', value: String(valuesList.length) }]);
    }
    if (slug === 'number-sequence') {
      const first = at(1), secondOrStep = at(2), count = at(3);
      if (first === null || secondOrStep === null || count === null || !Number.isInteger(count) || count < 1 || count > 100) return bad('Use finite sequence inputs and a whole-number count from 1 through 100.');
      const sequence: number[] = [first];
      for (let index = 1; index < count; index += 1) {
        const next = values[0] === 'arithmetic' ? sequence[index - 1] + secondOrStep : values[0] === 'geometric' ? sequence[index - 1] * secondOrStep : index === 1 ? secondOrStep : sequence[index - 1] + sequence[index - 2];
        if (!Number.isFinite(next)) return bad('The generated sequence leaves the finite numeric range.');
        sequence.push(next);
      }
      return result(sequence.map((value) => format(value)).join(', '), `${values[0][0].toUpperCase()}${values[0].slice(1)} sequence.`);
    }
    if (slug === 'permutation-combination') {
      const nValue = at(1), rValue = at(2);
      if (nValue === null || rValue === null || !Number.isInteger(nValue) || !Number.isInteger(rValue) || nValue < 0 || rValue < 0 || rValue > nValue || nValue > 1000) return bad('Use whole numbers with 0 ≤ r ≤ n and n no greater than 1,000.');
      let answer = 1n;
      if (values[0] === 'npr') for (let i = 0; i < rValue; i += 1) answer *= BigInt(nValue - i);
      else {
        const k = Math.min(rValue, nValue - rValue);
        for (let i = 1; i <= k; i += 1) answer = (answer * BigInt(nValue - k + i)) / BigInt(i);
      }
      return result(answer.toString(), values[0] === 'npr' ? 'Exact ordered-selection count (nPr).' : 'Exact unordered-selection count (nCr).', [{ label: 'n', value: String(nValue) }, { label: 'r', value: String(rValue) }]);
    }
    if (slug === 'probability') {
      const first = at(1), second = at(2);
      if (first === null || second === null) return bad('Use finite numeric probability inputs.');
      let probability: number;
      if (values[0] === 'simple') {
        if (first < 0 || second <= 0 || first > second) return bad('Favorable outcomes must be nonnegative, total outcomes must be positive, and favorable cannot exceed total.');
        probability = first / second;
      } else if (values[0] === 'complement') {
        if (first < 0 || first > 1) return bad('P(A) must be between 0 and 1.');
        probability = 1 - first;
      } else {
        if (first < 0 || first > 1 || second < 0 || second > 1) return bad('Independent-event probabilities must each be between 0 and 1.');
        probability = first * second;
      }
      return result(`${format(probability * 100, 4)}%`, 'Probability under the selected model.', [{ label: 'Decimal probability', value: format(probability, 8) }, { label: 'Odds against', value: probability === 1 ? '0' : `${format((1 - probability) / probability, 4)} to 1` }]);
    }
  } catch (error) {
    return bad(error instanceof Error ? error.message : 'The entered values could not be processed.');
  }
  return bad('This calculation is unavailable.');
}