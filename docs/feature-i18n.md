# Multi-language content

Multi-language support is opt-in. Existing sites keep their current URLs and
rendered output when it is disabled. The default language stays at unprefixed
URLs; translations live under their configured language code.

## Enable languages

Add this to `_data/site.yaml`:

```yaml
i18n:
  enabled: true
  defaultLanguage: en
  languages:
    - code: en
      label: English
      htmlLang: en
    - code: zh
      label: 简体中文
      htmlLang: zh-Hans
    - code: fr
      label: Français
      htmlLang: fr-FR
```

`code` selects the content directory and URL prefix. `label` is the language
switcher label. `htmlLang` sets the HTML language attribute; it can be more
specific than the directory code. Include the default language in `languages`.
Language codes must be unique URL-safe identifiers, such as `fr` or `pt-BR`.
Omit `i18n` or set `enabled: false` to keep the feature off. Configured secondary
language directories remain dormant while it is off.

## Add translations

| Original URL             | Translation file             | Translation URL             |
| ------------------------ | ---------------------------- | --------------------------- |
| `/posts/example/`        | `zh/posts/example.md`        | `/zh/posts/example/`        |
| `/notes/example/`        | `zh/notes/example.md`        | `/zh/notes/example/`        |
| `/notes/hidden/example/` | `zh/notes/hidden/example.md` | `/zh/notes/hidden/example/` |

Use the same slug as the original. Pairing uses the final URL after removing
the language prefix, so an original post can live in a nested source directory.
No translation ID is required.

```yaml
---
title: 中文标题
date: 2026-04-14
tags: [eleventy, writing]
excerpt: 可选的摘要
---
```

Keep the original date and optional `time`, and keep topic tag slugs unchanged.
The builder derives `lang`, `permalink`, `layout`, and the `posts` or `notes`
content tag from the language directory. Do not set those fields yourself.
`draft: true` has the usual meaning: omitted from production collections,
visible in development. A note in `notes/hidden/` is public by URL and appears
in the hidden-notes index, but not in the regular notes index.

Reuse existing assets. Rewrite relative image paths as site-absolute paths to
the original files because translations live in a different source directory.
Timeline entries remain in the default language; do not add translated timeline
source directories.

## Override UI text

Create `_data/locales/<code>.yaml`. All keys are optional:

```yaml
ui:
  shared:
    pagination:
      previous: 上一页
  pages:
    notes:
      heading: 最新笔记
nav:
  blog: 博客
  notes: 笔记
series:
  reading-path:
    title: 阅读顺序
    intro: 按照这个顺序阅读。
site:
  title: 我的博客
  description: 中文介绍
```

`ui` follows `_data/ui.yaml` and is deep-merged over it. Changing one nested
string preserves its siblings and all other default strings. `nav` maps sidebar
item IDs to labels. `series` maps IDs from `_data/series.yaml` to optional `title`
and `intro` overrides; the original entry order stays authoritative. `site`
accepts `title` and `description` overrides. Missing strings fall back to the
site's base data. Keep locale strings in YAML rather than duplicating templates.

## Navigation and collections

A language switcher appears only when the current page has a built counterpart.
An untranslated article has no switcher. Available language versions link to
each other; a missing version never creates a broken link. Section and listing
pages have localized counterparts when enabled.

Localized home/blog, notes, hidden-notes, and tag lists contain only content in
that language. Translations do not enter the default-language lists, tag counts,
or feed. Topic tags link to the corresponding localized archives.

The localized homepage follows `site.home.target` for blog and notes. If the
shared timeline is the default-language homepage, localized homepages show the
translated blog instead; their timeline navigation still links to `/`. The
localized blog also remains available at `/<code>/blog/` in that configuration.

Series preserve the declared entry order and position numbers. Each entry links
to its translation when present, otherwise to the original. Series can therefore
mix translated posts, original posts, and original timeline entries. The sidebar
links to the shared timeline; no translated timeline pages are generated.

## Links to untranslated pages

On a translated page, a link to the same language prefix falls back to the
unprefixed default-language URL when the translated target is missing and the
original exists. For example, `/zh/posts/example/?from=notes#details` becomes
`/posts/example/?from=notes#details`. Query strings and fragments are preserved.
Existing translations and links already pointing to an original stay unchanged.

The build emits a warning identifying the source page, requested translation,
and fallback destination. Rewriting happens before internal-link validation and
updates the published HTML. If neither target exists, the link stays unchanged
and the normal broken-link check fails the build. This fallback only applies to
translated pages while i18n is enabled; it does not repair default-language pages
or links to another translation language.

## AI-translation notice

Add this front matter to a translated post or note to show an AI notice near the
top of the page, with a link to its default-language counterpart:

```yaml
translatedBy: ai
```

By default, `translatedBy: human` or an omitted value shows no notice. To treat
translations with no value as AI translations, add an optional site-wide default
to `_data/site.yaml`:

```yaml
i18n:
  enabled: true
  # Keep your defaultLanguage and languages configuration here.
  translationNotice:
    default: ai
```

A page with `translatedBy: human` opts out even when this default is enabled.
Notices appear only on individual translated posts and notes (including hidden
notes), never on originals or listing pages. If a translation has no built
default-language counterpart, the notice shows its message without an original
link.

The English defaults in `_data/ui.yaml` are `This page was translated by AI.`
and `Read the original`. Override either string in `_data/locales/<code>.yaml`:

```yaml
ui:
  shared:
    translationNotice:
      ai:
        message: 此页面由 AI 翻译。
        originalLink: 阅读原文
```

These values are plain text, not HTML; markup characters are escaped. Omitted
keys retain the base UI strings through the usual deep locale merge.

## Validation

Run `npm run build` before publishing. The usual internal-link validation also
checks localized output. For the isolated multilingual rendering contracts:

```sh
VITEST_SKIP_BUILD=1 npx vitest run test/i18n.test.js
```

See [Testing](./testing.md) for the fixture's scope and the full test workflow.
