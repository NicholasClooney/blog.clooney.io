---
title: "Eleven Themes, One Share Card"
date: 2026-11-16
time: "12:00"
draft: true
tags:
  - ai
  - web-development
  - design
excerpt: |
  OUTLINE, not the post. A reader picks a theme, but a share card is picked once
  for everyone. How eleven themes collapsed into one card style, designed by two
  agents in parallel and reviewed on a phone.
---

<!--
Outline only. Write the full post after the new cards are live, using real
generated cards, and end with this post's own card.
Publish checklist: zh version, timeline entry, add to the AI-Assisted
Engineering series right after the themes post, and add one closing line to the
themes post (en and zh) linking here.
-->

[[toc]]

## A theme can follow the reader, a share card can't

- Opening: the themes post ended with eleven skins and Fun mode. Then I shared a link and saw the same old card.
- The theme lives in the reader's browser. The share card is rendered once at build time and shown to people who have never visited.
- So eleven themes collapse to one choice per site. Kind, date and series can still vary the card; the look can't.
- Show: today's card next to the new one (real generated images).

## Two designers in parallel

- Claude and Codex each drew their own set of cards from the same brief (Swiss, Retro sci-fi, Glass), into one lab page.
- Every card has an ID and a Copy ID button, so I could review on my phone and reply with "C2-glass-series2-dark: progress bar to the bottom".
- That habit is now part of the design-lab skill (link the skills release).
- Show: a strip of round 1 cards from both agents.

## The small human notes

- The orbit drawn behind the sun. Physically wrong, and it bothered me.
- "06 / 12" read like a date, not a part number. Now always "Part 6 of 12".
- The big TIMELINE label said nothing; the kind tag in front ("shipped", "thinking") says it.
- Retro's huge "20" read like 20/20 vision. Gone; the dots carry progress.
- Point: none of these were things an agent flagged. Each took one sentence from me and one re-render.
- Show: before and after pairs for two or three of these.

## The real constraints

- Georgia looked right on Glass, and can't ship: it's Microsoft's, and Cloudflare's build machine doesn't have it. Fonts have to be OFL files in the repo.
- Chinese titles need a Chinese face too, and CJK fonts are megabytes. Subset to the characters actually used.
- Glass costs about ten times more per card than Retro, because of the blurred background. Every deploy re-renders every card.
- So the blog defaults to Retro sci-fi, and Glass stays an option.
- Show: the build cost table (per card, whole site).

## Optional: when the chat gets swamped

- One line: so many review messages flowed between agents that I added a note feature to tmux-agents (link the release).

## The card for this post

- Close with this post's own generated card.
