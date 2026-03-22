---
title: "Building ProjectDawn with Claude and Codex: An AI-Assisted iOS Devlog Deep Dive"
date: 2026-03-19
eleventyNavigation:
  key: building-projectdawn-with-claude-and-codex
tags:
  - ai
  - ai-assisted
  - ios
  - swift
  - tuist
  - workflow
---

I've been building a habit-logging iOS app called ProjectDawn. Not because the App Store needs another habit tracker, but because I wanted a personal project that was genuinely mine and open source, and a project that can answer this openly: what does it feel like to build a real, modular, native iOS app with AI as a primary collaborator?

This post is part personal log, part technical retrospective. It covers the tools I used, what surprised me, where the AI fell flat, and the biggest shifts in how I think about building things now.

[[toc]]

## What Is ProjectDawn?

| Overview | Expanded habit tray |
| --- | --- |
| <img alt="ProjectDawn main timeline view with logged habits and the collapsed tray at the bottom" src="/assets/images/posts/building-project-dawn/overview.png" style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;" /> | <img alt="ProjectDawn habit library shown as an expanded bottom sheet over the timeline" src="/assets/images/posts/building-project-dawn/expanded-sheet.png" style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;" /> |

ProjectDawn is a daily habit logging app with a simple, opinionated premise: **if it's on the timeline, it happened.** No reminders, no streaks, no gamification. Just a vertical timeline for your day and a tray of habits you can drag onto it. Logging a habit is a physical gesture: drag, drop, done.

The timeline snaps to 15-minute slots. Each placed habit becomes an instance you can resize by dragging its bottom edge. Swipe left or right to navigate between days. The habit tray collapses into a persistent strip at the bottom of the screen and expands into a full library when you need it.

It's a small app with a focused scope, but the interactions between the tray and the timeline are surprisingly nuanced, which made it a good test subject for AI-assisted development.

## The Tech Stack

### Claude + Codex: A Division of Labor

<img
  alt="Claude and Codex working side by side in a tmux session while building ProjectDawn"
  src="/assets/images/posts/building-project-dawn/claude-and-codex.png"
/>

I used two different AI tools throughout this project, and the division emerged naturally from how each one felt to work with.

**Claude** is my planner. It's slower (sometimes noticeably so), but it thinks carefully, considers trade-offs, asks clarifying questions, and produces design decisions I can actually reason about. When I need a PRD, an architecture plan, or a bug analysis, Claude is what I reach for. It chews through tokens quickly on my Pro plan, but the quality of the output justifies it.

**Codex (ChatGPT)** is my driver. It's much faster, great at taking a clear spec and turning it into working code, and excellent at the kind of mechanical implementation work that would otherwise just be tedious. When Claude finishes a phase plan, Codex implements it.

The mental model I settled on: Claude is the senior engineer who sketches the architecture on a whiteboard; Codex is the dev who opens the IDE and makes it real. Neither could replace the other in this workflow, and the combination is genuinely more capable than either alone.

### Mise + Tuist: Modular by Design

