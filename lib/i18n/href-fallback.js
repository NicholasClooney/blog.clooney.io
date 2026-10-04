import { escapeHtml, unescapeAll } from 'markdown-it/lib/common/utils.mjs';

// Edit attribute values in place so unrelated markup keeps its exact bytes.
// Tokenize whole tags (including quoted values), comments and CDATA; raw-text
// element bodies must never be mistaken for tags containing real links.
export function rewriteTranslatedHrefs(
  content,
  { pageUrl, resolver, warn = console.warn },
) {
  let rawTextEnd = 0;
  const tokens =
    /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?(?:\]\]>|$)|<![^>]*>|<\?[\s\S]*?\?>|<([a-z][a-z0-9:-]*)(?=[\s/>])((?:[^"'<>]|"[^"]*"|'[^']*')*)>/gi;
  return content.replace(tokens, (tag, name, attributes, offset) => {
    if (!name || offset < rawTextEnd) return tag;
    if (
      /^(script|style|textarea|title|xmp|iframe|noembed|noframes|plaintext)$/i.test(
        name,
      )
    ) {
      const closing = new RegExp(`</${name}\\s*>`, 'gi');
      closing.lastIndex = offset + tag.length;
      const end =
        name.toLowerCase() === 'plaintext' ? null : closing.exec(content);
      rawTextEnd = end ? closing.lastIndex : content.length;
    }
    const rewritten = attributes.replace(
      /([^\s"'<>/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g,
      (attribute, key, value) => {
        if (key.toLowerCase() !== 'href' || value === undefined)
          return attribute;
        const quoted = value[0] === '"' || value[0] === "'";
        const raw = quoted ? value.slice(1, -1) : value;
        // markdown-it decodes HTML entities; doubling backslashes prevents its
        // Markdown escape handling from changing literal URL backslashes.
        const url = unescapeAll(raw.replaceAll('\\', '\\\\'));
        const fallback = resolver.fallback(url, pageUrl);
        if (fallback === url) return attribute;
        warn(
          `[11ty/i18n] Missing translation in ${pageUrl}: ${url} → ${fallback}`,
        );
        const quote = quoted ? value[0] : '"';
        const escaped = escapeHtml(fallback).replaceAll("'", '&#39;');
        return attribute.slice(0, -value.length) + quote + escaped + quote;
      },
    );
    return `<${name}${rewritten}>`;
  });
}
