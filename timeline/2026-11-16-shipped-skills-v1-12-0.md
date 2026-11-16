---
title: "skill: skills v1.12.0 keeps diagnostics at error boundaries"
date: "2026-11-16"
time: "20:03"
parent: "/timeline/2026-11-14-shipped-skills-v1-0-0/"
tags:
  - shipped
  - ai
  - skills
  - workflow
---

I released [v1.12.0](https://github.com/TheClooneyCollection/skills/releases/tag/v1.12.0) of my [skills](https://github.com/TheClooneyCollection/skills). The error-boundary rule in `engineering-standards` now says that when a boundary normalises a failure, it keeps the diagnostics that failure needs, in logs or error metadata as the boundary chooses. Intentional cancellation counts as lifecycle control, not a request failure the user has to handle. Typed errors owned by each layer stay as they were, and the rule still doesn't prescribe how to surface underlying errors, a universal cancelled case or a logging implementation.
