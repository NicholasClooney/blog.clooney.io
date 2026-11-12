---
title: "The Two Extremes of AI-Assisted Engineering: Where Quality Comes From"
date: 2026-10-25
time: "19:52"
tags:
  - ai
  - agents
  - workflow
  - product-engineering
  - testing
excerpt: |
  I use the same coding agents to build things as fast as possible and to
  work through code one small decision at a time. Getting great software
  out of them means deciding what quality looks like, then making room
  for that judgement throughout the work.
draft: true
---

I have two very different relationships with my coding agents.

In one, I tell them what I want, let them build it, run it, and decide whether I like the result. Sometimes there are [a dozen agents working at once](/posts/the-agent-that-only-talks-to-me/). Features appear. Things break. More features appear. I am having an excellent time. 🚀

In the other, we can spend a surprising amount of time on the name of a function.

Same tools. Often the same agents. Very different expectations.

I work across both ends of this spectrum, and I like both. But when I want a codebase that is readable, maintainable, and trustworthy, I have to work differently. Asking an agent to “write high-quality code” leaves an awful lot for it to decide. I need to be clear about what quality means, and involved while the choices that determine it are being made.

That is the careful end of my workflow. It takes longer. It asks more of me. And the reasons for doing it go well beyond whether I personally typed the code.

[[toc]]

## The fast end: as long as it works ™️

A lot of my personal projects live here. Tools I want to use, games I want to play, ideas I would like to see exist before I lose interest in them.

The loop is simple: describe the result, let the agents work, try it, and tell them what needs changing. I occasionally get involved in the architecture, especially when it starts getting in the way. But I don't routinely read every diff. There are parts of those codebases where my honest explanation is: “The agents made it work, and I moved on.” 🤷‍♂️

For those projects, I accept that trade-off. I get to build far more than I could by giving every implementation decision my full attention. I also accept the possibility of discovering expensive mistakes later.

Tests are a good example. The agents add them, and green is reassuring. But if I haven't examined what the tests establish, I don't know how much reassurance I've earned. A test can faithfully repeat the same misunderstanding as the code it checks.

The cost also shows up in the workflow itself. In one of my games, the test suite grew until a full run took close to an hour on eight threads. Each addition may have looked reasonable locally. Together, they made development painfully slow.

I still use this way of working. It gets things into my hands that would otherwise remain ideas. But when I want stronger confidence in the code underneath, I need a different process for deciding what gets built.

## Give quality a meaning you can use

“Good code” is too vague to guide a collaboration. I need a standard I can apply to the next function, the next test, and the next proposed abstraction.

For me, that means:

- **Readable.** Names express intent, functions stay focused, and comments explain why.
- **Well organised.** Each part has a clear responsibility, so changes have an obvious home.
- **Explicit dependencies.** You can see what a component needs and replace it easily in tests or previews.
- **Rules built into types.** Invalid data is caught at the boundary, reducing assumptions throughout the code.
- **Precise business logic.** Important rules are explicit, isolated, and independently testable.
- **Tests that mean something.** They check observable behaviour and catch plausible mistakes, rather than mirror implementation or chase coverage.

These are familiar engineering principles. AI makes it particularly easy to accumulate code faster than I can judge it, so I have to make space to apply them.

A useful review question is: could another human follow this without the agent standing beside them explaining what it meant?

Another is: if the requirement changes, can I see where that change belongs?

Those questions give me something concrete to discuss. They also keep “quality” from becoming a preference for whatever code happens to look familiar to me.

## Make the decisions visible

An agent can turn a short request into a substantial implementation. Along the way it chooses names, invents boundaries, interprets ambiguous requirements, and decides what to do when something fails.

Every gap in my request is an opportunity for one of those decisions.

At the fast end, I delegate most of them. At the careful end, I ask the agent to bring important choices into the conversation while they are still cheap to change. What does this component own? What assumptions does this return type carry? Is this behaviour required, or have we just found a convenient way to implement it?

I want a recommendation with reasons. Usually one recommendation is enough to start. If the trade-off matters, we explore the alternatives. A menu of six designs can leave me doing all the work of finding the meaningful difference between them.

The agent can have the better idea. I accept its suggestions regularly. What matters is that I understand the choice well enough to take responsibility for it.

That responsibility includes checking the facts. A confident explanation of a library API is still a claim. Where it matters, we verify it against the actual API, a small experiment, or the behaviour of the system we are using. The explanation helps me understand the evidence; it doesn't replace it.

## Keep the next step small enough to judge

Agents are very good at giving me more than I asked for.

Ask where to start, and I may get an architecture, a folder tree, a testing strategy, and three future features. All plausible. All arriving before I've decided what the first piece needs to do.

