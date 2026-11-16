---
title: "feature: tmux-agents v1.24.0 adds quiet progress notes"
date: "2026-11-16"
time: "11:00"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.24.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.24.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) so agents can leave progress updates without interrupting one another. `tmux-ask --note` stores a quiet note, and `tmux-notes` reads unread notes through a single cursor, with a cheap `N unread` count for a quick check. Idle agents get a digest after five minutes by default, and stopping without replying now leaves a quiet note rather than another interruption. All seven cross-platform CI checks passed, and I've updated the local installation.
