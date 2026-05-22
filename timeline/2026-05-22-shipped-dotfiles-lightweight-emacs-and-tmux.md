---
title: "feature: Lightweight Emacs migration and tmux workflow"
date: "2026-05-22"
time: "10:01"
tags:
  - shipped
  - dotfiles
  - emacs
  - tmux
  - workflow
  - terminal
---

I shipped [v2026.5.1](https://github.com/TheClooneyCollection/dotfiles/releases/tag/v2026.5.1) of [dotfiles](https://github.com/TheClooneyCollection/dotfiles), which pairs a nicer tmux workflow with the move away from the old Spacemacs setup into a smaller hand-rolled Emacs config. The tmux side gives me a one-keystroke `70/20/10` vertical layout plus a safe top-and-middle pane swap, while [PR #2](https://github.com/TheClooneyCollection/dotfiles/pull/2) keeps the core editor ergonomics I care about like Evil, leader keys, Magit, Helm-style tracked file finding, and early theme loading without the extra framework machinery. This is the point where the repo feels easier to understand and own, and I want to do a fuller write-up on the tmux and "Subspacemacs" workflow soon.
