---
title: "wip: ProjectSpire iOS card library foundations"
date: "2026-04-30"
time: "16:50"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - wip
  - project-spire
  - games
  - swiftui
  - ios
  - ui
  - ai
---

I’ve been working on ProjectSpire’s iOS app (codename: Neow’s Cafe) in [NicholasClooney/ProjectSpire](https://github.com/NicholasClooney/ProjectSpire) as a 1:1 Slay the Spire 2 card library, and the useful part is not just the filtering UI and refactor cleanup, but **the way I’m trying to work with AI**.

I get better results when I lay down the foundations myself first, especially around quality, guard rails, and how the data is modeled, and then let AI work inside that framework instead of asking it to define the framework for me. It also helps a lot when I have AI propose higher-level API or contract changes before it starts making edits.

Here's a snapshot of the visual changes. There is also quite a bit of non-visual work too, like reorganizing the source files into clearer areas such as App, Components, Models, Views, Logic, and Dependencies, splitting the banner text into its own component, moving the app toward **injected dependencies** instead of hardcoded wiring, and a few other things.

...and the changes can be found here on [GitHub](https://github.com/NicholasClooney/ProjectSpire/compare/snapshot/2026-04-29-6145a90...snapshot/2026-04-30)

<div style="position:relative;padding-bottom:69%;height:0;overflow:hidden;">
  <iframe
    src="https://www.youtube.com/embed/EJPv3Vf2Dn8"
    style="position:absolute;top:0;left:0;width:100%;height:100%;"
    frameborder="0"
    allowfullscreen>
  </iframe>
</div>

