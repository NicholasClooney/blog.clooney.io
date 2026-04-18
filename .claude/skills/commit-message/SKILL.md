---
name: commit message
description: Write commit messages for blog.clooney.io using its conventional prefix format.
---

## Format

```
{prefix}: {short description}
```

Lowercase, no period. Description is imperative mood ("add", "fix", "update") and specific enough to identify the change without reading the diff.

## Prefixes

| Prefix | Use when |
|---|---|
| `blog:` | Adding, editing, or publishing a long-form post in `posts/` |
| `note:` | Adding, editing, or publishing a short note in `notes/` |
| `draft:` | Adding or editing unpublished writing (still in `drafts/`) |
| `timeline:` | Adding or updating timeline entries in `timeline/` |
| `skill:` | Adding or updating a Claude skill or editorial workflow under `.claude/skills/` |
| `project:` | Adding or updating a project listing |
| `asset:` | Adding images, videos, or other media assets |
| `fix:` | Correcting a bug, broken link, escaping issue, or content error |
| `docs:` | Adding or updating documentation files (README, CLAUDE.md, agent instructions) |
| `chore:` | Housekeeping with no content or functional change: tags, metadata, LFS config, social status, sharing dates, folder structure |

## Timeline entries

Use `timeline: add entry for {thing}` when adding a new entry. Use `timeline: update {what}` when editing existing entries.

```
timeline: add entry for subspace v1.26.0
timeline: update entries
timeline: add entries for Apr 12-14 activity
```

## Examples

```
blog: add macOS DNS resolution quirks
blog: publish tailscale workflow
blog: revise zig toolchain post
note: add smart AI token consumption
note: publish WebRTC
draft: add project dawn AI-assisted iOS devlog
timeline: add entry for git-activity
skill: add date/time quote requirement to timeline-entry
project: add private ingress engine template
asset: add project dawn AI assets
fix: add missing prefix to blog title
fix: correct all timeline entries
docs: add agent instructions for blog.clooney.io
chore: update posts' shared dates
chore: move images into their own folders
chore: track *.jpg in LFS
```

## Checklist

- Prefix matches the primary nature of the change
- Description is imperative, lowercase, no period
- Specific enough to identify the change (not "update blog" or "minor edits")
- For multi-file commits touching unrelated things, use the prefix of the dominant change
