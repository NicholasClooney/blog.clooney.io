---
title: "fix: tmux-agents v1.21.2 fixes stale resume hints and grouped-session windows"
date: "2026-11-15"
time: "13:55"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.21.2](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.21.2) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a patch release with two fixes. `tmux-peers` no longer prints a stale "closed by user" hint when a live connected agent has reused a closed agent's name; the closed agent's saved conversation is still kept for `--resume`. And `tmux-connect --list` and the picker now mark and order the caller's own window correctly when sessions share linked windows (grouped sessions), by matching window ids instead of `session:index`.
