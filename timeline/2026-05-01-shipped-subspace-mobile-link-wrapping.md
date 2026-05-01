---
title: "fix: Mobile prose link wrapping (subspace)"
date: "2026-05-01"
time: "22:03"
tags:
  - shipped
  - subspace
  - css
  - mobile
  - typography
---

I shipped [v1.32.1](https://github.com/TheClooneyCollection/11ty-subspace-builder/releases/tag/v1.32.1) of [11ty-subspace-builder](https://github.com/TheClooneyCollection/11ty-subspace-builder) to fix prose link wrapping on narrow screens. Very long URLs now wrap inside the content column instead of forcing the page wider than the mobile viewport, which keeps notes and posts readable even when a raw link has nowhere graceful to break.
