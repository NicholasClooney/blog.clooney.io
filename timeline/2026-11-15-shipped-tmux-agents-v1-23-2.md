---
title: "fix: tmux-agents v1.23.2 drops in-place clearing for manual chain resets"
date: "2026-11-15"
time: "19:26"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.23.2](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.23.2) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a patch release that removes `tmux-clear-context` and the `chain-reset` skill from v1.23.0 and v1.23.1. Instead, I clear agents by hand and tell the main agent it is the main of an existing chain. The agent-chain skill now explains how a restarted main, secondary or worker finds its members with `tmux-peers` and re-briefs them instead of starting a new chain. `install.sh` removes the stale links. The fix that records Claude's new session ID stays.
