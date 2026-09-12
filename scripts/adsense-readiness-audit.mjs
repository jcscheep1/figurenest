import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'artifacts/calcstride/src');
const pagesDir = path.join(src, 'pages');
const appPath = path.join(src, 'App.tsx');
const catalogPath = path.join(src, 'lib/catalog.ts');
const categoryContentPath = path.join(src, 'lib/category-content.ts');
const appPagesPath = path.join(pagesDir, 'AppPages.tsx');
const phaseThreeAPagePath = path.join(pagesDir, 'PhaseThreeACalculatorPage.tsx');
const phaseThreeBPagePath = path.join(pagesDir, 'PhaseThreeBCalculatorPage.tsx');
const phaseThreeCPagePath = path.join(pagesDir, 'PhaseThreeCCalculatorPage.tsx');
const phaseFourPagePath = path.join(pagesDir, 'PhaseFourCalculatorPage.tsx');
const legacyPhaseTwoPagePath = path.join(pagesDir, 'LegacyPhaseTwoCalculatorPage.tsx');

const read = (file) => fs.readFileSync(file, 'utf8');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

const failures = [];
const warnings = [];
const pass = (label) => console.log(`PASS  ${label}`);
const fail = (label) => { failures.push(label); console.error(`FAIL  ${label}`); };
const warn = (label) => { warnings.push(label); console.warn(`WARN  ${label}`); };

const app = read(appPath);
const catalog = read(catalogPath);
const categoryContent = read(categoryContentPath);
const appPages = read(appPagesPath);
const phaseThreeAPage = read(phaseThreeAPagePath);
const phaseThreeBPage = read(phaseThreeBPagePath);
const phaseThreeCPage = read(phaseThreeCPagePath);
const phaseFourPage = read(phaseFourPagePath);
const legacyPhaseTwoPage = read(legacyPhaseTwoPagePath);
const pageFiles = walk(pagesDir).filter((file) => /\.(tsx|ts)$/.test(file));
const pageText = pageFiles.map((file) => ({ file, text: read(file) }));

for (const route of ['/about', '/privacy', '/terms', '/disclaimer', '/cookies', '/calculators']) {
  app.includes(`path=\"${route}\"`) ? pass(`public trust/directory route ${route}`) : fail(`missing public trust/directory route ${route}`);
}

for (const marker of ['canonical', 'publishedTools', 'categoryDefinitions']) {
  catalog.includes(marker) ? pass(`catalog contains ${marker} contract`) : fail(`catalog missing ${marker} contract`);
}

const placeholderPattern = /\b(lorem ipsum|coming soon|placeholder content|todo:|fixme:)\b/i;
for (const { file, text } of pageText) {
  if (placeholderPattern.test(text)) fail(`placeholder marker in ${path.relative(root, file)}`);
}

const fileToolPages = pageText.filter(({ text }) => text.includes('/file-tools/'));
if (!fileToolPages.length) fail('no File Tool page sources found');
for (const { file, text } of fileToolPages) {
  if (!text.includes('file-tool-page')) fail(`File Tool missing .file-tool-page wrapper: ${path.relative(root, file)}`);
}
if (fileToolPages.length) pass(`${fileToolPages.length} File Tool source files use the shared page wrapper contract`);

