---
title: "The Two Extremes of AI-Assisted Engineering: Fast and Furious, vs. Slow and Careful"
date: 2026-11-12
time: "22:30"
tags:
  - ai
  - agents
  - workflow
  - product-engineering
excerpt: |
  I use the same coding agents in two opposite ways: fast and furious,
  where I barely read the code and have made 10,000+ commits in the last
  12 months, vs. slow and careful, where every decision is mine. Neither
  is right. The real decision is where to set the quality bar for each
  project, right now, and when to move it.
---

I have two very different relationships with my coding agents.

In one, I describe what I want, the agents build it ([sometimes a dozen at once](/posts/the-agent-that-only-talks-to-me/) 🙈), and I run it to see if I like it. I barely read the code. "As long as it works ™️." It's a big part of how I made [10,000+ commits](/timeline/2026-10-20-thinking-github-9999-contributions/) in the last 12 months. 🚀

In the other, in comparison, we can spend a surprising amount of time on the name of a function.

Same tools. Often the same agents. Very different rules.

For a while I thought of these as two kinds of project. Now I think of them as two ends of a spectrum, and a project can move along it. [EDControlRoom](https://github.com/TheClooneyCollection/EDControlRoom), my cockpit assistant for Elite Dangerous, started at the fast end with a working version in under two weeks. Then, more than once, I slowed down to build the foundations it needed to keep growing.

So this post isn't about which end is right. It's about deciding where a project should sit right now, and then asking, again and again, whether that is still true.

[[toc]]

## A spectrum, not a verdict

"Extremes" is not a judgement. Neither end is the lazy one or the proper one. They are two answers to the same questions: how much do I want working right now? How much of the work do I hand over, and how much do I keep for myself?

Here is the map:

| | As long as it works ™️ | Where quality matters |
|---|---|---|
| Who decides | The agents; I judge the result | Me; the agent informs, proposes and checks facts |
| What I look at | Does it run, does it look right | The code, the tests, and every decision that matters |
| Pace | As fast as the agents go | As fast as I can follow, one step at a time |
| Tests | The agents add them; green is reassuring | Each one checks a promise I can name |
| What I get | Something close to what I pictured, fast. Never quite exactly it (yet) | Code I can read, change and explain |
| What it costs | Hidden mess I pay for later | My time and attention, now |
| Fits | Prototypes, personal tools, games, ideas I want to see | Code that lives long, that others read or trust |

Most of my work happens somewhere in between. I can let the agents run freely on routine parts and slow down around one tricky boundary. Where a project belongs depends on my standard of quality and how much risk I'm willing to take on for that particular project.

To place a project, I ask three questions:

- **How long does this code need to last?** A weekend experiment and a tool I'll rely on for years deserve different care.
- **Who else will read it?** If it's only me, I can live with "the agents made it work". If other people will build on it or ask me why it is the way it is, I can't.
- **What would a hidden mistake cost?** In a game I'm making for fun, I find it and the agents fix it. When I need to build something robust, I want as few mistakes as possible, and everything checked as thoroughly as I can manage. These days, that checking happens with the agents' help too.

The answers are not fixed. A prototype that people start using needs a different answer than it did on day one. So a project can move between the two columns, and it should. Placing it is a decision, not something that just happens while I'm busy building.

## The fast end: as long as it works ™️

Most of what is on my [projects page](/projects/) was built this way. [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents), the tool I use every day to run the agents themselves. [Cosmic Civilization Builder](https://cosmos.clooney.io), a browser idle game. [Project Stone Age](https://github.com/NicholasClooney/project-stone-age), a restoration of the MMORPG 石器(Stone)时代(Age) in Godot. And [EDControlRoom](https://github.com/TheClooneyCollection/EDControlRoom). At least, it started that way.

The loop is the same for all of them. Describe the effect I want. Let the agents build it. Run it. Does it look right? Ship. 🚀 If it doesn't look right, describe what's wrong and go again.

I don't read the diff... Anymore... 🙈 I know roughly how these codebases are shaped because I was there when they grew. But if you asked me why a particular module is a particular way, the honest answer for a lot of it would be: 🤷‍♂️ "the agents made it work and that's that".

This might look careless. It isn't. **It's a decision I make up front, on purpose.** These are tools I use myself and games I'm making for fun. Nobody else depends on them. Nobody is going to ask me to defend them. There is no production to take down. When something is wrong, I find it, and the agents fix it.

And it is SO MUCH FUN. Ideas go from my head to my screen in an evening, sometimes in an hour. Without this mode, most of those projects would still be ideas.

### Where it bites

It does bite, though.

#### The tests slow down to a halt!

The agents are good enough now that these projects come with test suites. I didn't ask for most of them; the agents add tests because that's what good engineering looks like, and I let them. But I don't really know what a green run tells me. A test written by the same agent that wrote the code can easily mirror the code instead of checking the behaviour I care about. Nobody read those tests with a critical eye, so there's no reason to expect much from them.

And they cost something. Project Stone Age's test suite grew the way everything in that repo grew: one feature at a time, each with its tests, none of them reviewed for what they cost. At its worst, a full run took close to an hour on eight threads. Every feature started to feel slow, even the small ones, because the tests were the slow part. So I made a rule: don't run the full suite every time, only when merging back to main. Not a rule I'd accept anywhere near production. For a personal project? "It's fine. 🔥" It later got a speed-up round, done the same way: describe the problem, let the agents fix it, check that it got faster. It did. A bit. 🥲

#### Then there are the blanks. Watch out: they snowball!

When I describe a result in big-picture mode, the agents fill in every detail I didn't specify. That's why the result is close to what I pictured, but never quite it. Each blank is small. But they compound, and left alone, the snowball keeps rolling until it hits you at 100 mph. 🦆!

### "Insanely Stupendous Ludicrously Fast Mode"™️

None of this makes me want to give up the fast end. Slow tests and a few snowballs are the price of this mode, and for these projects it's a price worth paying. The trick is noticing when a project has outgrown it.

## Moving along the spectrum: EDControlRoom

EDControlRoom is a cockpit assistant for Elite Dangerous. It reads the game's journal, reacts to what is happening on the ship, and runs routines like hauling cargo between stations. It is also the clearest example I have of a project moving along the spectrum, more than once.

### Fast and furious first 🚀

The first commit landed on 25 May 2026. Within two weeks it was already doing real work in the game, and v1.0.0 followed on 7 June: a terminal Control Room showing live ship status and dispatching routines. Then eleven releases in four days, and Windows support by week two.

<img
  alt="The EDControlRoom terminal Control Room in June 2026, showing ship status, an activity log of a jump and docking, and the station market"
  src="/assets/images/posts/two-extremes-of-ai-assisted-engineering/edcontrolroom-tui-v1.png"
  style="display: block; margin: 0 auto; width: 400px; height: auto; max-width: 100%;"
/>
<p class="tc f6 theme-midtone mt2">
  The terminal Control Room, the day v1.0.0 shipped.
</p>

Under the hood, it was squarely at the fast end. Unpolished, as far as the engineering went. But it worked, and it handled the game's events robustly, which was the part that actually mattered. It even shipped with 154 tests. Have I read them? 😅

### Slowing down to build a foundation

Three weeks in, I wanted something the code couldn't give me. I wanted the Control Room running on my gaming PC, next to the game, and to drive it from a terminal on my Mac. That isn't a feature you bolt on. So I slowed down. We wrote the client-server protocol down as a document first, then built it: a server next to the game, clients talking to it over REST and WebSocket. v1.12.0, "Client-Server Split", shipped on 19 June.

Ten days later, I slowed down again. Each client still had its own way of turning server data into a screen. We planned a refactor first, then spent a day (52 commits) on it: view models for every panel, and one stream of data from the server that every client renders from. That became v1.17.0, "Composable Control Room".

These were the moments I stopped describing effects and started making decisions. What does the server own? What is a client allowed to do? What shape does the data take? Not every line, but the shape.

### The foundation pays off

With that in place, a web interface was cheap. The first web page for hauling arrived within days, and route planning by mid-July.

<img
  alt="The EDControlRoom web Control Room showing the two-way haul page with routine steps, session stats, history and route search"
  src="/assets/images/posts/two-extremes-of-ai-assisted-engineering/edcontrolroom-web-haul.png"
  style="display: block; margin: 0 auto; width: 480px; height: auto; max-width: 100%;"
/>
<p class="tc f6 theme-midtone mt2">
  The web Control Room today, driving a two-way haul.
</p>

Then I went on holiday, got busy with other things, and didn't pick it up again for almost four months. When I came back in November, getting going again was easy. In under a week it gained Linux and Steam Deck support, better voices, a web button board for routines, and trade routes from live market data.

Then came hub mode: one Control Room on my home network that finds the others, owns the route search and the market database, and can watch and drive any of them. It is built entirely on the REST and WebSocket APIs and the data stream from June. It landed in a single day: 114 commits and six releases on 11 November. 🤯

### Slowing down further

Today it is at v1.38.0, with around 880 commits, and the test suite has grown from 154 tests to 1,171. Next, I want to use it as my playground for learning Rust, and move parts into Rust where they have stabilised enough that they won't change much.

If I had started in Rust, carefully, with every decision mine, I wouldn't be here. I'd probably still be on the protocol. I have so many ideas for this project, and it kept moving because I chose the fast and furious end first. Now that some parts have stopped changing, they've earned the slow treatment.

That's the pattern. Go fast to find out what it should be. Slow down to give it a foundation once the shape is clear. Go fast again on top of that foundation. And slow down further for the parts that have settled.

## What quality means to me

So what changes when I slow down? The first thing is that "good code" stops being enough of an instruction. Asking an agent to "write high-quality code" leaves almost everything for it to decide. I need a standard I can apply to the next function, the next test and the next proposed abstraction.

For me, that means:

- **Readable.** Names express intent, functions stay focused, and comments explain why.
- **Well organised.** Each part has a clear responsibility, so changes have an obvious home.
- **Explicit dependencies.** You can see what a component needs, and replace it easily in tests or previews.
- **Rules built into types.** Invalid data is caught at the boundary, so the rest of the code can make fewer assumptions.
- **Precise business logic.** Important rules are explicit, isolated and independently testable.
- **Tests that mean something.** They check observable behaviour and catch plausible mistakes, rather than mirror the implementation or chase coverage.

None of these are new. They are familiar engineering principles. What is new is how easily code now piles up faster than I can judge it. With agents, applying these principles doesn't happen by default. I have to make room for it.

Two questions help me apply them to real code:

- **Could another person follow this without an agent beside them explaining what it meant?**
- **If the requirement changes, can I see where the change belongs?**

They give the agent and me something concrete to discuss. And they keep "quality" from quietly turning into "whatever code looks familiar to me".

## Who decides, and who sets the pace

At the fast end, the agents make most of the decisions and I judge the result. At the careful end, the split is the other way round, and I decide it up front: I decide, the agent informs.

Me:

- **I decide.** Naming, structure, API shapes, product trade-offs.
- **I write or read the code.** Either way, nothing lands without me understanding it.
- **I set the pace.** When a detail really matters, we stay on it until it's right, then move on.

The agent:

- **Spreads out the map.** It finds the facts and constraints I haven't seen yet.
- **Proposes.** When I ask for a recommendation, it brings options and the reasons behind them, and we iterate from there.
- **Does the groundwork.** Tests, scaffolding, the parts I ask for, after going over the plan with me first.
- **Reviews.** It points out what's good, what's missing and what could be better.

### Making the decisions visible

An agent can turn a short request into a lot of code. Along the way it chooses names, draws boundaries, interprets requirements I left vague, and decides what happens when something fails. Every gap in my request is a decision waiting to be made, and at the fast end, the agent quietly makes it.

At the careful end, I want those decisions brought into the conversation while they are still cheap to change. What does this component own? What assumptions does this type carry? Is this behaviour actually required, or just a convenient way to implement it?

The agent often has the better idea, and I take its suggestions regularly. What matters is that I understand the choice well enough to own it.

### Fellow humans, set the pace

Agents can take in a lot at once. Ask "where do we start?" and an agent may come back with six different aspects of the whole project: the architecture, the folder structure, the testing strategy, the data model, the edge cases, the next three features. All plausible. The agent can handle all of them in one go. I can't, not if I want to actually make those decisions.

So in those moments, setting the pace is my job, and it's not optional. Pick one thing. Decide it. Then move to the next. The agent is happy to go as fast as I let it. Deciding how fast that is stays with me.

### Checking the facts

An agent can sound completely sure and still be wrong. A confident explanation of how a library or an API behaves is still only a claim. Where it matters, we check it against the documentation, a small experiment, or the real system. The agent is great at running those checks too. But the explanation helps me understand the evidence. It doesn't replace it.

## One small step at a time

That is why "ONE THING AT A TIME" entered my vocabulary, and eventually my agent instructions, as a [tiny slice skill](https://github.com/TheClooneyCollection/dotfiles/blob/main/.agents/skills/local/tiny-slice/SKILL.md).

A good small step has a real behaviour attached to it. Someone enters a value, changes a selection, retries an operation, or sees a result. We agree on what should happen, find the state that makes it possible, and build that much. Often we start with a test. Sometimes we explore the code first, because the shape isn't clear yet. Either way, the step is small enough that I can follow the inputs, understand the decision, and check the result without holding a whole unfinished system in my head.

Small needs some care too. Hard-coding the answer can make a test pass while skipping the very behaviour we meant to build. A good slice keeps the real flow intact and limits how much of it we take on at once.

Small steps also give the design time to grow. I can hold off on an abstraction until I understand what it needs to be responsible for. Each step gives me evidence for the next decision. Anything else that comes up along the way gets written down and parked for later.

Even this post was written this way. The first two drafts came out whole, and neither of them sounded like me. So for this version, we agreed on the outline first, then wrote it one section at a time, and I read and reworked each one before we moved on to the next.

## What a green test tells you

At the fast end, a green run is reassuring, and I mostly leave it at that. EDControlRoom has 1,171 tests. I couldn't tell you what most of them actually promise. At the careful end, the test suite is part of the codebase I need to understand.

For each important test, I want to know what promise it checks, and what plausible mistake would make it fail. The expected result has to come from what the behaviour should be, worked out on its own. If the agent writes the code and then copies whatever it returns into the test as the expected value, the test only proves that the code does what the code does.

That changes how I ask for tests. Instead of "write tests for this function", I describe the behaviour that matters and ask how we would catch it going wrong. Edge cases earn their place when they separate the correct behaviour from an implementation that looks right but isn't.

Test doubles deserve the same attention. A fake that quietly returns an empty result for a call nobody set up can hide a dependency I didn't know about. If that fake fails loudly instead, say with a `fatalError("yell at me pls")`, the test shows me it's exercising more than I intended.

Good tests check behaviour, not implementation details. They describe what the code does from the outside: given this input, the user sees that result. They don't assert which internal function was called, in what order, with what arguments. Tests like that break every time I reorganise the code, even when nothing a user could notice has changed. Tests that check behaviour let me restructure freely, and they only fail when something that matters actually breaks. I've written this down as a [behavior tests skill](https://github.com/TheClooneyCollection/dotfiles/blob/main/.agents/skills/local/behavior-tests/SKILL.md), so the agents start from it too: tests follow the user's flow, and dependencies are passed in as plain functions.

And tests cost something. Project Stone Age taught me that. A suite that slows down every small change affects how often I run it and how quickly I find out something is wrong. Tests need engineering judgement too.

That's why EDControlRoom has a timing standard for its tests. Since its second week, the suite has had a time budget. Today the budget is 0.6 milliseconds per test, so it grows with the suite: about 0.7 seconds for all 1,171 tests. If a run goes over, the agent finds the slowest tests and fixes them, usually by removing a real wait or passing in a clock instead. CI backs it up by failing the build if the whole suite takes more than five seconds. The agents run the full suite after every change, so a fast suite keeps the whole loop fast. (As I write this, it's running at about 0.8 seconds, slightly over budget. Back to work.)

## Names and boundaries

Some of the most useful conversations are about small things.

A name tells the next reader what a value is for. A type tells them which assumptions are safe. A dependency tells them what a component needs from the outside world. Each one carries a little of the context that would otherwise live only in my head, or in an agent's chat history.

So if a name hides its purpose, I ask about it. If every caller has to remember the same validation rule, we look for one boundary where that rule can be enforced once. If a component quietly reaches for a global, we ask whether passing in what it needs would make its job clearer.

These choices reduce how much a person has to hold in their head to work safely in the code. They also leave less room for the next agent session to guess.

There's a limit, though. A small app doesn't need layers of protocols and repositories just because a bigger one might. Every abstraction should have a job I can explain.

## Write it down

Careful work can easily spread out until every step turns into a discussion of every possible edge case. I need a way to say "this matters, and we'll come back to it", without either dropping what we're doing or trusting myself to remember.

So the agent keeps notes. Decisions and the reasons behind them. What we found out about the systems we depend on. Open questions, parked edge cases, and the next step. With those notes, I can stop for the evening without keeping the whole project in my head, and a fresh agent session can pick up the thread without rebuilding the design from guesses.

The difference between a deliberate deferral and a forgotten problem matters. Neither is fixed yet. But only one of them has a place in the list of what's left to do.

The same goes for how we work together. When I find myself making the same correction twice, it goes into the agent's instructions. Discuss the plan before writing code. One manageable step at a time. Explain an unfamiliar idea when it becomes relevant, not in a lecture up front. Record the decision once we've made it. Every rule in that file comes from a real correction. Even writing those rules has its own skill, [agent-docs](https://github.com/TheClooneyCollection/dotfiles/blob/main/.agents/skills/local/agent-docs/SKILL.md), so the instructions stay short and clear enough for an agent to actually follow.

And before I clear a session, I ask the agent to [wrap up](https://github.com/TheClooneyCollection/dotfiles/blob/main/.agents/skills/local/wrap-up/SKILL.md): what did we learn that isn't written down yet, and what's still unfinished? That way, clearing the session doesn't mean losing what the session taught us.

The rules make the way we work repeatable. I still have to notice when the agent drifts away from them.

## What it costs

At the careful end, I stay very busy.

I read, question, choose, and sometimes write the code myself. Other times the agent writes it and we go through it together. The balance shifts with the task, and with how much I want to understand.

It's slow. A modest feature becomes several conversations. The agent can sound certain and be wrong, or accept a correction and then make the same mistake again later.

And careful doesn't mean flawless. Reviews miss things. Tests have gaps. There are still assumptions waiting to be checked. What I get is a clearer picture of what I know, what I've verified, and where the weak spots are, written down while building instead of discovered when someone asks.

The agent brings a lot: research, explanations, proposals, implementation, review and memory. I get the most out of it when I have enough attention left to judge what it gives me. That attention is the real cost of the careful end, and it's why I don't spend it everywhere.

## Set the bar on purpose

So: two extremes, and a lot of room in between.

The fast end gave me a whole shelf of projects I use and enjoy every day, and a fair share of my [10,000+ commits](/timeline/2026-10-20-thinking-github-9999-contributions/) over the past year. The careful end gives me code I'm happy for anyone to read, tests I actually trust, and decisions I can explain on the spot.

Neither is the right way to work with agents. The real decision isn't which tools to use, or even which end to pick. It's where to set the quality bar for this project, right now. How long does the code need to last? Who else will read it? What would a hidden mistake cost? Set the bar from those answers, on purpose, and let the way you work with the agents follow from it.

**Then keep asking.** EDControlRoom started fast and furious because I needed to find out what it should be. It slowed down when it needed a foundation, sped up again on top of it, and the parts that have settled are about to get even slower, more careful treatment, in Rust. None of those moves were wrong.

The answers change. When they do, move.
