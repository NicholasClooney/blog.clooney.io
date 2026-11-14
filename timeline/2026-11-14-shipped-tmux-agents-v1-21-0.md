---
title: "feat: tmux-agents v1.21.0 tracks turns instead of requests"
date: "2026-11-14"
time: "20:19"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.21.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.21.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which replaces the request ledger with turn state. A running turn shows as working and an ended turn shows as idle or done, while parents show live "waiting on" text from their nearest working descendants. Replies no longer need a request ID, and a one-slot stop notice remembers the latest requester. `tmux-spawn` also passes agent CLI arguments after `--`, saves them with the sub agent and brings them back on resume.
