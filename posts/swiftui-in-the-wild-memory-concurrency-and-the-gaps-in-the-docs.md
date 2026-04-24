---
title: "SwiftUI in the Wild: Memory, Concurrency, and the Gaps in the Docs"
date: 2026-04-22
eleventyNavigation:
  key: swiftui-in-the-wild-memory-concurrency-and-the-gaps-in-the-docs
tags:
  - swift
  - ios
  - swiftui
  - concurrency
  - observation
  - swift-series
excerpt: |
  A collection of hard-won SwiftUI patterns for memory, async work, and Observation edge cases. Covers view model lifetime bugs, debouncing, async button actions, task ownership, reference cycles, and the tension between @Observable and actors.
---

A collection of hard-won patterns, and a few landmines, for building real SwiftUI apps with Swift's modern concurrency model. Covers view model lifetime bugs, debouncing, async button patterns, task ownership, reference cycles, and the `@Observable` + actor tension. Some of this is in the docs; some of it you only find out when something doesn't deinit and you can't figure out why.

[[toc]]

## 1. `@State` + `@Observable` lifecycle: When does SwiftUI release the view model?

Start here. This is one of the most surprising gotchas in the post-iOS 17 SwiftUI model, and it has downstream consequences for every pattern involving cleanup and task cancellation.

The short answer: Apple's official docs do not give a precise guarantee on when `@State` releases a reference-type object. The bugs described below have had a complicated history — some fixed, some not — and iOS 26 has already introduced new regressions.

### What Apple officially says

