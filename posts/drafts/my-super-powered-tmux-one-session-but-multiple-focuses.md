---
draft: true

title: "My Super Powered Tmux - One Session But Multiple 'Focuses'"
date: 2025-10-14
eleventyNavigation:
  key: my-super-powered-tmux-one-session-but-multiple-focuses
---

## tl;dr - Outline

- I like to have one "master" tmux session running on my MacBook Pro
- That I can "attach" to from any of my devices (MacBook Air, iPad, iPhone)
- And even MacBook Pro itself, so I can have multiple terminal open on different macOS Desktops (more specifically Mission Control Desktops) and all focused on different projects.
  - If you are familiar with Tmux, you might get a sense of this won't work with just one "master" session.
- So whenever I "log in" from anywhere, any device, I see the same panes / windows in tmux.
- Kinda like a personal development operating system

Tmux can easily do that. Just `tmux new-session` and `tmux attach` from anywhere.

**BUT**

I'd also like each of the tmux client having their own focus, i.e. current window.

Because with one tmux session, there is only one global current window.

**HOW IT CAN WORK**

Tmux now support Session Groups. They share the **same set of windows**.

> “If -t is specified, the new session is grouped with the specified session. Sessions in the same group share the same set of windows.”

- Create your "master" tmux session like usual
```sh
tmux new-session -s main
```
- "Attach" / Create new client with this special parameter `-t` & also `new-session` (I know. Bear 🐨 with me. And yes, that is a koala but so cute!)
```sh
tmux new-session -t main [-A] -s <your-session-name>
```
`-A` will try to attach to that session first if it's there otherwise it will create a new session.


**My Special Sauce**

I use either device name / project name for the client session name.

On my iPhone / iPad, I use Blink with `mosh`. I have set up the default command when connecting to:

```sh
tmux new-session -t main -s iPhone / iPad
```

I also have this fish-shell one liner. Every time I need to use it. I can just `cd <full path>` or `z / zoxide <short hand>` into my project folders and run the command to start a project specific session.

```sh
tmux new-session -t main -A -s (basename (pwd))
```