import { describe, expect, it } from 'vitest';
import {
  createUrlResolver,
  deepMerge,
  normalizeI18n,
} from '../../lib/i18n/index.js';

const settings = (overrides = {}) =>
  normalizeI18n({
    i18n: {
      enabled: true,
      defaultLanguage: 'en',
      languages: [
        { code: 'en', label: 'English' },
        { code: 'fr', htmlLang: 'fr-FR' },
        { code: 'zh' },
      ],
      ...overrides,
    },
  });

describe('i18n configuration and locale merging', () => {
  it('is disabled unless explicitly enabled and supplies language metadata defaults', () => {
    expect(normalizeI18n().enabled).toBe(false);
    expect(settings().languages[1]).toEqual({
      code: 'fr',
      label: 'fr',
      htmlLang: 'fr-FR',
    });
  });

  it.each([
    { languages: [{ code: 'en' }, { code: 'en' }] },
    { languages: [{ code: 'en' }, { code: '../fr' }] },
    { defaultLanguage: 'de' },
  ])('rejects ambiguous or unsafe enabled configuration %j', (override) => {
    expect(() => settings(override)).toThrow(/i18n/);
  });

  it('preserves nested siblings, replaces arrays, and does not mutate base data', () => {
    const base = {
      shared: { pagination: { previous: 'Previous', next: 'Next' } },
      list: ['base'],
    };
    const merged = deepMerge(base, {
      shared: { pagination: { previous: 'Précédent' } },
      list: ['override'],
    });
    expect(merged).toEqual({
      shared: { pagination: { previous: 'Précédent', next: 'Next' } },
      list: ['override'],
    });
    expect(base.shared.pagination.previous).toBe('Previous');
    expect(base.list).toEqual(['base']);
  });
});

describe('i18n available URL resolution', () => {
  it('retains queries and fragments and falls back to a built original', () => {
    const resolver = createUrlResolver(settings());
    resolver.update([
      '/posts/paired/',
      '/fr/posts/paired/',
      '/timeline/',
      '/france/',
    ]);
    expect(resolver.url('/posts/paired/?view=compact#part', 'fr')).toBe(
      '/fr/posts/paired/?view=compact#part',
    );
    expect(resolver.url('/fr/posts/paired/', 'zh')).toBe('/posts/paired/');
    expect(resolver.url('/timeline/#event', 'fr')).toBe('/timeline/#event');
    expect(resolver.url('/france/', 'fr')).toBe('/france/');
    expect(resolver.url('https://example.com/posts/paired/', 'fr')).toBe(
      'https://example.com/posts/paired/',
    );
    expect(resolver.url('//example.com/posts/paired/', 'fr')).toBe(
      '//example.com/posts/paired/',
    );
  });

  it('offers only existing counterparts and discards stale URLs on a rebuild', () => {
    const resolver = createUrlResolver(settings());
    resolver.update(['/posts/paired/', '/fr/posts/paired/', '/posts/alone/']);
    expect(
      resolver.links('/posts/paired/').map(({ code, url }) => [code, url]),
    ).toEqual([
      ['en', '/posts/paired/'],
      ['fr', '/fr/posts/paired/'],
    ]);
    expect(resolver.links('/posts/alone/')).toEqual([]);
    expect(resolver.links('/posts/missing/')).toEqual([]);
    resolver.update(['/posts/paired/']);
    expect(resolver.links('/posts/paired/')).toEqual([]);
  });

  it('does not hardcode English as the default language', () => {
    const resolver = createUrlResolver(
      normalizeI18n({
        i18n: {
          enabled: true,
          defaultLanguage: 'de',
          languages: [{ code: 'de' }, { code: 'pt-BR' }],
        },
      }),
    );
    resolver.update(['/notes/example/', '/pt-BR/notes/example/']);
    expect(resolver.url('/pt-BR/notes/example/', 'de')).toBe('/notes/example/');
    expect(resolver.links('/notes/example/').map(({ code }) => code)).toEqual([
      'de',
      'pt-BR',
    ]);
  });
});
