---
title: "Smart AI Token Consumption"
date: 2026-04-16
tags:
  - ai
  - codex
  - workflow
excerpt: |
  A practical split between light and heavy models: use the smallest capable model for mechanical work, and reserve stronger reasoning for hard engineering problems.
---

One of the easiest ways to burn through tokens unnecessarily is to reach for a powerful model by default, even when the task does not warrant it. A more deliberate approach, matching model capability to task complexity, keeps costs low and latency fast without sacrificing quality where it matters.

## The Core Idea

Not all tasks are equal. Adding a timeline entry, running a git commit, following a skill template, or doing a routine push are mechanical operations. They do not need deep reasoning; they need speed and low cost. On the other hand, designing a new system, debugging a subtle concurrency issue, or writing a complex algorithm genuinely benefits from a more capable model with higher reasoning effort.

The practical split:

| Task type | Examples | Model | Reasoning effort |
|---|---|---|---|
| **Simple / mechanical** | Git commits, file edits, timeline entries, following skills, boilerplate generation | `gpt-5.4-mini` | `medium` |
| **Complex / engineering** | Architecture decisions, hard debugging, algorithm design, code review | `gpt-5.4` | `xhigh` |

## Codex Config

A reasonable `~/.codex/config.toml` setup with a sensible default and two named profiles:

```toml
model = "gpt-5.4"
model_reasoning_effort = "medium"
personality = "pragmatic"

[profiles.simple]
model = "gpt-5.4-mini"
model_reasoning_effort = "medium"

[profiles.complex]
model = "gpt-5.4"
model_reasoning_effort = "xhigh"
```

The default sits in the middle, capable enough for most ad hoc tasks without committing to max cost on everything. Switch to `--profile simple` for routine operations and `--profile complex` when you actually need the horsepower.

## The Mental Model

Think of it like choosing a tool from a toolbox. You do not reach for a power drill to tighten a loose screw. Routine Codex operations, the ones you run dozens of times a day, should default to the lightest model that gets the job done. Reserve the expensive reasoning budget for problems that genuinely need it.

This matters more than it might seem. High-frequency, low-complexity tasks are exactly where token costs compound quickly. Keeping those on `gpt-5.4-mini` with `medium` effort can cut daily usage significantly, while `xhigh` reasoning on a hard problem is worth the cost because you only pay for it when it counts.
