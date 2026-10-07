---
title: "fix: tmux-agents v1.12.2 keeps agent names and quiets main agents"
date: "2026-10-07"
time: "22:48"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.12.2](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.12.2) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a patch release with two fixes that bring behaviour in line with the docs. Renaming and auto-naming now keep the agent kind prefix for agents started with `tmux-agents start`, so renaming a chain's main to `main` gives `claude-tmux-agents-main` instead of `tmux-agents-main`, and Codex profiles consistently use `codex-`. Top-level agents, like a chain's main, now go idle when they finish a turn with nothing pending instead of showing amber "needs you", which stays for sub agents and members.
