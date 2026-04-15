---
title: Release skill for Subspace
date: "2026-04-15"
time: "11:59"
tags:
  - timeline
  - shipped
  - subspace
  - workflow
  - skills
---

I added a [`/release` skill](https://github.com/TheClooneyCollection/11ty-subspace-builder/blob/main/.claude/skills/release/SKILL.md) to 11ty-subspace-builder in [f1cb3a3](https://github.com/TheClooneyCollection/11ty-subspace-builder/commit/f1cb3a3cd6226b3090bda8c519e507d77523374e). It captures the release ritual in one place: choose the semver bump, update `package.json`, commit `chore: release vX.Y.Z`, push, and create the GitHub release with the right title, body, and compare link.
