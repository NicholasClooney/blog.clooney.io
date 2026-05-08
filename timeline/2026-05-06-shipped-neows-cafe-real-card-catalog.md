---
title: "feature: Neow's Cafe Gets a Real Card Catalog"
date: "2026-05-06"
time: "17:47"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - shipped
  - project-spire
  - games
  - swiftui
  - catalog
  - documentation
---

<figure>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; align-items: start;">
    <img
      src="/assets/images/timeline/project-spire/2026-05-06-preview-01.jpg"
      alt="Neow's Cafe card catalog screen showing a two-column grid of Slay the Spire 2 cards"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
    <img
      src="/assets/images/timeline/project-spire/2026-05-06-preview-02.jpg"
      alt="Neow's Cafe card catalog screen with card filters open above the card grid"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
    <img
      src="/assets/images/timeline/project-spire/2026-05-06-preview-03.jpg"
      alt="Neow's Cafe card catalog screen showing filtered Slay the Spire 2 cards"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
  </div>
  <figcaption style="text-align: center;">Neow's Cafe browsing catalog-backed card data instead of bundled mock cards.</figcaption>
</figure>

I spent today turning [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire)'s iOS app *"Neow's Cafe"* from a mock-card browser into something much closer to a real Slay the Spire 2 card catalog.

The main decision was to keep **the first version boring in the best way**: a static, versioned catalog generated from the game data, served locally, and loaded directly by the app instead of inventing a REST API too early.

This is what the folder structure looks like now: 

{% github
"https://github.com/NicholasClooney/ProjectSpire/blob/e59eefa57b419e340f4dc37b698dc40dbad940c5/Documentation/Plans/0002%20-%20Neow%27s%20Cafe%20Card%20Catalog%20Integration.md#L13-L23"
%}

That structure gave the app one small index for browsing and filtering, while keeping full per-card files and portrait assets nearby for detail/debug views later. The important bit is that the card grid does not need to fetch hundreds of separate files just to show the collection.

{% github
"https://github.com/NicholasClooney/ProjectSpire/blob/e59eefa57b419e340f4dc37b698dc40dbad940c5/Documentation/Plans/0002%20-%20Neow%27s%20Cafe%20Card%20Catalog%20Integration.md#L36-L49"
%}

On the Swift side, [`CardCatalogService.swift`](https://github.com/NicholasClooney/ProjectSpire/blob/a0ddc5f1995f5651fcfc48ff3670a15056a0ab06/Apps/Apple/Neow%27s%20Cafe/Neow%27s%20Cafe/Sources/Services/CardCatalogService.swift) now loads `manifest.json`, follows it to `cards.index.json`, and decodes the catalog into app cards. I also removed the old bundled sample portraits, so the app is now much more dependent on the generated catalog behaving like the source of truth.

The Cards screen got some polish too: the catalog can be refreshed from the view, the grid is now a two-column layout that preserves the card aspect ratio in [`CardsView.swift`](https://github.com/NicholasClooney/ProjectSpire/blob/57df015dd40d2f62ccd8451f0c05b02751bcdf6f/Apps/Apple/Neow%27s%20Cafe/Neow%27s%20Cafe/Sources/Views/CardsView.swift), and I cleaned up the filter model so "no filter" is represented by optional UI state instead of fake `.all` enum cases ([filter cleanup commit](https://github.com/NicholasClooney/ProjectSpire/commit/0a6f20caf98cdb9b48dfea12c5569528b2a9ee77)).


The other nice bit from today is process-oriented: [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire) now has Captain Logs for collaboration notes and a reusable workflow for turning a day's commits and documentation changes into these timeline summaries. That should make it easier to keep writing about the work without having to rediscover the shape of the day from raw git history every time.
