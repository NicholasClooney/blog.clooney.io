---
title: "thoughts: Multi-project agent orchestration"
date: "2026-05-26"
time: "21:42"
tags:
  - thinking
  - ai-agents
  - ai-assisted
  - workflow
---

A new style of working with AI has been clicking for me lately: keeping several projects open at once, letting the main agent spawn off sub-agents per project, then hopping between them as work lands.

The glue is `AGENTS.md` and `CLAUDE.md` in each repo, which keeps every spawned agent oriented to that project's conventions while I focus on the next handoff. The loop in each project stays the same: pick a feature, write tests, document progress and findings as it goes, commit atomically.

It is genuinely engaging, more like conducting than coding, but it burns through tokens fast, especially on top-tier models like Opus 4.7 or GPT 5.5.

A few cost-saving strategies I've landed on: drop to lower-tier models where the work allows; instead of paying for the $100 tier at a single provider, take the $20 tier at both OpenAI and Anthropic and run them side by side; and lean into the fact that each model has its own strengths and weaknesses, just like any tool. It's the vim vs emacs thing again. There is no single best editor, only what suits the job in that moment (I use both, with evil-mode in Emacs as the vim layer).
