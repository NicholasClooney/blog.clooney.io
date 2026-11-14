---
title: "feat: tmux-agents v1.19.0 makes long messages explicit"
date: "2026-11-14"
time: "09:27"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.19.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.19.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which makes long messages explicit: `tmux-ask` and `tmux-spawn` take `--message-file`, so an agent sends a summary plus the full text, the recipient reads it with `tmux-read <id>`, and automatic truncation is gone. Agents now get resume hints and can resume in place with `tmux-spawn --resume --here`, and a requester is notified when a sub agent stops without replying, replacing "reply overdue". Claude hooks are hardened, with `StopFailure` handled, tool hooks clearing permission waits, and `AskUserQuestion` and MCP input dialogs marking "needs you". Resumed Codex agents are tracked, finished agents keep their last report, ownership survives a gone ancestor, and a new probe checks Codex compatibility.
