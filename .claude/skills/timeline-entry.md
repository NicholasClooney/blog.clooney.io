# Timeline Entry

Create a timeline entry for something shipped, published, or in progress.

## File naming

```
timeline/YYYY-MM-DD-{status}-{slug}.md
```

## Front matter

```yaml
---
title: Optional short title
date: YYYY-MM-DD
time: "HH:MM"     # required — 24-hour format (e.g. "15:42")
tags:
  - timeline
  - {status}       # shipped | published | thinking  (exactly one)
  - {topic-tags}   # optional
---
```

## Status tags

| Tag | Color | Use when |
|---|---|---|
| `shipped` | green | Built and released something: code, feature, tool, site change |
| `published` | blue | Wrote and published content: post, note, essay |
| `thinking` | amber | Exploring an idea, planning, or musing |

## Entry body

One paragraph, 2-4 sentences. First-person, conversational, specific. Name the thing, the decision, the outcome. No marketing language.

If the entry is about a post or article the user wrote, the first sentence must link to it using its URL path (e.g. `[Post Title](/posts/post-slug/)`). Never write a timeline entry about a published post or article without linking to it.

If the entry is about a shipped feature or release, the body must link to either the release tag (e.g. `[v1.2.3](https://github.com/owner/repo/releases/tag/v1.2.3)`) or the commit (e.g. `[abc1234](https://github.com/owner/repo/commit/abc1234)`). Never write a shipped timeline entry without linking to the release tag or commit.

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
4. Infer status: code/tooling → `shipped`, content/docs → `published`, planning → `thinking`
5. Confirm status with user if ambiguous

## Checklist

- Date is explicit `YYYY-MM-DD` from the commit, not today
- Time is explicit `HH:MM` (24-hour) from the commit timestamp
- Exactly one status tag
- `timeline` tag present
- File name matches `YYYY-MM-DD-{status}-{slug}.md`
- Body is one paragraph, first-person, specific
- If the entry is about a post/article the user wrote, the body links to it in the first sentence
- If the entry is `shipped`, the body links to the release tag or commit
