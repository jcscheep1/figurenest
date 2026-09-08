export type PhaseThreeCSlug =
  | 'bac'
  | 'body-surface-area'
  | 'bmi'
  | 'gfr'
  | 'ideal-weight'
  | 'lean-body-mass'
  | 'macro'
  | 'molecular-weight'
  | 'pregnancy-conception'
  | 'target-heart-rate'
  | 'tdee';

export type PhaseThreeCField = {
  key: string;
  label: string;
  value: string;
  type: 'number' | 'select' | 'text' | 'date';
  min?: number;
  max?: number;
  step?: string;
  options?: readonly { value: string; label: string }[];
};

export type PhaseThreeCResult = {
  primary: string;
  summary: string;
  details: readonly { label: string; value: string }[];
  error?: string;
};

export type PhaseThreeCDefinition = {
  slug: PhaseThreeCSlug;
  name: string;
  description: string;
  category: 'Health' | 'Science & Engineering';
  categorySlug: 'health' | 'science-engineering';
  href: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  tags: readonly string[];
  fields: readonly PhaseThreeCField[];
  resultLabel: string;
  formula: string;
  variables: string;
  safetyNotice: string;
  limitations: string;
  educationalSections: readonly { heading: string; body: string }[];
  faqs: readonly { question: string; answer: string }[];
  sourceLinks: readonly { label: string; href: string }[];
  relatedRoutes: readonly string[];
};

const n = (key: string, label: string, value: string, min: number, max: number, step = 'any'): PhaseThreeCField => ({
  key, label, value, type: 'number', min, max, step,
});
const select = (key: string, label: string, value: string, options: readonly [string, string][]): PhaseThreeCField => ({
  key, label, value, type: 'select', options: options.map(([optionValue, optionLabel]) => ({ value: optionValue, label: optionLabel })),
});
const text = (key: string, label: string, value: string, type: 'text' | 'date' = 'text'): PhaseThreeCField => ({
  key, label, value, type,
});

type Spec = {
  slug: PhaseThreeCSlug;
  name: string;
  description: string;
  category: PhaseThreeCDefinition['category'];
  categorySlug: PhaseThreeCDefinition['categorySlug'];
  tags: readonly string[];
  fields: readonly PhaseThreeCField[];
  formula: string;
  variables: string;
  safetyNotice: string;
  limitations: string;
  workedExample: string;
  interpretation: string;
  validation: string;
  sourceLinks: PhaseThreeCDefinition['sourceLinks'];
  relatedRoutes: readonly string[];
  seoTitle?: string;
  seoDescription?: string;
};

