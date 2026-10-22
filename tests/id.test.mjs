import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';
import ts from 'typescript';

test('IDs work with the crypto API available over LAN HTTP, without randomUUID', () => {
  const source = readFileSync(new URL('../lib/id.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = createContext({
    exports: {},
    isSecureContext: false,
    crypto: { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) },
  });
  runInContext(compiled, context);
  const ids = Array.from({ length: 1000 }, () => context.exports.createId());
  for (const id of ids) {
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  }
  assert.equal(new Set(ids).size, ids.length);
});
