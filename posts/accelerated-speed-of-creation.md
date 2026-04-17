---
title: "The Accelerated Speed of Creation"
date: 2026-04-17
tags:
  - ai
  - ai-assisted
  - workflow
  - personal
  - reflection
---


This past week I shipped across code and writing at a pace that would have felt unrealistic before AI. The surprising part was that it did not feel frantic; it felt like less friction between thought and artifact. It truly feels like working at warp speed, 😜.

[[toc]]

## The Accelerated Week

Look at this. This is what I have shipped so far in a single week and growing ([full list here](/timeline/weeks/2026-W16/)):

```
(newest)
- feature: Collapsible Markdown code blocks (subspace)
- feature: Timeline archive pages (subspace)
- blog: The Accelerated Speed of Creation
- feature: Theme mode control and delayed previews (subspace)
- blog: rtc-bridge — TCP tunneling from a browser, explained
- skill: Editorial workflow and frontmatter skills
- note: WebRTC — How it actually works
- note: Smart AI Token Consumption
- blog: Getting Pulled Into the Ethereum Ecosystem
- feature: Published the first threaded timeline update
- wip: ProjectSpire Lab decompile setup
- wip: moving the Cloudflare Email Worker into Git
- feature: Recursive git-activity
- skill: Timeline-entry skill
- blog: The Limits of AI and Where Humans Shine
- skill: Release skill for Subspace
- idea: ProjectSpire mod tooling directions
- thoughts: What's Worth Keeping: On Humanness in the Age of AI
- feature: Shipped the timeline page
- feature: Random month navigation on Project Etho
- thoughts: A Small Digital Garden That Feels Like Home
- feature: OG image support for Chinese text (subspace)
- note: Homemade Hash Browns, Two Ways
- blog: Cloudflare Build Notifications via Email Routing and Email Worker
- feature: Copy buttons on long code blocks (subspace)
- feature: Auto theme-switching code blocks and GitHub embeds (subspace)
- feature: Notes collection with OG images (subspace)
- thoughts: Hello, timeline
(earliest / the beginning of time...line...)
```

Features shipped. Blog posts published. Notes written. Skills encoded. All across multiple repos, multiple tech areas, multiple modes of thinking.

Now here's the thing I want you to sit with for a second.

**I wasn't busy. Not too busy, at least.**

---

## The old bottleneck wasn't ideas

I've always had things I wanted to build and write. Most of them never made it out. Not because I lacked time exactly — more because every idea came pre-attached to a weight of mechanical overhead that quietly killed the momentum before it started.

Want to write a blog post? You also need to: structure the frontmatter, decide on the slug, figure out where the file lives, stage the changes, write a commit message that actually describes what you did, push. And that's *after* you wrote the thing.

Want to ship a small feature? Same deal, plus the boilerplate, plus the release notes, plus updating whatever documentation needs to reflect the change.

Every creative act had a tax attached. The tax wasn't huge on any single item. But compounded across twenty things? It was enough to make you stop at five. Or three. Or just not start.

**That tax is now gone.**

---

## Three layers of work — and AI owns the bottom one

I've started thinking about creation in three layers:

**Thinking** is the irreducible human stuff. The idea itself. The angle. Why this feature matters, what the blog post is really trying to say, which problem is worth solving. This is the layer nobody can outsource, and I wouldn't want to even if I could. This is **MINE** and what defines me.

**Craft** is translating thinking into form. Structuring an argument, choosing the right framing, reviewing what was generated and shaping it until it sounds like you. This layer still takes real attention, but AI has become a genuine collaborator here — it can draft from an outline, fill in the skeleton, suggest structure. The craft layer is compressed, not eliminated.

**Mechanical** is everything else. Boilerplate. Frontmatter. Commit messages. Branch management. Template application. File scaffolding. Timeline entry generation. Add, commit, push, open PR.

For a long time, all three layers lived in my hands. Now the mechanical layer is almost entirely handled. And it turns out the mechanical layer was quietly eating more of my creative budget than I'd ever accounted for.

---

## How it actually works in practice

### Writing

When I want to write something, I dictate. Not literally with a microphone necessarily — I just explain the idea, the structure, the core points I want to land. I give the AI the foundation: what I know, what angle I'm taking, what's important. It fills in the body. I review, shape, cut, sharpen.

