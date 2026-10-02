---
title: "I Gave My Coding Agents a Shared Worktree Pool"
date: 2026-10-02
time: "10:15"
tags:
  - ai
  - agents
  - git
  - workflow
  - tooling
excerpt: |
  Claude, Codex and their sub-agents each got their own git worktree, and my
  disk quietly filled up with copies of an 8GB game project. The fix was a
  small script that makes agents borrow worktrees from a shared pool instead
  of creating new ones.
---

I've been having a lot of fun building my Stone Age remake with Claude and Codex. Most days there are several agents going at once: one on a UI screen, one chasing an importer bug, a couple of sub-agents doing research or cleanup. Each of them works in its own git worktree, so nobody steps on anybody else's checkout.

That part worked well. The part I hadn't thought about was what they left behind.

[[toc]]

## The disk filled up while I wasn't looking

The project carries roughly 8GB of game assets. A worktree is cheap for git, but every fresh checkout of this project also wants its own copy of those assets, plus its own Godot import cache. Agents create a worktree, do their task, and move on. Nobody cleans up. Not the agents, and honestly, not me either.

So the worktrees piled up until my disk ran low. This morning I opened DaisyDisk and cleared them out. My estimate is that I removed somewhere between 300 and 400GB of worktrees. That's an estimate, not a careful measurement.

## Parallel work is easy, cleanup is the real job

Handing agents parallel tasks is the easy part. Every agent tool makes it one command or one instruction away. What nobody hands you is a rule for the resources those tasks consume. Each agent made a locally sensible choice ("I need an isolated checkout, I'll make one") and the sum of those choices was a full disk.

That changed how I think about this workflow. If I want to keep running several agents on a project I care about, then managing what they leave behind is part of the workflow, not an afterthought. It's the same as with people: a team that only ever creates branches and never deletes them eventually drowns in them.

## The rule: borrow a slot, give it back

So I introduced one rule for every agent on the project: you don't create worktrees, you borrow one from the pool.

The pool is a small Python script. It keeps a fixed set of reusable worktree slots (`pool-a`, `pool-b`, ...). An agent acquires a slot for a branch, does its work, and releases the slot when the branch is merged. The next agent gets the same folder back, already set up.

A few details make it work in practice:

- **It starts small and grows on its own, up to a limit.** The pool starts with five slots and creates more when every slot is busy, up to ten. Past ten it stops and tells the agent to ask me. If I say yes, the agent reruns with `--approved-by-user`. The script can't verify who actually approved it. It's a speed bump that turns "quietly make another 8GB copy" into a question, not a security boundary.
- **Leases live in the git common directory.** Every worktree shares the repo's `.git` directory, so the lease file there is visible from all of them, and git never tracks it. A file lock around every acquire and release keeps two agents from grabbing the same slot at the same time.
- **Release is strict on purpose.** A slot with uncommitted changes, or a branch that isn't merged yet, is refused. An agent can pass `--abandon` to drop unmerged work deliberately, and the branch and its commits stay either way.

## Sharing the heavy folders

Reusing slots stops the number of worktrees from growing. The other half is making each slot cheap.

Most tasks only read the assets, so in my project the read-only folders, and normally the game assets too, are symlinks back to the main checkout. Eight slots pointing at one copy of the assets cost almost nothing.

Some tasks do need to write to the assets, for example when I'm changing an importer. For those, the agent asks for its own copy, and the script makes an APFS copy-on-write clone (`cp -c` on macOS). The clone shares disk blocks with the original until something actually changes, so it's fast to create and only grows by what the task modifies. The Godot import cache gets the same treatment in every slot, refreshed whenever the main checkout's cache is newer.

Here's a short session from a throwaway repo:

```text
$ worktree_pool.py acquire --owner claude --branch feat/inventory --task "inventory screen"
~/projects/game.worktrees/pool-a
$ worktree_pool.py acquire --owner codex --branch fix/sprite-import --task "fix sprite importer" --own assets/raw
~/projects/game.worktrees/pool-b
$ worktree_pool.py status
pool-a  claude         feat/inventory             0.0h  inventory screen
pool-b  codex          fix/sprite-import          0.0h  fix sprite importer
pool-c  free (created on first use)
pool-d  free (created on first use)
pool-e  free (created on first use)
pool: 2 created, 2 leased; grows by itself up to 10, more needs a human
$ worktree_pool.py release pool-b
fix/sprite-import is not merged into main; merge it first, or rerun with --abandon (the branch and its commits stay).
$ git merge fix/sprite-import && worktree_pool.py release pool-b
released pool-b (branch fix/sprite-import kept)
```

Agents get the slot's path from `acquire` and `cd` there. I added a short section to the project's `AGENTS.md` telling Claude and Codex to always go through the pool, and to ask me rather than pass `--approved-by-user` on their own.

## A version you can adapt

My original script is tailored to this one project: macOS, Godot, and hardcoded folder names. For this post I made a more general version. It's one file with no dependencies beyond Python 3.8 and git, and it reads a small `worktree-pool.json` that you commit with your project:

```json
{
  "symlink": ["references"],
  "clone": [".cache/import"],
  "symlink_unless_owned": ["assets/raw"]
}
```

- `symlink`: folders every slot reads but never writes.
- `clone`: folders every slot gets its own copy of, like build or import caches.
- `symlink_unless_owned`: shared by default, copied when a task asks with `--own PATH`.

Copies use APFS clones on macOS, reflinks where Linux supports them, and plain copies otherwise. The base branch is detected from your remote, and the pool lives next to your checkout in `<repo>.worktrees/`. Run `worktree_pool.py init` to get an example config.

One gotcha I hit while testing: every configured folder has to be gitignored, and the pattern has to match a symlink too. `assets/` with a trailing slash only matches directories, so git reports the symlink in each slot as a new file. Write `assets` instead. The script warns you when this happens.

{% github "https://gist.github.com/NicholasClooney/feab42b78ee881bd486c64bbccfbcbdb/dd027d6af7157777ad54a0e7c877a36b0ebfe8cc?file=worktree_pool.py" %}

To be clear about what this is: the general version is new. I've exercised it in scratch repos on macOS, but I haven't run it on Linux, or under a heavy load of concurrent agents, or for long enough to say anything about its reliability. The 300 to 400GB is what I deleted by hand, not a saving I've measured from the pool. I think the approach is useful well beyond my project, but I haven't shown that yet.

## What I learned about agent infrastructure

I didn't set out to design an agent framework. I set out to make a game, and my agents created a real problem in a project I love working on. The fix turned out to be small and boring: a lease file, a lock, some symlinks, and one rule.

That's probably the lesson. Agents are very good at doing the task in front of them and very bad at noticing what their task costs everyone else. Disk is just the first resource where I felt it. The workflows that last will be the ones where the shared resources (disk, ports, simulators, API budgets) have an owner, a limit, and a way to be handed back.
