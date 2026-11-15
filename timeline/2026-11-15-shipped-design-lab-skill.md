---
title: "skill: Design lab, one place to compare and pick designs"
date: "2026-11-15"
time: "13:58"
parent: "/timeline/2026-11-14-shipped-skills-v1-0-0/"
tags:
  - shipped
  - ai
  - skills
  - ui
---

I added [`design-lab`](https://github.com/TheClooneyCollection/skills/tree/main/skills/design-lab) to my [skills](https://github.com/TheClooneyCollection/skills) in [549cfa8](https://github.com/TheClooneyCollection/skills/commit/549cfa8). With how easy it is to try things with AI agents, I like to experiment with designs, and this skill captures the lab I ran while redesigning this blog's themes: every mockup round, image round and verdict on one private, phone-friendly index, before any real code.

- **Nothing reviewed gets overwritten.** Each revision is a new folder next to the old one, so I compare against what I actually saw.
- **Verdicts are my words.** Loved, Approved, Not picked and Dropped are only recorded when I say so, and each one lands in the gallery, the index and the plan at the same time.
- **Phone first and private.** Every page is checked at phone width in light and dark, served from a no-store local server on 127.0.0.1, shared over my tailnet only when one is available.
- **A finalists view** with a side-by-side compare mode helps pick a default once most verdicts are in.

{% github "https://github.com/TheClooneyCollection/skills/blob/main/skills/design-lab/SKILL.md" %}
