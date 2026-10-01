---
title: "feature: tmux-agents v1.0.0"
date: "2026-10-01"
time: "22:46"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.0.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.0.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), extracted from my [dotfiles](https://github.com/TheClooneyCollection/dotfiles) with its full history and released under MIT, because I want my sub agents' work to stay visible after the task ends. Each Claude or Codex sub agent runs in its own tmux window: I can watch a live preview, switch in to steer it, and let agents exchange tasks and replies through `tmux-ask`. The panes stay until closed, the conversations can be resumed afterward, and a line above the status bar flags agents that need me. There's also a setup skill so an agent can install it and walk me through a quick start.

<figure>
  <img src="/assets/images/projects/tmux-agents.png" alt="tmux-agents listing sub agents with their status and parents beside a live preview of a Codex session" />
  <figcaption style="text-align: center;">The agent list keeps the work visible; I can open a session to answer it or give direction.</figcaption>
</figure>
