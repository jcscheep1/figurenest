import { spawn, spawnSync } from 'node:child_process';

const [mode, widthText, heightText, portText, baseUrl = 'http://127.0.0.1:4177'] = process.argv.slice(2);
const width = Number(widthText);
const height = Number(heightText);
const port = Number(portText);
if (!['desktop', 'mobile'].includes(mode) || !width || !height || !port) {
  throw new Error('Usage: node scripts/adsense-live-functional-sampling.mjs <desktop|mobile> <width> <height> <debug-port> [base-url]');
}

const chromeCandidates = [process.env.CHROME_BIN, 'google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'].filter(Boolean);
let chromeBin = '';
for (const candidate of chromeCandidates) {
  const probe = spawnSync('which', [candidate], { encoding: 'utf8' });
  if (probe.status === 0 && probe.stdout.trim()) { chromeBin = probe.stdout.trim(); break; }
}
if (!chromeBin) throw new Error('Chrome/Chromium is unavailable');

const chrome = spawn(chromeBin, [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  `--window-size=${width},${height}`,
  `--remote-debugging-port=${port}`,
  `--user-data-dir=/tmp/figurenest-adsense-${mode}`,
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
  ['home', '/'],
  ['directory', '/calculators/'],
  ['finance-category', '/category/money-finance/'],
  ['salary', '/calculators/salary-work/salary/'],
  ['brick', '/calculators/construction/brick/'],
  ['circle', '/calculators/math/circle/'],
  ['age', '/calculators/date-time/age/'],
  ['temperature', '/converters/temperature/'],
  ['file-tools-category', '/category/file-tools/'],
  ['image-converter', '/file-tools/image-converter/'],
  ['about', '/about/'],
  ['terms', '/terms/'],
  ['disclaimer', '/disclaimer/'],
  ['methodology', '/methodology/'],
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
    throw new Error(`Timed out waiting for ${label}`);
  };

  await command('Page.enable');
  await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: mode === 'mobile' });
  await command('Emulation.setTouchEmulationEnabled', { enabled: mode === 'mobile', maxTouchPoints: mode === 'mobile' ? 5 : 1 });

  const results = [];
  for (const [name, route] of routes) {
    runtimeErrors.length = 0;
    await command('Page.navigate', { url: new URL(route, baseUrl).href });
    await waitFor(`document.readyState === 'complete' && document.querySelector('main h1')`, `${name} render`);
    const general = await evaluate(`(() => {
      const route = ${JSON.stringify(route)};
      const h1 = document.querySelector('main h1');
      const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
      const description = document.querySelector('meta[name="description"]')?.content || '';
      const main = document.querySelector('main');
      const rect = h1.getBoundingClientRect();
      const failures = [];
      if (innerWidth !== ${width} || innerHeight !== ${height}) failures.push('viewport mismatch ' + innerWidth + 'x' + innerHeight);
      if (document.querySelectorAll('main').length !== 1) failures.push('main landmark count');
      if (document.querySelectorAll('main h1').length !== 1) failures.push('H1 count');
      if (!document.title || description.length < 90) failures.push('metadata');
      if (!canonical.startsWith('https://figurenest.com') || new URL(canonical).pathname !== route) failures.push('canonical');
      if (document.documentElement.scrollWidth > innerWidth + 1) failures.push('horizontal overflow ' + document.documentElement.scrollWidth);
      if (rect.width <= 0 || rect.height <= 0) failures.push('H1 not visible');
      if ((main?.innerText.trim().split(/\\s+/).length || 0) < 150) failures.push('insufficient visible guidance');
      if (/\\b(coming soon|lorem ipsum|placeholder)\\b/i.test(main?.innerText || '')) failures.push('placeholder language');
      const isStructured = route.startsWith('/category/') || route.startsWith('/calculators/') || route.startsWith('/converters/') || route.startsWith('/file-tools/');
      if (isStructured && !document.querySelector('script[type="application/ld+json"]')) failures.push('JSON-LD');
      if (failures.length) throw new Error(failures.join(', '));
      return { route, title: document.title, h1: h1.textContent.trim(), words: main.innerText.trim().split(/\\s+/).length };
    })()`);

    let interaction = 'content/navigation surface';
    if (name === 'directory') {
      interaction = await evaluate(`(async () => {
        const input = document.querySelector('input[placeholder*="Search calculators"]');
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, 'mortgage'); input.dispatchEvent(new Event('input', {bubbles:true}));
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (!document.body.innerText.includes('Mortgage Calculator')) throw new Error('directory search failed');
        setter.call(input, ''); input.dispatchEvent(new Event('input', {bubbles:true}));
        return 'search/filter reset';
      })()`, true);
    } else if (name === 'salary') {
      interaction = await evaluate(`(async () => {
        const input = document.querySelector('input[aria-label^="Annual salary"]');
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, '72000'); input.dispatchEvent(new Event('input', {bubbles:true}));
        input.dispatchEvent(new Event('change', {bubbles:true})); await new Promise((resolve) => setTimeout(resolve, 100));
        if (!document.body.innerText.includes('$6,000.00')) throw new Error('salary result did not update');
        document.querySelector('button[aria-label*="Reset"], button')?.focus();
        return 'valid input and live result';
      })()`, true);
    } else if (['brick', 'circle', 'temperature'].includes(name)) {
      interaction = await evaluate(`(async () => {
        const input = document.querySelector('main input[type="number"]');
        if (!input) throw new Error('numeric input missing');
        const before = document.querySelector('main')?.innerText;
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, String((Number(input.value) || 1) + 1)); input.dispatchEvent(new Event('input', {bubbles:true}));
        input.dispatchEvent(new Event('change', {bubbles:true})); await new Promise((resolve) => setTimeout(resolve, 100));
        if (document.querySelector('main')?.innerText === before) throw new Error('calculation did not react to input');
        return 'numeric input and result update';
      })()`, true);
    } else if (name === 'age') {
      interaction = await evaluate(`(() => {
        const dates = document.querySelectorAll('main input[type="date"]');
        const reset = [...document.querySelectorAll('main button')].find((button) => /reset/i.test(button.textContent));
        if (dates.length < 1 || !reset) throw new Error('date/reset controls missing');
        reset.focus(); if (document.activeElement !== reset) throw new Error('reset not keyboard focusable');
        return 'date controls and keyboard reset';
      })()`);
    } else if (name === 'image-converter') {
      interaction = await evaluate(`(() => {
        const page = document.querySelector('.file-tool-page');
        const input = page?.querySelector('input[type="file"]');
        const picker = input ? getComputedStyle(input, '::file-selector-button') : null;
        const buttons = [...(page?.querySelectorAll('button') || [])];
        if (!page || !input || !picker) throw new Error('File Tool wrapper/picker missing');
        if (picker.backgroundColor === 'rgba(0, 0, 0, 0)' || picker.color === picker.backgroundColor) throw new Error('native picker contrast');
        const disabled = buttons.filter((button) => button.disabled);
        if (!disabled.length) throw new Error('disabled action contract missing');
        if (${mode === 'mobile'} && buttons.some((button) => button.getBoundingClientRect().height < 44)) throw new Error('mobile action below 44px');
        return 'File Tool wrapper, native picker, blue/grey action states';
      })()`);
    }
    if (runtimeErrors.length) throw new Error(`${name} emitted runtime exceptions: ${runtimeErrors.join('; ')}`);
    results.push({ ...general, interaction });
  }
  console.log('ADSENSE_LIVE_SAMPLING_PASS', mode, JSON.stringify({ viewport: `${width}x${height}`, routes: results }));
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
}
