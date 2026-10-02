---
title: "The Agent That Only Talks to Me"
date: 2026-10-02
time: "19:25"
tags:
  - ai
  - agents
  - tmux-agents
  - workflow
  - tooling
excerpt: |
  With up to ten agents working on one project, the Claude agent I talked to
  was also juggling replies, merges and servers, and I kept waiting for my
  turn. The fix was one more pane: a main agent whose only job is to talk to
  me, while the old one became a coordinator.
---

For the last few days I've been running a lot of agents at the same time with [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents). On my Stone Age remake there can be five to ten agents working at once, plus a few more on lighter side projects. It mostly feels great. But it took one small change to the setup before it stopped feeling chaotic.

[[toc]]

## The setup

Codex is my main implementation worker on this project. I got a good deal on the Pro plan this month, so it does the heavy lifting: it takes a task, splits it up, and spawns its own sub-agents through tmux-agents, each working in a slot from my [worktree pool](/posts/i-gave-my-coding-agents-a-shared-worktree-pool/).

Between me and Codex sat a Claude agent. I'd talk to Claude, Claude would hand work to the main Codex agent, Codex would fan it out to its sub-agents, and the replies would flow back up the same chain. Add it all up and there could be ten agents running at once.

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/the-agent-that-only-talks-to-me/codex-sub-agents.png"
    alt="The tmux-agents list showing three working Codex sub-agents and two closed ones, with a live preview of one of them"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>The main Codex agent's sub-agents, as seen from tmux-agents: three working, two already closed.</figcaption>
</figure>

## The problem: one agent doing two jobs

The chain itself worked. The problem was the Claude agent in the middle, because it was doing two very different jobs.

One job was talking to me: answering my questions, asking me for decisions, taking new tasks. The other job was running the project: receiving reports from Codex, reviewing and merging its work, restarting the live servers, editing files. Both landed in the same conversation.

So its history turned into a stream of everything. A reply from Codex with a commit hash and a list of screenshots, then a cherry-pick, a changelog check, a server restart, a background build finishing. Somewhere in between, a question meant for me. Somewhere after that, my answer.

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/the-agent-that-only-talks-to-me/coordinator-before.png"
    alt="A Claude agent's history: a long reply from Codex, then a cherry-pick, a changelog check, stopping a server and relaunching it"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>Before: the agent I talked to was also merging Codex's work and restarting servers.</figcaption>
</figure>

Worse, I often had to wait for my turn. If Claude was in the middle of handling a Codex reply or running commands, my question sat behind that work. The agent I was supposed to be talking to was the busiest one in the room.

## The fix: one more pane

I added another Claude agent. That was the whole change.

I opened a new pane in the same tmux window, connected it to the existing Claude agent, and told it its role: you are now the main agent. You only talk to me. You don't write code, you don't run the project. Anything that needs doing, you hand to the other Claude, which is now the coordinator between us and the main Codex agent.

Nothing about the existing agents had to change. The old Claude kept its history, its connection to Codex, and its work in progress. It just stopped being the one I talk to.

I also deliberately did not connect the new main agent to Codex. If it could talk to Codex directly, Codex's reports would start flowing into my conversation again, and I'd be back where I started. The main agent has exactly one peer: the coordinator.

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/the-agent-that-only-talks-to-me/main-and-coordinator.png"
    alt="Three tmux panes: the main Claude agent on the left chatting with me, the coordinator Claude top right, and the main Codex agent bottom right sending requests to its sub-agents"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>After: the main Claude on the left only chats with me. The coordinator (top right) talks to the main Codex agent (bottom right), which talks to its sub-agents.</figcaption>
</figure>

In that screenshot the main agent asks me to decide whether some quest NPCs are shared across the server or tracked per character. I answer "B", and it passes the decision on to the coordinator. When the coordinator replies that Codex has it and the decision is written down, the main agent tells me in one line: this one's done, nothing needed from you.

## Writing the roles down

Telling the new agent its role worked for the moment. To make it stick, so that any agent reading the project knows who does what, I wrote the roles and the message rules into the project's `AGENTS.md`. This is the section, with the agent names left in:

