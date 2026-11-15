---
title: "The Blog Themes I Would Never Have Built, and the Freedom to Be Picky"
date: 2026-11-15
time: "22:22"
tags:
  - ai
  - web-development
  - design
excerpt: |
  How AI made room for me to think BIG. Eleven blog themes I would never have found the time to design and build otherwise, explored over a day of on-and-off work while juggling three to five other projects. A design lab, plenty of rejected ideas, and a theme switcher I kept simplifying. Trying became cheap enough that I could afford to be picky.
---

My blog felt a bit plain. A bit light. I wanted to see what else it could look like.

<style>
.theme-story-grid,.theme-story-before{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:1.6rem 0;}
.theme-story-showcase{grid-template-columns:repeat(4,minmax(0,1fr));gap:.65rem;}
.theme-story-figure{min-width:0;margin:1.5rem 0;}
.theme-story-grid .theme-story-figure,.theme-story-before .theme-story-figure{margin:0;}
.theme-story-figure img{box-sizing:border-box;display:block;width:100%;height:auto;border:1px solid var(--rule,currentColor);border-radius:3px;}
.theme-story-figure figcaption{margin-top:.5rem;font-size:.85rem;line-height:1.5;text-align:center;}
.theme-story-before{grid-template-columns:repeat(8,minmax(0,1fr));gap:.35rem;}
.theme-story-before figcaption{font-size:.65rem;overflow-wrap:anywhere;}
@media(max-width:600px){.theme-story-grid{grid-template-columns:1fr;}.theme-story-showcase{grid-template-columns:repeat(2,minmax(0,1fr));}.theme-story-before{display:flex;overflow-x:auto;padding-bottom:.65rem;}.theme-story-before .theme-story-figure{flex:0 0 120px;}}
</style>

<div class="theme-story-before">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-sun.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-sun.webp" alt="The previous blog homepage in Sun" loading="lazy" /></a><figcaption>Sun</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-default.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-default.webp" alt="The previous blog homepage in Default" loading="lazy" /></a><figcaption>Default</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-mint.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-mint.webp" alt="The previous blog homepage in Mint" loading="lazy" /></a><figcaption>Mint</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-grape.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-grape.webp" alt="The previous blog homepage in Grape" loading="lazy" /></a><figcaption>Grape</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-charcoal.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-charcoal.webp" alt="The previous blog homepage in Charcoal" loading="lazy" /></a><figcaption>Charcoal</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-deep-blue.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-deep-blue.webp" alt="The previous blog homepage in Deep Blue" loading="lazy" /></a><figcaption>Deep Blue</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-midnight.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-midnight.webp" alt="The previous blog homepage in Midnight" loading="lazy" /></a><figcaption>Midnight</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-terminal.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/before-terminal.webp" alt="The previous blog homepage in Terminal" loading="lazy" /></a><figcaption>Terminal</figcaption></figure>
</div>

*The previous themes, in their existing order. Same layout, different colours. Tap a screenshot to see it full size; on a phone, swipe across the row.*

