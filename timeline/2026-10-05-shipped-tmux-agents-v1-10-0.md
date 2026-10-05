---
title: "skill: tmux-agents v1.10.0 shared skills and agent chain"
date: "2026-10-05"
time: "15:13"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.10.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.10.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) with one shared skill for Claude and Codex, installable with `npx skills add TheClooneyCollection/tmux-agents -g`, and a new agent-chain skill for “start the chain”: main, secondary and worker side by side. The installer now handles Codex homes more safely, backs up real files and directories with `--force`, and warns about dangling skill links; re-run `./install.sh` from the installed checkout after updating. CI runs on macOS and Ubuntu, covering installation and upgrades as well as the offline tests. Picker rows now stay aligned, and searches match only agent names and projects.
