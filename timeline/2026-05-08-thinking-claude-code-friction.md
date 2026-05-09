---
title: "thoughts: Claude Code friction while Codex is capped"
date: "2026-05-08"
time: "20:08"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - thinking
  - project-spire
  - venting
  - ai-agents
  - ai-assisted
---

Almost running out of my weekly Codex / GPT token usage, so I switched to Claude for a few hours.

Somehow the experience feels much higher friction.

It likes to spend a long time thinking even for relatively simple tasks. For example: "write this devlog for me." It already had detailed guidance ([ProjectSpire Devlogs CLAUDE.md](https://github.com/NicholasClooney/ProjectSpire/blob/e8ba523e386c9f19ef23863b8c270e1da4e530cb/Documentation/Devlogs/CLAUDE.md)) plus example documents in the same folder.

If it were GPT, it probably would have been done in seconds. Claude spent nearly a minute still "flabbergasting..." until I stopped it and asked what it was doing. Its response was essentially: "I was reading unnecessary documents."

Then there's the terminal behavior.

I wanted it to run some git commands, but it kept doing `cd project-root && git ...` everywhere. I genuinely do not understand why, because it can already execute commands from within the project context directly.

<figure style="text-align: center;">
  <img
    src="/assets/images/timeline/claude...claude...claude....jpg"
    alt="Claude Code repeatedly running git commands through cd into the ProjectSpire folder after being asked to switch to the project root once"
    style="width: 100%; height: auto; border-radius: 8px;"
  />
  <figcaption>Claude, Claude, Claude...</figcaption>
</figure>

I explicitly told it: "cd into the project root once and then run git commands directly without repeating cd." Nope. It still kept issuing `(cd ... && git ...)` commands until I corrected it a second time.

I'm genuinely having a hard time getting used to working with Claude. Curious what other people's experiences have been.
