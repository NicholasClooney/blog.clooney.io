---
title: "feature: tmux-agents v1.11.0 members and a calmer agent list"
date: "2026-10-06"
time: "11:23"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.11.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.11.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) with long-lived members (`tmux-spawn --member`), which the agent-chain skill now uses for its secondary and worker instead of sub agents. The agent list is calmer: a fixed name column, compact names, time in state and worked time per agent, plus a pinned preview header with full activity and scrolling that pauses follow. The list now requires fzf and gives clear install instructions when it is missing; there is also a new [configuration guide](https://github.com/TheClooneyCollection/tmux-agents/blob/v1.11.0/docs/configuration.md) and an updated quick start. After updating, reload the tmux config with `tmux source-file ~/.tmux.conf` so the new hooks can save worked time and mark removed panes closed.
