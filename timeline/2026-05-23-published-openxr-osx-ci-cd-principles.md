---
title: "blog: Designing CI/CD for OpenXR-OSX"
date: "2026-05-23"
time: "06:42"
parent: "/timeline/2026-05-19-published-meta-horizon-link-crossover-drive-check-bypass/"
tags:
  - published
  - vr
  - openxr
  - macos
  - ci
  - github-actions
---

I published [Designing CI/CD for OpenXR-OSX](/posts/openxr-osx-ci-cd-principles/), a write-up of the build, release, and trust principles I want before streamlining the repo for other people. The core idea is to keep cheap checks running on every PR, require the heavy Metal/Vulkan runtime lane whenever runtime-sensitive code changes, pin portable tooling with `mise`, and make every CI command reproducible locally through repo scripts instead of burying the real logic inside workflow YAML.
