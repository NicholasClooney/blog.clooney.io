---
title: "feat: tmux-agents v1.22.0 runs commands from launcher rows"
date: "2026-11-15"
time: "14:07"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.22.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.22.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a minor release with new options. Rows in a `tmux-agents` main sequence now accept `command=CMD`: the window opens at the project directory, runs the command in the configured shell, and keeps an interactive shell afterwards even if the command fails. `add`, `set` and `unset` edit the field. I use it to start the Agent Fleet Command server alongside the other windows. The agent-chain skill also gains an optional Fleet Command section: when the `fleet-command` CLI is installed, chains follow the missions skill, with the main registering missions, the secondary reading the inbox and owning status, and the worker logging progress. Without it, chains behave exactly as before.