The project uses [Tuist](https://tuist.io/) to split the app into individual modules, with [mise](https://mise.jdx.dev/) managing the toolchain version. Every feature lives in its own module under `Modules/`:

```
Modules/
  Data/          <- SwiftData models (Habit, HabitInstance)
  DayView/       <- the main day scaffold and navigation
  Timeline/      <- the scrollable time grid
  HabitTray/     <- the expandable bottom sheet
  Interaction/   <- shared drag coordinator and helpers
```

The app target itself is a thin shell: it wires up the entry point, injects the SwiftData container, and delegates all UI to the feature modules.

The payoff of this structure: I can rebuild, test, and iterate on a single module without touching anything else. When Claude generates a phase plan, it maps cleanly to module boundaries. And when something breaks, the blast radius is contained.

### The Docs Live in the Repo

One workflow decision that paid off: all design documents live inside the repo under `Docs/`.

```
Docs/
  PRD.md
  plan.md
  Implementation Plans/
    Phase3-Timeline.md
    Phase4-HabitTray.md
    Phase5-DragAndDrop.md
    Phase6-HabitInstancesOnTimeline.md
  bug-analysis-*.md
  bug-report-*.md
  future-ideas.md
```

The practical reason is that both Claude and Codex can read and write to these files directly. My usual setup is a tmux session with split panes: Claude in one, Codex in another. When Claude finishes a phase plan, it writes it to `Docs/Implementation Plans/`. Codex reads from there. When a bug surfaces, Claude writes the analysis to `Docs/bug-analysis-<slug>.md` and Codex can reference it without me re-explaining the problem.

This also means the design history is traceable and version-controlled alongside the code. Six months from now, I can read `Phase4-HabitTray.md` and understand exactly why the tray architecture looks the way it does, what alternatives were considered, and what was explicitly deferred. That's not something you get from commit messages alone.

The broader principle: keeping docs in the repo enables agents to collaborate across sessions and tools, creates a shared ground truth that survives context window resets, and makes it practical to split work across multiple agents (or agent types) without losing continuity. If you're working with AI on anything non-trivial, this is worth setting up early.

## My Workflow, Step by Step

My personal preference throughout this project: always review AI's work, especially during the design phase. The AI is drafting, I'm approving. Here's how that plays out end to end.

**1. Spitball and clarify with both Claude and Codex.**
Before any code is written, I use both to think out loud. What is this app actually for? Who is the user? What does the core interaction feel like? Bouncing ideas between the two surfaces different angles quickly, and the back-and-forth helps compress a fuzzy idea into something I can actually define. The output of this phase is a rough set of user stories and behaviors for the MVP.

**2. UI mockups and component decisions.**
Both Claude and Codex can produce rough UI mockups directly in their chat interfaces, which is useful for validating layout ideas fast. More importantly, this is where I lock in the native component decisions: which SwiftUI primitives to reach for and which to avoid. For ProjectDawn, this is where the choice to use a persistent `.sheet` for the habit tray was made (and, as it turned out, where a future footgun was quietly loaded).

<img
  alt="ProjectDawn UI and interaction mockups showing the default state, dragging state, and placed state"
  src="/assets/images/posts/building-project-dawn/ui-ux.png"
/>

**3. PRD.**
Once the concept is validated, I ask Claude to write a formal Product Requirements Document. I read it carefully, push back where something is wrong or missing, and iterate until it accurately reflects what I want to build. This document becomes the north star for everything that follows.

**4. Master plan.**
The PRD feeds into a phased master plan. Claude produces it; I review it phase by phase, checking that the sequencing makes sense and that dependencies between features are accounted for. This lives in `Docs/plan.md`.

**5. Per-phase implementation plans.**
Before each phase of implementation starts, I ask Claude to write a detailed implementation plan: module design, file layout, key decisions, alternative approaches considered and rejected, and often starter code snippets that serve as guardrails for Codex. I review each one and drop it into `Docs/Implementation Plans/`. These are the documents Codex actually works from.

**6. Codex implements.**
With a clear implementation plan in hand, Codex does the heavy lifting. The plan is specific enough that it rarely goes sideways. When it does, having the plan as a reference makes it easy to diagnose where Codex drifted from the intent.

**7. Review.**
Code review happens one of a few ways depending on what I'm looking at: reading the diff myself, running the project and feeling the interaction, or asking Claude to review the output against the implementation plan. For complex or risky phases, I do all three.

### Structure Guides Quality

The most important thing is you can set up around AI-generated code is the structure and it has a huge impact on the quality of what comes out.

For this personal project, the bar is deliberately lower. But for production-grade projects, I set up linters, formatters, and automation, i.e. [SwiftFormat](https://github.com/nicklockwood/SwiftFormat) and [SwiftLint](https://github.com/realm/SwiftLint) for style and idioms, CI/CD pipelines, and [Danger](https://danger.systems/) to enforce test coverage and flag undocumented changes. When those guardrails are in place, the AI's output has to pass them too. It produces more consistent code not because you asked nicely, but because the tools enforce it automatically.

The key takeaway: if you want AI-generated code that meets a certain standard, make that standard enforceable by tooling, not just by eye.

## The Part That Works and Quite Impressive

The design and implementation that surprised me the most was the drag coordination between the habit tray and the timeline, and the fact that it works cleanly across two separate modules. Claude has done a fantastic job producing a technical design document laying out how the components should interact with concrete coding to support its ideas.

When a user drags a habit pill from the tray, the gesture originates inside `HabitTray`. But the drop target (the time slot grid) lives inside `Timeline`. These are different modules, compiled as separate static frameworks, with no direct dependency between them. The app needs to somehow pass "a habit is being dragged, and it's currently hovering over slot 34" from one side to the other in real time.

The solution is a shared `HabitDragCoordinator` in the `Interaction` module, an `@Observable` class that both `HabitTray` and `Timeline` can read from, injected into the environment by the app root.

{% github "https://github.com/NicholasClooney/ProjectDawn/blob/5016e4bc1580540f52b141c57f9ef807a96d7833/Modules/Interaction/Sources/HabitDragCoordinator.swift" %}

`HabitTrayView` calls `coordinator.begin(habit:at:)` when a long-press gesture starts and `coordinator.move(to:)` as the finger moves. `DayView` (sitting above both in the hierarchy) observes `dragCoordinator.dragLocation` and translates the screen-space point into a timeline slot:

{% github "https://github.com/NicholasClooney/ProjectDawn/blob/5016e4bc1580540f52b141c57f9ef807a96d7833/Modules/DayView/Sources/DayView.swift#L48-L63" %}

The result: dragging a pill from the tray causes time slots in the timeline to highlight in real time, with a haptic snap on each slot transition. When the finger lifts, `DayView` reads the hovered slot, computes the exact timestamp, and inserts a `HabitInstance` into SwiftData. The tray doesn't know about the timeline. The timeline doesn't know about the tray. `DayView` acts as the coordinator of coordinators.

I did not write a single line of that wiring. Claude designed the architecture; Codex implemented it. The fact that it works the first time you run it, with the haptics and the highlight and the drop all feeling right, was genuinely one of those moments where you look at the screen and think, _AI is certainly getting smarter everyday_.

## What I Learned Along the Way

### Claude Is a Great Planner, but It's Slow

When I say Claude is a planner, I mean it produces real design documents. Here's a sample from the Phase 4 plan it wrote for the Habit Tray, covering module boundaries, the `presentationDetents` decision, layout constants, and the rationale for each choice:

{% github "https://github.com/NicholasClooney/ProjectDawn/blob/5016e4bc1580540f52b141c57f9ef807a96d7833/Docs/Implementation%20Plans/Phase4-HabitTray.md" %}

That document shaped how Codex implemented the feature. Having it written down also meant that when something diverged from the plan, I had a reference to come back to. And because it's in the repo, a future Claude session can read it cold and immediately understand the reasoning without me re-explaining anything.

The slowness is real, though. There were stretches where I was waiting on Claude to finish a planning pass and couldn't move forward. It's not a dealbreaker (thinking carefully takes time), but it's worth knowing this isn't a "vibe-code at 60 fps" kind of workflow.

<video controls muted playsinline preload="metadata" aria-label="Screen recording showing Claude spending a long time thinking through ProjectDawn implementation details" style="width: 100%; height: auto;"><source src="/assets/images/posts/building-project-dawn/claude-thinking-a-lot.mp4" type="video/mp4" />Your browser does not support the video tag.</video>

<p class="tc"><em>Claude thinking slowly.</em></p>

### Gotcha #1: The GCD Trap

One of the first places I had to step in was around concurrency. Claude had generated some timing logic using `DispatchQueue.main.async`, the old Grand Central Dispatch pattern that most modern Swift code has moved away from. It worked, but it was out of place in a codebase that was otherwise using `async/await` and `Task.sleep`.

It wasn't a _wrong_ choice exactly (GCD isn't broken), but it was an _inconsistent_ one. This is the kind of thing a human reviewer catches immediately because it jumps out as stylistically wrong. The AI didn't have that instinct. I caught it, flagged it, and had Codex rewrite the section using `Task.sleep`. Two minutes of work, but only because I was paying attention.

It illustrated something I kept coming back to: **the AI will choose the first plausible solution, not necessarily the idiomatic one.** You need a human in the loop who knows what "right" looks like in context.

### Gotcha #2: The Alert That Eats Your Sheet

<video controls autoplay loop muted playsinline preload="metadata" aria-label="Screen recording showing the ProjectDawn delete confirmation bug in the timeline while the tray sheet is presented" style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"><source src="/assets/images/posts/building-project-dawn/bug.mp4" type="video/mp4" />Your browser does not support the video tag.</video>

<p class="tc"><em>The alert eating the sheet live!</em></p>

This one was more dramatic.

The app presents the habit tray as a persistent sheet via `.sheet(isPresented: .constant(true))`. The timeline sits underneath that sheet. At some point, I added the ability to delete a habit instance from the timeline: long press, confirm, done.

What actually happened: long-pressing a pill on the timeline caused the entire habit tray to disappear, and the confirmation dialog auto-dismissed itself on the first attempt.

The bug analysis Claude wrote tells the story clearly:

{% github "https://github.com/NicholasClooney/ProjectDawn/blob/5016e4bc1580540f52b141c57f9ef807a96d7833/Docs/bug-analysis-timeline-instance-delete.md" %}

The short version: UIKit has a rule that a view controller can't present a new modal if it already has a presented view controller. When the confirmation dialog tried to present from the timeline layer (which sits underneath the sheet), UIKit resolved the conflict by dismissing the sheet. The `.contextMenu` modifier made it worse by actively pulling back the sheet to "peek" at the content underneath.

Claude did not anticipate this when planning the delete feature, and I wasn't paying enough attention to catch it during the planning review either. Claude designed the interaction in isolation; it had no reason to think about how a presentation originating from the timeline would interact with a sheet presented from the same parent view controller. That's a subtle UIKit behavior that requires real iOS experience to know about.

The fix involved restructuring which layer owns the confirmation dialog. The lesson was slightly more expensive.

Side note: Codex took a few tries and didn't land a proper fix. Claude gave an excellent analysis on the first try, and its recommendations fixed the issue. This is actually the kind of bug where Claude's slower, more systematic reasoning has a real edge.

### The Deeper Lesson: AI Doesn't Think About Interactions Between Components

The sheet/alert bug is an example of a broader pattern I noticed throughout this project: **the AI plans features in isolation, without simulating how they interact with each other**.

Claude wrote excellent plans for Phase 4 (tray), Phase 5 (drag and drop), and Phase 6 (instances on the timeline). Each plan was internally coherent. But none of them modeled how presenting a dialog from Phase 6 code would interact with the sheet architecture from Phase 4.

This isn't surprising. The AI can only reason about what's in its context window. It doesn't have a running mental simulation of a UIKit presentation stack that it updates as new features accumulate.

Two takeaways:

**One:** We're still early. The AI is already impressive at what it can do. It designed a modular multi-target Tuist workspace, wrote a functional drag coordinator across module boundaries, and produced architecture documents I'd be happy to share in a real code review. But it lacks the accumulated intuitions that experienced engineers carry from failure modes they've personally hit before.

**Two:** This will get better. The more that UIKit presentation conflicts and similar gotchas are represented in training data (bug reports, Stack Overflow answers, engineering blogs like this one), the better future models will get at anticipating them. I genuinely believe that in a few years, this kind of cross-feature interaction issue will be something the AI flags proactively during planning.

For now, a human who has shipped iOS apps needs to be in the loop during planning reviews.

## What Kind of AI Code Is Actually Acceptable?

Here's a question I kept bumping into: how much do I trust AI-generated code, and does the answer change depending on what the code does?

I've started thinking about this as a rough tier system:

**Tier 1: Pure UI.** Layouts, color tokens, spacing, animations. I trust AI output here almost completely. If a button is 2 points too wide, or an animation curve is slightly off, I'll catch it visually and fix it in five seconds. The failure mode is cosmetic.

**Tier 2: UI interactions and gestures.** Drag behavior, sheet presentation, haptic feedback, state transitions. More review needed. The sheet/alert bug lived here. The failure mode isn't cosmetic, it's behavioral, and behavioral bugs are often only visible at runtime, in specific sequences, in ways that are hard to reason about from a static plan.

**Tier 3: Business logic.** Data model decisions, persistence, sync, state management. I want to understand everything in this tier. The AI can draft it, but I read it carefully and think about the edge cases myself.

**Tier 4: Security, auth, payments, privacy.** This is where I'd be most cautious. Not because the AI is incapable, but because the failure modes here are severe and non-obvious, and you need domain expertise to even know what questions to ask.

The tiered framing isn't about trust in the AI's ability to write syntactically correct code. It's about how much domain expertise is required to evaluate the output, and how bad it is if the output is subtly wrong.

There's also a more philosophical point underneath this: AI right now is the latest tool in the toolkit. It accelerates what humans do. But the judgment about what to build, how it should feel, whether an architecture decision is defensible three years from now, whether a particular bug is cosmetic or catastrophic, that judgment is still human. To make something that reflects your vision and your standards, you still need a human behind the wheel. The AI makes the car faster, not the driver obsolete.

## The Biggest Takeaway: POC First, Engineering Later

The shift in mindset that came out of this project is something I keep coming back to.

In the past, when I started a new project with ambitions of building it "properly," I'd immediately reach for module boundaries, protocols, dependency injection, SOLID principles, all the markers of good engineering. Then I'd spend a long time setting up structure before I'd proven that the _thing I was building_ was actually something I wanted to build.

With AI assistance, there's a faster path: **build a dirty, disposable proof of concept first**. Prove the interaction model works. Prove that dragging a habit onto a timeline and watching it snap feels good. Get the full thing running in a single file if you have to, iterate at speed, and treat it as a throwaway. Then, if the concept earns its existence, distill it into a properly engineered project.

The AI is extremely good at quickly generating that first pass. It doesn't care if everything lives in one view file. It can spin up an interactive prototype in an afternoon. You get to experience the thing, watch real data flow, feel the gestures, encounter the failure modes, before committing to any architecture.

I'm applying this to everything I build going forward. Figure out the UX with some quick POC-grade code. If it proves itself, bring in the modules, the protocols, the test targets. Not before.

## Closing Thoughts

ProjectDawn is still early, v0.1+ with the core drag-and-log flow working and a few rough edges. But the process of building it has already changed how I think about AI-assisted development.

The pairing of Claude (planning, critical thinking) and Codex (implementation, speed) is more useful than either alone. Tuist's modular structure made the AI's output easier to review. Keeping docs in the repo made it possible for agents to actually collaborate across sessions and tools. And the failures (the GCD inconsistency, the sheet/alert conflict) were more instructive than the successes, because they revealed exactly where human oversight still matters.

If you're thinking about building something native and wondering whether to bring AI into the loop: yes, do it. Just keep your hand on the wheel.
