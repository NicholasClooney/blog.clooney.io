---
title: "The Two Extremes of AI-Assisted Engineering"
date: 2026-10-25
time: "18:00"
tags:
  - ai
  - agents
  - workflow
  - product-engineering
  - testing
excerpt: |
  For the past year or two I've run two kinds of project with the same AI
  agents. In one, I hardly read the code: as long as it works. In the
  other, every decision is mine and every line gets read. Both are right.
  The question that places a project is whether I just need it to work,
  or need a codebase that holds up over time.
draft: true
---

> _If you think coding agents wrote all the emojis, think again... I added those. It's 8pm Nicholas writing and he LOVES them. Yes..._

For the past year or two I have been working across the two extremes of AI-assisted engineering, with the same tools and mostly the same agents. Sometimes at the extremes, sometimes in the middle of the spectrum.

At one extreme are my personal projects. I describe what I want, the agents build it ([sometimes a dozen all at once](/posts/the-agent-that-only-talks-to-me/) 🙈), I run it and look. I don't read the code too much / too often. "As long as it works ™️." 😜 (Yes, I know it's terrible, but also SO MUCH FUN!)

At the other extreme are projects where the quality of the codebase matters: code a human can read, organised so it can keep growing, and tests that actually mean something. It matters to me, to the people who will work on the code, and to the people who will ask me why it is the way it is. There, every important decision is either made by me or reviewed by me.

The word "extremes" is not a judgement. There are plenty of sensible places in between, and where you land depends on your standard of quality and your appetite for risk for that particular project. What I want to do here is describe the two ends clearly, because once you can see both, picking a spot in between is a decision rather than a drift.

[[toc]]

## The fast extreme: as long as it works

