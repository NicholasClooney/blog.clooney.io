---
title: "feat: tmux-agents v1.18.0 tracks replies and makes attention explicit"
date: "2026-10-30"
time: "15:27"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.18.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.18.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which tracks completion per request: each `tmux-ask` request resolves when its own reply arrives, whoever asked, so answering an agent other than its parent no longer leaves the receiver working or falsely showing "needs you". A delivered request with no observable progress for 30 minutes now shows "reply overdue" on the receiver, with a configurable timeout separate from "needs you". When an agent in a `tmux-spawn --split` pane exits, the pane returns to the default shell with its original environment; `@tmux_agents_sub_exit keep` preserves the old dead-pane behaviour. Any tracked agent, including a top-level main, can now use `tmux-agent-report --needs-you "reason"` to ask for me explicitly, with the reason shown in the chip and agent list.
