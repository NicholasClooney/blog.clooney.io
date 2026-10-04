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

  it('pairs by final URL and falls back to language homes for missing counterparts', () => {
    const paired = documentAt(production, '/posts/paired/');
    expect(hrefs(paired)).toContain('/zh/posts/paired/');
    expect(hrefs(paired)).toContain('/fr/posts/paired/');
    expect(hrefs(paired, '[data-language-switcher] a')).toEqual([
      '/zh/posts/paired/',
      '/fr/posts/paired/',
    ]);
    const only = documentAt(production, '/posts/english-only/');
    expect(hrefs(only, '[data-language-switcher] a')).toEqual(['/zh/', '/fr/']);
    expect(hrefs(documentAt(production, '/timeline/event/'), '[data-language-switcher] a')).toEqual(['/zh/', '/fr/']);
    const translatedOnly = documentAt(production, '/fr/posts/extra-1/');
    expect(hrefs(translatedOnly)).not.toContain('/posts/extra-1/');
    expect(hrefs(translatedOnly, '[data-language-switcher] a')).toEqual(['/', '/zh/posts/extra-1/']);
  });

  it('renders one accessible multi-language menu beside the header theme controls', () => {
    for (const route of ['/posts/paired/', '/zh/posts/paired/', '/timeline/event/']) {
      const doc = documentAt(production, route);
      const switcher = doc.querySelector('[data-language-switcher]');
      expect(doc.querySelectorAll('[data-language-switcher]')).toHaveLength(1);
      const headerControls = doc.querySelector('#nav-toggle').parentElement;
      expect(headerControls.contains(switcher)).toBe(true);
      expect(headerControls.querySelector('[data-theme-selector]')).not.toBeNull();
      expect(doc.querySelector('main [data-language-switcher]')).toBeNull();
      expect(switcher.querySelector('[data-language-toggle]')).toBeNull();
      const menu = doc.querySelector('details[data-language-menu]');
      expect(menu).not.toBeNull();
      expect(menu.querySelector('summary')?.getAttribute('aria-label')).toBe(route.startsWith('/zh/') ? '语言' : 'Language');
      expect(doc.querySelectorAll('[data-language-switcher] a')).toHaveLength(2);
      expect(switcher.getAttribute('aria-label')).toBe(route.startsWith('/zh/') ? '语言' : 'Language');
      for (const link of switcher.querySelectorAll('a')) {
        const expectedLang = link.getAttribute('href').startsWith('/zh/') ? 'zh-Hans'
          : link.getAttribute('href').startsWith('/fr/') ? 'fr-FR' : 'en';
        expect(link.getAttribute('lang')).toBe(expectedLang);
        expect(link.getAttribute('hreflang')).toBe(expectedLang);
        expect(link.hasAttribute('aria-current')).toBe(false);
      }
    }
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
    for (const [url, html] of omitted) {
      expect(disabled.get(url), url).toBe(html);
      expect(html).not.toContain('data-language-switcher');
    }
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


it('preserves internal AI notice line breaks after trimming and escaping', () => {
  const pages = buildI18nFixture({
    configure(dir) {
      setTranslatedBy(dir, 'zh/posts/paired.md', 'ai');
      editFixtureYaml(dir, '_data/locales/zh.yaml', (data) => {
        data.ui.shared.translationNotice = {
          ai: {
            message: '  First <em>AI</em> sentence.\nLast <script>alert(1)</script> & sentence.\n',
          },
        };
      });
    },
  });
  const notice = documentAt(pages, '/zh/posts/paired/').querySelector('[data-translation-notice]');
  const paragraph = notice.querySelector('p');
  const original = paragraph.querySelector('[data-translation-original]');
  expect(paragraph.querySelectorAll('br')).toHaveLength(1);
  expect(paragraph.querySelector('em, script')).toBeNull();
  const nodes = [...paragraph.childNodes];
  const lineBreak = nodes.findIndex((node) => node.nodeName === 'BR');
  expect(nodes.slice(0, lineBreak).map((node) => node.textContent).join('')).toBe('First <em>AI</em> sentence.');
  expect(nodes.slice(lineBreak + 1, nodes.indexOf(original)).map((node) => node.textContent).join('')).toBe('Last <script>alert(1)</script> & sentence. ');
  expect(original.previousSibling.nodeType).toBe(3);
  expect(paragraph.lastChild).toBe(original);
  expect(original.getAttribute('href')).toBe('/posts/paired/');
});


describe('two-language header toggle', () => {
  it('links directly to the other language with short labels and home fallback', () => {
    const pages = buildI18nFixture({
      configure(dir) {
        fs.rmSync(path.join(dir, 'fr'), { recursive: true });
        editFixtureYaml(dir, '_data/site.yaml', (data) => {
          data.i18n.languages = [
            { code: 'en', label: 'English', htmlLang: 'en' },
            { code: 'zh', label: '简体中文', shortLabel: '中', htmlLang: 'zh-Hans' },
          ];
        });
      },
    });
    for (const [route, target, label, language, ariaLabel] of [
      ['/posts/paired/', '/zh/posts/paired/', '中', 'zh-Hans', 'Language'],
      ['/zh/posts/paired/', '/posts/paired/', 'English', 'en', '语言'],
      ['/posts/english-only/', '/zh/', '中', 'zh-Hans', 'Language'],
      ['/timeline/event/', '/zh/', '中', 'zh-Hans', 'Language'],
      ['/zh/posts/extra-1/', '/', 'English', 'en', '语言'],
    ]) {
      const doc = documentAt(pages, route);
      const toggle = doc.querySelector('a[data-language-toggle]');
      expect(toggle, route).not.toBeNull();
      expect(doc.querySelectorAll('[data-language-switcher] a')).toHaveLength(1);
      expect(doc.querySelector('[data-language-menu]')).toBeNull();
      expect(doc.querySelector('#nav-toggle').parentElement.contains(toggle)).toBe(true);
      expect(toggle.getAttribute('href')).toBe(target);
      expect(toggle.textContent.trim()).toBe(label);
      expect(toggle.getAttribute('lang')).toBe(language);
      expect(toggle.getAttribute('hreflang')).toBe(language);
      expect(toggle.getAttribute('aria-label')).toBe(`${ariaLabel}: ${language === 'en' ? 'English' : '简体中文'}`);
      expect(doc.querySelector('[data-language-switcher]').getAttribute('aria-label')).toBe(ariaLabel);
      expect(pages.has(target)).toBe(true);
    }
  });
});
