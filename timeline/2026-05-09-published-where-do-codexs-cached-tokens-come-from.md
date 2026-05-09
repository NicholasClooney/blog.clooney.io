---
title: "note: Where Do Codex's Cached Tokens Come From?"
date: "2026-05-09"
time: "11:15"
tags:
  - published
  - ai
  - codex
  - openai
  - tokens
---

Published [Where Do Codex's Cached Tokens Come From?](/notes/where-do-codexs-cached-tokens-come-from/), a note explaining why Codex can report millions of cached tokens after a run even when the actual prompt context is much smaller. The useful bit is that Codex's append-only agent loop keeps earlier messages as an exact stable prefix, so cache hits accumulate across repeated model calls in the same session.
