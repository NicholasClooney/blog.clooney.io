---
title: "wip: ProjectSpire SwiftUI card view"
date: "2026-04-28"
time: "14:17"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - wip
  - project-spire
  - games
  - swiftui
  - ui
---

I’m recreating the Slay the Spire 2 card view in SwiftUI with assets extracted from the game, and I’m very happy with how close the first pass feels. The current work is captured in [ProjectSpire snapshot/2026-04-28](https://github.com/NicholasClooney/ProjectSpire/releases/tag/snapshot%2F2026-04-28), especially [`CardView.swift`](https://github.com/NicholasClooney/ProjectSpire/blob/a588f4874ddbd1d43da60857c404f9f548062d83/Apps/Apple/Neow's%20Cafe/Neow's%20Cafe/Sources/CardView.swift); most of it is still hardcoded, but the visual foundation is there. Next I want to generalize it so the view can take a card data object and dynamically reload the text, colors, and assets, which might eventually turn into a Slay the Spire wiki app for the phone.

<figure style="text-align: center;">
  <img
    src="/assets/images/timeline/swiftui-sts2-card-view.jpg"
    alt="Comparison of a Slay the Spire 2 card in the game on the left and a matching SwiftUI card view on the right"
    style="width: min(100%, 900px); height: auto;"
  />
</figure>
