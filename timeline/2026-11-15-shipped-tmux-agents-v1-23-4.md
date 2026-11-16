---
title: "fix: tmux-agents v1.23.4 follows agents through a manual reset"
date: "2026-11-15"
time: "23:50"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.23.4](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.23.4) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a patch release that makes clearing a session by hand a supported path. After `/new` in Codex, the next turn end with a verified agent ID rebinds the pane and its record to the new thread, so tracking and `tmux-spawn --resume` follow the latest conversation instead of staying stuck on working. Parents no longer get a "stopped without replying" reminder while a child is still working, and a new prompt or delivery clears the old activity label. In `tmux-peers` and `tmux-connect --list`, the COMMAND column now shows the agent kind (claude, codex or a Codex profile) and marks it `(exited)` when it has quit, instead of showing the shell that started it.
