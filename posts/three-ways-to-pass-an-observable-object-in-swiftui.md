---
title: "Three ways to pass an @Observable object in SwiftUI"
date: 2026-04-25
eleventyNavigation:
  key: three-ways-to-pass-an-observable-object-in-swiftui
tags:
  - swift
  - ios
  - swiftui
  - observation
  - swift-series
excerpt: |
  Environment injection, direct initializer passing, and @Binding all share SwiftUI state, but they carry different meanings around ownership, coupling, and interface scope.
---

Environment injection, direct init, and `@Binding` are three distinct ways to pass an `@Observable` object, or part of one, into a SwiftUI subview. They look similar on the surface, but they have meaningfully different semantics around ownership, coupling, and interface scope.

[[toc]]

## 1. `.environment` / `@Environment`

Inject the object into the view tree and let any descendant pull it out by type.

```swift
// Parent
ContentView()
    .environment(state)

// Child (anywhere in the subtree)
@Environment(AppState.self) var state
```

The object flows implicitly through the entire view hierarchy. Any descendant can opt in; you do not need to thread it through intermediate views.

- Child gets the **same reference**; mutations are visible everywhere
- No initializer argument; the dependency is invisible at the call site
- Crashes at runtime, not compile time, if you forget to inject it

> Best for app-wide or subtree-wide shared state: auth session, navigation model, user preferences, theme.

## 2. Direct init: `Subview(state: state)`

Pass the object as a regular stored property on the child's initializer.

```swift
// Child
struct Subview: View {
    let state: AppState

    var body: some View {
        Text(state.title)
    }
}

// Parent
Subview(state: state)
```

Because `@Observable` objects are classes, the child holds a reference to the same instance. Mutations made in the child propagate back to the parent automatically; no `@Binding` needed.

- Dependency is explicit and visible at the call site
- Compile-time safety; the type system enforces it
- Easiest to reason about and unit test in isolation

> Best for closely coupled parent/child views where making the relationship obvious is worth the extra argument.

## 3. `@Binding`

Pass a projected binding to a single property, not the whole object.

```swift
// Parent: @Bindable lets you project $ bindings from @Observable
@Bindable var state: AppState

NameField(name: $state.username)

// Child
struct NameField: View {
    @Binding var name: String

    var body: some View {
        TextField("Username", text: $name)
    }
}
```

The child gets a two-way connection to one specific value, with no knowledge of the parent model type. Writes propagate back to the source automatically.

- Narrowest interface; child only sees what it needs
- Makes components reusable across different model types
- Requires `@Bindable` on the parent side to produce `$` projections from an `@Observable` object
- Also the right pattern for value types, since `@Observable` is class-only

> Best for reusable or generic children that should not be coupled to a specific model type, and for primitive value types.

## Quick reference

| Pattern | Syntax | Passes | Coupling |
|---|---|---|---|
| `.environment` | `@Environment(T.self)` | Whole object, implicit | Any depth, runtime crash if missing |
| Direct init | `let state: T` | Whole object, explicit | Compile-safe, tighter to parent model |
| `@Binding` | `@Binding var x: T` | Single property, two-way | Reusable, needs `@Bindable` on parent |

The core distinction: environment and direct init both pass the *whole object* with reference semantics and full mutation access. `@Binding` passes a *projected binding to one property*: scoped read/write access, with no object reference. Reach for `@Binding` when you want to build something reusable; reach for the others when coupling to a specific model is fine.
