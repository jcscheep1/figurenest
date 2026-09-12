import { spawn, spawnSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';

const [mode, widthText, heightText, portText, baseUrl = 'http://127.0.0.1:4177'] = process.argv.slice(2);
const width = Number(widthText);
const height = Number(heightText);
const port = Number(portText);
if (!['desktop', 'mobile'].includes(mode) || !width || !height || !port) throw new Error('Usage: node scripts/adsense-cross-cluster-functional-sampling.mjs <desktop|mobile> <width> <height> <debug-port> [base-url]');

const pdfFixtureBase64 = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAzMDAgNDAwXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA0IDAgUiA+PiA+PiAvQ29udGVudHMgNSAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iago1IDAgb2JqCjw8IC9MZW5ndGggNDQgPj4Kc3RyZWFtCkJUIC9GMSAxOCBUZiA3MiAzMjAgVGQgKEZpZ3VyZU5lc3QgUUEpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCjAwMDAwMDAzMTEgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo0MDUKJSVFT0YK';
const pdfFixturePath = `/tmp/figurenest-qa-${mode}-${process.pid}.pdf`;
writeFileSync(pdfFixturePath, Buffer.from(pdfFixtureBase64, 'base64'));

const chromeCandidates = [process.env.CHROME_BIN, 'google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'].filter(Boolean);
let chromeBin = '';
for (const candidate of chromeCandidates) {
  const probe = spawnSync('which', [candidate], { encoding: 'utf8' });
  if (probe.status === 0 && probe.stdout.trim()) { chromeBin = probe.stdout.trim(); break; }
}
if (!chromeBin) throw new Error('Chrome/Chromium is unavailable');

const chrome = spawn(chromeBin, ['--headless=new', '--no-sandbox', '--disable-gpu', `--window-size=${width},${height}`, `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/figurenest-adsense-cross-cluster-${mode}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
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

const routes = [['health-bmr', '/calculators/health/bmr/'], ['electrical-ohms-law', '/calculators/electrical/ohms-law/'], ['pdf-sign-edit', '/file-tools/pdf-sign-edit/']];
let socket;
try {
  socket = await connect();
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  const runtimeErrors = [];
  const browserSignals = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params?.exceptionDetails?.exception?.description ?? message.params?.exceptionDetails?.text ?? 'runtime exception');
    if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params?.type)) browserSignals.push({ kind: `console:${message.params.type}`, args: (message.params.args || []).map((arg) => arg.value ?? arg.description ?? '').join(' ') });
    if (message.method === 'Log.entryAdded') browserSignals.push({ kind: `log:${message.params?.entry?.level || 'unknown'}`, text: message.params?.entry?.text || '', url: message.params?.entry?.url || '' });
    if (message.method === 'Network.loadingFailed') browserSignals.push({ kind: 'network-failed', error: message.params?.errorText || '', type: message.params?.type || '' });
    if (message.method === 'Network.responseReceived') { const response = message.params?.response; if (response && (/pdf\.worker|\.mjs(?:\?|$)/i.test(response.url || '') || response.status >= 400)) browserSignals.push({ kind: 'network-response', url: response.url, status: response.status, mime: response.mimeType || '' }); }
    if (!message.id || !pending.has(message.id)) return;
    const handlers = pending.get(message.id); pending.delete(message.id); if (message.error) handlers.reject(new Error(message.error.message)); else handlers.resolve(message.result);
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression, awaitPromise = false) => { const result = await command('Runtime.evaluate', { expression, awaitPromise, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Browser evaluation failed'); return result.result?.value; };
  const waitFor = async (expression, label, timeout = 35_000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) { try { if (await evaluate(expression, true)) return; } catch {} await sleep(150); }
    const state = await evaluate(`({href:location.href,title:document.title,h1:document.querySelector('main h1')?.textContent||'',fileStatus:document.querySelector('[data-file-job-status]')?.getAttribute('data-file-job-status')||'',alert:document.querySelector('[role="alert"]')?.textContent||'',active:document.activeElement?.getAttribute?.('data-testid')||document.activeElement?.tagName||'',workerEvents:window.__figurenestWorkerEvents||[]})`).catch(() => ({}));
    throw new Error(`Timed out waiting for ${label}: ${JSON.stringify({ ...state, browserSignals: browserSignals.slice(-20) })}`);
  };
  const dispatchKey = (type, key, extras = {}) => command('Input.dispatchKeyEvent', { type, key, ...extras });
  await command('Page.enable'); await command('Runtime.enable'); await command('DOM.enable'); await command('Log.enable'); await command('Network.enable');
  await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: mode === 'mobile' });
  await command('Emulation.setTouchEmulationEnabled', { enabled: mode === 'mobile', maxTouchPoints: mode === 'mobile' ? 5 : 1 });

  const results = [];
  for (const [name, route] of routes) {
    runtimeErrors.length = 0; browserSignals.length = 0;
    await command('Page.navigate', { url: new URL(route, baseUrl).href });
    await waitFor(`document.readyState==='complete'&&location.pathname.replace(/\\/$/,'')===${JSON.stringify(route.replace(/\/$/, ''))}&&document.querySelector('main h1')&&Object.keys(document.getElementById('root')||{}).some((key)=>key.startsWith('__reactContainer'))`, `${name} hydrated render`);
    await evaluate(`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 250))))`, true);
    const general = await evaluate(`(() => { const route=${JSON.stringify(route)};const h1=document.querySelector('main h1');const canonical=document.querySelector('link[rel="canonical"]')?.href||'';const description=document.querySelector('meta[name="description"]')?.content||'';const main=document.querySelector('main');const failures=[];const viewportWidth=document.documentElement.clientWidth||innerWidth;const scrollbarWidth=innerWidth-viewportWidth;if(innerWidth!==${width}||scrollbarWidth<0||scrollbarWidth>20)failures.push('viewport width mismatch');if(document.documentElement.scrollWidth>innerWidth+1)failures.push('horizontal overflow '+document.documentElement.scrollWidth);if(document.querySelectorAll('main').length!==1)failures.push('main landmark count');if(document.querySelectorAll('main h1').length!==1)failures.push('H1 count');if(!document.title||description.length<90)failures.push('metadata');const normalize=(path)=>path==='/'?path:path.replace(/\\/$/,'');if(!canonical.startsWith('https://figurenest.com')||normalize(new URL(canonical).pathname)!==normalize(route))failures.push('canonical '+canonical);if(!h1||h1.getBoundingClientRect().width<=0||h1.getBoundingClientRect().height<=0)failures.push('H1 not visible');if((main?.innerText.trim().split(/\\s+/).length||0)<250)failures.push('insufficient visible guidance');if(/\\b(coming soon|lorem ipsum|placeholder)\\b/i.test(main?.innerText||''))failures.push('placeholder language');if(!document.querySelector('script[type="application/ld+json"]'))failures.push('JSON-LD');if(failures.length)throw new Error(failures.join(', '));return{route,h1:h1.textContent.trim(),words:main.innerText.trim().split(/\\s+/).length,viewport:viewportWidth+'x'+innerHeight};})()`);
    let interaction;
    if (name === 'health-bmr') {
      const before = await evaluate(`(() => { const input=document.querySelector('[data-testid="input-bmr-weight"]');const result=document.querySelector('[data-testid="result-bmr"]');if(!input||!result)throw new Error('BMR input/result contract missing');input.focus();return{value:input.value,result:result.textContent||''};})()`);
      const nextValue = String(Number(before.value) + 1);
      const assignedValue = await evaluate(`(() => {const input=document.querySelector('[data-testid="input-bmr-weight"]');if(!(input instanceof HTMLInputElement))throw new Error('BMR numeric input missing');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;if(!setter)throw new Error('native value setter unavailable');setter.call(input,${JSON.stringify(nextValue)});input.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:${JSON.stringify(nextValue)}}));input.dispatchEvent(new Event('change',{bubbles:true}));return input.value;})()`);
      if (assignedValue !== nextValue) throw new Error(`BMR native input assignment failed: ${assignedValue}`);
      await waitFor(`(() => {const input=document.querySelector('[data-testid="input-bmr-weight"]');const result=document.querySelector('[data-testid="result-bmr"]');return input?.value===${JSON.stringify(nextValue)}&&(result?.textContent||'')!==${JSON.stringify(before.result)};})()`, 'health-bmr input/result reaction');
      interaction = await evaluate(`(() => {const reset=document.querySelector('[data-testid="button-reset-bmr"]');const result=document.querySelector('[data-testid="result-bmr"]');if(!reset||!(result?.textContent||'').trim())throw new Error('BMR result/reset missing after interaction');reset.focus();if(document.activeElement!==reset)throw new Error('BMR reset not focusable');return'native input/change events changed BMR value/result after hydration; reset focusable';})()`);
    } else if (name === 'electrical-ohms-law') {
      const before = await evaluate(`(() => { const select=document.querySelector('[data-testid="input-ohms-law-solve"]');const result=document.querySelector('[data-testid="status-ohms-law"] .advanced-result-output');if(!select||!result)throw new Error('Ohm contract missing');select.focus();return{value:select.value,result:result.textContent||''};})()`);
      await dispatchKey('rawKeyDown', 'ArrowDown', { code: 'ArrowDown', windowsVirtualKeyCode: 40 }); await dispatchKey('keyUp', 'ArrowDown', { code: 'ArrowDown', windowsVirtualKeyCode: 40 });
      await waitFor(`(() => {const select=document.querySelector('[data-testid="input-ohms-law-solve"]');const result=document.querySelector('[data-testid="status-ohms-law"] .advanced-result-output');return select?.value!==${JSON.stringify(before.value)}&&(result?.textContent||'')!==${JSON.stringify(before.result)};})()`, 'electrical-ohms-law result reaction');
      interaction = await evaluate(`(() => { const reset=document.querySelector('[data-testid="button-reset-ohms-law"]');const result=document.querySelector('[data-testid="status-ohms-law"] .advanced-result-output');if(!reset||!(result?.textContent||'').trim())throw new Error('Ohm result/reset missing');reset.focus();if(document.activeElement!==reset)throw new Error('Ohm reset not focusable');return'keyboard solve-mode change changed result; reset focusable';})()`);
    } else {
      await evaluate(`(() => { const page=document.querySelector('.file-tool-page');const input=page?.querySelector('.file-tool-dropzone input[type="file"]');const choose=page?.querySelector('.file-tool-choose-button');if(!page||!input||!choose)throw new Error('File Tool wrapper/native input/picker missing');const m=String(getComputedStyle(choose).backgroundColor).match(/rgba?\\((\\d+)[, ]+(\\d+)[, ]+(\\d+)/i);const rgb=m?[+m[1],+m[2],+m[3]]:null;if(!rgb||!(rgb[2]>=rgb[0]+25&&rgb[2]>=rgb[1]+10))throw new Error('picker not blue');if(${mode === 'mobile'}&&choose.getBoundingClientRect().height<44)throw new Error('mobile picker below 44px');return true;})()`);
      const documentNode = await command('DOM.getDocument', { depth: -1, pierce: true });
      const queried = await command('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: '.file-tool-page .file-tool-dropzone input[type="file"]' });
      if (!queried.nodeId) throw new Error('PDF native file input node missing');
      await command('DOM.setFileInputFiles', { nodeId: queried.nodeId, files: [pdfFixturePath] });
      await waitFor(`Boolean(document.querySelector('.pdf-editor-shell')&&document.querySelector('.pdf-export-bar')&&(document.querySelector('.file-tool-page > [role="status"]')?.textContent||'').includes('PDF ready.'))`, 'PDF Sign & Edit ready state', 45_000);
      interaction = await evaluate(`(() => {const page=document.querySelector('.file-tool-page');const parse=(value)=>{const m=String(value||'').match(/rgba?\\((\\d+)[, ]+(\\d+)[, ]+(\\d+)/i);return m?[+m[1],+m[2],+m[3]]:null;};const blue=(rgb)=>rgb&&rgb[2]>=rgb[0]+25&&rgb[2]>=rgb[1]+10;const grey=(rgb)=>rgb&&Math.max(...rgb)-Math.min(...rgb)<=42;const red=(rgb)=>rgb&&rgb[0]>=rgb[1]+35&&rgb[0]>=rgb[2]+35;const label=(b)=>((b.textContent||'')+' '+(b.getAttribute('aria-label')||'')+' '+(b.title||'')).trim();const normal=/download|choose another|add text|add initials|add date|add check|add highlight|undo edit|redo edit|rotate|move earlier|move later|undo page|redo page/i;const destructive=/delete item|delete page/i;const actions=[...page.querySelectorAll('button')].filter((b)=>normal.test(label(b))||destructive.test(label(b)));if(!actions.some((b)=>/download edited pdf/i.test(label(b))))throw new Error('download action missing');if(!actions.some((b)=>/choose another pdf/i.test(label(b))))throw new Error('reset action missing');let enabled=0,disabled=0,danger=0;for(const b of actions){const l=label(b);const s=getComputedStyle(b);const bg=parse(s.backgroundColor);const fg=parse(s.color);if(b.disabled){disabled++;if(!grey(bg))throw new Error('disabled not grey: '+l);}else if(destructive.test(l)){danger++;const border=parse(s.borderTopColor);if(!red(bg)&&!red(border)&&!red(fg))throw new Error('destructive not red: '+l);}else{enabled++;if(!blue(bg))throw new Error('enabled not blue: '+l);}if(${mode === 'mobile'}&&b.getBoundingClientRect().height<44)throw new Error('mobile action below 44px: '+l);}if(!enabled||!disabled)throw new Error('action coverage incomplete');if(document.documentElement.scrollWidth>innerWidth+1)throw new Error('ready-state overflow');return'loaded deterministic local PDF via native CDP file input; action semantics '+enabled+'/'+disabled+'/'+danger;})()`);
    }
    if (runtimeErrors.length) throw new Error(`${name} emitted runtime exceptions: ${runtimeErrors.join('; ')}`);
    results.push({ ...general, interaction });
  }
  console.log('ADSENSE_CROSS_CLUSTER_SAMPLING_PASS', mode, JSON.stringify({ viewport: `${width}x${height}`, routes: results }));
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
  try { unlinkSync(pdfFixturePath); } catch {}
}
