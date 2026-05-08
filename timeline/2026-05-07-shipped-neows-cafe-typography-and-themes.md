---
title: "feature: Neow's Cafe typography and themes"
date: "2026-05-07"
time: "21:00"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - shipped
  - project-spire
  - games
  - swiftui
  - ios
  - ui
---

<figure>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; align-items: start;">
    <img
      src="/assets/images/timeline/project-spire/light-theme.jpg"
      alt="Neow's Cafe card catalog using the light theme"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
    <img
      src="/assets/images/timeline/project-spire/dark-theme.jpg"
      alt="Neow's Cafe card catalog using the dark theme"
      style="width: 100%; height: auto; border-radius: 8px;"
    />
  </div>
  <figcaption>Neow's Cafe with the new light and dark app themes side by side.</figcaption>
</figure>

I shipped another Neow's Cafe UI pass in [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire), focused on turning the app's visual styling into reusable systems instead of one-off view code. The work in the [May 7 snapshot](https://github.com/NicholasClooney/ProjectSpire/compare/snapshot/2026-05-06...snapshot/2026-05-07) registers the app fonts as a typography system so I can use consistent text styles anywhere in SwiftUI, and adds explicit light and dark themes for the card catalog UI. It is a small-looking change, but it gives the app a much cleaner foundation for future screens.
