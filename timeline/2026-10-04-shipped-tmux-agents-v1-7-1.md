---
title: "fix: tmux-agents v1.7.1 faster popup startup"
date: "2026-10-04"
time: "10:06"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.7.1](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.7.1) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) so prefix + a shows the popup in about 50ms, instead of waiting 0.5–0.7 seconds before anything appears: fzf starts immediately and loads the rows right after. The bigger delay was in my shell, since tmux runs every popup through `default-shell -c`: my fish config loaded thefuck and mise even for non-interactive shells, costing 0.26–0.47 seconds each time, and now stops early in 0.01–0.02 seconds. I added [performance notes](https://github.com/TheClooneyCollection/tmux-agents/blob/v1.7.1/docs/performance.md), an “If popups feel slow” check in the README and a tmux-agents-perf skill to help agents find where a delay comes from.