const sources = {
  cdcBmi: { label: 'CDC Adult BMI Categories', href: 'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html' },
  cdcAlcohol: { label: 'CDC Impaired Driving', href: 'https://www.cdc.gov/impaired-driving/about/index.html' },
  nhtsaBac: { label: 'NHTSA — The ABCs of BAC', href: 'https://www.nhtsa.gov/sites/nhtsa.gov/files/809844-theabcsofbac.pdf' },
  ahaHeart: { label: 'American Heart Association Target Heart Rates', href: 'https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates' },
  kidneyEquation: { label: 'National Kidney Foundation 2021 CKD-EPI Equation', href: 'https://www.kidney.org/ckd-epi-creatinine-equation-2021' },
  niddkGfr: { label: 'NIDDK eGFR Equations for Adults', href: 'https://www.niddk.nih.gov/research-funding/research-programs/kidney-clinical-research-epidemiology/laboratory/glomerular-filtration-rate-equations/adults' },
  womensHealth: { label: 'Office on Women’s Health Ovulation Calculator', href: 'https://womenshealth.gov/ovulation-calculator' },
  acogCycle: { label: 'ACOG — The Menstrual Cycle', href: 'https://www.acog.org/womens-health/infographics/the-menstrual-cycle' },
  dietaryGuidelines: { label: 'Dietary Guidelines for Americans', href: 'https://www.dietaryguidelines.gov/' },
  driMacros: { label: 'National Academies Macronutrient Distribution Ranges', href: 'https://www.ncbi.nlm.nih.gov/books/NBK610333/' },
  pubmedMosteller: { label: 'PubMed — Simplified Body-Surface Area Calculation', href: 'https://pubmed.ncbi.nlm.nih.gov/3657876/' },
  pubmedMifflin: { label: 'PubMed — Mifflin–St Jeor Resting Energy Equation', href: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
  iupacMass: { label: 'IUPAC Gold Book — Relative Molecular Mass', href: 'https://goldbook.iupac.org/terms/view/R05271' },
  nistWeights: { label: 'NIST Atomic Weights and Isotopic Compositions', href: 'https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl' },
} as const;

const specs: Record<PhaseThreeCSlug, Spec> = {
  bac: {
    slug: 'bac',
    name: 'BAC Estimate Calculator',
    description: 'Estimate blood alcohol concentration with a transparent Widmark-style model and uncompromising driving-safety guidance.',
    category: 'Health',
    categorySlug: 'health',
    tags: ['BAC calculator', 'blood alcohol concentration', 'alcohol estimate', 'standard drinks', 'Widmark equation'],
    fields: [
      n('weight', 'Body weight (kg)', '80', 30, 300),
      n('drinks', 'US standard drinks (14 g alcohol each)', '2', 0, 30),
      n('hours', 'Hours since drinking began', '2', 0, 48),
      select('factor', 'Widmark body-water factor', '0.68', [['0.68', '0.68 — higher average factor'], ['0.55', '0.55 — lower average factor']]),
    ],
    formula: 'estimated BAC (%) = (alcohol grams ÷ (weight grams × r)) × 100 − 0.015 × hours',
    variables: 'One US standard drink is modeled as 14 grams of pure alcohol. r is a population-average distribution factor, not a measurement of an individual.',
    safetyNotice: 'Never use this estimate to decide whether to drive. Any alcohol can impair driving, legal limits vary, and an individual BAC can be higher than this estimate.',
    limitations: 'Food, drink size, drinking speed, medicines, health, metabolism, biological variation, and measurement timing can materially change BAC. Only a validated breath or blood test measures BAC.',
    workedExample: 'For an 80 kg person, two modeled standard drinks contain 28 g alcohol. With r = 0.68, the starting estimate is about 0.051%; subtracting two hours at 0.015 percentage points per hour gives about 0.021%.',
    interpretation: 'The result is a rough population-model estimate in percent g/dL. It is not a clearance time, legal opinion, impairment test, or assurance of safe driving.',
    validation: 'Weight must be 30–300 kg, drinks 0–30, elapsed time 0–48 hours, and the selected distribution factor must be supported. Negative estimates are displayed as zero.',
    sourceLinks: [sources.cdcAlcohol, sources.nhtsaBac],
    relatedRoutes: ['/calculators/health/calorie', '/calculators/health/bmi', '/calculators/health/tdee'],
  },
  'body-surface-area': {
    slug: 'body-surface-area',
    name: 'Body Surface Area Calculator',
    description: 'Estimate body surface area from height and weight using the Mosteller equation, with clinical-use limitations stated clearly.',
    category: 'Health',
    categorySlug: 'health',
    tags: ['body surface area calculator', 'BSA calculator', 'Mosteller formula', 'square meters'],
    fields: [n('weight', 'Weight (kg)', '70', 1, 300), n('height', 'Height (cm)', '175', 30, 250)],
    formula: 'BSA (m²) = √((height cm × weight kg) ÷ 3600)',
    variables: 'Height is entered in centimetres and weight in kilograms. The output is square metres.',
    safetyNotice: 'This is an educational estimate. Do not calculate medication doses or treatment decisions without a clinician or pharmacist.',
    limitations: 'Body surface area formulas approximate body size and can differ at extremes of age, body composition, or size. Clinical protocols may specify another equation or a measured value.',
    workedExample: 'At 175 cm and 70 kg, the Mosteller calculation is √((175 × 70) ÷ 3600), which is approximately 1.84 m².',
    interpretation: 'BSA is a size-normalization estimate used in some clinical and physiological contexts. A larger or smaller value is not itself a health rating.',
    validation: 'The calculator accepts weight from 1–300 kg and height from 30–250 cm, rejects blanks and nonfinite values, and reports the result to two decimal places.',
    sourceLinks: [sources.pubmedMosteller],
    relatedRoutes: ['/calculators/health/bmi', '/calculators/health/lean-body-mass', '/converters/weight'],
  },
  bmi: {
    slug: 'bmi',
    name: 'Adult BMI & Reference Weight Range Calculator',
    description: 'Calculate adult BMI and a height-based BMI reference range while keeping screening limitations and respectful language visible.',
    category: 'Health',
    categorySlug: 'health',
    tags: ['BMI calculator', 'healthy weight calculator', 'overweight calculator', 'adult weight range', 'body mass index'],
    fields: [n('weight', 'Weight (kg)', '70', 20, 400), n('height', 'Height (cm)', '175', 100, 250), n('age', 'Age (years)', '30', 20, 120, '1')],
    formula: 'BMI = weight kg ÷ height metres²; reference weight = BMI boundary × height metres²',
    variables: 'The category labels and 18.5 to less than 25 reference interval are the CDC adult screening ranges for people age 20 and older.',
    safetyNotice: 'BMI is a screening measure, not a diagnosis or a judgment about a person. It does not directly measure body fat, health, fitness, or worth.',
    limitations: 'The adult categories are not for pregnancy and are not the appropriate child or teen growth-chart method. Muscularity, age, ethnicity, disability, and body composition can change interpretation.',
    workedExample: 'A person who is 70 kg and 1.75 m tall has BMI 70 ÷ 1.75² = 22.9. At that height, the adult 18.5–24.9 reference interval corresponds to approximately 56.7–76.3 kg.',
    interpretation: 'The category and reference interval are population screening context. They are not a prescribed target, and a clinician may prioritize other measurements and health history.',
    validation: 'This page is restricted to ages 20–120, height 100–250 cm, and weight 20–400 kg. Pregnancy is excluded by the visible guidance rather than inferred from personal data.',
    sourceLinks: [sources.cdcBmi],
    relatedRoutes: ['/calculators/health/ideal-weight', '/calculators/health/lean-body-mass', '/calculators/health/tdee'],
    seoTitle: 'Adult BMI & Reference Weight Calculator | FigureNest',
  },
  gfr: {
    slug: 'gfr',
    name: 'eGFR Calculator',
    description: 'Estimate adult kidney filtration with the race-free 2021 CKD-EPI creatinine equation and explicit clinical limitations.',
    category: 'Health',
    categorySlug: 'health',
    tags: ['GFR calculator', 'eGFR calculator', 'kidney function estimate', 'CKD-EPI 2021', 'creatinine'],
    fields: [
      n('creatinine', 'Serum creatinine (mg/dL)', '1.0', 0.1, 20),
      n('age', 'Age (years)', '50', 18, 120, '1'),
      select('sex', '2021 equation sex parameter', 'female', [['female', 'Female coefficient set'], ['male', 'Male coefficient set']]),
    ],
    formula: 'eGFR = 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1.200 × 0.9938^Age × 1.012 if female',
    variables: 'For the 2021 race-free creatinine equation, κ is 0.7 and α −0.241 for the female coefficient set; κ is 0.9 and α −0.302 for the male set.',
    safetyNotice: 'An eGFR estimate is not a kidney-disease diagnosis. A clinician interprets trends, urine testing, symptoms, medicines, acute illness, and other evidence.',
    limitations: 'This exact equation is for adults 18 and older using standardized serum creatinine. Creatinine can be less reliable with unusual muscle mass, amputation, malnutrition, rapidly changing kidney function, pregnancy, or some medicines.',
    workedExample: 'For age 50, serum creatinine 1.0 mg/dL, and the female coefficient set, the 2021 CKD-EPI equation produces an estimate near 69 mL/min/1.73 m².',
    interpretation: 'The result is an estimate normalized to 1.73 m² body surface area. One result does not establish chronic kidney disease, which requires clinical context and persistence or other evidence.',
    validation: 'Age must be 18–120 and serum creatinine 0.1–20 mg/dL. The equation version and coefficient set remain visible with the result.',
    sourceLinks: [sources.kidneyEquation, sources.niddkGfr],
    relatedRoutes: ['/calculators/health/body-surface-area', '/calculators/health/bmi', '/calculators/health/lean-body-mass'],
  },
  'ideal-weight': {
    slug: 'ideal-weight',
    name: 'Height-Based Weight Formula Calculator',
    description: 'Compare four historical height-based weight formulas without presenting any single result as a required or ideal body weight.',
    category: 'Health',
    categorySlug: 'health',
    tags: ['ideal weight calculator', 'healthy weight estimate', 'Devine formula', 'Hamwi formula', 'height based weight'],
    fields: [n('height', 'Height (cm)', '175', 152.4, 250), select('sex', 'Formula coefficient set', 'female', [['female', 'Female equation set'], ['male', 'Male equation set']])],
    formula: 'formula estimate = base weight at 5 ft + coefficient × inches above 5 ft',
    variables: 'Devine, Robinson, Miller, and Hamwi use different historical base weights and per-inch coefficients. They are shown side by side rather than merged into a prescription.',
    safetyNotice: 'These historical formulas do not define a healthy goal and should not be used to justify extreme restriction or rapid weight change.',
    limitations: 'The formulas were not designed for every body, are restricted here to heights at least 5 feet, and do not account for body composition, disability, pregnancy, age-related change, or individual health.',
    workedExample: 'At 175 cm, approximately 8.9 inches above 5 feet, the female coefficient sets produce different estimates in the mid-60 kg range. The spread demonstrates that there is no single formula-defined ideal.',
    interpretation: 'Read the four values as historical formula comparisons only. A suitable weight discussion should consider health, strength, nutrition, symptoms, medicines, and personal circumstances.',
    validation: 'Height must be 152.4–250 cm. The calculator rejects shorter inputs because extending the formulas below their stated 5-foot baseline would produce misleading extrapolation.',
    sourceLinks: [sources.cdcBmi],
    relatedRoutes: ['/calculators/health/bmi', '/calculators/health/lean-body-mass', '/calculators/health/tdee'],
    seoTitle: 'Height-Based Weight Formula Calculator | FigureNest',
  },
  'lean-body-mass': {
    slug: 'lean-body-mass',
    name: 'Lean Body Mass Calculator',
    description: 'Estimate adult lean body mass with the Boer equation and show the implied percentage without treating it as a measured composition test.',
    category: 'Health',
    categorySlug: 'health',
    tags: ['lean body mass calculator', 'LBM calculator', 'Boer equation', 'fat free mass estimate'],
    fields: [n('weight', 'Weight (kg)', '70', 30, 300), n('height', 'Height (cm)', '175', 120, 230), select('sex', 'Boer equation coefficient set', 'female', [['female', 'Female equation set'], ['male', 'Male equation set']])],
    formula: 'Boer: male set LBM = 0.407W + 0.267H − 19.2; female set LBM = 0.252W + 0.473H − 48.3',
    variables: 'W is weight in kilograms and H is height in centimetres. The sex parameter selects the published equation coefficients.',
    safetyNotice: 'This equation estimates lean mass; it does not measure body fat or diagnose nutrition, fitness, or health.',
    limitations: 'Population equations can be inaccurate for athletes, older adults, adolescents, pregnancy, edema, amputation, unusual body composition, or people outside the development population.',
    workedExample: 'For a 70 kg, 175 cm adult using the female coefficient set, the Boer equation estimates 52.1 kg lean body mass, about 74.5% of total weight.',
    interpretation: 'Lean body mass includes water, organs, bone, and muscle. It is not synonymous with muscle mass, and small changes in an estimate may reflect input or formula variation rather than real tissue change.',
    validation: 'Weight must be 30–300 kg and height 120–230 cm. Nonfinite values and estimates outside zero to total body weight are rejected.',
    sourceLinks: [sources.cdcBmi],
    relatedRoutes: ['/calculators/health/body-surface-area', '/calculators/health/bmi', '/calculators/health/macro'],
  },
  macro: {
    slug: 'macro',
    name: 'Macronutrient, Carbohydrate & Protein Calculator',
    description: 'Convert a daily calorie estimate into carbohydrate, protein, and fat grams while showing adult reference ranges and pregnancy exclusions.',
    category: 'Health',
    categorySlug: 'health',
    tags: ['macro calculator', 'carbohydrate intake calculator', 'protein intake calculator', 'macronutrient calculator', 'carbs protein fat'],
    fields: [
      n('calories', 'Daily energy estimate (kcal)', '2000', 1000, 6000),
      n('weight', 'Body weight (kg)', '70', 30, 300),
      n('carbs', 'Carbohydrate share (%)', '50', 0, 100),
      n('protein', 'Protein share (%)', '20', 0, 100),
      n('fat', 'Fat share (%)', '30', 0, 100),
      select('pregnancy', 'Pregnant or breastfeeding?', 'no', [['no', 'No'], ['yes', 'Yes — use professional guidance']]),
    ],
    formula: 'carbohydrate g = kcal × share ÷ 4; protein g = kcal × share ÷ 4; fat g = kcal × share ÷ 9',
    variables: 'Carbohydrate and protein provide 4 kcal per gram and fat 9 kcal per gram in this planning model. Shares must total exactly 100%.',
    safetyNotice: 'This is meal-planning arithmetic, not a diet prescription. Do not use it for extreme restriction, an eating disorder, pregnancy, breastfeeding, kidney disease, diabetes treatment, or pediatric nutrition.',
    limitations: 'Energy needs and nutrient needs vary with age, health, activity, culture, food access, medicines, training, and clinical goals. Percent ranges do not guarantee nutritional adequacy or food quality.',
    workedExample: 'At 2,000 kcal with a 50% carbohydrate, 20% protein, and 30% fat split, the calculation gives 250 g carbohydrate, 100 g protein, and about 66.7 g fat.',
    interpretation: 'The gram results translate a chosen calorie split. The page also shows broad adult distribution ranges and a 0.8 g/kg protein reference for comparison, not as an individualized target.',
    validation: 'Calories must be 1,000–6,000, weight 30–300 kg, percentages 0–100 and total 100%. Pregnancy or breastfeeding selection stops the generic calculation.',
    sourceLinks: [sources.driMacros, sources.dietaryGuidelines],
    relatedRoutes: ['/calculators/health/tdee', '/calculators/health/calorie', '/calculators/health/lean-body-mass'],
    seoTitle: 'Macro, Carbohydrate & Protein Calculator | FigureNest',
  },
  'molecular-weight': {
    slug: 'molecular-weight',
    name: 'Molecular Weight Calculator',
    description: 'Calculate relative molecular mass and molar mass from a chemical formula, including nested parentheses and common element symbols.',
    category: 'Science & Engineering',
    categorySlug: 'science-engineering',
    tags: ['molecular weight calculator', 'molar mass calculator', 'chemical formula mass', 'chemistry calculator'],
    fields: [text('formula', 'Chemical formula', 'H2O')],
    formula: 'relative molecular mass = Σ(atomic weight × atom count)',
    variables: 'Element symbols are case-sensitive. Parenthetical groups and whole-number subscripts are expanded before atomic weights are summed.',
    safetyNotice: 'This chemistry calculation identifies formula mass only. It does not verify a substance identity, purity, concentration, reaction, or laboratory safety.',
    limitations: 'Displayed standard atomic weights are conventional rounded values and isotopic composition can change an exact mass. Hydrates separated by dots, charges, isotopes, and structural formulas are outside this parser.',
    workedExample: 'H₂O contains two hydrogen atoms and one oxygen atom: 2 × 1.008 + 15.999 = 18.015. The relative molecular mass is 18.015 and the corresponding molar mass is approximately 18.015 g/mol.',
    interpretation: 'Relative molecular mass is dimensionless; the numerically corresponding molar mass is shown in g/mol for a mole of entities with the entered formula.',
    validation: 'The formula must use supported element symbols, balanced parentheses, positive whole-number subscripts, and no unsupported charge, hydrate, or punctuation notation.',
    sourceLinks: [sources.iupacMass, sources.nistWeights],
    relatedRoutes: ['/calculators/science-engineering/molarity', '/calculators/science-engineering/mass', '/calculators/science-engineering/density'],
  },
  'pregnancy-conception': {
    slug: 'pregnancy-conception',
    name: 'Ovulation, Period & Conception Date Estimator',
    description: 'Estimate a next period, ovulation day, fertile window, and likely conception timing from a regular-cycle assumption.',
    category: 'Health',
    categorySlug: 'health',
    tags: ['conception calculator', 'ovulation calculator', 'period calculator', 'fertile window', 'menstrual cycle estimate'],
    fields: [text('lastPeriod', 'First day of last period', '2026-08-01', 'date'), n('cycleLength', 'Average cycle length (days)', '28', 21, 45, '1'), n('periodLength', 'Typical period length (days)', '5', 1, 10, '1')],
    formula: 'next period = LMP + cycle length; ovulation ≈ next period − 14 days; fertile window ≈ ovulation − 5 through ovulation + 1',
    variables: 'LMP is the first day of the last menstrual period. The arithmetic assumes a sufficiently regular cycle and uses calendar-day estimates.',
    safetyNotice: 'These dates are uncertain and must not be used as contraception. Ovulation can shift even in usually regular cycles, and pregnancy dating requires clinical context.',
    limitations: 'Irregular cycles, recent pregnancy, breastfeeding, adolescence, perimenopause, illness, stress, travel, medicines, and hormonal contraception can make calendar estimates unreliable.',
    workedExample: 'With an LMP of August 1 and a 28-day cycle, the next period is estimated for August 29, ovulation near August 15, and the fertile window approximately August 10–16.',
    interpretation: 'The dates are planning estimates, not confirmation that ovulation or conception occurred. Pregnancy tests, symptoms, and clinical dating follow their own timing and evidence.',
    validation: 'Cycle length must be 21–45 days, period length 1–10 days, and the date must be valid. The period length is displayed for planning but does not change the ovulation estimate.',
    sourceLinks: [sources.womensHealth, sources.acogCycle],
    relatedRoutes: ['/calculators/health/due-date', '/calculators/health/pregnancy', '/calculators/health/pregnancy-weight-gain'],
    seoTitle: 'Ovulation, Period & Conception Estimator | FigureNest',
  },
  'target-heart-rate': {
    slug: 'target-heart-rate',
    name: 'Target Heart Rate Calculator',
    description: 'Estimate age-based moderate and vigorous exercise heart-rate zones using the American Heart Association’s simple method.',
    category: 'Health',
    categorySlug: 'health',
    tags: ['target heart rate calculator', 'exercise heart rate zone', 'maximum heart rate', 'cardio zone'],
    fields: [n('age', 'Age (years)', '40', 18, 100, '1')],
    formula: 'estimated maximum heart rate = 220 − age; moderate = 50–70%; vigorous = 70–85%',
    variables: 'Age is in whole years and rates are beats per minute. Zone endpoints are rounded to whole beats per minute.',
    safetyNotice: 'Stop exercise and seek appropriate care for chest pain, faintness, severe breathlessness, or other concerning symptoms. A medical condition or medicine can change a suitable heart rate.',
    limitations: 'The 220-minus-age method is a broad average, not a measured maximum. Fitness, temperature, illness, medicines, pregnancy, disability, and individual response can alter safe intensity.',
    workedExample: 'At age 40, estimated maximum heart rate is 180 bpm. The moderate range is about 90–126 bpm and the vigorous range about 126–153 bpm.',
    interpretation: 'Zones are general exercise-intensity guides. Talk-test effort, symptoms, clinician guidance, and a measured exercise plan can be more appropriate than a formula.',
    validation: 'Age must be a whole number from 18–100. The tool does not accept a resting rate because it implements the cited simple AHA percentage method rather than the Karvonen formula.',
    sourceLinks: [sources.ahaHeart],
    relatedRoutes: ['/calculators/health/calories-burned', '/calculators/health/pace', '/calculators/health/tdee'],
  },
  tdee: {
    slug: 'tdee',
    name: 'TDEE Calculator',
    description: 'Estimate adult resting energy with Mifflin–St Jeor and multiply it by a clearly labeled activity factor.',
    category: 'Health',
    categorySlug: 'health',
    tags: ['TDEE calculator', 'total daily energy expenditure', 'maintenance calories', 'Mifflin St Jeor', 'calorie needs'],
    fields: [
      n('weight', 'Weight (kg)', '70', 30, 300),
      n('height', 'Height (cm)', '175', 120, 230),
      n('age', 'Age (years)', '30', 18, 100, '1'),
      select('sex', 'Mifflin–St Jeor coefficient set', 'female', [['female', 'Female equation set'], ['male', 'Male equation set']]),
      select('activity', 'Activity multiplier', '1.375', [['1.2', 'Mostly sedentary — 1.2'], ['1.375', 'Light activity — 1.375'], ['1.55', 'Moderate activity — 1.55'], ['1.725', 'High activity — 1.725'], ['1.9', 'Very high activity — 1.9']]),
      select('pregnancy', 'Pregnant or breastfeeding?', 'no', [['no', 'No'], ['yes', 'Yes — use professional guidance']]),
    ],
    formula: 'RMR = 10W + 6.25H − 5A + s; TDEE = RMR × activity factor',
    variables: 'W is kg, H is cm, A is age, and s is +5 for the male coefficient set or −161 for the female coefficient set.',
    safetyNotice: 'TDEE is not a calorie prescription. Do not use it to support extreme restriction, rapid weight loss, an eating disorder, or nutrition decisions during pregnancy or breastfeeding.',
    limitations: 'Activity multipliers are rough categories and actual energy expenditure varies with body composition, occupation, training, illness, temperature, growth, recovery, and adaptive changes.',
    workedExample: 'For a 30-year-old, 70 kg, 175 cm adult using the female coefficient set, RMR is about 1,483 kcal/day. With light activity factor 1.375, TDEE is about 2,039 kcal/day.',
    interpretation: 'The result is an estimated average maintenance-energy starting point, not a guaranteed intake. Body trends and professional guidance are more informative than day-to-day scale changes.',
    validation: 'Age is restricted to 18–100, height 120–230 cm, weight 30–300 kg, and only published activity factors are accepted. Pregnancy or breastfeeding stops the generic estimate.',
    sourceLinks: [sources.pubmedMifflin, sources.dietaryGuidelines],
    relatedRoutes: ['/calculators/health/macro', '/calculators/health/calorie', '/calculators/health/calories-burned'],
  },
};

const buildSections = (spec: Spec): PhaseThreeCDefinition['educationalSections'] => [
  {
    heading: 'Equation, units, and population',
    body: `${spec.formula}. ${spec.variables} This page names the equation rather than presenting an unexplained score. Check that every value uses the displayed unit and that you belong to the population for which the method is described. The calculation retains full precision internally and rounds only the visible result. A reproducible estimate should let another reader use the same inputs and reach the same arithmetic answer, while still recognizing that mathematical reproducibility does not prove medical suitability.`,
  },
  {
    heading: 'Worked example',
    body: `${spec.workedExample} Work through the example by writing the equation, substituting each labeled input, and preserving units at every step. The example demonstrates arithmetic only; it is not a recommended body measurement, intake, exercise level, laboratory value, or date. Replace every example input with the values from the situation being considered, and retain those inputs with any result you copy. Small differences can arise from rounding, equation versions, atomic-weight conventions, or date boundaries.`,
  },
  {
    heading: 'Interpreting the estimate',
    body: `${spec.interpretation} Health calculations compress complex biology into a few inputs, so the result should be read as context rather than a verdict. Do not compare two people as though the higher or lower number is automatically better. Look for changes over time only when the method, units, and conditions are consistent. If a result conflicts with symptoms, a laboratory report, a clinician’s instructions, or a validated measurement, rely on the appropriate professional evidence rather than this calculator.`,
  },
  {
    heading: 'Validation and edge cases',
    body: `${spec.validation} Blank, malformed, nonfinite, and out-of-domain inputs fail explicitly without producing NaN or infinity. The bounds prevent obviously implausible values from being mistaken for meaningful answers, but passing a range check does not make an input medically correct. Recheck dates, decimal separators, unit conversions, coefficient choices, and whether a laboratory value uses the expected assay and unit. Contact a qualified professional when a result could affect treatment, medication, pregnancy care, nutrition therapy, or exercise safety.`,
  },
  {
    heading: 'Limitations and responsible use',
    body: `${spec.limitations} ${spec.safetyNotice} FigureNest processes these inputs locally in the browser and does not send them to a calculation service. The page does not create a medical record, assess symptoms, or know personal history. Avoid using estimates to shame a body, pursue unsafe restriction, delay care, determine legal fitness, or replace contraception. Authoritative source links are provided so readers can check the equation version and current guidance before making a consequential decision.`,
  },
];

export const phaseThreeCDefinitions = Object.fromEntries(
  (Object.keys(specs) as PhaseThreeCSlug[]).map((slug) => {
    const spec = specs[slug];
    const href = slug === 'molecular-weight'
      ? '/calculators/science-engineering/molecular-weight'
      : `/calculators/health/${slug}`;
    const definition: PhaseThreeCDefinition = {
      ...spec,
      href,
      h1: spec.name,
      seoTitle: spec.seoTitle ?? `${spec.name} | FigureNest`,
      seoDescription: spec.seoDescription ?? (slug === 'bac'
        ? 'Estimate blood alcohol concentration with a transparent Widmark-style model, strict driving warnings, individual-variability limits, and cited sources.'
        : slug === 'gfr'
        ? 'Estimate adult kidney filtration with the race-free 2021 CKD-EPI creatinine equation, exact units, strict validation, and clinical limitations.'
        : slug === 'pregnancy-conception'
        ? 'Estimate a next period, ovulation day, fertile window, and conception timing from a regular-cycle assumption, with uncertainty and contraception warnings.'
        : slug === 'tdee'
        ? 'Estimate adult resting energy and total daily energy expenditure with Mifflin–St Jeor, activity multipliers, exclusions, and clear limitations.'
        : spec.description),
      resultLabel: `${spec.name.toUpperCase()} RESULT`,
      educationalSections: buildSections(spec),
      faqs: [
        { question: `What does the ${spec.name} estimate?`, answer: spec.description },
        { question: 'Which equation and units does it use?', answer: `${spec.formula}. ${spec.variables}` },
        { question: 'Is this medical advice or a diagnosis?', answer: `No. ${spec.safetyNotice}` },
        { question: `Which limitations matter most for the ${spec.name}?`, answer: `The limits follow from the scope of ${spec.formula}; the limitations section explains the relevant population, measurements, and intended use.` },
      ],
    };
    return [slug, definition];
  }),
) as Record<PhaseThreeCSlug, PhaseThreeCDefinition>;

export const phaseThreeCSlugs = Object.keys(phaseThreeCDefinitions) as PhaseThreeCSlug[];
export const phaseThreeCNewSlugs = phaseThreeCSlugs.filter((slug) => !['bmi', 'pregnancy-conception'].includes(slug)) as PhaseThreeCSlug[];
export const phaseThreeCExpandedSlugs = ['bmi', 'pregnancy-conception'] as const;
export const phaseThreeCUsefulWordCount = (definition: PhaseThreeCDefinition) => [
  definition.description, definition.formula, definition.variables, definition.safetyNotice, definition.limitations,
  ...definition.educationalSections.map((section) => `${section.heading} ${section.body}`),
  ...definition.faqs.flatMap((faq) => [faq.question, faq.answer]),
].join(' ').trim().split(/\s+/).filter(Boolean).length;

const error = (message: string): PhaseThreeCResult => ({ primary: message, summary: message, details: [], error: message });
const result = (primary: string, summary: string, details: PhaseThreeCResult['details'] = []): PhaseThreeCResult => ({ primary, summary, details });
const valueAt = (values: readonly string[], index: number) => {
  const parsed = Number(values[index]);
  return Number.isFinite(parsed) ? parsed : null;
};
const format = (value: number, digits = 2) => value.toLocaleString('en-US', { maximumFractionDigits: digits });
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`));
const addDays = (value: string, days: number) => {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const atomicWeights: Readonly<Record<string, number>> = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.180,
  Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078,
  Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
  Ga: 69.723, Ge: 72.630, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.95, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71,
  Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24,
  Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05, Lu: 174.97,
  Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59, Tl: 204.38,
  Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.04, Pa: 231.04, U: 238.03,
};

const molecularMass = (formula: string): number | null => {
  let index = 0;
  const parseCount = () => {
    const start = index;
    while (/\d/.test(formula[index] ?? '')) index += 1;
    if (start === index) return 1;
    const count = Number(formula.slice(start, index));
    return Number.isInteger(count) && count > 0 && count <= 100000 ? count : NaN;
  };
  const parseGroup = (closing = false): number | null => {
    let total = 0;
    let found = false;
    while (index < formula.length) {
      if (formula[index] === ')') {
        if (!closing || !found) return null;
        index += 1;
        return total;
      }
      if (formula[index] === '(') {
        index += 1;
        const group = parseGroup(true);
        if (group === null) return null;
        const count = parseCount();
        if (!Number.isFinite(count)) return null;
        total += group * count;
        found = true;
        continue;
      }
      const match = formula.slice(index).match(/^([A-Z][a-z]?)/);
      if (!match) return null;
      const weight = atomicWeights[match[1]];
      if (!weight) return null;
      index += match[1].length;
      const count = parseCount();
      if (!Number.isFinite(count)) return null;
      total += weight * count;
      found = true;
    }
    return closing ? null : found ? total : null;
  };
  if (!/^[A-Za-z0-9()]+$/.test(formula) || formula.length > 120) return null;
  const mass = parseGroup();
  return index === formula.length && mass !== null && Number.isFinite(mass) ? mass : null;
};

export function calculatePhaseThreeC(slug: PhaseThreeCSlug, values: readonly string[]): PhaseThreeCResult {
  const definition = phaseThreeCDefinitions[slug];
  if (values.length !== definition.fields.length || values.some((value) => !value.trim())) return error('Complete every field before calculating.');
  const at = (index: number) => valueAt(values, index);

  if (slug === 'bac') {
    const weight = at(0), drinks = at(1), hours = at(2), factor = at(3);
    if (weight === null || drinks === null || hours === null || factor === null || weight < 30 || weight > 300 || drinks < 0 || drinks > 30 || hours < 0 || hours > 48 || ![0.68, 0.55].includes(factor)) return error('Use supported body weight, drink, time, and distribution-factor values.');
    const starting = (drinks * 14 / (weight * 1000 * factor)) * 100;
    const bac = Math.max(0, starting - 0.015 * hours);
    return result(`${bac.toFixed(3)}%`, 'Rough Widmark-style BAC estimate; never use it to decide whether to drive.', [
      { label: 'Modeled pure alcohol', value: `${format(drinks * 14)} g` },
      { label: 'Estimate before time adjustment', value: `${starting.toFixed(3)}%` },
      { label: 'Safety', value: 'Do not drive after drinking' },
    ]);
  }
  if (slug === 'body-surface-area') {
    const weight = at(0), height = at(1);
    if (weight === null || height === null || weight < 1 || weight > 300 || height < 30 || height > 250) return error('Use weight from 1–300 kg and height from 30–250 cm.');
    const bsa = Math.sqrt(height * weight / 3600);
    return result(`${bsa.toFixed(2)} m²`, 'Mosteller body surface area estimate.', [{ label: 'Unrounded estimate', value: `${bsa.toFixed(4)} m²` }]);
  }
  if (slug === 'bmi') {
    const weight = at(0), height = at(1), age = at(2);
    if (weight === null || height === null || age === null || weight < 20 || weight > 400 || height < 100 || height > 250 || !Number.isInteger(age) || age < 20 || age > 120) return error('This adult calculator requires age 20–120, weight 20–400 kg, and height 100–250 cm.');
    const metres = height / 100;
    const bmi = weight / metres ** 2;
    const category = bmi < 18.5 ? 'Below adult reference range' : bmi < 25 ? 'Within adult reference range' : bmi < 30 ? 'Above adult reference range' : 'Well above adult reference range';
    return result(bmi.toFixed(1), 'Adult BMI screening estimate; not a diagnosis or measure of personal worth.', [
      { label: 'Screening category', value: category },
      { label: '18.5–24.9 reference weight at this height', value: `${format(18.5 * metres ** 2, 1)}–${format(24.9 * metres ** 2, 1)} kg` },
      { label: 'Population', value: 'Adults age 20+; not pregnancy' },
    ]);
  }
  if (slug === 'gfr') {
    const creatinine = at(0), age = at(1);
    if (creatinine === null || age === null || creatinine < 0.1 || creatinine > 20 || !Number.isInteger(age) || age < 18 || age > 120 || !['female', 'male'].includes(values[2])) return error('Use age 18–120, creatinine 0.1–20 mg/dL, and a supported equation coefficient set.');
    const female = values[2] === 'female';
    const kappa = female ? 0.7 : 0.9;
    const alpha = female ? -0.241 : -0.302;
    const ratio = creatinine / kappa;
    const egfr = 142 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.2) * Math.pow(0.9938, age) * (female ? 1.012 : 1);
    return result(`${Math.round(egfr)} mL/min/1.73 m²`, '2021 race-free CKD-EPI creatinine estimate; not a diagnosis.', [
      { label: 'Equation version', value: '2021 CKD-EPI creatinine' },
      { label: 'Coefficient set', value: female ? 'Female' : 'Male' },
      { label: 'Clinical reminder', value: 'Interpret with trends and other evidence' },
    ]);
  }
  if (slug === 'ideal-weight') {
    const height = at(0);
    if (height === null || height < 152.4 || height > 250 || !['female', 'male'].includes(values[1])) return error('These formula comparisons require height from 152.4–250 cm and a supported coefficient set.');
    const inchesOver = height / 2.54 - 60;
    const male = values[1] === 'male';
    const estimates = {
      Devine: (male ? 50 : 45.5) + 2.3 * inchesOver,
      Robinson: (male ? 52 : 49) + (male ? 1.9 : 1.7) * inchesOver,
      Miller: (male ? 56.2 : 53.1) + (male ? 1.41 : 1.36) * inchesOver,
      Hamwi: (male ? 48 : 45.5) + (male ? 2.7 : 2.2) * inchesOver,
    };
    const valuesList = Object.values(estimates);
    return result(`${format(Math.min(...valuesList), 1)}–${format(Math.max(...valuesList), 1)} kg`, 'Range across four historical height-based formulas; not a prescribed goal.', Object.entries(estimates).map(([label, value]) => ({ label, value: `${format(value, 1)} kg` })));
  }
  if (slug === 'lean-body-mass') {
    const weight = at(0), height = at(1);
    if (weight === null || height === null || weight < 30 || weight > 300 || height < 120 || height > 230 || !['female', 'male'].includes(values[2])) return error('Use supported adult height, weight, and Boer coefficient values.');
    const lbm = values[2] === 'male' ? 0.407 * weight + 0.267 * height - 19.2 : 0.252 * weight + 0.473 * height - 48.3;
    if (lbm <= 0 || lbm > weight) return error('The Boer estimate is outside a meaningful range for these inputs.');
    return result(`${format(lbm, 1)} kg`, 'Boer lean body mass estimate; not a measured body-composition result.', [
      { label: 'Estimated share of body weight', value: `${format(lbm / weight * 100, 1)}%` },
      { label: 'Coefficient set', value: values[2] === 'male' ? 'Male' : 'Female' },
    ]);
  }
  if (slug === 'macro') {
    const calories = at(0), weight = at(1), carbs = at(2), protein = at(3), fat = at(4);
    if (values[5] === 'yes') return error('Generic macro estimates are not appropriate during pregnancy or breastfeeding; use individualized professional guidance.');
    if ([calories, weight, carbs, protein, fat].some((item) => item === null) || calories! < 1000 || calories! > 6000 || weight! < 30 || weight! > 300 || [carbs!, protein!, fat!].some((item) => item < 0 || item > 100) || Math.abs(carbs! + protein! + fat! - 100) > 0.001) return error('Use supported calories and weight, and make carbohydrate, protein, and fat percentages total exactly 100%.');
    const carbGrams = calories! * carbs! / 100 / 4;
    const proteinGrams = calories! * protein! / 100 / 4;
    const fatGrams = calories! * fat! / 100 / 9;
    return result(`${format(carbGrams, 1)} g carbohydrate`, 'Chosen calorie split translated into daily macronutrient grams.', [
      { label: 'Protein', value: `${format(proteinGrams, 1)} g` },
      { label: 'Fat', value: `${format(fatGrams, 1)} g` },
      { label: '0.8 g/kg protein reference', value: `${format(weight! * 0.8, 1)} g` },
      { label: 'Adult distribution references', value: 'Carb 45–65%; protein 10–35%; fat 20–35%' },
    ]);
  }
  if (slug === 'molecular-weight') {
    const formula = values[0].trim();
    const mass = molecularMass(formula);
    if (mass === null) return error('Enter a supported chemical formula with valid element symbols, whole-number subscripts, and balanced parentheses.');
    return result(`${format(mass, 4)} g/mol`, 'Approximate molar mass from conventional standard atomic weights.', [
      { label: 'Relative molecular mass', value: format(mass, 4) },
      { label: 'Formula', value: formula },
    ]);
  }
  if (slug === 'pregnancy-conception') {
    const cycleLength = at(1), periodLength = at(2);
    if (!validDate(values[0]) || cycleLength === null || periodLength === null || !Number.isInteger(cycleLength) || cycleLength < 21 || cycleLength > 45 || !Number.isInteger(periodLength) || periodLength < 1 || periodLength > 10) return error('Use a valid last-period date, cycle length of 21–45 days, and period length of 1–10 days.');
    const nextPeriod = addDays(values[0], cycleLength);
    const ovulation = addDays(nextPeriod, -14);
    return result(nextPeriod, 'Estimated next period date under a regular-cycle assumption.', [
      { label: 'Estimated ovulation', value: ovulation },
      { label: 'Estimated fertile window', value: `${addDays(ovulation, -5)} to ${addDays(ovulation, 1)}` },
      { label: 'Likely conception timing if pregnancy occurs', value: `Near ${ovulation}` },
      { label: 'Contraception warning', value: 'Do not use these dates as birth control' },
    ]);
  }
  if (slug === 'target-heart-rate') {
    const age = at(0);
    if (age === null || !Number.isInteger(age) || age < 18 || age > 100) return error('Use a whole-number age from 18–100.');
    const maximum = 220 - age;
    return result(`${Math.round(maximum * 0.5)}–${Math.round(maximum * 0.7)} bpm`, 'Estimated moderate-intensity heart-rate zone.', [
      { label: 'Vigorous-intensity estimate', value: `${Math.round(maximum * 0.7)}–${Math.round(maximum * 0.85)} bpm` },
      { label: 'Estimated maximum', value: `${maximum} bpm` },
    ]);
  }
  if (slug === 'tdee') {
    const weight = at(0), height = at(1), age = at(2), activity = at(4);
    if (values[5] === 'yes') return error('Generic TDEE estimates are not appropriate during pregnancy or breastfeeding; use individualized professional guidance.');
    if (weight === null || height === null || age === null || activity === null || weight < 30 || weight > 300 || height < 120 || height > 230 || !Number.isInteger(age) || age < 18 || age > 100 || !['female', 'male'].includes(values[3]) || ![1.2, 1.375, 1.55, 1.725, 1.9].includes(activity)) return error('Use supported adult measurements, age, coefficient set, and activity factor.');
    const rmr = 10 * weight + 6.25 * height - 5 * age + (values[3] === 'male' ? 5 : -161);
    const tdee = rmr * activity;
    return result(`${Math.round(tdee).toLocaleString('en-US')} kcal/day`, 'Estimated total daily energy expenditure; not a calorie prescription.', [
      { label: 'Estimated resting energy', value: `${Math.round(rmr).toLocaleString('en-US')} kcal/day` },
      { label: 'Activity multiplier', value: String(activity) },
      { label: 'Planning range ±10%', value: `${Math.round(tdee * 0.9).toLocaleString('en-US')}–${Math.round(tdee * 1.1).toLocaleString('en-US')} kcal/day` },
    ]);
  }
  return error('This calculation is unavailable.');
}