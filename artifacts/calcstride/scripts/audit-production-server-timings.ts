import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverEntry = path.join(root, 'dist/runtime/production-server.mjs');
const publicRoot = path.join(root, 'dist/public');
const MAX_STARTUP_MS = 1_000;
const MAX_COLD_TOTAL_MS = 1_500;
const MAX_RESPONSE_MS = 300;
const requestHeaders = {
  'Accept-Encoding': 'br, gzip',
  'X-Forwarded-Host': 'figurenest.com',
  'X-Forwarded-Proto': 'https',
};

type Measurement = {
  label: string;
  path: string;
  startupMs: number;
  coldMs: number;
  warmMs: number;
  coldTotalMs: number;
  status: number;
  cacheControl: string | null;
  cdnCacheControl: string | null;
};

const reservePort = () => new Promise<number>((resolve, reject) => {
  const socket = net.createServer();
  socket.once('error', reject);
  socket.listen(0, '127.0.0.1', () => {
    const address = socket.address();
    assert(address && typeof address !== 'string');
    const { port } = address;
    socket.close((error) => error ? reject(error) : resolve(port));
  });
});

const waitForHealth = async (origin: string, process: ChildProcessWithoutNullStreams) => {
  const started = performance.now();
  let output = '';
  process.stdout.on('data', (chunk) => { output += chunk.toString(); });
  process.stderr.on('data', (chunk) => { output += chunk.toString(); });
  for (;;) {
    if (process.exitCode !== null) throw new Error(`Production server exited during startup:\n${output}`);
    try {
      const response = await fetch(`${origin}/healthz`, { signal: AbortSignal.timeout(250) });
      if (response.status === 204) return performance.now() - started;
    } catch {
      // The listening socket is not ready yet.
    }
    if (performance.now() - started > 5_000) throw new Error(`Production server did not become healthy:\n${output}`);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

const timedRequest = async (url: string) => {
  const started = performance.now();
  const response = await fetch(url, { headers: requestHeaders });
  await response.arrayBuffer();
  return { response, elapsedMs: performance.now() - started };
};

const stop = (process: ChildProcessWithoutNullStreams) => new Promise<void>((resolve) => {
  if (process.exitCode !== null) return resolve();
  process.once('exit', () => resolve());
  process.kill('SIGTERM');
  setTimeout(() => {
    if (process.exitCode === null) process.kill('SIGKILL');
  }, 1_000).unref();
});

const measure = async (label: string, requestPath: string): Promise<Measurement> => {
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, [serverEntry], {
    cwd: root,
    env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    const startupMs = await waitForHealth(origin, child);
    const cold = await timedRequest(`${origin}${requestPath}`);
    const warm = await timedRequest(`${origin}${requestPath}`);
    const measurement = {
      label,
      path: requestPath,
      startupMs,
      coldMs: cold.elapsedMs,
      warmMs: warm.elapsedMs,
      coldTotalMs: startupMs + cold.elapsedMs,
      status: cold.response.status,
      cacheControl: cold.response.headers.get('cache-control'),
      cdnCacheControl: cold.response.headers.get('cdn-cache-control'),
    };
    assert.equal(measurement.status, 200, `${label} returned ${measurement.status}`);
    assert(startupMs < MAX_STARTUP_MS, `${label} startup ${startupMs.toFixed(1)}ms exceeds ${MAX_STARTUP_MS}ms`);
    assert(measurement.coldTotalMs < MAX_COLD_TOTAL_MS, `${label} practical cold ${measurement.coldTotalMs.toFixed(1)}ms exceeds ${MAX_COLD_TOTAL_MS}ms`);
    assert(measurement.coldMs < MAX_RESPONSE_MS, `${label} cold serving ${measurement.coldMs.toFixed(1)}ms exceeds ${MAX_RESPONSE_MS}ms`);
    assert(measurement.warmMs < MAX_RESPONSE_MS, `${label} warm serving ${measurement.warmMs.toFixed(1)}ms exceeds ${MAX_RESPONSE_MS}ms`);
    return measurement;
  } finally {
    await stop(child);
  }
};

await fs.access(serverEntry);
const homeHtml = await fs.readFile(path.join(publicRoot, 'index.html'), 'utf8');
const assetPaths = [...homeHtml.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+\.(?:js|css))"/g)].map((match) => match[1]);
const jsAsset = assetPaths.find((asset) => asset.endsWith('.js'));
const cssAsset = assetPaths.find((asset) => asset.endsWith('.css'));
assert(jsAsset, 'Prerendered homepage does not reference a fingerprinted JavaScript asset');
assert(cssAsset, 'Prerendered homepage does not reference a fingerprinted CSS asset');

const targets = [
  ['homepage HTML', '/'],
  ['mortgage calculator HTML', '/calculators/finance/mortgage/'],
  ['sitemap', '/sitemap.xml'],
  ['robots', '/robots.txt'],
  ['fingerprinted JavaScript', jsAsset],
  ['fingerprinted CSS', cssAsset],
] as const;

const results: Measurement[] = [];
for (const [label, requestPath] of targets) results.push(await measure(label, requestPath));

console.log('Production-like cold/warm timing audit passed');
for (const result of results) {
  console.log([
    result.label,
    `startup=${result.startupMs.toFixed(1)}ms`,
    `cold-serve=${result.coldMs.toFixed(1)}ms`,
    `practical-cold=${result.coldTotalMs.toFixed(1)}ms`,
    `warm=${result.warmMs.toFixed(1)}ms`,
    `cache="${result.cacheControl}"`,
    `cdn-cache="${result.cdnCacheControl}"`,
  ].join(' | '));
}