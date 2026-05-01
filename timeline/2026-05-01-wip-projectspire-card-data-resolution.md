---
title: "wip: ProjectSpire card data resolution note"
date: "2026-05-01"
time: "16:19"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - wip
  - project-spire
  - games
  - parser
  - swiftui
  - documentation
---

I added a ProjectSpire design note in [399f74d](https://github.com/NicholasClooney/ProjectSpire/commit/399f74d0feab2f72a21df6afbf8c1551e4b9231f) that pushes the card pipeline toward a two-pass model: keep the parser output source-faithful, then resolve localization and rendered text separately for the app.

I created that work with GPT-5.5 in plan mode, and it asked a few genuinely useful clarification questions before I let it draft anything substantial, which made the whole process feel a lot more controlled than a blind codegen pass. I also pushed back on several of its first suggestions and made a lot of the consequential decisions myself, especially around keeping canonical variable names intact and separating raw data from resolved display data. That feels like a strong pattern for future ProjectSpire work: use the AI models to widen the search space, but keep the architecture decisions and edits grounded in my own judgment.
