---
title: "blog: Vision Pro MVD / ALVR Best Practices - No More Stuttering!"
date: "2026-11-14"
time: "13:14"
parent: "/timeline/2026-07-03-wip-edcontrolroom-and-elite-dangerous-tooling/"
tags:
  - published
  - vr
  - vision-pro
  - alvr
  - elite-dangerous
  - networking
  - wifi
  - macos
---

I published [Vision Pro MVD / ALVR Best Practices - No More Stuttering!](/posts/vision-pro-mvd-alvr-stutter-awdl-channel-hopping/), about running Mac Virtual Display and ALVR on an Apple Vision Pro at the same time while playing Elite Dangerous in VR. ALVR stuttered even on a clean channel, because AWDL kept pulling the Mac's radio onto its own social channel; putting the router's primary channel on AWDL's channel (44 in the UK) stopped the hopping, and the ALVR retest confirmed the stutter is gone. The post walks through the network layout and router settings I recommend, and links the [avp-mvd-alvr-stutter-resolver](https://github.com/TheClooneyCollection/skills/tree/main/skills/avp-mvd-alvr-stutter-resolver) skill for anyone who wants an agent to check their setup.
