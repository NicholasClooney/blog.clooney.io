---
title: "feature: ProjectSpire relics, catalog, and parsers"
date: "2026-05-15"
time: "17:32"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - shipped
  - project-spire
  - games
  - swiftui
  - catalog
  - parser
---

<figure>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; align-items: start;">
    <img
      src="/assets/images/timeline/project-spire/relics-view.jpg"
      alt="Neow's Cafe relics list showing parsed relics with search and colored character runs"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
    <img
      src="/assets/images/timeline/project-spire/relic-details-view.jpg"
      alt="Neow's Cafe relic detail view showing relic metadata and parsed description text"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
  </div>
  <figcaption style="text-align: center;">Parsed relic catalog data flowing into the Neow's Cafe relic list and detail views.</figcaption>
</figure>

I shipped the past couple of days of [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire) work as [Neow's Cafe v0.4.0](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/neows-cafe/v0.4.0), [Catalog Service v0.4.0](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/catalog-service/v0.4.0), and [Parser Service v0.3.0](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/parser-service/v0.3.0). The old card-only parser and catalog names are now broader services, the parsers cover relics, potions, events, and monsters, and Neow's Cafe has live relic list and detail screens backed by the generated catalog instead of mock data. This is the first point where [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire) feels less like a card browser and more like the start of a full Slay the Spire reference app.
