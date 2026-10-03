---
title: "feature: tmux-agents v1.5.0 window-scoped agent list"
date: "2026-10-03"
time: "12:54"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.5.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.5.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) after running several projects at once: prefix + a now opens the agent list for the current window, including its agents and their spawned descendants in hidden windows or splits, with ctrl-t to switch to all windows. Agents waiting for permission or marked “needs you” stay pinned at the top across all windows, longest wait first and labelled with their window and project, so the filter never hides something waiting on me. The status-bar chip stays global on purpose. The [decisions](https://github.com/TheClooneyCollection/tmux-agents/tree/main/docs/decisions) are recorded, and `tests/list-scope.sh` covers the list behaviour.
