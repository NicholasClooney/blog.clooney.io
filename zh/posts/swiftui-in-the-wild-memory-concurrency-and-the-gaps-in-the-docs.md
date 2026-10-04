---
title: "实战中的 SwiftUI：内存、并发与文档中的空白"
date: 2026-04-22
tags:
  - swift
  - ios
  - swiftui
  - concurrency
  - observation
  - swift-series
excerpt: |
  一组在实战中摸索出的 SwiftUI 模式，涉及内存、异步工作和 Observation 的边界情况，包括视图模型生命周期 bug、防抖、异步按钮操作、任务所有权、循环引用，以及 @Observable 与 actor 之间的冲突。
---

这是一些用 Swift 现代并发模型开发真实 SwiftUI 应用时，费了功夫才摸索出的模式，以及几处雷区。内容包括视图模型生命周期 bug、防抖、异步按钮模式、任务所有权、循环引用，以及 `@Observable` 与 actor 之间的冲突。有些写在文档里；有些只有在某个对象迟迟不执行 deinit、你又找不到原因时，才会发现。

[[toc]]

## 1. `@State` + `@Observable` 生命周期：SwiftUI 什么时候释放视图模型？

先从这里开始。这是 iOS 17 之后 SwiftUI 模型中最出人意料的陷阱之一，而且会影响所有涉及清理和任务取消的模式。

简短回答是：Apple 官方文档没有精确保证 `@State` 何时释放引用类型对象。下面这些 bug 的历史很复杂，有些修了，有些没有，而 iOS 26 又已经引入了新的回归问题。

### Apple 官方怎么说

