---
title: "bite: Async debounce demo in SwiftyBites"
date: "2026-04-24"
time: "22:41"
parent: "/timeline/2026-04-22-published-swiftui-in-the-wild-memory-concurrency-and-the-gaps-in-the-docs/"
tags:
  - shipped
  - swiftybites
  - swift
  - swiftui
  - ios
  - concurrency
---

I pushed [1263f2d](https://github.com/NicholasClooney/SwiftyBites/commit/1263f2d39de50ffacfdb593bd4493223d952270f) to [SwiftyBites](https://github.com/NicholasClooney/SwiftyBites) as a Friday-night AsyncDebounceDemo for playing with Swift's async and sync edges. The demo compares a view-owned async `.task` flow with a synchronous button action that cancels and restarts a stored `Task`, which makes the debounce mechanics feel a lot more concrete than just reading the pattern.
