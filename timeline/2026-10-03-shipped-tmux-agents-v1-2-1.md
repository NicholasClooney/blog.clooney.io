---
title: "fix: tmux-agents v1.2.1 needs-you status"
date: "2026-10-03"
time: "10:15"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.2.1](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.2.1) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) after finished spawned agents showed “needs you” when their parent broadcast a rule as a request. Agents now use `tmux-ask --notice` to pass along information, so a request saying “no reply needed” doesn't put an idle agent back to work. Notices also preserve a Claude agent's waiting state while background work runs, and regression tests cover both false alarms and cases that really need me.
