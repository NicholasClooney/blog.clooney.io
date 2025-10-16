---
draft: true

title: Building a Post Share Tracker CLI
date: 2025-10-16
eleventyNavigation:
  key: post-share-tracker
---

For the past few weeks I’ve been noodling on a problem every blogger eventually runs into: keeping track of which posts have been shared, on which channels, and when. I wanted something lightweight—no dashboards, no spreadsheets, just a terminal tool that could live alongside my Eleventy blog.

That goal turned into the “Post Share Tracker,” an Ink-based CLI that reads front matter, highlights matches in real time, and lets me update status fields without leaving the keyboard. This post walks through how it came together, what the architecture looks like, and why the surrounding tooling (tests, docs, structure) mattered just as much as the UI.

[[toc]]

## The Trigger: Losing Track of Shares

My site publishes posts with YAML front matter and a `social` section much like:

```yaml
social:
  twitter:
    status: shared
    lastShared: 2024-05-19T08:12:33.000Z
```

After a handful of posts, I kept opening files manually just to see whether something had been queued, drafted, or published. That friction was enough to derail my “share it everywhere” habit. I needed one view to show the current state of every post, offer quick filtering, and allow updating the status without opening a text editor.

## Choosing Ink and Vitest

I reached for [Ink](https://github.com/vadimdemedes/ink) because I wanted a UI that felt familiar to React, but still ran in the terminal. Ink makes it easy to compose components, manage state, and respond to keyboard input. The rest of the stack stayed close to what the site already used:

- **TypeScript** for type safety and editor tooling.
- **Vitest** for tests, matching the broader project’s testing story.
- **globby + gray-matter** to scan posts and parse front matter.
- **yaml** for writing structured updates back to disk.

By aligning with the existing tooling, I avoided new dependencies in the main repo and ensured the tracker could be npm-installed and run by anyone already working on the site.

## Designing the Experience

The flow crystallized quickly:

1. **Load posts** from the Eleventy content directory and normalise the metadata.
2. **Display a master table** showing each post and the status for every social channel.
3. **Allow filtering** by typing, with highlighted matches to improve scanning.
4. **Drill down**: select a post → choose a channel → set a status (draft, queued, shared).
5. **Auto-timestamp** when a status flips to `shared`, unless a specific date is provided.
6. **Write back to the Markdown file** while preserving channel ordering and existing notes.

Keyboard controls were inspired by Vim/TUI apps: use `j`/`k` or arrows to move, `enter` to select, `esc` to back out or clear filters. Keeping it minimal meant no mouse, no nested menus, just a guided funnel through each decision.

## Organising the Code

Early iterations lived in a single `src/index.tsx` file. That made sense while prototyping but quickly felt unwieldy. Once behaviour was covered by tests, I refactored everything into smaller modules.

### Top-Level Layout

```
src/
  app/               # App state, view orchestration
  components/        # Reusable Ink components
  config/            # YAML parsing utilities
  posts/             # Rendering helpers for post labels
  social/            # Status formatting & activity summaries
  utils/             # Shared helpers (time, etc.)
```

Each folder now has its own `README.md` summarising purpose and file-level responsibilities. Those docs doubled as a checklist whenever I touched code—if a module changed, its README needed an update.

### The App Layer

`App.tsx` handles:
- Loading posts (`loadPosts.ts`) and exposing them to the UI.
- Managing filters, selection state, and status messages.
- Delegating render work to `PostSelectionView`, `ChannelSelectionView`, and `StatusSelectionView`.
- Triggering `savePostSocial` to persist changes and reload data on completion.

The separation into view components ensured each mode stayed digestible. `SelectableList` became the shared list component, while `HighlightedText` handled token-based highlighting.

### Configuration Loading

Moving config parsing into dedicated files simplified reuse:

- `config/config.ts` is now a thin façade that caches the YAML content.
- `config/duration.ts` parses strings like `4 weeks`.
- `config/validation.ts` guards against misconfigured channels or recency bands.
- `config/paths.ts` keeps file resolution stable (and fixed a bug when the directory depth changed).

These helpers improved clarity in the tests and made it easier to reason about error messages.

## Test Coverage From the Start

Writing tests first was a deliberate choice. The CLI touches the filesystem, manipulates YAML, and relies on string matching—plenty of room for regressions. Vitest suites cover:

- **Config parsing** (ensuring invalid units or band ordering explode loudly).
- **Post loading** (parsing front matter, normalising titles, and status hydration).
- **Save logic** (auto timestamps, channel ordering, note preservation).
- **Filtering helpers** (token normalisation, range detection, matching behaviour).

Keeping tests handy meant I could refactor freely. For example, once filtering helpers moved to `src/filtering.ts`, existing tests confirmed the feature still behaved.

## Documentation for Future Contributors

One lesson from past projects: when structure shifts, documentation often lags. To prevent that, each `src/` subfolder now includes a short README with file-level blurbs. There’s also an `AGENTS.md` (a contributor guide) covering:

- Project layout at a glance.
- Required commands (`npm start`, `npm run test`, `npm run build`).
- Naming conventions and formatting preferences.
- Testing expectations.
- Documentation responsibilities (keep the READMEs in sync with code changes).

This ensures anyone—including my future self—can quickly understand the moving parts before diving in.

## Lessons Learned

- **Refactor early, but only after tests**. Once critical behaviours were locked in via Vitest, reshaping the app into smaller modules felt safe.
- **Docs should evolve with the code**. Treating README updates as a first-class task reduced the cognitive load when revisiting modules.
- **Ink keeps TUI development approachable**. Leveraging React patterns in the terminal made building navigation and highlighting logic straightforward.
- **Guardrails around config matter**. Clear error messages and validation help avoid the “why is everything grey?” moment caused by a typo in `config.yaml`.

## What’s Next

I’d like to explore:
- **Bulk updating** statuses (e.g., mark every “draft” post as “queued”).
- **Integration tests** that run through the CLI interactions.

For now, the tracker already saves me time every week. I can pop into the terminal, see an overview of social activity, queue new shares, and move on. If you’re juggling multiple channels, clone the repo, run `npm start`, and see if it helps tame your own post-share chaos.
