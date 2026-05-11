---
title: "thoughts: ProjectSpire image quality surprise"
date: "2026-05-11"
time: "19:49"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - thinking
  - project-spire
  - games
  - images
  - ui
---

<figure>
  <img
    src="/assets/images/timeline/project-spire/my-q85-image-quality-is-better-huh.jpg"
    alt="Side-by-side comparison of the Conflagration+ card in Slay the Spire and the ProjectSpire app, with the app rendering appearing cleaner"
    style="display: block; width: 100%; height: auto; border-radius: 8px;"
  />
  <figcaption style="text-align: center;">Pixel peeping Conflagration+ in-game (left) beside the ProjectSpire app render (right).</figcaption>
</figure>

I was pixel peeping [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire) against the actual game, comparing the original Slay the Spire PNG in-game with my app's q85 WebP version generated from that same source art.

Somehow, despite the game having the full-resolution PNG available, the card looks worse in-game than it does in my app.

My educated guess is that the game has its own processing and rendering pipeline, with its own constraints and reasons for the final image quality tradeoff.

> *Still: huh. I am genuinely surprised by that.*
