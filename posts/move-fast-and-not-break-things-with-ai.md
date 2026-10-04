---
title: "How To Move Fast and NOT Break Things with AI"
date: 2026-10-04
time: "11:35"
tags:
  - ai
  - agents
  - tmux-agents
  - tooling
  - product-engineering
excerpt: |
  Move fast with AI, and add proper engineering when real usage shows you
  need it. For tmux-agents, that meant letting each agent's name double as
  its id, until it couldn't, and then adding real ids and guard rails so
  the agents and I don't repeat the mistake.
---

[tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) went from v1.0.0 to v1.9.0 in a few days. Early on, one shortcut kept things simple: an agent's name was also its id. As I used tmux-agents more, that shortcut stopped working. This post is about where it broke, and what I put in place to fix it.

The short version: move fast with AI, and add proper engineering when real usage shows you need it.

There are really two problems here. One is technical: a name would be a poor fit for a unique id. The other is about how to work: how to keep shipping fast, and still know when it's time to stop and add structure.

[[toc]]

## The shortcut

tmux-agents connects AI agents in tmux panes. They message each other with `tmux-ask`, start sub-agents with `tmux-spawn`, and I watch them all with `prefix + a`.

<figure>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; align-items: start;">
    <img src="/assets/images/timeline/tmux-agents/message-request.png" alt="A request from Claude arriving in Codex's pane" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/timeline/tmux-agents/message-reply.png" alt="Codex's reply arriving back in Claude's pane" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/projects/tmux-agents.png" alt="The tmux-agents list showing sub-agents with their status and parent, and a live preview of the selected session" style="display: block; width: 100%; height: auto;" />
  </div>
  <figcaption style="text-align: center;">Claude asks Codex with <code>tmux-ask</code>, the reply comes back as a new message, and <code>prefix + a</code> lists every agent with a live preview.</figcaption>
</figure>

Every agent has a readable name, like `claude-~-1` or `spirit-earth`. That name was also the key for everything else: the session record used to reopen a closed agent, the link from a sub-agent to its parent, and the queue of messages waiting to be delivered.

It was the simplest thing that could work, and it did. No id scheme to design, nothing extra to show or hide. When something went wrong, the name in the record was the name on the screen.

## Where it stopped fitting

Then I started using it a lot more. Several agent chains at once, each with a main agent, a secondary that coordinates, and a Codex worker with its own sub-agents. Many windows and projects. Sub-agents closed and reopened days later. Agents renamed along the way.

At that scale, a name is a bad id:

- Two chains in the same project both wanted to be called `main`.
- A closed agent's name was free again, so a new agent could take it.
- Renaming an agent meant rewriting every link that pointed to it.

On October 4, while the agents and I were working on renaming agents, we caught a concrete bug before it bit. Spawning a new agent with the name of a closed one would overwrite the closed agent's record. Its conversation could no longer be resumed, and its closed children would look like children of the new agent. Automatic names like `claude-x-1` reused numbers in the same way.

It could have happened at any time. It may even have happened already. But neither the agents nor I had thought about this edge case.

## The fix: real ids

The fix shipped in [v1.9.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.9.0) on October 4 ([timeline entry](/timeline/2026-10-04-shipped-tmux-agents-v1-9-0/)), and it's the boring one:

- Every agent gets a hidden, unique id when it's created.
- Records, parent links and the message queue are keyed by that id.
- Names become display labels: unique among live agents, and free to change.
- `--resume-id` reopens one specific agent.
- Old records keyed by name are migrated in place, once, so every conversation that could be resumed still can. On my own setup, the migration kept all 67 session records and all 64 resumable conversations, checked against the backup it makes first.

The ids stay out of my way. I still see and use names. Agents can look up ids with a command when they need one.

## The product call: when to stop and add structure

Name as id was a product decision as much as a technical one. It got tmux-agents into my hands fast, and using it every day is what told me where it needed to grow: running several agent chains, reopening agents days later, wanting to rename them.

My part was the product side. AI wrote all the code. Name as id was fine until the agents and I started talking about renaming agents. Thinking it through, we realised that a new agent taking a name from an old session would overwrite that session's history. That could already have happened without anyone noticing. That was the moment to stop and do ids properly.

## Guard rails, built as problems showed up

Fixing each bug wasn't enough. I wanted the next agent working on tmux-agents, or me, not to make the same kind of mistake. So over the same few days, each problem left something behind:

- **A process budget test.** Building the agent list once launched about 850 processes and took 4.5 seconds on my real setup (about 2,650 processes on a larger test fixture). It now uses 12 to 15 processes and takes 0.1 seconds, and a test fails if it goes above 20.
- **A "needs you" regression suite,** so finished agents don't get flagged as waiting for me again.
- **Decision records** in `docs/decisions/`, written before any change in behaviour.
- **Rules in `AGENTS.md`:** flaky tests block a release, a published tag never moves, and an agent replies as soon as the main work is done.
- **`tmux-ask` never drops a message.** If the receiver is gone, the message is saved and the sender is told.

These are rules about how the project ships: which tests must pass before a release goes out, and that a published release tag is never moved to a different commit. That's the product engineering part. The agents write the code, and I decide what "done" and "safe" mean.

## Move fast, add proper engineering when needed

Prototype fast, and let the simplest thing carry you. Name as id was the right call at the start. It let tmux-agents ship and get used, which is how I found out where it didn't hold.

Then add structure exactly where real usage shows it's needed, not before. And when something breaks, don't stop at the fix. Write the lesson down where the next agent will read it, or better, turn it into a test that fails.
