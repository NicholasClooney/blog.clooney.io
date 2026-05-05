---
title: "feature: Card Parser v0.2.3 - Calculated Vars and New Formatters"
date: "2026-05-05"
time: "17:51"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - shipped
  - project-spire
  - games
  - parser
  - tooling
---

Shipped [Card Parser v0.2.3](https://github.com/NicholasClooney/ProjectSpire/releases/tag/release/card-parser/v0.2.3) to [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire), which adds calculated variable resolution, numeric symbol extraction, and conditional text formatters. Cards like Ashen Strike now show computed damage values instead of raw placeholders, and I've added `choose`, `cond`, `inverseDiff`, and boolean formatters for rendering conditional card text. The parser now threads card type, target type, and runtime display vars (HasRider, Sapping, Energized, etc.) through text resolution, making the pipeline much more precise about card state and context.

## Human-AI collaboration: architect and developer

The whole card parser has been built in this mode: I act as architect, GPT-5.5 acts as developer. Every meaningful parser improvement came from me inspecting concrete generated JSON against real card examples and asking source-fidelity questions. GPT-5.5 didn't discover that cost upgrades can be negative, or that `Bash`'s upgraded Vulnerable value wasn't being applied, or that X-cost cards needed their own shape. I did, by reading the output and comparing it to what the game actually does.

The pattern that emerged: I'd spot a class of issue on a specific card, explain what the game source was doing and why the output was wrong, and GPT-5.5 would produce a working fix. Then I'd push to turn each discovery into a repeatable check rather than a one-off patch. The coverage audit script, the unresolved placeholder CSV, the hard failures on missing source files: all of those came from me steering toward systemic fixes after catching individual bugs.

What GPT-5.5 is good at in this loop is the mechanical throughput. Regex extraction, threading new state through a resolution pipeline, mirroring changes to the audit script, regenerating 55 JSON files, splitting work into clean commits. The domain knowledge, the quality bar, and the architectural decisions all come from the human side. GPT-5.5 doesn't know what `CalculatedVar` means in the game engine or why display vars like `HasRider` matter for conditional text. It doesn't need to, once I describe the shape of the problem clearly enough.

The productivity gain isn't just speed. It's that I can stay at the architectural level, thinking about which cards are still wrong and why, without losing momentum to implementation mechanics. The feedback loop stays tight: inspect, identify, describe, implement, verify, repeat.
