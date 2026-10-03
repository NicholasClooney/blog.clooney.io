---
title: "feature: tmux-agents v1.4.0 visible splits"
date: "2026-10-03"
time: "12:13"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.4.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.4.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) so spawned agents can open in a visible split with `tmux-spawn --split <pane> [--right | --below] [--size N%]`. It came from the layout I wanted for my agent chain: main on the left half, secondary top right and worker bottom right, all in one window, using `--split main --right` for secondary and `--for secondary --split secondary --below` for the worker. Split agents keep the agent list, status chip, messaging, closing and reopening, though reopened agents return in hidden windows. The [decisions](https://github.com/TheClooneyCollection/tmux-agents/tree/main/docs/decisions) are recorded, and `tests/spawn-split.sh` covers the feature with 43 checks.
