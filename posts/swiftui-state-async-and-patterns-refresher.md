---
title: "A refresher on SwiftUI state management, async/await, and common patterns"
date: 2026-06-17
time: "14:30"
tags:
  - swift
  - ios
  - swiftui
  - observation
  - concurrency
  - mvvm
  - swift-series
excerpt: |
  A working refresher on the SwiftUI you actually meet in real codebases in 2026: pre-iOS 17 state management, modern @Observable, async/await as the default, and the everyday patterns for networking, navigation, and error handling.
---

Every time I drop back into SwiftUI after a stretch away, I want a single page that catches me up on the parts of the framework I actually touch day to day. Not an exhaustive reference, just the working model: what people reach for in 2026, what the older property wrappers were really doing, and the patterns I want at my fingertips when I open a real codebase.

This post is that page.

[[toc]]

## Swift fundamentals worth keeping fresh

Before SwiftUI specifics, there are a handful of language features that show up in almost every file you read. None of them are exotic, but they are easy to get rusty on.

Optionals are everywhere. `if let`, `guard let`, `??`, and optional chaining all do similar work, but inside a function I default to `guard let` so the failure case exits early and the happy path stays unindented.

Structs and classes carry different meanings in SwiftUI. Views are structs, copied on every change, which is why view bodies feel cheap. ViewModels are classes, shared by reference, which is why state in them persists across renders. Structs do not inherit; classes do.

Closures show up constantly as trailing arguments. The trap is async or escaping closures retaining `self`, so `[weak self]` capture lists are a habit rather than a decision.

Protocols are how the codebase stays testable. A network layer behind a protocol can be swapped for a mock in tests without touching anything else. I reach for protocol plus concrete type before I reach for inheritance.

`Codable` (really `Decodable` and `Encodable`) is the JSON workhorse. The piece worth remembering is `CodingKeys`, for the very common case where the JSON field names do not match your Swift property names.

## State management in 2026

MVVM is not dead, but it is no longer the default mental model. The trend is toward a state-first mentality: think about the data first, the views second, and compose small self-contained state and logic modules instead of pushing everything through ViewModels.

In practice, the codebase tells you which era you are in.

- iOS 17+ targets lean on `@Observable`, which folds the old `ObservableObject` machinery into a macro and lets views observe model objects through `@State` and `@Environment`.
- iOS 15 and 16 targets are still on `ObservableObject` with `@Published`, observed through `@StateObject`, `@ObservedObject`, and `@EnvironmentObject`.
- MVVM with a clean ViewModel, real networking through a service layer, and dumb views remains the dominant shape of real-world code, and is what most interviewers and most teammates will expect to see.

A modern MVVM ViewModel in 2026 is an `@Observable` class with explicit state, a service injected through a protocol, and no Combine pipelines unless there is a real reason for them. The view binds naturally and stays quiet.

## The pre-iOS 17 property wrappers, refreshed

If you have been living in `@Observable` and `@State`, the older wrappers are not different in spirit, just in plumbing. Three to remember.

### `@StateObject`

This is the *owning* wrapper. The view creates the model and holds it for the view's lifetime. In the `@Observable` world this is exactly what `@State var vm = MyViewModel()` does.

```swift
struct EventListView: View {
    @StateObject private var vm = EventListViewModel()
    // vm is created here, lives as long as this view does
}
```

### `@ObservedObject`

This is the *receiving* wrapper. The view does not own the object, it just observes one that was created upstream and passed in.

```swift
struct EventDetailView: View {
    @ObservedObject var vm: EventDetailViewModel
    // vm is passed in, owned by parent
}
```

The classic trap is reaching for `@ObservedObject` where you meant `@StateObject`. If the parent re-renders, the object you thought you were holding gets recreated, and your state quietly disappears.

### `@EnvironmentObject`

This is the environment-injected wrapper. A parent injects the object once with `.environmentObject(...)`, and any descendant can pull it out by type without it being passed through every level of the view tree. Forget the injection and you get a runtime crash, not a compile error.

```swift
// Root
ContentView()
    .environmentObject(AppState())

// Any descendant, no explicit passing needed
struct SomeDeepView: View {
    @EnvironmentObject var appState: AppState
}
```

The mapping from old to new is clean enough to hold in your head.

