---
title: "feat: tmux-agents v1.23.0 clears agents in place"
date: "2026-11-15"
time: "18:11"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.23.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.23.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a minor release with a new command and skill. `tmux-clear-context --from ME PEER` clears a stopped Claude or Codex sub agent in place, sending `/clear` or `/new` while keeping its pane, name and connections. It refuses when the agent is working, in copy mode, mid-typing, has queued messages or has text in its prompt. Claude now records its new session ID at each turn start, so resume follows an agent across a `/clear`. The new `chain-reset` skill builds on it: after I clear the main agent, `/chain-reset` collects unfinished work, then clears and re-briefs the secondary and worker.
