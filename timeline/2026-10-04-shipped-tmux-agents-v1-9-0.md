---
title: "feature: tmux-agents v1.9.0 agent ids behind the names"
date: "2026-10-04"
time: "11:50"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.9.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.9.0) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) with hidden agent ids behind the readable names: session records, parent links, waiting lists and queued messages now use ids, so reusing a closed agent's name cannot overwrite its saved conversation, a real bug we found while checking renames. Renaming now changes only the label; names remain unique among live agents and are still how we address them, with ids kept out of the agent list rows. Agents can look up ids with `tmux-peers --ids` or `tmux-spawn --list-closed`, and use `--resume-id` to reopen one exact closed agent when names repeat. Existing setups migrate on first use with a backup of the old records, preserving every resumable conversation and parent link, checked on a copy of my 54 real records.
