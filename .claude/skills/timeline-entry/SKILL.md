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
title: Optional short title
date: "YYYY-MM-DD" # required; keep quoted so YAML treats it as a string
time: "HH:MM"      # required; keep quoted, 24-hour format (e.g. "15:42")
parent: "/timeline/YYYY-MM-DD-status-slug/" # optional; quote the canonical timeline path
tags:
  - timeline
  - {status}       # shipped | published | wip | idea | thinking  (exactly one)
  - {topic-tags}   # optional
---
```

Keep `date` and `time` quoted. Unquoted YAML dates are parsed as JavaScript `Date` objects before Eleventy collection sorting runs, which can break within-day ordering.

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

If the entry is about a post or article the user wrote, the first sentence must link to it using its URL path (e.g. `[Post Title](/posts/post-slug/)`). Never write a timeline entry about a published post or article without linking to it.

If the entry is about a shipped feature or release, the body must link to the release tag if one exists (e.g. `[v1.2.3](https://github.com/owner/repo/releases/tag/v1.2.3)`), falling back to the commit only when no tag covers it (e.g. `[abc1234](https://github.com/owner/repo/commit/abc1234)`). To find the tag: run `git tag --sort=-version:refname | head -10` in the repo, then `git log {commit}..{tag} --oneline` to confirm the commit is included. Never write a shipped timeline entry without linking to the release tag or commit.

## From a blog post

1. Read the post front matter: extract `title`, `date`, `tags`
2. Run `git log --follow --format="%ad" --date=format:"%Y-%m-%d %H:%M" -- {file}` to get the commit timestamp
3. Status: `published`
4. Lock date and time to the commit timestamp (commit time is authoritative — history is never rewritten with altered timestamps)
5. Carry over meaningful topic tags (skip `post`, `posts`, `all`, `nav`)
6. Confirm date, time, status, and tags with user before writing

## From a GitHub commit

1. Run `git show {commit} --stat` for changed files and message
2. Run `git log {commit} -1 --format="%ad" --date=format:"%Y-%m-%d %H:%M"` for exact date and time
3. Lock date and time to the commit timestamp
4. Infer status: code/tooling → `shipped`, content/docs → `published`, active work → `wip`, concrete concept/direction → `idea`, open-ended planning/musing → `thinking`
5. Confirm status with user if ambiguous
6. Find the release tag: run `git tag --sort=-version:refname | head -10`, then verify with `git log {commit}..{tag} --oneline` to confirm the commit falls under that tag. Prefer the tag link over the raw commit link.

## Checklist

- Date is explicit quoted `"YYYY-MM-DD"` from the commit, not today
- Time is explicit quoted `"HH:MM"` (24-hour) from the commit timestamp
- `parent` is present when the entry is relational, and it is a quoted canonical timeline path
- Build validation fails if `date` or `time` is left unquoted
- Exactly one status tag
- `timeline` tag present
- File name matches `YYYY-MM-DD-{status}-{slug}.md`
- Body is one paragraph, first-person, specific
- If the entry is about a post/article the user wrote, the body links to it in the first sentence
- If the entry is `shipped`, the body links to the release tag if one exists, otherwise the commit
- Use the exact status type in both the filename and the status tag. Do not use `thinking` as a catch-all when the entry is better described as `wip` or `idea`.
