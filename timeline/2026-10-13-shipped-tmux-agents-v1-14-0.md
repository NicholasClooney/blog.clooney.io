---
title: "feat: tmux-agents v1.14.0 opens up to other coding agents"
date: "2026-10-13"
time: "17:19"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.14.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.14.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which adds limited support for other coding agents. Any executable on PATH, such as gemini, opencode or aider, now works wherever tmux-agents takes an agent: `tmux-agents start`, `tmux-spawn` and the chain roles. Claude, Codex and Codex profiles keep full features. Other agents get panes, naming, connect, peek, dismiss and `tmux-ask` messaging, but no automatic tracking, worked time, resume or permission setup, and their first task is sent manually once they reach their prompt. The new [docs/agents.md](https://github.com/TheClooneyCollection/tmux-agents/blob/v1.14.0/docs/agents.md) has the feature table and welcomes PRs that add full support for more agents. One behaviour change: a single bare first word to `tmux-spawn` is now read as the agent to launch.
