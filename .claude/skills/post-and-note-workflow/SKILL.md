---
name: post and note workflow
description: Follow the editorial workflow for creating, editing, or publishing content in posts/ or notes/ on blog.clooney.io. Use when the task involves a new post, a new note, or published writing that should ship with a matching timeline entry, or when the user gives a blog idea to stub out ("blog idea, no writing").
---

Use this workflow for editorial work in `posts/` and `notes/`.

## Rules

- Every post and note is bilingual. Create or update its Simplified Chinese counterpart under `zh/posts/` or `zh/notes/` (same slug) in the same change, following the "Chinese (zh) version" section of `CLAUDE.blog.md`. Timeline entries stay English only.

- When creating or publishing a new item in `posts/` or `notes/`, also create a matching timeline entry in `timeline/`.
- Treat the timeline entry as part of the same editorial task, not an optional follow-up.
- Use timeline status `published` for blog posts, notes, essays, and other writing that is being published.
- If the content already has a timeline entry, update it only if the relationship or metadata is wrong. Do not create duplicates.
- Every post and note body must include `[[toc]]` before the first section heading.
- Always add every new post or note to a series in `_data/series.yaml`, using `.claude/skills/series/SKILL.md`. Pick the best-fitting existing series; if none fits, propose a new one to the user rather than skipping this step.

## Workflow

1. Decide whether the content belongs in `posts/` or `notes/`.
2. Use `.claude/skills/frontmatter-editing/SKILL.md` to get the correct front matter template for the content type before editing the file.
3. Edit the content file and its front matter.
   - Add `[[toc]]` before the first section heading in every post and note.
4. If the task creates or publishes the content, create or update the matching timeline entry in the same turn.
5. Add the content to a series in `_data/series.yaml` (see `.claude/skills/series/SKILL.md`).
6. Use `.claude/skills/timeline-entry/SKILL.md` for timeline file naming, timestamp rules, front matter, body style, and topic-tag carryover.
7. Create or update the Chinese counterpart (`zh/posts/<slug>.md` or `zh/notes/<slug>.md`) so both languages match.
8. Before finishing, verify that the English and Chinese versions, the series entry and the timeline entry agree on title, URL path and topic context.

## Idea stub and fact gathering

For a "blog idea, no writing":

1. Stub it in `posts/` (or `notes/` if asked): `draft: true`, a `TODO:` title, the gist as bullets, no prose. Skip zh, the series entry and the timeline entry until publish; a draft listed in `_data/series.yaml` fails the production build. Commit locally on main; no side branch unless the user asks.
2. Don't push without the user's yes via main: drafts still build in production (only hidden from listings), so a push makes the URL live.
3. Ask the other project's secondary for facts, as in agent-chain's "Working across projects". Facts only, no drafting.
4. Save them to `.temp/<slug>/facts.md` (gitignored). Start it with a caution header naming what must stay out of the post: bypass specifics, personal location, hostnames, IPs, Tailscale names, personal paths, private repo names.
5. Done when a privacy grep of the facts is clean and main has the stub path, commit state and a short fact summary.
