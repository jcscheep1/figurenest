import { spawn, spawnSync } from 'node:child_process';

const [mode, widthText, heightText, portText, baseUrl = 'http://127.0.0.1:4177'] = process.argv.slice(2);
const width = Number(widthText);
const height = Number(heightText);
const port = Number(portText);
if (!['desktop', 'mobile'].includes(mode) || !width || !height || !port) throw new Error('Usage: node scripts/adsense-cross-cluster-functional-sampling.mjs <desktop|mobile> <width> <height> <debug-port> [base-url]');

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
  const browserSignals = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params?.exceptionDetails?.exception?.description ?? message.params?.exceptionDetails?.text ?? 'runtime exception');
    if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params?.type)) {
      browserSignals.push({ kind: `console:${message.params.type}`, args: (message.params.args || []).map((arg) => arg.value ?? arg.description ?? '').join(' ') });
    }
    if (message.method === 'Log.entryAdded') browserSignals.push({ kind: `log:${message.params?.entry?.level || 'unknown'}`, text: message.params?.entry?.text || '', url: message.params?.entry?.url || '' });
    if (message.method === 'Network.loadingFailed') browserSignals.push({ kind: 'network-failed', url: message.params?.url || '', error: message.params?.errorText || '', type: message.params?.type || '' });
    if (message.method === 'Network.responseReceived') {
      const response = message.params?.response;
      if (response && (/pdf\.worker|\.mjs(?:\?|$)/i.test(response.url || '') || response.status >= 400)) browserSignals.push({ kind: 'network-response', url: response.url, status: response.status, mime: response.mimeType || '' });
    }
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
  const waitFor = async (expression, label, timeout = 30_000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      try { if (await evaluate(expression, true)) return; } catch {}
      await sleep(150);
    }
    const state = await evaluate(`({
      href: location.href,
      title: document.title,
      h1: document.querySelector('main h1')?.textContent || '',
      fileStatus: document.querySelector('[data-file-job-status]')?.getAttribute('data-file-job-status') || '',
      alert: document.querySelector('[role="alert"]')?.textContent || '',
      active: document.activeElement?.getAttribute?.('data-testid') || document.activeElement?.tagName || '',
      workerEvents: window.__figurenestWorkerEvents || []
    })`).catch(() => ({}));
    throw new Error(`Timed out waiting for ${label}: ${JSON.stringify({ ...state, browserSignals: browserSignals.slice(-20) })}`);
  };
  const dispatchKey = async (type, key, extras = {}) => command('Input.dispatchKeyEvent', { type, key, ...extras });

  await command('Page.enable');
  await command('Runtime.enable');
  await command('DOM.enable');
  await command('Log.enable');
  await command('Network.enable');
  await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: mode === 'mobile' });
  await command('Emulation.setTouchEmulationEnabled', { enabled: mode === 'mobile', maxTouchPoints: mode === 'mobile' ? 5 : 1 });

  const results = [];
  for (const [name, route] of routes) {
    runtimeErrors.length = 0;
    browserSignals.length = 0;
    await command('Page.navigate', { url: new URL(route, baseUrl).href });
    await waitFor(`document.readyState === 'complete' && location.pathname.replace(/\\/$/, '') === ${JSON.stringify(route.replace(/\/$/, ''))} && document.querySelector('main h1') && Object.keys(document.getElementById('root') || {}).some((key) => key.startsWith('__reactContainer'))`, `${name} hydrated render`);

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
    if (name === 'health-bmr') {
      const before = await evaluate(`(() => {
        const input = document.querySelector('[data-testid="input-bmr-weight"]');
        const result = document.querySelector('[data-testid="result-bmr"]');
        if (!input || !result) throw new Error('BMR input/result contract missing');
        input.focus();
        return { value: input.value, result: result.textContent || '' };
      })()`);
      const nextValue = String(Number(before.value) + 1);
      if (mode === 'desktop') {
        const changed = await evaluate(`(() => {
          const input = document.querySelector('[data-testid="input-bmr-weight"]');
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
          if (!input || !setter) throw new Error('BMR controlled input unavailable');
          setter.call(input, ${JSON.stringify(nextValue)});
          const key = Object.keys(input).find((item) => item.startsWith('__reactProps$'));
          const props = key ? input[key] : null;
          if (typeof props?.onChange === 'function') props.onChange({ target: input, currentTarget: input, type: 'change' });
          input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ${JSON.stringify(nextValue)} }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return input.value;
        })()`);
        if (changed !== nextValue) throw new Error(`BMR desktop controlled input did not accept ${nextValue}`);
      } else {
        await evaluate(`document.querySelector('[data-testid="input-bmr-weight"]')?.select()`);
        for (const character of nextValue) await dispatchKey('char', character, { text: character, unmodifiedText: character });
      }
      await waitFor(`(() => { const input=document.querySelector('[data-testid="input-bmr-weight"]'); const result=document.querySelector('[data-testid="result-bmr"]'); return input?.value === ${JSON.stringify(nextValue)} && (result?.textContent || '') !== ${JSON.stringify(before.result)}; })()`, 'health-bmr result reaction');
      interaction = await evaluate(`(() => { const reset=document.querySelector('[data-testid="button-reset-bmr"]'); const result=document.querySelector('[data-testid="result-bmr"]'); if(!reset || !(result?.textContent||'').trim()) throw new Error('BMR result/reset missing'); reset.focus(); if(document.activeElement!==reset) throw new Error('BMR reset not focusable'); return 'controlled input changed result; reset focusable'; })()`);
    } else if (name === 'electrical-ohms-law') {
      const before = await evaluate(`(() => { const select=document.querySelector('[data-testid="input-ohms-law-solve"]'); const result=document.querySelector('[data-testid="status-ohms-law"] .advanced-result-output'); if(!select||!result) throw new Error('Ohm’s Law contract missing'); select.focus(); return { value: select.value, result: result.textContent || '' }; })()`);
      await dispatchKey('rawKeyDown', 'ArrowDown', { code: 'ArrowDown', windowsVirtualKeyCode: 40 });
      await dispatchKey('keyUp', 'ArrowDown', { code: 'ArrowDown', windowsVirtualKeyCode: 40 });
      await waitFor(`(() => { const select=document.querySelector('[data-testid="input-ohms-law-solve"]'); const result=document.querySelector('[data-testid="status-ohms-law"] .advanced-result-output'); return select?.value !== ${JSON.stringify(before.value)} && (result?.textContent || '') !== ${JSON.stringify(before.result)}; })()`, 'electrical-ohms-law result reaction');
      interaction = await evaluate(`(() => { const reset=document.querySelector('[data-testid="button-reset-ohms-law"]'); const result=document.querySelector('[data-testid="status-ohms-law"] .advanced-result-output'); if(!reset||!(result?.textContent||'').trim()) throw new Error('Ohm’s Law result/reset missing'); reset.focus(); if(document.activeElement!==reset) throw new Error('Ohm’s Law reset not focusable'); return 'solve-mode keyboard change changed result; reset focusable'; })()`);
    } else {
      const idlePicker = await evaluate(`(() => {
        const page=document.querySelector('.file-tool-page'); const input=page?.querySelector('.file-tool-dropzone input[type="file"]'); const choose=page?.querySelector('.file-tool-choose-button');
        if(!page||!input||!choose) throw new Error('File Tool wrapper/native input/visible picker missing');
        const parse=(value)=>{const match=String(value||'').match(/rgba?\\((\\d+)[, ]+(\\d+)[, ]+(\\d+)/i);return match?[Number(match[1]),Number(match[2]),Number(match[3])]:null;};
        const rgb=parse(getComputedStyle(choose).backgroundColor); if(!rgb||!(rgb[2]>=rgb[0]+25&&rgb[2]>=rgb[1]+10)) throw new Error('visible file-picker button is not blue');
        if(${mode === 'mobile'} && choose.getBoundingClientRect().height<44) throw new Error('mobile visible file picker below 44px'); return true;
      })()`);
      if (!idlePicker) throw new Error('idle file-picker check failed');

      await evaluate(`(() => {
        window.__figurenestWorkerEvents=[];
        if(!window.__figurenestNativeWorker){
          window.__figurenestNativeWorker=window.Worker;
          window.Worker=new Proxy(window.Worker,{construct(Target,args){
            const url=String(args[0]||''); const options=args[1]||{}; window.__figurenestWorkerEvents.push({kind:'construct',url,type:options.type||''});
            try{const worker=Reflect.construct(Target,args); worker.addEventListener('error',(event)=>window.__figurenestWorkerEvents.push({kind:'error',url,message:event.message||'',filename:event.filename||''})); worker.addEventListener('messageerror',()=>window.__figurenestWorkerEvents.push({kind:'messageerror',url})); return worker;}
            catch(error){window.__figurenestWorkerEvents.push({kind:'construct-error',url,message:String(error?.stack||error)}); throw error;}
          }});
        }
      })()`);
      const printedPdf = await command('Page.printToPDF', { printBackground: false, preferCSSPageSize: false });
      if (!printedPdf?.data || printedPdf.data.length < 100) throw new Error('Chrome did not create a PDF fixture');
      const assignedFile = await evaluate(`(() => {
        const input=document.querySelector('.file-tool-page .file-tool-dropzone input[type="file"]'); if(!input) throw new Error('PDF input unavailable');
        const binary=atob(${JSON.stringify(printedPdf.data)}); const bytes=new Uint8Array(binary.length); for(let i=0;i<binary.length;i+=1) bytes[i]=binary.charCodeAt(i);
        const file=new File([bytes],'figurenest-browser-generated.pdf',{type:'application/pdf',lastModified:0}); const transfer=new DataTransfer(); transfer.items.add(file); input.files=transfer.files; input.dispatchEvent(new Event('change',{bubbles:true}));
        return {name:input.files?.[0]?.name||'',type:input.files?.[0]?.type||'',size:input.files?.[0]?.size||0};
      })()`);
      if (assignedFile.type !== 'application/pdf' || assignedFile.size < 100) throw new Error(`PDF browser fixture assignment failed: ${JSON.stringify(assignedFile)}`);
      await waitFor(`document.querySelector('.pdf-editor-shell') && document.querySelector('.pdf-export-bar')`, 'PDF Sign & Edit ready state', 25_000);
      interaction = await evaluate(`(() => {
        const page=document.querySelector('.file-tool-page'); const parse=(value)=>{const match=String(value||'').match(/rgba?\\((\\d+)[, ]+(\\d+)[, ]+(\\d+)/i);return match?[Number(match[1]),Number(match[2]),Number(match[3])]:null;};
        const isBlue=(rgb)=>rgb&&rgb[2]>=rgb[0]+25&&rgb[2]>=rgb[1]+10; const isGrey=(rgb)=>rgb&&Math.max(...rgb)-Math.min(...rgb)<=42; const isRed=(rgb)=>rgb&&rgb[0]>=rgb[1]+35&&rgb[0]>=rgb[2]+35;
        const labelFor=(button)=>((button.textContent||'')+' '+(button.getAttribute('aria-label')||'')+' '+(button.title||'')).trim();
        const normal=/download|choose another|add text|add initials|add date|add check|add highlight|undo edit|redo edit|rotate|move earlier|move later|undo page|redo page/i; const destructive=/delete item|delete page/i;
        const actions=[...page.querySelectorAll('button')].filter((button)=>normal.test(labelFor(button))||destructive.test(labelFor(button))); if(!actions.some((button)=>/download edited pdf/i.test(labelFor(button)))) throw new Error('download action missing'); if(!actions.some((button)=>/choose another pdf/i.test(labelFor(button)))) throw new Error('reset action missing');
        let enabled=0,disabled=0,red=0; for(const button of actions){const label=labelFor(button);const style=getComputedStyle(button);const bg=parse(style.backgroundColor);const fg=parse(style.color);if(button.disabled){disabled+=1;if(!isGrey(bg))throw new Error('disabled action not grey: '+label);}else if(destructive.test(label)){red+=1;const border=parse(style.borderTopColor);if(!isRed(bg)&&!isRed(border)&&!isRed(fg))throw new Error('destructive action not red: '+label);}else{enabled+=1;if(!isBlue(bg))throw new Error('enabled action not blue: '+label);}if(${mode === 'mobile'}&&button.getBoundingClientRect().height<44)throw new Error('mobile action below 44px: '+label);}
        if(!enabled||!disabled)throw new Error('ready-state action coverage incomplete');if(document.documentElement.scrollWidth>innerWidth+1)throw new Error('ready-state horizontal overflow '+document.documentElement.scrollWidth);return 'loaded browser-generated PDF; action semantics '+enabled+'/'+disabled+'/'+red;
      })()`);
    }

    if (runtimeErrors.length) throw new Error(`${name} emitted runtime exceptions: ${runtimeErrors.join('; ')}`);
    results.push({ ...general, interaction });
  }
  console.log('ADSENSE_CROSS_CLUSTER_SAMPLING_PASS', mode, JSON.stringify({ viewport: `${width}x${height}`, routes: results }));
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
}
