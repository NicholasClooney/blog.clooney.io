---
title: The Joy (and Frustrations) of Building Small Sites with GPT-5 Codex
date: 2025-09-20
eleventyNavigation:
  key: building-with-gpt-5-codex
---

Building small websites with GPT-5 Codex turned out to be less about typing code and more about collaboration. From crude sketches to polished sites, the model took on the heavy lifting while I guided direction and design.

Along the way I discovered both the joy of fast iteration and the limits of relying on an AI partner. These projects became less about the sites themselves and more about exploring a new style of programming — conversational, creative, and sometimes flawed, but always eye-opening.

[[toc]]

## Introduction

I’ve been experimenting with GPT-5 Codex to build small, single-page websites. These projects might seem trivial at first glance, but they became a testing ground for a new way of working with code. What surprised me wasn’t just the results, but how the process itself felt — fast, collaborative, and occasionally frustrating in ways that taught me as much as the successes did.

## Why Small Projects?

I like building tiny, focused projects — little experiments that can be finished in a weekend. They’re quick, they’re playful, and they give me something tangible to share. They’re also forgiving: if something doesn’t work, it’s easy to pivot or start again. That’s part of what makes them a great fit for experimenting with Codex, since the stakes are low and the lessons transfer to bigger projects where the caveats matter more.

## The Workflow: Conversational and Iterative

The process felt more like a conversation than traditional coding. I’d sketch a rough idea in Apple Notes, hand it over, and Codex would spin up a working site in minutes. Then we’d go back and forth: I’d highlight gaps, it would adjust, and we’d iterate. What struck me wasn’t just the speed, but how I could stay in the role of planner and designer while Codex handled the details. That said, the back-and-forth isn’t always perfect — sometimes both of us get stuck, which ties into the caveats I’ll cover later.

## Handling Tedious Changes

One of the best moments was asking Codex to transform my private projects, as shown below, into more general purpose sites and make them public. Normally, renaming everything, stripping private info, and making it public-ready is a slog. Codex did 95% of that work in one sweep, leaving me to fine-tune only the last little bits.

## Project Showcase

### 🐾 Project Luna - Pet Lost & Found Page

- Project: https://github.com/TheClooneyCollection/project-luna
- Demo: https://princessluna.pages.dev/

<img height="450" alt="image" src="/assets/project-luna.png" />

Started as a personal tool for my own cat, Luna. With Codex’s help, it quickly became a polished, shareable template for anyone who needs a lost pet page. My role was sketching the structure and clarifying how details should be presented, while Codex handled renaming and layout.

### 🎂 Project Joy - Birthday/Celebration Page

- Project: https://github.com/TheClooneyCollection/project-joy
- Demo: https://project-joy.pages.dev/

<img height="450" alt="image" src="/assets/project-joy.png" />


What began as a simple HTML/CSS surprise gift became an interactive, styled 11ty site with animations and hover effects. I provided the concept and nudged the creative direction; Codex generated the styling and made the site feel polished.

### 🔐 Project Top Secret - Eleventy Passphrase Gate

- Project: https://github.com/TheClooneyCollection/project-top-secret
- Demo: https://project-top-secret.pages.dev/

<img height="450" alt="image" src="/assets/project-top-secret-gate.png" />
<img height="450" alt="image" src="/assets/project-top-secret-unlocked.png" />


To keep the birthday content semi-private, I built an encryption/decryption setup — Node.js for encrypting, and a browser Q&A for decrypting. I set the goals and requirements, while Codex wrote most of the boilerplate and ensured the flow was secure but simple.

### 🚀 Subspace Builder (11ty Blog Starter)

- Project: https://github.com/NicholasClooney/11ty-subspace-builder
- Demo: https://blog.nicholas.clooney.io/

<img height="450" alt="image" src="/assets/blog.png" />

Built as a fast Eleventy blog starter with Tachyons utility classes. It includes theme switching, accessible navigation, and a responsive layout. My focus was creating a flexible, theme-aware base while Codex handled the structure and reusable components.

## What I Learned

These are some of the key takeaways I noticed when things went smoothly. They don’t capture every situation — and as I’ll explain in the next section, there are caveats and limits to be aware of — but they highlight where Codex really shines:

* Sketches and vague descriptions are enough to get started. Codex fills in structure fast.
* The model thrives at tedious, mechanical edits, freeing me to focus on design and flow.
* I don’t need deep CSS knowledge to end up with sites that look modern and clean.
* Pair-programming with an AI feels less like delegating and more like collaborating.

## Challenges and Caveats

As smooth as the process felt, there are limits and drawbacks worth noting:

* **Knowledge gaps**: If you don’t know what you’re doing, Codex can help, but it may not always be the best or most reliable solution.
* **Shared blind spots**: Sometimes neither you nor the AI knows the best answer, and you can get stuck chasing dead ends.
* **Solution quality**: Spending a lot of time making something “work” doesn’t guarantee it’s the right or optimal solution for the problem.
* **Lack of pushback**: Codex will happily refine a flawed approach without pointing out, “hey, there’s a better way.” This can mean wasted time before realizing a different direction is needed.

### Example: Theme Switching Rabbit Hole

One concrete example was when I tried implementing color themes for my blog using Tachyons CSS classes defined in YAML files, with JavaScript swapping them out when switching themes. It worked at first, but as I added more colors per theme, the JS code became increasingly bloated.

Later I realized a far simpler and more scalable approach: define theme colors as CSS custom properties scoped by a `data-theme` attribute. Each theme is just a config of color tokens, and switching themes becomes a single attribute toggle — maximum CSS, minimal JS.

Because I didn’t know this technique, and Codex didn’t push back on my original idea, we went down a rabbit hole refining a suboptimal solution. It cost time and energy before I recognized the better path. The lesson for me: GPT-5 Codex won’t stop you if you’re steering the wrong way, but asking broader questions at the start (e.g., “what’s the best way to implement theme switching?”) can help uncover smarter approaches early.

## Tips for Working with ChatGPT

One thing I realized through these projects is that the *workflow* matters just as much as the output. GPT can churn out implementations while I’m eating breakfast or stretching, but the way I collaborate with it determines whether things move smoothly or spiral into confusion. Here are some practices that made the process work better:

0. **Set the context clearly.** Before diving into code, give the model the bigger picture so it knows what you’re aiming for.
1. **Ask open questions.** Instead of immediately dictating a solution, ask about the best approaches — especially when you’re not an expert.
2. **Plan first.** Get GPT to outline the path forward before jumping into implementation.
3. **Discuss and iterate.** Treat it as a collaborator: question the plan, adjust, and refine together.
4. **Let it implement.** Once aligned, let GPT handle the heavy lifting.
5. **Iterate quickly.** Small, fast cycles of changes prevent getting stuck on the wrong path.
6. **Commit often.** Each working change deserves a save, so you don’t lose progress.
7. **Own the process.** Don’t blame the tool if it adds extras — if you only want A but it gives A+B, either trim B yourself or reset and ask more clearly.
8. **Recognize context limits.** If the conversation feels muddled, it may be time to start a fresh session with a clean slate.

These habits made the collaboration feel structured and productive, while still leaving room for creativity and exploration.

## Closing Thoughts

These projects may have been small in scope, but the process of building them with GPT-5 Codex was eye-opening. Instead of grinding through details, I got to enjoy the creative, high-level side of making things. Still, it’s clear that this style of programming requires human judgment to steer in the right direction and avoid the pitfalls I mentioned earlier. For me, that balance of speed, creativity, and critical oversight is what makes me believe this conversational approach isn’t just convenient — it’s a glimpse of the future.

