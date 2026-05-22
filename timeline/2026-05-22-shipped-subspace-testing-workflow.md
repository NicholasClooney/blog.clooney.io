---
title: "feature: Testing workflow (subspace)"
date: "2026-05-22"
time: "09:44"
tags:
  - shipped
  - subspace
  - testing
  - github-actions
  - playwright
  - vitest
---

I shipped [v1.35.0](https://github.com/TheClooneyCollection/11ty-subspace-builder/releases/tag/v1.35.0) of [11ty-subspace-builder](https://github.com/TheClooneyCollection/11ty-subspace-builder), adding a real GitHub Actions test workflow plus contract, fixture, snapshot, unit, and end-to-end coverage around the site. Subspace started life as my personal blog moving quickly with AI, where slowing down too early for heavier engineering process would have hurt the feedback loop that made the project fun and productive. Now that it keeps growing, this is the kind of safety rail I want in place so I can keep making changes aggressively without wondering what I just broke.
