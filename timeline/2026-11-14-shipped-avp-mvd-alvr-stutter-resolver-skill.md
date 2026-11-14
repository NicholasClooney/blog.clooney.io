---
title: "skill: Vision Pro MVD and ALVR stutter resolver"
date: "2026-11-14"
time: "12:53"
parent: "/timeline/2026-11-14-shipped-skills-v1-0-0/"
tags:
  - shipped
  - ai
  - skills
  - vr
  - vision-pro
  - alvr
  - networking
---

I added [avp-mvd-alvr-stutter-resolver](https://github.com/TheClooneyCollection/skills/tree/main/skills/avp-mvd-alvr-stutter-resolver) to my [skills](https://github.com/TheClooneyCollection/skills) in [197e34a](https://github.com/TheClooneyCollection/skills/commit/197e34a2e65773ecc5d1b4ae09e2a7e6ea062e31), turning what I wrote up in [Vision Pro MVD / ALVR Best Practices - No More Stuttering!](/posts/vision-pro-mvd-alvr-stutter-awdl-channel-hopping/) into something an agent can run. It audits and fixes Apple Vision Pro stutter for Mac Virtual Display and ALVR: AWDL channel hopping, the router's channel and width, the wired path, subnets and GPU encoder contention. The fix is verified twice: the AWDL schedule now stays on a single channel, and ALVR no longer stutters.
