# Blog Editorial Workflows

Read this file when doing any editorial work on blog.clooney.io. Also read `CLAUDE.subspace.md` for technical conventions.

## Content types

- `posts/` — long-form writing
- `notes/` — short observations
- `timeline/` — captain's log: shipped, published, wip, idea, thinking

## Git workflow

For editorial edits limited to `posts/`, `notes/`, or `timeline/`, work directly on `main` by default. Use a feature branch only if the user asks.

## Timeline entries

Use the repo-local timeline entry skill at `.claude/skills/timeline-entry/SKILL.md` (`/timeline-entry` in Claude). It covers file naming, front matter, status tags, and workflows from a blog post or GitHub commit.
