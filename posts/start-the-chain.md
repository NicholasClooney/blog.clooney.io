---
title: "Start the Chain: My Three-Agent Setup Is Now One Command"
date: 2026-10-12
time: "12:30"
tags:
  - ai
  - agents
  - tmux-agents
  - workflow
  - tooling
  - product-engineering
excerpt: |
  The main agent, secondary and worker setup I pieced together by hand is now
  built into tmux-agents. One command starts the chain, a script starts one for
  every project after a reboot, and /resume brings back the conversations.
---

In [Messy Chat with Your Agents?](/posts/the-agent-that-only-talks-to-me/) I added one more agent to my setup: a main agent whose only job is to talk to me. It hands work to a secondary, which coordinates a Codex worker, which splits the work across its own spawned agents. I only ever talk to the main agent.

That setup started as a few paragraphs in one project's `AGENTS.md`. A week later it's built into [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), and I run it in every project.

[[toc]]

## From a recipe to one command

The first time, I set it up by hand. Open a new pane, connect it to the existing Claude agent, tell it that it's now the main agent and only talks to me, tell the old agent that it's now the coordinator, and make sure the main agent is *not* connected to Codex. It worked, but it was a recipe I had to repeat for every project.

Now the roles live in the [agent-chain skill](https://github.com/TheClooneyCollection/tmux-agents/blob/main/skills/agent-chain/SKILL.md). I tell a Claude agent "start the chain" and it does the rest: it renames itself to the main agent, spawns the secondary to its right, and spawns the worker below the secondary. Or, from a shell:

```sh
tmux-agents start chain ~/Source/Projects/my-project
```

That opens a new window for the project and starts Claude with "start the chain" as its first prompt.

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/start-the-chain/chain-in-one-window.png"
    alt="One tmux window with the blog's main agent on the left, the secondary Claude agent top right and the Codex worker bottom right"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>The blog's chain, while I was telling the main agent what to write in the "After a restart" section below: main agent on the left, secondary top right, Codex worker bottom right.</figcaption>
</figure>

## What changed with real use

The idea stayed the same. A few details changed once I'd lived with it for a week.

**FYIs are notices, not requests.** The original rules said to mark FYIs "no reply needed". That wasn't enough. In tmux-agents a request puts the receiver back to work and makes the sender wait for an answer, whatever the text says. So an agent that had finished got woken up by an FYI, and if it then didn't reply, it showed up as needing me. Now there's a separate notice message that expects no reply and no work.

**The secondary and worker are members, not sub-agents.** At first the chain was built from ordinary spawned agents. That meant they showed up in the sub-agent list and status chips next to short-lived helpers, and cleaning up finished sub-agents could close them too. Now they're long-lived members: out of the default list and bulk cleanup, but still flagged when they need me.

**The chain is visible.** Spawned agents normally run in hidden windows, and you peek at them from a list. For the chain I want all three on screen, so the secondary and worker open as splits in the main agent's window.

**The coordinator is called the secondary.** A small one, but every skill, guide and message now uses the same name for it.

## Across projects

The rule I like most is about projects talking to each other. Each project's secondary is its interface to other projects. Requests go secondary to secondary, and agents only edit their own project's files.

Here's a real one. When tmux-agents ships a release, the blog gets a timeline entry for it. When v1.12.2 went out, the tmux-agents secondary didn't open the blog repo and write the entry itself. It asked the blog's secondary, which wrote and committed it, then told the blog's main agent that the commit was ready but not pushed, because pushing deploys the site. The main agent asked me, and I pushed it.

Nobody reached into a project that wasn't theirs, and the one decision that needed me reached me as a single question.

## After a restart

I don't start chains one at a time anymore. I have a small script, `tmux-main-sequence`, that builds my whole tmux session: a dashboard window, a window for my home directory, one for the blog, and one for each project in a config file. Every window except the dashboard starts with a chain, using the same "start the chain" prompt.

{% github "https://github.com/TheClooneyCollection/dotfiles/blob/2dceed571bba97a9c62bdb4f11afe69abe9da16b/.bin/tmux-main-sequence" %}

That's great right up until the machine restarts. tmux goes away with every agent in it. Running `tmux-main-sequence` again brings back all the windows and starts fresh chains, but they're *new* sessions. The main agent no longer knows what we were talking about, and the secondary has forgotten which decisions were made.

This isn't specific to my script. It happens to anyone using `tmux-agents start chain`: after a restart the chain starts over, and the context is gone.

The fix is simple. Both Claude Code and Codex keep their past sessions on disk, and both have a `/resume` command that lets you search them. So after a restart, I run `/resume` in the main agent's pane, search for the old session, and pick up where we left off.

Usually that's the only one I resume. A fresh secondary and worker are fine when nothing important was in flight. But it's case by case: if the secondary or the worker was in the middle of something that matters, I resume them too, so the work picks up where it stopped instead of starting over.

Resuming works much better if your sessions have names. If they're called something like "blog main agent" and "blog secondary", finding the right one takes a second. If they're not, you're scrolling through a list of first prompts that all say "start the chain".

## Try it

Install tmux-agents, the agent-chain skill included, with the [skills CLI](https://skills.sh):

```sh
npx skills add TheClooneyCollection/tmux-agents -g
```

Then tell your agent "set up tmux-agents", and once that's done, "start the chain".
