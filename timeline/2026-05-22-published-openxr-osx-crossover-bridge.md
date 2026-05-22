---
title: "note: Can CrossOver OpenXR talk to OpenXR-OSX?"
date: "2026-05-22"
time: "20:55"
parent: "/timeline/2026-05-19-published-meta-horizon-link-crossover-drive-check-bypass/"
tags:
  - published
  - vr
  - crossover
  - openxr
  - macos
---

I published [Can CrossOver OpenXR Talk to OpenXR-OSX?](/notes/openxr-osx-crossover-bridge/), a follow-up note to the earlier `Quest` and `Virtual Desktop` dead-end notes. The useful part is that `Elite` reaching a Windows `OpenXR` runtime boundary in `CrossOver` does prove the app side is alive, but the bad news is that handing that off to [`OpenXR-OSX`](https://github.com/demonixis/OpenXR-OSX) would need a custom Windows runtime shim, IPC bridge, and host-side adapter rather than a simple runtime switch.