The [migration guide](https://developer.apple.com/documentation/SwiftUI/Migrating-from-the-observable-object-protocol-to-the-observable-macro) and [WWDC23 "Discover Observation in SwiftUI"](https://developer.apple.com/videos/play/wwdc2023/10149/) say: if the view owns the model, use `@State`. The docs describe `@State` as tying the object's lifetime to the view's identity, mirroring what `@StateObject` did for `ObservableObject`. But they do not specify exactly when deallocation happens relative to the view leaving the hierarchy.

### What actually happens

#### Sheets and modal presentations — fixed post-iOS 17.1, but with caveats

The most widely reported bug: `@State` view models in sheet/`fullScreenCover` presentations were never deallocated after dismissal; `deinit` was never called. This was confirmed as an iOS 17.0 regression — the same pattern worked correctly on iOS 16. ([Apple Forums](https://developer.apple.com/forums/thread/736110), [Apple Forums](https://forums.developer.apple.com/forums/thread/736239))

The fix history is messy. The bug was addressed in iOS 17.2 beta 1, then regressed, then fixed again. The author of the main third-party workaround package ([SwiftUIMemoryLeakWorkaround](https://github.com/jbafford/SwiftUIMemoryLeakWorkaround)) confirmed the underlying bug was resolved sometime after iOS 17.1 and marked the package as no longer needed. There are no confirmed developer reports of this specific sheet leak reproducing on iOS 18.

**However:** Apple has never documented a deallocation timing contract for `@State` + `@Observable`. Even on a patched OS, "not leaking" is not the same as "deinit fires promptly and reliably."

#### `NavigationStack` destinations — unresolved

Views pushed onto a `NavigationStack` do not fully tear down their state on pop. `@State`-held view models re-initialise on each push without a corresponding `deinit` from the previous instance. ([Apple Forums](https://developer.apple.com/forums/thread/716804))

This is a distinct issue from the sheet leak and has its own tracking. There is no confirmed fix in any iOS 17 or iOS 18 release notes. The `.id()` workaround (forcing SwiftUI to treat a view as a new identity) does trigger correct deallocation but is a workaround, not a fix.

#### `@Observable` classes in general

Classes held by views via `@State` are not deinitialized as expected in multiple contexts beyond sheets and navigation. ([Swift Forums](https://forums.swift.org/t/an-observable-class-held-by-a-swiftui-view-is-not-deinitialized/79505))

#### iOS 26 — new regression

A new class of bug has appeared in iOS 26.1 beta: updating a `@State` field value no longer triggers a view re-render, even though the state updates internally. This is confirmed as a regression from iOS 26.0 and is unrelated to the deallocation bugs above, but signals that `@State` + `@Observable` behaviour continues to be actively destabilised across OS releases. ([Apple Developer Forums — Observation tag](https://developer.apple.com/forums/tags/observation))

### What this means in practice

You cannot rely on `deinit` for cleanup when using `@State` + `@Observable` in sheets or `NavigationStack` destinations. Even where the gross memory leak has been fixed, Apple provides no timing guarantee on deallocation. If your view model starts a timer, opens a stream, or kicks off an async task, `deinit` is not a safe place to cancel it.

This makes `onDisappear`-based cleanup not just a nice pattern, but a necessity:

```swift
.onDisappear {
    viewModel.cancelAllWork()
}
```

This is the correct approach given current SwiftUI behaviour, not a workaround you should expect to remove once a bug is fixed.

### Sources

- [Migrating from ObservableObject to Observable macro — Apple Docs](https://developer.apple.com/documentation/SwiftUI/Migrating-from-the-observable-object-protocol-to-the-observable-macro)
- [Discover Observation in SwiftUI — WWDC23](https://developer.apple.com/videos/play/wwdc2023/10149/)
- [@Observable/@State memory leak — Apple Forums](https://developer.apple.com/forums/thread/736110)
- [@State ViewModel memory leak in iOS 17 — Apple Forums](https://forums.developer.apple.com/forums/thread/736239)
- [NavigationStack memory leak — Apple Forums](https://developer.apple.com/forums/thread/716804)
- [Observable class not deinitialized — Swift Forums](https://forums.swift.org/t/an-observable-class-held-by-a-swiftui-view-is-not-deinitialized/79505)
- [SwiftUI ViewModel not being deinit — Swift Forums](https://forums.swift.org/t/swiftui-viewmodel-not-being-deinit-and-causing-memory-leak/71199)
- [SwiftUI view leaks in iOS 17 — Apple Forums](https://developer.apple.com/forums/thread/737967)
- [SwiftUIMemoryLeakWorkaround — John Bafford (sheet fix confirmed post-17.1)](https://bafford.com/2023/10/12/swiftui-memory-leak-workaround/)
- [iOS 26.1 @State re-render regression — Apple Developer Forums](https://developer.apple.com/forums/tags/observation)

## 2. Debouncing with `async/await`

Debouncing is a common need. You want to delay work until the user has stopped typing, tapping, or otherwise triggering rapid events. The `async/await` pattern for this is clean once you know the shape.

The canonical pattern:

```swift
@MainActor
final class ViewModel {
    private var debounceTask: Task<Void, Never>?

    func debouncedCount(text: String) {
        debounceTask?.cancel()
        debounceTask = Task { [weak self] in
            do {
                try await Task.sleep(for: .milliseconds(300))
                guard let self else { return }
                self.performCount(text: text)
            } catch is CancellationError {
                return
            } catch {
                assertionFailure("Unexpected debounce error: \(error)")
            }
        }
    }

    private func performCount(text: String) {
        // update state
    }
}
```

The steps:

1. Cancel the previous task.
2. Start a new task.
3. Sleep for the debounce interval.
4. Treat `CancellationError` as expected control flow and return immediately.
5. Only run the real work after the sleep completes uninterrupted.

The critical mistake to avoid is using `try? await Task.sleep(...)`. That silently swallows the cancellation error and lets the debounced work run anyway, exactly what you do not want.

On actor context: if `performCount` touches UI or view-model state, it should be `@MainActor`-isolated. If your view model is already `@MainActor` as above, you generally do not need extra `MainActor.run` calls. Just make sure `performCount` is properly isolated.

### Using `.task(id:)` to avoid manual task management

The pattern above works, but you're doing the task lifecycle yourself — storing the task, cancelling it, recreating it. SwiftUI's `.task(id:)` modifier handles all of that automatically.

When the `id` value changes, SwiftUI cancels the previous task and starts a new one. When the view disappears, it cancels too. This means your async function can be written without any of that boilerplate:

```swift
func debouncedCountAsync(text: String) async throws {
    try await Task.sleep(for: .milliseconds(300))
    self.performCount(text: text)
}
```

No stored task reference. No manual cancel. No `[weak self]` dance. The `CancellationError` from `Task.sleep` propagates naturally — `.task` expects this and handles it silently.

Wire it up in the view:

```swift
.task(id: text) {
    try? await viewModel.debouncedCountAsync(text: text)
}
```

The `try?` here is intentional and correct — unlike in the manual pattern where swallowing cancellation was the bug, here cancellation is already being managed externally by `.task`. You're only suppressing the error at the call site; the sleep itself still throws and exits cleanly when cancelled.

`.task` without an `id` runs once on appear. `.task(id:)` runs on appear *and* every time `id` changes — which is exactly the reactivity you want for debouncing a search field or any other frequently-updating value.

The tradeoff: this ties your debounce logic to the view layer. The manual `Task`-based approach remains useful when you need debouncing inside a view model or service with no SwiftUI view in scope.

## 3. Async work in button actions

SwiftUI's `Button` does not natively accept an `async` action closure, so there are a few patterns depending on how much control you need.

### Option 1: `Task {}` in the action

Simple, but no auto-cancellation.

```swift
Button("Fetch") {
    Task {
        await fetchData()
    }
}
```

The `Task` inherits the actor context of the view, usually the main actor, so UI updates are safe. The downside is that if the user taps again, a second task launches alongside the first.

### Option 2: `@State Task`

Manual control, most flexible.

```swift
@State private var currentTask: Task<Void, Never>?

Button("Fetch") {
    currentTask?.cancel()
    currentTask = Task {
        await fetchData()
    }
}
```

You manage the lifecycle yourself, which means more boilerplate but more control. You can cancel on retap and in `.onDisappear`, inspect task state, and keep the cancellation handle wherever it best fits.

| Pattern | Auto-cancel on retap | Lifecycle ownership |
| --- | --- | --- |
| `Task {}` in action | No | Manual |
| `@State Task` | Yes, manual | Manual |

## 4. Storing a `Task` in a SwiftUI view

When you need a cancellable task handle inside a view, `@State` is the right storage:

```swift
struct ContentView: View {
    @State private var reloadTask: Task<Void, Never>?

    var body: some View {
        Button("Reload") {
            reloadTask?.cancel()
            reloadTask = Task {
                await viewModel.reload()
            }
        }
        .onDisappear {
            reloadTask?.cancel()
        }
    }
}
```

Why `@State`? `Task` is a value type, but it wraps a reference to the underlying async work. Storing it in `@State` gives you stable heap storage across re-renders, so you are always holding a reference to the same task handle rather than a copy that gets discarded on the next `body` evaluation.

Other properties of this pattern:

- You get a cancellation handle you can call `.cancel()` on at any time.
- The task handle's lifetime is tied to the view.
- Assigning to the property does not trigger a view re-render, since `Task` does not conform to any observable protocol.

When to put the task on the view model instead: if the async work is conceptually owned by the model rather than a specific UI interaction, storing the task there keeps the view leaner and the logic easier to test.

## 5. Closures, captures, and reference cycles

A common source of confusion: when does capturing `self` in a closure create a retain cycle?

The key insight is that a cycle does not require two distinct objects. It only requires a cycle in the reference graph. When a class holds a closure that captures `self`:

```text
self -> closure -> self
```

That is a cycle. `self` holds a strong reference to the closure via the stored property, and the closure holds a strong reference back to `self` via the capture. ARC cannot find a zero-reference point to deallocate either one.

```swift
class Foo {
    var action: (() -> Void)?

    func setup() {
        action = {
            self.doSomething() // strong capture - cycle
        }
    }

    func doSomething() { print("hello") }

    deinit { print("deallocated") } // never prints
}
```

Fix it with `[weak self]`:

```swift
action = { [weak self] in
    self?.doSomething()
}
```

The one case where there is no cycle is when the closure is not stored. A closure passed to `UIView.animate` does not cause a retain cycle even with a strong `self` capture because the animation system releases the closure after it fires, so the reference is transient.

The rule of thumb: if a closure is stored as a property and captures `self`, use `[weak self]`.

## 6. `@Observable` and actors: The tension

`@Observable` and `actor` can coexist syntactically, but they are in tension by design.

```swift
@Observable
actor CounterActor {
    var count = 0
    func increment() { count += 1 }
}
```

The problem is that `@Observable` synthesizes observation registrar hooks such as `_$observationRegistrar.access(...)` and mutation tracking that need to be coordinated with main-actor-driven UI observation, while an `actor`'s properties must be accessed on that actor's executor. The mismatch produces compiler warnings about non-Sendable types crossing actor boundaries.

### The practical solutions

#### 1. Use `@MainActor` instead

Most common for UI.

```swift
@Observable
@MainActor
class CounterModel {
    var count = 0
    func increment() { count += 1 }
}
```

This gives you observation plus main-thread safety, which is almost always what you want for SwiftUI state.

#### 2. Separate the actor from the observable model

Usually the cleanest architecture.

```swift
actor DataService {
    func fetchCount() async -> Int { ... }
}

@Observable
@MainActor
class ViewModel {
    var count = 0
    private let service = DataService()

    func load() async {
        count = await service.fetchCount()
    }
}
```

The actor handles concurrency and isolation for background work. The `@Observable @MainActor` class handles UI observation. Each does one thing.

The mental model: use `actor` for work that genuinely needs background isolation or serialized access to shared state. Use `@Observable @MainActor class` for anything that drives SwiftUI views. Bridge between them with `await`.

More patterns to come. Feed the machines. 🤖🤤
