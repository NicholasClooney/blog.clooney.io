---
title: "AgentOS: The Agent Environment That Gets Smarter As You Build"
date: 2026-05-07
tags:
  - ai
  - ai-assisted
  - workflow
  - project-spire
  - documentation
excerpt: |
  The bottleneck isn't the model. It's whether your repo can explain itself to a fresh agent. Here's how I'm building AgentOS, a project environment that gets smarter the more it's used.
---

> **DISCLAIMER**: This blog is **Human Driven, Agent Written** like many things I am working on recently. The direction, the ideas, the taste, all from this fleshy human. I have also proofread and edited it many times. But agents have done most of the grunt work. You have been informed. Enjoy your reading. 😀

The agent I worked with yesterday does not exist anymore. 💀

Not in any dramatic sense. The model is still there. But the instance, the working context, the half-formed mental model it had of why we were renaming a file or why a particular abstraction looked wrong, all of that is gone. Tomorrow's agent starts from zero. So does next week's.

What I realized, while delegating real work to AI agents, is that **the bottleneck stops being the model's capability and starts being the project's ability to explain itself**. If the repo cannot tell a fresh agent what we are doing and why, every session begins with the same archaeology. The mechanical tax I have written about before, [the quiet compounding cost that kills momentum](/posts/accelerated-speed-of-creation/), shows up here in a new form, in *re-establishing context*.

So in [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire) (an AI-assisted, multilingual monorepo for exploring Slay the Spire 2 data, tooling, mods, and companion app experiments), I have started treating the surrounding documentation as part of the engineering environment itself. Not notes-for-later. Not changelogs. An actual system, designed so that the project gets *better at being worked on* the more it is worked on.

That is the claim I want to make in this post: the interesting move is not faster code generation. It is **building environments that accumulate context**, where the collaboration itself improves over time, even though the agent has no memory of last Tuesday.

[[toc]]

## The Three Layers, One Level Up

