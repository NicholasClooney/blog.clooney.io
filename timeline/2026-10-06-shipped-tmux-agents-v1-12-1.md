---
title: "fix: tmux-agents v1.12.1 starts from named panes"
date: "2026-10-06"
time: "18:31"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.12.1](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.12.1) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a small fix for `tmux-agents start` in a named pane: when you run it from that pane's own shell, it now takes over the pane, keeping its name and connections, and `--name` renames it first. Before, it refused to start from any named pane.
