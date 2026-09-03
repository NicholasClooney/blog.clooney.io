---
title: "Two Small Wins That Turned Out to Be the Same Win"
date: 2026-09-03
time: "21:40"
tags:
  - ai
  - workflow
  - automation
  - macos
excerpt: |
  Moving a resume pipeline onto Maestri, teaching it to enforce its own
  two-page limit, and trying local dictation apps all removed the same thing:
  the mechanical tax between having an idea and acting on it.
---

Nothing shipped today. No new feature, no new project. But two things changed how I work, and by the evening I realised they were the same thing wearing different clothes.

[[toc]]

## The control room moved to a canvas

My resume pipeline has been running the same way for a while. Ghostty open, tmux inside it, three panes: two agents doing the work and a server generating the resume. Then a browser off to the side so I could actually look at the PDF that came out. I'd read it, form an opinion, switch back to the terminal, find the right pane, type the feedback, wait, switch to the browser again.

The pipeline itself was fine. The loop around the pipeline was the problem.

Today I moved the whole thing into [Maestri](https://www.themaestri.app/en). It's a macOS app built around an infinite canvas where terminals are nodes you place wherever you want. The part that mattered for me is what it calls portals: embedded windows on the canvas that can hold a website, an iOS simulator, an Android emulator. So the PDF preview isn't in another application anymore. It's sitting on the canvas next to the agent that produced it.

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/two-small-wins/resume-pipeline-maestri-canvas.png"
    alt="Maestri canvas showing a two-page resume preview beside Writer and Reviewer agent terminals and a generator terminal"
  />
  <figcaption style="text-align: center;">The resume pipeline on one canvas: output on the left, the agents and generator beside it, and the feedback loop contained in a single view.</figcaption>
</figure>

That's the entire change. Same agents, same pipeline, same output. But I stopped splitting one screen into thirds and stopped alt-tabbing to a browser to close the feedback loop. My rough estimate is I'm doing about a third of the work I was doing yesterday, and none of the work I removed was work. It was navigation.

I want to be honest about that number. It's a feeling, not a measurement. I didn't time anything. It's also day one with a new tool, and new tools always feel better on day one than they do on day thirty. Ask me again in a month.

## The pipeline learned to check its own homework

The second half of the win is smaller and less visible, and I suspect it's the more durable one.

My resume has to be two pages. Not roughly two pages. Two. That constraint used to live in my head, which meant every generation ended with me eyeballing the output, deciding it had spilled onto a third page, and going back to tell the pipeline to cut something. Every single time.

Now the pipeline checks the length itself and trims when it runs long.

The interesting part isn't the length check. It's what kind of task I handed over. Deciding what to cut from a resume is a judgment call, and I've been slow to delegate judgment calls. But this one has a hard, checkable success condition: two pages or not two pages. That's the shape of task worth giving away. Not "make this good", but "make this fit, and here's how you'll know."

I still read every version. I still overrule it. But I'm no longer the length sensor.

## Two dictation apps

Separately, and for less principled reasons, I downloaded two local speech-to-text apps today: [Handy](https://handy.computer) and [Ghost Pepper](https://matthartman.github.io/ghost-pepper/). Both are free, open source, and run entirely on-device. Hold a key, talk, release, and the text lands in whatever field has focus.

Handy is cross-platform and deliberately narrow. Ghost Pepper is Mac only, runs WhisperKit with a local LLM pass that strips filler words and fixes your self-corrections. I'm preferring Ghost Pepper so far, mostly because that cleanup pass makes the output feel less like a transcript and more like something I wrote.

The unsolved problem is multilingual. I switch between English and Chinese constantly, sometimes inside a sentence, and I'm still working out the model configuration that handles it without turning one language into confetti. Ghost Pepper ships with an English-focused model by default, so there's tuning to do. Handy leans on automatic language detection, which may end up being the better answer. Not decided yet.

## The shape underneath

I keep coming back to a three-layer model of creative work: thinking, craft, and mechanical. Thinking is deciding what should exist. Craft is the skill of making it well. Mechanical is everything else, the tax you pay in keystrokes and window switches and re-explaining context to get from intent to artifact.

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/two-small-wins/blog-pipeline-maestri-canvas.png"
    alt="Maestri canvas showing the blog Writer agent, Eleventy development server, and a live browser preview of this post"
  />
  <figcaption style="text-align: center;">The same shape building this post: writer, generator, and live artifact visible together on the canvas.</figcaption>
</figure>

None of today's wins touched thinking. None of them touched craft. All three of them were mechanical tax.

The canvas removed the tax of moving between windows. The length check removed the tax of being a human assertion. Dictation removes the tax of typing when talking would be faster.

Individually, each one is small enough to be embarrassing to write about. Collectively they're the difference between having an idea at 9pm and actually acting on it. Momentum is mostly a friction problem, and friction only ever shows up as a pile of small things.

So: two small wins. Same win.
