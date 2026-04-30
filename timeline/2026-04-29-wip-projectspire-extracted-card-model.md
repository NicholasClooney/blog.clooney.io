---
title: "wip: ProjectSpire extracted card model"
date: "2026-04-29"
time: "11:34"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - wip
  - project-spire
  - games
  - swiftui
  - parser
  - ui
---

I’ve moved the SwiftUI card view forward by adding a real Card model, so even though the screen does not look dramatically different yet, the app is much closer to rendering cards from extracted data instead of hardcoded values. There is even a small visual regression in the golden text compared with the previous screenshot, but the important change is underneath: I can now refine the card parser and JSON output models, bring those records and required images directly into the app, and aim to emulate any card regardless of rarity, type, or data shape. The relevant work is in the ProjectSpire compare for the [card view changes](https://github.com/NicholasClooney/ProjectSpire/compare/snapshot/2026-04-28...snapshot/2026-04-29-1130am) and the new [card model](https://github.com/NicholasClooney/ProjectSpire/compare/snapshot/2026-04-28...snapshot/2026-04-29-1130am#diff-45c26e0ff32abd7a117e5c5ff261a5a356e957be764891e4c12045c3ca82650a).

<figure style="text-align: center;">
  <img
    src="/assets/images/timeline/swiftui-sts2-extracted-card-model.jpg"
    alt="Updated SwiftUI Slay the Spire 2 card view powered by an extracted card model"
    style="max-height: 520px; width: auto; max-width: 100%;"
  />
  <figcaption>New Card model version.</figcaption>
</figure>

<figure style="text-align: center;">
  <img
    src="/assets/images/timeline/swiftui-sts2-card-view.jpg"
    alt="Previous comparison of a Slay the Spire 2 card in the game and the earlier SwiftUI card view"
    style="width: min(100%, 900px); height: auto;"
  />
  <figcaption>Previous visual pass for comparison.</figcaption>
</figure>
