---
title: "A Draft That Didn't Make the Cut: Encoding My Blog Workflow for Coding Agents"
date: 2026-04-17
tags:
  - ai
  - ai-assisted
  - workflow
  - skills
  - writing
excerpt: |
  A preserved draft that did not meet my standard for a full post. I'm keeping it here as a record of something useful and concrete that still missed the cut on human judgment.
---

This note exists as a record of a draft that did not make the cut.

The original piece was trying to explain my blog workflow for coding agents: repo-local skills, encoded conventions, simple-model Git delegation, same-turn timeline entry rules, and the compounding effect of better workflow tooling. None of that was wrong. In fact, a lot of it was useful.

But it failed my standard for a proper post.

The problem was not correctness. The problem was center of gravity. It was too focused on the machinery and not focused enough on the deeper thing I actually wanted to write about: the accelerated speed of creation, and the shrinking distance between what I know internally and what I can ship externally.

So I'm keeping this here, in `notes/`, as a record of something that was concrete and maybe even helpful, but still not the real post. The version I actually wanted is [The Accelerated Speed of Creation](/posts/accelerated-speed-of-creation/). That distinction matters to me. AI can help produce drafts quickly; human standards still decide what is actually worth publishing as a post.

What follows is the draft as it stood.

---

Over the past week I've been doing two things at once: shipping features to [11ty-subspace-builder](https://github.com/TheClooneyCollection/11ty-subspace-builder), and building the workflow tools that make writing about those features faster and more consistent.

The result is a small system of repo-local skills sitting in `.claude/skills/` inside this repo. They encode the editorial loop I kept repeating: write a timeline entry, publish a post, cut a release.

[[toc]]

## Why Skills?

Coding agents support repo-local skills: Markdown files that describe a repeatable workflow, invocable as slash commands in the conversation. When I type `/timeline-entry` or `/release`, the agent reads the skill file and follows the process it describes - file naming, front matter conventions, body style, what to link to.

Without them, agents would usually figure things out on their own by reading the repo - which is actually quite smart. But figuring things out costs tokens. An agent exploring the codebase to infer that timeline entries need quoted YAML dates, or that the title needs a `blog:` prefix, or that the body must link to a release tag rather than a raw commit, is doing the right thing - just slowly and expensively, session after session.

A written skill short-circuits that. Instead of the agent deriving the implicit spec from examples, the spec is explicit. The agent arrives oriented rather than exploring.

## The Skills I Built

### `/timeline-entry`

The first one I built was the timeline entry skill, shortly after shipping the timeline page itself on April 14. The timeline is a captain's log: entries tagged `shipped`, `published`, `wip`, `idea`, or `thinking`, each with a date, a time, and a short first-person paragraph.

The rules turned out to be surprisingly specific. The most important one is YAML quoting: `date` and `time` must always be quoted strings (`"2026-04-12"`, not `2026-04-12`). Unquoted ISO-looking dates are parsed as JavaScript `Date` objects before Eleventy's collection sort runs, which silently breaks within-day ordering. I wrote about exactly this bug in [The Limits of AI and Where Humans Shine](/posts/how-clever-is-ai/).

The skill also specifies that the timestamp should come from the git commit, not from whatever I type into the file. Commit time is authoritative. The title prefix must match the existing conventions in the repo. The body must link to whatever shipped: the post URL, the GitHub release tag, or the commit.

Encoding all of this meant I stopped re-explaining the YAML quoting rule in every session. The skill carries it forward.

### `/release`

The release skill lives in the 11ty-subspace-builder repo rather than this one. Cutting a release has a ritual: bump `package.json` and both version fields in `package-lock.json`, commit `chore: release vX.Y.Z`, push, create the GitHub release with the right title format, a short changelog, and a compare link to the previous tag.

That's enough steps to miss one. Now the skill describes the full ritual. The agent verifies the version bump, formats the commit message, and generates the release body with the correct compare URL.

Because the process is purely mechanical, it's also a good candidate for the cheapest available model. As I wrote in [Smart AI Token Consumption](/notes/smart-ai-token-consumption/), routine operations like this don't need heavy reasoning - `codex --profile simple` is enough.

### `/frontmatter-editing` and `/post-and-note-workflow`

These two came a day later, after I noticed I was still re-explaining front matter conventions whenever I created a post or note. `frontmatter-editing` routes to per-type reference docs: `posts/` has one template, `notes/` has another, `timeline/` has its own rules. Rather than one long file covering all three, the skill reads only what's relevant for the task at hand.

`post-and-note-workflow` makes one rule explicit that I kept having to enforce manually: any time a post or note is published, a matching timeline entry must ship in the same turn. Not as a follow-up. Not as an optional next step. Same turn. Encoding that as a hard constraint in the skill means the agent treats it as a requirement rather than a suggestion.

## What It Feels Like in Practice

A typical release looks like this. Two tmux panes, two agents running at the same time:

- **Pane 1 - Subspace repo:** I ask an agent to commit, push, and cut the release. It follows the `/release` skill, bumps the version, and creates the GitHub release. `--profile simple` is enough for all of it.
- **Pane 2 - Blog repo:** While that's happening, I ask another agent to write a timeline entry. I just paste in the release URL: _"write a `shipped` timeline entry for Theme mode control and delayed previews in `https://github.com/TheClooneyCollection/11ty-subspace-builder/releases/tag/v1.25.0`"_. The agent reads the release, infers the details, drafts the entry. I approve it and it's done.

The two agents work in parallel. By the time the release is live, the timeline entry is already written.

I rarely do commits manually anymore. Routine git operations - staging, committing, pushing - are mechanical enough that `--profile simple` handles them without issue. The rule of thumb I follow, as I outlined in [Smart AI Token Consumption](/notes/smart-ai-token-consumption/): match the model to the complexity of the task.

That said, there's a clear line. Anything involving rewriting git history stays with a human, or at minimum with `--profile complex`. Rebasing, amending published commits, untangling a broken merge - these require judgement about what the history should look like, and the cost of getting it wrong is high. Simple git ops are a solved problem. History surgery is not.

The friction reduction is real. What used to take a round of setup context now starts from a shared baseline. The skill is the context.

There's also something satisfying about the skills being version controlled. When I add a new title prefix or change a convention, I update the skill file once. The change propagates to every future session automatically, regardless of which agent I'm working with. It's the same reason you put engineering decisions in ADRs or `CLAUDE.md` rather than Slack threads: the right place to store a rule is where it will be found.

## The Meta Layer

The interesting part about this sprint is that I used coding agents to build the tools that help coding agents work more effectively.

The skills were written collaboratively: I described the convention, the agent drafted the skill file, I refined it. Several rules got sharper over iterations when I noticed where the skill was ambiguous. The YAML quoting rule is a good example. The original version said "quote the date and time." A later revision added the reason: "unquoted YAML dates are parsed as JavaScript `Date` objects before Eleventy collection sorting runs, which can break within-day ordering."

That extra sentence changed the rule from something to follow to something to understand. Once you understand it, you stop breaking it - and you can judge new edge cases without going back to the skill file to check.

That's the more durable version of AI workflow tooling: not just instructions, but explanations. The rule plus the reason it exists.

## A Compounding Loop

There's a compounding quality to this kind of work. Better workflow tooling makes each new piece of content cheaper to produce. Cheaper content means more of it. More content means noticing more gaps in the tooling. Better tooling.

I'm not sure where that loop ends. But right now it feels like exactly the right kind of problem to be in.
