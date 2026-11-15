---
title: "fix: tmux-agents v1.23.1 clears idle agents with ghost text"
date: "2026-11-15"
time: "18:57"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.23.1](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.23.1) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a patch release for `tmux-clear-context`. It now treats the dim suggestions and placeholders in Claude and Codex prompts, such as gray history ghost text or "Ask Codex to do anything", as an empty prompt, so idle agents can be cleared. If it refuses after typing the command, it erases the command again when that is safe; otherwise the error says the input was left as is. Refusals for a working agent now show how old the recorded state is.
