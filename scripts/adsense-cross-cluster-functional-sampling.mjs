import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const [mode, widthText, heightText, portText, baseUrl = 'http://127.0.0.1:4177'] = process.argv.slice(2);
const width = Number(widthText);
const height = Number(heightText);
const port = Number(portText);
if (!['desktop', 'mobile'].includes(mode) || !width || !height || !port) {
  throw new Error('Usage: node scripts/adsense-cross-cluster-functional-sampling.mjs <desktop|mobile> <width> <height> <debug-port> [base-url]');
}

const chromeCandidates = [process.env.CHROME_BIN, 'google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'].filter(Boolean);
let chromeBin = '';
for (const candidate of chromeCandidates) {
  const probe = spawnSync('which', [candidate], { encoding: 'utf8' });
  if (probe.status === 0 && probe.stdout.trim()) { chromeBin = probe.stdout.trim(); break; }
}
if (!chromeBin) throw new Error('Chrome/Chromium is unavailable');

const requireFromApp = createRequire(new URL('../artifacts/calcstride/package.json', import.meta.url));
const { PDFDocument } = requireFromApp('pdf-lib');
const fixturePath = join(tmpdir(), `figurenest-adsense-${mode}-${process.pid}.pdf`);
const fixture = await PDFDocument.create();
fixture.addPage([612, 792]);
writeFileSync(fixturePath, await fixture.save());

const chrome = spawn(chromeBin, [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  `--window-size=${width},${height}`,
  `--remote-debugging-port=${port}`,
  `--user-data-dir=/tmp/figurenest-adsense-cross-cluster-${mode}`,
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
let diagnostics = '';
chrome.stderr.on('data', (chunk) => { diagnostics += String(chunk); });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connect() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
      const target = targets.find((candidate) => candidate.type === 'page');
      if (target?.webSocketDebuggerUrl) return new WebSocket(target.webSocketDebuggerUrl);
    } catch {}
    await sleep(250);
  }
  throw new Error(`Chrome DevTools did not start. ${diagnostics}`);
}

const routes = [
  ['health-bmr', '/calculators/health/bmr/'],
  ['electrical-ohms-law', '/calculators/electrical/ohms-law/'],
  ['pdf-sign-edit', '/file-tools/pdf-sign-edit/'],
];

