---
title: "Subspace Builder v1.42: Eleven Themes, Share Cards, and a New Logo"
date: 2026-11-16
time: "21:30"
draft: true
tags:
  - eleventy
  - release
  - design
  - web-development
excerpt: |
  The biggest Subspace Builder release so far. Eleven themes with a reader picker and a Fun mode, share cards that build themselves, a new logo, sample content you can switch off, and a setup skill for coding agents.
---

<!--
DRAFT. Publish checklist:
- Wait for v1.42.0 to be tagged; link the release in the intro.
- zh version under zh/posts/, timeline entry (published), and confirm the series position.
- Re-take the screenshots if the picker or previews change before release.
-->

<style>
.sb-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:1.6rem 0;}
.sb-grid-3{grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;}
.sb-grid-4{grid-template-columns:repeat(4,minmax(0,1fr));gap:.65rem;}
.sb-pairs{grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem 1rem;}
.sb-phones{grid-template-columns:repeat(2,minmax(0,220px));justify-content:center;}
.sb-figure{min-width:0;margin:1.5rem 0;}
.sb-grid .sb-figure{margin:0;}
.sb-figure img{box-sizing:border-box;display:block;width:100%;height:auto;border:1px solid var(--rule,currentColor);border-radius:3px;}
.sb-figure figcaption{margin-top:.5rem;font-size:.85rem;line-height:1.5;text-align:center;}
.sb-grid-4 figcaption,.sb-pairs figcaption{font-size:.75rem;}
.sb-logo{padding:1.5rem;border-radius:6px;border:1px solid var(--rule,currentColor);}
.sb-logo img{border:0;border-radius:0;}
.sb-logo-light{background:#fbf8f1;}
.sb-logo-dark{background:#0d1117;}
.sb-marks{grid-template-columns:repeat(2,minmax(0,160px));justify-content:center;}
@media(max-width:600px){.sb-grid,.sb-grid-3{grid-template-columns:1fr;}.sb-grid-4,.sb-pairs{grid-template-columns:repeat(2,minmax(0,1fr));}.sb-phones{grid-template-columns:repeat(2,minmax(0,1fr));}}
</style>

[Subspace Builder](https://github.com/TheClooneyCollection/11ty-subspace-builder) v1.42.0 is the biggest release it has had. Fifty-odd commits landed since v1.41.0, and most of them are about how a site looks: eleven themes with a picker for readers, share cards that build themselves, and a logo the project never had. Under that there are two quieter changes for anyone running their own copy: sample content you can switch off, and a setup skill that walks a coding agent through starting a site and keeping it current.

[[toc]]

## Eleven themes

I wrote about how these themes came to be in [The Blog Themes I Would Never Have Built](/posts/the-blog-themes-i-would-never-have-built/), so I won't retell that here. This is what you get when you start a site from the Builder.

Ten skins ship in the picker, and Liquid Glass dark has a second palette, so readers get eleven options:

<div class="sb-grid sb-grid-4">
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-paper-light.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-paper-light.webp" alt="The Builder demo in Warm Paper" loading="lazy" /></a><figcaption>Warm Paper</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-swiss-light.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-swiss-light.webp" alt="The Builder demo in Swiss" loading="lazy" /></a><figcaption>Swiss</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-brutalist-light.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-brutalist-light.webp" alt="The Builder demo in Brutalist" loading="lazy" /></a><figcaption>Brutalist</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-zine-light.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-zine-light.webp" alt="The Builder demo in Zine" loading="lazy" /></a><figcaption>Zine</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-glass-light.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-glass-light.webp" alt="The Builder demo in Soft Glass" loading="lazy" /></a><figcaption>Soft Glass</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-liquid-glass-light-light.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-liquid-glass-light-light.webp" alt="The Builder demo in Liquid Glass light" loading="lazy" /></a><figcaption>Liquid Glass light</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-liquid-glass-dark-dark.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-liquid-glass-dark-dark.webp" alt="The Builder demo in Liquid Glass dark, Aurora palette" loading="lazy" /></a><figcaption>Liquid Glass dark, Aurora</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-liquid-glass-dark-indigo.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-liquid-glass-dark-indigo.webp" alt="The Builder demo in Liquid Glass dark, Indigo palette" loading="lazy" /></a><figcaption>Liquid Glass dark, Indigo</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-starship-light.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-starship-light.webp" alt="The Builder demo in Starship" loading="lazy" /></a><figcaption>Starship</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-retro-futurist-light.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-retro-futurist-light.webp" alt="The Builder demo in Retro sci-fi" loading="lazy" /></a><figcaption>Retro sci-fi</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/theme-holo-dark.webp"><img src="/assets/images/posts/subspace-builder-v1-42/theme-holo-dark.webp" alt="The Builder demo in Halo" loading="lazy" /></a><figcaption>Halo</figcaption></figure>
</div>

Seven of them come in both light and dark, and follow the reader's system setting unless they pick a mode. Liquid Glass light, the two Liquid Glass dark palettes and Halo are made for one scheme only.

<div class="sb-grid sb-pairs">
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-paper-light.webp" alt="Warm Paper, light" loading="lazy" /><figcaption>Warm Paper, light</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-paper-dark.webp" alt="Warm Paper, dark" loading="lazy" /><figcaption>Warm Paper, dark</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-swiss-light.webp" alt="Swiss, light" loading="lazy" /><figcaption>Swiss, light</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-swiss-dark.webp" alt="Swiss, dark" loading="lazy" /><figcaption>Swiss, dark</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-brutalist-light.webp" alt="Brutalist, light" loading="lazy" /><figcaption>Brutalist, light</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-brutalist-dark.webp" alt="Brutalist, dark" loading="lazy" /><figcaption>Brutalist, dark</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-zine-light.webp" alt="Zine, light" loading="lazy" /><figcaption>Zine, light</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-zine-dark.webp" alt="Zine, dark" loading="lazy" /><figcaption>Zine, dark</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-glass-light.webp" alt="Soft Glass, light" loading="lazy" /><figcaption>Soft Glass, light</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-glass-dark.webp" alt="Soft Glass, dark" loading="lazy" /><figcaption>Soft Glass, dark</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-starship-light.webp" alt="Starship, light" loading="lazy" /><figcaption>Starship, light</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-starship-dark.webp" alt="Starship, dark" loading="lazy" /><figcaption>Starship, dark</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-retro-futurist-light.webp" alt="Retro sci-fi, light" loading="lazy" /><figcaption>Retro sci-fi, light</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/theme-retro-futurist-dark.webp" alt="Retro sci-fi, dark" loading="lazy" /><figcaption>Retro sci-fi, dark</figcaption></figure>
</div>

Every theme is a set of tokens (colours, fonts, radius) plus an optional stylesheet over the same pages. Only the active theme's CSS loads, and adding your own skin is an entry in `_data/themes.yaml`. [The theme system doc](https://github.com/TheClooneyCollection/11ty-subspace-builder/blob/main/docs/theme-system.md) has the details.

### The picker

The theme name in the header opens the picker. Tapping a card switches to it straight away. The sun, moon and half-circle buttons beside it pick light, dark or auto. "Use site default" clears a reader's own choice and hands the page back to the site's setting.

<div class="sb-grid">
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/picker-desktop-light.webp"><img src="/assets/images/posts/subspace-builder-v1-42/picker-desktop-light.webp" alt="The theme picker open on the Builder demo, light mode" loading="lazy" /></a><figcaption>The picker in light mode</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/picker-desktop-dark.webp"><img src="/assets/images/posts/subspace-builder-v1-42/picker-desktop-dark.webp" alt="The theme picker open on the Builder demo, dark mode" loading="lazy" /></a><figcaption>The picker in dark mode</figcaption></figure>
</div>

On a phone it becomes a single column you scroll through:

<div class="sb-grid sb-phones">
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/picker-phone-light.webp"><img src="/assets/images/posts/subspace-builder-v1-42/picker-phone-light.webp" alt="The theme picker on a phone, light mode" loading="lazy" /></a><figcaption>Phone, light</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/picker-phone-dark.webp"><img src="/assets/images/posts/subspace-builder-v1-42/picker-phone-dark.webp" alt="The theme picker on a phone, dark mode" loading="lazy" /></a><figcaption>Phone, dark</figcaption></figure>
</div>

Switching crossfades the page, with a short blur at the midpoint. Readers who ask for reduced motion skip it.

### Fun or Simple

A site picks how a first-time visitor's theme is chosen. **Fun**, the Builder default, rolls one theme for weekdays and one for weekends the first time someone visits, and keeps both in their browser. The day decides which one they see. Here is the same new visitor on a Tuesday and then on a Saturday:

<div class="sb-grid">
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/fun-weekday.webp"><img src="/assets/images/posts/subspace-builder-v1-42/fun-weekday.webp" alt="Fun mode on a Tuesday rolled Starship" loading="lazy" /></a><figcaption>Tuesday: Starship</figcaption></figure>
<figure class="sb-figure"><a href="/assets/images/posts/subspace-builder-v1-42/fun-weekend.webp"><img src="/assets/images/posts/subspace-builder-v1-42/fun-weekend.webp" alt="Fun mode on a Saturday rolled Zine" loading="lazy" /></a><figcaption>Saturday: Zine</figcaption></figure>
</div>

The weekday pool is Soft Glass, Liquid Glass, Starship and Halo; the weekend pool is Zine, Retro sci-fi and Brutalist. You can set your own pools:

```yaml
# _data/site.yaml
theme:
  defaultStrategy: fun
  defaultMode: auto
  weekdayThemes: [glass, liquid-glass-dark, starship, holo]
  weekendThemes: [zine, retro-futurist, brutalist]
```

**Simple** gives every new visitor one theme:

```yaml
theme:
  defaultStrategy: simple
  defaultId: paper
  defaultMode: auto
```

Either way, a theme the reader picks themselves wins. The crossfade has two settings too: `fadeDuration` (0.7s) and `fadeBlur` (8px, or `0px` for none).

## Share cards that build themselves

A theme can follow the reader. A share card can't: it is rendered once at build time and shown to people who have never visited. So a site picks one card style, and every post, note, timeline entry and page gets a 1200 by 630 card in it, cached until its content changes.

There are eight styles. Here is the same post in each:

<div class="sb-grid sb-grid-4">
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-post-retro.webp" alt="Share card, Retro style" loading="lazy" /><figcaption><code>retro</code> (default)</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-post-retro-dark.webp" alt="Share card, Retro dark style" loading="lazy" /><figcaption><code>retro-dark</code></figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-post-swiss.webp" alt="Share card, Swiss style" loading="lazy" /><figcaption><code>swiss</code></figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-post-swiss-dark.webp" alt="Share card, Swiss dark style" loading="lazy" /><figcaption><code>swiss-dark</code></figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-post-glass-dark.webp" alt="Share card, Glass dark style" loading="lazy" /><figcaption><code>glass-dark</code></figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-post-glass-light-b.webp" alt="Share card, Glass light B style" loading="lazy" /><figcaption><code>glass-light-b</code></figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-post-glass-light-c.webp" alt="Share card, Glass light C style" loading="lazy" /><figcaption><code>glass-light-c</code></figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-post-classic.webp" alt="Share card, Classic style" loading="lazy" /><figcaption><code>classic</code> (the old card)</figcaption></figure>
</div>

Within a style, the card changes with what it is for: a Chinese post gets Chinese labels and dates, a series entry shows its place in the series, a timeline entry shows its status, and a page shows its description.

<div class="sb-grid sb-grid-4">
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-zh-retro.webp" alt="Retro card for a Chinese series post" loading="lazy" /><figcaption>Chinese post</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-series-retro.webp" alt="Retro card for a series entry" loading="lazy" /><figcaption>Series entry</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-timeline-retro.webp" alt="Retro card for a timeline entry" loading="lazy" /><figcaption>Timeline entry</figcaption></figure>
<figure class="sb-figure"><img src="/assets/images/posts/subspace-builder-v1-42/card-page-retro.webp" alt="Retro card for a page" loading="lazy" /><figcaption>Page</figcaption></figure>
</div>

Pick one with `ogImage.style` in `_data/site.yaml`, or override it for a single page with `ogStyle` in its front matter. In a development build, a draft page shows every style side by side, which is where these images came from.

## A logo

Subspace Builder never had a logo. Now it has a planet with a tilted, engraved ring: amber on a light background, and a lighter gold on a dark one. The drawing is simplified so it reads at every size, down to a 16-pixel favicon.

<div class="sb-grid">
<figure class="sb-figure"><div class="sb-logo sb-logo-light"><img src="/assets/images/posts/subspace-builder-v1-42/logo-lockup-light.webp" alt="Subspace Builder logo for light backgrounds" loading="lazy" /></div><figcaption>On light</figcaption></figure>
<figure class="sb-figure"><div class="sb-logo sb-logo-dark"><img src="/assets/images/posts/subspace-builder-v1-42/logo-lockup-dark.webp" alt="Subspace Builder logo for dark backgrounds" loading="lazy" /></div><figcaption>On dark</figcaption></figure>
</div>

<div class="sb-grid sb-marks">
<figure class="sb-figure"><div class="sb-logo sb-logo-light"><img src="/assets/images/posts/subspace-builder-v1-42/logo-mark-light.webp" alt="The Subspace Builder mark on light" loading="lazy" /></div></figure>
<figure class="sb-figure"><div class="sb-logo sb-logo-dark"><img src="/assets/images/posts/subspace-builder-v1-42/logo-mark-dark.webp" alt="The Subspace Builder mark on dark" loading="lazy" /></div></figure>
</div>

It heads the new README, and the Builder's own pages now use it as their favicon.

<!-- TODO: a few lines on how it was picked in the design lab (directions, finalists, the simplified drawing), plus a finalists screenshot if it adds something. -->

## Sample content you can switch off

The Builder ships with sample posts, notes and timeline entries so a fresh copy has something to show. Until now, the only way to get rid of them was to delete them, and deleted files conflict with every later update from upstream.

Now they live in `posts/samples/`, `notes/samples/` and `timeline/samples/`, and one line hides them all:

```yaml
# _data/site.yaml
sampleContent: false
```

They stay in the repo, so updates rebase cleanly, and their URLs don't change while they're on. `npm run starter:reset` still exists, but only for clearing the starter's personal details on a fresh fork.

## A setup skill for coding agents

The Builder now includes a `subspace-setup` skill, readable by both Claude Code and Codex. Ask your agent to use it, and it walks through:

1. Cloning the Builder and keeping it as `upstream`.
2. Setting the site's title, URL and author.
3. Choosing a theme strategy and card style, after showing you both in the running site, and turning off the samples.
4. Deploying to Cloudflare Pages, then checking that images aren't LFS pointers and that share cards come back as PNGs.
5. Updating to a newer Builder later.

Each step ends with a check it has to pass before moving on, and every setting it touches points back to the configuration reference instead of guessing names.

## Upgrading an existing site

If your site sits on top of the Builder's history, an update replays your commits onto the new release:

```sh
git fetch upstream
git tag backup/main-$(date +%F) && git push origin backup/main-$(date +%F)
git rebase upstream/main
npm test && npm run build
git lfs push origin main
git push --force-with-lease=main:<old origin/main hash> origin main
```

In a conflict, keep your own files (README, `_data/`, content) and take the Builder's code. A few things change on the way to v1.42:

- **Themes.** The old themes are hidden and readers' saved choices move to their closest new one, for example Sun and Mint to Warm Paper, Default to Swiss, and Midnight to Liquid Glass dark. New visitors get Fun mode; set `defaultStrategy: simple` and a `defaultId` to keep one theme for everyone.
- **Share cards.** The default card is now Retro. Set `ogImage.style: classic` to keep the old one.
- **Samples.** If you deleted the samples before, set `sampleContent: false` and let the rebase bring the files back.
- **Node.** Use Node 20 or newer, locally and on your host.

<!-- TODO: link the v1.42.0 release notes and the README once the release is out. -->
