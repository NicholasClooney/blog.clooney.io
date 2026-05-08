---
title: "feature: Card keywords in the parser and Neow's Cafe"
date: "2026-05-08"
time: "11:08"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - shipped
  - project-spire
  - games
  - parser
  - swiftui
  - ios
---

<figure>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; align-items: start;">
    <img
      src="/assets/images/timeline/project-spire/before-adding-keywords.jpg"
      alt="Neow's Cafe card detail before keywords were added, showing missing keyword pills for status and curse cards"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
    <img
      src="/assets/images/timeline/project-spire/added-keywords.jpg"
      alt="Neow's Cafe card detail after keywords were added, showing correctly populated keyword pills"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
  </div>
  <figcaption style="text-align: center;">Before and after: Cards were missing keywords entirely.</figcaption>
</figure>

I shipped card keyword support across both the [Card Parser v0.2.4](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/card-parser/v0.2.4) and [Neow's Cafe v0.1.0](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/neows-cafe/v0.1.0) in [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire).

The parser now extracts keyword references from card text and populates a keywords field in the generated JSON, which the app picks up and renders as keyword pills on card detail views.

Status and curse cards were the most visibly broken before this: they had no keywords at all, which made a whole class of cards feel incomplete in the UI. The research behind this lives in [Lab Doc 0014](https://github.com/NicholasClooney/ProjectSpire/blob/6b8de1b878effdad20869bcfa6ab1ac842dbf60a/Lab/Documentation/0014%20-%20Card%20Keywords.md), which covers how keyword matching works against the game's localization data.
