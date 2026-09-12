import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'artifacts/calcstride/src');
const pagesDir = path.join(src, 'pages');
const appPath = path.join(src, 'App.tsx');
const catalogPath = path.join(src, 'lib/catalog.ts');

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