const publicToolCalls = [...catalog.matchAll(/\btool\('([^']+)'/g)].map((m) => m[1]);
if (publicToolCalls.length < 25) fail(`unexpectedly small direct public-tool baseline: ${publicToolCalls.length}`);
else pass(`catalog exposes a substantial direct-tool baseline (${publicToolCalls.length} direct tool declarations before expansion families)`);

const categoryKeys = [...categoryContent.matchAll(/^\s{2}(?:'([^']+)'|([a-z][\w-]*)):\s*\{/gm)]
  .map((match) => match[1] ?? match[2])
  .filter(Boolean);
const expectedCategorySections = ['introduction:', 'questionsAnswered:', 'toolDescriptions:', 'choosingTools:', 'unitCurrencyGuidance:', 'relatedGuides:', 'faqs:'];
if (categoryKeys.length < 10) fail(`category-content baseline unexpectedly small: ${categoryKeys.length} categories`);
else pass(`category-content data exists for ${categoryKeys.length} categories`);
for (const section of expectedCategorySections) {
  const count = categoryContent.split(section).length - 1;
  if (count < categoryKeys.length) fail(`category-content section ${section.replace(':', '')} only appears ${count}/${categoryKeys.length} times`);
  else pass(`category-content section ${section.replace(':', '')} covers all detected categories`);
}
const faqQuestionCount = (categoryContent.match(/question:\s*'/g) ?? []).length;
if (faqQuestionCount < categoryKeys.length * 3) fail(`category FAQ baseline too small: ${faqQuestionCount} questions for ${categoryKeys.length} categories`);
else pass(`category FAQ corpus is substantial (${faqQuestionCount} questions)`);

if (!appPages.includes('categoryContent[category.slug')) fail('CategoryPage no longer consumes category-content data');
else pass('CategoryPage is connected to the category-content source of truth');
const categoryRenderMarkers = [
  'content.questionsAnswered.map',
  'content.choosingTools.map',
  'content.unitCurrencyGuidance.map',
  'content.relatedGuides.map',
  'content.faqs.map',
  'category-tool-guide-grid',
  'category-trust-links',
];
const missingCategoryRenderMarkers = categoryRenderMarkers.filter((marker) => !appPages.includes(marker));
if (missingCategoryRenderMarkers.length) fail(`CategoryPage does not render the complete category-quality corpus: ${missingCategoryRenderMarkers.join(', ')}`);
else pass('CategoryPage renders questions, choosing guidance, unit/currency guidance, tool guidance, related guides, FAQs and trust links');

const familyQualityMarkers = [
  'definition.workedExample',
  'definition.interpretation',
  'definition.edgeCases',
  'definition.limitations',
  'definition.faqs.map',
  'definition.relatedRoutes',
];
for (const [label, source] of [
  ['Phase Three A', phaseThreeAPage],
  ['Phase Three B', phaseThreeBPage],
]) {
  const missing = familyQualityMarkers.filter((marker) => !source.includes(marker));
  if (missing.length) fail(`${label} calculator pages no longer render the full quality corpus: ${missing.join(', ')}`);
  else pass(`${label} calculator family renders worked examples, interpretation, edge cases, limitations, FAQs and related-tool links`);
}

const educationalFamilyMarkers = [
  'definition.formula',
  'definition.variables',
  'definition.educationalSections.map',
  'definition.limitations',
  'definition.faqs.map',
  'definition.relatedRoutes',
];
for (const [label, source] of [
  ['Phase Three C', phaseThreeCPage],
  ['Phase Four', phaseFourPage],
  ['Legacy Phase Two', legacyPhaseTwoPage],
]) {
  const missing = educationalFamilyMarkers.filter((marker) => !source.includes(marker));
  if (missing.length) fail(`${label} calculator pages no longer render methodology/guidance/limitations/FAQ/internal-link coverage: ${missing.join(', ')}`);
  else pass(`${label} calculator family renders methodology, substantial guidance, limitations, FAQs and related-tool links`);
}

const qualitySignals = [
  ['FAQ content', /\bFAQ|Common .* questions/i],
  ['methodology/formula content', /\bmethod|formula|how .* works|calculation/i],
  ['limitations/context content', /\blimitations?|important context|assumptions?/i],
  ['related/internal-link content', /related|\/calculators\//i],
];
for (const [label, pattern] of qualitySignals) {
  const count = pageText.filter(({ text }) => pattern.test(text)).length;
  if (count < 10) warn(`${label} appears in only ${count} page source files; expand coverage during remediation`);
  else pass(`${label} present across ${count} page source files`);
}

const thinCandidates = pageText
  .filter(({ text }) => text.includes('<Seo') && text.replace(/\s+/g, ' ').length < 1800)
  .map(({ file }) => path.relative(root, file));
if (thinCandidates.length) warn(`${thinCandidates.length} SEO-bearing source files are structurally short and require manual rendered-content review: ${thinCandidates.slice(0, 12).join(', ')}${thinCandidates.length > 12 ? ', …' : ''}`);
else pass('no structurally short SEO-bearing source files found');

console.log(`\nAdSense readiness baseline: ${failures.length} failure(s), ${warnings.length} warning(s).`);
console.log('This gate is a baseline detector, not permission to resubmit AdSense. A full rendered desktop/mobile audit must pass first.');

if (failures.length) process.exit(1);
