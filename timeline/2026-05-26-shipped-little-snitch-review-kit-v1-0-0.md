---
title: "feature: Little Snitch Review Kit v1.0.0"
date: "2026-05-26"
time: "21:33"
tags:
  - shipped
  - little-snitch
  - tooling
  - ai-assisted
---

Cut [v1.0.0](https://github.com/NicholasClooney/little-snitch-review-kit/releases/tag/v1.0.0) of [little-snitch-review-kit](https://github.com/NicholasClooney/little-snitch-review-kit), a personal workflow I use for reviewing Little Snitch exports with an AI assistant.

The Little Snitch UI is great at intercepting one connection at a time, but it does not answer the longer questions I actually care about: what is this process talking to over a week, and which observed traffic has no explicit rule covering it.

This release bundles the analysis scripts (per-app rollups, uncovered pairs, denied traffic), the importable `.lsrules` builders (HaGeZi Pro and reviewed consolidation plans), and the docs and tests around the human-in-the-loop review workflow. The core constraint stays: scripts surface candidates, humans make the trust decisions.
