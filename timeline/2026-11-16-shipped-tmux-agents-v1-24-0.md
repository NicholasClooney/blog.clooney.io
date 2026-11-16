---
title: "feature: tmux-agents v1.24.0 adds quiet notes between agents"
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

I shipped [v1.24.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.24.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which adds quiet notes for the chatter between agents that doesn't need to interrupt anyone. `tmux-ask --note` leaves a note instead of pasting a prompt, and `tmux-notes` reads them with one read cursor per receiver; Claude gets an unread summary through its prompt hook and Codex checks at turn start. After five minutes idle (configurable), an agent gets a digest that continues from the last update until I speak, bare `tmux-notes --count` feeds status lines, and the "stopped without replying" reminder now arrives as a quiet note. The agent-chain rules also spell out what stays a reply, a request or a notice.
