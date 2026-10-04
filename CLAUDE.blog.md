# Blog Editorial Workflows

Read this file when doing any editorial work on blog.clooney.io. Also read `CLAUDE.subspace.md` for technical conventions.

## Content types

- `posts/` — long-form writing
- `notes/` — short observations
- `timeline/` — captain's log: shipped, published, wip, idea, thinking

## Git workflow

For editorial edits limited to `posts/`, `notes/`, or `timeline/`, work directly on `main` by default. Use a feature branch only if the user asks.

Use the repo-local commit message skill at `.claude/skills/commit-message/SKILL.md` (`/commit-message` in Claude). It documents the conventional prefix format used across this repo.

## Post and note workflow

Use the repo-local workflow skill at `.claude/skills/post-and-note-workflow/SKILL.md` (`/post-and-note-workflow` in Claude). It makes the timeline-entry requirement explicit for new and published writing in `posts/` and `notes/`.
Posts and notes must include `[[toc]]` in the body before the first section heading.
Every new post or note must be added to a series in `_data/series.yaml` (see `.claude/skills/series/SKILL.md`).
Posts and notes must include a quoted `time` field in front matter using `HH:MM` so same-day items sort deterministically.

## Front matter

Use the repo-local front matter skill at `.claude/skills/frontmatter-editing/SKILL.md` (`/frontmatter-editing` in Claude). It routes to the canonical per-type docs:

- `posts/` -> `.claude/skills/frontmatter-editing/references/posts.md`
- `notes/` -> `.claude/skills/frontmatter-editing/references/notes.md`
- `timeline/` -> `.claude/skills/frontmatter-editing/references/timeline.md`

## Dev server

Use the repo-local dev server skill at `.claude/skills/dev-server/SKILL.md` (`/dev-server` in Claude). It covers running `npm run dev` and exposing it over Tailscale on the matching port.

## Timeline entries

Use the repo-local timeline entry skill at `.claude/skills/timeline-entry/SKILL.md` (`/timeline-entry` in Claude). It covers file naming, front matter, status tags, and workflows from a blog post or GitHub commit.

For post or note publication work, use that skill as part of the same task so the content and its timeline entry ship together.

## Chinese (zh) version

The site is bilingual: English at the existing URLs, Simplified Chinese under `/zh/`.

- Every published post and note exists in both languages, with the same slug: `posts/**/<slug>.md` pairs with `zh/posts/<slug>.md`, and `notes/<slug>.md` with `zh/notes/<slug>.md`. The builder contract is in `docs/feature-i18n.md`.
- A new post or note ships with its Chinese version in the same change. Never publish one language alone.
- Every edit is kept in sync. When you change one language (text, title, excerpt, date/time, tags, images, links), make the matching change in the other language in the same commit.
- Chinese front matter: title, date, time, tags (same English slugs), optional excerpt. Do not set lang, permalink, layout or the posts/notes tags. Chinese translations are AI translations and show the AI-translation notice by default (`i18n.translationNotice.default: ai`).
- Translation style: natural Simplified Chinese in the author's voice. Keep "agent" in English (子 agent, 主 agent, 派生 agent), and keep code, commands, paths, URLs and product names unchanged. Put a space between Chinese and English. Don't use "——". Internal links to posts and notes point to their `/zh/` versions; timeline links stay English.
- Timeline entries are intentionally not translated. The Chinese site shows them in their original English. Do not create Chinese versions of timeline entries unless the user explicitly asks.
- Drafts (`draft: true`) don't need a Chinese version until they are published.
