---
title: "feature: Timeline data and copy refactor (subspace)"
date: "2026-05-21"
time: "16:41"
tags:
  - shipped
  - subspace
  - timeline
  - refactor
  - content-model
---

I shipped [v1.34.0](https://github.com/TheClooneyCollection/11ty-subspace-builder/releases/tag/v1.34.0) of [11ty-subspace-builder](https://github.com/TheClooneyCollection/11ty-subspace-builder), centralizing site and timeline copy in shared data files and reworking the templates to consume that data model cleanly. A lot of early Subspace work was intentionally optimized for speed and feedback loops rather than engineering neatness, but the project is big enough now that it needs better internal structure. This release feels like a step toward the right kind of guard rails: keeping the system flexible without leaving the growing timeline feature glued together by ad hoc copy and template assumptions.
