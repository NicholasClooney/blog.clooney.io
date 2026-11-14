---
title: "fix: tmux-agents v1.21.1 keeps reinstalled links relative"
date: "2026-11-14"
time: "21:56"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.21.1](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.21.1) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a patch release. `install.sh` now writes relative symlink targets when both the link and its target live under the home directory, so reinstalling keeps dotfiles-tracked skill links like `~/.codex-2nd/skills/*` clean, and links that are already correct are left alone. It also fixes an intermittent preview-header test.
