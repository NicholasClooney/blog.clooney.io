---
title: "fix: Purple text color in Neow's Cafe"
date: "2026-05-09"
time: "16:26"
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
  <img
    src="/assets/images/timeline/project-spire/neows-cafe-purple-text-color.png"
    alt="Neow's Cafe card detail showing Blade of Ink with purple inline description text"
    style="display: block; max-width: 300px; width: 100%; height: auto; margin: 0 auto; border-radius: 8px;"
  />
  <figcaption style="text-align: center;">Blade of Ink now rendering its purple description text correctly.</figcaption>
</figure>

I shipped a tiny [Neow's Cafe v0.3.1](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/neows-cafe/v0.3.1) bug fix in [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire): purple was missing from the mapped text colors, so purple inline card text had nothing to resolve to. Now purple is part of the text color map, and cards like Blade of Ink can render their description highlight properly.
