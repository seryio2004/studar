import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import ts from 'typescript';

// Compile with the project's TypeScript, including on Node builds without amaro.
const source = readFileSync(new URL('../db/storage.node.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { SQLiteStorage } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('SQLite: atomic batches, revision conflicts, restart and live backup', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'proyectos-storage-'));
  const filename = join(directory, 'proyectos.sqlite');
  let storage;
  try {
    storage = new SQLiteStorage(filename);
    await storage.prepare('INSERT INTO projects (id,payload) VALUES (?,?)').bind('p1', '{}').run();
    await assert.rejects(storage.batch([
      storage.prepare('INSERT INTO ideas (id,payload) VALUES (?,?)').bind('rollback', '{}'),
      storage.prepare('INSERT INTO projects (id,payload) VALUES (?,?)').bind('p1', '{}'),
    ]));
    assert.equal(await storage.prepare('SELECT * FROM ideas WHERE id=?').bind('rollback').first(), null);
    const updated = await storage.batch([
      storage.prepare('UPDATE projects SET revision=2 WHERE id=? AND revision=1').bind('p1'),
    ]);
    assert.equal(updated[0].meta.changes, 1);
    const stale = await storage.batch([
      storage.prepare('UPDATE projects SET revision=3 WHERE id=? AND revision=1').bind('p1'),
    ]);
    assert.equal(stale[0].meta.changes, 0);

    const snapshot = join(directory, 'backup.sqlite');
    const result = spawnSync(process.execPath, ['scripts/database.mjs', 'backup', snapshot], {
      env: { ...process.env, DATABASE_PATH: filename }, encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    const copy = new DatabaseSync(snapshot, { readOnly: true });
    assert.equal(copy.prepare('SELECT revision FROM projects WHERE id=?').get('p1').revision, 2);
    copy.close();
    const imported = join(directory, 'imported.sqlite');
    const restored = spawnSync(process.execPath, ['scripts/database.mjs', 'import', snapshot], {
      env: { ...process.env, DATABASE_PATH: imported }, encoding: 'utf8',
    });
    assert.equal(restored.status, 0, restored.stderr);
    const overwrite = spawnSync(process.execPath, ['scripts/database.mjs', 'import', snapshot], {
      env: { ...process.env, DATABASE_PATH: imported }, encoding: 'utf8',
    });
    assert.equal(overwrite.status, 1);

    storage.database.close();
    storage = new SQLiteStorage(filename);
    assert.equal((await storage.prepare('SELECT revision FROM projects WHERE id=?').bind('p1').first()).revision, 2);
  } finally {
    storage?.database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
