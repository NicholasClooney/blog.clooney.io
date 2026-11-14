---
title: "feat: tmux-agents v1.20.0 brings project launchers into tmux-agents"
date: "2026-11-14"
time: "12:24"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.20.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.20.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which moves my project launchers into tmux-agents itself. `tmux-agents main-sequence` opens the configured project windows in order, with optional names and plain shells, and `tmux-agents chain` picks a project from the current directory, the saved projects or an optional scan root. The config is editable with `list`, `add --at N`, `set` and `unset`, with nothing personal hardcoded. `tmux-agents start chain --main-resume ID` resumes just the main conversation, with Claude reconnecting Remote Control through `/rc`, and sub agents spawned by a profiled Codex agent now inherit that profile, including on resume.