I have written before about [a three-layer model for creative work](/posts/accelerated-speed-of-creation/#three-layers-of-work-—-and-ai-owns-the-bottom-one): thinking, craft, and the mechanical. Thinking is judgment and intent. Craft is taste and standards. Mechanical is the boilerplate tax, the keystrokes between the idea and the result.

The same three layers apply to the engineering environment around an AI agent, just shifted up a level:

- **Thinking** lives in plans. What are we building, and why this shape and not another?
- **Craft** lives in collaboration logs. How do I want this done? What did I correct, and what should not need correcting again?
- **Mechanical** lives in skills and workflow files. What is the exact command, the exact sequence, the exact failure mode?

Most "AI workflow" writing collapses these together, usually into one giant prompt, or one CLAUDE.md that tries to be everything. That works until the project gets big enough that the prompt cannot hold its own weight. Then you need to split the layers apart, because they have genuinely different jobs.

## The Principles Behind the Practice

I am starting to call this cluster of ideas **AgentOS**, not a tool or a framework, but a layer of intentional structure that sits around the agent. The plan is to develop it into its own dedicated repo as the patterns solidify. But even at this stage, the underlying principles are reasonably clear:

**Context should accumulate, not evaporate.** Every session that ends without capturing what mattered is a session that future agents and future-you will partially re-do. The goal is a project that gets cheaper to work on, not harder.

**Keep the layers separated.** Thinking, craft, and the mechanical have different half-lives and different audiences. A plan and a skill and a Captain Log are not the same kind of document. Collapsing them makes all of them worse.

**Doc hygiene is a first-class concern.** Documentation that drifts out of sync with reality is worse than no documentation, because it actively misleads. The system needs mechanisms for noticing and correcting staleness, not just for producing documents in the first place.

**The system should improve as it is used.** This is the hardest one to operationalise, but it is the point. Every Captain Log should make the next session slightly better calibrated. Every encoded workflow should eliminate one category of repeated work. Every plan should mean one fewer archaeology session.

These principles are mostly implemented in practice but still have space for more evolution. Most of the mechanisms are in place. Others are still being designed. That is what active development of an idea looks like. And here is what it looks like in practice.

## AgentOS

An operating system does not do the work, it creates the conditions for work to happen reliably. AgentOS is that idea applied to AI collaboration. In ProjectSpire, it looks like this:

### Agent Instructions as Project Memory

The root of the system is the repo-level agent instruction file. In ProjectSpire, `AGENTS.md` is a symlink to `CLAUDE.md`, and `CLAUDE.md` acts as the operating manual for any agent working in the project.

{% github
"https://github.com/NicholasClooney/ProjectSpire/blob/397bbfa/CLAUDE.md#L11-L29"
%}

What that file deliberately does *not* try to do is contain every possible instruction. It is a router. It points at durable places: implementation plans, Captain Logs, release-tag workflows, snapshot workflows, build conventions, timeline-writing workflows.

That has become an important pattern for me. A good `CLAUDE.md` is not one giant prompt. It is the entrypoint into a system of project memory.

### Plans: Where Thinking Gets Captured

`Documentation/Plans/` is where agreed intent becomes executable.

Plans are not vague TODOs, and they are not something I write alone. A plan is the output of a planning session with an agent. I steer the direction, ask the questions, push back on the shape, and the agent writes it up. **Human-driven, agent-written**. That distinction matters because the plan ends up reflecting genuine architectural thinking rather than just whatever was convenient to type. I supply the judgment; the agent does the compression.

The result is something another engineer or agent can pick up without rediscovering the goal, the assumptions, the naming convention, or the verification path.

When I moved Neow's Cafe from mock cards toward a real card catalog, the plan captured the central decision: use a boring static catalog first, not a REST API.

{% github
"https://github.com/NicholasClooney/ProjectSpire/blob/2b50e8c3ea9843588a7873004a89f3e6c2c76b39/Documentation/Plans/0002%20-%20Neow%27s%20Cafe%20Card%20Catalog%20Integration.md#L7-L25"
%}

That is the kind of context that is expensive to reconstruct from chat history and almost free to read from a file. The plan tells the agent where the catalog lives, what is the source of truth, what should be generated, what should stay a symlink, and why this is not an API yet. Same questions, every session, asked once.

The plan also records verification and assumptions, which matters because agent-generated work otherwise drifts into "it compiles on my machine" territory.

{% github
"https://github.com/NicholasClooney/ProjectSpire/blob/2b50e8c3ea9843588a7873004a89f3e6c2c76b39/Documentation/Plans/0002%20-%20Neow%27s%20Cafe%20Card%20Catalog%20Integration.md#L80-L110"
%}

~~One open question I am still working through: how plans and devlogs relate to each other. Plans capture intent before the work. Devlogs capture what actually happened after it lands. In theory they are cleanly separate. In practice the boundary blurs. A plan evolves before the execution, a devlog ends up recording a decision that could have been in the plan, and sometimes it is not obvious which document you actually need. The right shape for these two is something I am still actively figuring out. It is one of the genuine growing pains of building this out, and I am not going to pretend otherwise.~~

**Update:** I think I've landed on what separates a plan from a devlog.

A plan is the output of a deliberate planning session, for changes complex enough that the shape of the solution needs to be thought through before work begins.

But not every change needs that. Adding a [custom typography system](https://github.com/NicholasClooney/ProjectSpire/commit/726c66d6cc61cace80901c79483992498a099fa4) or [light and dark themes](https://github.com/NicholasClooney/ProjectSpire/commit/81a52bb276109fb183e39e0b9f711bf5bd21064e) are not complex decisions, but they are worth a brief record of how and why they were done. That is what a devlog is for.


### Captain Logs: Where Craft Gets Captured

This is the part of the system I think is most underexplored, and the part I would build first if I were starting over.

A Captain Log is not a transcript and not a devlog. It records the *shape of the collaboration*: what I asked for, how the agent responded, where I corrected or steered it, and what future agents should carry forward.

{% github
  "https://github.com/NicholasClooney/ProjectSpire/blob/2241cab3e6c02e856b5e3e0b2c9d616d5266a454/Documentation/Captain%20Logs/0001%20-%20The%20Beginning%20of%20Captain%20Logs.md#L7-L19"
%}

Most writing about AI workflows focuses on prompts, context windows, or tool use. Almost nobody talks about logging the steering itself as a first-class artifact. But that is where most of the actual signal lives.

If I tell an agent "this is too formal, make it feel more like a timeline post," that is not an implementation detail. It is a preference, a piece of taste, a workflow correction. If it stays only in chat, the next agent will repeat the same mistake. If it goes into a Captain Log, the system gets a little better, and crucially, it gets better in the *craft* dimension, not just the technical one.

This is the move I think matters most. Code quality is one kind of memory. Collaboration quality is another. Treating them as the same thing is how you end up with a 3,000-line prompt that still produces tonally-wrong output. 😜

Where I think Captain Logs are headed, at least in my own usage, is further than just corrections. I want to use the accumulated logs as raw material for something more distilled: a "user guide" that future agents can reference to understand how I tend to think, what I tend to push back on, what good output looks like to me. And eventually, proactive follow-ups grounded in that history: "based on previous Captain Logs, would you like me to make X, Y, or Z modifications to what we just did?" The steering history becomes **a working model of the user**, not just a record of the session. That is still experimental, but the direction feels right.

### Devlogs: The Technical Historian's Journal

In comparison, Devlogs handle the technical-history side separately, and the local instructions are explicit about the split:

{% github
"https://github.com/NicholasClooney/ProjectSpire/blob/2b50e8c3ea9843588a7873004a89f3e6c2c76b39/Documentation/Devlogs/AGENTS.md#L1-L14"
%}

Two records, two questions:

- Devlog: what changed technically, why, and how was it verified?
- Captain Log: how did the human-agent collaboration evolve, and what should future agents remember about the user's direction?

I like that split because it stops every document from collapsing into the same document. A project decision, an unresolved issue, a plan, an implementation history, and a collaboration note all have different jobs. They should not all use the same shape.

### Skills and Workflows: Where the Mechanical Gets Absorbed

The third layer is the most operational, and the easiest to spot when it is missing.

In `Lab/.claude/skills/decompile-sts2/SKILL.md`, I have a small custom skill for decompiling the local Slay the Spire 2 DLL. It describes when the skill applies, the exact command, the options, prerequisites, and failure modes.

{% github
"https://github.com/NicholasClooney/ProjectSpire/blob/2b50e8c3ea9843588a7873004a89f3e6c2c76b39/Lab/.claude/skills/decompile-sts2/SKILL.md#L1-L28"
%}

That is not thinking. It is not craft. It is pure mechanical knowledge, the exact sequence, encoded so I never have to re-explain it. Snapshot tags get a document. Release tags get a document. The timeline-summary workflow has a document and an example: [snapshot tags](https://github.com/NicholasClooney/ProjectSpire/blob/2b50e8c3ea9843588a7873004a89f3e6c2c76b39/Documentation/Agent%20Workflows/Snapshot%20Tags.md), [release tags and pages](https://github.com/NicholasClooney/ProjectSpire/blob/2b50e8c3ea9843588a7873004a89f3e6c2c76b39/Documentation/Agent%20Workflows/Release%20Tags%20and%20Pages.md), [today's work timeline summaries](https://github.com/NicholasClooney/ProjectSpire/blob/2b50e8c3ea9843588a7873004a89f3e6c2c76b39/Documentation/Agent%20Workflows/Todays%20Work%20Timeline%20Summary.md).

Even writing about the work became a repeatable workflow: inspect today's commits, inspect changed documentation, separate committed from uncommitted work, produce a prose-led update with a few source references blended in.

The rule I have settled on: if I notice myself doing the same sequence twice, encode it. A script, a skill, an instruction file, a plan template, a log format. The point is not documentation for its own sake. It is reducing repeated cognitive work so the next session can spend its energy on something that actually requires thinking.

## Where This Gets Uncomfortable

I want to be honest about the parts that are still evolving.

The real risk I see is not whether the documents are useful, they are. Agents can navigate plans effectively: keyword search with `rg` or `grep`, infer relevance from titles, read only what is needed. The discovery problem is mostly solved. The staleness problem is not completely solved yet, at least not in a systematic way built into AgentOS. But the hope is not completely lost on this either.

If we build something one way and then refactor significantly without updating the corresponding plan, the next agent picks up outdated context as ground truth. That is a small problem the first time it happens. Catch it, patch the docs, move on. But if it compounds quietly across enough documents, the context layer starts to work against you rather than for you.

The mitigation I am working toward is making doc hygiene a first-class concern rather than an afterthought: agent instructions that prompt a check on relevant docs after significant changes, and eventually a workflow where the agent flags stale documentation proactively. The system should notice its own drift. Ideally this becomes one of the encoded principles of AgentOS itself, not something that depends on the human remembering to do it.

Captain Logs have their own version of this: not every steering moment is worth preserving. Some corrections are just me being grumpy on a Tuesday (🤣 Is that how I seemed to you, Claude? I mean it did write it on a Tuesday. lol). Telling the difference between signal worth capturing and noise that would just pollute the log is a judgment call I am still developing.

So I would not pitch this as a solved methodology. It is a working hypothesis, that the cost of structured context is lower than the cost of re-establishing context every session, and that the structure is worth maintaining in layers rather than as one undifferentiated blob.

Makes me wonder. Is there a way that I can concretely test this hypothesis? Maybe I can by comparing the token cost of achieving the same outcome with vs. without AgentOS. But to be honest, I cannot be bothered. Ha.

## Self-Enriching Engineering Systems

The pattern underneath all of this is what I find most interesting: the project is designed to *accumulate* rather than just *record*.

The agent does a piece of work. I steer it. The steering becomes a Captain Log. If the work becomes a repeatable process, it becomes an agent workflow. If the work is agreed but not done, it becomes a plan. If it lands, it becomes a devlog. If it exposes a bug, it becomes an issue note. If it involves repeated commands, it becomes a skill.

Over time the repo preserves more than code. It preserves the reasoning and the collaboration environment around the code. The thinking layer, the craft layer, and the mechanical layer all get a place to live, and the boundaries between them stay legible.

That changes what I want from AI agents. Not just faster code. Environments where they can operate effectively because the surrounding context has been intentionally designed, and where the design itself improves as the project is used.

## The End?

None of this changes what the human is for. The agent still needs someone to supply the judgment, hold the taste, and decide what is worth preserving. AgentOS is not an attempt to automate that. It is an attempt to make it stick.

AgentOS is not finished either. It probably never will be finished finished, that is the point of a self-enriching system. The patterns will keep evolving as the project is used, and eventually I plan to give it its own dedicated repo.

If you are building something similar, or have strong opinions about where this breaks down, I would genuinely like to know. The collaboration log for this whole endeavour is still being written.
