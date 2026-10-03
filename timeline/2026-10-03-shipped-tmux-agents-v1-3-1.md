---
title: "fix: tmux-agents v1.3.1 completed agent status"
date: "2026-10-03"
time: "11:54"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.3.1](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.3.1) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) after a spawned agent on the Stone Age project showed “needs you” when it reported progress just after replying to its parent. A report such as “delivered abc123” now leaves a completed agent done, instead of putting it back to work and flagging it at the next turn end. A new regression case in `tests/needs-you.sh` covers the sequence.