This is where “ONE THING AT A TIME” entered my vocabulary. And eventually my agent instructions. 😅

A useful small step has a real behaviour attached to it. Someone enters a value, changes a selection, retries an operation, or sees a result. We establish what should happen, identify the state that makes it possible, and work through that much.

Often we start with a test. Sometimes we explore the code first because the shape is still unclear. Either way, I want a step small enough that I can follow the inputs, understand the decision, and inspect the result without keeping an entire unfinished system in my head.

Smallness needs some care too. Hard-coding the answer can make a test pass while avoiding the very behaviour we meant to build. A useful slice keeps the real flow intact and limits how much of it we tackle at once.

This also gives the design time to develop. I can defer an abstraction until I understand the responsibility it needs to represent. Each step provides evidence for the next decision.

## Ask what a passing test tells you

A test suite is part of the codebase I need to understand.

For each important test, I want to know what promise it checks and what plausible mistake would make it fail. The expected result needs a reason independent of whatever implementation the agent just produced.

That changes the conversation. Instead of asking for “tests for this function”, I can describe the behaviour that matters and ask how we would catch it going wrong. Boundary cases become useful when they distinguish correct behaviour from an attractive but incorrect implementation.

Test doubles deserve the same attention. A fake that quietly returns an empty result for an unexpected call may hide an accidental dependency. Making unconfigured behaviour fail immediately can reveal that the test is exercising more than I intended.

None of this requires asserting every internal call. I want the freedom to reorganise the implementation while preserving its behaviour. Tests should give me confidence to do that.

And I have to consider their cost. A suite that slows every small edit changes how often I run it and how quickly I get feedback. The tests themselves need engineering judgement.

## Let names and boundaries carry their share

Some of the most useful conversations are about small things.

A name tells the next reader what a value is for. A type tells them what assumptions are safe. A dependency tells them what a component needs from the outside world.

If a name hides the purpose, I ask about it. If every caller needs to remember the same validation rule, we look for a boundary where that rule can be enforced once. If a component reaches into a global dependency, we ask whether receiving the operation it needs would make its responsibility clearer.

These choices reduce how much context a human must carry to work safely in the code. They also give future agent sessions less room to guess.

There is a limit, though. A small application doesn't automatically need an elaborate hierarchy of protocols and repositories. Each abstraction should have a job I can explain. Sometimes a function is plenty.

## Write down what we know, including what we haven't solved

A careful workflow can easily expand until every step becomes a discussion about every possible edge case.

I need a way to say “this matters, and we are coming back to it”. Otherwise I either abandon the current step or rely on remembering the concern later.

So the agent keeps notes: decisions and their reasons, observed behaviour from external systems, unresolved questions, parked edge cases, and the next step. Those notes let me stop for the evening without keeping the whole project in my head. They also help a fresh agent session resume without reconstructing the design from guesses.

The distinction between a deliberate deferral and a forgotten problem is important. Neither is fixed yet. Only one has a visible place in the remaining work.

The same applies to the collaboration itself. When I keep making the same correction, it belongs in the instructions. Discuss the plan before writing. Give me one manageable step. Explain unfamiliar ideas when they become relevant. Record the decision once we've made it.

Those rules make the workflow repeatable, although I still have to notice when the agent drifts away from them.

## The cost is my attention

At this end of the spectrum, I remain very busy.

I read, question, choose, and sometimes write the code myself. At other times the agent writes it and we work through it together. The balance changes with the task and with what I want to understand.

This can be slow. A modest feature becomes several conversations. Some evenings I run out of concentration halfway through a decision. The agent can sound certain and be wrong, or agree with a correction and repeat the mistake later.

Careful work doesn't make the result flawless. Reviews miss things. Tests have gaps. There can still be unfinished handling and assumptions that need checking. What I gain is a clearer account of what I know, what I've verified, and where the weak spots remain.

The agent contributes a great deal: research, explanations, proposals, implementation, review, and memory. I get more out of those abilities when I keep enough attention available to judge what they produce.

## Choose the process that supports the standard

There is plenty of room between these two extremes. I can delegate routine work more freely and slow down around an unfamiliar boundary or an important business rule. I can revisit a fast-moving project when its maintenance cost starts to matter.

When I want great software, though, the quality standard has to affect how we work from the beginning. It determines the questions we ask, the size of the steps, the evidence we accept, and the problems we refuse to forget.

I still enjoy the “as long as it works” end. Immensely. There are things I want to use tonight, and I am happy to let the agents figure out most of how they get there.

For the code I want other people to read, change, and trust, I want to be able to explain the important decisions myself. Each small conversation is part of earning that confidence. When the next requirement arrives, the code and the reasoning should still make sense without the original agent in the room.
