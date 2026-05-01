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

## Front matter

Use the repo-local front matter skill at `.claude/skills/frontmatter-editing/SKILL.md` (`/frontmatter-editing` in Claude). It routes to the canonical per-type docs:

- `posts/` -> `.claude/skills/frontmatter-editing/references/posts.md`
- `notes/` -> `.claude/skills/frontmatter-editing/references/notes.md`
- `timeline/` -> `.claude/skills/frontmatter-editing/references/timeline.md`

## Timeline entries

Use the repo-local timeline entry skill at `.claude/skills/timeline-entry/SKILL.md` (`/timeline-entry` in Claude). It covers file naming, front matter, status tags, and workflows from a blog post or GitHub commit.

For post or note publication work, use that skill as part of the same task so the content and its timeline entry ship together.