let socket;
try {
  socket = await connect();
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let sequence = 0;
  const pending = new Map();
  const runtimeErrors = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params?.exceptionDetails?.text ?? 'runtime exception');
    if (!message.id || !pending.has(message.id)) return;
    const handlers = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) handlers.reject(new Error(message.error.message));
    else handlers.resolve(message.result);
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression, awaitPromise = false) => {
    const result = await command('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Browser evaluation failed');
    return result.result?.value;
  };
  const waitFor = async (expression, label) => {
    const deadline = Date.now() + 45_000;
    while (Date.now() < deadline) {
      try { if (await evaluate(expression, true)) return; } catch {}
      await sleep(150);
    }
    const state = await evaluate(`({ href: location.href, title: document.title, h1: document.querySelector('main h1')?.textContent || '' })`).catch(() => ({}));
    throw new Error(`Timed out waiting for ${label}: ${JSON.stringify(state)}`);
  };

  await command('Page.enable');
  await command('Runtime.enable');
  await command('DOM.enable');
  await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: mode === 'mobile' });
  await command('Emulation.setTouchEmulationEnabled', { enabled: mode === 'mobile', maxTouchPoints: mode === 'mobile' ? 5 : 1 });

  const results = [];
  for (const [name, route] of routes) {
    runtimeErrors.length = 0;
    await command('Page.navigate', { url: new URL(route, baseUrl).href });
    await waitFor(`document.readyState === 'complete'
      && location.pathname.replace(/\\/$/, '') === ${JSON.stringify(route.replace(/\/$/, ''))}
      && document.querySelector('main h1')
      && Object.keys(document.getElementById('root') || {}).some((key) => key.startsWith('__reactContainer'))`, `${name} hydrated render`);

    const general = await evaluate(`(() => {
      const route = ${JSON.stringify(route)};
      const h1 = document.querySelector('main h1');
      const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
      const description = document.querySelector('meta[name="description"]')?.content || '';
      const main = document.querySelector('main');
      const failures = [];
      const viewportWidth = document.documentElement.clientWidth || innerWidth;
      const scrollbarWidth = innerWidth - viewportWidth;
      if (innerWidth !== ${width} || scrollbarWidth < 0 || scrollbarWidth > 20) failures.push('viewport width mismatch ' + viewportWidth + '/' + innerWidth);
      if (document.documentElement.scrollWidth > innerWidth + 1) failures.push('horizontal overflow ' + document.documentElement.scrollWidth);
      if (document.querySelectorAll('main').length !== 1) failures.push('main landmark count');
      if (document.querySelectorAll('main h1').length !== 1) failures.push('H1 count');
      if (!document.title || description.length < 90) failures.push('metadata');
      const normalize = (path) => path === '/' ? path : path.replace(/\\/$/, '');
      if (!canonical.startsWith('https://figurenest.com') || normalize(new URL(canonical).pathname) !== normalize(route)) failures.push('canonical ' + canonical);
      if (!h1 || h1.getBoundingClientRect().width <= 0 || h1.getBoundingClientRect().height <= 0) failures.push('H1 not visible');
      if ((main?.innerText.trim().split(/\\s+/).length || 0) < 250) failures.push('insufficient visible guidance');
      if (/\\b(coming soon|lorem ipsum|placeholder)\\b/i.test(main?.innerText || '')) failures.push('placeholder language');
      if (!document.querySelector('script[type="application/ld+json"]')) failures.push('JSON-LD');
      if (failures.length) throw new Error(failures.join(', '));
      return { route, h1: h1.textContent.trim(), words: main.innerText.trim().split(/\\s+/).length, viewport: viewportWidth + 'x' + innerHeight };
    })()`);

    let interaction;
    if (name === 'health-bmr' || name === 'electrical-ohms-law') {
      interaction = await evaluate(`(async () => {
        const main = document.querySelector('main');
        const inputs = [...main.querySelectorAll('input[type="number"]')].filter((input) => !input.disabled);
        if (!inputs.length) throw new Error('numeric calculator inputs missing');
        const input = inputs[0];
        const before = main.innerText;
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        const current = Number(input.value);
        setter.call(input, String(Number.isFinite(current) ? current + 1 : 2));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 180));
        if (main.innerText === before) throw new Error('calculator did not react to valid numeric input');
        const reset = [...main.querySelectorAll('button')].find((button) => /reset/i.test(button.textContent || ''));
        if (!reset) throw new Error('reset control missing');
        reset.focus();
        if (document.activeElement !== reset) throw new Error('reset is not keyboard focusable');
        return 'numeric input/result reaction and keyboard-focusable reset';
      })()`, true);
    } else {
      const idlePicker = await evaluate(`(() => {
        const page = document.querySelector('.file-tool-page');
        const input = page?.querySelector('input[type="file"]');
        if (!page || !input) throw new Error('File Tool wrapper/native file input missing');
        const parse = (value) => {
          const match = String(value || '').match(/rgba?\\((\\d+)[, ]+(\\d+)[, ]+(\\d+)/i);
          return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
        };
        const rgb = parse(getComputedStyle(input, '::file-selector-button').backgroundColor);
        if (!rgb || !(rgb[2] >= rgb[0] + 25 && rgb[2] >= rgb[1] + 10)) throw new Error('native file-picker button is not visibly blue');
        if (${mode === 'mobile'} && input.getBoundingClientRect().height < 44) throw new Error('mobile native file picker below 44px');
        return true;
      })()`);
      if (!idlePicker) throw new Error('idle file-picker check failed');

      const documentNode = await command('DOM.getDocument', { depth: -1, pierce: true });
      const fileInput = await command('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: '.file-tool-page input[type="file"]' });
      if (!fileInput.nodeId) throw new Error('PDF input node unavailable to browser QA');
      await command('DOM.setFileInputFiles', { nodeId: fileInput.nodeId, files: [fixturePath] });
      await waitFor(`document.querySelector('.pdf-editor-shell') && document.querySelector('.pdf-export-bar')`, 'PDF Sign & Edit ready state');

      interaction = await evaluate(`(() => {
        const page = document.querySelector('.file-tool-page');
        const parse = (value) => {
          const match = String(value || '').match(/rgba?\\((\\d+)[, ]+(\\d+)[, ]+(\\d+)/i);
          return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
        };
        const isBlue = (rgb) => rgb && rgb[2] >= rgb[0] + 25 && rgb[2] >= rgb[1] + 10;
        const isGrey = (rgb) => rgb && Math.max(...rgb) - Math.min(...rgb) <= 42;
        const isRed = (rgb) => rgb && rgb[0] >= rgb[1] + 35 && rgb[0] >= rgb[2] + 35;
        const labelFor = (button) => ((button.textContent || '') + ' ' + (button.getAttribute('aria-label') || '') + ' ' + (button.title || '')).trim();
        const normalPattern = /download|choose another|add text|add initials|add date|add check|add highlight|undo edit|redo edit|rotate|move earlier|move later|undo page|redo page/i;
        const destructivePattern = /delete item|delete page/i;
        const actions = [...page.querySelectorAll('button')].filter((button) => normalPattern.test(labelFor(button)) || destructivePattern.test(labelFor(button)));
        if (!actions.some((button) => /download edited pdf/i.test(labelFor(button)))) throw new Error('download action missing in ready state');
        if (!actions.some((button) => /choose another pdf/i.test(labelFor(button)))) throw new Error('reset action missing in ready state');
        let enabledNormal = 0;
        let disabled = 0;
        let destructive = 0;
        for (const button of actions) {
          const label = labelFor(button);
          const style = getComputedStyle(button);
          const bg = parse(style.backgroundColor);
          const fg = parse(style.color);
          if (button.disabled) {
            disabled += 1;
            if (!isGrey(bg)) throw new Error('disabled action is not grey: ' + label + ' ' + style.backgroundColor);
          } else if (destructivePattern.test(label)) {
            destructive += 1;
            const border = parse(style.borderTopColor);
            if (!isRed(bg) && !isRed(border) && !isRed(fg)) throw new Error('destructive action is not red: ' + label);
          } else {
            enabledNormal += 1;
            if (!isBlue(bg)) throw new Error('enabled action is not blue: ' + label + ' ' + style.backgroundColor);
          }
          if (${mode === 'mobile'} && button.getBoundingClientRect().height < 44) throw new Error('mobile action below 44px: ' + label);
        }
        if (!enabledNormal || !disabled) throw new Error('ready-state action coverage incomplete');
        if (document.documentElement.scrollWidth > innerWidth + 1) throw new Error('ready-state horizontal overflow ' + document.documentElement.scrollWidth);
        return 'loaded local PDF; blue enabled/reset/download, grey disabled, red destructive semantics (' + enabledNormal + '/' + disabled + '/' + destructive + ')';
      })()`);
    }

    if (runtimeErrors.length) throw new Error(`${name} emitted runtime exceptions: ${runtimeErrors.join('; ')}`);
    results.push({ ...general, interaction });
  }
  console.log('ADSENSE_CROSS_CLUSTER_SAMPLING_PASS', mode, JSON.stringify({ viewport: `${width}x${height}`, routes: results }));
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
  try { unlinkSync(fixturePath); } catch {}
}