[迁移指南](https://developer.apple.com/documentation/SwiftUI/Migrating-from-the-observable-object-protocol-to-the-observable-macro)和 [WWDC23“Discover Observation in SwiftUI”](https://developer.apple.com/videos/play/wwdc2023/10149/)都说：如果视图拥有模型，就使用 `@State`。文档将 `@State` 描述为把对象生命周期绑定到视图身份，与 `@StateObject` 之于 `ObservableObject` 的作用相似。但文档没有明确说明，相对于视图离开层级的时间，究竟何时才会释放内存。

### 实际发生了什么

#### Sheet 和模态呈现：iOS 17.1 之后修复，但仍有注意事项

报告最多的 bug 是：sheet/`fullScreenCover` 中的 `@State` 视图模型，在界面关闭后始终没有释放，`deinit` 从未调用。这被确认是 iOS 17.0 的回归，同样的模式在 iOS 16 上可以正常工作。（[Apple 论坛](https://developer.apple.com/forums/thread/736110)、[Apple 论坛](https://forums.developer.apple.com/forums/thread/736239)）

修复历史相当曲折。它在 iOS 17.2 beta 1 中得到处理，随后又回归，再次被修复。主要第三方规避包 [SwiftUIMemoryLeakWorkaround](https://github.com/jbafford/SwiftUIMemoryLeakWorkaround) 的作者确认，底层 bug 在 iOS 17.1 之后的某个时间得到解决，并将该包标为不再需要。目前没有经过确认的开发者报告表明，这个特定的 sheet 泄漏在 iOS 18 上仍能复现。

**不过：**Apple 从未为 `@State` + `@Observable` 写下内存释放时机的约定。即使操作系统已经打补丁，“不泄漏”也不等于“`deinit` 会及时、可靠地执行”。

#### `NavigationStack` 目标页面：尚未解决

压入 `NavigationStack` 的视图，在弹出时不会完全销毁状态。每次压入都会重新初始化 `@State` 持有的视图模型，却没有上一个实例对应的 `deinit`。（[Apple 论坛](https://developer.apple.com/forums/thread/716804)）

这与 sheet 泄漏是不同的问题，有独立的跟踪记录。iOS 17 或 iOS 18 的任何发布说明中，都没有确认修复。通过 `.id()` 强制 SwiftUI 将视图视为新身份，确实能触发正确释放，但这只是规避办法，不是修复。

#### 一般的 `@Observable` 类

除了 sheet 和导航之外，在其他多种场景中，视图通过 `@State` 持有的类也不会按预期析构。（[Swift 论坛](https://forums.swift.org/t/an-observable-class-held-by-a-swiftui-view-is-not-deinitialized/79505)）

#### iOS 26：新的回归

iOS 26.1 beta 出现了一类新 bug：更新 `@State` 字段的值不再触发视图重新渲染，尽管内部状态确实更新了。它已被确认是相对于 iOS 26.0 的回归，与前面的内存释放 bug 无关，却说明 `@State` + `@Observable` 的行为仍会随着系统版本变化而出现新的不稳定。（[Apple Developer Forums：Observation 标签](https://developer.apple.com/forums/tags/observation)）

### 实践中意味着什么

在 sheet 或 `NavigationStack` 目标页面中使用 `@State` + `@Observable` 时，不能依赖 `deinit` 做清理。即使明显的内存泄漏已修复，Apple 也不保证何时释放。如果视图模型启动了定时器、打开了流，或开始了异步任务，把取消操作放在 `deinit` 里并不可靠。

因此，基于 `onDisappear` 的清理不只是一个好模式，而是必要的：

```swift
.onDisappear {
    viewModel.cancelAllWork()
}
```

根据当前 SwiftUI 的行为，这是正确做法，不应把它看作 bug 修好后就可以删除的临时方案。

### 来源

- [从 ObservableObject 迁移到 Observable 宏：Apple 文档](https://developer.apple.com/documentation/SwiftUI/Migrating-from-the-observable-object-protocol-to-the-observable-macro)
- [Discover Observation in SwiftUI：WWDC23](https://developer.apple.com/videos/play/wwdc2023/10149/)
- [@Observable/@State 内存泄漏：Apple 论坛](https://developer.apple.com/forums/thread/736110)
- [iOS 17 中 @State ViewModel 内存泄漏：Apple 论坛](https://forums.developer.apple.com/forums/thread/736239)
- [NavigationStack 内存泄漏：Apple 论坛](https://developer.apple.com/forums/thread/716804)
- [Observable 类没有析构：Swift 论坛](https://forums.swift.org/t/an-observable-class-held-by-a-swiftui-view-is-not-deinitialized/79505)
- [SwiftUI ViewModel 不执行 deinit：Swift 论坛](https://forums.swift.org/t/swiftui-viewmodel-not-being-deinit-and-causing-memory-leak/71199)
- [iOS 17 中 SwiftUI 视图泄漏：Apple 论坛](https://developer.apple.com/forums/thread/737967)
- [SwiftUIMemoryLeakWorkaround：John Bafford，确认 sheet 问题在 17.1 之后修复](https://bafford.com/2023/10/12/swiftui-memory-leak-workaround/)
- [iOS 26.1 @State 重新渲染回归：Apple Developer Forums](https://developer.apple.com/forums/tags/observation)

## 2. 用 `async/await` 防抖

防抖是常见需求。你想等用户停止输入、点击或其他快速触发事件的行为后，再执行工作。掌握结构后，用 `async/await` 实现很简洁。

典型模式：

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

步骤如下：

1. 取消上一个任务。
2. 启动新任务。
3. 休眠一个防抖间隔。
4. 把 `CancellationError` 视为预期控制流，立即返回。
5. 只有休眠未被打断、完整结束后，才执行真正的工作。

必须避免的关键错误，是使用 `try? await Task.sleep(...)`。它会悄悄吞掉取消错误，让本应被取消的防抖工作继续执行，恰好与目标相反。

关于 actor 上下文：如果 `performCount` 会操作 UI 或视图模型状态，就应该由 `@MainActor` 隔离。如果视图模型已经像上面一样标注了 `@MainActor`，通常不需要额外调用 `MainActor.run`，只要确保 `performCount` 被正确隔离即可。

### 用 `.task(id:)` 避免手动管理任务

上面的模式能用，但任务生命周期要自己管理：保存任务、取消任务、重新创建。SwiftUI 的 `.task(id:)` 修饰器能自动处理这些。

`id` 值变化时，SwiftUI 取消上一个任务，启动新任务；视图消失时也会取消。这意味着异步函数可以去掉所有这些样板代码：

```swift
func debouncedCountAsync(text: String) async throws {
    try await Task.sleep(for: .milliseconds(300))
    self.performCount(text: text)
}
```

不用保存任务引用，不用手动取消，也不用处理 `[weak self]`。`Task.sleep` 抛出的 `CancellationError` 会自然向上传播，`.task` 预期会遇到这种情况，并静默处理。

在视图里接上：

```swift
.task(id: text) {
    try? await viewModel.debouncedCountAsync(text: text)
}
```

这里的 `try?` 是有意且正确的。手动模式中，吞掉取消错误是 bug；而这里，取消已经由外层 `.task` 管理。你只是在调用处忽略错误，休眠本身仍会抛出错误，并在取消时正常退出。

不带 `id` 的 `.task` 在视图出现时运行一次。`.task(id:)` 则在出现时*以及*每次 `id` 变化时运行，正好符合搜索框或其他频繁更新值的防抖需求。

代价是：防抖逻辑会与视图层绑定。如果需要在没有 SwiftUI 视图参与的视图模型或服务里防抖，手动 `Task` 方案仍然有用。

## 3. 按钮操作中的异步工作

SwiftUI 的 `Button` 原生不接受 `async` 操作闭包，因此可以根据需要的控制程度，选择几种模式。

### 方案 1：在操作中使用 `Task {}`

简单，但不会自动取消。

```swift
Button("Fetch") {
    Task {
        await fetchData()
    }
}
```

`Task` 继承视图的 actor 上下文，通常是主 actor，因此更新 UI 是安全的。缺点是用户再次点击时，会启动第二个任务，与第一个并行运行。

### 方案 2：`@State Task`

手动控制，最灵活。

```swift
@State private var currentTask: Task<Void, Never>?

Button("Fetch") {
    currentTask?.cancel()
    currentTask = Task {
        await fetchData()
    }
}
```

生命周期由你自己管理，样板代码更多，但控制也更多。你可以在再次点击时或 `.onDisappear` 中取消，检查任务状态，并把取消句柄放在最合适的位置。

| 模式 | 再次点击时自动取消 | 生命周期管理者 |
| --- | --- | --- |
| 操作中的 `Task {}` | 否 | 手动 |
| `@State Task` | 是，手动实现 | 手动 |

## 4. 在 SwiftUI 视图中保存 `Task`

需要在视图内保存可取消的任务句柄时，`@State` 是合适的存储方式：

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

为什么是 `@State`？`Task` 是值类型，但封装了对底层异步工作的引用。把它放在 `@State` 中，可以跨多次渲染保持稳定的堆存储，让你始终持有同一个任务句柄的引用，而不是下次计算 `body` 时就被丢弃的副本。

这个模式还有几个特点：

- 你有一个取消句柄，可以随时调用 `.cancel()`。
- 任务句柄的生命周期与视图绑定。
- 给该属性赋值不会触发视图重新渲染，因为 `Task` 没有遵循任何可观察协议。

什么时候应该把任务放到视图模型里？如果从概念上讲，异步工作属于模型，而不是某次具体 UI 交互，把任务存在模型中会让视图更轻，也更容易测试逻辑。

## 5. 闭包、捕获与循环引用

一个常见困惑是：闭包捕获 `self`，什么时候会造成引用循环？

关键在于，形成循环并不需要两个不同的对象，只需要引用图里有环。当一个类持有捕获了 `self` 的闭包：

```text
self -> closure -> self
```

这就是循环。`self` 通过存储属性强引用闭包，闭包又通过捕获强引用 `self`。ARC 找不到引用数为零的时机，无法释放任何一方。

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

用 `[weak self]` 修复：

```swift
action = { [weak self] in
    self?.doSomething()
}
```

有一种情况不会形成循环：闭包没有被存储。传给 `UIView.animate` 的闭包，即使强捕获 `self`，也不会造成引用循环，因为动画系统会在执行后释放闭包，所以这个引用只是暂时的。

经验法则：如果闭包作为属性保存，而且捕获了 `self`，就使用 `[weak self]`。

## 6. `@Observable` 与 actor：两者的冲突

`@Observable` 与 `actor` 在语法上可以共存，但设计上存在冲突。

```swift
@Observable
actor CounterActor {
    var count = 0
    func increment() { count += 1 }
}
```

问题在于，`@Observable` 会合成 `_$observationRegistrar.access(...)` 等观察注册器钩子和修改跟踪逻辑，需要与主 actor 驱动的 UI 观察协调；而 `actor` 的属性必须在该 actor 的执行器上访问。这种不匹配会导致编译器警告：非 Sendable 类型跨越了 actor 边界。

### 实用解决办法

#### 1. 改用 `@MainActor`

UI 最常见的做法。

```swift
@Observable
@MainActor
class CounterModel {
    var count = 0
    func increment() { count += 1 }
}
```

这样既能观察变化，又有主线程安全保证，几乎总是 SwiftUI 状态所需要的组合。

#### 2. 将 actor 与可观察模型分离

通常是最清晰的架构。

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

actor 负责后台工作的并发与隔离，`@Observable @MainActor` 类负责 UI 观察，各司其职。

可以这样理解：确实需要后台隔离或共享状态串行访问的工作，用 `actor`；驱动 SwiftUI 视图的内容，用 `@Observable @MainActor class`；两者之间通过 `await` 连接。

以后还会有更多模式。给机器喂点料。🤖🤤
