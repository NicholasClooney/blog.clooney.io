import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { beforeAll, describe, expect, it } from 'vitest';
import { parseHTML } from 'linkedom';
import { buildI18nFixture } from './fixtures/i18n/build.js';
import { findBrokenInternalLinks } from '../lib/build/link-check.js';

const documentAt = (pages, url) => {
  expect(pages.has(url), `built route ${url}`).toBe(true);
  return parseHTML(pages.get(url)).document;
};
const hrefs = (document, selector = 'a[href]') =>
  [...document.querySelectorAll(selector)].map((a) => a.getAttribute('href'));
const text = (document) => document.body.textContent;

// Isolated builds do not depend on the shared _site or network-backed blog content.
describe('opt-in i18n rendered contracts', () => {
  let production;
  let development;
  beforeAll(() => {
    production = buildI18nFixture();
    development = buildI18nFixture({ environment: 'development' });
  }, 120_000);

  it.each([
    ['zh', 'zh-Hans', 'ZH'],
    ['fr', 'fr-FR', 'FR'],
  ])(
    'derives %s content layout, language, and final URLs',
    (code, htmlLang, label) => {
      for (const [route, title] of [
        ['posts/paired/', 'paired'],
        ['notes/short/', 'short'],
        ['notes/hidden/secret/', 'hidden'],
      ]) {
        const doc = documentAt(production, `/${code}/${route}`);
        expect(doc.documentElement.getAttribute('lang')).toBe(htmlLang);
        expect(doc.querySelector('h1')?.textContent).toContain(
          `${label} ${title}`,
        );
        expect(hrefs(doc)).toContain(`/${route}`);
      }
    },
  );

  it('pairs a nested original by its final URL, and only links available counterparts', () => {
    const paired = documentAt(production, '/posts/paired/');
    expect(hrefs(paired)).toContain('/zh/posts/paired/');
    expect(hrefs(paired)).toContain('/fr/posts/paired/');
    expect(hrefs(paired, '[data-language-switcher] a')).toEqual([
      '/posts/paired/',
      '/zh/posts/paired/',
      '/fr/posts/paired/',
    ]);
    const only = documentAt(production, '/posts/english-only/');
    expect(only.querySelector('[data-language-switcher]')).toBeNull();
    expect(hrefs(only).filter((href) => /^\/(zh|fr)\//.test(href))).toEqual([]);
    const translatedOnly = documentAt(production, '/fr/posts/extra-1/');
    expect(hrefs(translatedOnly)).not.toContain('/posts/extra-1/');
    expect(hrefs(translatedOnly)).toContain('/zh/posts/extra-1/');
  });

  it('isolates the original collections, tag indexes, and feed from translations', () => {
    for (const route of [
      '/',
      '/notes/',
      '/notes/hidden/',
      '/tags/shared-topic/',
    ]) {
      const doc = documentAt(production, route);
      expect(text(doc)).not.toMatch(/(?:ZH|FR) (?:paired|short|hidden|extra)/);
    }
    expect(production.get('/feed.xml')).not.toMatch(
      /(?:ZH|FR) (?:paired|short|extra)/,
    );
    const tags = hrefs(documentAt(production, '/tags/'));
    expect(tags).not.toContain('/tags/zh-topic/');
    expect(tags).not.toContain('/tags/fr-topic/');
  });

  it.each([
    ['zh', 'ZH'],
    ['fr', 'FR'],
  ])(
    'renders only %s translations in lists and topic archives',
    (code, label) => {
      const allBlog =
        text(documentAt(production, `/${code}/`)) +
        text(documentAt(production, `/${code}/page/2/`));
      expect(allBlog).toContain(`${label} paired`);
      expect(allBlog).not.toContain('EN paired');
      expect(allBlog).not.toContain('EN only');
      expect(allBlog).not.toContain(`${label} draft`);
      const notes = documentAt(production, `/${code}/notes/`);
      expect(text(notes)).toContain(`${label} short`);
      expect(hrefs(notes)).toContain(`/${code}/tags/shared-topic/`);
      expect(text(notes)).not.toContain(`${label} hidden`);
      expect(text(documentAt(production, `/${code}/notes/hidden/`))).toContain(
        `${label} hidden`,
      );
      const tags = hrefs(documentAt(production, `/${code}/tags/`));
      expect(tags).toContain(`/${code}/tags/${code}-topic/`);
      expect(tags).not.toContain(`/${code}/tags/english-topic/`);
      const topic = text(
        documentAt(production, `/${code}/tags/${code}-topic/`),
      );
      expect(topic).toContain(`${label} paired`);
      expect(topic).not.toContain('EN paired');
    },
  );

  it('deep-merges partial locale strings without losing sibling defaults', () => {
    const notes = documentAt(production, '/zh/notes/');
    expect(notes.querySelector('h1')?.textContent).toBe('中文笔记');
    expect(notes.title).toContain('中文站点');
    expect(text(documentAt(production, '/zh/posts/paired/'))).toContain(
      '中文站点说明',
    );
    expect(text(documentAt(production, '/fr/posts/paired/'))).toContain(
      'Fixture English description',
    );
    expect(
      notes.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toContain('Shorter notes');
    expect(
      [...notes.querySelectorAll('a')].some(
        (a) =>
          a.getAttribute('href') === '/zh/notes/' &&
          a.textContent.trim() === '笔记',
      ),
    ).toBe(true);
    const second = documentAt(production, '/fr/page/2/');
    expect(text(second)).toContain('Précédent');
    expect(text(second)).toContain('Page 2 of 2');
    expect(documentAt(production, '/fr/').title).toContain(
      'Fixture English Site',
    );
    const series = documentAt(production, '/zh/series/reading-path/');
    expect(text(series)).toContain('中文阅读顺序');
    expect(text(series)).toContain('English series introduction');
    expect(text(series)).toContain('中文系列');
    const frenchSeries = text(
      documentAt(production, '/fr/series/reading-path/'),
    );
    expect(frenchSeries).toContain('English reading path');
    expect(frenchSeries).toContain('Introduction française');
  });

  it.each(['zh', 'fr'])(
    'preserves declared series order and falls back to originals in %s',
    (code) => {
      const doc = documentAt(production, `/${code}/series/reading-path/`);
      const entries = [...doc.querySelectorAll('[data-series-entry]')];
      expect(
        entries.map((entry) =>
          entry.querySelector('h2 a')?.getAttribute('href'),
        ),
      ).toEqual([
        `/${code}/notes/short/`,
        `/${code}/posts/paired/`,
        '/posts/english-only/',
        '/timeline/event/',
      ]);
      expect(entries.map((entry) => entry.getAttribute('value'))).toEqual([
        '1',
        '2',
        '3',
        '4',
      ]);
      expect(hrefs(documentAt(production, `/${code}/series/`))).toContain(
        `/${code}/series/reading-path/`,
      );
      const post = documentAt(production, `/${code}/posts/paired/`);
      expect(hrefs(post)).toContain(`/${code}/series/reading-path/`);
      expect(text(post)).toMatch(/2\s+of\s+4/);
    },
  );

  it('excludes drafts from production lists and includes them in development', () => {
    for (const code of ['zh', 'fr']) {
      const prod = text(documentAt(production, `/${code}/tags/shared-topic/`));
      expect(prod).not.toContain(`${code.toUpperCase()} draft`);
      const devBlog =
        text(documentAt(development, `/${code}/`)) +
        text(documentAt(development, `/${code}/page/2/`));
      expect(devBlog).toContain(`${code.toUpperCase()} draft`);
      expect(text(documentAt(development, '/drafts/'))).not.toContain(
        `${code.toUpperCase()} draft`,
      );
    }
  });

  it('keeps timeline shared and all generated internal links resolvable', () => {
    for (const code of ['zh', 'fr']) {
      expect(production.has(`/${code}/timeline/`)).toBe(false);
      expect(hrefs(documentAt(production, `/${code}/`))).toContain(
        '/timeline/',
      );
      expect(hrefs(documentAt(production, `/${code}/`))).toContain('/');
    }
    for (const pages of [production, development]) {
      const results = [...pages].map(([url, content]) => ({
        url,
        content,
        outputPath: url.endsWith('.xml') ? url : `${url}index.html`,
      }));
      expect(findBrokenInternalLinks(results)).toEqual([]);
      for (const [url, html] of pages) {
        expect(html, url).not.toMatch(/\{\{|\{%/);
      }
    }
  });
});

describe('i18n disabled compatibility', () => {
  it('renders identical HTML/XML with missing configuration and explicit false', () => {
    const omitted = buildI18nFixture({
      enabled: 'omitted',
      translations: false,
    });
    const disabled = buildI18nFixture({ enabled: false, translations: false });
    expect([...disabled.keys()].sort()).toEqual([...omitted.keys()].sort());
    for (const [url, html] of omitted)
      expect(disabled.get(url), url).toBe(html);
    expect([...disabled.keys()].some((url) => /^\/(zh|fr)\//.test(url))).toBe(
      false,
    );
    const dormant = buildI18nFixture({ enabled: false, translations: true });
    expect([...dormant.keys()].sort()).toEqual([...disabled.keys()].sort());
    for (const [url, html] of disabled)
      expect(dormant.get(url), url).toBe(html);
  });
});

describe('localized alternate home sections', () => {
  it.each(['notes', 'timeline'])(
    'keeps links valid with %s at the root',
    (homeTarget) => {
      const pages = buildI18nFixture({ homeTarget });
      for (const code of ['zh', 'fr']) {
        const home = documentAt(pages, `/${code}/`);
        const timelineUrl = homeTarget === 'timeline' ? '/' : '/timeline/';
        expect(hrefs(home)).toContain(timelineUrl);
        expect(pages.has(`/${code}/timeline/`)).toBe(false);
        expect(hrefs(documentAt(pages, `/${code}/posts/paired/`))).toContain(
          `/${code}/blog/`,
        );
        if (homeTarget === 'notes')
          expect(text(home)).toContain(`${code.toUpperCase()} short`);
        else expect(text(home)).toContain(`${code.toUpperCase()} extra`);
      }
      expect(
        findBrokenInternalLinks(
          [...pages].map(([url, content]) => ({
            url,
            content,
            outputPath: url.endsWith('.xml') ? url : `${url}index.html`,
          })),
        ),
      ).toEqual([]);
    },
  );
});

// Customize only fixture inputs: all assertions exercise the real CLI build.
const editFixtureYaml = (dir, file, edit) => {
  const target = path.join(dir, file);
  const data = yaml.load(fs.readFileSync(target, 'utf8'));
  edit(data);
  fs.writeFileSync(target, yaml.dump(data));
};
const setTranslatedBy = (dir, file, value) => {
  const target = path.join(dir, file);
  const source = fs.readFileSync(target, 'utf8');
  fs.writeFileSync(target, source.replace(/^---\n/, `---\ntranslatedBy: ${value}\n`));
};
const appendFixture = (dir, file, body) =>
  fs.appendFileSync(path.join(dir, file), `\n${body}\n`);

const localizedNotice = {
  message: '机器 <em>AI</em> & "reviewed"',
  originalLink: '原文 <strong>source</strong> & details',
};

describe('i18n preview followups in real rendered output', () => {
  let explicit;
  let defaults;
  let logs;
  beforeAll(() => {
    explicit = buildI18nFixture({
      configure(dir) {
        for (const file of [
          'posts/nested/paired.md', 'zh/posts/paired.md', 'fr/posts/paired.md',
          'zh/notes/short.md', 'fr/notes/short.md', 'zh/notes/hidden/secret.md',
          'zh/posts/extra-1.md',
        ]) setTranslatedBy(dir, file, 'ai');
        setTranslatedBy(dir, 'fr/notes/hidden/secret.md', 'human');
        editFixtureYaml(dir, '_data/locales/zh.yaml', (data) => {
          data.ui.shared.translationNotice = { ai: localizedNotice };
        });
        appendFixture(dir, 'zh/posts/paired.md', `
<a data-fallback href="/zh/posts/english-only/?from=translation&amp;mode=full#details">Original fallback</a>
<a data-existing href="/zh/notes/short/?from=translation#details">Existing translation</a>
<a data-unprefixed href="/posts/english-only/?from=original#details">Original link</a>`);
      },
      onBuild(result) { logs = result.stderr; },
    });
    defaults = buildI18nFixture({
      configure(dir) {
        editFixtureYaml(dir, '_data/site.yaml', (data) => {
          data.i18n.translationNotice = { default: 'ai' };
        });
        setTranslatedBy(dir, 'zh/posts/paired.md', 'human');
        setTranslatedBy(dir, 'fr/notes/short.md', 'human');
      },
    });
  }, 120_000);

  it('rewrites unavailable translations before link validation, preserving query and hash', () => {
    const doc = documentAt(explicit, '/zh/posts/paired/');
    expect(doc.querySelector('[data-fallback]').getAttribute('href')).toBe(
      '/posts/english-only/?from=translation&mode=full#details',
    );
    expect(doc.querySelector('[data-existing]').getAttribute('href')).toBe(
      '/zh/notes/short/?from=translation#details',
    );
    expect(doc.querySelector('[data-unprefixed]').getAttribute('href')).toBe(
      '/posts/english-only/?from=original#details',
    );
    expect(logs).toMatch(/missing translation|fallback|falling back/i);
    expect(logs).toContain('/zh/posts/paired/');
    expect(logs).toContain('/zh/posts/english-only/');
    expect(logs).toContain('/posts/english-only/');
  });

  it('renders English defaults on AI posts and notes and links final original URLs', () => {
    for (const route of ['posts/paired/', 'notes/short/']) {
      const doc = documentAt(explicit, `/fr/${route}`);
      const notice = doc.querySelector('[data-translation-notice]');
      expect(notice?.textContent).toContain('This page was translated by AI.');
      expect(notice?.querySelector('[data-translation-original]')?.textContent.trim()).toBe('Read the original');
      expect(notice?.querySelector('[data-translation-original]')?.getAttribute('href')).toBe(`/${route}`);
    }
  });

  it('escapes both localized notice strings as plain text, including hidden notes', () => {
    for (const route of ['posts/paired/', 'notes/short/', 'notes/hidden/secret/']) {
      const notice = documentAt(explicit, `/zh/${route}`).querySelector('[data-translation-notice]');
      expect(notice?.textContent).toContain(localizedNotice.message);
      expect(notice?.querySelector('[data-translation-original]')?.textContent.trim()).toBe(localizedNotice.originalLink);
      expect(notice?.querySelector('[data-translation-original]')?.getAttribute('href')).toBe(`/${route}`);
      expect(notice?.querySelector('em, strong')).toBeNull();
    }
  });

  it('omits notices for human or unspecified translations, originals, and lists', () => {
    for (const route of [
      '/fr/notes/hidden/secret/', '/fr/posts/extra-1/', '/zh/posts/extra-2/',
      '/posts/paired/', '/notes/short/', '/timeline/event/',
      '/', '/zh/', '/fr/', '/zh/notes/', '/zh/notes/hidden/',
      '/zh/tags/shared-topic/', '/zh/series/reading-path/',
    ]) expect(documentAt(explicit, route).querySelector('[data-translation-notice]'), route).toBeNull();
  });

  it('supports a site-wide AI default and human opt-out for posts and notes', () => {
    for (const route of ['/fr/posts/paired/', '/zh/notes/short/']) {
      const notice = documentAt(defaults, route).querySelector('[data-translation-notice]');
      expect(notice?.textContent).toContain('This page was translated by AI.');
      expect(notice?.querySelector('[data-translation-original]')?.getAttribute('href')).toBe(route.replace(/^\/(fr|zh)/, ''));
    }
    for (const route of ['/zh/posts/paired/', '/fr/notes/short/', '/posts/paired/', '/notes/short/', '/zh/', '/zh/notes/']) {
      expect(documentAt(defaults, route).querySelector('[data-translation-notice]'), route).toBeNull();
    }
  });

  it('shows text without a broken original link when no default counterpart exists', () => {
    const notice = documentAt(explicit, '/zh/posts/extra-1/').querySelector('[data-translation-notice]');
    expect(notice?.textContent).toContain(localizedNotice.message);
    expect(notice?.querySelector('[data-translation-original]')).toBeNull();
    expect(hrefs(documentAt(explicit, '/zh/posts/extra-1/'))).not.toContain('/posts/extra-1/');
  });
});

describe('missing-translation fallback does not hide invalid links', () => {
  it.each([
    [true, 'zh/posts/paired.md', '/zh/posts/paired/', '/zh/posts/does-not-exist/'],
    [false, 'posts/nested/paired.md', '/posts/paired/', '/zh/posts/english-only/'],
    [true, 'posts/nested/paired.md', '/posts/paired/', '/zh/posts/english-only/'],
  ])('keeps invalid hrefs and fails the real link checker (enabled=%s, source=%s)', (enabled, file, route, target) => {
    let result;
    expect(() => buildI18nFixture({
      enabled,
      configure(dir) {
        appendFixture(dir, file, `<a data-invalid href="${target}?keep=yes#fragment">Missing target</a>`);
      },
      onBuild(build) { result = build; },
    })).toThrow(/broken internal links|internal link/i);
    expect(result.status).not.toBe(0);
    expect(documentAt(result.pages, route).querySelector('[data-invalid]')?.getAttribute('href')).toBe(`${target}?keep=yes#fragment`);
    expect(`${result.stdout}\n${result.stderr}`).toContain(target);
  });
});


describe('i18n templates without output', () => {
  it('builds with permalink: false and does not emit the disabled page', () => {
    const pages = buildI18nFixture({
      configure(dir) {
        fs.writeFileSync(
          path.join(dir, 'src/disabled-output.njk'),
          '---\npermalink: false\n---\nNo output for this template.\n',
        );
      },
    });
    expect(pages.has('/zh/posts/paired/')).toBe(true);
    expect([...pages.keys()].some((url) => url.includes('disabled-output'))).toBe(false);
  });
});
