---
title: "blog: SwiftUI .task(id:) debounce update"
date: "2026-04-24"
time: "22:31"
parent: "/timeline/2026-04-22-published-swiftui-in-the-wild-memory-concurrency-and-the-gaps-in-the-docs/"
tags:
  - published
  - swift
  - swiftui
  - ios
  - concurrency
---

I updated [SwiftUI in the Wild: Memory, Concurrency, and the Gaps in the Docs](/posts/swiftui-in-the-wild-memory-concurrency-and-the-gaps-in-the-docs/) with a clearer explanation of using `.task(id:)` for debounced work. The change moves that pattern into the debounce section, where SwiftUI's automatic cancellation model fits naturally, and keeps the button-action section focused on manual task ownership tradeoffs.
