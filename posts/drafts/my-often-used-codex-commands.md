---
draft: true

title: My Often Used Codex Commands
date: 2025-09-30
eleventyNavigation:
  key: social-cards
---

Here are some of my often used commands / prompts when working with GPT 5 Codex.

[[toc]]

### Minimal Change

```
<Problem Statement>

Propose a plan with minimal changes to fix this issue.
```

### Create a PR

```
We are going to create a PR for the work we have done.

Read the commits from where we branched off and do the following.


- Propose a title.
- Propose a suitable description.
  - Don't need to overcomplicate it.
  - If changes are small, a short and concise description is fine.
  - If changes are more complex, explain concisely what file changes are made and how they contribute to the effect of the PR.
  - If changes involves significant changes to the existing codebase, propose how can we help our reviewers to review easily. 
- Run `gh` to create the PR

Stop before running the commands, let me revise the title, description first.
```

### New Branch & Worktree

**Create**

```
<Problem Statement>


We want to work on this in a new branch and worktree. Please use `git worktree` to create a new branch and worktree.
```

**Destroy**
```
Now we have completed the feature / bugfix, please push the branch to remote and remove the worktree.

Then we'd like you to create a GitHub PR with `gh` command. Let me review the title and description before running the command.
```

### Best Solution?

```
<Problem Statement>

Let me know what options we have. Which ones you think best fit for our current problem & solution space and why?
```

Even with this, sometimes i still find it's easier to come to a more comprehensive solution by chatting with ChatGPT in the web.

### Plan & Don't Act Yet

```
<Problem Statement>

Plan out each step, a high level overview, and corresponding project structure.

Let me review the plan. No code change or actions required at this step.
```

```
Propose a step by step & numbered plan with minimal changes to fix this issue.
```

### Make A New Release

```
We are going to make a new release by using `git` for tagging and `gh` for creating the release.

Read the commits since last release and do the following.

- Propose a release version based on the changes.
- Follow the existing release title strategy. `<Project>: <Version> - <Title>`
- Prepare a release description.
- Update any package definition file with the new version number and commit.
- Run `git tag` commands with the version number and also annotate it with the release title please.
- Remember to do a `git push` before the following `gh release ...` command.
- Run `gh` to create a release

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