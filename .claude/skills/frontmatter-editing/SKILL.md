---
name: frontmatter editing
description: Edit front matter for blog.clooney.io editorial content. Use when adding or correcting front matter in posts/, notes/, or timeline/, then read the matching reference doc for the content type.
---

Use this skill when changing front matter in `posts/`, `notes/`, or `timeline/`.

## Choose the right reference

- `posts/` -> `references/posts.md`
- `notes/` -> `references/notes.md`
- `timeline/` -> `references/timeline.md`

Read only the matching reference unless the task spans multiple content types.

## Shared rules

- Keep front matter minimal and explicit.
- Use topic tags in the file front matter. Collection tags come from the directory data files unless a file explicitly overrides them.
- Prefer `excerpt` when you need tighter control over listings, feeds, or cards.
- If the task also creates or updates a timeline entry for published writing, use `.claude/skills/timeline-entry/SKILL.md` alongside this skill.