The result reads like me because the thinking is mine. The ideas are mine. The AI handled the part where you stare at a blank document trying to figure out how to start the second paragraph — which, if you've ever written anything, you know is a disproportionate amount of the total time.

### Features and shipping

I do use AI for feature work too, like this digital garden you are visiting. Because this is my personal site, my engineering standard is intentionally loose: if it works and feels right, I'm often fine with it being a bit janky or not perfectly organized. That makes the loop much faster. I can describe what I want, let the agent implement it, and then just review whether the result is good enough for my own standards.

That is very specific to this kind of personal project. For production-grade engineering, my standards are much higher. There I want automated tooling, tighter checks, and more stringent review workflows in the loop, because the cost of sloppiness is obviously much higher.

Separately, for the grunt work of building features for the blog (i.e. releasing) and some writing work on the blog, I've built up [some skills](/notes/encoding-my-blog-workflow-for-coding-agents/) to help: encoded workflow instructions and conventions that help agents handle the recurring maintenance side of things without me re-explaining the same process every session.

A good example is timeline-entry work. That's not really writing, and it's not really feature development either. It sits closer to Git ops and repo maintenance: necessary grunt work around the thing I actually shipped. I can say something like "create a timeline entry for my latest Subspace release from this page," and the agent reads the source material, applies the right format and metadata, puts it in the right file, and gets it ready as part of the broader maintenance flow. What used to be ten minutes of mechanical follow-through is now closer to ten seconds of instruction.

### Git ops

This one surprised me most. I've almost completely stopped doing manual git operations. Add, commit, push, branch management, PR creation — all handled. I gave this to a [smaller, cheaper model](/notes/smart-ai-token-consumption/) (the mechanical layer doesn't need heavy reasoning, it just needs to be reliable) and it handles the whole flow.

There are edge cases — history rewrites, complex rebases, anything where I need to think carefully about what's happening to the tree — where I'm still hands-on with a more capable model. But routine git ops? Gone from my task list.

The insight here is worth naming: not all AI delegation is equal. You can be smart about *which* model handles *which* layer. Routine mechanical tasks don't need your best model. Save the capable inference for the work that requires it.

---

## What actually changed

The thing that strikes me most about this week isn't the volume. It's that **nothing felt like a grind** on that list.

Every item got shipped because I wanted to ship it — not because I managed to muscle through the friction. The ideas that used to die in the space between "I should do this" and "okay but that means I have to also do all of *this*" are just... alive now. They get made.

This isn't about doing less thinking. If anything, I'm thinking more, because [**thinking is what's left to us, humans**](/posts/whats-worth-keeping-on-humanness-in-the-age-of-ai/). The ideas have nowhere to hide behind anymore. There's no friction to blame when something doesn't get made.

The ceiling on creation was never how smart I was or how many hours I had. It was the overhead. And the overhead is gone.

---

## This post took three tries

This is the third incarnation of this post.

The first failed pass still exists as [Encoding My Blog Workflow for Coding Agents](/notes/encoding-my-blog-workflow-for-coding-agents/), saved in my notes as an anti-example. It is useful as a record of the machinery, but not the post I actually wanted to write.

The second take was thrown out completely. It was not wrong exactly, but it did not resonate with me, so I did not keep it.

Even this current version went through multiple rounds of proofreading and reshaping before it felt like the right post.

That matters to me. AI can help me get to drafts faster, but it still does not decide which version is true enough, sharp enough, or alive enough to keep.

---

## The honest caveat

I want to be clear about what this doesn't mean. AI didn't write this blog post in the sense of generating a piece I have no relationship to. The thinking is mine. The perspective is mine. I'm still the one who decides what's worth making, what angle is interesting, what's true and what's not. The editorial layer is fully human.

What changed is that the distance between "I have an idea" and "the idea is out in the world" collapsed. The mechanical tax got repealed. And it turns out that tax was larger than I ever gave it credit for.

A week that would have taken a month. A month's worth of ideas that would have stayed as notes. That's what this feels like.

I don't think we've fully processed what this means yet — for how people make things, what they make, how much of it, and what creative work even looks like when the overhead is no longer the constraint.

I'm still figuring it out. But the week speaks for itself.