That turned into eleven theme options, [a design lab skill](https://github.com/TheClooneyCollection/skills/tree/main/skills/design-lab), and a theme switcher that went through more discussion than I expected. It took about a day of on-and-off work, while I was also working on three to five other projects.

I can't imagine designing all of these myself, let alone implementing them. Definitely not in a day. More likely, I would have looked at the time involved, picked something close enough, and gone back to the other things I wanted to build.

This time I could actually explore.

<div class="theme-story-grid">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-light.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-light.webp" alt="Current theme selector showing all eight light options" loading="lazy" /></a><figcaption>The implemented selector in light mode: eight options. Expanded here to show the full list.</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-dark.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-dark.webp" alt="Current theme selector showing all ten dark options" loading="lazy" /></a><figcaption>The implemented selector in dark mode: ten options, expanded to show the full list. Several themes appear in both modes.</figcaption></figure>
</div>

[[toc]]

## How many themes do you need anyway?

Turns out, for me, it's 11 themes with light and dark modes. Roughly.

The options are easier to show than describe. These are screenshots of the same homepage at the same size, grouped by the directions they explore. Tap any image for the full-size view.

### Paper, grids and hard edges

Warm Paper is quiet and bookish. Swiss was the one I liked for its balance of colour and contrast. Brutalist turns the colour up and gives everything a hard edge. Zine is much more playful.

<div class="theme-story-grid theme-story-showcase">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-paper-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-paper-verified.webp" alt="New Warm Paper theme on the blog homepage" loading="lazy" /></a><figcaption>Warm Paper</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-swiss-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-swiss-verified.webp" alt="New Swiss theme on the blog homepage" loading="lazy" /></a><figcaption>Swiss</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-brutalist-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-brutalist-verified.webp" alt="New Brutalist theme on the blog homepage" loading="lazy" /></a><figcaption>Brutalist</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-zine-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-zine-verified.webp" alt="New Zine theme on the blog homepage" loading="lazy" /></a><figcaption>Zine</figcaption></figure>
</div>

### Glass and light

Soft Glass is softer and more rounded. Liquid Glass puts more emphasis on translucent layers and highlights. Its dark version has two palettes, Aurora and Indigo.

<div class="theme-story-grid theme-story-showcase">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-glass-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-glass-verified.webp" alt="New Soft Glass theme on the blog homepage" loading="lazy" /></a><figcaption>Soft Glass</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-light-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-light-verified.webp" alt="New Liquid Glass Light theme on the blog homepage" loading="lazy" /></a><figcaption>Liquid Glass Light</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-dark-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-dark-verified.webp" alt="New Liquid Glass Dark · Aurora theme on the blog homepage" loading="lazy" /></a><figcaption>Liquid Glass Dark · Aurora</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-dark-indigo-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-liquid-glass-dark-indigo-verified.webp" alt="New Liquid Glass Dark · Indigo theme on the blog homepage" loading="lazy" /></a><figcaption>Liquid Glass Dark · Indigo</figcaption></figure>
</div>

### Three kinds of sci-fi

Starship is calm and spacious. Retro sci-fi is warmer, with heavier shapes and stripes. Halo goes dark and neon.

<div class="theme-story-grid theme-story-showcase">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-starship-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-starship-verified.webp" alt="New Starship theme on the blog homepage" loading="lazy" /></a><figcaption>Starship</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-retro-futurist-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-retro-futurist-verified.webp" alt="New Retro sci-fi theme on the blog homepage" loading="lazy" /></a><figcaption>Retro sci-fi</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-holo-verified.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/theme-holo-verified.webp" alt="New Halo theme on the blog homepage" loading="lazy" /></a><figcaption>Halo</figcaption></figure>
</div>

Those are eleven visual options, including the two dark Liquid Glass palettes. They aren't eleven separate websites. They are different ways of reading the same one, whether that's a long article, the timeline or a Chinese translation.

## Design Lab: A place to try things before committing

We started with eight directions, then added more. There were thirteen initial mockups by the time Liquid Glass and the extra sci-fi options joined in.

I didn't want to choose from descriptions. “Warm paper” sounds nice, but what does it look like with my actual writing in it? What happens on my phone? Does the thing I like on the homepage still work halfway through a long post?

So we made a private design lab: a gallery of throwaway mockups using real public content from the blog. I could open it on my phone, compare versions and give feedback. The agents could work on different directions in parallel while I was doing something else.

<div class="theme-story-grid">
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/lab-directions.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/lab-directions.webp" alt="The actual design lab gallery with early visual directions and review notes" loading="lazy" /></a><figcaption>The first gallery: different directions beside my review notes.</figcaption></figure>
<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/lab-finalists.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/lab-finalists.webp" alt="The expanded theme gallery with revisions and comparison sections" loading="lazy" /></a><figcaption>The fuller round: complete page sets and revisions kept for comparison.</figcaption></figure>
</div>

When I came back, there was something to look at. I could say “more colour”, “more contrast”, or “I like this one, leave it alone”. Revisions sat next to the earlier versions, so I could compare them instead of trying to remember what had changed.

The process became a [design-lab skill](https://github.com/TheClooneyCollection/skills/tree/main/skills/design-lab). It keeps the experiments private, preserves reviewed versions and records decisions. Now I can use the same workflow to explore designs for other projects.

## Keep exploring until the direction feels right

One of the early directions was an orange HUD. It wasn't doing much for me.

But I still wanted sci-fi. I asked for more options: something like a clean starship interface, something retro-futurist, and something holographic. Those became three quite different directions, and all three made it through.

<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/early-hud.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/early-hud.webp" alt="The early orange sci-fi HUD mockup" loading="lazy" /></a><figcaption>The early HUD mockup. Compare this with Starship, Retro sci-fi and Halo above: the feedback was to explore sci-fi further, not just change this orange.</figcaption></figure>

This is part of what impressed me about the AI work. It could produce alternatives different enough to help me work out what I wanted. I wasn't just asking it to change orange to blue.

And I could afford to ask. Making another direction wasn't a commitment to several more days of work. It was something we could try and judge by looking at it.

Other ideas went the other way. I liked Terminal initially, but dropped it after the fuller round. A good first impression on a homepage wasn't enough. We expanded the favourites into posts, timelines, series, projects, notes and Chinese pages, and that gave me much more to judge.

<figure class="theme-story-figure" style="max-width: 560px; margin-left: auto; margin-right: auto;"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/early-terminal.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/early-terminal.webp" alt="The initial Terminal mockup, with a cobalt workspace header, amber accents and a file-list-style homepage" loading="lazy" /></a><figcaption>Terminal in the first design round. I liked it initially, but didn't keep it after reviewing the fuller page set.</figcaption></figure>

There were smaller decisions too. Warm Paper needed more contrast. Liquid Glass needed to look more transparent. Brutalist needed more colour, followed by a conversation about how much was too much. I could be specific because there was something concrete in front of me.

## Iteration still needs human judgement

The theme switcher became its own design exercise. I went back and forth with Claude over the button, the panel, the previews, how light and dark should behave, and what should happen on a phone.

<figure class="theme-story-figure"><a href="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-lab.webp"><img src="/assets/images/posts/the-blog-themes-i-would-never-have-built/picker-lab.webp" alt="An actual theme selector design lab iteration, with the earlier preview and Use interaction" loading="lazy" /></a><figcaption>An earlier selector in the design lab. The explicit preview-and-apply step was still part of the design.</figcaption></figure>

The previews show the themes on the real homepage. When I change between light and dark, the options change with the page. Even that has details: Halo is dark-only, so switching to light takes it to Starship, and switching back returns to Halo.

Then there was the basic act of choosing.

Originally, I could preview a theme and press Use to apply it. After trying it, I noticed that applying it didn't need to replay the visual effect. I was already looking at the theme.

Then I realised I didn't really need Preview and Use at all.

Clicking a theme could just select it. Give me a quick way to go back to whatever I had when I opened the selector, and let me keep trying things.

That's where we ended up: click to choose, with a revert option tied to the opening choice. Closing the panel keeps what I selected.

I like this part of the story because I didn't know the final interaction at the start. I needed to use it. The agents made it practical to follow that thought through, including the less visible details, like keeping the scroll position steady when the list changes on a phone.

We also added links that open a particular theme. I can send someone the version I want them to see, instead of explaining where to find it in the selector.

Using the site helped me judge what needed fixing, refining or removing. The agents made those changes quickly, but you still need humans in the loop to get things right.

## Good foundations keep paying off

I'm glad past Nicholas put a lot of thought into how [Subspace Builder](https://github.com/TheClooneyCollection/11ty-subspace-builder) was designed. The shared layouts and reusable components gave us a foundation to build on. This time, we got to reap the benefits: eleven visual options without maintaining eleven separate websites.

The mockups were deliberately disposable. The implementation builds on that shared structure with CSS skins and theme tokens, so each theme doesn't need its own copy of every page.

That is important if I'm going to keep maintaining this. Adding something to an article shouldn't mean adding it eleven times.

We checked more than the attractive first screen: code blocks, tables, images and captions, quotes, heading levels, the table of contents, Chinese text, and the different timeline entry types. The navigation stays visible, and on a wide screen the article's contents can stay beside it. On a phone, that has to fit back into the reading flow.

## The freedom to be picky

In [Everything All At Once](/posts/everything-all-at-once-ai-and-intentionality/), I wrote about how strange it feels to work on several projects at once, and how my own attention becomes the limit.

This was one of the good uses of that capacity. I could come back to a set of designs, look at them, make a decision and ask for another round. I still spent a day on and off. I still had to care about the details.

But without AI, I doubt I would have given myself permission to start something this broad. Eleven options would have sounded like far too much work for my personal blog.

AI made trying cheap enough that I could finally take the possibilities seriously. I was iterating on eleven themes while working on three to five other projects, all in the same day. That's the feeling I was trying to describe in Everything All At Once: there are suddenly so many things I can actually pursue, at the same time. The possibilities ahead feel almost endless.
