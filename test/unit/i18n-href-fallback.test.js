import { describe, expect, it, vi } from 'vitest';
import { createUrlResolver, normalizeI18n } from '../../lib/i18n/index.js';
import { rewriteTranslatedHrefs } from '../../lib/i18n/href-fallback.js';

const resolverFor = (enabled = true) => {
  const resolver = createUrlResolver(
    normalizeI18n({
      i18n: {
        enabled,
        defaultLanguage: 'de',
        languages: [{ code: 'de' }, { code: 'pt-BR' }, { code: 'fr' }],
      },
    }),
  );
  resolver.update([
    '/posts/original/',
    '/posts/paired/',
    '/pt-BR/posts/paired/',
  ]);
  return resolver;
};

describe('translated href fallback boundaries', () => {
  it('uses configured language codes, tolerates trailing slashes, and preserves suffixes', () => {
    const resolver = resolverFor();
    expect(
      resolver.fallback(
        '/pt-BR/posts/original?x=1#part',
        '/pt-BR/posts/source/',
      ),
    ).toBe('/posts/original?x=1#part');
    expect(
      resolver.fallback('/pt-BR/posts/paired?x=1#part', '/pt-BR/posts/source/'),
    ).toBe('/pt-BR/posts/paired?x=1#part');
  });

  it.each([
    '/fr/posts/original/',
    '/pt-BR/posts/missing/',
    '/posts/original/',
    'https://example.com/pt-BR/posts/original/',
    '//example.com/pt-BR/posts/original/',
    '../posts/original/',
    '#part',
    'mailto:author@example.com',
  ])('leaves out-of-scope or unresolved href %s unchanged', (href) => {
    expect(resolverFor().fallback(href, '/pt-BR/posts/source/')).toBe(href);
  });

  it('does not rewrite originals or disabled sites, and forgets stale targets on rebuild', () => {
    const href = '/pt-BR/posts/original/';
    const resolver = resolverFor();
    expect(resolver.fallback(href, '/posts/source/')).toBe(href);
    expect(resolverFor(false).fallback(href, '/pt-BR/posts/source/')).toBe(
      href,
    );
    resolver.update([]);
    expect(resolver.fallback(href, '/pt-BR/posts/source/')).toBe(href);
  });

  it('changes real href attributes only and preserves unrelated HTML byte for byte', () => {
    const untouched = [
      '<!-- <a href="/pt-BR/posts/original/">comment</a> -->',
      '<script>const example = \'<a href="/pt-BR/posts/original/">\';</script>',
      '<textarea><a href="/pt-BR/posts/original/">example</a></textarea>',
      '<a data-href="/pt-BR/posts/original/" title=\'href="/pt-BR/posts/original/"\'>attribute</a>',
      '<code>&lt;a href="/pt-BR/posts/original/"&gt;</code>',
    ].join('\n');
    const source = `${untouched}\n<A class="kept" HREF = '/pt-BR/posts/original/?x=1&amp;y=2#part'>Link</A>`;
    const warn = vi.fn();
    const output = rewriteTranslatedHrefs(source, {
      pageUrl: '/pt-BR/posts/source/',
      resolver: resolverFor(),
      warn,
    });
    expect(output).toBe(
      `${untouched}\n<A class="kept" HREF = '/posts/original/?x=1&amp;y=2#part'>Link</A>`,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('/pt-BR/posts/source/');
    expect(warn.mock.calls[0][0]).toContain('/pt-BR/posts/original/');
    expect(warn.mock.calls[0][0]).toContain('/posts/original/');
  });
});
