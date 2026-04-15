# CLAUDE.md

If you are working directly in the **11ty-subspace-builder** repository, read `CLAUDE.subspace.md` for project-specific context and conventions.

If you are working in a downstream project that uses this as a base or dependency, this file does not apply — refer to that project's own CLAUDE.md instead.

If you are working in the **blog.clooney.io** site, read `CLAUDE.blog.md` for editorial workflows including how to write and log timeline entries.

## Script usage

To check the latest Cloudflare Pages deployment, run:

`op run --env-file=.env -- python3 scripts/check_cloudflare_pages.py`

## Caution for agents

Never read `.env` directly. When a task needs secrets from 1Password-mounted environment files, always use `op run` with the relevant `--env-file` instead of inspecting or sourcing the file contents.
