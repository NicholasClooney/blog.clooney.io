---
title: "My Super Powered Tmux - One Session But Multiple 'Focuses'"
date: 2025-10-14
eleventyNavigation:
  key: my-super-powered-tmux-one-session-but-multiple-focuses

social:
  linkedin-post:
    status: shared
    lastShared: 2025-10-29T16:58:13.076Z
  linkedin-article:
    status: shared
    lastShared: 2025-10-29T16:58:19.231Z
---

## tl;dr

- I keep a single "master" tmux session running on my MacBook Pro.
- Every device (MacBook Air, iPad, iPhone) attaches to that same set of panes.
- Each device still gets an independent focused window thanks to tmux session groups.
- The result feels like a personal developer operating system that follows me everywhere.

## The itch

I want tmux to feel like one cohesive environment that never goes away. When I am docked at my desk, I spread iTerm across multiple Mission Control desktops and keep a different project on each space, with some other tools I need for that specific project. Later, when I grab my MacBook Air or open Blink on my iPhone or iPad, I want those exact same panes, command histories, and scrollback.

Plain `tmux attach` gets close, but the shared "current window" breaks the illusion. When I switch to another window in my main terminal, all other tmux clients jump to the same window and interrupts whatever flow I was in. I wanted tmux to be stateful *and* multi-focus.

[[toc]]

## Tmux session groups to the rescue

Tmux has a not-so-secret feature called **session groups**. Sessions in the same group share windows but keep their own focus. In other words: one canonical set of panes, multiple independent views.

The manual (run `man tmux`) explains it this way:

> If `-t` is specified, the new session is grouped with the specified session. Sessions in the same group share the same set of windows.

The workflow looks like this:

```sh
# Start the canonical session that will own the pane layout.
tmux new-session -s main

# From any other terminal (or the same machine on a different desktop),
# create or attach to a grouped session.
tmux new-session -t main [-A] -s <client-name>
```

The `-A` flag tells tmux to attach if the session already exists, otherwise it will spawn a fresh grouped session. Each grouped session keeps its own focus, so one device can live in a REPL while another tails logs.

## How I structure my sessions

- **`main`** starts at login on my MacBook Pro. It almost never dies; it is the canonical window layout.
- **Device sessions** are named after the hardware (`air`, `iPad`, `iPhone`). They join the group the moment I connect.
- **Contextual sessions** are group members created for a particular project (`subspace`, `blog`, `ansible`, etc). They let me dedicate a Mission Control desktop or a tmux tab to a single focus without cloning panes.

The beauty is that I can close a contextual session and the panes stay alive in `main`. When I go back to that project, I create the same contextual session and tmux restores the focus right where I left it.

## Automating the entry points

**Fish shell helper**

```sh
# ~/.config/fish/functions/tmux-project-session.fish
function tmux-project-session
  tmux new-session -t main -A -s (basename (pwd))
end
```

I alias this to `tm` so I can `cd repo && tm` and instantly get a project-specific focus that shares the master pane layout.

**Blink + mosh defaults**

Blink allows a default command per host. Mine looks like:

```sh
tmux new-session -t main -A -s iPhone
```

The device auto-joins the group the moment Blink connects, so I am looking at the same panes before the status bar finishes animating.

## What it looks like

When the MacBook Pro is churning through a heavy build in the study, I flip open Blink on the iPad, join the `main` group, and keep `macmon` on screen to watch CPU, memory, and temperature from the couch. Same panes, totally different device, zero context lost.

<img
  alt="Monitoring my MacBook from the iPad via tmux and macmon"
  src="/assets/tmux-on-iPad.jpeg"
/>

Back on the Mac, Mission Control gives each desktop its own grouped session so I can dedicate full-screen spaces to specific projects. This is what a pair of grouped sessions looks like—same windows, each with its own focus.

<img
  alt="Two grouped tmux sessions on macOS with independent focuses"
  src="/assets/tmux-on-mac.png"
/>

## Quality-of-life tweaks

- **Status line**: I include `#S` in the tmux status bar, so it reads `[main]`, `[ipad]`, `[blog]`, etc. A quick glance tells me which focus I am looking at.
- **History sync**: Tools like `fzf` or `zoxide` keep shell history and directory jumping consistent across sessions. Combined with tmux groups, every device feels like one long-lived terminal.

## Your own personal dev OS

Once session groups click, tmux feels like a remote-first operating system. I can leave a long-running task overnight on the MacBook Pro, pick up an iPad in the morning, and resume without caring which machine started it. Give it a try: keep a `main` session alive, spin up a second one with `tmux new-session -t main -s experiment`, and notice how your focus stays independent. A little scripting turns it into a habit, and your terminals start to feel **super powered**.
