---
title: "fix: tmux-agents v1.23.3 recognises folder trust prompts"
date: "2026-11-15"
time: "20:49"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.23.3](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.23.3) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) to fix spawned Codex agents appearing to be working while stuck at a folder trust prompt. Agents launched through `tmux-spawn`, including Codex profiles, now show `permission`, pause their work timer and tell their parent that the task has not started yet. The user still decides whether to trust the folder; nothing confirms it automatically. All 64 offline test suites, seven cross-platform CI checks and release probes on two accounts passed.
