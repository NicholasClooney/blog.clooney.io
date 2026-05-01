---
name: post and note workflow
description: Follow the editorial workflow for creating, editing, or publishing content in posts/ or notes/ on blog.clooney.io. Use when the task involves a new post, a new note, or published writing that should ship with a matching timeline entry.
---

Use this workflow for editorial work in `posts/` and `notes/`.

## Rules

- When creating or publishing a new item in `posts/` or `notes/`, also create a matching timeline entry in `timeline/`.
- Treat the timeline entry as part of the same editorial task, not an optional follow-up.
- Use timeline status `published` for blog posts, notes, essays, and other writing that is being published.
- If the content already has a timeline entry, update it only if the relationship or metadata is wrong. Do not create duplicates.
- Every post and note body must include `[[toc]]` before the first section heading.

## Workflow

1. Decide whether the content belongs in `posts/` or `notes/`.
2. Use `.claude/skills/frontmatter-editing/SKILL.md` to get the correct front matter template for the content type before editing the file.
3. Edit the content file and its front matter.
   - Add `[[toc]]` before the first section heading in every post and note.
4. If the task creates or publishes the content, create or update the matching timeline entry in the same turn.
5. Use `.claude/skills/timeline-entry/SKILL.md` for timeline file naming, timestamp rules, front matter, body style, and topic-tag carryover.
6. Before finishing, verify that the content and timeline entry agree on title, URL path, and topic context.
