---
title: "skill: skills v1.11.0 sets rules for boundary payloads and parks context across a clear"
date: "2026-11-16"
time: "18:02"
parent: "/timeline/2026-11-14-shipped-skills-v1-0-0/"
tags:
  - shipped
  - ai
  - skills
  - workflow
---

I released [v1.11.0](https://github.com/TheClooneyCollection/skills/releases/tag/v1.11.0) of my [skills](https://github.com/TheClooneyCollection/skills). `engineering-standards` now has rules for what crosses a boundary: no enum that only mirrors domain cases to serialize them, a wire-format value only when it is a deliberate choice, named payloads when several values travel together, members grouped by responsibility in Swift's order, and a test rule to assert the final wire output. `wrap-up` now offers numbered choices for what to keep before a session clear, and parks the picked context in a local, uncommitted `HANDOFF.md` so the next session picks up where this one stopped.
