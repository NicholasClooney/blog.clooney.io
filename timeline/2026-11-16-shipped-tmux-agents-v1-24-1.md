---
title: "fix: tmux-agents v1.24.1 improves digest reading and chain recovery"
date: "2026-11-16"
time: "18:36"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.24.1](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.24.1) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) to correct the digest's reading command to `tmux-notes --all --keep-unread` and tighten up recovery after clearing an agent's context. A short resume phrase restores the existing chain role, using a temporary, never-committed `HANDOFF.md` to choose what to continue. The main agent also checks and updates the new session's resume ID in `main-sequence`, waiting for Codex to finish its first turn before recording it. All 68 offline test suites, seven PR CI checks and the required probes on two Codex accounts passed; I've updated the local installation and status chip.
