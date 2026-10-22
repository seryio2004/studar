import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { setTimeout } from 'node:timers/promises';

const directory = mkdtempSync(join(tmpdir(), 'proyectos-server-'));
const socket = createServer();
socket.listen(0, '127.0.0.1');
await once(socket, 'listening');
const port = socket.address().port;
await new Promise(resolve => socket.close(resolve));
const base = `http://127.0.0.1:${port}`;
let server;
let output = '';

async function start() {
  server = spawn(process.execPath, ['node_modules/vinext/dist/cli.js', 'start', '--port', String(port), '--hostname', '127.0.0.1'], {
    env: { ...process.env, NODE_ENV: 'production', DATABASE_PATH: join(directory, 'proyectos.sqlite') },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', chunk => { output += chunk; });
  server.stderr.on('data', chunk => { output += chunk; });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(output);
    try {
      const response = await fetch(base + '/api/state');
      if (response.ok) return;
    } catch { /* Wait for the listening socket. */ }
    await setTimeout(100);
  }
  throw new Error('El servidor no arrancó:\n' + output);
}

async function stop() {
  if (!server || server.exitCode !== null) return;
  const closed = once(server, 'exit');
  server.kill('SIGTERM');
  const timeout = globalThis.setTimeout(() => server.kill('SIGKILL'), 5000);
  try { await closed; } finally { clearTimeout(timeout); }
}

try {
  await start();
  const page = await fetch(base);
  assert.equal(page.status, 200);
  const html = await page.text();
  const asset = html.match(/src="([^" ]+\.js)"/);
  assert.ok(asset, 'La página debe incluir JavaScript para el navegador');
  assert.equal((await fetch(new URL(asset[1], base))).status, 200);
  const workflows = spawn(process.execPath, ['tests/workflows.mjs'], {
    env: { ...process.env, TEST_BASE_URL: base }, stdio: 'inherit',
  });
  const [code] = await once(workflows, 'exit');
  assert.equal(code, 0);
  const before = await (await fetch(base + '/api/state')).json();
  assert.equal(before.projects.length, 1);
  assert.equal(before.projects[0].docs[0].content, '# Documentación importada');
  await stop();
  await start();
  assert.deepEqual(await (await fetch(base + '/api/state')).json(), before);
  console.log('PASS: servidor de producción, HTML y JS, flujos API y persistencia tras reiniciar.');
} finally {
  await stop();
  rmSync(directory, { recursive: true, force: true });
}