| Old (`ObservableObject`) | New (`@Observable`) |
|---|---|
| `@StateObject var vm = VM()` | `@State var vm = VM()` |
| `@ObservedObject var vm: VM` | plain `var vm: VM` (passed in) |
| `@EnvironmentObject var x: X` | `@Environment(X.self) var x` |

## Async/await is the default

For async work, async/await is now the answer. Combine still exists, and you will read it in older codebases, but I do not reach for it first.

The two view-level entry points carry different meanings. The `.task` modifier is for data loading tied to a view's lifecycle: it runs when the view appears and cancels when the view goes away.

```swift
.task {
    await vm.loadEvents()
}
```

A plain `Task { }` is for async work kicked off by a user action, like a button tap. It is not tied to the view's lifetime, which is the point.

```swift
Button("Refresh") {
    Task {
        await vm.reload()
    }
}
```

`@MainActor` is how you stop worrying about which thread your UI updates land on. Mark the ViewModel and you are done. No manual `DispatchQueue.main.async` calls, no surprises.

```swift
@MainActor
class EventViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var isLoading = false

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            events = try await service.fetchEvents()
        } catch {
            // handle
        }
    }
}
```

The standard signature for anything async that can fail is `async throws`. Networking is the obvious case.

```swift
func fetchEvents() async throws -> [Event] {
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode([Event].self, from: data)
}
```

You will still see Combine in older codebases, usually for `@Published` pipelines, debounced search, or combining multiple publishers. You do not need to be able to write it from scratch, but you do need to recognise it.

```swift
$searchText
    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
    .sink { [weak self] query in self?.search(query) }
    .store(in: &cancellables)
```

The modern equivalent is `.task(id: searchText)` with a `try await Task.sleep` debounce, with the caveat that `try?` on `Task.sleep` swallows cancellation, which defeats the entire point of using `.task`.

## Common SwiftUI patterns

These are the everyday shapes that come up across almost every screen.

### Networking

A `@MainActor` ViewModel with explicit loading, error, and data state, paired with a `.task` modifier on the view, is the boring correct answer.

```swift
@MainActor
class EventsViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var isLoading = false
    @Published var error: Error?

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            events = try await APIService.shared.fetchEvents()
        } catch {
            self.error = error
        }
    }
}
```

### Navigation with `NavigationStack`

`NavigationStack` replaces `NavigationView` and supports both declarative and programmatic navigation. The declarative form pairs `NavigationLink(value:)` with `.navigationDestination(for:)`.

```swift
NavigationStack {
    List(events) { event in
        NavigationLink(event.title, value: event)
    }
    .navigationDestination(for: Event.self) { event in
        EventDetailView(event: event)
    }
    .navigationTitle("Events")
}
```

For programmatic navigation, hold a `NavigationPath` and push or pop from anywhere that can see the binding.

```swift
@State var path = NavigationPath()

NavigationStack(path: $path) {
    // ...
    Button("Open") { path.append(someEvent) }
}
```

### Error handling in views

Three shapes worth keeping around, picked by context.

```swift
// 1. Inline conditional (simplest)
if let error = vm.error {
    Text(error.localizedDescription).foregroundStyle(.red)
}

// 2. Alert
.alert("Error", isPresented: $vm.showError) {
    Button("OK", role: .cancel) {}
} message: {
    Text(vm.errorMessage)
}

// 3. Custom error enum for user-facing messages
enum AppError: LocalizedError {
    case networkFailure, notFound, unauthorized
    var errorDescription: String? {
        switch self {
        case .networkFailure: return "Network error. Please try again."
        case .notFound: return "Item not found."
        case .unauthorized: return "Session expired."
        }
    }
}
```

The anti-pattern is showing alerts directly in views with the error-to-message mapping duplicated each time. Centralise that mapping in the ViewModel and the views stay quiet.

### A cleaner loading state

The `isLoading` plus optional `error` plus optional `data` shape works, but it represents impossible states. A single enum is exhaustive and forces the view to handle each case.

```swift
enum ViewState<T> {
    case idle, loading, success(T), failure(Error)
}

@Published var state: ViewState<[Event]> = .idle
```

This is the kind of thing that makes a code review or interview conversation easy. It shows you think about state shape before you start scattering booleans.

That is the working set. Not exhaustive, but enough to walk into a SwiftUI codebase and read it without flinching.
