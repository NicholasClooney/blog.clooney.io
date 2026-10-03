---
title: "docs: tmux-agents v1.6.1 reply when the main work is done"
date: "2026-10-03"
time: "15:28"
parent: "/timeline/2026-10-01-shipped-tmux-agents/"
tags:
  - shipped
  - tmux-agents
  - tmux
  - ai-agents
  - tooling
  - workflow
---

I shipped [v1.6.1](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.6.1) of [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), a skills update telling agents to reply as soon as a request's main work is done, then send follow-ups such as a deploy or a page going live as notices. For requests with several parts, they send a notice as each part lands. It came from my agent chain: secondary held its v1.6.0 reply until the blog entry was live, leaving main and me unaware that the release was already out.
