---
title: "feature: tmux-agents v1.7.0 durable messages and a faster list"
date: "2026-10-04"
time: "09:29"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.7.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.7.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) so `tmux-ask` keeps waiting messages instead of giving up on a busy pane, with “✉ message waiting” pinned in the agent list and shown in the chip after 30 minutes. If the receiver is gone, the sender gets a notice with the saved text's path; messages for reopenable spawned agents are kept for `tmux-spawn --resume`, while `tmux-ask --pending` lists queued or undelivered messages and `--retry` re-sends them, including files from older versions, with at-least-once delivery. The list also opens and switches scope about 45 times faster on my live data (28 panes and 45 session records), from 4.5 seconds to 0.1 seconds, by using one tmux snapshot instead of hundreds of tmux, awk and git calls; a new test fails the build if a rebuild launches more than 20 processes. The worker split the work across three agents of its own, with [decisions](https://github.com/TheClooneyCollection/tmux-agents/tree/main/docs/decisions) recorded.
