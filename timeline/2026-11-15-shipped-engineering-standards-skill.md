---
title: "skill: Engineering standards for every app"
date: "2026-11-15"
time: "16:21"
parent: "/timeline/2026-11-14-shipped-skills-v1-0-0/"
tags:
  - shipped
  - ai
  - skills
  - swift
---

I added [`engineering-standards`](https://github.com/TheClooneyCollection/skills/tree/main/skills/engineering-standards) to my [skills](https://github.com/TheClooneyCollection/skills) in [8329df9](https://github.com/TheClooneyCollection/skills/commit/8329df9). I want every app I build to start from the same foundation: simple objects, strong single responsibility, strong boundaries, full dependency injection, and state and logic you can test. Writing it down once means agents build to that standard by default, instead of me re-explaining it on every project.

- **Five core rules up front.** `SKILL.md` holds them, each a principle with its Swift form; 17 more rules sit in three reference files (structure and dependencies, screen state and presentation, tests) loaded only when needed.
- **Fake the world, keep my layers real.** Tests replace only the outside world; canned values at a unit's own injected functions are fine, recording mocks are out.
- **Precise values stay precise.** Money and similar values use a decimal type parsed from strings.

{% github "https://github.com/TheClooneyCollection/skills/blob/main/skills/engineering-standards/SKILL.md" %}
