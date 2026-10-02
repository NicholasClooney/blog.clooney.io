---
title: "blog: I Gave My Coding Agents a Shared Worktree Pool"
date: "2026-10-02"
time: "10:27"
tags:
  - published
  - ai
  - agents
  - git
  - workflow
  - tooling
  - tmux-agents
---

I published [I Gave My Coding Agents a Shared Worktree Pool](/posts/i-gave-my-coding-agents-a-shared-worktree-pool/), about the worktrees Claude and Codex left behind while I was building my Stone Age remake. I run those agents through [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), which I [shipped the day before](/timeline/2026-10-01-shipped-tmux-agents/). I replaced fresh checkouts with reusable slots and shared asset folders, then made a general Python version available as a gist. The post covers the lease rules, the disk cleanup that prompted them, and what I have and haven't tested yet.
