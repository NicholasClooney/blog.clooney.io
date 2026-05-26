---
name: series
description: Add an entry (post, note, or timeline entry) to an existing series, or create a new series, in _data/series.yaml.
---

Series are defined in `_data/series.yaml`. Each entry has an `id`, a `title`, an `intro`, and an `entries` list of canonical URL paths.

`entries` supports any of the site's content types: posts, notes, and timeline entries. Use the canonical URL path for each (e.g. `/posts/slug/`, `/notes/slug/`, `/timeline/YYYY-MM-DD-status-slug/`).

Some older series still use a `posts:` key. When touching one of those, migrate it to `entries:` in the same change.

## Adding an entry to an existing series

1. Read `_data/series.yaml` and find the matching series by `id` or `title`
2. Insert the entry path into `entries` at the correct position. Most series are ordered chronologically (oldest at the top, newest at the bottom); match the existing order rather than assuming
3. Use the canonical path format with a trailing slash and no domain

## Creating a new series

Append a new entry to `_data/series.yaml`:

```yaml
- id: kebab-case-id
  title: Human Readable Series Title
  intro: >
    One to two sentences describing the series scope and what connects the entries.
  entries:
    - /posts/first-post-slug/
    - /notes/first-note-slug/
    - /timeline/2026-05-26-shipped-first-entry-slug/
```

- `id` is used as an anchor or lookup key; keep it stable once published
- `intro` should describe the unifying theme, not just list topics
- Match the established ordering convention of the rest of the series in the file
