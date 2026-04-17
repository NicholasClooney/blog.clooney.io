---
name: series
description: Add a post to an existing series, or create a new series, in _data/series.yaml.
---

Series are defined in `_data/series.yaml`. Each entry has an `id`, a `title`, an `intro`, and a `posts` list of canonical URL paths.

## Adding a post to an existing series

1. Read `_data/series.yaml` and find the matching series by `id` or `title`
2. Insert the post path into `posts` at the correct position — newest posts go at the top
3. Use the canonical path format: `/posts/slug/` (trailing slash, no domain)

## Creating a new series

Append a new entry to `_data/series.yaml`:

```yaml
- id: kebab-case-id
  title: Human Readable Series Title
  intro: >
    One to two sentences describing the series scope and what connects the posts.
  posts:
    - /posts/first-post-slug/
```

- `id` is used as an anchor or lookup key; keep it stable once published
- `intro` should describe the unifying theme, not just list topics
- Order posts newest-first within the list
