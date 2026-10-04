---
title: "理解 Swift 中的 @Observable 与 @State"
date: 2026-03-20
tags:
  - swift
  - ios
  - swiftui
  - observation
  - swift-series
excerpt: |
  Swift 的 Observation 框架重新设计了模型对象向 SwiftUI 传达变化的方式。这是我的 Swift 系列第一篇，以一个具体的拖动协调类为例，介绍 @Observable 和 @State。
---

> 这是我的 Swift 编程系列第一篇。后续文章会更深入地讨论 SwiftUI 架构、数据流，以及我在开发真实 iOS 应用时学到的模式。

Swift 的 `Observation` 框架在 iOS 17 / Swift 5.9 中引入，重新设计了模型对象向 SwiftUI 传达变化的方式。配合 `@State`，它能提供一套简洁、精确的响应式系统，样板代码远少于旧的 `ObservableObject` 方案。本文通过一个具体的拖动协调类，介绍这两者。

[[toc]]

## 示例

下面的 `HabitDragCoordinator` 来自 [ProjectDawn](https://github.com/NicholasClooney/ProjectDawn)，这是我正在开发的一款习惯记录 iOS 应用。如果你想了解更完整的架构，比如如何通过 `@Environment` 在独立模块之间协调拖动状态，我在[这篇文章](/zh/posts/building-projectdawn-with-claude-and-codex/)中深入介绍过这个项目。

{% github "https://github.com/NicholasClooney/ProjectDawn/blob/5016e4bc1580540f52b141c57f9ef807a96d7833/Modules/Interaction/Sources/HabitDragCoordinator.swift" %}

这个协调器跟踪拖动手势：正在拖动哪个习惯、它在屏幕上的位置，以及是否有待处理的放下操作。

---

## `@Observable` 做什么

`@Observable` 是一个 Swift 宏。它会合成观察所需的全部基础设施，把普通类变成响应式模型；以前这些都需要手写 `ObservableObject` + `@Published` 样板代码。

### 宏会展开成什么

对每个存储属性，也就是 `draggedHabit`、`dragLocation`、`pendingDrop`，宏都会把它改写为计算访问器，背后使用私有存储，并通过 `ObservationRegistrar` 处理访问：

<img alt="示意图：@Observable 宏如何把存储属性展开为由 ObservationRegistrar 支持的受跟踪访问器" src="/assets/images/posts/swift-observable/observable_macro_expansion.svg" />


```swift
// Synthesised by the macro; you never write this yourself

var _draggedHabit: Habit?
var _dragLocation: CGPoint
var _pendingDrop: Bool

var _$observationRegistrar = ObservationRegistrar()

var draggedHabit: Habit? {
    get {
        _$observationRegistrar.access(self, keyPath: \.draggedHabit)
        return _draggedHabit
    }
    set {
        _$observationRegistrar.withMutation(of: self, keyPath: \.draggedHabit) {
            _draggedHabit = newValue
        }
    }
}
// ... same pattern for dragLocation and pendingDrop
```

执行 `get` 时，注册器会记录调用方关心这个键路径。执行 `set` 时，它会通知所有已注册的观察者：值发生了变化。这个类还会自动遵循 `Observable` 协议。

### 存储属性与计算属性

存储属性 `draggedHabit`、`dragLocation`、`pendingDrop` 会获得合成的跟踪访问器。计算属性 `isActive` 没有需要支撑的存储，因此不会合成访问器。

不过，`isActive` 的值来自 `draggedHabit`。任何读取 `isActive` 的 SwiftUI 视图，都会在过程中调用 `draggedHabit` 的受跟踪 getter，从而间接订阅 `draggedHabit`。订阅是在运行时通过访问模式建立的，不是编译器静态确定的。

### 为什么比 `ObservableObject` 更好

旧方案要求为每个可变属性加上 `@Published`，任何变化都会触发同一个 `objectWillChange` 发布者：

```swift
// Old approach
class HabitDragCoordinator: ObservableObject {
    @Published var draggedHabit: Habit?
    @Published var dragLocation: CGPoint = .zero
    @Published var pendingDrop = false
    // isActive changes don't notify SwiftUI — a separate @Published was needed
}
```

使用 `@Observable` 后，订阅以属性为粒度。一个只读取 `dragLocation` 的视图，不会因为 `pendingDrop` 变化而重新渲染。对于只关心模型部分状态的视图，这是很有意义的性能改善。

---

## `@State` 做什么

`@Observable` 负责跟踪*什么变了*。`@State` 负责*维持模型的生命周期*，并把它的变化接入 SwiftUI 的渲染周期。

### `@State` 解决的问题

SwiftUI 视图是结构体，会不断被创建、求值和丢弃。视图结构体上的普通属性只是局部值，每次重新渲染都会消失：

```swift
struct DragView: View {
    // Without @State: recreated fresh on every render, useless
    private var coordinator = HabitDragCoordinator()
    ...
}
```

`@State` 告诉 SwiftUI，为这个值分配稳定的堆存储，并在该视图处于层级中的整个生命周期里保留它。视图结构体本身用完即弃，`@State` 的存储则不是。

### `@State` 与 `@Observable` 如何配合

```swift
struct DragView: View {
    @State private var coordinator = HabitDragCoordinator()

    var body: some View {
        if coordinator.isActive {
            Circle()
                .position(coordinator.dragLocation)
        }
    }
}
```

`@State` 负责分配并持有 `HabitDragCoordinator` 实例。`body` 运行时，`@Observable` 的 getter 会把这个视图注册为被访问属性的观察者。这里包括 `isActive`，实际通过 `draggedHabit`，以及 `dragLocation`。之后这些属性中的任何一个发生变化，SwiftUI 都会重新计算 `body`，更新界面。

两者不会替对方工作。只有 `@State`、没有 `@Observable`，会得到稳定实例，却没有细粒度的变化跟踪。只有 `@Observable`、没有 `@State`，虽能跟踪变化，但每次渲染都会重新创建实例。

### 什么时候用 `@State`

当视图*创建并拥有*实例时，使用 `@State`：

```swift
@State private var coordinator = HabitDragCoordinator()
```

如果实例在上游创建，再向下传递，就不使用 `@State`。普通的 `let` 属性即可，因为 `@Observable` 的跟踪发生在对象本身，而不是引用上：

```swift
struct DragOverlay: View {
    var coordinator: HabitDragCoordinator  // plain let — still reactive

    var body: some View {
        Circle().position(coordinator.dragLocation)
    }
}
```

要跨视图层级做依赖注入，可以使用 `.environment()` 和 `@Environment`：

```swift
// In a parent view
.environment(coordinator)

// In a descendant
@Environment(HabitDragCoordinator.self) private var coordinator
```

它们替代了旧的 `environmentObject` / `@EnvironmentObject` 组合。

经验法则是：如果你写了 `= HabitDragCoordinator()`，就用 `@State`。如果是别人传给你的，就不用。

---

## 总结

| | `@Observable` | `@State` |
|---|---|---|
| 作用 | 合成按属性进行的变化跟踪 | 在 SwiftUI 中分配稳定存储 |
| 位置 | 模型类上 | 视图属性上 |
| 替代方案 | `ObservableObject` + `@Published` | `@StateObject`，针对引用类型 |
| 粒度 | 按属性订阅 | 不适用，负责生命周期 |

两者共同构成清晰的所有权模型：`@State` 表示“这个视图拥有这个对象”，`@Observable` 表示“准确告诉 SwiftUI，这个视图依赖哪些属性”。
