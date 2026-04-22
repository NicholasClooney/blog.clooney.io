---
title: "blog: SwiftUI in the Wild: Memory, Concurrency, and the Gaps in the Docs"
date: "2026-04-22"
time: "12:10"
tags:
  - timeline
  - published
  - swift
  - swiftui
  - ios
  - concurrency
  - observation
---

I published [SwiftUI in the Wild: Memory, Concurrency, and the Gaps in the Docs](/posts/swiftui-in-the-wild-memory-concurrency-and-the-gaps-in-the-docs/), a field guide to the parts of modern SwiftUI + concurrency that look clean in isolation but get messy in real apps. The post covers `@State` + `@Observable` lifetime bugs, debouncing with `async/await`, task ownership in views and buttons, closure capture cycles, and why `@Observable` and `actor` pull in different architectural directions.
