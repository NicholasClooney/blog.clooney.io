---
title: "fix: tmux-agents v1.13.1 keeps relative install links"
date: "2026-10-13"
time: "16:00"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.13.1](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.13.1) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a small fix for `install.sh`: it now keeps a command or skill link that already points to the installed copy, such as a relative link tracked in dotfiles, instead of rewriting it as an absolute path on every upgrade. Links pointing anywhere else are still replaced.
