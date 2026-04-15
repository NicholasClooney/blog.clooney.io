# CLAUDE.md

If you are working directly in the **11ty-subspace-builder** repository, read `CLAUDE.subspace.md` for project-specific context and conventions.

If you are working in a downstream project that uses this as a base or dependency, this file does not apply — refer to that project's own CLAUDE.md instead.

## Git history: linear only

This applies to this repo and to every downstream site built on it.

- Keep history linear. No merge commits and no squash merges; always rebase.
- Integrating a branch into `main`: rebase the branch onto `main`, then `git merge --ff-only <branch>`. If it can't fast-forward, rebase again; never fall back to a merge commit.
- Bringing `main` (or upstream builder changes) into a branch: `git rebase main` (or rebase onto the upstream ref), never `git merge main` or `git pull` without `--rebase`.
- Keep each commit as written; don't squash a branch into one commit when landing it.

If you are working in the **blog.clooney.io** site, read `claude.blog.md` for editorial workflows including how to write and log timeline entries.

## Script usage

To check the latest Cloudflare Pages deployment, run:

`op run --env-file=.env -- python3 scripts/check_cloudflare_pages.py`

## Caution for agents

Never read `.env` directly. When a task needs secrets from 1Password-mounted environment files, always use `op run` with the relevant `--env-file` instead of inspecting or sourcing the file contents.
