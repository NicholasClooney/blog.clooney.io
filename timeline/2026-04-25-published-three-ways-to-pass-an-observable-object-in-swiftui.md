---
title: "blog: Three ways to pass an @Observable object in SwiftUI"
date: "2026-04-25"
time: "11:10"
tags:
  - published
  - swift
  - swiftui
  - ios
  - observation
  - swift-series
---

I published [Three ways to pass an @Observable object in SwiftUI](/posts/three-ways-to-pass-an-observable-object-in-swiftui/), a short SwiftUI reference for choosing between environment injection, direct initializer passing, and `@Binding`. It keeps the distinction focused on ownership and coupling: whole-object reference sharing when the child is allowed to know the model, or a projected binding when the child should only see one value.
