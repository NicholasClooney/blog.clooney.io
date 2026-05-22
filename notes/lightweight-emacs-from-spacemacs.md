---
title: "Building a Lightweight Emacs Config After Spacemacs"
date: 2026-05-22
tags:
  - emacs
  - dotfiles
  - workflow
excerpt: |
  Migrating from Spacemacs to a much smaller hand-rolled Emacs config: what I kept, what I removed, and how the new setup was implemented.
---

I recently migrated from Spacemacs to a much smaller hand-rolled Emacs config.
The goal was not to abandon the Spacemacs UX. The goal was to keep the parts
that were genuinely valuable while removing the parts that made the editor feel
like a full operating system.

This post walks through what I kept, what I removed, and how the new setup was
implemented.

[[toc]]

## Why move away from Spacemacs?

Spacemacs was doing too much.

It gave me a few things I genuinely liked:

- very solid Vim simulation via `evil`
- Magit with Evil bindings
- the Space leader key and discoverable key menus
- muscle-memory bindings like:
  - `SPC f s` save file
  - `SPC q q` quit
  - `SPC g g` open Magit

But it also came with a lot of framework machinery:

- layers
- startup abstractions
- package orchestration
- UI conventions I did not fully control
- a lot of bundled behavior I did not actually need

The answer was not to tweak Spacemacs harder. The answer was to build a smaller
config around the exact interaction model I wanted.

## Migration strategy

The key decision was to treat this as a clean rebuild, not a conversion.

The old setup was preserved:

- `~/.emacs.d.spacemacs-2026-05-22`
- `~/.archive/.spacemacs.d`

Then a new config was built from scratch in `~/.emacs.d`.

That separation mattered. It meant I could:

- archive the old framework safely
- inspect old config behavior when needed
- selectively port ideas instead of dragging framework assumptions forward

An alternate launcher was also added so the archived Spacemacs setup can still
be opened with:

```sh
~/.bin/emacs-spacemacs
```

That launcher uses Emacs `--init-directory`, so there is no need to swap
directories back and forth.

## Design principles

The new config follows a few strict rules:

- `init.el` stays the real entry point
- `early-init.el` exists only for startup work that must happen early
- modules live under `lisp/`
- the package set stays intentionally small
- portability is about behavior, not copying framework code

The result is a config that is easier to read, easier to debug, and much easier
to extend without fear.

## What the new config keeps

The new config preserves the interaction model that made Spacemacs pleasant:

- `evil`
- `evil-collection`
- `general`
- `which-key`
- `magit`

Key bindings that were carried over:

- `SPC SPC` for `M-x`
- `SPC f f` for tracked Git files
- `SPC f F` for general file search
- `SPC f s` save
- `SPC f e d` open `init.el`
- `SPC f e r` reload config
- `SPC g g` Magit
- `SPC q q` quit Emacs
- `SPC 0` delete other windows
- `SPC 1` delete current window
- `SPC 9` zen

This is the core of the UX. Once those were back, the new config already felt
familiar.

## Module layout

The config is deliberately flat and explicit:

```text
~/.emacs.d/
├── early-init.el
├── init.el
├── custom.el
└── lisp/
    ├── bootstrap.el
    ├── completion.el
    ├── core.el
    ├── docs.el
    ├── evil-setup.el
    ├── git-setup.el
    ├── keys.el
    ├── languages.el
    ├── modeline.el
    ├── theme.el
    ├── ui.el
    └── vendor/
        └── spacemacs-theme/
```

Each file owns one broad responsibility:

- `bootstrap.el` handles first-boot package installation
- `completion.el` owns Helm plus minibuffer completion
- `evil-setup.el` owns modal editing behavior
- `git-setup.el` owns Magit behavior
- `keys.el` owns leader bindings
- `docs.el` owns Markdown support
- `languages.el` owns lightweight review helpers and language modes

This keeps `init.el` short and makes changes easy to localize.

## Early startup and theming

One of the first quality problems was the startup flash.

With a normal package-installed theme, Emacs starts in its default appearance,
then later applies the theme after package setup. That creates a brief but
noticeable flash of unstyled Emacs.

Spacemacs avoids much of that because it owns the startup path more
aggressively. To borrow that idea without pulling in the framework, the theme
was vendored into the repo:

