---
title: "feature: tmux-agents v1.6.0 close an agent tree"
date: "2026-10-03"
time: "13:19"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.6.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.6.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) so one `tmux-dismiss` closes the secondary, worker and the rest of their subtree, deepest first and with each agent reopenable; agents can close any descendant, while `--keep-children` leaves children running without an owner. An agent waiting for its first task now shows “○ idle”, and an agent that sends its parent a progress notice and waits no longer gets flagged “needs you”, a bug I saw with spirit-earth. Closed agents whose parents were also closed now appear in the right window's list. The worker split the work across three agents of its own, with [decisions](https://github.com/TheClooneyCollection/tmux-agents/tree/main/docs/decisions) recorded and 199 checks, including the new `tests/dismiss.sh`.
