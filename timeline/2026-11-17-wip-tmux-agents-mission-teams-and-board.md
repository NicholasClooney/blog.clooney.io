---
title: "wip: tmux-agents v2, mission teams and a live board"
date: "2026-11-17"
time: "10:29"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - wip
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

<figure style="margin: 1.5rem auto; text-align: center; width: min(38rem, 100%);">
  <a href="/assets/images/timeline/tmux-agents/mission-board-2026-11-17.png">
    <img
      src="/assets/images/timeline/tmux-agents/mission-board-2026-11-17.png"
      alt="A tmux window with the tmux-agents main agent on the left and the mission board on the right, listing missions M1 to M10 with the interface and agents working on each, their models, states and progress."
      style="width: 100%; height: auto; border-radius: 8px;"
    />
  </a>
  <figcaption style="text-align: center;">The main agent on the left, <code>tmux-agents board --watch</code> on the right. Click for the full size.</figcaption>
</figure>

I'm rebuilding how my [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) team works. The old main → secondary → worker chain burned most of its tokens on a secondary that never cleared its context and got the most messages: on the tmux-agents project alone, the secondary used 143M tokens to the main's 91M. Now there is one Opus main that only talks to me and decides, a short-lived Sonnet interface per mission that hands out the work, reviews it and lands it, then closes, plus Codex workers, Opus reviewers and Haiku runners for tests and CI.

Each mission is a record managed with `tmux-agents mission`, shared across worktrees, and `tmux-agents board --watch` is a live, read-only pane that groups every agent under its mission with its model, state and progress. One glance and I can see the whole team.

It's part of a bigger push to trim the fat. A fresh Claude session used to spend about 50k tokens before I typed anything; after measuring and cutting unused tools, MCP servers and hidden skills, it starts at about 16k. And I [wrap up, then clear](/timeline/2026-11-12-shipped-wrap-up-skill/) far more often, so no agent drags 150k of scrollback through every request.

All of it is coming soon: role-based spawning, mission records, the board and a single `tmux-agents status` command will ship together as [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) v2.0.0, with posts on the new team flow and on where my Claude tokens actually went.
