---
title: "feat: tmux-agents v1.13.0 lets you pick each chain role's agent"
date: "2026-10-13"
time: "15:41"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.13.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.13.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which makes the agent chain's roles configurable. Each of the three roles (main, secondary, worker) can now be Claude, Codex or a configured Codex profile, per launch with `tmux-agents start chain [DIR] --main/--secondary/--worker AGENT`, or lastingly through the `@tmux_agents_chain_*` tmux options or `TMUX_AGENTS_CHAIN_*` env vars. The defaults stay Claude, Claude and Codex, a preference in CLAUDE.md or AGENTS.md still wins, and a Codex main or secondary now works. A new read-only `tmux-agents chain-config [--sources]` shows the role choices new chains start from and where each came from. To upgrade, rerun `./install.sh` to refresh the copied Codex rules and add the Claude allow rule `Bash(tmux-agents chain-config:*)`.
