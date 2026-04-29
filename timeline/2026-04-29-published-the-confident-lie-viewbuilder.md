---
title: "blog: The Confident Lie: What AI Got Wrong About @ViewBuilder"
date: "2026-04-29"
time: "12:11"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - published
  - swift
  - ios
  - swiftui
  - ai
  - swift-series
  - project-spire
---

I published [The Confident Lie: What AI Got Wrong About @ViewBuilder](/posts/the-confident-lie-what-ai-got-wrong-about-viewbuilder/), a SwiftUI debugging note that came out of the ProjectSpire card view work. It captures a small but useful lesson: `body` gets `@ViewBuilder` from the `View` protocol, but a custom computed `some View` property needs the annotation explicitly if I want an `if` without an `else`. The compiler was right, the AI was overconfident, and now the mistake is written down somewhere I can find again.
