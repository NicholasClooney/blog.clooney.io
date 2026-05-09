---
title: "feature: Colored card descriptions in ProjectSpire"
date: "2026-05-09"
time: "10:59"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - shipped
  - project-spire
  - games
  - swiftui
  - ios
  - catalog
---

<figure>
  <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; align-items: start;">
    <img
      src="/assets/images/timeline/project-spire/colored-description.jpg"
      alt="Neow's Cafe card detail showing colored text inside a card description"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
    <img
      src="/assets/images/timeline/project-spire/colored-description-for-upgraded-cards.jpg"
      alt="Neow's Cafe upgraded card detail showing colored description values"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
    <img
      src="/assets/images/timeline/project-spire/colored-description-for-upgraded-cards-suppress.jpg"
      alt="Neow's Cafe Supress card detail showing upgraded colored description values"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
  </div>
  <figcaption style="text-align: center;">Colored description text flowing from the catalog into Neow's Cafe card details.</figcaption>
</figure>

I shipped a small combined [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire) release: [Card Catalog v0.3.0](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/card-catalog/v0.3.0) and [Neow's Cafe v0.3.0](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/neows-cafe/v0.3.0) now carry colored inline description text through the catalog and into the SwiftUI card views. The visible change is small, but it closes the loop from parsed game text to rendered card detail: upgraded values and highlighted terms now show with the same kind of color signal the game uses.
