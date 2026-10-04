import test from 'node:test';
import assert from 'node:assert/strict';
import {renderMarkdown} from '../src/markdown.js';

test('renders the statement with headings, lists, links, quotes and code', () => {
  const html = renderMarkdown('# Tarea\n\n**Entrega**\n\n- Uno\n- Dos\n\n3. Tres\n\n> Nota\n\n```java\na < b\n```\n\n[Campus](https://example.com)');
  for (const fragment of ['<h2>Tarea</h2>', '<strong>Entrega</strong>', '<ul><li>Uno</li><li>Dos</li></ul>', '<ol start="3">', '<blockquote>', '<pre><code>a &lt; b</code></pre>', 'href="https://example.com"']) assert.ok(html.includes(fragment), fragment);
});

test('does not execute HTML or unsafe Markdown links', () => {
  const html = renderMarkdown('<img src=x onerror=alert(1)>\n\n[x](javascript:alert)\n\n`<script>`\n\n[link](https://example.com/"onclick="alert)');
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('&quot;onclick=&quot;'));
});
