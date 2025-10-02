---
draft: true

title: My Often Used Codex Commands
date: 2025-09-30
eleventyNavigation:
  key: social-cards
---

Here are some of my often used commands / prompts when working with GPT 5 Codex.

## Table of Contents

[[toc]]

### Best Solution?

```
<Problem Statement>

Let me know what options we have. Which ones you think best fit for our current problem & solution space.
```

Even with this, sometimes i still find it's easier to come to a more comprehensive solution by chatting with ChatGPT in the web.

### Plan & Don't Act Yet

```
<Problem Statement>

Plan out each step, a high level overview, and corresponding project structure.

Let me review the plan. No code change or actions required at this step.
```

### Make A New Release

```
We are going to make a new release by using `git` for tagging and `gh` for creating the release.

Read the commits since last release and do the following.

- Propose a release version based on the changes.
- Follow the existing release title strategy. `<Project>: <Version> - <Title>`
- Prepare a release description.
- Run `git tag` commands with the version number and also annotate it with the release title please.

Stop before running the commands, let me revise the title, description and version number first.
```

### Ctrl-C & Ctrl-D

Yes. Ctrl-C & Ctrl-D are very useful commands too. 


#### Ctrl-C

Ctrl-C is useful when you realize

- GPT is spinning in circles
- or it is going down the wrong rabbit hole
- or you see something you don't understand why

It gives you an oppurtunity to stop it early, point it to the right direction, and ask the right questions to align both of your visions.

#### Ctrl-D

Ctrl-D is useful when you realize GPT's context window is filling up and no longer able to offer you useful output. 

It's time for a fresh sesion.