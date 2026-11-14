---
title: "skill: Wrap up, then clear"
date: "2026-11-12"
time: "21:10"
tags:
  - shipped
  - ai
  - skills
---

I clear my agent sessions a lot now. Long sessions get slow and expensive, and after a while the agent is mostly rereading old tool output. The thing that kept me from clearing was the worry that something useful would go with it: a gotcha we hit, a decision and the reason for it, a half-finished branch.

So I wrote a small skill called [`wrap-up`](https://github.com/TheClooneyCollection/skills/blob/main/skills/wrap-up/SKILL.md). Before I clear, I say "wrap up" and the agent goes through the session and reports back. It changes nothing until I choose.

- **Lessons not yet written down.** Corrections I made, gotchas we found, decisions and why. It checks the repo docs, AGENTS.md, skills and memory first, and leaves out anything already there or obvious from the code.
- **Where each one should go, with the exact wording.** An AGENTS.md rule, a repo doc, a skill, or personal memory, plus one line on why.
- **What it would skip, and why.** I can overrule it, and it stops the notes from slowly piling up.
- **Unfinished work.** Running agents, open worktrees, uncommitted or unpushed changes, questions I never answered.

I pick the ones I want, it writes them, and I clear. Sometimes the answer is "none of these". The agent can work them out again quickly, and a note that is never needed is just more to read next time.

What I get out of it: clearing becomes a habit instead of a gamble. Sessions stay short and cheap, and the next agent starts from what was actually learned, not from 200k tokens of scrollback.

{% github "https://github.com/TheClooneyCollection/skills/blob/main/skills/wrap-up/SKILL.md" %}
