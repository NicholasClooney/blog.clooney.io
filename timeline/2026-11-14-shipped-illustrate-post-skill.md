---
title: "skill: Illustrate a post, then pick"
date: "2026-11-14"
time: "17:03"
parent: "/timeline/2026-11-14-shipped-skills-v1-0-0/"
tags:
  - shipped
  - ai
  - skills
  - writing
---

I added [`illustrate-post`](https://github.com/TheClooneyCollection/skills/blob/main/skills/illustrate-post/SKILL.md) to my [skills](https://github.com/TheClooneyCollection/skills) in [490115c](https://github.com/TheClooneyCollection/skills/commit/490115cf54a30ebe8cf3e366f22b1ddfd6220070). It captures the workflow I just used to illustrate [Vision Pro MVD / ALVR Best Practices - No More Stuttering!](/posts/vision-pro-mvd-alvr-stutter-awdl-channel-hopping/), its first use.

- **Plan first.** The agent reads the post and proposes the images with me: what each one shows, where it goes, and whether it is an exact diagram or a mood or hero image. Nothing is generated before I approve the list.
- **Two kinds of producer.** Claude hand-draws the diagrams as SVG, where labels and numbers have to be right, each with a dark twin. An image model renders every concept in 3 or 4 clearly different style families, so each family is a consistent set.
- **One gallery.** Every variant lands in one local HTML page, side by side. I pick per image and mix styles freely; when I like a composition but want a change, the agent edits that image instead of starting over.
- **Only the picks land.** The chosen images go into the post, narrower than the text and centred, with SVG diagrams swapping to their dark twins with the site theme.

The Vision Pro post ended up with three of Claude's diagrams, two Midnight Blueprint illustrations and one Paper Circuit floor plan, picked out of a gallery of more than twenty images.

{% github "https://github.com/TheClooneyCollection/skills/blob/main/skills/illustrate-post/SKILL.md" %}
