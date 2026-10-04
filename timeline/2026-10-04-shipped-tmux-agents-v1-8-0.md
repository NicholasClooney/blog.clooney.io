---
title: "feature: tmux-agents v1.8.0 renaming and live configuration"
date: "2026-10-04"
time: "10:58"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.8.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.8.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) with `tmux-rename`: an agent's links, saved records, references from other agents and queued messages follow the new name, and it and its connected agents get a notice. Agents can rename themselves and their descendants, while I can rename anyone. Given names now follow the automatic format, so `tmux-spawn codex --name spirit-earth` creates `codex-<project>-spirit-earth`, with `--exact` to keep a name as given. Every user setting is now a live tmux option in `tmux.conf` (`set -g @tmux_agents_<name> ...`), listed in one Configuration section, with the old environment variables still taking precedence.
