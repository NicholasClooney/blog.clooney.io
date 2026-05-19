---
title: "blog: Bypassing the Meta Horizon Link Drive Check in CrossOver"
date: "2026-05-19"
time: "20:54"
tags:
  - published
  - macos
  - crossover
  - wine
  - vr
  - debugging
  - reverse-engineering
  - python
---

Published [Bypassing the Meta Horizon Link Drive Check in CrossOver](/posts/meta-horizon-link-crossover-drive-check-bypass/), a write-up of the narrow binary patch that got Meta Horizon Link past its CrossOver drive eligibility check. The interesting part is that the patch did work, but only revealed the deeper problem: the installer depends on Windows service identity, driver, and runtime behavior that CrossOver does not provide cleanly.
