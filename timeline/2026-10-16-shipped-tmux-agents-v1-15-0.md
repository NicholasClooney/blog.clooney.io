---
title: "feat: tmux-agents v1.15.0 adds shell popups"
date: "2026-10-16"
time: "15:21"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.15.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.15.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which adds shell popups: `prefix + C-s` or `tmux-shell` opens a plain shell in the hidden project session, with the shortcut configurable through `@tmux_agents_shell_key` (`none` disables it). `prefix + d` detaches the popup while the shell keeps running, and `prefix + a` lists it as a shell, with Enter to reopen and `ctrl-x` to close. Agents can open owned shells with `tmux-shell --from NAME`, which close with their owner, and agent messages can never be typed into a shell. `exit` removes the shell, with nothing resumable and no separate command log.
