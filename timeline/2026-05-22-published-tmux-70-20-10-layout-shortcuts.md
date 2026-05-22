---
title: "note: Tmux 70/20/10 Layout Shortcuts"
date: "2026-05-22"
time: "07:26"
tags:
  - published
  - tmux
  - cli
  - workflow
  - terminal
---

Published [Tmux 70/20/10 Layout Shortcuts](/notes/tmux-70-20-10-layout-shortcuts/), a note about building a one-keystroke tmux layout that creates a stable `70/20/10` vertical stack and only allows pane swapping when the window is explicitly tagged as that layout. The useful part was not just the final `run-shell` binding, but the testing approach: using detached tmux sessions plus `list-keys`, `list-panes`, and `show-options` as a lightweight TDD harness before touching the real config. This is one piece of a broader terminal and editor workflow cleanup, and I want to write that larger tmux plus lightweight Emacs story up properly soon.
