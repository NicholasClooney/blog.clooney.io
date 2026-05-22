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

I published [Minimal OpenXR-OSX MVP: hello_xr on Quest from macOS](/notes/openxr-osx-hello-xr-quest-mvp/), then turned it into a real end-to-end proof instead of leaving it as a plan. The note now covers the successful native `macOS -> OpenXR-OSX -> Quest` run, includes a short clip of the headset result, and explains that the runtime's built-in streaming server brought the Quest out of its blue standby screen into the actual `hello_xr` cubes scene before a later retest negotiated a real `90Hz` path too. The visible drops and patchiness are documented with the important caveat that my wireless network environment was not tuned for this test, so I do not want to over-attribute those artifacts to the runtime alone.

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://www.youtube.com/embed/slwVUBdZR1Y"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    title="OpenXR-OSX hello_xr on Quest from macOS"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>
