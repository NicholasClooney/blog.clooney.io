# Timeline Front Matter

Use this for content under `timeline/`.

## Template

```yaml
---
title: "Optional short title"
date: "YYYY-MM-DD"
time: "HH:MM"
parent: "/timeline/YYYY-MM-DD-status-slug/" # optional
tags:
  - published
  - topic-tag
  - another-topic-tag
---
```

## Rules

- `date` and `time` must stay quoted.
- Use exactly one status tag: `shipped`, `published`, `wip`, `idea`, or `thinking`.
- Use topic tags alongside the status tag in file front matter.
- The entry must end up tagged `timeline`; the repo supplies that content-type tag via `timeline/timeline.json`.
- `parent` is optional and must be the canonical `/timeline/.../` URL when present.
