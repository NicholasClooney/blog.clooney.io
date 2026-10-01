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
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 1rem; align-items: start;">
    <img src="/assets/images/timeline/tmux-agents/message-request.png" alt="A request from Claude arriving in Codex's pane" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/timeline/tmux-agents/message-reply.png" alt="Codex's reply arriving back in Claude's pane" style="display: block; width: 100%; height: auto;" />
  </div>
  <figcaption style="text-align: center;">Claude asks Codex for a review, and the reply comes back as a new message.</figcaption>
</figure>

<figure>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 1rem; align-items: start;">
    <img src="/assets/images/projects/tmux-agents.png" alt="The agent list showing sub agents with their status and parent, and a live preview of the selected session" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/timeline/tmux-agents/popup.png" alt="A hidden Codex sub agent opened in a popup from the list" style="display: block; width: 100%; height: auto;" />
  </div>
  <figcaption style="text-align: center;"><code>prefix + a</code> lists the sub agents with a live preview. I can open one in a popup to answer it or give direction.</figcaption>
</figure>
