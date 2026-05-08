---
name: timeline entry
description: Create a timeline entry for something shipped, published, wip, idea, or thinking.
---

## File naming

```
timeline/YYYY-MM-DD-{status}-{slug}.md
```

## Front matter

```yaml
---
title: "{prefix}: Short title"
date: "YYYY-MM-DD" # required; keep quoted so YAML treats it as a string
time: "HH:MM"      # required; keep quoted, 24-hour format (e.g. "15:42")
parent: "/timeline/YYYY-MM-DD-status-slug/" # optional; quote the canonical timeline path
tags:
  - {status}       # shipped | published | wip | idea | thinking  (exactly one)
  - {topic-tags}   # optional
---
```

Keep `date` and `time` quoted. Unquoted YAML dates are parsed as JavaScript `Date` objects before Eleventy collection sorting runs, which can break within-day ordering. The repo supplies the `timeline` content-type tag via `timeline/timeline.json`, so file-local front matter only needs the status tag plus any topic tags.

`parent` is optional, but when an entry continues an existing feature thread, prefer the thread's established anchor entry rather than the most recent related entry. Before choosing a `parent`, inspect recent related entries in `timeline/` and reuse the same anchor when one is already established. Only start a new sub-thread when the user explicitly asks for that or the work clearly changes direction.

Do not invent a new title style when an existing prefix fits. Match the prefixes already used in `timeline/` entries.

## Title prefixes

Use these existing prefixes for timeline entry titles:

| Entry type | Use this title prefix | Notes |
|---|---|---|
| Published blog post/article | `blog:` | For long-form writing in `posts/` |
| Published note | `note:` | For short-form writing in `notes/` or note-like content |
| Shipped feature/tool/site change | `feature:` | Default for shipped product or code work |
| Shipped bug fix | `fix:` | Use when the shipped change is primarily a bug fix rather than a net-new feature |
| Shipped skill/workflow | `skill:` | Use when the shipped thing is a repo skill or workflow |
| Work in progress | `wip:` | Keep lowercase to match existing entries |
| Idea/direction | `idea:` | For concrete concepts not yet in active implementation |
| Thinking/musing | `thoughts:` | Use this existing title prefix even though the status tag is `thinking` |

Examples:

- `title: "feature: Random month navigation on Project Etho"`
- `title: "fix: Earlier thread siblings on timeline entry pages (subspace)"`
- `title: "skill: Timeline-entry skill"`
- `title: "blog: Cloudflare Build Notifications via Email Routing and Email Worker"`
- `title: "note: Smart AI Token Consumption"`
- `title: "thoughts: A Small Digital Garden That Feels Like Home"`

## Status tags

| Tag | Color | Use when |
|---|---|---|
| `shipped` | green | Built and released something: code, feature, tool, site change |
| `published` | blue | Wrote and published content: post, note, essay |
| `wip` | purple | Work is actively in progress and you want to log the current state |
| `idea` | yellow | You want to capture a concrete concept or direction before it becomes active work |
| `thinking` | amber | You are still exploring, planning, or musing without a concrete work-in-progress yet |

## Entry body

One paragraph, 2-4 sentences. First-person, conversational, specific. Name the thing, the decision, the outcome. No marketing language.

When adding images to a timeline entry, center the caption text under the image or image group, e.g. `<figcaption style="text-align: center;">...`.

If the entry is about a post or article the user wrote, the first sentence must link to it using its URL path (e.g. `[Post Title](/posts/post-slug/)`). Never write a timeline entry about a published post or article without linking to it.

When referring to a repository by name, always link the repository name to its canonical repo URL. Repeat the link for later repo-name mentions in the same entry rather than leaving a bare repo reference.

If the entry is about a shipped feature or release, the body must link to the release tag if one exists (e.g. `[v1.2.3](https://github.com/owner/repo/releases/tag/v1.2.3)`), falling back to the commit only when no tag covers it (e.g. `[abc1234](https://github.com/owner/repo/commit/abc1234)`). To find the tag: run `git tag --sort=-version:refname | head -10` in the repo, then `git log {commit}..{tag} --oneline` to confirm the commit is included. Never write a shipped timeline entry without linking to the release tag or commit.

## From a blog post

1. Read the post front matter: extract `title`, `date`, `tags`
2. Run `git log --follow --format="%ad" --date=format:"%Y-%m-%d %H:%M" -- {file}` to get the commit timestamp
3. Status: `published`
4. Lock date and time to the commit timestamp (commit time is authoritative — history is never rewritten with altered timestamps)
5. Use `blog:` for posts and `note:` for notes in the timeline entry title
6. Carry over meaningful topic tags (skip `post`, `posts`, `all`, `nav`)
7. Confirm date, time, status, title prefix, and tags with user before writing

## From a GitHub commit

1. Run `git show {commit} --stat` for changed files and message
2. Run `git log {commit} -1 --format="%ad" --date=format:"%Y-%m-%d %H:%M"` for exact date and time
3. Lock date and time to the commit timestamp
4. Infer status: code/tooling → `shipped`, content/docs → `published`, active work → `wip`, concrete concept/direction → `idea`, open-ended planning/musing → `thinking`
5. Choose the title prefix that matches the entry type: `feature:`, `fix:`, `skill:`, `blog:`, `note:`, `wip:`, `idea:`, or `thoughts:`
6. Confirm status with user if ambiguous
7. Find the release tag: run `git tag --sort=-version:refname | head -10`, then verify with `git log {commit}..{tag} --oneline` to confirm the commit falls under that tag. Prefer the tag link over the raw commit link.
8. If the work continues an existing timeline thread, inspect recent related entries and inherit their established `parent`.
9. Do not pick the nearest chronologically related entry as `parent` unless it is already the thread anchor reused by other entries in that feature area.
10. When multiple related entries exist, prefer the oldest shipped entry that started the feature thread.

## Checklist

- Date is explicit quoted `"YYYY-MM-DD"` from the commit, not today
- Time is explicit quoted `"HH:MM"` (24-hour) from the commit timestamp
- Title uses an existing prefix style already present in `timeline/`
- `parent` is present when the entry is relational, and it is a quoted canonical timeline path
- If similar timeline entries already exist for the same feature thread, `parent` matches their established anchor rather than a newer follow-up entry
- Build validation fails if `date` or `time` is left unquoted
- Exactly one status tag
- Timeline collection tag present, either from `timeline/timeline.json` or explicit file tags
- File name matches `YYYY-MM-DD-{status}-{slug}.md`
- Body is one paragraph, first-person, specific
- Image captions are centered under the image or image group
- If the entry is about a post/article the user wrote, the body links to it in the first sentence
- Every named repository reference links to the canonical repo URL
- If the entry is `shipped`, the body links to the release tag if one exists, otherwise the commit
- Use the exact status type in both the filename and the status tag. Do not use `thinking` as a catch-all when the entry is better described as `wip` or `idea`.

## Project example

- Timeline follow-ups for the initial timeline launch and later archive or navigation additions should usually parent back to `/timeline/2026-04-14-shipped-timeline/` when they are continuations of that same feature thread.