Most of what is on my [projects page](/projects/) was built this way. [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), the tool I use every day to run the agents themselves. [EDControlRoom](https://github.com/TheClooneyCollection/EDControlRoom), a cockpit assistant for Elite Dangerous. [Cosmic Civilization Builder](https://cosmos.clooney.io), a browser idle game. [Project Stone Age](https://github.com/NicholasClooney/project-stone-age), a restoration of the MMORPG 石器(Stone)时代(Age) in Godot.

The loop for all of them is the same. Describe the effect I want. Let the agents build it. Run it. Does it look right? Ship. 🚀 By shipping, I mean committing and pushing to remote. Since they are my own personal projects, I know that they won't hurt anyone else or destroy any prod environment by accident, and to be honest, none of them were designed to do that either. If it doesn't look right, describe what's wrong and go again.

I don't read the diff... Anymore... Occasionally I review the architecture, either because I care about that part or because it stands in the way of moving forward. Then I nudge it: in EDControlRoom I worked with the agents to split the project into a server and a client, and later to move from one version of backend-driven UI to another. But those are a few big-picture pushes, not a review. I know roughly how these codebases are shaped because I was there when they grew, but if you asked me why a particular module is a particular way, the honest answer for a lot of it would be: 🤷‍♂️, "the agents made it work and that's that".

This might look like carelessness, but it's not. **It's a decision I make up front, by design**, for tools I use myself and for games I'm making or remaking for fun. The cost of a wrong decision in those codebases is that it has to be fixed later. And by that I mean I discover it, and the agents fix it. Nobody else depends on it. Nobody is going to ask me to defend it. There is no production to take down, no downstream chaos waiting to happen. 🤞, yeah nah, nothing like that is gonna happen.

The agents are good enough now that these projects come with test suites. I didn't ask for most of them. Agents add tests because that's what good engineering looks like, and I let them. But I'll be honest about what I know: I'm not sure how good those tests are, and I'm not sure what a green run actually tells me. A test an agent wrote to confirm the code it also wrote is at risk of mirroring the implementation rather than checking behaviour I care about. I haven't measured it. I just know the quality isn't where the careful extreme lands. Nobody read the code with a critical eye, so there is no reason it would be.

### Where it bites

It does bite, and I want to be concrete about where.

Project Stone Age's test suite is the latest case. The test suite grew the way everything in that repo grew: one feature at a time, each with its tests, none of them reviewed for what they cost. At its worst, a full run took close to an hour on eight threads. I found out because it runs on my machine while I'm developing, and every feature started taking a long time, even the ones I expected to be quick, because the tests were the slow part. I ended up writing a rule for the project: don't run the full suite every time, only when merging back to main. It's not a good rule to have for anything that touches production or end user but for personal projects? "It's fine. 🔥" It recently did receive a care package: a refactor and speed-up round, which itself was done the same way: describe the problem, let the agents fix it, check that it got faster. It did get faster but not too much... 🥲

Then there are the others... Effects that don't come out the way I pictured them, because I described the result in "big picture mode" and the agent filled in the details. Sometimes they are cheap to fix. But each one is a reminder of what "it works" really means here: the agents try to build what I described, and wherever I left a blank, they WILL fill it in for me. For these intentionally fast-moving personal projects, that's fine. But you wouldn't want agents making those decisions in your production code. At least I don't and no one should, I hope. Because even though each blank is small, but they compound. Left unmanaged, the snowball keeps growing until it hits you at 100 mph, and you may or may not see it coming. 🦆!

None of this makes me want to switch extremes for these projects. It's the price of the **"Insanely Stupendous Ludicrously Fast Mode"™️** mode, adequately named, and for these projects it's the right price for what it brings.

## The careful extreme: where quality matters

The projects at the other end get a lot more attention to detail from me, because working code isn't the goal. A codebase with great quality that not only holds up a year from now, but appreciated for the effort it went in, is. For me that means:

- **Readable.** Names express intent, functions stay focused, and comments explain why.
- **Well organised.** Each part has a clear responsibility, so changes have an obvious home.
- **Explicit dependencies.** You can see what a component needs and replace it easily in tests or previews.
- **Rules built into types.** Invalid data is caught at the boundary, reducing assumptions throughout the code.
- **Precise business logic.** Important rules are explicit, isolated, and independently testable.
- **Tests that mean something.** They check observable behaviour and catch plausible mistakes, rather than mirror implementation or chase coverage.

The agent brings the options and the facts. The choice stays mine. No blanks get filled in for me.

### Roles

The split is decided up front: I decide, the agent informs. The exact rules came later, one correction at a time, and live in the agent instructions file. Roughly, they look like this.

Me:

- **I decide.** Naming, structure, API shapes, product trade-offs.
- **I write or read the code.** Either way, nothing lands without me.
- **I set the pace.** When one detail or decision really matters, we switch into a laser-focused mode and stay on it until it's right, then move on.

The agent:

- **Spreads out the map.** Finds the facts and constraints I haven't seen yet.
- **Proposes.** When I ask for a recommendation, it comes back with a few good options and the reasons behind each, and we iterate from there.
- **Does the groundwork.** Tests, scaffolding, the parts I ask for. It goes over the plan with me first and builds one small step at a time. It never goes away and comes back with something finished.
- **Reviews.** Plays the reviewer and points out the good, the bad and the ~~ugly~~ I mean, what's missing or could be better.
- **Keeps the notes.** Writes down decisions and why, discoveries about the systems we depend on, parked edge cases and lessons learned, so nothing lives only in the chat.

### One slice at a time

We work in small steps. Not a whole system at once, but one thing a user can actually do, starting from a test. The agent usually sets up the tests and the scaffolding, I write or read the code that matters, and when it works we note where we are and pick the next step. Anything else that comes up gets parked for later.

### Where it paid off

None of these moments is big on its own. Every time when there is an important decision to be made, it is mine to make.

Sometimes the right move was not to decide yet. Early on the agent wanted to settle what an important architectural piece should look like. I held off until I knew what its shape should be, and it has become one of my favourite pieces of code.

And sometimes it was simply wrong, confidently. It told me the date library had a function that doesn't exist.

### What the agent brings

Three things I couldn't get quickly on my own:

- **Facts before code.** Before we wrote anything, it poked at the live API to see how it really behaves, quirks included. Those findings shaped the design, and they're the kind of thing a reviewer reading finished code would never see.
- **Memory.** It keeps the notes, so I can stop and pick up a day later without losing the thread.
- **Explanations when they matter.** When the code first needs an idea, it explains it right there, not in a lecture up front.

### The costs

- **It's slow.** One feature becomes several small steps, each one reviewed.
- **The agent wants to do too much.** Ask "where do we start?" and you get a plan for the whole thing. A single "ONE THING AT A TIME" from me, now written into a [tiny slice skill](https://github.com/TheClooneyCollection/skills/blob/main/skills/tiny-slice/SKILL.md), keeps us working one step at a time.
- **I have to double-check it.** The agent can sound sure and still be wrong, so anything that matters gets checked by me before it goes in.
- **Rules only stick once written down.** Every line in the instructions file comes from a real correction.

## Same agents, opposite rules

What strikes me is how little changes between the two extremes in terms of tooling. Same models. Same tmux panes. Same `tmux-ask` messages flying between them. The agents don't know which mode they're in until I tell them.

What changes is who decides, and what I look at.

| | As long as it works ™️ | Where quality matters |
|---|---|---|
| Who decides | The agent; I check the outcome | Me; the agent informs and proposes |
| What I review | Does it run | Every line and every trade-off |
| Pace | Whole features at once | One slice at a time, test first |
| What I get | Output, fast | A codebase that holds up, and decisions I can defend |
| Tests | The agent adds them; I trust green | They test behaviour, not implementation, and a pass has to mean something |
| Fits | Personal tools, games, one-off scripts, low stakes | Code that lives long, decisions others will question, things I want to actually learn |

The two columns are not "lazy" and "proper". The right column applied to Project Stone Age would mean never finishing Project Stone Age. The left column applied to the careful projects would mean a codebase I can run but can't read, can't grow and can't explain.

## Output or quality

The question that places a project on the spectrum is this: do I just need output, or do I need a codebase that lasts?

For my tools and my games, I need output. I need the feature to exist so I can use it tonight. If the code underneath is a bit of a mess, that's a future problem, and the agents are good at future problems.

When the code has to live for a long time, when other people will read it, build on it, or trust it with something that matters to them, I need quality. And quality doesn't come from reviewing a finished codebase. By then the shape is set, the tests are whatever they turned out to be, and the reasons are gone. It comes from being in the room when each fork comes up. Understanding comes along with it: not "I see what it does", but "I know why it isn't the other way".

The careful extreme gave me things that "build it and I'll review it" would not have. A codebase I'm happy for anyone to read, with tests I actually trust. I can explain and change any decision on the spot. And I have an honest list of weak spots, written while building, instead of discovering the gaps when someone asks.

The fast extreme gave me quite a few projects I use daily and enjoy, either working with them or playing them. It also contributes to my [10,000+ commits](/timeline/2026-10-20-thinking-github-9999-contributions/) over the last 12 months.

So: two extremes, and a lot of room in between. The real decision isn't which tools to use. It's where to set the quality bar. For each project, ask how long the code needs to last, who else will read it, and what a hidden mistake would cost. Set the bar from those answers, on purpose, and let the way you work with the agents follow from it. When the answers change, iterate.
