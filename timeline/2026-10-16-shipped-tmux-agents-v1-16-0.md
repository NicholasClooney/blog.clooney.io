---
title: "feat: tmux-agents v1.16.0 lets scripts create chain windows"
date: "2026-10-16"
time: "15:42"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.16.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.16.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which lets scripts such as my dotfiles' `tmux-chain` delegate chain window creation with `tmux-agents start chain [DIR] --target session[:index] --name NAME`. `--target` creates the window detached in an existing session, even from outside tmux, and a bare session name picks the next free index. `--name` sets the window name, defaulting to the directory basename, and the window's `automatic-rename` and `allow-rename` options are off before the agent starts. On success, the command prints exactly the new pane ID.
