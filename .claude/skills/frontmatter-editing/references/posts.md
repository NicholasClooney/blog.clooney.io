# Posts Front Matter

Use this for content under `posts/`.

## Template

```yaml
---
title: "Post title"
date: YYYY-MM-DD
tags:
  - topic-tag
  - another-topic-tag
excerpt: |
  Optional short summary. If omitted, the site falls back to the first 2 paragraphs.
draft: true # optional; hides the post in production but keeps it visible in dev
---
```

## Rules

- `title`, `date`, and `tags` are expected.
- Use `YYYY-MM-DD` for `date`.
- Use topic tags only in file front matter. The content-type tag is supplied by `posts/posts.json`.
- `excerpt` is optional but preferred when you want tighter control over summaries, feeds, or cards.
- `draft` is optional.
