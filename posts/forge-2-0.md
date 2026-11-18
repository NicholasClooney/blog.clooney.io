---
title: "TODO: Forge 2.0"
date: 2026-11-18
time: "12:00"
draft: true
tags:
  - hardware
  - debugging
  - personal
excerpt: |
  STUB, not the post. Moving the gaming PC out of a 4U rackmount case into an
  orange Fractal Pop Air turned into a GPU thermal repair.
---

<!--
Stub only. Full fact base (with what is confirmed vs hypothesis): .temp/forge-2-0/facts.md
Publish checklist: real title, zh version, series entry, timeline entry.
Still pending before writing: first Elite Dangerous VR session in the new case.
-->

[[toc]]

## Gist

- A case swap: Ryzen 7 3700X, RTX 2080 Ti, X570 board moved from a 4U rackmount into an orange Fractal Pop Air. No new parts.
- The CPU came out of its locked AM4 socket stuck to the cooler. Old paste. It survived.
- Repadded the GPU with stacked 1 mm ARCTIC TP-4. Pads touched the memory, but held the heatsink off the die.
- Second remount: ~105W, 109°C hotspot, GPU-Z saying `Pwr`. "what did i break... hmmm"
- The tell: almost no paste transferred to the copper.
- Third remount: pre-compressed pads, paste on both sides, firmer seating. ~235W, 66°C core, 83°C hotspot. 1h 20m of FurMark at 66.6°C.
- Stock fan curve was enough after the fix: 1650 RPM vs ~2900 RPM for the same temp. Power limit back to 100%, ~255W.
- The old power and temp caps were probably hiding a cooling problem (hypothesis, not proven).
- The case build: misaligned standoffs, PSU holes, a twisted 24-pin, and too many nearly identical fan and RGB connectors.
- In-case results match the open bench: 76.6°C core, 94.7°C hotspot.
- Lesson: a pad imprint proves pad contact, not die contact.