```markdown
## Agent roles and messages

Three agents work together in tmux panes: main agent → coordinator → worker.

- **main agent (Claude, `claude-projects-stone-age-2`)**: interfaces with the user
  and the other agents: clarifies intent, turns it into self-contained tasks and
  relays user decisions. Does not investigate or implement.
- **coordinator (Claude, `claude-projects-stone-age-1`)**: coordinates Codex and
  owns the main checkout: merges Codex commits, runs importers, backs up saves,
  relaunches the server, runs tests and records decisions in docs. Sends anything
  that needs a user decision to the main agent, not to the user.
- **worker (Codex, `codex-projects-stone-age-1` and its sub agents)**: main
  implementer. Sub agents split work by file ownership to avoid conflicts.

Messages:

- Everything goes through `tmux-ask`. Long reports go in a file; the message is a
  short summary plus the path.
- The user reads coordinator→main agent messages directly, so the main agent does
  not restate them; it surfaces a decision as a one-line summary plus options.
- Mark FYIs "no reply needed". A decision request states the default and what is
  blocked meanwhile.
- An instruction the user gives directly to any agent wins; that agent tells the
  others what changed.
```

A few of these rules turned out to matter more than I expected. "Sends anything that needs a user decision to the main agent, not to the user" is what keeps the coordinator from quietly becoming the agent I talk to again. "States the default and what is blocked meanwhile" means a decision request tells me what happens if I ignore it for an hour. And "an instruction the user gives directly to any agent wins" leaves me a way around the chain: I can still type into any pane when I need to, and the agent I talked to is responsible for telling the others.

## Before and after

**Before:** the coordinator was busy all the time. Messages kept coming in from Codex, it kept asking me for decisions, it kept running commands. Getting a question or a task to it meant waiting for a gap.

**After:** I just talk to the main agent. It answers what it can, and dispatches the rest to the coordinator, which may in turn hand it to Codex. The coordinator's replies land in the main agent's pane, so I can read them as they arrive, and the main agent doesn't repeat them. It only steps in when something needs me, with a one-line summary and the options.

## Why this works

Looking at it afterwards, I think a few things are going on.

**It splits the conversation from the work.** Before, my conversation and the project's operations shared one history. Now they live in two. The main agent's history is only me and the things I asked about, so it reads like a conversation again. All the noise (reports, merges, logs, restarts) still exists, it just piles up in the coordinator, where nobody has to read it unless something goes wrong.

**The agent I talk to is always free.** Because the main agent does almost no work itself, it's almost never in the middle of a long turn. My message doesn't queue behind a server restart or a code review. It gets read now. Waiting moved off me and onto the agents, which is where it belongs.

**Its context stays small.** In the screenshot the main agent is at 90k tokens, 9% of its window, while the coordinator is at 300k, 30%. Part of that is just that the main agent is younger, but it also only grows with our conversation, not with every report that passes through the project. A smaller, cleaner context is one the agent can actually keep track of.

**Decisions arrive in a shape I can answer.** The coordinator's messages to the main agent are short summaries, and FYIs are marked as not needing a reply, so I can skim them. When a decision is needed, the main agent turns it into one line with the options spelled out, along with the default and what's blocked in the meantime. Picking between A and B takes a second. Digging that same question out of a stream of Codex reports did not.

**There's only one path.** Me, main, coordinator, Codex, sub-agents. Because main and Codex aren't connected, there's no shortcut where a conversation can split into two places. Every piece of information has one obvious route in and one route back.

It's not free. Every request now takes one more hop, which costs a bit of time and a few more tokens, and each hand-off is a summary, so detail can get lost along the way, like a game of telephone. For a project with this many agents, that trade has been well worth it so far. I haven't been running it this way for long, though, so I can't say much yet about how it holds up over weeks.

## What I took away

The surprising part is how little it took. No new tool, no changes to tmux-agents, no restart of the agents already working. One new pane, one connection, and a few sentences describing a role.

It's the same lesson as the worktree pool, from a different angle: with many agents, the interesting problems aren't in any single agent. They're in the shape of how the agents connect to each other and to me. Once the agent I talk to stopped also being the agent that does the work, the whole setup got quieter.
