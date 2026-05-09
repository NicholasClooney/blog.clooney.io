---
title: "feature: Upgrade-aware cards in Neow's Cafe"
date: "2026-05-08"
time: "21:04"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - shipped
  - project-spire
  - games
  - swiftui
  - ios
  - catalog
---

I shipped upgrade-aware card data across [Card Catalog v0.2.0](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/card-catalog/v0.2.0) and [Neow's Cafe v0.2.0](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/neows-cafe/v0.2.0) in [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire).

The catalog JSON now carries upgraded card values, and the app has a proper detailed card view where I can inspect those upgrades instead of only browsing the cards in their base form in the grid.

In the game, the numbers (`17` and `5`) in the text, would be highlighted with the color being green, because they are the upgraded from base values. That is next on my todo list.

<figure>
  <img
    src="/assets/images/timeline/project-spire/upgraded-supress.jpg"
    alt="Neow's Cafe detailed card view showing Supress with its upgraded values"
    style="display: block; max-width: 300px; width: 100%; height: auto; margin: 0 auto; border-radius: 8px;"
  />
  <figcaption style="text-align: center;">Supress in the new detail view, with upgraded card data exposed from the catalog.</figcaption>
</figure>