- `lisp/vendor/spacemacs-theme/`

Then `early-init.el` was used to:

- add the vendored theme directory to `load-path`
- add it to `custom-theme-load-path`
- load `spacemacs-dark` before the normal init sequence

That means the first frame and even the bootstrap installer can come up with
the final theme already active.

The vendored theme was also diffed against the locally installed ELPA copy and
the core theme file was synced where needed, so the repo is not intentionally
carrying an older version.

## The bootstrap installer

Spacemacs has a surprisingly good first-boot experience. When it installs
packages, it does not just dump messages into the echo area. It shows a
dedicated full-screen startup buffer with clear progress.

That was worth keeping.

Instead of copying the whole Spacemacs startup framework, a much smaller
bootstrap buffer was implemented:

- full-screen `*bootstrap*` buffer
- explicit progress bar in the header line
- visible `Installing packages x/y: package-name` log
- newest install entries shown at the top of the log section
- packages activated immediately after installation on first boot

This preserves the reassuring startup feedback without reintroducing framework
weight.

## Completion and file finding

The config uses two completion worlds on purpose.

For modern minibuffer completion:

- `vertico`
- `orderless`
- `marginalia`
- `consult`

For the older Spacemacs-style file picker:

- `helm`
- `helm-flx`
- `helm-ls-git`

This was one of the trickier parts of the migration.

At one point `SPC f f` was showing Git branches instead of files. Later it
started erroring with:

```text
Symbol’s value as variable is void: helm-source-ls-git
```

The root cause was that newer `helm-ls-git` defaults to a multi-source Git
dashboard and builds some of its internal sources lazily. The fix was not to
fight those internals ad hoc. The fix was to look at the actual old behavior
and then configure the package upfront:

- old Spacemacs bound `SPC f f` to `helm-ls-git`
- the new config now does the same
- `helm-ls-git-default-sources` is restricted to tracked files

That restored the compact tracked-file picker that matched the original muscle
memory.

## Magit behavior

Magit itself was easy to keep. The annoying part was how it behaved when opened
from an empty `*scratch*` buffer.

An early cleanup attempt killed `*scratch*` when launching Magit. That looked
nice on the way in, but it broke the way Magit returned on quit. Leaving Magit
could drop me into `*Messages*`, which was not what I wanted.

The fix was simple once the behavior was understood:

- open Magit in a same-window style
- if launched from an empty `*scratch*`, bury that buffer instead of killing it

That keeps the screen clean while still giving Magit a sane previous buffer to
return to.

## Modeline and UI

The stock Emacs modeline was too noisy. The full Spacemacs modeline stack was
too heavy.

So the middle path was:

- build a custom lightweight modeline
- put it in its own module
- style it so it feels closer to the Spacemacs visual language

That modeline focuses on the useful information:

- Evil state
- buffer name
- modified state
- position
- major mode
- Git branch

The result is much more intentional without reintroducing a large dependency
stack.

## Docs and language support

After the core editor experience was stable, a thin content layer was added.

Documentation support:

- `markdown-mode`
- `gfm-mode` for `README.md`
- `visual-line-mode` for prose

Review helpers:

- `diff-hl`
- `hl-todo`
- `rainbow-delimiters`

Language/file-type support:

- Swift
- HTML
- JavaScript
- Nunjucks
- JSON

This is intentionally not a full IDE stack. It is just enough to review,
navigate, and edit comfortably without turning the config into another distro.

## What this project actually achieved

The most useful outcome is not “a custom Emacs config.” The useful outcome is a
config with a clear philosophy:

- small enough to understand
- strong enough to feel polished
- familiar enough to preserve old habits
- flexible enough to evolve without framework drag

Spacemacs was valuable as a reference point. But the best parts turned out to
be portable:

- leader-driven UX
- Evil
- Magit
- strong startup experience
- deliberate theme/modeline choices

Everything else was negotiable.

## Final thought

This migration worked because the goal was never purity.

The goal was not “vanilla Emacs.”
The goal was not “minimalism at all costs.”
The goal was to keep the good ergonomics and remove unnecessary machinery.

That is a much more practical way to build editor tooling: preserve the parts
that earn their cost, and rebuild the rest in a form you can actually own.
