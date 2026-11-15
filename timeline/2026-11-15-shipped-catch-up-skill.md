---
title: "skill: Catch me up, only what changed"
date: "2026-11-15"
time: "16:38"
parent: "/timeline/2026-11-14-shipped-skills-v1-0-0/"
tags:
  - shipped
  - ai
  - skills
  - ai-agents
  - workflow
---

I added [`catch-up`](https://github.com/TheClooneyCollection/skills/tree/main/skills/catch-up) to my [skills](https://github.com/TheClooneyCollection/skills) in [b40a054](https://github.com/TheClooneyCollection/skills/commit/b40a054). I come back from a break or a flood of agent notices and ask "catch me up" or "cmu". I want only what changed since my last message, concise and in a fixed shape: what landed, what is pending or blocked, and a decision only if one is needed. Long recaps bury the decision and repeat messages I can already read, so the skill also rules out preamble, tool narration and restating what's already on screen.

{% github "https://github.com/TheClooneyCollection/skills/blob/main/skills/catch-up/SKILL.md" %}
