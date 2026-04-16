---
title: "feature: Recursive git-activity"
date: "2026-04-15"
time: "16:34"
tags:
  - timeline
  - shipped
  - dotfiles
  - git
  - tooling
---

I created `git-activity` in [a631c98](https://github.com/TheClooneyCollection/dotfiles/commit/a631c981eb3445a5cb22ef99727415b500dc2381) so I can quickly answer "what have I been working on?" It walks a directory tree, finds the Git repos underneath it, and shows the latest log entries from each one in a single pass. It also supports a few filters, which is handy when I only want to review a slice of recent work; for example, from my `projects` folder I can run:

```sh
git-activity -r blog -m feat -x chore
```

That recursively scans repos, focuses on feature work, and leaves chores out of the list.

<figure style="text-align: center;">
  <img
    src="/assets/images/timeline/git-activity.png"
    alt="Terminal output from running git-activity recursively in the projects folder, matching feat entries and excluding chore entries"
    style="height: 250px; width: auto; max-width: 100%;"
  />
</figure>
