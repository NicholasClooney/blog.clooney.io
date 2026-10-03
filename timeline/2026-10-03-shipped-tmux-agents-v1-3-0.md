---
title: "feature: tmux-agents v1.3.0 agent ownership"
date: "2026-10-03"
time: "11:46"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.3.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.3.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) to support the main → coordinator → worker chain: `tmux-spawn --for <owner>` lets main spawn a worker that belongs to and connects only to the coordinator, which introduces itself and sends the first task. The worker starts without a task, and depth counts from main so it can still spawn agents of its own. I also fixed messages to closed agent names landing in similarly named windows; missing names now fail, and agents are told to use the names `tmux-peers` shows now. Product decisions live [one per file](https://github.com/TheClooneyCollection/tmux-agents/tree/main/docs/decisions), with new regression tests for ownership and name matching.
