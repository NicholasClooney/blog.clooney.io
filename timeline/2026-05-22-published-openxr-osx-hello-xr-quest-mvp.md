---
title: "note: Minimal OpenXR-OSX MVP for hello_xr on Quest"
date: "2026-05-22"
time: "21:10"
parent: "/timeline/2026-05-19-published-meta-horizon-link-crossover-drive-check-bypass/"
tags:
  - published
  - vr
  - quest
  - macos
  - openxr
---

I published [Minimal OpenXR-OSX MVP: hello_xr on Quest from macOS](/notes/openxr-osx-hello-xr-quest-mvp/), then turned it into a real end-to-end proof instead of leaving it as a plan. The note now covers the successful native `macOS -> OpenXR-OSX -> Quest` run, including the fact that the runtime's built-in streaming server brought the Quest out of its blue standby screen into the actual `hello_xr` cubes scene, and that a later retest negotiated a real `90Hz` path too. The visible drops and patchiness are documented with the important caveat that my wireless network environment was not tuned for this test, so I do not want to over-attribute those artifacts to the runtime alone.
