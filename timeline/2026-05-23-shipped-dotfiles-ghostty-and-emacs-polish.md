---
title: "feature: Ghostty and Emacs polish in dotfiles"
date: "2026-05-23"
time: "21:14"
parent: "/timeline/2026-05-22-shipped-dotfiles-lightweight-emacs-and-tmux/"
tags:
  - shipped
  - dotfiles
  - emacs
  - ghostty
  - tmux
  - workflow
  - terminal
---

I shipped [v2026.05.2](https://github.com/TheClooneyCollection/dotfiles/releases/tag/v2026.05.2) of [dotfiles](https://github.com/TheClooneyCollection/dotfiles) as a follow-up polish pass on yesterday's tmux and Emacs reset.

This release adds a basic macOS Ghostty config, restores a bunch of the small Spacemacs habits I still wanted like fuzzy `M-x`, Helm buffer switching, `avy` motion, `kj` insert escape, project ripgrep search, restart and pasteboard bindings, plus YAML mode for config editing.

I also tightened the repo's own agent and release docs with `AGENTS.md`, `CLAUDE.md`, and a clearer note that these tags are chronological snapshots rather than semver, which makes the setup feel more intentional and easier to keep evolving.
