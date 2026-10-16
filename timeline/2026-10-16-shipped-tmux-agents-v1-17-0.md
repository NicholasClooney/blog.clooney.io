---
title: "feat: tmux-agents v1.17.0 adds command mode to shell popups"
date: "2026-10-16"
time: "17:13"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.17.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.17.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which adds command mode to shell popups: `prefix + C-s` now opens an fzf picker over saved fish, bash or zsh history, or lets me type a new command, then runs it in a hidden pane shown in a popup; the plain shell moves to `prefix + S`. A successful command shows `ok` and closes after a three-second countdown unless I press any key to keep it, while a failed command stays open in a shell, and `prefix + a` lists each command as `running`, `ok` or `failed N` until cleared with `ctrl-x`. Agents can use `tmux-shell --from NAME --command CMD`, and shell popup startup is about twice as fast, with the tool's work before the shell starts down from about 290 ms to 140 ms. The history picker uses fish's own history and Perl without Python, and `start chain --help` is fixed too.
