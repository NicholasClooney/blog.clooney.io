---
title: "feature: Timeline Open Graph images (subspace)"
date: "2026-05-01"
time: "18:15"
parent: "/timeline/2026-04-14-shipped-timeline/"
tags:
  - timeline
  - shipped
  - subspace
  - timeline-page
  - open-graph
---

I shipped generated Open Graph cards for the timeline in [v1.32.0](https://github.com/TheClooneyCollection/11ty-subspace-builder/releases/tag/v1.32.0) of 11ty-subspace-builder. The root timeline page and individual timeline entries now get social preview images from generated card data, while static card metadata lives in site data so downstream projects can configure it without touching templates. I also updated the timeline docs to spell out how those preview images are selected.
