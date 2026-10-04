// Render a deliberately small Markdown vocabulary. Raw HTML is always text.
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function inline(text) {
  const pattern = /`([^`]+)`|\[([^\n]+?)\]\((https?:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|\*([^*]+)\*/g;
  let result = '', start = 0;
  for (const match of text.matchAll(pattern)) {
    result += escapeHTML(text.slice(start, match.index));
    if (match[1]) result += `<code>${escapeHTML(match[1])}</code>`;
    else if (match[2]) result += `<a href="${escapeHTML(match[3])}" target="_blank" rel="noopener noreferrer">${escapeHTML(match[2])}</a>`;
    else if (match[4]) result += `<strong>${inline(match[4])}</strong>`;
    else result += `<em>${escapeHTML(match[5])}</em>`;
    start = match.index + match[0].length;
  }
  return result + escapeHTML(text.slice(start));
}

export function renderMarkdown(source) {
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  const startsBlock = line => /^(#{1,6}\s|```|>\s?|\s*[-*+]\s|\s*\d+\.\s|---+$)/.test(line);
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (/^```/.test(line)) {
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      blocks.push(`<pre><code>${escapeHTML(code.join('\n'))}</code></pre>`);
    } else if (/^#{1,6}\s/.test(line)) {
      const [, hashes, title] = line.match(/^(#{1,6})\s+(.+)$/);
      const level = Math.min(6, hashes.length + 1);
      blocks.push(`<h${level}>${inline(title)}</h${level}>`);
      i++;
    } else if (/^>/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(`<blockquote>${renderMarkdown(quote.join('\n'))}</blockquote>`);
    } else if (/^\s*(?:[-*+]|\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const marker = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/;
      const items = [];
      while (i < lines.length) {
        if (!marker.test(lines[i])) break;
        let item = lines[i++].replace(marker, '');
        while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) item += ' ' + lines[i++].trim();
        items.push(`<li>${inline(item)}</li>`);
        if (!lines[i]?.trim() && marker.test(lines[i + 1] || '')) i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      const start = ordered ? ` start="${Number(line.match(/\d+/)[0])}"` : '';
      blocks.push(`<${tag}${start}>${items.join('')}</${tag}>`);
    } else if (/^---+$/.test(line)) {
      blocks.push('<hr>'); i++;
    } else {
      const paragraph = [lines[i++]];
      while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) paragraph.push(lines[i++]);
      blocks.push(`<p>${inline(paragraph.join('\n'))}</p>`);
    }
  }
  return blocks.join('\n');
}
