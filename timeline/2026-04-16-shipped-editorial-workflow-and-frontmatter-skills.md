---
title: "skill: Editorial workflow and frontmatter skills"
date: "2026-04-16"
time: "21:34"
tags:
  - shipped
  - workflow
  - skills
  - editorial
  - documentation
---

I split the blog editing rules into repo-local skills in [22c4d7d](https://github.com/NicholasClooney/blog.clooney.io/commit/22c4d7d). [`post-and-note-workflow`](https://github.com/NicholasClooney/blog.clooney.io/blob/main/.claude/skills/post-and-note-workflow/SKILL.md) now makes the timeline-entry rule explicit, while [`frontmatter-editing`](https://github.com/NicholasClooney/blog.clooney.io/blob/main/.claude/skills/frontmatter-editing/SKILL.md) routes `posts/`, `notes/`, and `timeline/` to canonical front matter docs instead of burying that guidance in `CLAUDE.blog.md`. I also cleaned up [`timeline-entry`](https://github.com/NicholasClooney/blog.clooney.io/blob/main/.claude/skills/timeline-entry/SKILL.md) so its tag guidance matches the repo defaults.
